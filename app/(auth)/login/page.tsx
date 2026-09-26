'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const AUTH_TIMEOUT_MS = 15000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("That took too long — Supabase may be unreachable. Please try again.")), ms)
    }),
  ])
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const supabase = createClient()

    try {
      if (mode === 'signin') {
        const { error: signInError } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          AUTH_TIMEOUT_MS
        )
        if (signInError) {
          setError(signInError.message)
          return
        }
        router.push('/dashboard')
        router.refresh()
        return
      }

      const { data, error: signUpError } = await withTimeout(
        supabase.auth.signUp({ email, password }),
        AUTH_TIMEOUT_MS
      )
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      setInfo('Account created — check your email to confirm before signing in.')
      setMode('signin')
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
          <h1 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Survey Bot
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {mode === 'signin'
              ? 'Log in to manage your WhatsApp feedback surveys'
              : 'Create a workspace to start building WhatsApp surveys'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@unify.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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

          {error && (
            <div style={{ fontSize: '13px', color: 'var(--red)' }}>{error}</div>
          )}
          {info && (
            <div style={{ fontSize: '13px', color: 'var(--green)' }}>{info}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In to Workspace' : 'Create Workspace'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
            setInfo(null)
          }}
          className="btn btn-ghost"
          style={{ justifyContent: 'center', fontSize: '13px' }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-subtle)' }}>
          Powered by Meta WhatsApp Cloud API & Supabase
        </div>
      </div>
    </div>
  )
}
