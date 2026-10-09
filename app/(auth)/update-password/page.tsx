'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-5">
      <div className="flex w-full max-w-[420px] animate-fade-up flex-col gap-6 rounded-lg border border-border bg-surface p-9 shadow-card transition-all hover:border-border-strong hover:shadow-hover">
        <div className="text-center">
          <div className="mb-3 font-display text-[32px] font-black leading-8">
            Unify<span className="text-accent">.</span>
          </div>
          <p className="mt-1 text-[13px] text-ink-muted">
            Choose a new password for your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">New Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-border-strong bg-surface-2 px-4 py-3 font-sans text-sm text-ink outline-none transition-all placeholder:text-ink-subtle focus:border-ink focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Confirm New Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-border-strong bg-surface-2 px-4 py-3 font-sans text-sm text-ink outline-none transition-all placeholder:text-ink-subtle focus:border-ink focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="text-[13px] text-danger-fg">
              {error}
              {error.toLowerCase().includes('session') && (
                <>
                  {' '}
                  <a href="/login" className="text-accent underline">
                    Request a new reset link
                  </a>
                  .
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-ink px-6 py-3 font-sans text-sm font-semibold text-canvas transition-all duration-150 hover:opacity-[0.82] disabled:cursor-default disabled:opacity-50 mt-2"
            disabled={loading}
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
