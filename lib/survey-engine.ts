import { createClient } from '@supabase/supabase-js'
import {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
  type InboundKind,
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

// ─── Commands ──────────────────────────────────────────────────────────
// Exact full-message match, case-insensitive. Deliberately a frozen set:
// widening it (e.g. a YES-confirm flow) needs a new decision, because every
// new command word can never be collected as an answer again.

function isCommand(text: string, word: 'stop' | 'restart'): boolean {
  return text.trim().toLowerCase() === word
}

// ─── Answer validation ─────────────────────────────────────────────────
// Invalid input must NEVER advance the pointer or be saved — it re-asks the
// same question. Validators return 'valid' | 'invalid' only; a third
// 'skipped' state is reserved for the future required/SKIP work — add the
// branch here and in the handler when that ships, the shape already fits.

type Validation =
  | { status: 'valid'; optionId: string | null; text: string | null }
  | { status: 'invalid'; hint: string }

function sortedOptions(question: any): any[] {
  return ((question.options ?? []) as any[])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
    )
}

// Frozen yes/no vocabulary: button taps arrive as exact 'yes'/'no' ids;
// typed replies accept yes/no/y/n, trimmed + case-insensitive. Do NOT extend
// with slang (yeah/yup/nah…) without a new decision — see council notes.
const YES_NO_MAP: Record<string, 'yes' | 'no'> = {
  yes: 'yes',
  y: 'yes',
  no: 'no',
  n: 'no',
}

export function validateAnswer(question: any, raw: string): Validation {
  const text = raw.trim()

  if (question.type === 'text') {
    return { status: 'valid', optionId: null, text }
  }

  if (question.type === 'yes_no') {
    const normalized = YES_NO_MAP[text.toLowerCase()]
    if (normalized) return { status: 'valid', optionId: null, text: normalized }
    return {
      status: 'invalid',
      hint: 'Please tap Yes or No, or reply "yes" or "no".',
    }
  }

  if (question.type === 'rating') {
    if (/^[1-5]$/.test(text)) return { status: 'valid', optionId: null, text }
    return {
      status: 'invalid',
      hint: 'Please reply with a number from 1 to 5.',
    }
  }

  // Multiple choice: exact option id, exact stored value, or 1-based number
  // (numbers are the only input for >10-option numbered lists, and a
  // convenience for button/list questions — the set is closed either way).
  const options = sortedOptions(question)
  const byId = options.find((o) => o.id === text)
  if (byId) return { status: 'valid', optionId: byId.id, text: null }
  // Label match is case-insensitive like yes/no: a respondent typing "blue"
  // for "Blue" means it. Exact match first so distinct labels win.
  const byValue =
    options.find((o) => o.value === text) ??
    options.find(
      (o) => typeof o.value === 'string' && o.value.toLowerCase() === text.toLowerCase()
    )
  if (byValue) return { status: 'valid', optionId: byValue.id, text: null }
  if (/^\d+$/.test(text)) {
    const n = parseInt(text, 10)
    if (n >= 1 && n <= options.length) {
      return { status: 'valid', optionId: options[n - 1].id, text: null }
    }
  }
  return {
    status: 'invalid',
    hint:
      options.length > 10
        ? `Please reply with a number from 1 to ${options.length}.`
        : 'Please pick one of the options above.',
  }
}

function sortedQuestions(survey: any): any[] {
  return ((survey.questions ?? []) as any[])
    .slice()
    .sort((a: any, b: any) => a.order - b.order)
}

async function abandonSession(
  supabase: ReturnType<typeof getSupabase>,
  sessionId: string
) {
  // completed_at set, response row stays completed=false → the dashboard
  // reads this as Abandoned. Answers already saved are kept.
  await supabase
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)
}

async function sendOptedOutNotice(phoneNumber: string) {
  await sendTextMessage(
    phoneNumber,
    "You've opted out of these surveys, so I'm staying quiet.\n\nReply RESTART anytime to begin again."
  )
}

