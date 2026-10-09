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
  Delete01Icon,
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
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-3.5 font-sans text-[13px] font-medium text-primary-foreground transition-all duration-150 hover:opacity-[0.85] disabled:cursor-default disabled:opacity-50'
const BTN_SECONDARY_SM =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-foreground transition-all duration-150 hover:bg-muted'
const BTN_DESTRUCTIVE =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md bg-destructive-soft px-3.5 font-sans text-[13px] font-medium text-destructive transition-all duration-150 hover:opacity-[0.85] disabled:cursor-default disabled:opacity-50'
const BTN_GHOST_SM =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 font-sans text-[13px] font-medium text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground'
const CARD = 'rounded-lg border border-border bg-card p-6 text-card-foreground'
const INPUT =
  'h-9 w-full rounded-md border border-input bg-transparent px-3.5 font-sans text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
const TEXTAREA =
  'min-h-[5.5rem] w-full rounded-md border border-input bg-transparent px-3.5 py-2.5 font-sans text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y'
const LABEL = 'text-[13px] font-medium text-muted-foreground'

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
          <Link href="/surveys" className="mb-1 inline-block text-[13px] text-muted-foreground">
            ← Back to Surveys
          </Link>
          <h1 className="text-[32px] font-bold leading-none tracking-[-0.01em] text-foreground">Create WhatsApp Survey</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-3">
            {confirmingDelete ? (
              <>
                <button onClick={() => setConfirmingDelete(false)} className={BTN_GHOST_SM} disabled={publishing}>
                  Keep
                </button>
                <button onClick={() => router.push('/surveys')} className={BTN_DESTRUCTIVE} disabled={publishing}>
                  <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={2} />
                  Confirm delete
                </button>
              </>
            ) : (
              <button onClick={() => setConfirmingDelete(true)} className={BTN_DESTRUCTIVE} disabled={publishing}>
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
            <div className="text-[13px] text-destructive">{publishError}</div>
          )}
        </div>
      </div>

      {/* Main Grid: Form + Live WhatsApp Phone Preview */}
      <div className="grid gap-6 max-xl:grid-cols-1 xl:grid-cols-[1fr_400px]">
        {/* Left Side — Builder Form */}
        <div className="flex flex-col gap-6">
          {/* Survey Details Card */}
          <div className={CARD}>
            <h3 className="mb-4 text-[15px] font-semibold text-foreground">
              Survey details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>Survey title</label>
                <input
                  type="text"
                  className={INPUT}
                  placeholder="e.g. Engineering Student Experience — 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>Description / greeting message</label>
                <textarea
                  className={TEXTAREA}
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
              <h3 className="text-[15px] font-semibold text-foreground">
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
                  className={`inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md px-3.5 font-sans text-[13px] font-medium transition-colors duration-150 ${
                    activeQuestionIndex === idx
                      ? 'bg-primary-soft text-green-text'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>

            {/* Active Question Editor */}
            {currentQ && (
              <div className="rounded-md bg-muted-soft p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-text">
                    Question #{activeQuestionIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(activeQuestionIndex)}
                      className={BTN_DESTRUCTIVE}
                    >
                      Delete question
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL}>Question text</label>
                    <input
                      type="text"
                      className={INPUT}
                      placeholder="Enter question text..."
                      value={currentQ.text}
                      onChange={(e) => updateQuestion(activeQuestionIndex, { text: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL}>Response type</label>
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
                      <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                        <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2} />
                      </span>
                    </div>
                  </div>

                  {/* Options editor for Choice type */}
                  {currentQ.type === 'choice' && (
                    <div className="mt-2 flex flex-col gap-3">
                      <label className={LABEL}>Answer options (max 10)</label>
                      {currentQ.options.map((opt, oIdx) => (
                        <div key={oIdx} className="grid grid-cols-[20px_1fr_auto] items-center gap-3">
                          <span className="flex w-5 items-center text-[13px] text-muted-foreground">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <input
                            type="text"
                            className={INPUT}
                            value={opt}
                            onChange={(e) => updateOption(activeQuestionIndex, oIdx, e.target.value)}
                          />
                          {currentQ.options.length > 2 && (
                            <button
                              onClick={() => removeOption(activeQuestionIndex, oIdx)}
                              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
                              aria-label="Delete option"
                            >
                              <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={1.5} color="currentColor" />
                            </button>
                          )}
                        </div>
                      ))}
                      {currentQ.options.length < 10 && (
                        <button
                          onClick={() => addOption(activeQuestionIndex)}
                          className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-md bg-transparent px-3 py-2 font-sans text-[13px] font-medium text-green-text transition-colors hover:bg-muted"
                        >
                          + Add option
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
