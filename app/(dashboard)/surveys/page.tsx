'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const mockSurveysList = [
  {
    id: 'srv-1',
    title: 'Engineering Student Experience — 2026',
    description: 'Understanding academic bottlenecks and course workload issues.',
    status: 'active',
    questionsCount: 7,
    responsesCount: 267,
    completionRate: 73,
    createdAt: 'Sep 1, 2026',
    whatsappLink: 'https://wa.me/15550199?text=START_ENGINEERING_2026',
  },
  {
    id: 'srv-2',
    title: 'Department Facilities & Lab Equipment Feedback',
    description: 'Evaluating availability of hardware instruments and safety protocols.',
    status: 'active',
    questionsCount: 5,
    responsesCount: 103,
    completionRate: 66,
    createdAt: 'Sep 4, 2026',
    whatsappLink: 'https://wa.me/15550199?text=START_LAB_FEEDBACK',
  },
  {
    id: 'srv-3',
    title: 'Lecturer Evaluation — Harmattan Semester',
    description: 'Anonymous teaching quality assessment.',
    status: 'active',
    questionsCount: 10,
    responsesCount: 86,
    completionRate: 77,
    createdAt: 'Sep 5, 2026',
    whatsappLink: 'https://wa.me/15550199?text=START_LECTURER_EVAL',
  },
  {
    id: 'srv-4',
    title: 'Campus Wi-Fi & Network Reliability Poll',
    description: 'Bandwidth and connectivity report across hostel areas.',
    status: 'closed',
    questionsCount: 4,
    responsesCount: 31,
    completionRate: 78,
    createdAt: 'Aug 20, 2026',
    whatsappLink: 'https://wa.me/15550199?text=START_WIFI_POLL',
  },
]

export default function SurveysPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredSurveys = mockSurveysList.filter((s) => {
    if (filter === 'all') return true
    return s.status === filter
  })

  const copyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Surveys</h1>
          <p className="page-subtitle">
            Create, deploy, and monitor your WhatsApp survey bots.
          </p>
        </div>
        <Link href="/surveys/new" className="btn btn-primary">
          ➕ New WhatsApp Survey
        </Link>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
        }}
      >
        {(['all', 'active', 'draft', 'closed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="btn btn-ghost btn-sm"
            style={{
              textTransform: 'capitalize',
              color: filter === tab ? 'var(--green)' : 'var(--text-secondary)',
              fontWeight: filter === tab ? 700 : 500,
              background: filter === tab ? 'var(--green-dim)' : 'transparent',
              border: filter === tab ? '1px solid rgba(37,211,102,0.2)' : 'none',
            }}
          >
            {tab} {tab === 'all' ? `(${mockSurveysList.length})` : ''}
          </button>
        ))}
      </div>

      {/* Surveys List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredSurveys.map((survey) => (
          <div key={survey.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
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
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Created {survey.createdAt}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                {survey.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                {survey.description}
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
                    {survey.responsesCount}
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
                <button
                  onClick={() => copyLink(survey.id, survey.whatsappLink)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {copiedId === survey.id ? '✓ Link Copied' : '🔗 Copy WA Link'}
                </button>
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
    </div>
  )
}
