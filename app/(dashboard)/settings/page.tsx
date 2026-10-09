import Link from 'next/link'
import { headers } from 'next/headers'
import CopyButton from '@/components/CopyButton'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, Tick01Icon, BookOpen01Icon } from '@hugeicons/core-free-icons'

function isConfigured(name: string) {
  const value = process.env[name]
  return Boolean(value && !value.startsWith('placeholder'))
}

const CARD =
  'rounded-lg border border-border bg-surface p-6 shadow-card transition-all hover:border-border-strong hover:shadow-hover'

export default async function SettingsPage() {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'your-project.vercel.app'
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
    { label: 'Public WhatsApp number (wa.me links)', env: 'WHATSAPP_NUMBER' },
  ]

  return (
    <div className="animate-fade-up max-w-[900px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] font-black leading-none tracking-[-1px] text-ink">Settings & Meta Setup</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Meta WhatsApp Cloud API and Supabase credentials live in environment variables,
            not in this page — that keeps long-lived secrets out of the database entirely.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className={CARD}>
          <h3 className="mb-4 text-base font-bold">
            Configuration Status
          </h3>
          <p className="mb-4 text-[13px] text-ink-muted">
            Set these in <code className="text-accent-fg">.env.local</code> for local
            development, or in your Vercel project&apos;s Environment Variables for production.
            Values themselves are never shown here.
          </p>

          <div className="flex flex-col gap-2.5">
            {checks.map((check) => {
              const configured = isConfigured(check.env)
              return (
                <div key={check.env} className="flex items-center justify-between rounded-md bg-tag px-3.5 py-2.5">
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{check.label}</div>
                    <div className="font-mono text-[11px] text-ink-muted">{check.env}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold tracking-[0.02em] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-[""] ${configured ? 'bg-accent-tint text-accent-fg before:animate-pulse-dot before:bg-accent-deep' : 'bg-danger-tint text-danger-fg before:bg-danger'}`}>
                    {configured ? 'Configured' : 'Missing'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className={CARD}>
          <h3 className="mb-3 text-base font-bold">
            Your Webhook Endpoint URL
          </h3>
          <p className="mb-4 text-[13px] text-ink-muted">
            Paste this URL into your Meta WhatsApp App Configuration:
          </p>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-4 py-3 font-mono text-[13px] text-accent-fg">
            <span className="overflow-hidden text-ellipsis">{webhookUrl}</span>
            <CopyButton
              text={webhookUrl}
              label={
                <>
                  <HugeiconsIcon icon={Copy01Icon} size={14} strokeWidth={2} />
                  Copy
                </>
              }
              copiedLabel={
                <>
                  <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2.5} />
                  Copied
                </>
              }
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 py-2 font-sans text-[13px] font-semibold text-ink-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink"
            />
          </div>
        </div>

        <div className={CARD}>
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
            <HugeiconsIcon icon={BookOpen01Icon} size={18} strokeWidth={2} />
            How to Connect Your WhatsApp Number (Step-by-Step)
          </h3>

          <ol className="flex flex-col gap-3 pl-5 text-sm text-ink-muted">
            <li>
              <strong className="text-ink">Create a Meta App:</strong> Go to{' '}
              <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-accent-fg underline">
                developers.facebook.com
              </a>{' '}
              → Create App → Business Type → Add <strong>WhatsApp</strong> product.
            </li>
            <li>
              <strong className="text-ink">Add Phone Number:</strong> In WhatsApp → API Setup, connect your
              test or official WhatsApp Business number. Copy its Phone Number ID and permanent access
              token into your environment variables (not this page).
            </li>
            <li>
              <strong className="text-ink">Configure Webhook:</strong> Go to WhatsApp → Configuration → Edit
              Webhook. Enter the URL above and your <code className="text-accent-fg">WHATSAPP_VERIFY_TOKEN</code>.
              Subscribe to <code className="text-accent-fg">messages</code> events.
            </li>
            <li>
              <strong className="text-ink">Test Your Survey:</strong> Send your WhatsApp link to any
              student or phone number and watch responses flow into your dashboard live.
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
