import { createClient } from '@supabase/supabase-js'
import {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
} from './whatsapp'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_MESSAGES = 20

// Fixed-window counter, one row per phone number. Not perfectly race-safe
// under concurrent retries for the same sender (a rare double-increment is
// harmless here) — this only needs to catch a runaway loop or abuse, not
// bill anything precisely.
async function isRateLimited(
  supabase: ReturnType<typeof getSupabase>,
  phoneNumber: string
): Promise<boolean> {
  const { data: row } = await supabase
    .from('webhook_rate_limits')
    .select('window_start, message_count')
    .eq('phone_number', phoneNumber)
    .single()

  const windowExpired = !row || Date.now() - new Date(row.window_start).getTime() > RATE_LIMIT_WINDOW_MS

  if (windowExpired) {
    await supabase
      .from('webhook_rate_limits')
      .upsert({ phone_number: phoneNumber, window_start: new Date().toISOString(), message_count: 1 })
    return false
  }

  if (row.message_count >= RATE_LIMIT_MAX_MESSAGES) {
    return true
  }

  await supabase
    .from('webhook_rate_limits')
    .update({ message_count: row.message_count + 1 })
    .eq('phone_number', phoneNumber)

  return false
}

export async function handleIncomingMessage(
  phoneNumber: string,
  messageText: string | null,
  surveyId?: string
) {
  if (!messageText) return
  const supabase = getSupabase()

  if (await isRateLimited(supabase, phoneNumber)) {
    console.warn(`Rate limit exceeded for ${phoneNumber} — dropping message`)
    return
  }

  // Check for active session
  const { data: session } = await supabase
    .from('sessions')
    .select('*, surveys(*, questions(*, options(*)))')
    .eq('phone_number', phoneNumber)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (!session) {
    // No active session — greet or ignore
    if (surveyId) {
      await startSurvey(phoneNumber, surveyId)
    } else {
      await sendTextMessage(
        phoneNumber,
        '👋 Welcome to Unify Survey Bot!\n\nPlease use a valid survey link to get started.'
      )
    }
    return
  }

  const survey = session.surveys
  const questions = survey.questions.sort(
    (a: any, b: any) => a.order - b.order
  )
  const currentIndex = session.current_question_index

  // Get or create response record
  let { data: response } = await supabase
    .from('responses')
    .select('id')
    .eq('session_id', session.id)
    .single()

  if (!response) {
    const { data: newResponse } = await supabase
      .from('responses')
      .insert({
        session_id: session.id,
        survey_id: session.survey_id,
        phone_number: phoneNumber,
        completed: false,
      })
      .select('id')
      .single()
    response = newResponse
  }

  // Save the answer for the current question (if not first message)
  if (currentIndex > 0 && response) {
    const answeredQuestion = questions[currentIndex - 1]
    if (answeredQuestion) {
      const option = answeredQuestion.options?.find(
        (o: any) => o.id === messageText || o.value === messageText
      )
      await supabase.from('answers').insert({
        response_id: response.id,
        question_id: answeredQuestion.id,
        option_id: option?.id ?? null,
        text_answer: option ? null : messageText,
      })
    }
  }

  // Send the next question or complete
  if (currentIndex >= questions.length) {
    // Survey complete
    await supabase
      .from('sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', session.id)

    await supabase
      .from('responses')
      .update({ completed: true })
      .eq('id', response?.id)

    await sendTextMessage(
      phoneNumber,
      `✅ *Survey Complete!*\n\nThank you for completing *${survey.title}*.\n\nYour responses have been recorded. We appreciate your feedback! 🙏`
    )
    return
  }

  // Send next question
  const nextQuestion = questions[currentIndex]
  await supabase
    .from('sessions')
    .update({ current_question_index: currentIndex + 1 })
    .eq('id', session.id)

  await sendQuestion(phoneNumber, nextQuestion, currentIndex + 1, questions.length)
}

async function startSurvey(phoneNumber: string, surveyId: string) {
  const supabase = getSupabase()
  const { data: survey } = await supabase
    .from('surveys')
    .select('*, questions(*, options(*))')
    .eq('id', surveyId)
    .eq('status', 'active')
    .single()

  if (!survey) {
    await sendTextMessage(phoneNumber, '❌ Survey not found or no longer active.')
    return
  }

  // Create session
  const { data: session } = await supabase
    .from('sessions')
    .insert({
      phone_number: phoneNumber,
      survey_id: surveyId,
      current_question_index: 1,
    })
    .select('id')
    .single()

  // Create response
  await supabase.from('responses').insert({
    session_id: session?.id,
    survey_id: surveyId,
    phone_number: phoneNumber,
    completed: false,
  })

  // Send welcome + first question
  await sendTextMessage(
    phoneNumber,
    `👋 *${survey.title}*\n\n${survey.description ?? ''}\n\nThis survey has *${survey.questions.length} questions* and takes about 2 minutes.\n\nLet's begin! 🚀`
  )

  const questions = survey.questions.sort((a: any, b: any) => a.order - b.order)
  await sendQuestion(phoneNumber, questions[0], 1, questions.length)
}

async function sendQuestion(
  to: string,
  question: any,
  questionNumber: number,
  total: number
) {
  const header = `*Q${questionNumber}/${total}* — ${question.text}`

  if (question.type === 'text') {
    await sendTextMessage(to, `${header}\n\n_Type your answer below:_`)
    return
  }

  if (question.type === 'yes_no') {
    await sendButtonMessage(to, header, [
      { id: 'yes', title: '✅ Yes' },
      { id: 'no', title: '❌ No' },
    ])
    return
  }

  if (question.type === 'rating') {
    await sendListMessage(to, header, 'Select rating', [
      {
        title: 'Your Rating',
        rows: [1, 2, 3, 4, 5].map((n) => ({
          id: String(n),
          title: `${'⭐'.repeat(n)} — ${n}/5`,
        })),
      },
    ])
    return
  }

  // Multiple choice
  const options = question.options ?? []
  if (options.length <= 3) {
    await sendButtonMessage(
      to,
      header,
      options.map((o: any) => ({ id: o.id, title: o.label }))
    )
  } else {
    await sendListMessage(to, header, 'Choose an answer', [
      {
        title: 'Options',
        rows: options.map((o: any) => ({ id: o.id, title: o.label })),
      },
    ])
  }
}
