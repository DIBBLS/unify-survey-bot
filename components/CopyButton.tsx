'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link01Icon, Tick01Icon } from '@hugeicons/core-free-icons'

export default function CopyButton({
  text,
  label = (
    <>
      <HugeiconsIcon icon={Link01Icon} size={14} strokeWidth={2} />
      Copy WA Link
    </>
  ),
  copiedLabel = (
    <>
      <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2.5} />
      Copied
    </>
  ),
  className = 'inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-border-strong bg-surface px-3.5 py-1.5 font-sans text-[13px] font-semibold text-ink transition-all duration-150 hover:bg-surface-2',
  style,
}: {
  text: string
  label?: React.ReactNode
  copiedLabel?: React.ReactNode
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
