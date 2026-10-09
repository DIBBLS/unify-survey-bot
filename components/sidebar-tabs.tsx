'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ClipboardIcon,
  DashboardSquare01Icon,
  Add01Icon,
  Settings01Icon,
  ChevronRightIcon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import ThemeToggle from '@/components/ThemeToggle';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/sidebar/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/sidebar/breadcrumb';
import { Separator } from '@/components/sidebar/separator';

type HugeIcon = ComponentProps<typeof HugeiconsIcon>['icon'];

interface NavEntry {
  id: string;
  label: string;
  href: string;
  icon: HugeIcon;
}

const NAV_ITEMS: NavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: DashboardSquare01Icon },
  { id: 'surveys', label: 'Surveys', href: '/surveys', icon: ClipboardIcon },
  { id: 'new', label: 'New Survey', href: '/surveys/new', icon: Add01Icon },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings01Icon },
];

interface SurveyEntry {
  id: string;
  title: string;
}

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

function crumbsFor(pathname: string | null): Array<{ label: string; href?: string }> {
  if (!pathname) return [{ label: 'Dashboard', href: '/dashboard' }];
  if (pathname === '/dashboard') return [{ label: 'Dashboard' }];
  if (pathname === '/surveys') return [{ label: 'Surveys' }];
  if (pathname === '/surveys/new')
    return [{ label: 'Surveys', href: '/surveys' }, { label: 'New Survey' }];
  if (pathname.startsWith('/surveys/'))
    return [{ label: 'Surveys', href: '/surveys' }, { label: 'Survey' }];
  if (pathname === '/settings') return [{ label: 'Settings' }];
  return [{ label: 'Dashboard', href: '/dashboard' }];
}

