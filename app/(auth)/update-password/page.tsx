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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '20px',
      }}
    >
      <div
        className="glass-card animate-fade-up"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="wordmark" style={{ fontSize: '32px', lineHeight: '32px', marginBottom: '12px' }}>
            Unify<span className="dot">.</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Choose a new password for your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <div style={{ fontSize: '13px', color: 'var(--red)' }}>
              {error}
              {error.toLowerCase().includes('session') && (
                <>
                  {' '}
                  <a href="/login" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                    Request a new reset link
                  </a>
                  .
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
