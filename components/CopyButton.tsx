'use client'

import { useState } from 'react'

export default function CopyButton({
  text,
  label = '🔗 Copy WA Link',
  copiedLabel = '✓ Copied',
  className = 'btn btn-secondary btn-sm',
  style,
}: {
  text: string
  label?: string
  copiedLabel?: string
  className?: string
  style?: React.CSSProperties
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} className={className} style={style}>
      {copied ? copiedLabel : label}
    </button>
  )
}
