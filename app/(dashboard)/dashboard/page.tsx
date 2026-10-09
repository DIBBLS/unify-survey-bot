import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ComponentProps, ReactNode } from 'react'
import { createClient } from '@/lib/supabase-server'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  CheckmarkCircle02Icon,
  PieChartIcon,
  ClipboardIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons'
import {
  getSurveysWithStats,
  getAvgCompletionSeconds,
  getRecentResponseActivity,
  getRecentResponses,
} from '@/lib/queries'
import { formatDuration, whatsAppLink } from '@/lib/format'
import CopyButton from '@/components/CopyButton'
import { ActivityChart } from '@/components/charts/activity-chart'

const BTN_PRIMARY_SM =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-3.5 font-sans text-[13px] font-medium text-primary-foreground transition-all duration-150 hover:opacity-[0.85] disabled:cursor-default disabled:opacity-50'
const BTN_SECONDARY_SM =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-foreground transition-all duration-150 hover:bg-muted'
const BTN_GHOST_SM =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 py-2 font-sans text-[13px] font-semibold text-ink-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink'
const CARD = 'rounded-lg border border-border bg-card p-6 text-card-foreground'

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'active'
      ? 'bg-accent-tint text-accent-fg before:animate-pulse-dot before:bg-accent-deep'
      : status === 'closed'
        ? 'bg-danger-tint text-danger-fg before:bg-danger'
        : 'bg-tag text-ink-muted before:bg-ink-muted'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold tracking-[0.02em] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[""] ${tone}`}
    >
      {status === 'active' ? 'Live' : status}
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

      <div className={`${CARD} p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold">My Surveys</h3>
            <p className="text-[13px] text-muted-foreground">
              Manage active WhatsApp entry points and track completion.
            </p>
          </div>
          <Link href="/surveys" className={BTN_SECONDARY_SM}>
            View all surveys
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-5 py-20 text-center">
            <div className="flex justify-center opacity-35">
              <HugeiconsIcon icon={ClipboardIcon} size={40} strokeWidth={1.5} />
            </div>
            <div className="font-display text-xl font-bold text-ink">No surveys yet</div>
            <div className="max-w-[320px] text-sm text-ink-muted">
              Create your first WhatsApp survey to start collecting responses.
            </div>
            <Link href="/surveys/new" className={`${BTN_PRIMARY_SM} mt-2`}>
              <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2.5} />
              Create Survey
            </Link>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border px-4 py-3 text-left text-[13px] font-medium text-muted-foreground">Title</th>
                <th className="border-b border-border px-4 py-3 text-left text-[13px] font-medium text-muted-foreground">Status</th>
                <th className="border-b border-border px-4 py-3 text-left text-[13px] font-medium text-muted-foreground">Questions</th>
                <th className="border-b border-border px-4 py-3 text-left text-[13px] font-medium text-muted-foreground">Attempts</th>
                <th className="border-b border-border px-4 py-3 text-left text-[13px] font-medium text-muted-foreground">Completed</th>
                <th className="border-b border-border px-4 py-3 text-left text-[13px] font-medium text-muted-foreground">Completion rate</th>
                <th className="border-b border-border px-4 py-3 text-left text-[13px] font-medium text-muted-foreground">WhatsApp share</th>
                <th className="border-b border-border px-4 py-3 text-left text-[13px] font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.slice(0, 5).map((survey, i, arr) => (
                <tr key={survey.id} className="transition-colors hover:bg-surface-2">
                  <td className={`p-4 text-sm font-semibold text-ink ${i === arr.length - 1 ? 'border-b-0' : 'border-b border-border'}`}>{survey.title}</td>
                  <td className={`p-4 text-sm ${i === arr.length - 1 ? 'border-b-0' : 'border-b border-border'}`}>
                    <StatusBadge status={survey.status} />
                  </td>
                  <td className={`p-4 text-sm text-ink ${i === arr.length - 1 ? 'border-b-0' : 'border-b border-border'}`}>{survey.questionsCount}</td>
                  <td className={`p-4 text-sm text-ink ${i === arr.length - 1 ? 'border-b-0' : 'border-b border-border'}`}>{survey.attempts}</td>
                  <td className={`p-4 text-sm font-bold text-accent-fg ${i === arr.length - 1 ? 'border-b-0' : 'border-b border-border'}`}>{survey.completed}</td>
                  <td className={`p-4 text-sm ${i === arr.length - 1 ? 'border-b-0' : 'border-b border-border'}`}>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-[60px] overflow-hidden rounded-full bg-tag">
                        <div style={{ width: `${survey.completionRate}%` }} className="h-full rounded-full bg-accent" />
                      </div>
                      <span className="text-[13px] font-semibold">{survey.completionRate}%</span>
                    </div>
                  </td>
                  <td className={`p-4 text-sm ${i === arr.length - 1 ? 'border-b-0' : 'border-b border-border'}`}>
                    <CopyButton text={whatsAppLink(survey.id)} style={{ fontSize: '12px', padding: '4px 10px' }} />
                  </td>
                  <td className={`p-4 text-sm ${i === arr.length - 1 ? 'border-b-0' : 'border-b border-border'}`}>
                    <Link href={`/surveys/${survey.id}`} className={`${BTN_GHOST_SM} font-semibold`}>
                      Results →
                    </Link>
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
