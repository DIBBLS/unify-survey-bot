'use client';

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  createContext,
} from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ClipboardIcon,
  DashboardSquare01Icon,
  Add01Icon,
  Settings01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  Logout01Icon,
  Menu01Icon,
} from '@hugeicons/core-free-icons';

type HugeIcon = ComponentProps<typeof HugeiconsIcon>['icon'];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: HugeIcon;
}

const COLLAPSE_KEY = 'unify-sidebar-collapsed';

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: DashboardSquare01Icon },
  { id: 'surveys', label: 'Surveys', href: '/surveys', icon: ClipboardIcon },
  { id: 'new', label: 'New Survey', href: '/surveys/new', icon: Add01Icon },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings01Icon },
];

const ICON_BTN =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink';

const AVATAR =
  'flex shrink-0 items-center justify-center rounded-full bg-tag font-bold text-ink-muted';

function isActiveHref(href: string, pathname: string | null) {
  if (href === '/surveys') {
    return (
      pathname === href ||
      (pathname?.startsWith('/surveys/') === true &&
        !pathname?.startsWith('/surveys/new'))
    );
  }
  return pathname === href;
}

interface ShellContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function useRouteTabs() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useRouteTabs must be used within SidebarWithChromeTabs');
  }
  return context;
}

/* ─── Sidebar navigation ─── */

function SidebarNavigation({
  activeHref,
  isCollapsed,
  onItemClick,
}: {
  activeHref: string;
  isCollapsed: boolean;
  onItemClick: (item: NavItem) => void;
}) {
  const router = useRouter();
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveHref(item.href, activeHref);
        const NavButton = (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            onMouseEnter={() => router.prefetch(item.href)}
            onFocus={() => router.prefetch(item.href)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink',
              isActive && 'bg-surface-2 text-ink',
              isCollapsed && 'justify-center px-0'
            )}
          >
            <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.8} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden whitespace-nowrap text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive && !isCollapsed && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );

        if (isCollapsed) {
          return (
            <TooltipPrimitive.Root key={item.id} delayDuration={0}>
              <TooltipPrimitive.Trigger asChild>{NavButton}</TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                  side="right"
                  className="z-50 overflow-hidden rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-card"
                >
                  {item.label}
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          );
        }

        return NavButton;
      })}
    </nav>
  );
}

/* ─── Mobile sidebar (sheet) ─── */

function MobileSidebar({
  activeHref,
  onItemClick,
}: {
  activeHref: string;
  onItemClick: (item: NavItem) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleItemClick = (item: NavItem) => {
    onItemClick(item);
    setOpen(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button aria-label="Open navigation" className={ICON_BTN}>
          <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={1.8} />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="fixed bottom-0 left-0 top-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface outline-none">
          <DialogPrimitive.Title className="sr-only">
            Sidebar Navigation
          </DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-border p-5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent font-display text-[19px] font-black leading-none text-ongreen"
              aria-hidden="true"
            >
              U
            </span>
            <span className="font-display text-base font-bold text-ink">Unify.</span>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNavigation
              activeHref={activeHref}
              isCollapsed={false}
              onItemClick={handleItemClick}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="inline-flex items-center gap-[5px] self-start py-0.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
      title="Sign out"
      onClick={async () => {
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      }}
    >
      <HugeiconsIcon icon={Logout01Icon} size={13} strokeWidth={2} />
      Sign out
    </button>
  );
}

/* ─── Shell ─── */

function Shell({
  userEmail,
  children,
}: {
  userEmail: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Instant nav: warm the route bundles once the shell mounts so the first
  // click never pays compile + fetch latency.
  useEffect(() => {
    NAV_ITEMS.forEach((item) => router.prefetch(item.href));
  }, [router]);

  if (typeof window !== 'undefined' && !hydrated) {
    try {
      setIsCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      // Storage unavailable: keep expanded.
    }
    setHydrated(true);
  }

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1');
      } catch {
        // Ignore.
      }
      return !prev;
    });
  }, []);

  const handleNavItemClick = useCallback(
    (item: NavItem) => {
      router.push(item.href);
    },
    [router]
  );

  const contextValue = useMemo(
    () => ({ collapsed: isCollapsed, toggleCollapsed }),
    [isCollapsed, toggleCollapsed]
  );

  const activeHref = pathname ?? '/dashboard';

  return (
    <ShellContext.Provider value={contextValue}>
      <div className="flex w-full overflow-hidden bg-surface" style={{ height: '100dvh' }}>
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? 64 : 240 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="hidden shrink-0 flex-col overflow-hidden bg-surface md:flex"
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div
              className={cn(
                'flex h-[52px] shrink-0 items-center justify-between border-b border-border px-4',
                isCollapsed && 'justify-center'
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent font-display text-[19px] font-black leading-none text-ongreen"
                  aria-hidden="true"
                >
                  U
                </span>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="ml-3 whitespace-nowrap font-display text-[17px] font-bold tracking-[-0.01em] text-ink"
                    >
                      Unify.
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {!isCollapsed && (
                <button
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  onClick={toggleCollapsed}
                  className={ICON_BTN}
                >
                  <HugeiconsIcon icon={SidebarLeft01Icon} size={16} strokeWidth={1.8} />
                </button>
              )}
            </div>

            {isCollapsed && (
              <div className="flex justify-center border-b border-border py-2">
                <button
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                  onClick={toggleCollapsed}
                  className={ICON_BTN}
                >
                  <HugeiconsIcon icon={SidebarRight01Icon} size={16} strokeWidth={1.8} />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SidebarNavigation
                activeHref={activeHref}
                isCollapsed={isCollapsed}
                onItemClick={handleNavItemClick}
              />
            </div>

            <div className="flex h-[73px] shrink-0 items-center justify-center overflow-hidden border-t border-border p-4">
              <AnimatePresence mode="wait">
                {!isCollapsed ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex w-full items-center gap-3"
                  >
                    <span className={cn(AVATAR, 'h-9 w-9 text-[13px]')} aria-hidden="true">
                      {(userEmail ?? '?').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-ink">
                        {userEmail ?? 'Not signed in'}
                      </span>
                      <SignOutButton />
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex justify-center"
                    title={userEmail ?? 'Not signed in'}
                  >
                    <span className={cn(AVATAR, 'h-8 w-8 text-[13px]')} aria-hidden="true">
                      {(userEmail ?? '?').slice(0, 2).toUpperCase()}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.aside>

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center bg-surface py-2 pl-2 md:hidden">
            <MobileSidebar activeHref={activeHref} onItemClick={handleNavItemClick} />
          </div>

          <main className="min-h-0 flex-1 overflow-hidden bg-surface p-0 md:pb-3 md:pr-3">
            <div className="h-full overflow-auto bg-canvas md:rounded-3xl">
              <div className="min-h-full">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

export default function SidebarWithChromeTabs({
  userEmail,
  children,
}: {
  userEmail: string | null;
  children: ReactNode;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <Shell userEmail={userEmail}>{children}</Shell>
    </TooltipPrimitive.Provider>
  );
}
