import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ComponentProps, ReactNode } from 'react'
import { createClient } from '@/lib/supabase-server'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  PieChartIcon,
  ClipboardIcon,
  Clock01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import {
  getSurveysWithStats,
  getAvgCompletionSeconds,
  getRecentResponseActivity,
  getRecentResponses,
} from '@/lib/queries'
import { formatDuration, whatsAppLink } from '@/lib/format'
import { CopyLinkButton, CompletionBar } from '@/components/survey-cells'
import { ActivityChart } from '@/components/charts/activity-chart'

const BTN_PRIMARY_SM =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-3.5 font-sans text-[13px] font-medium text-primary-foreground transition-all duration-150 hover:opacity-[0.85] disabled:cursor-default disabled:opacity-50'
const CARD = 'rounded-lg border border-border bg-card p-6 text-card-foreground'

const SURVEY_ROW_GRID =
  'grid-cols-[minmax(200px,2.4fr)_90px_110px_minmax(150px,1.5fr)_160px]'

function StatusPill({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <span className="inline-flex rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-green-text">
        Live
      </span>
    )
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        Draft
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning-ink">
      Closed
    </span>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  subPositive,
}: {
  icon: ComponentProps<typeof HugeiconsIcon>['icon']
  label: string
  value: ReactNode
  sub: string
  subPositive?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
      <div
        role="img"
        aria-label={label}
        title={label}
        className="mb-4 flex h-[36px] w-[36px] items-center justify-center rounded-md bg-primary-tile text-green-text"
      >
        <HugeiconsIcon icon={Icon} size={18} color="currentColor" strokeWidth={1.5} />
      </div>
      <div className="text-[28px] font-semibold leading-none tabular-nums">{value}</div>
      <div className={`mt-1.5 text-[13px] ${subPositive ? 'text-green-text' : 'text-muted-foreground'}`}>
        {sub}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const surveys = await getSurveysWithStats(supabase, user.id)
  const surveyIds = surveys.map((s) => s.id)

  const [avgSeconds, activity, recent] = await Promise.all([
    getAvgCompletionSeconds(supabase, surveyIds),
    getRecentResponseActivity(supabase, surveyIds),
    getRecentResponses(supabase, surveyIds),
  ])

  const totalResponses = surveys.reduce((sum, s) => sum + s.completed, 0)
  const totalAttempts = surveys.reduce((sum, s) => sum + s.attempts, 0)
  const avgCompletionRate = totalAttempts > 0 ? Math.round((totalResponses / totalAttempts) * 100) : 0
  const activeSurveys = surveys.filter((s) => s.status === 'active').length
  const responsesThisWeek = activity.reduce((sum, a) => sum + a.count, 0)

  return (
    <div className="animate-fade-up">
      <div className="mb-5 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <StatCard
          icon={CheckmarkCircle02Icon}
          label="Completed responses"
          value={totalResponses}
          sub={`${responsesThisWeek} in the last 7 days`}
          subPositive
        />
        <StatCard
          icon={PieChartIcon}
          label="Completion rate"
          value={`${avgCompletionRate}%`}
          sub={`${totalAttempts} attempt${totalAttempts === 1 ? '' : 's'} total`}
        />
        <StatCard
          icon={ClipboardIcon}
          label="Active surveys"
          value={activeSurveys}
          sub="100% automated via WhatsApp"
        />
        <StatCard
          icon={Clock01Icon}
          label="Avg. completion time"
          value={avgSeconds !== null ? formatDuration(avgSeconds) : '—'}
          sub={
            avgSeconds !== null
              ? `${Math.round(avgSeconds)} seconds total`
              : 'No completions yet'
          }
        />
      </div>

      <div className="mb-5 grid gap-5 max-[860px]:grid-cols-1 grid-cols-[2fr_1fr]">
        <div className={`${CARD}`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Response activity</h3>
              <p className="text-[13px] text-muted-foreground">
                Completed responses over the last 7 days
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-tile px-2 py-0.5 text-[12px] font-medium text-green-text">
              <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-primary" />
              Live
            </span>
          </div>

          <ActivityChart data={activity} />
        </div>

        <div className={`${CARD}`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Recent responses</h3>
              <p className="text-[13px] text-muted-foreground">
                Latest activity across all surveys
              </p>
            </div>
            <Link href="/surveys" className="shrink-0 text-[13px] font-medium text-green-text">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No responses yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-muted text-[12px] font-semibold text-muted-foreground"
                  >
                    {(r.surveyTitle || '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="truncate text-[14px] font-medium text-foreground">
                      {r.surveyTitle}
                    </div>
                    <div className="truncate text-[12px] text-muted-foreground">
                      {r.phone} · {r.time}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium ${r.completed ? 'bg-primary-tile text-green-text' : 'bg-warning-soft text-warning-ink'}`}
                  >
                    {r.completed ? 'Done' : 'Partial'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={CARD}>
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">My surveys</h3>
            <p className="text-[13px] text-muted-foreground">
              Manage active WhatsApp entry points and track completion.
            </p>
          </div>
          <Link
            href="/surveys"
            className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-md border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none"
          >
            View all surveys
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-[13px] text-muted-foreground">No surveys yet</p>
            <Link href="/surveys/new" className={BTN_PRIMARY_SM}>
              Create survey
            </Link>
          </div>
        ) : (
          <div className="-mx-3 overflow-x-auto">
            <div className="min-w-[660px]">
              <div
                className={`grid ${SURVEY_ROW_GRID} gap-4 border-b border-border px-3 py-3 text-[13px] font-medium text-muted-foreground`}
              >
                <div>Survey</div>
                <div>Status</div>
                <div>Responses</div>
                <div>Completion</div>
                <div />
              </div>
              {surveys.slice(0, 5).map((survey) => (
                <div
                  key={survey.id}
                  className={`grid ${SURVEY_ROW_GRID} items-center gap-4 border-b border-border px-3 py-3.5 transition-colors duration-100 last:border-b-0 hover:bg-foreground-faint`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {survey.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {survey.questionsCount} question{survey.questionsCount === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div>
                    <StatusPill status={survey.status} />
                  </div>
                  <div className="whitespace-nowrap text-sm tabular-nums">
                    <span className="font-semibold text-foreground">{survey.completed}</span>{' '}
                    <span className="text-muted-foreground">of {survey.attempts}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CompletionBar percent={survey.completionRate} />
                    <span
                      className={`w-9 text-right text-[13px] font-medium tabular-nums ${survey.completionRate === 0 ? 'text-muted-foreground' : 'text-foreground'}`}
                    >
                      {survey.completionRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <CopyLinkButton text={whatsAppLink(survey.id)} />
                    <Link
                      href={`/surveys/${survey.id}`}
                      className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-md border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none"
                    >
                      Results
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={14}
                        strokeWidth={1.5}
                        color="currentColor"
                      />
                    </Link>
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
