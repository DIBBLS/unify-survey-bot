'use client';

import type { ReactNode } from 'react';
import SidebarWithChromeTabs from '@/components/sidebar-tabs';

export default function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string | null;
  children: ReactNode;
}) {
  return <SidebarWithChromeTabs userEmail={userEmail}>{children}</SidebarWithChromeTabs>;
}
