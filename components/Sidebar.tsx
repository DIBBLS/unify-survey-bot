'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Surveys', href: '/surveys', icon: '📋' },
  { name: 'New Survey', href: '/surveys/new', icon: '➕' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 800,
            fontSize: '18px',
            boxShadow: '0 0 16px var(--green-glow)',
          }}
        >
          U
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Unify
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Survey Bot
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--green)' : 'var(--text-secondary)',
                background: isActive ? 'var(--green-dim)' : 'transparent',
                border: isActive ? '1px solid rgba(37,211,102,0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Profile / Campus Badge */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--purple-dim)',
            color: 'var(--purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
          }}
        >
          EG
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Engineering Admin
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            WhatsApp Connected
          </div>
        </div>
      </div>
    </aside>
  )
}
