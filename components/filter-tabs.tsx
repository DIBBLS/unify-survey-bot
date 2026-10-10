'use client'

import Link from 'next/link'
import { useRef } from 'react'

const TABS = ['all', 'active', 'draft', 'closed'] as const

export function FilterTabs({
  counts,
  active,
}: {
  counts: Record<string, number>
  active: string
}) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    if (next !== null) {
      e.preventDefault()
      refs.current[next]?.focus()
    }
  }

  return (
    <div role="tablist" aria-label="Filter surveys by status" className="mb-5 flex flex-wrap gap-2">
      {TABS.map((tab, i) => {
        const isActive = active === tab
        return (
          <Link
            key={tab}
            ref={(el) => {
              refs.current[i] = el
            }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            href={tab === 'all' ? '/surveys' : `/surveys?status=${tab}`}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`inline-flex h-8 items-center whitespace-nowrap rounded-md border border-transparent px-3.5 font-sans text-[13px] font-medium motion-safe:transition-colors focus-visible:border-ring focus-visible:outline-none ${
              isActive
                ? 'bg-primary-soft text-green-text'
                : 'bg-transparent text-muted-foreground hover:bg-foreground-mist hover:text-foreground'
            }`}
          >
            <span className="capitalize">{tab}</span>
            <span className="ml-1.5 text-xs opacity-75">{counts[tab] ?? 0}</span>
          </Link>
        )
      })}
    </div>
  )
}
