'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-6 text-popover-foreground"
        >
          <DialogPrimitive.Title className="text-[15px] font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-[13px] text-muted-foreground">
            {description}
          </DialogPrimitive.Description>
          <div className="mt-5 flex justify-end gap-2">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center whitespace-nowrap rounded-md border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none"
              >
                Keep editing
              </button>
            </DialogPrimitive.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-9 items-center whitespace-nowrap rounded-md border border-transparent bg-destructive-soft px-3.5 font-sans text-[13px] font-medium text-destructive transition-all duration-150 hover:opacity-[0.85] focus-visible:border-ring focus-visible:outline-none"
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
