'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  User,
  FileText,
  Heart,
  TrendingUp,
  Activity,
  Plus,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  notes?: string
  patient: {
    id: string
    name: string
    phone?: string
    email?: string
  }
  procedure?: {
    name: string
    value: number
  }
}

interface Patient {
  id: string
  name: string
  phone?: string
  email?: string
  birthDate?: string
  lastVisit?: string
}

interface MedicalNote {
  id: string
  patientId: string
  date: string
  symptoms?: string
  diagnosis?: string
  prescription?: string
  observations?: string
  patient: {
    name: string
  }
}

export default function DraPanelPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [medicalNotes, setMedicalNotes] = useState<MedicalNote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [noteForm, setNoteForm] = useState({
    symptoms: '',
    diagnosis: '',
    prescription: '',
    observations: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Verificar se é a Dra. Josiane
    if (user?.userType !== 'DRA_JOSIANE') {
      router.push('/dashboard')
      return
    }

    loadData()
  }, [isAuthenticated, user, router])

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Carregar consultas de hoje
      const appointmentsRes = await fetch(`/api/appointments?date=${today}&doctorId=${user?.id}`)
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData)
      }

      // Carregar pacientes recentes
      const patientsRes = await fetch('/api/patients?recent=true')
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData)
      }

      // Carregar anotações médicas recentes
      const notesRes = await fetch(`/api/medical-notes?doctorId=${user?.id}`)
      if (notesRes.ok) {
        const notesData = await notesRes.json()
        setMedicalNotes(notesData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicalNote = async () => {
    if (!selectedAppointment) return

    try {
      const response = await fetch('/api/medical-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedAppointment.patient.id,
          appointmentId: selectedAppointment.id,
          ...noteForm
        }),
      })

      if (response.ok) {
        toast.success('Evolução médica registrada com sucesso!')
        setIsNoteDialogOpen(false)
        setNoteForm({
          symptoms: '',
          diagnosis: '',
          prescription: '',
          observations: ''
        })
        setSelectedAppointment(null)
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao registrar evolução')
      }
    } catch (error) {
      toast.error('Erro ao registrar evolução')
    }
  }

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Consulta marcada como realizada!')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atualizar consulta')
      }
    } catch (error) {
      toast.error('Erro ao atualizar consulta')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AGENDADO: { label: 'Agendado', variant: 'default' as const, icon: Clock },
      CONFIRMADO: { label: 'Confirmado', variant: 'secondary' as const, icon: CheckCircle },
      REALIZADO: { label: 'Realizado', variant: 'default' as const, icon: CheckCircle },
      FALTOU: { label: 'Faltou', variant: 'destructive' as const, icon: AlertCircle },
      CANCELADO: { label: 'Cancelado', variant: 'destructive' as const, icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.AGENDADO
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const todayAppointments = appointments.filter(apt => apt.status !== 'REALIZADO' && apt.status !== 'CANCELADO')
  const completedAppointments = appointments.filter(apt => apt.status === 'REALIZADO')

  if (!isAuthenticated || !user) {
    return null
  }

  if (user.userType !== 'DRA_JOSIANE') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Stethoscope className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-gray-600 mb-4">Este painel é exclusivo para a Dra. Josiane Canali.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Painel da Dra. Josiane</h1>
                  <p className="text-sm text-purple-600">Área Médica Exclusiva</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800 border-0">
                <Heart className="w-3 h-3 mr-1" />
                Dra. Josiane Canali
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Saudação */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bom dia, Dra. Josiane! 👩‍⚕️
          </h2>
          <p className="text-gray-600">
            Aqui está sua agenda e informações clínicas de hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* KPIs Médicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Consultas Hoje</p>
                  <p className="text-3xl font-bold">{todayAppointments.length}</p>
                  <p className="text-purple-100 text-sm mt-1">
                    {completedAppointments.length} realizadas
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Pacientes Ativos</p>
                  <p className="text-3xl font-bold">{patients.length}</p>
                  <p className="text-pink-100 text-sm mt-1">Em atendimento</p>
                </div>
                <Users className="w-8 h-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Faturamento Mês</p>
                  <p className="text-3xl font-bold">R$ 24.5k</p>
                  <p className="text-indigo-100 text-sm mt-1">+8% vs mês anterior</p>
                </div>
                <DollarSign className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Taxa de Presença</p>
                  <p className="text-3xl font-bold">92%</p>
                  <p className="text-green-100 text-sm mt-1">Excelente!</p>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agenda">Agenda do Dia</TabsTrigger>
            <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
            <TabsTrigger value="evolucoes">Evoluções</TabsTrigger>
            <TabsTrigger value="financeiro">Resumo Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Próximas Consultas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Próximas Consultas
                  </CardTitle>
                  <CardDescription>Consultas pendentes de hoje</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma consulta pendente</p>
                    </div>
                  ) : (
                    todayAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{appointment.patient.name}</h4>
                              <p className="text-sm text-gray-600">
                                {appointment.patient.phone || 'Sem telefone'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600">{appointment.time}</p>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                        {appointment.procedure && (
                          <p className="text-sm text-gray-600 mb-3">
                            Procedimento: {appointment.procedure.name}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setIsNoteDialogOpen(true)
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Registrar Evolução
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCompleteAppointment(appointment.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Realizada
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Consultas Realizadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Consultas Realizadas
                  </CardTitle>
                  <CardDescription>Atendimentos concluídos hoje</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completedAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma consulta realizada ainda</p>
                    </div>
                  ) : (
                    completedAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{appointment.patient.name}</h4>
                              <p className="text-sm text-gray-600">{appointment.time}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Realizada
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pacientes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Meus Pacientes
                </CardTitle>
                <CardDescription>Pacientes em atendimento regular</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patients.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{patient.name}</h4>
                            <p className="text-sm text-gray-600">
                              {patient.lastVisit 
                                ? `Última visita: ${new Date(patient.lastVisit).toLocaleDateString('pt-BR')}`
                                : 'Nova paciente'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {patient.phone && <p>📱 {patient.phone}</p>}
                          {patient.email && <p>✉️ {patient.email}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evolucoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Evoluções Médicas Recentes
                </CardTitle>
                <CardDescription>Anotações clínicas dos últimos dias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {medicalNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma evolução registrada recentemente</p>
                  </div>
                ) : (
                  medicalNotes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{note.patient.name}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(note.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {note.symptoms && (
                            <div>
                              <Label className="text-sm font-medium">Sintomas</Label>
                              <p className="text-sm">{note.symptoms}</p>
                            </div>
                          )}
                          {note.diagnosis && (
                            <div>
                              <Label className="text-sm font-medium">Diagnóstico</Label>
                              <p className="text-sm">{note.diagnosis}</p>
                            </div>
                          )}
                          {note.prescription && (
                            <div>
                              <Label className="text-sm font-medium">Prescrição</Label>
                              <p className="text-sm">{note.prescription}</p>
                            </div>
                          )}
                          {note.observations && (
                            <div>
                              <Label className="text-sm font-medium">Observações</Label>
                              <p className="text-sm">{note.observations}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Faturamento Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Recebido</span>
                      <span className="font-bold text-green-600">R$ 24.500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultas Realizadas</span>
                      <span className="font-bold">163</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Médio</span>
                      <span className="font-bold">R$ 150</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crescimento</span>
                      <span className="font-bold text-green-600">+8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Estatísticas Clínicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa de Comparecimento</span>
                      <span className="font-bold text-green-600">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Novos Pacientes</span>
                      <span className="font-bold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retornos</span>
                      <span className="font-bold">139</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Satisfação</span>
                      <span className="font-bold text-purple-600">4.9/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog para Evolução Médica */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Evolução Médica</DialogTitle>
            <DialogDescription>
              Preencha as informações clínicas do paciente.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="font-semibold">{selectedAppointment.patient.name}</p>
                <p className="text-sm text-gray-600">
                  Consulta: {selectedAppointment.time} - {selectedAppointment.procedure?.name || 'Consulta geral'}
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="symptoms">Sintomas</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Descreva os sintomas relatados pelo paciente"
                    value={noteForm.symptoms}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, symptoms: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Diagnóstico clínico"
                    value={noteForm.diagnosis}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prescription">Prescrição Médica</Label>
                  <Textarea
                    id="prescription"
                    placeholder="Medicamentos e dosagens prescritos"
                    value={noteForm.prescription}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, prescription: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    placeholder="Observações adicionais e recomendações"
                    value={noteForm.observations}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, observations: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddMedicalNote} className="bg-purple-600 hover:bg-purple-700">
                  Salvar Evolução
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}