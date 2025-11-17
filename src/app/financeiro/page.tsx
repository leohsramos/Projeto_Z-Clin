'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CreditCard, 
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react'
import { toast } from 'sonner'

interface Payment {
  id: string
  amount: number
  paymentMethod: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'BOLETO'
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  discount: number
  paidAt?: string
  createdAt: string
  appointment: {
    id: string
    date: string
    time: string
    patient: {
      name: string
    }
    procedure?: {
      name: string
    }
  }
}

interface FinancialSummary {
  totalReceived: number
  totalPending: number
  totalCancelled: number
  appointmentCount: number
  averageTicket: number
  paymentMethods: {
    PIX: number
    CARTAO: number
    DINHEIRO: number
    BOLETO: number
  }
}

export default function FinanceiroPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState('month')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    appointmentId: '',
    amount: '',
    paymentMethod: '',
    discount: '0'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadData()
  }, [isAuthenticated, router, periodFilter, statusFilter])

  const loadData = async () => {
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        fetch(`/api/payments?period=${periodFilter}&status=${statusFilter}`),
        fetch(`/api/payments/summary?period=${periodFilter}`)
      ])

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData)
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
      toast.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    const methods = {
      PIX: { label: 'PIX', color: 'bg-blue-100 text-blue-800' },
      CARTAO: { label: 'Cartão', color: 'bg-green-100 text-green-800' },
      DINHEIRO: { label: 'Dinheiro', color: 'bg-yellow-100 text-yellow-800' },
      BOLETO: { label: 'Boleto', color: 'bg-purple-100 text-purple-800' }
    }

    const methodConfig = methods[method as keyof typeof methods] || methods.PIX
    return (
      <Badge className={methodConfig.color}>
        {methodConfig.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      PAID: { label: 'Pago', variant: 'default' as const, icon: CheckCircle },
      CANCELLED: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const handleRegisterPayment = async () => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          discount: parseFloat(formData.discount)
        }),
      })

      if (response.ok) {
        toast.success('Pagamento registrado com sucesso!')
        setIsRegisterDialogOpen(false)
        setFormData({
          appointmentId: '',
          amount: '',
          paymentMethod: '',
          discount: '0'
        })
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao registrar pagamento')
      }
    } catch (error) {
      toast.error('Erro ao registrar pagamento')
    }
  }

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/confirm`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Pagamento confirmado com sucesso!')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao confirmar pagamento')
      }
    } catch (error) {
      toast.error('Erro ao confirmar pagamento')
    }
  }

  const handleExportReport = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Financeiro</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Pagamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                    <DialogDescription>
                      Preencha os dados para registrar um novo pagamento.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="appointment">Consulta</Label>
                      <Select value={formData.appointmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a consulta" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Aqui viriam as consultas pendentes de pagamento */}
                          <SelectItem value="1">Consulta - Maria Silva</SelectItem>
                          <SelectItem value="2">Consulta - João Santos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                      <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="CARTAO">Cartão</SelectItem>
                          <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                          <SelectItem value="BOLETO">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="discount">Desconto (R$)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleRegisterPayment} className="bg-purple-600 hover:bg-purple-700">
                      Registrar Pagamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PAID">Pagos</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
              <SelectItem value="CANCELLED">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Recebido</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {summary.totalReceived.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendente</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      R$ {summary.totalPending.toFixed(2)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {summary.averageTicket.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Consultas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {summary.appointmentCount}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="pagamentos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="resumo">Resumo Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="pagamentos" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : payments.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum pagamento encontrado</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {payment.appointment.patient.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{new Date(payment.appointment.date).toLocaleDateString('pt-BR')}</span>
                            <span>{payment.appointment.time}</span>
                            {payment.appointment.procedure && (
                              <span>{payment.appointment.procedure.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            R$ {(payment.amount - payment.discount).toFixed(2)}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getPaymentMethodBadge(payment.paymentMethod)}
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                        {payment.status === 'PENDING' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleConfirmPayment(payment.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="resumo" className="space-y-6">
            {summary && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Formas de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">PIX</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${summary.totalReceived > 0 ? (summary.paymentMethods.PIX / summary.totalReceived) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="font-medium">R$ {summary.paymentMethods.PIX.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cartão</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${summary.totalReceived > 0 ? (summary.paymentMethods.CARTAO / summary.totalReceived) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="font-medium">R$ {summary.paymentMethods.CARTAO.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dinheiro</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-600 h-2 rounded-full" 
                              style={{ 
                                width: `${summary.totalReceived > 0 ? (summary.paymentMethods.DINHEIRO / summary.totalReceived) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="font-medium">R$ {summary.paymentMethods.DINHEIRO.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Boleto</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ 
                                width: `${summary.totalReceived > 0 ? (summary.paymentMethods.BOLETO / summary.totalReceived) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="font-medium">R$ {summary.paymentMethods.BOLETO.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Resumo Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Recebido</span>
                        <span className="font-medium text-green-600">R$ {summary.totalReceived.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Pendente</span>
                        <span className="font-medium text-yellow-600">R$ {summary.totalPending.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Cancelado</span>
                        <span className="font-medium text-red-600">R$ {summary.totalCancelled.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-900 font-semibold">Total Geral</span>
                          <span className="font-bold text-lg">
                            R$ {(summary.totalReceived + summary.totalPending).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}