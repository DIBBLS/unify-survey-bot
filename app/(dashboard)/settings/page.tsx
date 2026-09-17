import { headers } from 'next/headers'
import CopyButton from '@/components/CopyButton'

function isConfigured(name: string) {
  const value = process.env[name]
  return Boolean(value && !value.startsWith('placeholder'))
}

export default function SettingsPage() {
  const host = headers().get('host') ?? 'your-site.netlify.app'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
  const webhookUrl = `${siteUrl}/api/webhook`

  const checks = [
    { label: 'Supabase URL', env: 'NEXT_PUBLIC_SUPABASE_URL' },
    { label: 'Supabase anon key', env: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' },
    { label: 'Supabase service role key', env: 'SUPABASE_SERVICE_ROLE_KEY' },
    { label: 'WhatsApp phone number ID', env: 'WHATSAPP_PHONE_NUMBER_ID' },
    { label: 'WhatsApp access token', env: 'WHATSAPP_ACCESS_TOKEN' },
    { label: 'WhatsApp app secret (webhook verification)', env: 'WHATSAPP_APP_SECRET' },
    { label: 'Public WhatsApp number (wa.me links)', env: 'NEXT_PUBLIC_WHATSAPP_NUMBER' },
  ]

  return (
    <div className="animate-fade-up" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & Meta Setup</h1>
          <p className="page-subtitle">
            Meta WhatsApp Cloud API and Supabase credentials live in environment variables,
            not in this page — that keeps long-lived secrets out of the database entirely.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Configuration Status
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Set these in <code style={{ color: 'var(--green)' }}>.env.local</code> for local
            development, or in your Netlify site's Environment Variables for production.
            Values themselves are never shown here.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checks.map((check) => {
              const configured = isConfigured(check.env)
              return (
                <div key={check.env} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{check.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{check.env}</div>
                  </div>
                  <span className={`badge badge-${configured ? 'active' : 'closed'}`}>
                    {configured ? 'Configured' : 'Missing'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

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
              gap: '12px',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{webhookUrl}</span>
            <CopyButton text={webhookUrl} label="Copy" copiedLabel="✓ Copied" className="btn btn-ghost btn-sm" />
          </div>
        </div>

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
              <strong style={{ color: 'var(--text-primary)' }}>Add Phone Number:</strong> In WhatsApp → API Setup, connect your
              test or official WhatsApp Business number. Copy its Phone Number ID and permanent access
              token into your environment variables (not this page).
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Configure Webhook:</strong> Go to WhatsApp → Configuration → Edit
              Webhook. Enter the URL above and your <code style={{ color: 'var(--green)' }}>WHATSAPP_VERIFY_TOKEN</code>.
              Subscribe to <code style={{ color: 'var(--green)' }}>messages</code> events.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Test Your Survey:</strong> Send your WhatsApp link to any
              student or phone number and watch responses flow into your dashboard live.
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
