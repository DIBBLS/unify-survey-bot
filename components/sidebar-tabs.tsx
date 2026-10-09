'use client';

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useContext,
  createContext,
  useEffect,
} from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Cancel01Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  Menu01Icon,
  MoreHorizontalIcon,
  Settings01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import ThemeToggle from '@/components/ThemeToggle';

type HugeIcon = ComponentProps<typeof HugeiconsIcon>['icon'];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/* ─── Route model (URL is the source of truth; one tab per route) ─── */

export interface RouteTab {
  id: string;
  href: string;
  label: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: HugeIcon;
}

const STORAGE_KEY = 'sidebar-tabs-state';
const COLLAPSE_KEY = 'unify-sidebar-collapsed';
const MAX_DETAIL_TABS = 8;

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: DashboardSquare01Icon },
  { id: 'surveys', label: 'Surveys', href: '/surveys', icon: ClipboardIcon },
  { id: 'new', label: 'New Survey', href: '/surveys/new', icon: Add01Icon },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings01Icon },
];

function isSurveyDetail(href: string) {
  return /^\/surveys\/[^/]+$/.test(href);
}

function isTrackable(href: string) {
  return NAV_ITEMS.some((n) => n.href === href) || isSurveyDetail(href);
}

function defaultLabel(href: string) {
  return NAV_ITEMS.find((n) => n.href === href)?.label ?? 'Survey';
}

function iconForRoute(href: string): HugeIcon {
  return NAV_ITEMS.find((n) => n.href === href)?.icon ?? ClipboardIcon;
}

interface TabsContextValue {
  tabs: RouteTab[];
  activeHref: string;
  collapsed: boolean;
  toggleCollapsed: () => void;
  openRoute: (href: string) => void;
  addTab: (href?: string) => void;
  closeTab: (tabId: string) => void;
  closeOthers: (tabId: string) => void;
  closeToRight: (tabId: string) => void;
  closeToLeft: (tabId: string) => void;
  closeAll: () => void;
  setActiveTab: (tabId: string) => void;
  registerTitle: (href: string, title: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useRouteTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useRouteTabs must be used within SidebarTabsProvider');
  }
  return context;
}

/* ─── Chrome tab ─── */

function ChromeTab({
  tab,
  isActive,
  isLast,
  canClose,
  hasRightNeighborActive,
  onTabClick,
  onTabClose,
  onCloseOthers,
  onCloseToRight,
  onCloseToLeft,
  hasOtherTabs,
  hasTabsToRight,
  hasTabsToLeft,
}: {
  tab: RouteTab;
  isActive: boolean;
  isLast: boolean;
  canClose: boolean;
  hasRightNeighborActive: boolean;
  onTabClick: () => void;
  onTabClose: () => void;
  onCloseOthers: () => void;
  onCloseToRight: () => void;
  onCloseToLeft: () => void;
  hasOtherTabs: boolean;
  hasTabsToRight: boolean;
  hasTabsToLeft: boolean;
}) {
  const Icon = iconForRoute(tab.href);
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && tabRef.current) {
      tabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });

      if (isLast) {
        setTimeout(() => {
          const plusBtn = tabRef.current
            ?.closest('.chrome-tabrow-scroll')
            ?.querySelector('.new-tab-btn');
          if (plusBtn) {
            plusBtn.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center',
            });
          }
        }, 250);
      }
    }
  }, [isActive, isLast]);

  useEffect(() => {
    if (isActive && tabRef.current) {
      setTimeout(() => {
        tabRef.current?.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'center',
        });
      }, 200);
    }
    // Center the active tab on initial load (handles refresh).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button === 1 && canClose) {
      e.preventDefault();
      onTabClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabClick();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (canClose) {
        e.preventDefault();
        onTabClose();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = (e.target as HTMLElement)
        .closest('li')
        ?.nextElementSibling?.querySelector('[role="tab"]') as HTMLElement;
      nextTab?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = (e.target as HTMLElement)
        .closest('li')
        ?.previousElementSibling?.querySelector('[role="tab"]') as HTMLElement;
      prevTab?.focus();
    }
  };

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild>
        <div
          role="tab"
          aria-selected={isActive}
          tabIndex={isActive ? 0 : -1}
          title={tab.label}
          className={cn('chrome-tab', isActive && 'is-active')}
          onClick={onTabClick}
          onAuxClick={handleAuxClick}
          onKeyDown={handleKeyDown}
          ref={tabRef}
        >
          {isActive && (
            <motion.div
              className="chrome-tab-bg"
              layoutId="activeTabBg"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            >
              <div className="chrome-tab-curve left">
                <div className="chrome-tab-curve-dot" />
                <div className="chrome-tab-curve-fill" />
              </div>
              <div className="chrome-tab-curve right">
                <div className="chrome-tab-curve-dot" />
                <div className="chrome-tab-curve-fill" />
              </div>
            </motion.div>
          )}

          <div className="chrome-tab-inner">
            <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.8} />
            <span className="chrome-tab-label">{tab.label}</span>

            {canClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose();
                }}
                aria-label={`Close ${tab.label}`}
                className={cn('chrome-tab-close', !isActive && 'hover-only')}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {!isActive && !hasRightNeighborActive && (
            <div className="chrome-tab-divider" />
          )}
        </div>
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content className="chrome-menu" alignOffset={8}>
          <ContextMenuPrimitive.Item
            className="chrome-menu-item"
            onSelect={onTabClose}
            disabled={!canClose}
          >
            Close Tab
          </ContextMenuPrimitive.Item>
          <ContextMenuPrimitive.Separator className="chrome-menu-separator" />
          <ContextMenuPrimitive.Item
            className="chrome-menu-item"
            onSelect={onCloseOthers}
            disabled={!hasOtherTabs}
          >
            Close Other Tabs
          </ContextMenuPrimitive.Item>
          <ContextMenuPrimitive.Item
            className="chrome-menu-item"
            onSelect={onCloseToRight}
            disabled={!hasTabsToRight}
          >
            <HugeiconsIcon icon={ChevronRightIcon} size={16} strokeWidth={2} />
            Close Tabs to the Right
          </ContextMenuPrimitive.Item>
          <ContextMenuPrimitive.Item
            className="chrome-menu-item"
            onSelect={onCloseToLeft}
            disabled={!hasTabsToLeft}
          >
            <HugeiconsIcon icon={ChevronLeftIcon} size={16} strokeWidth={2} />
            Close Tabs to the Left
          </ContextMenuPrimitive.Item>
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
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
        const isActive =
          item.href === '/surveys'
            ? activeHref === item.href ||
              (activeHref.startsWith('/surveys/') &&
                !activeHref.startsWith('/surveys/new'))
            : activeHref === item.href;
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
        <button
          aria-label="Open navigation"
          className="chrome-icon-btn"
        >
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

