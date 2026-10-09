'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Link01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { motion, useReducedMotion } from 'framer-motion'

const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export function CopyLinkButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <TooltipPrimitive.Root delayDuration={0}>
      <TooltipPrimitive.Trigger asChild>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy WhatsApp link"
          className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground-soft hover:text-foreground focus-visible:border-ring focus-visible:outline-none"
        >
          <span className={copied ? 'text-green-text' : undefined}>
            <HugeiconsIcon
              icon={copied ? CheckmarkCircle02Icon : Link01Icon}
              size={16}
              strokeWidth={1.5}
              color="currentColor"
            />
          </span>
          <span className="sr-only" aria-live="polite">
            {copied ? 'Copied' : ''}
          </span>
        </button>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          className="z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground"
        >
          {copied ? 'Copied' : 'Copy WhatsApp link'}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export function CompletionBar({ percent }: { percent: number }) {
  const reduce = useReducedMotion()
  return (
    <div className="h-1.5 flex-1 rounded-full bg-border">
      <motion.div
        className="h-full rounded-full bg-chart-1"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      />
    </div>
  )
}
