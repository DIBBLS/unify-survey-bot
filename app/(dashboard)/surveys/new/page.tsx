'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  Delete01Icon,
  WavingHand01Icon,
  StarIcon,
  CheckmarkCircle02Icon,
  LockIcon,
} from '@hugeicons/core-free-icons'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface DraftQuestion {
  id: string
  text: string
  type: 'choice' | 'rating' | 'yes_no' | 'text'
  options: string[]
}

const INITIAL_QUESTIONS: DraftQuestion[] = [
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
]

const BTN_PRIMARY =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-primary px-3.5 font-sans text-[13px] font-medium text-primary-foreground transition-all duration-150 hover:opacity-[0.85] disabled:cursor-default disabled:opacity-50 focus-visible:border-ring focus-visible:outline-none'
const BTN_GHOST_SM =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-transparent px-3.5 font-sans text-[13px] font-medium text-muted-foreground transition-all duration-150 hover:bg-foreground-soft hover:text-foreground focus-visible:border-ring focus-visible:outline-none'
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
  const [questions, setQuestions] = useState<DraftQuestion[]>(INITIAL_QUESTIONS)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)

  const isDirty =
    title.trim() !== '' ||
    description.trim() !== '' ||
    JSON.stringify(questions) !== JSON.stringify(INITIAL_QUESTIONS)

  const handleDiscard = () => {
    if (isDirty) {
      setDiscardOpen(true)
    } else {
      router.push('/surveys')
    }
  }

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
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Create WhatsApp survey</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Build the questions, check the chat preview, then publish the bot.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleDiscard} className={BTN_GHOST_SM} disabled={publishing}>
            Discard
          </button>
          <button onClick={handlePublish} className={BTN_PRIMARY} disabled={publishing}>
            {publishing ? 'Publishing…' : 'Publish survey'}
          </button>
        </div>
      </div>
      {publishError && (
        <div className="mb-4 text-[13px] text-destructive">{publishError}</div>
      )}
      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Discard changes?"
        description="Your unsaved changes will be lost."
        confirmLabel="Discard changes"
        onConfirm={() => router.push('/surveys')}
      />

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 gap-5 min-[960px]:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Side — Builder Form */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Survey Details Card */}
          <div className={CARD}>
            <h3 className="text-[15px] font-semibold text-foreground">
              Survey details
            </h3>
            <div className="mt-4 flex flex-col">
              <label className={`${LABEL} mb-2`}>Survey title</label>
              <input
                type="text"
                className={INPUT}
                placeholder="e.g. Engineering Student Experience — 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-col">
              <label className={`${LABEL} mb-2`}>Greeting message</label>
              <textarea
                className={TEXTAREA}
                placeholder="e.g. We are trying to understand what makes school difficult. Takes 2 minutes!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Sent as the first message in the chat.
              </p>
            </div>
          </div>

          {/* Questions Section */}
          <div className={CARD}>
            <h3 className="text-[15px] font-semibold text-foreground">
              Questions ({questions.length})
            </h3>

            {/* Question Selector Tabs */}
            <div className="mb-5 mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-transparent px-3.5 font-sans text-[13px] font-medium transition-colors duration-150 focus-visible:border-ring focus-visible:outline-none ${
                    activeQuestionIndex === idx
                      ? 'bg-primary-soft text-green-text'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Q{idx + 1}
                </button>
              ))}
              <button
                onClick={addQuestion}
                aria-label="Add question"
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-transparent bg-muted px-3.5 text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:border-ring focus-visible:outline-none"
              >
                <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={1.5} color="currentColor" />
              </button>
            </div>

            {/* Active Question Editor */}
            {currentQ && (
              <div className="border-t border-border pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">
                    Question {activeQuestionIndex + 1} of {questions.length}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(activeQuestionIndex)}
                      aria-label="Delete question"
                      className="inline-flex size-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-destructive-faint hover:text-destructive focus-visible:border-ring focus-visible:outline-none"
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={1.5} color="currentColor" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <label className={`${LABEL} mb-2`}>Question text</label>
                    <input
                      type="text"
                      className={INPUT}
                      placeholder="Enter question text..."
                      value={currentQ.text}
                      onChange={(e) => updateQuestion(activeQuestionIndex, { text: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className={`${LABEL} mb-2`}>Response type</label>
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
                              className="inline-flex size-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-destructive-faint hover:text-destructive focus-visible:border-ring focus-visible:outline-none"
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
                          className="mt-2 inline-flex items-center gap-2 self-start whitespace-nowrap rounded-md border border-transparent bg-transparent px-3 py-2 font-sans text-[13px] font-medium text-green-text transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none"
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

        {/* Right Side — Live Preview */}
        <div className="min-[960px]:sticky min-[960px]:top-5 min-[960px]:self-start">
          <div className={CARD}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-foreground">
                Live preview
              </h3>
              <span className="text-[13px] text-muted-foreground">
                Question {activeQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Chat header */}
            <div className="mb-4 flex items-center gap-2.5 border-b border-border pb-4">
              <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-primary-deep text-sm font-bold text-green-text">
                U
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  Unify Bot
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  Official business account
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex min-h-[340px] flex-col gap-3">
              {/* Greeting Bubble */}
              <div className="rounded-md rounded-tl-[2px] bg-foreground-wash px-3 py-2.5 text-[13px] leading-[1.4]">
                <div className="font-semibold">
                  <span className="mr-1 inline-flex align-middle">
                    <HugeiconsIcon icon={WavingHand01Icon} size={14} strokeWidth={1.5} color="currentColor" />
                  </span>
                  {title || 'Survey title'}
                </div>
                <div className="mt-0.5">
                  {description || 'Survey description will appear here…'}
                </div>
              </div>

              {/* Current Question Bubble */}
              {currentQ && (
                <>
                  <div className="rounded-md rounded-tl-[2px] bg-foreground-wash px-3 py-2.5 text-[13px] leading-[1.4]">
                    <div className="mb-1 text-[11px] font-semibold text-green-text">
                      Q{activeQuestionIndex + 1}/{questions.length}
                    </div>
                    <div>{currentQ.text || 'Question text...'}</div>
                  </div>

                  {/* Choice Buttons Preview */}
                  {currentQ.type === 'choice' && (
                    <div className="flex flex-col gap-1.5">
                      {currentQ.options.map((opt, i) => (
                        <div
                          key={i}
                          className="rounded-md border border-border bg-transparent px-3 py-2 text-center text-[13px] font-medium text-green-text"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rating Preview */}
                  {currentQ.type === 'rating' && (
                    <div className="flex max-w-[88%] justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <HugeiconsIcon key={star} icon={StarIcon} size={18} strokeWidth={1.5} color="currentColor" />
                      ))}
                    </div>
                  )}

                  {/* Yes/No Preview */}
                  {currentQ.type === 'yes_no' && (
                    <div className="flex gap-1.5">
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-green-text bg-transparent p-2 text-center text-[13px] font-medium text-green-text">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={1.5} color="currentColor" />
                        Yes
                      </div>
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-destructive bg-transparent p-2 text-center text-[13px] font-medium text-destructive">
                        <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.5} color="currentColor" />
                        No
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-center gap-1 border-t border-border pt-3 text-center text-[11px] text-muted-foreground">
              <HugeiconsIcon icon={LockIcon} size={11} strokeWidth={1.5} color="currentColor" />
              Powered by Meta WhatsApp Cloud API
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
