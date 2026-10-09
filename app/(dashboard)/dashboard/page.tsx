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

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {responsesThisWeek} {responsesThisWeek === 1 ? 'response' : 'responses'} in the last
            7 days across {surveys.length} survey{surveys.length === 1 ? '' : 's'}.
          </p>
        </div>
        <Link href="/surveys/new" className="btn btn-primary">
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2.5} />
          Create Survey
        </Link>
      </div>

      <div className="glass-card stat-strip">
        <div className="stat-cell">
          <div className="stat-label">Completed Responses</div>
          <div className="stat-value">{totalResponses}</div>
          <div className="stat-change positive">{responsesThisWeek} in the last 7 days</div>
        </div>

        <div className="stat-cell">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{avgCompletionRate}%</div>
          <div className="stat-change">
            {totalAttempts} attempt{totalAttempts === 1 ? '' : 's'} total
          </div>
        </div>

        <div className="stat-cell">
          <div className="stat-label">Active Surveys</div>
          <div className="stat-value">{activeSurveys}</div>
          <div className="stat-change">
            100% automated via WhatsApp
          </div>
        </div>

        <div className="stat-cell">
          <div className="stat-label">Avg. Completion Time</div>
          <div className="stat-value">{avgSeconds !== null ? formatDuration(avgSeconds) : '—'}</div>
          <div className="stat-change">
            <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '4px' }}>
              <HugeiconsIcon icon={ZapIcon} size={13} strokeWidth={2} />
            </span>
            Instant WhatsApp responses
          </div>
        </div>
      </div>

      <div className="dash-grid">
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
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Completed responses over the last 7 days
              </p>
            </div>
            <span className="badge badge-active">Live Engine</span>
          </div>

          <BarChart
            name="Responses"
            data={activity.map((a) => a.count)}
            labels={activity.map((a) => a.day)}
            showValues
          />
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Recent Responses</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Latest activity across all surveys
          </p>

          {recent.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No responses yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recent.map((r) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
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
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Manage active WhatsApp entry points and track completion.
            </p>
          </div>
          <Link href="/surveys" className="btn btn-secondary btn-sm">
            View All Surveys →
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <HugeiconsIcon icon={ClipboardIcon} size={40} strokeWidth={1.5} />
            </div>
            <div className="empty-state-title">No surveys yet</div>
            <div className="empty-state-desc">
              Create your first WhatsApp survey to start collecting responses.
            </div>
            <Link href="/surveys/new" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
              <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2.5} />
              Create Survey
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
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{survey.title}</td>
                  <td>
                    <span className={`badge badge-${survey.status === 'active' ? 'active' : survey.status === 'closed' ? 'closed' : 'draft'}`}>
                      {survey.status === 'active' ? 'Live' : survey.status}
                    </span>
                  </td>
                  <td>{survey.questionsCount}</td>
                  <td>{survey.attempts}</td>
                  <td style={{ fontWeight: 700, color: 'var(--green-text)' }}>{survey.completed}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--tag-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${survey.completionRate}%`, height: '100%', background: 'var(--green)' }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{survey.completionRate}%</span>
                    </div>
                  </td>
                  <td>
                    <CopyButton text={whatsAppLink(survey.id)} style={{ fontSize: '12px', padding: '4px 10px' }} />
                  </td>
                  <td>
                    <Link href={`/surveys/${survey.id}`} className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
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
