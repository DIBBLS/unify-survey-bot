'use client'

import React, { useState } from 'react'

export default function SettingsPage() {
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [verifyToken, setVerifyToken] = useState('unify_survey_bot_verify_token')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & Meta Setup</h1>
          <p className="page-subtitle">
            Configure your Meta WhatsApp Cloud API credentials and webhook integration.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Credentials Form Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Meta Cloud API Credentials
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 104928104820192"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Found in Meta Developer Console under WhatsApp → API Setup
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">System User Permanent Access Token</label>
              <input
                type="password"
                className="form-input"
                placeholder="EAAG..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Webhook Verify Token</label>
              <input
                type="text"
                className="form-input"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Use this token when configuring the Webhook URL in Meta App Console
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary">
                💾 Save Credentials
              </button>
              {saved && (
                <span style={{ color: 'var(--green)', fontSize: '13px', fontWeight: 600 }}>
                  ✓ Settings saved!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Webhook Endpoint Info */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Your Webhook Endpoint URL
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Paste this URL into your Meta WhatsApp App Configuration:
          </p>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>https://your-domain.vercel.app/api/webhook</span>
            <button
              onClick={() => navigator.clipboard.writeText('https://your-domain.vercel.app/api/webhook')}
              className="btn btn-ghost btn-sm"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Quick Meta Setup Guide */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            📖 How to Connect Your WhatsApp Number (Step-by-Step)
          </h3>

          <ol style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Create a Meta App:</strong> Go to{' '}
              <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                developers.facebook.com
              </a>{' '}
              → Create App → Business Type → Add <strong>WhatsApp</strong> product.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Add Phone Number:</strong> In WhatsApp → API Setup, connect your test or official WhatsApp Business number.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Configure Webhook:</strong> Go to WhatsApp → Configuration → Edit Webhook. Enter your Vercel URL and Verify Token. Subscribe to <code style={{ color: 'var(--green)' }}>messages</code> events.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Test Your Survey:</strong> Send your WhatsApp link to any student or phone number and watch responses flow into your dashboard live!
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
