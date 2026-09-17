import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('*, questions(*, options(*)), responses(count)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ surveys })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, questions } = body

    // Insert Survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        title,
        description,
        status: 'active',
      })
      .select()
      .single()

    if (surveyError) throw surveyError

    // Insert Questions & Options
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
          await supabase.from('options').insert(optionsData)
        }
      }
    }

    return NextResponse.json({ survey }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
