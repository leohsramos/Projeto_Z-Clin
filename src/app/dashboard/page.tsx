'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Stethoscope, 
  FileText, 
  TrendingUp,
  Clock,
  UserCheck,
  DollarSign,
  Activity,
  LogOut,
  Settings,
  Bell,
  User
} from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = () => {
    logout()
    toast.success('Logout realizado com sucesso!')
    router.push('/login')
  }

  const getUserTypeDisplay = (userType: string) => {
    const types = {
      'FINANCEIRO': { label: 'Financeiro', color: 'bg-green-100 text-green-800', icon: CreditCard },
      'DRA_JOSIANE': { label: 'Dra. Josiane Canali', color: 'bg-purple-100 text-purple-800', icon: Stethoscope },
      'SECRETARIA': { label: 'Secretaria', color: 'bg-blue-100 text-blue-800', icon: Users },
      'DESENVOLVEDOR': { label: 'Desenvolvedor', color: 'bg-gray-100 text-gray-800', icon: Settings }
    }
    return types[userType as keyof typeof types] || types['SECRETARIA']
  }

  const userTypeDisplay = getUserTypeDisplay(user.userType)
  const UserIcon = userTypeDisplay.icon

  // Cards de navegação rápida
  const quickAccessCards = [
    {
      title: 'Gestão de Consultas',
      description: 'Agende e gerencie consultas',
      icon: Calendar,
      color: 'bg-blue-500',
      href: '/consultas'
    },
    {
      title: 'Pacientes',
      description: 'Cadastre e visualize pacientes',
      icon: Users,
      color: 'bg-green-500',
      href: '/pacientes'
    },
    {
      title: 'Procedimentos',
      description: 'Gerencie procedimentos e valores',
      icon: FileText,
      color: 'bg-purple-500',
      href: '/procedimentos'
    },
    {
      title: 'Financeiro',
      description: 'Controle financeiro e pagamentos',
      icon: CreditCard,
      color: 'bg-orange-500',
      href: '/financeiro'
    }
  ]

  // KPIs do dashboard
  const kpis = [
    { title: 'Consultas Hoje', value: '12', change: '+2', icon: Calendar, color: 'text-blue-600' },
    { title: 'Pacientes Ativos', value: '486', change: '+12', icon: Users, color: 'text-green-600' },
    { title: 'Faturamento Mês', value: 'R$ 24.500', change: '+8%', icon: DollarSign, color: 'text-purple-600' },
    { title: 'Taxa de Comparecimento', value: '92%', change: '+3%', icon: UserCheck, color: 'text-orange-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Clínica Médica</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Badge de identificação do usuário */}
              <div className="flex items-center space-x-2">
                <Badge className={`${userTypeDisplay.color} border-0`}>
                  <UserIcon className="w-3 h-3 mr-1" />
                  {userTypeDisplay.label}
                </Badge>
                <span className="text-sm text-gray-600">{user.name}</span>
              </div>

              {/* Ações rápidas */}
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Saudação */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo(a), {user.name}!
          </h2>
          <p className="text-gray-600">
            Aqui está um resumo da sua clínica hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">{kpi.change}</span>
                      </div>
                    </div>
                    <Icon className={`w-8 h-8 ${kpi.color} opacity-20`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabs de conteúdo */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Acesso Rápido */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rápido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickAccessCards.map((card, index) => {
                  const Icon = card.icon
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{card.title}</h4>
                            <p className="text-sm text-gray-600">{card.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Atividades Recentes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Nova consulta agendada</p>
                        <p className="text-xs text-gray-600">Maria Silva - Hoje, 14:30</p>
                      </div>
                      <span className="text-xs text-gray-500">há 5 min</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Pagamento confirmado</p>
                        <p className="text-xs text-gray-600">João Santos - R$ 150,00</p>
                      </div>
                      <span className="text-xs text-gray-500">há 15 min</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Novo paciente cadastrado</p>
                        <p className="text-xs text-gray-600">Ana Oliveira</p>
                      </div>
                      <span className="text-xs text-gray-500">há 1 hora</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consultas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultas de Hoje</CardTitle>
                <CardDescription>Gerencie as consultas do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Maria Silva</p>
                        <p className="text-sm text-gray-600">Consulta de rotina</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">14:30</p>
                      <Badge variant="outline">Confirmado</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">João Santos</p>
                        <p className="text-sm text-gray-600">Retorno</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">15:00</p>
                      <Badge variant="outline">Confirmado</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pacientes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pacientes Recentes</CardTitle>
                <CardDescription>Últimos pacientes cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Ana Oliveira</p>
                        <p className="text-sm text-gray-600">ana@email.com</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Hoje</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento do Mês</CardTitle>
                  <CardDescription>Resumo financeiro mensal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Recebido</span>
                      <span className="font-medium">R$ 24.500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pendente</span>
                      <span className="font-medium">R$ 3.200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de Consultas</span>
                      <span className="font-medium">163</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formas de Pagamento</CardTitle>
                  <CardDescription>Distribuição dos pagamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">PIX</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cartão</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dinheiro</span>
                      <span className="font-medium">20%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}