/* ─── New-tab button with quick-open ─── */

function NewTabButton({ onAddTab }: { onAddTab: (href?: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const lastTouchTime = useRef(0);

  const handleTouchStart = () => {
    lastTouchTime.current = Date.now();
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setIsOpen(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const isTouch = Date.now() - lastTouchTime.current < 1000;
    if (isTouch) {
      if (isLongPress.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      setIsOpen(false);
      onAddTab();
    } else {
      onAddTab();
    }
  };

  return (
    <HoverCardPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        const isTouch = Date.now() - lastTouchTime.current < 1000;
        if (open && isTouch && !isLongPress.current) {
          return;
        }
        setIsOpen(open);
      }}
      openDelay={200}
      closeDelay={100}
    >
      <HoverCardPrimitive.Trigger asChild>
        <button
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="New survey"
          title="New survey"
          className="chrome-icon-btn new-tab-btn"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2.5} />
        </button>
      </HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
          align="start"
          sideOffset={8}
          className="chrome-hovercard"
        >
          <div className="chrome-hovercard-title">Quick Open</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onAddTab(item.href)}
              className="chrome-hovercard-item"
            >
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          ))}
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal>
    </HoverCardPrimitive.Root>
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
  const [tabs, setTabs] = useState<RouteTab[]>([]);
  const [activeTabId, setActiveTabId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const tabCounter = useRef(1);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeHref = activeTab?.href ?? pathname ?? '/dashboard';
  const activeTabIndex = tabs.findIndex((t) => t.id === activeTabId);

  // Hydrate from storage (client only).
  useEffect(() => {
    setIsClient(true);
    let restored: RouteTab[] | null = null;
    let restoredActive: string | null = null;
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (Array.isArray(parsed?.tabs)) {
          const valid = parsed.tabs.filter(
            (t: unknown): t is RouteTab =>
              typeof t === 'object' &&
              t !== null &&
              typeof (t as RouteTab).id === 'string' &&
              typeof (t as RouteTab).href === 'string' &&
              typeof (t as RouteTab).label === 'string' &&
              isTrackable((t as RouteTab).href)
          );
          if (valid.length > 0) {
            restored = valid.slice(0, 12);
            restoredActive =
              typeof parsed.activeTabId === 'string' ? parsed.activeTabId : null;
          }
        }
      }
      setIsCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      restored = null;
    }

    if (restored) {
      setTabs(restored);
      const stillThere =
        restoredActive && restored.some((t) => t.id === restoredActive);
      setActiveTabId(stillThere ? (restoredActive as string) : restored[0].id);
      // The URL wins: if the route isn't open, open it below via the tracker.
      const here = window.location.pathname;
      if (isTrackable(here) && !restored.some((t) => t.href === here)) {
        const id = `tab-${Date.now()}`;
        setTabs((prev) => [...prev, { id, href: here, label: defaultLabel(here) }]);
        setActiveTabId(id);
      } else if (isTrackable(here)) {
        const match = restored.find((t) => t.href === here);
        if (match) setActiveTabId(match.id);
      }
    } else {
      const here =
        typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
      const start = isTrackable(here) ? here : '/dashboard';
      setTabs([{ id: 'tab-1', href: start, label: defaultLabel(start) }]);
      setActiveTabId('tab-1');
    }
    // Run once on mount; route changes are handled by the tracker below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track the URL: every visited route gets (or reuses) a tab.
  useEffect(() => {
    if (!isClient || !pathname || !isTrackable(pathname)) return;
    const match = tabs.find((t) => t.href === pathname);
    if (match) {
      if (match.id !== activeTabId) setActiveTabId(match.id);
      return;
    }
    const id = `tab-${tabCounter.current++}-${Date.now()}`;
    setTabs((prev) => {
      if (prev.some((t) => t.href === pathname)) return prev;
      let next = [...prev, { id, href: pathname, label: defaultLabel(pathname) }];
      const details = next.filter((t) => isSurveyDetail(t.href) && t.href !== pathname);
      if (details.length > MAX_DETAIL_TABS) {
        const drop = details[0].id;
        next = next.filter((t) => t.id !== drop);
      }
      return next;
    });
    setActiveTabId(id);
  }, [pathname, isClient, tabs, activeTabId]);

  // Persist (debounced).
  useEffect(() => {
    if (!isClient || tabs.length === 0) return;
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
      } catch {
        // Storage unavailable: tabs simply won't persist.
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [tabs, activeTabId, isClient]);

  useEffect(() => {
    if (isClient && tabs.length === 0) {
      setTabs([{ id: 'tab-1', href: '/dashboard', label: 'Dashboard' }]);
      setActiveTabId('tab-1');
    }
  }, [isClient, tabs.length]);

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

  const openRoute = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const setActiveNav = useCallback(
    (href: string) => {
      openRoute(href);
    },
    [openRoute]
  );

  const addTab = useCallback(
    (href?: string) => {
      openRoute(href ?? '/surveys/new');
    },
    [openRoute]
  );

  const closeTab = useCallback(
    (tabId: string) => {
      if (tabs.length === 1) return;
      const tabIndex = tabs.findIndex((t) => t.id === tabId);
      const newTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);

      if (activeTabId === tabId) {
        const newActiveIndex = tabIndex === newTabs.length ? tabIndex - 1 : tabIndex;
        const safeIndex = Math.max(0, newActiveIndex);
        if (newTabs[safeIndex]) {
          setActiveTabId(newTabs[safeIndex].id);
          router.push(newTabs[safeIndex].href);
        }
      }
    },
    [tabs, activeTabId, router]
  );

  const closeOthers = useCallback(
    (tabId: string) => {
      const kept = tabs.find((t) => t.id === tabId);
      if (!kept) return;
      setTabs([kept]);
      setActiveTabId(tabId);
      router.push(kept.href);
    },
    [tabs, router]
  );

  const closeToRight = useCallback(
    (tabId: string) => {
      const index = tabs.findIndex((t) => t.id === tabId);
      if (index === -1) return;
      const newTabs = tabs.slice(0, index + 1);
      setTabs(newTabs);
      if (!newTabs.find((t) => t.id === activeTabId)) {
        setActiveTabId(tabId);
        const kept = tabs[index];
        if (kept) router.push(kept.href);
      }
    },
    [tabs, activeTabId, router]
  );

  const closeToLeft = useCallback(
    (tabId: string) => {
      const index = tabs.findIndex((t) => t.id === tabId);
      if (index === -1) return;
      const newTabs = tabs.slice(index);
      setTabs(newTabs);
      if (!newTabs.find((t) => t.id === activeTabId)) {
        setActiveTabId(tabId);
        const kept = tabs[index];
        if (kept) router.push(kept.href);
      }
    },
    [tabs, activeTabId, router]
  );

  const closeAll = useCallback(() => {
    if (tabs.length <= 1) return;
    const firstTab = tabs[0];
    setTabs([firstTab]);
    setActiveTabId(firstTab.id);
    router.push(firstTab.href);
  }, [tabs, router]);

  const setActiveTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      setActiveTabId(tabId);
      if (tab) router.push(tab.href);
    },
    [tabs, router]
  );

  const registerTitle = useCallback((href: string, title: string) => {
    const clean = title.trim().slice(0, 80);
    if (!clean) return;
    setTabs((prev) =>
      prev.map((t) => (t.href === href && t.label !== clean ? { ...t, label: clean } : t))
    );
  }, []);

  const handleNavItemClick = useCallback(
    (item: NavItem) => {
      setActiveNav(item.href);
    },
    [setActiveNav]
  );

  const contextValue = useMemo(
    () => ({
      tabs,
      activeHref,
      collapsed: isCollapsed,
      toggleCollapsed,
      openRoute,
      addTab,
      closeTab,
      closeOthers,
      closeToRight,
      closeToLeft,
      closeAll,
      setActiveTab,
      registerTitle,
    }),
    [
      tabs,
      activeHref,
      isCollapsed,
      toggleCollapsed,
      openRoute,
      addTab,
      closeTab,
      closeOthers,
      closeToRight,
      closeToLeft,
      closeAll,
      setActiveTab,
      registerTitle,
    ]
  );

  const canCloseTab = tabs.length > 1;
  const hasOtherTabs = tabs.length > 1;

  return (
    <TabsContext.Provider value={contextValue}>
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
          <div className="chrome-tabrow">
            <div className="chrome-mobilemenu">
              <MobileSidebar activeHref={activeHref} onItemClick={handleNavItemClick} />
            </div>

            <div className="chrome-tabrow-scroll scrollbar-hide">
              <Reorder.Group
                as="ol"
                axis="x"
                values={tabs}
                onReorder={setTabs}
                className="chrome-tablist"
                role="tablist"
              >
                <AnimatePresence initial={false}>
                  {tabs.map((tab, index) => {
                    const isActive = tab.id === activeTabId;
                    const isLast = index === tabs.length - 1;
                    const hasRightNeighborActive =
                      index < tabs.length - 1 && tabs[index + 1].id === activeTabId;

                    return (
                      <Reorder.Item
                        value={tab}
                        as="li"
                        layout
                        key={tab.id}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        whileDrag={{ cursor: 'grabbing' }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="chrome-tab-lift"
                        style={{ zIndex: isActive ? 10 : 1 }}
                      >
                        <ChromeTab
                          tab={tab}
                          isActive={isActive}
                          isLast={isLast}
                          canClose={canCloseTab}
                          hasRightNeighborActive={hasRightNeighborActive}
                          onTabClick={() => setActiveTab(tab.id)}
                          onTabClose={() => closeTab(tab.id)}
                          onCloseOthers={() => closeOthers(tab.id)}
                          onCloseToRight={() => closeToRight(tab.id)}
                          onCloseToLeft={() => closeToLeft(tab.id)}
                          hasOtherTabs={hasOtherTabs}
                          hasTabsToRight={index < tabs.length - 1}
                          hasTabsToLeft={index > 0}
                        />
                      </Reorder.Item>
                    );
                  })}
                </AnimatePresence>
              </Reorder.Group>

              <motion.div layout className="chrome-newtab">
                <NewTabButton onAddTab={addTab} />
              </motion.div>
            </div>

            <div className="chrome-tabrow-actions">
              <ThemeToggle />
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button aria-label="Tab options" className="chrome-icon-btn">
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={1.8} />
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    align="end"
                    sideOffset={6}
                    className="chrome-menu"
                  >
                    <DropdownMenuPrimitive.Item
                      className="chrome-menu-item"
                      onSelect={() => addTab()}
                    >
                      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
                      New Tab
                    </DropdownMenuPrimitive.Item>
                    <DropdownMenuPrimitive.Separator className="chrome-menu-separator" />
                    <DropdownMenuPrimitive.Item
                      className={cn('chrome-menu-item', hasOtherTabs && 'is-danger')}
                      onSelect={closeAll}
                      disabled={!hasOtherTabs}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} />
                      Close All Tabs
                    </DropdownMenuPrimitive.Item>
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          </div>

          <main className="chrome-main-scroll">
            <div
              className={cn(
                'chrome-card',
                activeTabIndex !== 0 && 'with-tl'
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTabId}-${activeHref}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="chrome-card-inner"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </TabsContext.Provider>
  );
}

function SignOutButton() {
  const { openRoute } = useRouteTabs();
  return (
    <button
      className="chrome-signout"
      title="Sign out"
      onClick={async () => {
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();
        await supabase.auth.signOut();
        openRoute('/login');
      }}
    >
      <HugeiconsIcon icon={Logout01Icon} size={13} strokeWidth={2} />
      Sign out
    </button>
  );
}

export function SidebarTabsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
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

/**
 * Registers a human-readable title (e.g. the survey name) for the current
 * route's tab. Render once inside a route that otherwise shows a generic label.
 */
export function SurveyTabTitle({ title }: { title: string }) {
  const pathname = usePathname();
  const { registerTitle } = useRouteTabs();

  useEffect(() => {
    if (pathname) registerTitle(pathname, title);
  }, [pathname, title, registerTitle]);

  return null;
}
