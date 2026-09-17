'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated auth flow
    router.push('/dashboard')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
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
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#000',
              fontWeight: 800,
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 24px var(--green-glow)',
            }}
          >
            U
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Unify Survey Bot
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Log in to manage your WhatsApp feedback surveys
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            Sign In to Workspace
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          Powered by Meta WhatsApp Cloud API & Supabase
        </div>
      </div>
    </div>
  )
}
