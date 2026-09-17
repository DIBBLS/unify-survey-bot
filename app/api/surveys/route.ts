import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('*, questions(*, options(*)), responses(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ surveys })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, questions } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        user_id: user.id,
        title,
        description: description ?? null,
        status: 'active',
      })
      .select()
      .single()

    if (surveyError) throw surveyError

    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        const { data: questionData, error: qError } = await supabase
          .from('questions')
          .insert({
            survey_id: survey.id,
            text: q.text,
            type: q.type,
            order: i + 1,
          })
          .select()
          .single()

        if (qError) throw qError

        if (q.options && q.options.length > 0) {
          const optionsData = q.options.map((opt: string) => ({
            question_id: questionData.id,
            label: opt,
            value: opt,
          }))
          const { error: optError } = await supabase.from('options').insert(optionsData)
          if (optError) throw optError
        }
      }
    }

    return NextResponse.json({ survey }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
