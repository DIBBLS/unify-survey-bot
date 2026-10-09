import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { buildSurveyCsv, exportFilename } from '@/lib/export-csv'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('title, questions(*, options(*))')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !survey) {
    return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
  }

  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('id, phone_number, completed, created_at')
    .eq('survey_id', params.id)
    .order('created_at', { ascending: true })

  // Never serve a silent partial export: a failed query must 500 rather
  // than download an empty-looking CSV the creator would trust.
  if (responsesError) {
    return NextResponse.json({ error: 'Failed to load responses' }, { status: 500 })
  }

  const responseIds = (responses ?? []).map((r: any) => r.id)
  const { data: answers, error: answersError } = responseIds.length
    ? await supabase.from('answers').select('*').in('response_id', responseIds)
    : { data: [] as any[], error: null }
  if (answersError) {
    return NextResponse.json({ error: 'Failed to load answers' }, { status: 500 })
  }

  const questions = ((survey as any).questions ?? []).map((q: any) => ({
    id: q.id,
    text: q.text,
    type: q.type,
    order: q.order,
    options: (q.options ?? []).map((o: any) => ({ id: o.id, label: o.label })),
  }))

  const csv = buildSurveyCsv(questions, (responses ?? []) as any[], (answers ?? []) as any[])

  // Full phone numbers by decision: the dashboard masks, but the export is
  // the creator's own data and needs real numbers (contact, dedupe). This
  // resolves the PRD's identified-vs-anonymous open question toward
  // identified for exports — revisit if policy changes.
  // BOM first: without it Excel mojibakes non-ASCII respondent text.
  return new NextResponse('\uFEFF' + csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportFilename((survey as any).title)}"`,
    },
  })
}
