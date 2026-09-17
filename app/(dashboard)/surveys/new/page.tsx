'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DraftQuestion {
  id: string
  text: string
  type: 'choice' | 'rating' | 'yes_no' | 'text'
  options: string[]
}

export default function NewSurveyPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    {
      id: 'q-1',
      text: 'How difficult is it to keep up with your engineering courses?',
      type: 'choice',
      options: ['Very difficult', 'Somewhat difficult', 'Manageable', 'Very easy'],
    },
    {
      id: 'q-2',
      text: 'What is your current overall satisfaction with department facilities?',
      type: 'rating',
      options: [],
    },
  ])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

  const addQuestion = () => {
    const newQ: DraftQuestion = {
      id: `q-${Date.now()}`,
      text: '',
      type: 'choice',
      options: ['Option A', 'Option B'],
    }
    setQuestions([...questions, newQ])
    setActiveQuestionIndex(questions.length)
  }

  const updateQuestion = (index: number, updated: Partial<DraftQuestion>) => {
    const next = [...questions]
    next[index] = { ...next[index], ...updated }
    setQuestions(next)
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return
    const next = questions.filter((_, i) => i !== index)
    setQuestions(next)
    setActiveQuestionIndex(Math.max(0, index - 1))
  }

  const addOption = (qIndex: number) => {
    const q = questions[qIndex]
    updateQuestion(qIndex, {
      options: [...q.options, `Option ${String.fromCharCode(65 + q.options.length)}`],
    })
  }

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const q = questions[qIndex]
    const nextOpts = [...q.options]
    nextOpts[optIndex] = value
    updateQuestion(qIndex, { options: nextOpts })
  }

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex]
    if (q.options.length <= 2) return
    const nextOpts = q.options.filter((_, i) => i !== optIndex)
    updateQuestion(qIndex, { options: nextOpts })
  }

  const currentQ = questions[activeQuestionIndex] || questions[0]

  const handlePublish = () => {
    if (!title.trim()) {
      alert('Please enter a survey title')
      return
    }
    // Simulate publish and navigate to surveys list
    alert('🎉 Survey Published Successfully!\nWhatsApp link generated.')
    router.push('/surveys')
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/surveys" style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'inline-block', marginBottom: '4px' }}>
            ← Back to Surveys
          </Link>
          <h1 className="page-title">Create WhatsApp Survey</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => router.push('/surveys')} className="btn btn-secondary">
            Save Draft
          </button>
          <button onClick={handlePublish} className="btn btn-primary">
            🚀 Publish Survey Bot
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Live WhatsApp Phone Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Left Side — Builder Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Survey Details Card */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Survey Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Survey Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Engineering Student Experience — 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Greeting Message</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="e.g. We are trying to understand what makes school difficult. Takes 2 minutes!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                Questions ({questions.length})
              </h3>
              <button onClick={addQuestion} className="btn btn-secondary btn-sm">
                ➕ Add Question
              </button>
            </div>

            {/* Question Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionIndex(idx)}
                  className="btn btn-sm"
                  style={{
                    background: activeQuestionIndex === idx ? 'var(--green-dim)' : 'var(--bg-input)',
                    color: activeQuestionIndex === idx ? 'var(--green)' : 'var(--text-secondary)',
                    border: activeQuestionIndex === idx ? '1px solid rgba(37,211,102,0.3)' : '1px solid transparent',
                  }}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>

            {/* Active Question Editor */}
            {currentQ && (
              <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--green)' }}>
                    Question #{activeQuestionIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(activeQuestionIndex)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete Question
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Question Text</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter question text..."
                      value={currentQ.text}
                      onChange={(e) => updateQuestion(activeQuestionIndex, { text: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Response Type</label>
                    <select
                      className="form-select"
                      value={currentQ.type}
                      onChange={(e) => updateQuestion(activeQuestionIndex, { type: e.target.value as any })}
                    >
                      <option value="choice">Multiple Choice (Interactive Buttons/List)</option>
                      <option value="rating">Rating (1 to 5 Stars)</option>
                      <option value="yes_no">Yes / No Poll</option>
                      <option value="text">Open Text Response</option>
                    </select>
                  </div>

                  {/* Options editor for Choice type */}
                  {currentQ.type === 'choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                      <label className="form-label">Answer Options (Max 10)</label>
                      {currentQ.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', width: '24px' }}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1 }}
                            value={opt}
                            onChange={(e) => updateOption(activeQuestionIndex, oIdx, e.target.value)}
                          />
                          {currentQ.options.length > 2 && (
                            <button
                              onClick={() => removeOption(activeQuestionIndex, oIdx)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--red)' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {currentQ.options.length < 10 && (
                        <button
                          onClick={() => addOption(activeQuestionIndex)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--green)', alignSelf: 'flex-start' }}
                        >
                          + Add Option
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side — WhatsApp Phone Simulator */}
        <div>
          <div
            className="glass-card"
            style={{
              padding: '16px',
              position: 'sticky',
              top: '84px',
              background: '#0b141a', // WhatsApp dark background
              border: '1px solid #1f2c34',
              borderRadius: '24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
            }}
          >
            {/* WhatsApp Top bar simulator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingBottom: '12px',
                borderBottom: '1px solid #1f2c34',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#128C7E',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                }}
              >
                U
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e9edef' }}>
                  Unify Bot
                </div>
                <div style={{ fontSize: '10px', color: '#8696a0' }}>official business account</div>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '340px' }}>
              {/* Bot Greeting Bubble */}
              <div
                style={{
                  background: '#202c33',
                  color: '#e9edef',
                  padding: '10px 14px',
                  borderRadius: '0 12px 12px 12px',
                  maxWidth: '85%',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                <strong>👋 {title || 'Survey Title'}</strong>
                <br />
                {description || 'Survey description will appear here...'}
              </div>

              {/* Current Question Bubble */}
              {currentQ && (
                <div
                  style={{
                    background: '#202c33',
                    color: '#e9edef',
                    padding: '12px 14px',
                    borderRadius: '0 12px 12px 12px',
                    maxWidth: '90%',
                    fontSize: '13px',
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ color: '#00a884', fontWeight: 700, fontSize: '11px', marginBottom: '4px' }}>
                    Q{activeQuestionIndex + 1}/{questions.length}
                  </div>
                  <div>{currentQ.text || 'Question text...'}</div>

                  {/* Choice Buttons Preview */}
                  {currentQ.type === 'choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                      {currentQ.options.map((opt, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#111b21',
                            color: '#00a884',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '12px',
                            border: '1px solid #00a884',
                          }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rating Preview */}
                  {currentQ.type === 'rating' && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '10px', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ fontSize: '18px' }}>⭐</span>
                      ))}
                    </div>
                  )}

                  {/* Yes/No Preview */}
                  {currentQ.type === 'yes_no' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <div style={{ flex: 1, background: '#111b21', color: '#00a884', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 600, fontSize: '12px', border: '1px solid #00a884' }}>
                        ✅ Yes
                      </div>
                      <div style={{ flex: 1, background: '#111b21', color: '#ea4335', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 600, fontSize: '12px', border: '1px solid #ea4335' }}>
                        ❌ No
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Note */}
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#8696a0' }}>
              🔒 Powered by Meta WhatsApp Cloud API
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