function UserMenu({ userEmail }: { userEmail: string | null }) {
  const router = useRouter();
  const { open } = useSidebar();
  const initials = (userEmail ?? '?').slice(0, 2).toUpperCase();

  const signOut = async () => {
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild>
            <SidebarMenuButton className={open ? 'h-12' : 'h-10'}>
              <AvatarPrimitive.Root
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sidebar-accent"
              >
                <AvatarPrimitive.Fallback className="text-xs font-bold text-sidebar-accent-foreground">
                  {initials}
                </AvatarPrimitive.Fallback>
              </AvatarPrimitive.Root>
              {open && (
                <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-accent-foreground">
                    {userEmail ?? 'Not signed in'}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground">
                    Workspace
                  </span>
                </span>
              )}
            </SidebarMenuButton>
          </DropdownMenuPrimitive.Trigger>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              className="z-50 min-w-56 overflow-hidden rounded-md border border-border bg-surface p-1 text-ink shadow-card"
              side="right"
              align="end"
              sideOffset={8}
            >
              <div className="px-2 py-1.5">
                <div className="truncate text-sm font-semibold text-ink">
                  {userEmail ?? 'Not signed in'}
                </div>
                <div className="truncate text-xs text-ink-muted">Workspace</div>
              </div>
              <DropdownMenuPrimitive.Separator className="mx-1 my-1 h-px bg-border" />
              <DropdownMenuPrimitive.Item
                className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-2"
                onSelect={() => router.push('/settings')}
              >
                <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.8} />
                Settings
              </DropdownMenuPrimitive.Item>
              <DropdownMenuPrimitive.Separator className="mx-1 my-1 h-px bg-border" />
              <DropdownMenuPrimitive.Item
                className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-2"
                onSelect={signOut}
              >
                <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.8} />
                Log out
              </DropdownMenuPrimitive.Item>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function Shell({
  userEmail,
  children,
}: {
  userEmail: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useSidebar();
  const [surveys, setSurveys] = useState<SurveyEntry[]>([]);

  // Instant nav: warm the route bundles once the shell mounts so the first
  // click never pays compile + fetch latency.
  useEffect(() => {
    NAV_ITEMS.forEach((item) => router.prefetch(item.href));
  }, [router]);

  // Survey submenu entries (top-level titles only; failures hide the list).
  useEffect(() => {
    let live = true;
    fetch('/api/surveys')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!live || !Array.isArray(data?.surveys)) return;
        setSurveys(
          data.surveys.slice(0, 6).map((s: { id: string; title: string }) => ({
            id: String(s.id),
            title: String(s.title ?? 'Untitled survey'),
          }))
        );
      })
      .catch(() => {
        // Unreachable API: the submenu stays hidden.
      });
    return () => {
      live = false;
    };
  }, []);

  const go = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const activeHref = pathname ?? '/dashboard';
  const crumbs = crumbsFor(pathname);
  const surveysOpen = pathname === '/surveys' || pathname?.startsWith('/surveys/');

  return (
    <div className="flex w-full overflow-hidden bg-sidebar" style={{ height: '100dvh' }}>
      <Sidebar>
        <SidebarHeader>
          <div className={`flex items-center gap-3 py-3 ${open ? 'px-4' : 'justify-center px-0'}`}>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-display text-[19px] font-black leading-none text-sidebar-primary-foreground"
              aria-hidden="true"
            >
              U
            </span>
            {open && (
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-display text-[17px] font-bold tracking-[-0.01em] text-sidebar-foreground">
                  Unify.
                </span>
                <span className="truncate text-[11px] font-medium text-sidebar-foreground">
                  Survey Bot
                </span>
              </span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {NAV_ITEMS.filter((item) => item.id !== 'surveys').map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={isActiveHref(item.href, activeHref)}
                    onClick={() => go(item.href)}
                    onMouseEnter={() => router.prefetch(item.href)}
                    onFocus={() => router.prefetch(item.href)}
                  >
                    {open ? (
                      <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.8} />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent">
                        <HugeiconsIcon icon={item.icon} size={22} strokeWidth={1.8} />
                      </span>
                    )}
                    {open && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <CollapsiblePrimitive.Root
                defaultOpen={surveysOpen || undefined}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsiblePrimitive.Trigger asChild>
                    <SidebarMenuButton
                      tooltip="Surveys"
                      isActive={isActiveHref('/surveys', activeHref)}
                      onMouseEnter={() => router.prefetch('/surveys')}
                      onFocus={() => router.prefetch('/surveys')}
                    >
                      {open ? (
                        <HugeiconsIcon icon={ClipboardIcon} size={20} strokeWidth={1.8} />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent">
                          <HugeiconsIcon icon={ClipboardIcon} size={22} strokeWidth={1.8} />
                        </span>
                      )}
                      {open && <span>Surveys</span>}
                      {open && (
                        <span className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90">
                          <HugeiconsIcon
                            icon={ChevronRightIcon}
                            size={16}
                            strokeWidth={2}
                          />
                        </span>
                      )}
                    </SidebarMenuButton>
                  </CollapsiblePrimitive.Trigger>
                  {open && (
                    <CollapsiblePrimitive.Content>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={activeHref === '/surveys'}
                            onClick={() => go('/surveys')}
                          >
                            <span>All surveys</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        {surveys.map((survey) => {
                          const href = `/surveys/${survey.id}`;
                          return (
                            <SidebarMenuSubItem key={survey.id}>
                              <SidebarMenuSubButton
                                isActive={activeHref === href}
                                onClick={() => go(href)}
                              >
                                <span className="truncate">{survey.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsiblePrimitive.Content>
                  )}
                </SidebarMenuItem>
              </CollapsiblePrimitive.Root>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <UserMenu userEmail={userEmail} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                {crumbs.map((crumb, i) => (
                  <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-1.5">
                    {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className={i === 0 ? 'hidden md:block' : undefined}>
                      {crumb.href && i < crumbs.length - 1 ? (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </span>
                ))}
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-3 pr-1">
            {pathname !== '/surveys/new' && (
              <Link
                href="/surveys/new"
                className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-3.5 font-sans text-[13px] font-medium text-primary-foreground transition-all duration-150 hover:opacity-[0.85]"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
                <span className="hidden sm:inline">Create Survey</span>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-background [scrollbar-gutter:stable]">
          <div className="bg-background px-6 pb-6 md:rounded-lg">
            <div className="min-h-full">{children}</div>
          </div>
        </main>
      </SidebarInset>
    </div>
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
      <SidebarProvider>
        <Shell userEmail={userEmail}>{children}</Shell>
      </SidebarProvider>
    </TooltipPrimitive.Provider>
  );
}
