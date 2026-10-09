import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, ZapIcon, ClipboardIcon } from '@hugeicons/core-free-icons'
import {
  getSurveysWithStats,
  getAvgCompletionSeconds,
  getRecentResponseActivity,
  getRecentResponses,
} from '@/lib/queries'
import { formatDuration, whatsAppLink } from '@/lib/format'
import CopyButton from '@/components/CopyButton'
import { BarChart } from '@/components/charts/bar-chart'

const BTN_PRIMARY =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-ink px-6 py-3 font-sans text-sm font-semibold text-canvas transition-all duration-150 hover:opacity-[0.82] disabled:cursor-default disabled:opacity-50'
const BTN_PRIMARY_SM =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-ink px-3.5 py-1.5 font-sans text-[13px] font-semibold text-canvas transition-all duration-150 hover:opacity-[0.82] disabled:cursor-default disabled:opacity-50'
const BTN_SECONDARY_SM =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-border-strong bg-surface px-3.5 py-1.5 font-sans text-[13px] font-semibold text-ink transition-all duration-150 hover:bg-surface-2'
const BTN_GHOST_SM =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 py-2 font-sans text-[13px] font-semibold text-ink-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink'
const CARD =
  'rounded-lg border border-border bg-surface shadow-card transition-all hover:border-border-strong hover:shadow-hover'

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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] font-black leading-none tracking-[-1px] text-ink">Dashboard</h1>
        </div>
        <Link href="/surveys/new" className={BTN_PRIMARY}>
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2.5} />
          Create Survey
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-all hover:border-border-strong hover:shadow-hover xl:grid-cols-4">
        <div className="min-w-0 border-border px-6 py-5 [&:not(:first-child)]:border-l max-xl:[&:nth-child(3)]:border-l-0 max-xl:[&:nth-child(n+3)]:border-t">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Completed Responses</div>
          <div className="font-display text-[34px] font-black leading-none tracking-[-1px] text-ink">{totalResponses}</div>
          <div className="text-xs font-medium text-accent-fg">{responsesThisWeek} in the last 7 days</div>
        </div>

        <div className="min-w-0 border-border px-6 py-5 [&:not(:first-child)]:border-l max-xl:[&:nth-child(3)]:border-l-0 max-xl:[&:nth-child(n+3)]:border-t">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Completion Rate</div>
          <div className="font-display text-[34px] font-black leading-none tracking-[-1px] text-ink">{avgCompletionRate}%</div>
          <div className="text-xs font-medium text-ink-muted">
            {totalAttempts} attempt{totalAttempts === 1 ? '' : 's'} total
          </div>
        </div>

        <div className="min-w-0 border-border px-6 py-5 [&:not(:first-child)]:border-l max-xl:[&:nth-child(3)]:border-l-0 max-xl:[&:nth-child(n+3)]:border-t">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Active Surveys</div>
          <div className="font-display text-[34px] font-black leading-none tracking-[-1px] text-ink">{activeSurveys}</div>
          <div className="text-xs font-medium text-ink-muted">
            100% automated via WhatsApp
          </div>
        </div>

        <div className="min-w-0 border-border px-6 py-5 [&:not(:first-child)]:border-l max-xl:[&:nth-child(3)]:border-l-0 max-xl:[&:nth-child(n+3)]:border-t">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Avg. Completion Time</div>
          <div className="font-display text-[34px] font-black leading-none tracking-[-1px] text-ink">{avgSeconds !== null ? formatDuration(avgSeconds) : '—'}</div>
          <div className="text-xs font-medium text-ink-muted">
            <span className="mr-1 inline-flex align-middle">
              <HugeiconsIcon icon={ZapIcon} size={13} strokeWidth={2} />
            </span>
            Instant WhatsApp responses
          </div>
        </div>
      </div>

      <div className="mb-7 grid gap-6 max-lg:grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <div className={`${CARD} p-6`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Response Activity</h3>
              <p className="text-[13px] text-ink-muted">
                Completed responses over the last 7 days
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-tint px-2.5 py-1 text-xs font-semibold tracking-[0.02em] text-accent-fg before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-accent-deep before:animate-pulse-dot before:content-['']">Live Engine</span>
          </div>

          <BarChart
            name="Responses"
            data={activity.map((a) => a.count)}
            labels={activity.map((a) => a.day)}
            showValues
          />
        </div>

        <div className={`${CARD} p-6`}>
          <h3 className="mb-1 text-base font-bold">Recent Responses</h3>
          <p className="mb-5 text-[13px] text-ink-muted">
            Latest activity across all surveys
          </p>

          {recent.length === 0 ? (
            <p className="text-[13px] text-ink-muted">No responses yet.</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-ink">
                      {r.surveyTitle}
                    </div>
                    <div className="text-[11px] text-ink-muted">
                      {r.phone} · {r.time}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold tracking-[0.02em] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[""] ${r.completed ? 'bg-accent-tint text-accent-fg before:animate-pulse-dot before:bg-accent-deep' : 'bg-danger-tint text-danger-fg before:bg-danger'}`}>
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
            <h3 className="text-lg font-bold">My Surveys</h3>
            <p className="text-[13px] text-ink-muted">
              Manage active WhatsApp entry points and track completion.
            </p>
          </div>
          <Link href="/surveys" className={BTN_SECONDARY_SM}>
            View All Surveys →
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
                <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">Title</th>
                <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">Status</th>
                <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">Questions</th>
                <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">Attempts</th>
                <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">Completed</th>
                <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">Completion Rate</th>
                <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">WhatsApp Share</th>
                <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">Actions</th>
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
