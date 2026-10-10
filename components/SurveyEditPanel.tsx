'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons'

const BTN = 'inline-flex items-center gap-2 whitespace-nowrap rounded-md font-sans font-semibold transition-all duration-150'
const BTN_SM = 'px-3.5 py-1.5 text-[13px]'

export default function SurveyEditPanel({
  surveyId,
  initialTitle,
  initialDescription,
  initialStatus,
}: {
  surveyId: string
  initialTitle: string
  initialDescription: string | null
  initialStatus: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription ?? '')
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEdit = () => {
    setTitle(initialTitle)
    setDescription(initialDescription ?? '')
    setStatus(initialStatus)
    setError(null)
    setEditing(true)
  }

  const save = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() === '' ? null : description.trim(),
          status,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save changes')
      setEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="break-words text-[22px] font-semibold tracking-tight text-foreground">{initialTitle}</h1>
          {initialStatus !== 'active' && (
            <span className="inline-flex shrink-0 rounded-full bg-foreground-soft px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {initialStatus.charAt(0).toUpperCase() + initialStatus.slice(1)}
            </span>
          )}
          <button
            onClick={startEdit}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-transparent bg-transparent px-2.5 font-sans text-[13px] font-medium text-muted-foreground transition-colors hover:bg-foreground-soft hover:text-foreground focus-visible:border-ring focus-visible:outline-none"
          >
            <HugeiconsIcon icon={Edit02Icon} size={14} strokeWidth={1.5} color="currentColor" />
            Edit
          </button>
        </div>
        {initialDescription && (
          <p className="mt-1 text-[13px] text-muted-foreground">{initialDescription}</p>
        )}
      </div>
    )
  }

  return (
    <div className="mt-1 max-w-[480px] rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Survey Title</label>
          <input
            type="text"
            className="w-full rounded-md border border-border-strong bg-surface-2 px-4 py-3 font-sans text-sm text-ink outline-none transition-all placeholder:text-ink-subtle focus:border-ink focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Description / Greeting Message</label>
          <textarea
            className="min-h-[100px] w-full resize-y rounded-md border border-border-strong bg-surface-2 px-4 py-3 font-sans text-sm text-ink outline-none transition-all placeholder:text-ink-subtle focus:border-ink focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Status</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-md border border-border-strong bg-surface-2 px-4 py-3 pr-10 font-sans text-sm text-ink outline-none transition-all focus:border-ink disabled:cursor-not-allowed disabled:opacity-50"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={saving}
            >
              <option value="draft">Draft</option>
              <option value="active">Active — Live Bot</option>
              <option value="closed">Closed</option>
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 text-ink-muted">
              <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2} />
            </span>
          </div>
        </div>

        {error && <div className="text-[13px] text-danger-fg">{error}</div>}

        <div className="flex gap-2">
          <button onClick={save} className={`${BTN} ${BTN_SM} bg-ink text-canvas hover:opacity-[0.82] disabled:cursor-default disabled:opacity-50`} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={() => setEditing(false)} className={`${BTN} ${BTN_SM} border border-border-strong bg-surface text-ink hover:bg-surface-2`} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
