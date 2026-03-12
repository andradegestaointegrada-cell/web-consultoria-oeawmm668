import { useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, FileText, ClipboardCheck, Settings, Briefcase } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Fábrica de Documentos', url: '/documentos', icon: FileText },
  { title: 'Auditorias', url: '/auditorias', icon: ClipboardCheck },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight">AGI Consult</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