async function restartSurvey(phoneNumber: string, oldSession: any) {
  const supabase = getSupabase()
  await abandonSession(supabase, oldSession.id)

  const { data: survey } = await supabase
    .from('surveys')
    .select('*, questions(*, options(*))')
    .eq('id', oldSession.survey_id)
    .eq('status', 'active')
    .single()

  if (!survey) {
    await sendTextMessage(phoneNumber, "That survey is now closed, so I can't restart it.")
    return
  }

  const { data: session } = await supabase
    .from('sessions')
    .insert({
      phone_number: phoneNumber,
      survey_id: oldSession.survey_id,
      current_question_index: 1,
    })
    .select('id')
    .single()

  await supabase.from('responses').insert({
    session_id: session?.id,
    survey_id: oldSession.survey_id,
    phone_number: phoneNumber,
    completed: false,
  })

  const questions = sortedQuestions(survey)
  await sendTextMessage(phoneNumber, 'Starting over from question 1.')
  await sendQuestion(phoneNumber, questions[0], 1, questions.length)
}

export async function handleIncomingMessage(
  phoneNumber: string,
  messageText: string | null,
  surveyId?: string,
  messageId?: string | null,
  kind: InboundKind = 'text'
) {
  const supabase = getSupabase()

  try {
    if (messageId) {
      const { error: dedupeError } = await supabase
        .from('processed_messages')
        .insert({ id: messageId })

      // Postgres unique_violation — Meta already delivered this message once
      // (its Cloud API retries on a slow or non-2xx response). Reprocessing it
      // would double-insert the answer and double-advance current_question_index.
      if (dedupeError?.code === '23505') return
    }

    if (await isRateLimited(supabase, phoneNumber)) {
      console.warn(`Rate limit exceeded for ${phoneNumber} — dropping message`)
      return
    }

    // Latest non-completed session, if any. Completed sessions are history —
    // only one live session per number is maintained from here on (a new
    // START_ abandons the previous one instead of orphaning it).
    const { data: session } = await supabase
      .from('sessions')
      .select('*, surveys(*, questions(*, options(*)))')
      .eq('phone_number', phoneNumber)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    const activeSession =
      session && !session.opted_out_at ? session : null
    const optedOutSession =
      session && session.opted_out_at ? session : null

    // Media (photo/voice/sticker/…) carries no answer. Prompt for text rather
    // than silently ignoring it; delivery receipts never reach us as 'media'.
    if (kind === 'media' || !messageText) {
      if (activeSession || optedOutSession) {
        if (optedOutSession) {
          await sendOptedOutNotice(phoneNumber)
        } else {
          await sendTextMessage(
            phoneNumber,
            "I can't read photos, voice notes or stickers yet — please reply with text."
          )
        }
      } else if (surveyId) {
        await startSurvey(phoneNumber, surveyId)
      } else {
        await sendTextMessage(
          phoneNumber,
          'Welcome to Unify Survey Bot!\n\nPlease use a valid survey link to get started.'
        )
      }
      return
    }

    const text = messageText.trim()

    // An opted-out number stays quiet until it explicitly re-engages.
    if (optedOutSession) {
      if (isCommand(text, 'restart')) {
        await restartSurvey(phoneNumber, optedOutSession)
      } else if (surveyId) {
        // Tapping a survey link again is explicit re-opt-in: fresh session.
        await abandonSession(supabase, optedOutSession.id)
        await startSurvey(phoneNumber, surveyId)
      } else {
        await sendOptedOutNotice(phoneNumber)
      }
      return
    }

    if (isCommand(text, 'stop')) {
      if (activeSession) {
        await supabase
          .from('sessions')
          .update({ opted_out_at: new Date().toISOString() })
          .eq('id', activeSession.id)
      }
      await sendTextMessage(
        phoneNumber,
        "Got it — you've opted out and I won't message you again.\n\nReply RESTART anytime to start over."
      )
      return
    }

    if (isCommand(text, 'restart')) {
      if (activeSession) {
        await restartSurvey(phoneNumber, activeSession)
      } else {
        // No live session: a finished respondent has only history. Pointing
        // them at a link that would just say "already recorded" is a
        // confusing two-step — say it directly.
        const { data: lastDone } = await supabase
          .from('responses')
          .select('surveys(title)')
          .eq('phone_number', phoneNumber)
          .eq('completed', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        const doneTitle = (lastDone as any)?.surveys?.title
        if (lastDone) {
          await sendTextMessage(
            phoneNumber,
            `Thanks — your response${doneTitle ? ` to *${doneTitle}*` : ''} is already recorded.`
          )
        } else {
          await sendTextMessage(
            phoneNumber,
            'There is no survey in progress on this number.\n\nPlease use a valid survey link to get started.'
          )
        }
      }
      return
    }

    // A START_ link is routing, not an answer — handle it before validation
    // so it is never saved as one.
    if (surveyId) {
      if (activeSession && activeSession.survey_id === surveyId) {
        // Same survey tapped again: nudge with the current question.
        const questions = sortedQuestions(activeSession.surveys)
        const idx = activeSession.current_question_index
        if (idx >= 1 && idx <= questions.length) {
          await sendTextMessage(phoneNumber, "You're already on this survey — here's where you left off.")
          await sendQuestion(phoneNumber, questions[idx - 1], idx, questions.length)
        }
        return
      }
      if (activeSession) {
        // Switching surveys abandons the previous attempt (kept as Abandoned).
        await abandonSession(supabase, activeSession.id)
      }
      await startSurvey(phoneNumber, surveyId)
      return
    }

    if (!activeSession) {
      // No active session — greet or ignore
      await sendTextMessage(
        phoneNumber,
        'Welcome to Unify Survey Bot!\n\nPlease use a valid survey link to get started.'
      )
      return
    }

    const survey = activeSession.surveys
    if (!survey || survey.status !== 'active') {
      // Unpublished/closed/deleted mid-survey: stop asking questions.
      await abandonSession(supabase, activeSession.id)
      await sendTextMessage(phoneNumber, 'This survey is now closed. Thanks for your interest!')
      return
    }

    const questions = sortedQuestions(survey)
    const currentIndex = activeSession.current_question_index

    // Get or create response record
    let { data: response } = await supabase
      .from('responses')
      .select('id')
      .eq('session_id', activeSession.id)
      .single()

    if (!response) {
      const { data: newResponse } = await supabase
        .from('responses')
        .insert({
          session_id: activeSession.id,
          survey_id: activeSession.survey_id,
          phone_number: phoneNumber,
          completed: false,
        })
        .select('id')
        .single()
      response = newResponse
    }

    // Defensive: pointer past the end (shouldn't happen — completion closes
    // the session) completes instead of crashing on questions[index - 1].
    if (currentIndex < 1 || currentIndex > questions.length) {
      await completeSession(supabase, activeSession, response?.id, survey.title, phoneNumber)
      return
    }

    // Validate BEFORE saving: invalid input re-asks the same question and
    // never advances the pointer or writes an answer row.
    const answeredQuestion = questions[currentIndex - 1]
    if (response) {
      const verdict = validateAnswer(answeredQuestion, text)
      if (verdict.status === 'invalid') {
        await sendTextMessage(phoneNumber, `Hmm — ${verdict.hint}`)
        await sendQuestion(phoneNumber, answeredQuestion, currentIndex, questions.length)
        return
      }
      await supabase.from('answers').insert({
        response_id: response.id,
        question_id: answeredQuestion.id,
        option_id: verdict.optionId,
        text_answer: verdict.optionId ? null : verdict.text,
      })
    }

    // Send the next question or complete
    if (currentIndex >= questions.length) {
      // Survey complete
      await completeSession(supabase, activeSession, response?.id, survey.title, phoneNumber)
      return
    }

    // Send next question
    const nextQuestion = questions[currentIndex]
    await supabase
      .from('sessions')
      .update({ current_question_index: currentIndex + 1 })
      .eq('id', activeSession.id)

    await sendQuestion(phoneNumber, nextQuestion, currentIndex + 1, questions.length)
  } catch (error) {
    // Friendly failure: answers already saved are kept, the respondent hears
    // what happened, and the route still acks 200 so Meta doesn't retry us
    // into the dedupe wall (the message id is already recorded above).
    console.error('Survey engine error:', error)
    try {
      await sendTextMessage(
        phoneNumber,
        'Something went wrong on our end — your answers so far are saved. Please try again.'
      )
    } catch {
      // Send path itself failed (bad token, throttled number) — logged by
      // lib/whatsapp.ts already; nothing more we can do in-chat.
    }
  }
}

async function completeSession(
  supabase: ReturnType<typeof getSupabase>,
  session: any,
  responseId: string | undefined,
  surveyTitle: string,
  phoneNumber: string
) {
  await supabase
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', session.id)

  if (responseId) {
    await supabase.from('responses').update({ completed: true }).eq('id', responseId)
  }

  await sendTextMessage(
    phoneNumber,
    `Survey Complete!\n\nThank you for completing *${surveyTitle}*.\n\nYour responses have been recorded. We appreciate your feedback!`
  )
}

async function startSurvey(phoneNumber: string, surveyId: string) {
  const supabase = getSupabase()

  // One response per number per survey (default rule): a completed response
  // never starts a second one — thank them instead.
  const { data: alreadyDone } = await supabase
    .from('responses')
    .select('id')
    .eq('phone_number', phoneNumber)
    .eq('survey_id', surveyId)
    .eq('completed', true)
    .limit(1)
  if (alreadyDone && alreadyDone.length > 0) {
    await sendTextMessage(
      phoneNumber,
      'Thanks — your response to this survey is already recorded.'
    )
    return
  }

  const { data: survey } = await supabase
    .from('surveys')
    .select('*, questions(*, options(*))')
    .eq('id', surveyId)
    .eq('status', 'active')
    .single()

  if (!survey) {
    await sendTextMessage(phoneNumber, 'This survey link is not valid or the survey is no longer active.\n\nPlease ask the sender for a new link.')
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
    `*${survey.title}*\n\n${survey.description ?? ''}\n\nThis survey has *${survey.questions.length} questions* and takes about 2 minutes.\n\nLet's begin!`
  )

  const questions = sortedQuestions(survey)
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
      { id: 'yes', title: 'Yes' },
      { id: 'no', title: 'No' },
    ])
    return
  }

  if (question.type === 'rating') {
    await sendListMessage(to, header, 'Select rating', [
      {
        title: 'Your Rating',
        rows: [1, 2, 3, 4, 5].map((n) => ({
          id: String(n),
          title: `${n}/5`,
        })),
      },
    ])
    return
  }

  // Multiple choice
  const options = sortedOptions(question)
  if (options.length <= 3) {
    await sendButtonMessage(
      to,
      header,
      options.map((o: any) => ({ id: o.id, title: o.label }))
    )
  } else if (options.length <= 10) {
    await sendListMessage(to, header, 'Choose an answer', [
      {
        title: 'Options',
        rows: options.map((o: any) => ({ id: o.id, title: o.label })),
      },
    ])
  } else {
    // List messages cap at 10 rows — fall back to a numbered text list and
    // let the respondent reply with the number (validated 1..N).
    const lines = options.map((o: any, i: number) => `${i + 1}. ${o.label}`).join('\n')
    await sendTextMessage(
      to,
      `${header}\n\n${lines}\n\n_Reply with the number of your answer (1-${options.length}):_`
    )
  }
}
