'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Rocket01Icon,
  Add01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  Delete02Icon,
  WavingHand01Icon,
  StarIcon,
  CheckmarkCircle02Icon,
  LockIcon,
} from '@hugeicons/core-free-icons'

interface DraftQuestion {
  id: string
  text: string
  type: 'choice' | 'rating' | 'yes_no' | 'text'
  options: string[]
}

const BTN_PRIMARY =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-ink px-6 py-3 font-sans text-sm font-semibold text-canvas transition-all duration-150 hover:opacity-[0.82] disabled:cursor-default disabled:opacity-50'
const BTN_SECONDARY_SM =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-border-strong bg-surface px-3.5 py-1.5 font-sans text-[13px] font-semibold text-ink transition-all duration-150 hover:bg-surface-2'
const BTN_DANGER =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-danger/20 bg-danger-tint px-6 py-3 font-sans text-sm font-semibold text-danger-fg transition-all duration-150 hover:bg-danger/[0.14] disabled:cursor-default disabled:opacity-50'
const BTN_DANGER_SM =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-danger/20 bg-danger-tint px-3.5 py-1.5 font-sans text-[13px] font-semibold text-danger-fg transition-all duration-150 hover:bg-danger/[0.14] disabled:cursor-default disabled:opacity-50'
const BTN_GHOST_SM =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 py-2 font-sans text-[13px] font-semibold text-ink-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink'
const CARD = 'rounded-lg border border-border bg-surface p-6 shadow-card'
const INPUT =
  'w-full rounded-md border border-border-strong bg-surface-2 px-4 py-3 font-sans text-sm text-ink outline-none transition-all placeholder:text-ink-subtle focus:border-ink focus:shadow-[0_0_0_3px_var(--green-tint)] disabled:cursor-not-allowed disabled:opacity-50'
