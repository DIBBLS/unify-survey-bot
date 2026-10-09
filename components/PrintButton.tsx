'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Download01Icon } from '@hugeicons/core-free-icons'

export default function PrintButton() {
  return (
    <button className="btn btn-primary" onClick={() => window.print()}>
      <HugeiconsIcon icon={Download01Icon} size={16} strokeWidth={2} />
      Export Report
    </button>
  )
}
