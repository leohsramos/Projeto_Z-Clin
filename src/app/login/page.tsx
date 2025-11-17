'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Stethoscope, Heart, User, CreditCard, Code } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: ''
  })
  const [rememberMe, setRememberMe] = useState(false)

  const userTypes = [
    { value: 'FINANCEIRO', label: 'Financeiro', icon: CreditCard, color: 'text-green-600' },
    { value: 'DRA_JOSIANE', label: 'Dra. Josiane Canali', icon: Stethoscope, color: 'text-purple-600' },
    { value: 'SECRETARIA', label: 'Secretaria', icon: User, color: 'text-blue-600' },
    { value: 'DESENVOLVEDOR', label: 'Desenvolvedor', icon: Code, color: 'text-gray-600' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.userType) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    setIsLoading(true)

    try {
      // Simulação de autenticação - em produção, isso seria uma API call
      const mockUsers = [
        { email: 'financeiro@clinica.com', password: 'Fin@nc2024#', userType: 'FINANCEIRO', name: 'Setor Financeiro' },
        { email: 'drajosiane@clinica.com', password: 'Dra.Josi@2024!', userType: 'DRA_JOSIANE', name: 'Dra. Josiane Canali' },
        { email: 'secretaria@clinica.com', password: 'Sec@2024$', userType: 'SECRETARIA', name: 'Secretária' },
        { email: 'dev@clinica.com', password: 'Dev@2024&', userType: 'DESENVOLVEDOR', name: 'Desenvolvedor' }
      ]

      const user = mockUsers.find(
        u => u.email === formData.email && 
             u.password === formData.password && 
             u.userType === formData.userType
      )

      if (user) {
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          name: user.name,
          email: user.email,
          userType: user.userType as any
        }
        
        login(userData)
        toast.success(`Bem-vindo(a), ${user.name}!`)
        router.push('/dashboard')
      } else {
        toast.error('E-mail, senha ou tipo de usuário inválidos')
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    toast.info('Funcionalidade de recuperação de senha em desenvolvimento')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clínica Médica
          </h1>
          <p className="text-gray-600">
            Sistema de Gestão de Consultório
          </p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>

              {/* Campo de Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="h-11 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Tipo de Usuário */}
              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Usuário</Label>
                <Select 
                  value={formData.userType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${type.color}`} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Lembrar Acesso e Esqueci Senha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Lembrar acesso
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm text-purple-600 hover:text-purple-700"
                  onClick={handleForgotPassword}
                >
                  Esqueci a senha
                </Button>
              </div>

              {/* Botão de Login */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </form>

            {/* Informações de Teste */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-2">
                📋 Acesso para Teste:
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <p><strong>Financeiro:</strong> financeiro@clinica.com / Fin@nc2024#</p>
                <p><strong>Dra. Josiane:</strong> drajosiane@clinica.com / Dra.Josi@2024!</p>
                <p><strong>Secretaria:</strong> secretaria@clinica.com / Sec@2024$</p>
                <p><strong>Desenvolvedor:</strong> dev@clinica.com / Dev@2024&</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 Clínica Médica. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}