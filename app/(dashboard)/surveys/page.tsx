import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getSurveysWithStats } from '@/lib/queries'
import { whatsAppLink } from '@/lib/format'
import CopyButton from '@/components/CopyButton'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, ClipboardIcon } from '@hugeicons/core-free-icons'

const TABS = ['all', 'active', 'draft', 'closed'] as const

const BTN_PRIMARY_SM =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-ink px-3.5 py-1.5 font-sans text-[13px] font-semibold text-canvas transition-all duration-150 hover:opacity-[0.82] disabled:cursor-default disabled:opacity-50'
const CARD =
  'rounded-lg border border-border bg-surface shadow-card transition-all hover:border-border-strong hover:shadow-hover'

export default async function SurveysPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { status: statusParam } = await searchParams
  const status = statusParam ?? 'all'
  const allSurveys = await getSurveysWithStats(supabase, user.id)
  const filtered = status === 'all' ? allSurveys : allSurveys.filter((s) => s.status === status)

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] font-black leading-none tracking-[-1px] text-ink">Surveys</h1>
          <p className="mt-1 text-sm text-ink-muted">Create, deploy, and monitor your WhatsApp survey bots.</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border pb-3">
        {TABS.map((tab) => {
          const isActive = status === tab
          return (
            <Link
              key={tab}
              href={tab === 'all' ? '/surveys' : `/surveys?status=${tab}`}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-3.5 py-1.5 font-sans text-[13px] capitalize transition-all duration-150 ${
                isActive
                  ? 'border-accent-line bg-accent-tint font-bold text-accent-fg'
                  : 'border-transparent bg-transparent font-medium text-ink-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {tab} {tab === 'all' ? `(${allSurveys.length})` : ''}
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-20 text-center">
          <div className="flex justify-center opacity-35">
            <HugeiconsIcon icon={ClipboardIcon} size={40} strokeWidth={1.5} />
          </div>
          <div className="font-display text-xl font-bold text-ink">
            {allSurveys.length === 0 ? 'No surveys yet' : `No ${status} surveys`}
          </div>
          <div className="max-w-[320px] text-sm text-ink-muted">
            {allSurveys.length === 0
              ? 'Create your first WhatsApp survey to start collecting responses.'
              : 'Try a different filter, or create a new survey.'}
          </div>
          <Link href="/surveys/new" className={`${BTN_PRIMARY_SM} mt-2`}>
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2.5} />
            New WhatsApp Survey
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(360px,1fr))]">
          {filtered.map((survey) => (
            <div key={survey.id} className={`${CARD} flex flex-col justify-between p-6`}>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold tracking-[0.02em] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[""] ${survey.status === 'active' ? 'bg-accent-tint text-accent-fg before:animate-pulse-dot before:bg-accent-deep' : survey.status === 'closed' ? 'bg-danger-tint text-danger-fg before:bg-danger' : 'bg-tag text-ink-muted before:bg-ink-muted'}`}>
                    {survey.status === 'active' ? 'Live' : survey.status}
                  </span>
                  <span className="text-xs text-ink-muted">
                    Created {new Date(survey.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="mb-1.5 text-lg font-bold text-ink">
                  {survey.title}
                </h3>
                <p className="mb-5 text-[13px] leading-[1.5] text-ink-muted">
                  {survey.description || 'No description'}
                </p>
              </div>

              <div>
                <div className="mb-5 grid grid-cols-3 gap-2 rounded-md bg-tag p-3 text-center">
                  <div>
                    <div className="text-[11px] text-ink-muted">Questions</div>
                    <div className="text-base font-bold text-ink">
                      {survey.questionsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-ink-muted">Responses</div>
                    <div className="text-base font-bold text-accent-fg">
                      {survey.completed}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-ink-muted">Completion</div>
                    <div className="text-base font-bold text-ink">
                      {survey.completionRate}%
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <CopyButton
                    text={whatsAppLink(survey.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border-strong bg-surface px-3.5 py-1.5 font-sans text-[13px] font-semibold text-ink transition-all duration-150 hover:bg-surface-2"
                  />
                  <Link
                    href={`/surveys/${survey.id}`}
                    className={`${BTN_PRIMARY_SM} flex-1 justify-center`}
                  >
                    Analytics →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
