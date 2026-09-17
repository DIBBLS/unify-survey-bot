'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const mockSurveyData = {
  id: 'srv-1',
  title: 'Engineering Student Experience — 2026',
  description: 'Understanding academic bottlenecks, course workload, and campus challenges.',
  status: 'active',
  created: 'Sep 1, 2026',
  totalAttempts: 364,
  completedResponses: 267,
  completionRate: 73.3,
  avgTimeSeconds: 104,
  questions: [
    {
      id: 'q1',
      text: 'How difficult is it to keep up with your courses?',
      type: 'choice',
      answersCount: 267,
      breakdown: [
        { label: 'Very difficult', count: 112, percent: 42 },
        { label: 'Somewhat difficult', count: 83, percent: 31 },
        { label: 'Manageable', count: 51, percent: 19 },
        { label: 'Very easy', count: 21, percent: 8 },
      ],
    },
    {
      id: 'q2',
      text: 'What is the primary cause of academic stress?',
      type: 'choice',
      answersCount: 265,
      breakdown: [
        { label: 'Too many lab reports / materials', count: 151, percent: 57 },
        { label: 'Poor course explanations', count: 56, percent: 21 },
        { label: 'Lack of preparation time', count: 40, percent: 15 },
        { label: 'Unclear grading scheme', count: 18, percent: 7 },
      ],
    },
    {
      id: 'q3',
      text: 'Rate your satisfaction with department equipment availability (1-5 Stars)',
      type: 'rating',
      answersCount: 260,
      breakdown: [
        { label: '5 Stars ⭐⭐⭐⭐⭐', count: 22, percent: 8 },
        { label: '4 Stars ⭐⭐⭐⭐', count: 45, percent: 17 },
        { label: '3 Stars ⭐⭐⭐', count: 78, percent: 30 },
        { label: '2 Stars ⭐⭐', count: 81, percent: 31 },
        { label: '1 Star ⭐', count: 34, percent: 14 },
      ],
    },
  ],
  responses: [
    { phone: '+234 803 *** 4829', time: '10 mins ago', completed: true, duration: '1m 20s' },
    { phone: '+234 812 *** 9910', time: '14 mins ago', completed: true, duration: '1m 45s' },
    { phone: '+234 706 *** 1142', time: '22 mins ago', completed: true, duration: '2m 05s' },
    { phone: '+234 901 *** 8831', time: '35 mins ago', completed: false, duration: 'Abandoned at Q2' },
    { phone: '+234 814 *** 0029', time: '1 hour ago', completed: true, duration: '1m 15s' },
  ],
}

export default function SurveyResultsPage() {
  const params = useParams()
  const survey = mockSurveyData
  const [copiedLink, setCopiedLink] = useState(false)

  const shareLink = `https://wa.me/15550199?text=START_${survey.id}`

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/surveys" style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'inline-block', marginBottom: '4px' }}>
            ← Back to Surveys
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">{survey.title}</h1>
            <span className="badge badge-active">Live Bot</span>
          </div>
          <p className="page-subtitle">{survey.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={copyShareLink} className="btn btn-secondary">
            {copiedLink ? '✓ Copied!' : '🔗 Share WA Link'}
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="stats-grid">
        <div className="glass-card stat-card green">
          <div className="stat-label">Completed Responses</div>
          <div className="stat-value">{survey.completedResponses}</div>
          <div className="stat-change">Out of {survey.totalAttempts} attempts</div>
        </div>

        <div className="glass-card stat-card purple">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{survey.completionRate}%</div>
          <div className="stat-change" style={{ color: 'var(--purple)' }}>
            High Engagement
          </div>
        </div>

        <div className="glass-card stat-card blue">
          <div className="stat-label">Avg. Completion Time</div>
          <div className="stat-value">1m 44s</div>
          <div className="stat-change" style={{ color: 'var(--blue)' }}>
            104 seconds total
          </div>
        </div>

        <div className="glass-card stat-card amber">
          <div className="stat-label">Drop-off Rate</div>
          <div className="stat-value">26.7%</div>
          <div className="stat-change" style={{ color: 'var(--amber)' }}>
            Mostly on Q2
          </div>
        </div>
      </div>

      {/* Breakdown per Question Section */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
        Question Breakdown & Results
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {survey.questions.map((q, idx) => (
          <div key={q.id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Question {idx + 1}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {q.text}
                </h3>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '4px 12px', borderRadius: '999px' }}>
                {q.answersCount} answers
              </span>
            </div>

            {/* Answer Options Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {q.breakdown.map((opt, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{opt.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong>{opt.count}</strong> ({opt.percent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'var(--bg-input)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${opt.percent}%`,
                        height: '100%',
                        background:
                          i === 0
                            ? 'var(--green)'
                            : i === 1
                            ? 'var(--purple)'
                            : i === 2
                            ? 'var(--blue)'
                            : 'var(--amber)',
                        borderRadius: '5px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Individual Responses Feed */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
          Recent Respondent Log
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Real-time incoming responses over WhatsApp
        </p>

        <table className="data-table">
          <thead>
            <tr>
              <th>WhatsApp Contact</th>
              <th>Time</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {survey.responses.map((resp, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{resp.phone}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{resp.time}</td>
                <td>
                  <span className={`badge badge-${resp.completed ? 'active' : 'closed'}`}>
                    {resp.completed ? 'Completed' : 'Abandoned'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{resp.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