const LABEL = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted'

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
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

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

  const handlePublish = async () => {
    if (!title.trim()) {
      setPublishError('Please enter a survey title')
      return
    }
    if (questions.some((q) => !q.text.trim())) {
      setPublishError('Every question needs text')
      return
    }

    setPublishing(true)
    setPublishError(null)

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          questions: questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.type === 'choice' ? q.options : [],
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to publish survey')

      router.push(`/surveys/${data.survey.id}`)
    } catch (err: any) {
      setPublishError(err.message)
      setPublishing(false)
    }
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/surveys" className="mb-1 inline-block text-[13px] text-ink-muted">
            ← Back to Surveys
          </Link>
          <h1 className="font-display text-[32px] font-black leading-none tracking-[-1px] text-ink">Create WhatsApp Survey</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-3">
            {confirmingDelete ? (
              <>
                <button onClick={() => setConfirmingDelete(false)} className={BTN_GHOST_SM} disabled={publishing}>
                  Keep
                </button>
                <button onClick={() => router.push('/surveys')} className={BTN_DANGER} disabled={publishing}>
                  <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={2} />
                  Confirm delete
                </button>
              </>
            ) : (
              <button onClick={() => setConfirmingDelete(true)} className={BTN_DANGER} disabled={publishing}>
                <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={2} />
                Delete
              </button>
            )}
            <button onClick={handlePublish} className={BTN_PRIMARY} disabled={publishing}>
              {publishing ? (
                'Publishing…'
              ) : (
                <>
                  <HugeiconsIcon icon={Rocket01Icon} size={16} strokeWidth={2} />
                  Publish Survey Bot
                </>
              )}
            </button>
          </div>
          {publishError && (
            <div className="text-[13px] text-danger">{publishError}</div>
          )}
        </div>
      </div>

      {/* Main Grid: Form + Live WhatsApp Phone Preview */}
      <div className="grid gap-6 max-xl:grid-cols-1 xl:grid-cols-[1fr_400px]">
        {/* Left Side — Builder Form */}
        <div className="flex flex-col gap-6">
          {/* Survey Details Card */}
          <div className={CARD}>
            <h3 className="mb-4 text-base font-bold">
              Survey Details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>Survey Title</label>
                <input
                  type="text"
                  className={INPUT}
                  placeholder="e.g. Engineering Student Experience — 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>Description / Greeting Message</label>
                <textarea
                  className={`${INPUT} min-h-[100px] resize-y`}
                  placeholder="e.g. We are trying to understand what makes school difficult. Takes 2 minutes!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className={CARD}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-bold">
                Questions ({questions.length})
              </h3>
              <button onClick={addQuestion} className={BTN_SECONDARY_SM}>
                <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2.5} />
                Add Question
              </button>
            </div>

            {/* Question Selector Tabs */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-3.5 py-1.5 font-sans text-[13px] font-semibold transition-all duration-150 ${
                    activeQuestionIndex === idx
                      ? 'border-accent-line bg-accent-tint text-accent-fg'
                      : 'border-transparent bg-tag text-ink-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>

            {/* Active Question Editor */}
            {currentQ && (
              <div className="rounded-md border border-border bg-surface-2 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-accent-fg">
                    Question #{activeQuestionIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(activeQuestionIndex)}
                      className={BTN_DANGER_SM}
                    >
                      Delete Question
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL}>Question Text</label>
                    <input
                      type="text"
                      className={INPUT}
                      placeholder="Enter question text..."
                      value={currentQ.text}
                      onChange={(e) => updateQuestion(activeQuestionIndex, { text: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL}>Response Type</label>
                    <div className="relative">
                      <select
                        className={`${INPUT} appearance-none pr-10`}
                        value={currentQ.type}
                        onChange={(e) => updateQuestion(activeQuestionIndex, { type: e.target.value as any })}
                      >
                        <option value="choice">Multiple Choice (Interactive Buttons/List)</option>
                        <option value="rating">Rating (1 to 5 Stars)</option>
                        <option value="yes_no">Yes / No Poll</option>
                        <option value="text">Open Text Response</option>
                      </select>
                      <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 text-ink-muted">
                        <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2} />
                      </span>
                    </div>
                  </div>

                  {/* Options editor for Choice type */}
                  {currentQ.type === 'choice' && (
                    <div className="mt-2 flex flex-col gap-2.5">
                      <label className={LABEL}>Answer Options (Max 10)</label>
                      {currentQ.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-2">
                          <span className="flex w-6 items-center text-[13px] text-ink-muted">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <input
                            type="text"
                            className={`${INPUT} flex-1`}
                            value={opt}
                            onChange={(e) => updateOption(activeQuestionIndex, oIdx, e.target.value)}
                          />
                          {currentQ.options.length > 2 && (
                            <button
                              onClick={() => removeOption(activeQuestionIndex, oIdx)}
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 py-2 font-sans text-[13px] font-semibold text-danger transition-all duration-150 hover:bg-surface-2"
                              aria-label="Remove option"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      ))}
                      {currentQ.options.length < 10 && (
                        <button
                          onClick={() => addOption(activeQuestionIndex)}
                          className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-md bg-transparent px-3 py-2 font-sans text-[13px] font-semibold text-accent transition-all duration-150 hover:bg-surface-2"
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
            className="sticky top-[84px] rounded-3xl border border-[#1f2c34] bg-[#0b141a] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
          >
            {/* WhatsApp Top bar simulator */}
            <div className="mb-4 flex items-center gap-2.5 border-b border-[#1f2c34] pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#128C7E] text-sm font-extrabold text-white">
                U
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#e9edef]">
                  Unify Bot
                </div>
                <div className="text-[10px] text-[#8696a0]">official business account</div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex min-h-[340px] flex-col gap-3">
              {/* Bot Greeting Bubble */}
              <div className="max-w-[85%] rounded-[0_12px_12px_12px] bg-[#202c33] px-3.5 py-2.5 text-[13px] leading-[1.4] text-[#e9edef] shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                <strong>
                  <span className="mr-1 inline-flex align-middle">
                    <HugeiconsIcon icon={WavingHand01Icon} size={14} strokeWidth={1.8} />
                  </span>
                  {title || 'Survey Title'}
                </strong>
                <br />
                {description || 'Survey description will appear here...'}
              </div>

              {/* Current Question Bubble */}
              {currentQ && (
                <div className="max-w-[90%] rounded-[0_12px_12px_12px] bg-[#202c33] px-3.5 py-3 text-[13px] leading-[1.4] text-[#e9edef]">
                  <div className="mb-1 text-[11px] font-bold text-[#00a884]">
                    Q{activeQuestionIndex + 1}/{questions.length}
                  </div>
                  <div>{currentQ.text || 'Question text...'}</div>

                  {/* Choice Buttons Preview */}
                  {currentQ.type === 'choice' && (
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      {currentQ.options.map((opt, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-[#00a884] bg-[#111b21] px-3 py-2 text-center text-xs font-semibold text-[#00a884]"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rating Preview */}
                  {currentQ.type === 'rating' && (
                    <div className="mt-2.5 flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <HugeiconsIcon key={star} icon={StarIcon} size={18} strokeWidth={1.8} color="#FFC107" />
                      ))}
                    </div>
                  )}

                  {/* Yes/No Preview */}
                  {currentQ.type === 'yes_no' && (
                    <div className="mt-2.5 flex gap-2">
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#00a884] bg-[#111b21] p-2 text-center text-xs font-semibold text-[#00a884]">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={2} />
                        Yes
                      </div>
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#ea4335] bg-[#111b21] p-2 text-center text-xs font-semibold text-[#ea4335]">
                        <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
                        No
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Note */}
            <div className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-[#8696a0]">
              <HugeiconsIcon icon={LockIcon} size={11} strokeWidth={2} />
              Powered by Meta WhatsApp Cloud API
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
