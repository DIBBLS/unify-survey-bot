// Pure CSV builder for survey exports: rows in, CSV string out.
// Kept free of Supabase/Next imports so it can be unit-tested directly.

export interface ExportQuestion {
  id: string
  text: string
  type: string
  order: number
  options: { id: string; label: string }[]
}

export interface ExportResponse {
  id: string
  phone_number: string
  completed: boolean
  created_at: string
}

export interface ExportAnswer {
  response_id: string
  question_id: string
  option_id: string | null
  text_answer: string | null
}

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function answerCell(
  question: ExportQuestion,
  answers: ExportAnswer[]
): string {
  const answer = answers[0]
  if (!answer) return ''
  if (question.type === 'choice') {
    if (!answer.option_id) return answer.text_answer ?? ''
    return (
      question.options.find((o) => o.id === answer.option_id)?.label ?? ''
    )
  }
  return answer.text_answer ?? ''
}

export function buildSurveyCsv(
  questions: ExportQuestion[],
  responses: ExportResponse[],
  answers: ExportAnswer[]
): string {
  const ordered = questions.slice().sort((a, b) => a.order - b.order)
  const byResponse = new Map<string, ExportAnswer[]>()
  for (const a of answers) {
    const list = byResponse.get(a.response_id) ?? []
    list.push(a)
    byResponse.set(a.response_id, list)
  }

  const header = [
    'Phone number',
    'Status',
    'Submitted at',
    ...ordered.map((q, i) => `Q${i + 1}: ${q.text}`),
  ]

  const lines = [header.map(escapeCell).join(',')]
  for (const r of responses) {
    const rows = (byResponse.get(r.id) ?? []).filter(Boolean)
    const cells = [
      r.phone_number,
      r.completed ? 'Completed' : 'Abandoned',
      r.created_at,
      ...ordered.map((q) =>
        answerCell(
          q,
          rows.filter((a) => a.question_id === q.id)
        )
      ),
    ]
    lines.push(cells.map(escapeCell).join(','))
  }
  // \r\n per RFC 4180 — opens cleanly in Excel and Google Sheets.
  return lines.join('\r\n') + '\r\n'
}

export function exportFilename(title: string): string {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'survey'
  return `${slug}-responses.csv`
}
