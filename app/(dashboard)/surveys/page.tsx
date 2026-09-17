import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getSurveysWithStats } from '@/lib/queries'
import { whatsAppLink } from '@/lib/format'
import CopyButton from '@/components/CopyButton'

const TABS = ['all', 'active', 'draft', 'closed'] as const

export default async function SurveysPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const status = searchParams.status ?? 'all'
  const allSurveys = await getSurveysWithStats(supabase, user.id)
  const filtered = status === 'all' ? allSurveys : allSurveys.filter((s) => s.status === status)

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Surveys</h1>
          <p className="page-subtitle">Create, deploy, and monitor your WhatsApp survey bots.</p>
        </div>
        <Link href="/surveys/new" className="btn btn-primary">
          ➕ New WhatsApp Survey
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
        }}
      >
        {TABS.map((tab) => {
          const isActive = status === tab
          return (
            <Link
              key={tab}
              href={tab === 'all' ? '/surveys' : `/surveys?status=${tab}`}
              className="btn btn-ghost btn-sm"
              style={{
                textTransform: 'capitalize',
                color: isActive ? 'var(--green)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'var(--green-dim)' : 'transparent',
                border: isActive ? '1px solid rgba(37,211,102,0.2)' : '1px solid transparent',
              }}
            >
              {tab} {tab === 'all' ? `(${allSurveys.length})` : ''}
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">
            {allSurveys.length === 0 ? 'No surveys yet' : `No ${status} surveys`}
          </div>
          <div className="empty-state-desc">
            {allSurveys.length === 0
              ? 'Create your first WhatsApp survey to start collecting responses.'
              : 'Try a different filter, or create a new survey.'}
          </div>
          <Link href="/surveys/new" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
            ➕ New WhatsApp Survey
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filtered.map((survey) => (
            <div key={survey.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className={`badge badge-${survey.status === 'active' ? 'active' : survey.status === 'closed' ? 'closed' : 'draft'}`}>
                    {survey.status === 'active' ? 'Live' : survey.status}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Created {new Date(survey.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  {survey.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                  {survey.description || 'No description'}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    padding: '12px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Questions</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {survey.questionsCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Responses</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green)' }}>
                      {survey.completed}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Completion</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--purple)' }}>
                      {survey.completionRate}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <CopyButton
                    text={whatsAppLink(survey.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  />
                  <Link
                    href={`/surveys/${survey.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
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
