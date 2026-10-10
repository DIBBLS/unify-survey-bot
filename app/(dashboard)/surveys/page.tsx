import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getSurveysWithStats } from '@/lib/queries'
import { whatsAppLink } from '@/lib/format'
import { CopyLinkButton } from '@/components/survey-cells'
import { FilterTabs } from '@/components/filter-tabs'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

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
    <span className="inline-flex rounded-full bg-foreground-soft px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Closed
    </span>
  )
}

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
  const counts: Record<string, number> = {
    all: allSurveys.length,
    active: allSurveys.filter((s) => s.status === 'active').length,
    draft: allSurveys.filter((s) => s.status === 'draft').length,
    closed: allSurveys.filter((s) => s.status === 'closed').length,
  }
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Surveys</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Create, deploy, and monitor your WhatsApp survey bots.</p>
        </div>
      </div>

      <FilterTabs counts={counts} active={status} />

      {filtered.length === 0 ? (
        allSurveys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No surveys yet</p>
            <Link
              href="/surveys/new"
              className="inline-flex h-9 items-center whitespace-nowrap rounded-md border border-transparent bg-primary px-3.5 font-sans text-[13px] font-medium text-primary-foreground transition-all duration-150 hover:opacity-[0.85] focus-visible:border-ring focus-visible:outline-none"
            >
              Create survey
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No {status} surveys</p>
            <p className="text-[13px] text-muted-foreground">
              {status === 'draft'
                ? 'Surveys you save as drafts will show up here.'
                : `${statusLabel} surveys will show up here.`}
            </p>
          </div>
        )
      ) : (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {filtered.map((survey) => (
            <div
              key={survey.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground motion-safe:transition-colors motion-safe:duration-[120ms] hover:border-foreground-line"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-base font-semibold text-foreground">
                    <Link
                      href={`/surveys/${survey.id}`}
                      className="transition-colors hover:text-green-text focus-visible:underline focus-visible:outline-none"
                    >
                      {survey.title}
                    </Link>
                  </h3>
                  {survey.description && (
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">
                      {survey.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <StatusPill status={survey.status} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
                <div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">
                    {survey.questionsCount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Responses</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">
                    {survey.completed}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Completion</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">
                    {survey.completionRate}%
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  Created {new Date(survey.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyLinkButton text={whatsAppLink(survey.id)} />
                  <Link
                    href={`/surveys/${survey.id}`}
                    className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-md border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-muted motion-safe:transition-colors focus-visible:border-ring focus-visible:outline-none"
                  >
                    Analytics
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      strokeWidth={1.5}
                      color="currentColor"
                    />
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
