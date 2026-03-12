import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
        <AppSidebar />
        <main className="flex w-full flex-col flex-1 overflow-hidden">
          <AppHeader />
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
