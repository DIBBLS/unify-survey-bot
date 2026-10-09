'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { PencilEdit02Icon } from '@hugeicons/core-free-icons'

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 className="page-title">{initialTitle}</h1>
          <span className={`badge badge-${initialStatus === 'active' ? 'active' : initialStatus === 'closed' ? 'closed' : 'draft'}`}>
            {initialStatus === 'active' ? 'Live Bot' : initialStatus}
          </span>
          <button onClick={startEdit} className="btn btn-ghost btn-sm">
            <HugeiconsIcon icon={PencilEdit02Icon} size={14} strokeWidth={2} />
            Edit
          </button>
        </div>
        <p className="page-subtitle">{initialDescription || 'No description'}</p>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ padding: '20px', maxWidth: '480px', marginTop: '4px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-group">
          <label className="form-label">Survey Title</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description / Greeting Message</label>
          <textarea
            className="form-input form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
          >
            <option value="draft">Draft</option>
            <option value="active">Active — Live Bot</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {error && <div style={{ fontSize: '13px', color: 'var(--red-text)' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={save} className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={() => setEditing(false)} className="btn btn-secondary btn-sm" disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
