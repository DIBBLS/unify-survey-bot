'use client'

import Link from 'next/link'

export default function Topbar() {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 'var(--sidebar-width)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
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
        <Link href="/surveys/new" className="btn btn-primary btn-sm">
          <span>⚡ Create Survey</span>
        </Link>
      </div>
    </header>
  )
}
