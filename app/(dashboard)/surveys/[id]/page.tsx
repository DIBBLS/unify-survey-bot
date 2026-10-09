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

const BAR_COLORS = ['var(--green-deep)', 'var(--green)', 'var(--border-strong)', 'var(--text-subtle)']

export default async function SurveyResultsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const survey = await getSurveyDetail(supabase, user.id, params.id)
  if (!survey) notFound()

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <div>
          <Link href="/surveys" style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'inline-block', marginBottom: '4px' }}>
            ← Back to Surveys
          </Link>
          <SurveyEditPanel
            surveyId={survey.id}
            initialTitle={survey.title}
            initialDescription={survey.description}
            initialStatus={survey.status}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
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
            className="btn btn-secondary"
            download
          >
            <HugeiconsIcon icon={Download01Icon} size={14} strokeWidth={2} />
            Export CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-label">Completed Responses</div>
          <div className="stat-value">{survey.completed}</div>
          <div className="stat-change positive">Out of {survey.attempts} attempts</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{survey.completionRate}%</div>
          <div className="stat-change">
            {survey.completionRate >= 60 ? 'High Engagement' : survey.attempts === 0 ? 'No attempts yet' : 'Room to improve'}
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-label">Avg. Completion Time</div>
          <div className="stat-value">{survey.avgSeconds !== null ? formatDuration(survey.avgSeconds) : '—'}</div>
          <div className="stat-change">
            {survey.avgSeconds !== null ? `${Math.round(survey.avgSeconds)} seconds total` : 'No completions yet'}
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-label">Drop-off Rate</div>
          <div className="stat-value">{survey.dropOffRate}%</div>
          <div className="stat-change">
            {survey.attempts === 0 ? 'No attempts yet' : `${survey.attempts - survey.completed} abandoned`}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
        Question Breakdown & Results
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {survey.questions.map((q, idx) => (
          <div key={q.id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--green-text)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Question {idx + 1}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                  {q.text}
                </h3>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--tag-bg)', padding: '4px 12px', borderRadius: '999px' }}>
                {q.answersCount} answer{q.answersCount === 1 ? '' : 's'}
              </span>
            </div>

            {q.breakdown ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {q.breakdown.map((opt, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{opt.label}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <strong>{opt.count}</strong> ({opt.percent}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'var(--tag-bg)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${opt.percent}%`,
                          height: '100%',
                          background: BAR_COLORS[i % BAR_COLORS.length],
                          borderRadius: '5px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : q.textAnswers && q.textAnswers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {q.textAnswers.map((answer, i) => (
                  <div key={i} style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--tag-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                    {answer}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No responses yet.</p>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Recent Respondent Log</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Real-time incoming responses over WhatsApp
        </p>

        {survey.responses.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No respondents yet — share the WhatsApp link above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>WhatsApp Contact</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {survey.responses.map((resp) => (
                <tr key={resp.id}>
                  <td style={{ fontWeight: 600 }}>{resp.phone}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{resp.time}</td>
                  <td>
                    <span className={`badge badge-${resp.completed ? 'active' : 'closed'}`}>
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
