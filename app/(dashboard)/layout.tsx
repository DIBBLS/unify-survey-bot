import DashboardShell from '@/components/dashboard-shell'
import { createClient } from '@/lib/supabase-server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <DashboardShell userEmail={user?.email ?? null}>{children}</DashboardShell>
  )
}
