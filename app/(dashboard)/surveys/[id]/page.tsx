import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getSurveyDetail } from '@/lib/queries'
import { formatDuration, whatsAppLink } from '@/lib/format'
import { ShareLinkButton, ExportMenu, OptionBar } from '@/components/survey-cells'
import SurveyEditPanel from '@/components/SurveyEditPanel'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  PieChartIcon,
  Clock01Icon,
  UserMinus01Icon,
} from '@hugeicons/core-free-icons'

const CARD = 'rounded-lg border border-border bg-card p-6 text-card-foreground'

export default async function SurveyResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const survey = await getSurveyDetail(supabase, user.id, id)
  if (!survey) notFound()

  const stats = [
    {
      icon: CheckmarkCircle02Icon,
      label: 'Completed responses',
      value: String(survey.completed),
      sub: `Out of ${survey.attempts} attempts`,
    },
    {
      icon: PieChartIcon,
      label: 'Completion rate',
      value: `${survey.completionRate}%`,
      sub: 'Completed vs. attempts',
    },
    {
      icon: Clock01Icon,
      label: 'Avg. completion time',
      value: survey.avgSeconds !== null ? formatDuration(survey.avgSeconds) : '—',
      sub:
        survey.avgSeconds !== null
          ? `${Math.round(survey.avgSeconds)} seconds total`
          : 'No completions yet',
    },
    {
      icon: UserMinus01Icon,
      label: 'Drop-off rate',
      value: `${survey.dropOffRate}%`,
      sub: `${survey.attempts - survey.completed} abandoned`,
    },
  ]

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <SurveyEditPanel
            surveyId={survey.id}
            initialTitle={survey.title}
            initialDescription={survey.description}
            initialStatus={survey.status}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareLinkButton text={whatsAppLink(survey.id)} />
          <ExportMenu surveyId={survey.id} />
        </div>
      </div>

      <div className="mb-6 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-6 text-card-foreground"
          >
            <div className="flex items-center gap-2 text-green-text">
              <HugeiconsIcon
                icon={stat.icon}
                size={16}
                strokeWidth={1.5}
                color="currentColor"
              />
              <span className="text-[13px] font-medium text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <div className="mt-2 text-[28px] font-semibold leading-tight tabular-nums">
              {stat.value}
            </div>
            <div className="mt-1 text-[13px] text-muted-foreground">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 mt-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Question breakdown</h2>
        <span className="text-[13px] text-muted-foreground">
          {survey.questions.length} questions
        </span>
      </div>

      <div className="mb-6">
        {survey.questions.map((q, idx) => (
          <div key={q.id} className="mb-4 rounded-lg border border-border bg-card p-6 text-card-foreground last:mb-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted-foreground">
                  Question {idx + 1}
                </div>
                <h3 className="mt-0.5 break-words text-[15px] font-semibold text-foreground">
                  {q.text}
                </h3>
              </div>
              <span className="shrink-0 text-[13px] text-muted-foreground">
                {q.answersCount} answer{q.answersCount === 1 ? '' : 's'}
              </span>
            </div>

            {q.breakdown ? (
              <div className="flex flex-col">
                {q.breakdown.map((opt, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[minmax(90px,170px)_1fr_84px] items-center gap-4 py-2"
                  >
                    <span className="break-words text-[13px] text-foreground">
                      {opt.label}
                    </span>
                    <OptionBar percent={opt.percent} />
                    <span className="text-right text-[13px] tabular-nums">
                      <span className="font-semibold text-foreground">{opt.count}</span>
                      <span className="text-muted-foreground"> · {opt.percent}%</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : q.textAnswers && q.textAnswers.length > 0 ? (
              <div className="flex flex-col">
                {q.textAnswers.map((answer, i) => (
                  <div
                    key={i}
                    className="border-t border-border py-3 text-[13px] text-foreground first:border-t-0 first:pt-0 last:pb-0"
                  >
                    {answer}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">No responses yet.</p>
            )}
          </div>
        ))}
      </div>

      <div className={CARD}>
        <h3 className="text-[15px] font-semibold text-foreground">Recent respondents</h3>
        <p className="mb-4 text-[13px] text-muted-foreground">
          Real-time incoming responses over WhatsApp
        </p>

        {survey.responses.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-6">
            <p className="text-sm font-medium text-foreground">No respondents yet</p>
            <p className="text-[13px] text-muted-foreground">
              Share the WhatsApp link to start collecting responses.
            </p>
            <ShareLinkButton text={whatsAppLink(survey.id)} />
          </div>
        ) : (
          <div className="-mx-3 overflow-x-auto">
            <div className="min-w-[460px]">
              <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-4 border-b border-border px-3 py-3 text-[13px] font-medium text-muted-foreground">
                <div>Contact</div>
                <div>Time</div>
                <div>Status</div>
              </div>
              {survey.responses.map((resp) => (
                <div
                  key={resp.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr] items-center gap-4 border-b border-border px-3 py-3.5 last:border-b-0 motion-safe:transition-colors motion-safe:duration-100 hover:bg-foreground-faint"
                >
                  <div className="truncate text-sm font-medium tabular-nums text-foreground">
                    {resp.phone}
                  </div>
                  <div className="truncate text-[13px] text-muted-foreground">
                    {resp.time}
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${resp.completed ? 'bg-primary-soft text-green-text' : 'bg-destructive-tint text-destructive'}`}
                    >
                      {resp.completed ? 'Completed' : 'Abandoned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
