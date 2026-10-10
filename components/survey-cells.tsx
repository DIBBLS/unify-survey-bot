'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Link01Icon,
  CheckmarkCircle02Icon,
  Download01Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { motion, useReducedMotion } from 'framer-motion'

const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // The async clipboard API rejects outside secure contexts (plain http,
    // some private modes) — fall back to the legacy execCommand path.
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(ta)
    return ok
  }
}

function useCopiedFlag(timeoutMs: number): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    void copyText(text).then((ok) => {
      if (!ok) return
      setCopied(true)
      setTimeout(() => setCopied(false), timeoutMs)
    })
  }

  return [copied, copy]
}

export function CopyLinkButton({ text }: { text: string }) {
  const [copied, copy] = useCopiedFlag(1500)

  return (
    <TooltipPrimitive.Root delayDuration={0}>
      <TooltipPrimitive.Trigger asChild>
        <button
          type="button"
          onClick={() => copy(text)}
          aria-label="Copy WhatsApp link"
          className="inline-flex size-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-foreground-soft hover:text-foreground focus-visible:border-ring focus-visible:outline-none"
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

export function ShareLinkButton({ text }: { text: string }) {
  const [copied, copy] = useCopiedFlag(1500)

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none"
    >
      <span className={copied ? 'text-green-text' : undefined}>
        <HugeiconsIcon
          icon={copied ? CheckmarkCircle02Icon : Link01Icon}
          size={14}
          strokeWidth={1.5}
          color="currentColor"
        />
      </span>
      {copied ? 'Copied' : 'Share link'}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  )
}

export function ExportMenu({ surveyId }: { surveyId: string }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none"
        >
          Export
          <HugeiconsIcon
            icon={Download01Icon}
            size={14}
            strokeWidth={1.5}
            color="currentColor"
          />
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            strokeWidth={1.5}
            color="currentColor"
          />
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-44 overflow-hidden rounded-md border border-border bg-popover p-1"
        >
          <DropdownMenuPrimitive.Item
            asChild
            className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none data-[highlighted]:bg-muted"
          >
            <a href={`/api/surveys/${surveyId}/export`} download>
              Export CSV
            </a>
          </DropdownMenuPrimitive.Item>
          <DropdownMenuPrimitive.Item
            onSelect={() => window.print()}
            className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none data-[highlighted]:bg-muted"
          >
            Export report
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

export function OptionBar({ percent }: { percent: number }) {
  const reduce = useReducedMotion()
  return (
    <div className="h-2 flex-1 rounded-full bg-border">
      <motion.div
        className="h-full rounded-full bg-chart-1"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      />
    </div>
  )
}
