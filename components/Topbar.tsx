'use client'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ZapIcon } from '@hugeicons/core-free-icons'
import ThemeToggle from './ThemeToggle'

export default function Topbar() {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 'var(--sidebar-width)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-active">WhatsApp Live</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggle />
        <Link href="/surveys/new" className="btn btn-primary btn-sm">
          <HugeiconsIcon icon={ZapIcon} size={14} strokeWidth={2} />
          <span>Create Survey</span>
        </Link>
      </div>
    </header>
  )
}
