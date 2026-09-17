import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import {
  getSurveysWithStats,
  getAvgCompletionSeconds,
  getRecentResponseActivity,
  getRecentResponses,
} from '@/lib/queries'
import { formatDuration, whatsAppLink } from '@/lib/format'
import CopyButton from '@/components/CopyButton'

export default async function DashboardPage() {
  const supabase = createClient()
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
  const maxActivity = Math.max(1, ...activity.map((a) => a.count))

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspace Overview</h1>
          <p className="page-subtitle">
            Real-time survey performance and WhatsApp respondent engagement.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/surveys/new" className="btn btn-primary">
            ➕ Create Survey
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card green">
          <div className="stat-label">Completed Responses</div>
          <div className="stat-value">{totalResponses}</div>
          <div className="stat-change">{responsesThisWeek} in the last 7 days</div>
        </div>

        <div className="glass-card stat-card purple">
          <div className="stat-label">Avg. Completion Rate</div>
          <div className="stat-value">{avgCompletionRate}%</div>
          <div className="stat-change" style={{ color: 'var(--purple)' }}>
            Across {surveys.length} survey{surveys.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="glass-card stat-card blue">
          <div className="stat-label">Active Surveys</div>
          <div className="stat-value">{activeSurveys}</div>
          <div className="stat-change" style={{ color: 'var(--blue)' }}>
            100% automated via WhatsApp
          </div>
        </div>

        <div className="glass-card stat-card amber">
          <div className="stat-label">Avg. Completion Time</div>
          <div className="stat-value">{avgSeconds !== null ? formatDuration(avgSeconds) : '—'}</div>
          <div className="stat-change" style={{ color: 'var(--amber)' }}>
            ⚡ Instant WhatsApp responses
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        <div className="glass-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Response Activity</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Completed responses over the last 7 days
              </p>
            </div>
            <span className="badge badge-active">Live Engine</span>
          </div>

          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingTop: '20px' }}>
            {activity.map((bar, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>{bar.count}</div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '40px',
                    height: `${Math.max((bar.count / maxActivity) * 100, 4)}%`,
                    background: 'linear-gradient(180deg, var(--green) 0%, rgba(37,211,102,0.1) 100%)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: bar.count > 0 ? '0 0 12px var(--green-glow)' : 'none',
                  }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bar.day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Recent Responses</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Latest activity across all surveys
          </p>

          {recent.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No responses yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recent.map((r) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {r.surveyTitle}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {r.phone} · {r.time}
                    </div>
                  </div>
                  <span className={`badge badge-${r.completed ? 'active' : 'closed'}`}>
                    {r.completed ? 'Done' : 'Partial'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>My Surveys</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Manage active WhatsApp entry points and track completion.
            </p>
          </div>
          <Link href="/surveys" className="btn btn-secondary btn-sm">
            View All Surveys →
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No surveys yet</div>
            <div className="empty-state-desc">
              Create your first WhatsApp survey to start collecting responses.
            </div>
            <Link href="/surveys/new" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
              ➕ Create Survey
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Questions</th>
                <th>Attempts</th>
                <th>Completed</th>
                <th>Completion Rate</th>
                <th>WhatsApp Share</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.slice(0, 5).map((survey) => (
                <tr key={survey.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{survey.title}</td>
                  <td>
                    <span className={`badge badge-${survey.status === 'active' ? 'active' : survey.status === 'closed' ? 'closed' : 'draft'}`}>
                      {survey.status === 'active' ? 'Live' : survey.status}
                    </span>
                  </td>
                  <td>{survey.questionsCount}</td>
                  <td>{survey.attempts}</td>
                  <td style={{ fontWeight: 700, color: 'var(--green)' }}>{survey.completed}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${survey.completionRate}%`, height: '100%', background: 'var(--green)' }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{survey.completionRate}%</span>
                    </div>
                  </td>
                  <td>
                    <CopyButton text={whatsAppLink(survey.id)} style={{ fontSize: '12px', padding: '4px 10px' }} />
                  </td>
                  <td>
                    <Link href={`/surveys/${survey.id}`} className="btn btn-ghost btn-sm" style={{ color: 'var(--purple)', fontWeight: 600 }}>
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
