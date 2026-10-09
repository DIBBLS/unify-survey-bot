'use client';

import {
  useState,
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
  return (
    <nav className="chrome-sidenav" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveHref(item.href, activeHref);
        const NavButton = (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'chrome-navitem',
              isActive && 'is-active',
              isCollapsed && 'is-collapsed'
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
                  className="chrome-navitem-label"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive && !isCollapsed && (
              <motion.div
                layoutId="activeNavIndicator"
                className="chrome-navitem-indicator"
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
                <TooltipPrimitive.Content side="right" className="chrome-tooltip">
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
        <button aria-label="Open navigation" className="chrome-icon-btn">
          <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={1.8} />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="chrome-sheet-overlay" />
        <DialogPrimitive.Content className="chrome-sheet">
          <DialogPrimitive.Title className="sr-only">
            Sidebar Navigation
          </DialogPrimitive.Title>
          <div className="chrome-sheet-brand">
            <span className="sidebar-brand-mark" aria-hidden="true">
              U
            </span>
            <span className="chrome-sheet-name">Unify.</span>
          </div>
          <div className="chrome-sheet-nav">
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
      className="chrome-signout"
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
      <div className="chrome-root">
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? 64 : 240 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="chrome-sidebar"
        >
          <div className="chrome-sidebar-inner">
            <div className={cn('chrome-brand', isCollapsed && 'is-collapsed')}>
              <div className="chrome-brand-lockup">
                <span className="sidebar-brand-mark" aria-hidden="true">
                  U
                </span>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="chrome-brand-name"
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
                  className="chrome-icon-btn"
                >
                  <HugeiconsIcon icon={SidebarLeft01Icon} size={16} strokeWidth={1.8} />
                </button>
              )}
            </div>

            {isCollapsed && (
              <div className="chrome-rail-toggle">
                <button
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                  onClick={toggleCollapsed}
                  className="chrome-icon-btn"
                >
                  <HugeiconsIcon icon={SidebarRight01Icon} size={16} strokeWidth={1.8} />
                </button>
              </div>
            )}

            <div className="chrome-sidenav-scroll">
              <SidebarNavigation
                activeHref={activeHref}
                isCollapsed={isCollapsed}
                onItemClick={handleNavItemClick}
              />
            </div>

            <div className="chrome-sidefooter">
              <AnimatePresence mode="wait">
                {!isCollapsed ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="chrome-profile"
                  >
                    <span
                      className="sidebar-avatar"
                      aria-hidden="true"
                      style={{ width: 36, height: 36 }}
                    >
                      {(userEmail ?? '?').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="chrome-profile-text">
                      <span className="chrome-profile-email">
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
                    className="chrome-profile-collapsed"
                    title={userEmail ?? 'Not signed in'}
                  >
                    <span className="sidebar-avatar" aria-hidden="true">
                      {(userEmail ?? '?').slice(0, 2).toUpperCase()}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.aside>

        <div className="chrome-main">
          <div className="chrome-mobilebar">
            <MobileSidebar activeHref={activeHref} onItemClick={handleNavItemClick} />
          </div>

          <main className="chrome-main-scroll">
            <div className="chrome-card">
              <div className="chrome-card-inner">{children}</div>
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
