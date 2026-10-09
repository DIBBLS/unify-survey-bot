'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('theme')
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(getStoredTheme() ?? getSystemTheme())
    setMounted(true)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private browsing or storage disabled — theme still applies for this
      // page load, it just won't persist across visits.
    }
  }

  // Avoid a hydration mismatch: render nothing meaningful until the client
  // has read localStorage/system preference.
  if (!mounted) {
    return <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3.5 py-1.5 font-sans text-[13px] font-semibold text-ink-muted" aria-label="Toggle theme" style={{ width: '32px' }} />
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 py-2 font-sans text-sm font-semibold text-ink-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
