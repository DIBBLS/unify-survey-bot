'use client'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ZapIcon } from '@hugeicons/core-free-icons'
import ThemeToggle from './ThemeToggle'

export default function Topbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface px-8" style={{ left: 'var(--sidebar-width)' }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-tint px-2.5 py-1 text-xs font-semibold tracking-[0.02em] text-accent-fg before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-accent-deep before:animate-pulse-dot before:content-['']">WhatsApp Live</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href="/surveys/new" className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-ink px-3.5 py-1.5 font-sans text-[13px] font-semibold text-canvas transition-all duration-150 hover:opacity-[0.82]">
          <HugeiconsIcon icon={ZapIcon} size={14} strokeWidth={2} />
          <span>Create Survey</span>
        </Link>
      </div>
    </header>
  )
}
