'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Mail01Icon, LockPasswordIcon } from '@hugeicons/core-free-icons'

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
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const switchMode = (next: 'signin' | 'signup' | 'reset') => {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setInfo(null)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (oauthError) setError(oauthError.message)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const supabase = createClient()

    try {
      if (mode === 'reset') {
        const { error: resetError } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
          }),
          AUTH_TIMEOUT_MS
        )
        if (resetError) {
          setError(resetError.message)
          return
        }
        setInfo('Check your email for a password reset link.')
        return
      }

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
    <div className="relative flex min-h-screen items-center justify-center bg-canvas p-5">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div
        className="flex w-full max-w-[420px] animate-fade-up flex-col gap-6 rounded-lg border border-border bg-surface p-9 shadow-card transition-all hover:border-border-strong hover:shadow-hover"
      >
        <div className="text-center">
          <div className="mb-3 font-display text-[32px] font-black leading-8">
            Unify<span className="text-accent">.</span>
          </div>
          <h1 className="text-[15px] font-semibold text-ink-muted">
            Survey Bot
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {mode === 'signin' && 'Log in to manage your WhatsApp feedback surveys'}
            {mode === 'signup' && 'Create a workspace to start building WhatsApp surveys'}
            {mode === 'reset' && "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {mode !== 'reset' && (
          <>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="secondary"
              style={{ width: '100%', justifyContent: 'center', gap: '10px' }}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-ink-subtle">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Email Address</label>
            <Input
              type="email"
              placeholder="admin@unify.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={2} />}
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<HugeiconsIcon icon={LockPasswordIcon} size={16} strokeWidth={2} />}
                minLength={6}
                required
              />
              {mode === 'signin' && (
                <Button
                  type="button"
                  onClick={() => switchMode('reset')}
                  variant="ghost"
                  style={{ fontSize: '12px', color: 'var(--muted-foreground)', padding: '2px 0', justifyContent: 'flex-end', alignSelf: 'flex-end' }}
                >
                  Forgot password?
                </Button>
              )}
            </div>
          )}

          {error && (
            <div className="text-[13px] text-danger">{error}</div>
          )}
          {info && (
            <div className="text-[13px] text-accent">{info}</div>
          )}

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            loading={loading}
            disabled={loading}
          >
            {loading
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign In to Workspace'
                : mode === 'signup'
                  ? 'Create Workspace'
                  : 'Send Reset Link'}
          </Button>
        </form>

        {mode === 'reset' ? (
          <Button
            onClick={() => switchMode('signin')}
            variant="ghost"
            style={{ justifyContent: 'center', fontSize: '13px' }}
          >
            Back to sign in
          </Button>
        ) : (
          <Button
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            variant="ghost"
            style={{ justifyContent: 'center', fontSize: '13px' }}
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Button>
        )}

        <div className="text-center text-xs text-ink-subtle">
          Powered by Meta WhatsApp Cloud API & Supabase
        </div>
      </div>
    </div>
  )
}
