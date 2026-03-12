import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from '@/components/theme-provider'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Index from './pages/Index'
import Documentos from './pages/Documentos'
import DocumentEditor from './pages/DocumentEditor'
import Auditorias from './pages/Auditorias'
import Configuracoes from './pages/Configuracoes'
import Templates from './pages/Templates'

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/documentos/:id/editor" element={<DocumentEditor />} />
                <Route path="/auditorias" element={<Auditorias />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/templates" element={<Templates />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
)

export default App
