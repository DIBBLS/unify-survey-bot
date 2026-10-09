'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { SidebarLeft01Icon } from '@hugeicons/core-free-icons';
import { useIsMobile } from '@/hooks/use-mobile';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const COLLAPSE_KEY = 'unify-sidebar-collapsed';
export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_WIDTH_ICON = 64;

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpenState] = useState(true);
  const [openMobile, setOpenMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  if (typeof window !== 'undefined' && !hydrated) {
    try {
      setOpenState(localStorage.getItem(COLLAPSE_KEY) !== '1');
    } catch {
      // Storage unavailable: keep expanded.
    }
    setHydrated(true);
  }

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? '0' : '1');
    } catch {
      // Ignore.
    }
  }, []);

  const toggle = useCallback(() => {
    setOpenState((prev) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, prev ? '1' : '0');
      } catch {
        // Ignore.
      }
      return !prev;
    });
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle, openMobile, setOpenMobile, isMobile }),
    [open, setOpen, toggle, openMobile, isMobile]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function Sidebar({ children }: { children: ReactNode }) {
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Content className="fixed bottom-0 left-0 top-0 z-50 flex w-72 max-w-[85vw] flex-col bg-sidebar outline-none">
            <DialogPrimitive.Title className="sr-only">
              Sidebar Navigation
            </DialogPrimitive.Title>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      data-collapsible={open ? undefined : 'icon'}
      className="hidden shrink-0 flex-col overflow-hidden bg-sidebar md:flex"
    >
      <div className="flex h-full flex-col overflow-hidden">{children}</div>
    </motion.aside>
  );
}

export function SidebarHeader({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 flex-col">{children}</div>;
}

export function SidebarContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

export function SidebarFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[73px] shrink-0 items-center justify-center overflow-hidden border-t border-sidebar-border p-4">
      {children}
    </div>
  );
}

export function SidebarRail() {
  const { toggle } = useSidebar();
  return (
    <button
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
      onClick={toggle}
      className="absolute -right-2 top-16 z-20 hidden h-6 w-4 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground opacity-0 shadow-card transition-opacity hover:opacity-100 focus-visible:opacity-100 md:flex"
    >
      <span className="h-2.5 w-px bg-current" />
    </button>
  );
}

export function SidebarInset({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}

export function SidebarTrigger({ className = '' }: { className?: string }) {
  const { toggle, setOpenMobile, isMobile } = useSidebar();
  return (
    <button
      aria-label={isMobile ? 'Open navigation' : 'Toggle sidebar'}
      title={isMobile ? 'Open navigation' : 'Toggle sidebar'}
      onClick={() => (isMobile ? setOpenMobile(true) : toggle())}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink ${className}`}
    >
      <HugeiconsIcon icon={SidebarLeft01Icon} size={16} strokeWidth={1.8} />
    </button>
  );
}

export function SidebarGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1 px-3">{children}</div>;
}

export function SidebarGroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted first:pt-0">
      {children}
    </div>
  );
}

export function SidebarMenu({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-1">{children}</ul>;
}

export function SidebarMenuItem({ children }: { children: ReactNode }) {
  return <li className="relative">{children}</li>;
}

const MENU_BUTTON =
  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150';

export function SidebarMenuButton({
  children,
  isActive,
  tooltip,
  onClick,
  onMouseEnter,
  onFocus,
  className = '',
}: {
  children: ReactNode;
  isActive?: boolean;
  tooltip?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  className?: string;
}) {
  const { open } = useSidebar();
  const button = (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        MENU_BUTTON,
        isActive
          ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
          : 'font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        !open && 'justify-center px-0',
        className
      )}
    >
      {children}
    </button>
  );

  if (!open && tooltip) {
    return (
      <TooltipPrimitive.Root delayDuration={0}>
        <TooltipPrimitive.Trigger asChild>{button}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="right"
            className="z-50 overflow-hidden rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-card"
          >
            {tooltip}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    );
  }

  return button;
}

export function SidebarMenuSub({ children }: { children: ReactNode }) {
  return (
    <ul className="ml-5 flex flex-col gap-0.5 border-l border-sidebar-border py-1 pl-2">
      {children}
    </ul>
  );
}

export function SidebarMenuSubItem({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function SidebarMenuSubButton({
  children,
  isActive,
  onClick,
}: {
  children: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-[13px] transition-colors duration-150',
        isActive
          ? 'font-semibold text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      {children}
    </button>
  );
}

export function SidebarMenuAction({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-sidebar-foreground opacity-0 transition-opacity hover:bg-sidebar-accent focus-visible:opacity-100 group-hover:opacity-100"
    >
      {children}
    </button>
  );
}
