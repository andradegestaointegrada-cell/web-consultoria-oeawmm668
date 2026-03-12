import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Settings,
  Briefcase,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { toast } from 'sonner'

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Fábrica de Documentos', url: '/documentos', icon: FileText },
  { title: 'Auditorias', url: '/auditorias', icon: ClipboardCheck },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Erro ao sair da conta')
      return
    }
    toast.success('Deslogado com sucesso')
    navigate('/login')
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary">
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
