import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getSurveyDetail } from '@/lib/queries'
import { formatDuration, whatsAppLink } from '@/lib/format'
import CopyButton from '@/components/CopyButton'
import PrintButton from '@/components/PrintButton'
import SurveyEditPanel from '@/components/SurveyEditPanel'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link01Icon, Tick01Icon, Download01Icon } from '@hugeicons/core-free-icons'

const BAR_COLORS = ['var(--chart-2)', 'var(--chart-1)', 'var(--chart-3)', 'var(--chart-4)']

const BTN_SECONDARY =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-border-strong bg-surface px-6 py-3 font-sans text-sm font-semibold text-ink transition-all duration-150 hover:bg-surface-2'
const CARD =
  'rounded-lg border border-border bg-surface shadow-card transition-all hover:border-border-strong hover:shadow-hover'
const TH =
  'border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted'

export default async function SurveyResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const survey = await getSurveyDetail(supabase, user.id, id)
  if (!survey) notFound()

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/surveys" className="mb-1 inline-block text-[13px] text-ink-muted">
            ← Back to Surveys
          </Link>
          <SurveyEditPanel
            surveyId={survey.id}
            initialTitle={survey.title}
            initialDescription={survey.description}
            initialStatus={survey.status}
          />
        </div>
        <div className="flex gap-3">
          <CopyButton
            text={whatsAppLink(survey.id)}
            label={
              <>
                <HugeiconsIcon icon={Link01Icon} size={14} strokeWidth={2} />
                Share WA Link
              </>
            }
            copiedLabel={
              <>
                <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2.5} />
                Copied!
              </>
            }
          />
          <a
            href={`/api/surveys/${survey.id}/export`}
            className={BTN_SECONDARY}
            download
          >
            <HugeiconsIcon icon={Download01Icon} size={14} strokeWidth={2} />
            Export CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className={`${CARD} flex flex-col gap-2 p-5`}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Completed Responses</div>
          <div className="font-display text-[34px] font-black leading-none tracking-[-1px] text-ink">{survey.completed}</div>
          <div className="text-xs font-medium text-accent-fg">Out of {survey.attempts} attempts</div>
        </div>

        <div className={`${CARD} flex flex-col gap-2 p-5`}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Completion Rate</div>
          <div className="font-display text-[34px] font-black leading-none tracking-[-1px] text-ink">{survey.completionRate}%</div>
          <div className="text-xs font-medium text-ink-muted">
            {survey.completionRate >= 60 ? 'High Engagement' : survey.attempts === 0 ? 'No attempts yet' : 'Room to improve'}
          </div>
        </div>

        <div className={`${CARD} flex flex-col gap-2 p-5`}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Avg. Completion Time</div>
          <div className="font-display text-[34px] font-black leading-none tracking-[-1px] text-ink">{survey.avgSeconds !== null ? formatDuration(survey.avgSeconds) : '—'}</div>
          <div className="text-xs font-medium text-ink-muted">
            {survey.avgSeconds !== null ? `${Math.round(survey.avgSeconds)} seconds total` : 'No completions yet'}
          </div>
        </div>

        <div className={`${CARD} flex flex-col gap-2 p-5`}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Drop-off Rate</div>
          <div className="font-display text-[34px] font-black leading-none tracking-[-1px] text-ink">{survey.dropOffRate}%</div>
          <div className="text-xs font-medium text-ink-muted">
            {survey.attempts === 0 ? 'No attempts yet' : `${survey.attempts - survey.completed} abandoned`}
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-bold text-ink">
        Question Breakdown & Results
      </h2>

      <div className="mb-8 flex flex-col gap-5">
        {survey.questions.map((q, idx) => (
          <div key={q.id} className={`${CARD} p-6`}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-accent-fg">
                  Question {idx + 1}
                </div>
                <h3 className="mt-0.5 text-base font-bold text-ink">
                  {q.text}
                </h3>
              </div>
              <span className="rounded-pill bg-tag px-3 py-1 text-[13px] text-ink-muted">
                {q.answersCount} answer{q.answersCount === 1 ? '' : 's'}
              </span>
            </div>

            {q.breakdown ? (
              <div className="flex flex-col gap-3.5">
                {q.breakdown.map((opt, i) => (
                  <div key={i}>
                    <div className="mb-1.5 flex justify-between text-[13px]">
                      <span className="font-medium text-ink">{opt.label}</span>
                      <span className="text-ink-muted">
                        <strong>{opt.count}</strong> ({opt.percent}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-tag">
                      <div
                        style={{
                          width: `${opt.percent}%`,
                          background: BAR_COLORS[i % BAR_COLORS.length],
                        }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : q.textAnswers && q.textAnswers.length > 0 ? (
              <div className="flex max-h-[220px] flex-col gap-2 overflow-y-auto">
                {q.textAnswers.map((answer, i) => (
                  <div key={i} className="rounded-md bg-tag px-3.5 py-2.5 text-[13px] text-ink-muted">
                    {answer}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-ink-muted">No responses yet.</p>
            )}
          </div>
        ))}
      </div>

      <div className={`${CARD} p-6`}>
        <h3 className="mb-1 text-lg font-bold">Recent Respondent Log</h3>
        <p className="mb-4 text-[13px] text-ink-muted">
          Real-time incoming responses over WhatsApp
        </p>

        {survey.responses.length === 0 ? (
          <p className="text-[13px] text-ink-muted">No respondents yet — share the WhatsApp link above.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>WhatsApp Contact</th>
                <th className={TH}>Time</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {survey.responses.map((resp, i, arr) => (
                <tr key={resp.id} className="transition-colors hover:bg-surface-2">
                  <td className={`p-4 text-sm font-semibold ${i === arr.length - 1 ? '' : 'border-b border-border'}`}>{resp.phone}</td>
                  <td className={`p-4 text-sm text-ink-muted ${i === arr.length - 1 ? '' : 'border-b border-border'}`}>{resp.time}</td>
                  <td className={`p-4 text-sm ${i === arr.length - 1 ? '' : 'border-b border-border'}`}>
                    <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold tracking-[0.02em] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[""] ${resp.completed ? 'bg-accent-tint text-accent-fg before:animate-pulse-dot before:bg-accent-deep' : 'bg-danger-tint text-danger-fg before:bg-danger'}`}>
                      {resp.completed ? 'Completed' : 'Abandoned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
