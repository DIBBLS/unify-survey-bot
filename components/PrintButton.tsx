'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Download01Icon } from '@hugeicons/core-free-icons'

export default function PrintButton() {
  return (
    <button
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-ink px-6 py-3 font-sans text-sm font-semibold text-canvas transition-all duration-150 hover:opacity-[0.82]"
      onClick={() => window.print()}
    >
      <HugeiconsIcon icon={Download01Icon} size={16} strokeWidth={2} />
      Export Report
    </button>
  )
}
