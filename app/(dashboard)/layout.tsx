import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
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
    <div className="app-shell">
      <Sidebar userEmail={user?.email ?? null} />
      <div className="main-content">
        <Topbar />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
