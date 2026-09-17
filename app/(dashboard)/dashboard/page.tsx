'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const mockSurveys = [
  {
    id: 'srv-1',
    title: 'Engineering Student Experience — 2026',
    status: 'active',
    questions: 7,
    attempts: 364,
    responses: 267,
    completionRate: 73,
    created: '2026-09-01',
    whatsappLink: 'https://wa.me/15550199?text=START_ENGINEERING_2026',
  },
  {
    id: 'srv-2',
    title: 'Department Facilities & Lab Equipment Feedback',
    status: 'active',
    questions: 5,
    attempts: 156,
    responses: 103,
    completionRate: 66,
    created: '2026-09-04',
    whatsappLink: 'https://wa.me/15550199?text=START_LAB_FEEDBACK',
  },
  {
    id: 'srv-3',
    title: 'Lecturer Evaluation — Harmattan Semester',
    status: 'active',
    questions: 10,
    attempts: 112,
    responses: 86,
    completionRate: 77,
    created: '2026-09-05',
    whatsappLink: 'https://wa.me/15550199?text=START_LECTURER_EVAL',
  },
  {
    id: 'srv-4',
    title: 'Campus Wi-Fi & Network Reliability Poll',
    status: 'closed',
    questions: 4,
    attempts: 40,
    responses: 31,
    completionRate: 78,
    created: '2026-08-20',
    whatsappLink: 'https://wa.me/15550199?text=START_WIFI_POLL',
  },
]

export default function DashboardPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="animate-fade-up">
      {/* Top Header */}
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

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="glass-card stat-card green">
          <div className="stat-label">Total Responses</div>
          <div className="stat-value">487</div>
          <div className="stat-change">↑ 24% this week</div>
        </div>

        <div className="glass-card stat-card purple">
          <div className="stat-label">Avg. Completion Rate</div>
          <div className="stat-value">73.5%</div>
          <div className="stat-change" style={{ color: 'var(--purple)' }}>
            vs 28% Google Forms
          </div>
        </div>

        <div className="glass-card stat-card blue">
          <div className="stat-label">Active Surveys</div>
          <div className="stat-value">3</div>
          <div className="stat-change" style={{ color: 'var(--blue)' }}>
            100% automated via WhatsApp
          </div>
        </div>

        <div className="glass-card stat-card amber">
          <div className="stat-label">Avg. Completion Time</div>
          <div className="stat-value">1m 45s</div>
          <div className="stat-change" style={{ color: 'var(--amber)' }}>
            ⚡ Instant WhatsApp responses
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Analytics Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        {/* Response Trend Chart Card */}
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
                Daily completed responses across WhatsApp surveys
              </p>
            </div>
            <span className="badge badge-active">Live Engine</span>
          </div>

          {/* Simple Visual Trend representation */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingTop: '20px' }}>
            {[
              { day: 'Sep 3', count: 34, height: '40%' },
              { day: 'Sep 4', count: 52, height: '65%' },
              { day: 'Sep 5', count: 88, height: '90%' },
              { day: 'Sep 6', count: 64, height: '70%' },
              { day: 'Sep 7', count: 95, height: '98%' },
              { day: 'Sep 8', count: 71, height: '75%' },
              { day: 'Sep 9', count: 83, height: '85%' },
            ].map((bar, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>{bar.count}</div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '40px',
                    height: bar.height,
                    background: 'linear-gradient(180deg, var(--green) 0%, rgba(37,211,102,0.1) 100%)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 0 12px var(--green-glow)',
                    transition: 'all 0.3s ease',
                  }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bar.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics / Quick Highlights Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
            Key Demographics
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Engineering Student Breakdown
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Mechanical Eng.</span>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>42%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '42%', height: '100%', background: 'var(--green)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Electrical & Electronics</span>
                <span style={{ color: 'var(--purple)', fontWeight: 700 }}>31%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '31%', height: '100%', background: 'var(--purple)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Computer Eng.</span>
                <span style={{ color: 'var(--blue)', fontWeight: 700 }}>19%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '19%', height: '100%', background: 'var(--blue)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Civil & Chemical Eng.</span>
                <span style={{ color: 'var(--amber)', fontWeight: 700 }}>8%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '8%', height: '100%', background: 'var(--amber)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Surveys Table */}
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
            {mockSurveys.map((survey) => (
              <tr key={survey.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {survey.title}
                </td>
                <td>
                  <span
                    className={`badge badge-${
                      survey.status === 'active'
                        ? 'active'
                        : survey.status === 'closed'
                        ? 'closed'
                        : 'draft'
                    }`}
                  >
                    {survey.status === 'active' ? 'Live' : survey.status}
                  </span>
                </td>
                <td>{survey.questions}</td>
                <td>{survey.attempts}</td>
                <td style={{ fontWeight: 700, color: 'var(--green)' }}>
                  {survey.responses}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '6px',
                        background: 'var(--bg-input)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${survey.completionRate}%`,
                          height: '100%',
                          background: 'var(--green)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {survey.completionRate}%
                    </span>
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => copyLink(survey.id, survey.whatsappLink)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    {copiedId === survey.id ? '✓ Copied Link' : '🔗 Copy WA Link'}
                  </button>
                </td>
                <td>
                  <Link
                    href={`/surveys/${survey.id}`}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--purple)', fontWeight: 600 }}
                  >
                    Results →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
