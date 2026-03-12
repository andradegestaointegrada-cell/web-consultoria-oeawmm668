import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('admin@agiconsult.com')
  const [password, setPassword] = useState('password123')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha todos os campos')
      return
    }
    login(email)
    toast.success('Bem-vindo de volta!')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/1080?q=modern%20office&color=blue&dpr=1')] bg-cover bg-center opacity-5" />
      <Card className="w-full max-w-md relative z-10 animate-slide-up shadow-xl border-0">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Briefcase className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-slate-500">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Esqueci minha senha
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar-me
              </Label>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-medium">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
