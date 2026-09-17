import type { SupabaseClient } from '@supabase/supabase-js'
import { maskPhone, timeAgo } from './format'

export interface SurveyWithStats {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  questionsCount: number
  attempts: number
  completed: number
  completionRate: number
}

export async function getSurveysWithStats(
  supabase: SupabaseClient,
  userId: string,
  status?: string
): Promise<SurveyWithStats[]> {
  let query = supabase
    .from('surveys')
    .select('*, questions(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: surveys, error } = await query
  if (error) throw error
  if (!surveys || surveys.length === 0) return []

  const ids = surveys.map((s: any) => s.id)
  const { data: responses, error: rError } = await supabase
    .from('responses')
    .select('survey_id, completed')
    .in('survey_id', ids)
  if (rError) throw rError

  return surveys.map((s: any) => {
    const rows = (responses ?? []).filter((r: any) => r.survey_id === s.id)
    const attempts = rows.length
    const completed = rows.filter((r: any) => r.completed).length
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      status: s.status,
      createdAt: s.created_at,
      questionsCount: s.questions?.[0]?.count ?? 0,
      attempts,
      completed,
      completionRate: attempts > 0 ? Math.round((completed / attempts) * 100) : 0,
    }
  })
}

export async function getAvgCompletionSeconds(
  supabase: SupabaseClient,
  surveyIds: string[]
): Promise<number | null> {
  if (surveyIds.length === 0) return null
  const { data, error } = await supabase
    .from('sessions')
    .select('started_at, completed_at')
    .in('survey_id', surveyIds)
    .not('completed_at', 'is', null)
  if (error) throw error
  if (!data || data.length === 0) return null

  const totalSeconds = data.reduce(
    (sum: number, s: any) =>
      sum + (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 1000,
    0
  )
  return totalSeconds / data.length
}

export interface ActivityDay {
  day: string
  count: number
}

export async function getRecentResponseActivity(
  supabase: SupabaseClient,
  surveyIds: string[],
  days = 7
): Promise<ActivityDay[]> {
  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)

  const buckets: Record<string, number> = {}
  const orderedKeys: string[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets[key] = 0
    orderedKeys.push(key)
  }

  if (surveyIds.length > 0) {
    const { data, error } = await supabase
      .from('responses')
      .select('created_at')
      .eq('completed', true)
      .in('survey_id', surveyIds)
      .gte('created_at', since.toISOString())
    if (error) throw error

    for (const row of data ?? []) {
      const key = row.created_at.slice(0, 10)
      if (key in buckets) buckets[key]++
    }
  }

  return orderedKeys.map((key) => ({
    day: new Date(key + 'T00:00:00Z').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }),
    count: buckets[key],
  }))
}

export interface RecentResponse {
  id: string
  phone: string
  completed: boolean
  time: string
  surveyTitle: string
}

export async function getRecentResponses(
  supabase: SupabaseClient,
  surveyIds: string[],
  limit = 6
): Promise<RecentResponse[]> {
  if (surveyIds.length === 0) return []
  const { data, error } = await supabase
    .from('responses')
    .select('id, phone_number, completed, created_at, surveys(title)')
    .in('survey_id', surveyIds)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  return (data ?? []).map((r: any) => ({
    id: r.id,
    phone: maskPhone(r.phone_number),
    completed: r.completed,
    time: timeAgo(r.created_at),
    surveyTitle: r.surveys?.title ?? 'Untitled survey',
  }))
}

export interface QuestionBreakdown {
  id: string
  text: string
  type: string
  answersCount: number
  breakdown?: { label: string; count: number; percent: number }[]
  textAnswers?: string[]
}

export interface SurveyDetail {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  attempts: number
  completed: number
  completionRate: number
  avgSeconds: number | null
  dropOffRate: number
  questions: QuestionBreakdown[]
  responses: { id: string; phone: string; time: string; completed: boolean }[]
}

export async function getSurveyDetail(
  supabase: SupabaseClient,
  userId: string,
  surveyId: string
): Promise<SurveyDetail | null> {
  const { data: survey, error } = await supabase
    .from('surveys')
    .select('*, questions(*, options(*))')
    .eq('id', surveyId)
    .eq('user_id', userId)
    .single()

  if (error || !survey) return null

  const questions = (survey.questions ?? []).sort((a: any, b: any) => a.order - b.order)

  const { data: responses } = await supabase
    .from('responses')
    .select('id, phone_number, completed, created_at')
    .eq('survey_id', surveyId)
    .order('created_at', { ascending: false })

  const responseIds = (responses ?? []).map((r: any) => r.id)
  const { data: answers } = responseIds.length
    ? await supabase.from('answers').select('*').in('response_id', responseIds)
    : { data: [] as any[] }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('started_at, completed_at')
    .eq('survey_id', surveyId)
    .not('completed_at', 'is', null)

  const attempts = responses?.length ?? 0
  const completed = responses?.filter((r: any) => r.completed).length ?? 0
  const completionRate = attempts > 0 ? Math.round((completed / attempts) * 100) : 0

  const avgSeconds =
    sessions && sessions.length > 0
      ? sessions.reduce(
          (sum: number, s: any) =>
            sum + (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 1000,
          0
        ) / sessions.length
      : null

  const questionBreakdowns: QuestionBreakdown[] = questions.map((q: any) => {
    const qAnswers = (answers ?? []).filter((a: any) => a.question_id === q.id)

    if (q.type === 'text') {
      return {
        id: q.id,
        text: q.text,
        type: q.type,
        answersCount: qAnswers.length,
        textAnswers: qAnswers.map((a: any) => a.text_answer).filter(Boolean),
      }
    }

    let counts: { label: string; count: number }[]

    if (q.type === 'choice') {
      const byOption = new Map<string, number>()
      for (const a of qAnswers) {
        if (a.option_id) byOption.set(a.option_id, (byOption.get(a.option_id) ?? 0) + 1)
      }
      counts = (q.options ?? []).map((o: any) => ({
        label: o.label,
        count: byOption.get(o.id) ?? 0,
      }))
    } else if (q.type === 'yes_no') {
      counts = [
        { label: '✅ Yes', count: qAnswers.filter((a: any) => a.text_answer === 'yes').length },
        { label: '❌ No', count: qAnswers.filter((a: any) => a.text_answer === 'no').length },
      ]
    } else {
      counts = [1, 2, 3, 4, 5].map((n) => ({
        label: `${'⭐'.repeat(n)} ${n}/5`,
        count: qAnswers.filter((a: any) => a.text_answer === String(n)).length,
      }))
    }

    const total = counts.reduce((sum, c) => sum + c.count, 0)
    return {
      id: q.id,
      text: q.text,
      type: q.type,
      answersCount: qAnswers.length,
      breakdown: counts.map((c) => ({
        ...c,
        percent: total > 0 ? Math.round((c.count / total) * 100) : 0,
      })),
    }
  })

  return {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    status: survey.status,
    createdAt: survey.created_at,
    attempts,
    completed,
    completionRate,
    avgSeconds,
    dropOffRate: attempts > 0 ? Math.round(((attempts - completed) / attempts) * 100) : 0,
    questions: questionBreakdowns,
    responses: (responses ?? []).map((r: any) => ({
      id: r.id,
      phone: maskPhone(r.phone_number),
      time: timeAgo(r.created_at),
      completed: r.completed,
    })),
  }
}
