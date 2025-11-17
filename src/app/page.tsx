'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { FullCalendar } from '@/components/full-calendar'
import { MaterialsManager } from '@/components/materials-manager'
import { PaymentMethodsManager } from '@/components/payment-methods-manager'
import { ProcedureMaterials } from '@/components/procedure-materials'
import { DateFilter } from '@/components/date-filter'
import { format } from 'date-fns'
import { validateCPF, formatCPF, applyCPFMask, validatePhone, formatPhone, applyPhoneVisualMask } from '@/lib/cpf-validation'
import { validateYear, validateMonth, validateDay, formatDateComplete, applyDateMask, validateCompleteDate } from '@/lib/date-validation'
import { 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  DollarSign,
  Activity,
  Plus,
  Edit,
  Trash2,
  Save,
  Search,
  Stethoscope,
  Heart,
  CalendarDays,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface Patient {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  dataNascimento: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  ultimaVisita: string
  createdAt: string
}

interface Procedure {
  id: string
  nome: string
  valor: number
  duracao: number
  descricao: string
  materiais: string
  sessoes: number
  emSessao: boolean
  materiaisUsados: Array<{
    id: string
    nome: string
    quantidade: number
  }>
  createdAt: string
}

interface Appointment {
  id: string
  pacienteId: string
  paciente: Patient
  procedimentoId: string
  procedimento: Procedure
  data: string
  horario: string
  status: string
  valor: number
  observacoes: string
  pagamentoRecebido: boolean
  formaPagamento: string
  createdAt: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userType, setUserType] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isAddProcedureOpen, setIsAddProcedureOpen] = useState(false)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  const [patientForm, setPatientForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  })

  const [cpfValidation, setCpfValidation] = useState<{ valid: boolean; message: string }>({ valid: false, message: '' })
  const [phoneValidation, setPhoneValidation] = useState<{ valid: boolean; message: string }>({ valid: false, message: '' })
  const [dateValidation, setDateValidation] = useState<{ valid: boolean; message: string }>({ valid: false, message: '' })
  const [yearValidation, setYearValidation] = useState<{ valid: boolean; message: string }>({ valid: false, message: '' })
  const [monthValidation, setMonthValidation] = useState<{ valid: boolean; message: string }>({ valid: false, message: '' })
  const [dayValidation, setDayValidation] = useState<{ valid: boolean; message: string }>({ valid: false, message: '' })

  const [procedureForm, setProcedureForm] = useState({
    nome: '',
    valor: '',
    duracao: '',
    descricao: '',
    materiais: '',
    sessoes: '',
    emSessao: false
  })

  const [appointmentForm, setAppointmentForm] = useState({
    pacienteId: '',
    procedimentoId: '',
    data: '',
    horario: '',
    status: 'AGENDADO',
    valor: '',
    observacoes: '',
    pagamentoRecebido: false,
    formaPagamento: ''
  })

  const [financeiroFilters, setFinanceiroFilters] = useState({
    formaPagamento: 'todas'
  })

  const [globalDateFilter, setGlobalDateFilter] = useState<{
    startDate: Date
    endDate: Date
  }>({
    startDate: new Date(2020, 0, 1),
    endDate: new Date(2030, 11, 31)
  })

  // Dados iniciais
  useEffect(() => {
    const mockPatients: Patient[] = [
      {
        id: '1',
        nome: 'Maria Silva',
        email: 'maria.silva@email.com',
        telefone: '11987654321',
        cpf: '529.982.247-25',
        dataNascimento: '1980-05-15',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        ultimaVisita: '15/11/2024',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        nome: 'João Santos',
        email: 'joao.santos@email.com',
        telefone: '1123456789',
        cpf: '852.643.910-58',
        dataNascimento: '1975-08-22',
        endereco: 'Avenida Paulista, 456',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        ultimaVisita: '10/11/2024',
        createdAt: '2024-02-20'
      }
    ]

    const mockProcedures: Procedure[] = [
      {
        id: '1',
        nome: 'Consulta de rotina',
        valor: 150,
        duracao: 30,
        descricao: 'Consulta médica geral de rotina',
        materiais: 'Ficha médica, caneta',
        sessoes: 1,
        emSessao: false,
        materiaisUsados: [],
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        nome: 'Retorno',
        valor: 120,
        duracao: 20,
        descricao: 'Consulta de retorno com avaliação',
        materiais: 'Ficha médica',
        sessoes: 1,
        emSessao: false,
        materiaisUsados: [],
        createdAt: '2024-01-01'
      },
      {
        id: '3',
        nome: 'Laser Capilar',
        valor: 200,
        duracao: 60,
        descricao: 'Tratamento completo com laser',
        materiais: 'Equipamento laser, produtos capilares',
        sessoes: 10,
        emSessao: true,
        materiaisUsados: [],
        createdAt: '2024-01-01'
      },
      {
        id: '4',
        nome: 'Limpeza de Pele Profunda',
        valor: 300,
        duracao: 90,
        descricao: 'Tratamento completo de limpeza e hidratação',
        materiais: 'Produtos de limpeza, hidratantes, máscaras',
        sessoes: 1,
        emSessao: false,
        materiaisUsados: [],
        createdAt: '2024-01-01'
      }
    ]

    const mockAppointments: Appointment[] = [
      {
        id: '1',
        pacienteId: '1',
        paciente: mockPatients[0],
        procedimentoId: '1',
        procedimento: mockProcedures[0],
        data: '2024-11-15',
        horario: '14:30',
        status: 'REALIZADO',
        valor: 150,
        observacoes: 'Paciente retorna para acompanhamento',
        pagamentoRecebido: true,
        formaPagamento: 'Cartão de Crédito',
        createdAt: '2024-11-10'
      },
      {
        id: '2',
        pacienteId: '2',
        paciente: mockPatients[1],
        procedimentoId: '2',
        procedimento: mockProcedures[1],
        data: '2024-11-15',
        horario: '15:00',
        status: 'AGENDADO',
        valor: 120,
        observacoes: '',
        pagamentoRecebido: false,
        formaPagamento: '',
        createdAt: '2024-11-12'
      }
    ]

    setPatients(mockPatients)
    setProcedures(mockProcedures)
    setAppointments(mockAppointments)
  }, [])

  const handleLogin = (tipo: string) => {
    setUserType(tipo)
    toast.success(`Acessando como ${tipo}...`)
    setTimeout(() => {
      setActiveTab('dashboard')
    }, 1000)
  }

  const handleBackToMain = () => {
    setUserType('')
    setActiveTab('dashboard')
    toast.success('Voltando ao menu principal...')
  }

  const handleCalendarDateClick = (date: Date) => {
    toast.info(`Selecionado: ${format(date, 'dd/MM/yyyy')}`)
  }

  const handleCalendarAddAppointment = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    setAppointmentForm({
      pacienteId: '',
      procedimentoId: '',
      data: dateStr,
      horario: time,
      status: 'AGENDADO',
      valor: '',
      observacoes: '',
      pagamentoRecebido: false,
      formaPagamento: ''
    })
    setEditingAppointment(null)
    setIsAddAppointmentOpen(true)
    setActiveTab('consultas')
    toast.success(`Redirecionando para agendamento: ${format(date, 'dd/MM/yyyy')} às ${time}`)
  }

  const handleGlobalDateFilter = (startDate: Date, endDate: Date) => {
    setGlobalDateFilter({ startDate, endDate })
    toast.success(`Filtro aplicado: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`)
  }

  // Função para lidar com mudança no CPF com validação em tempo real
  const handleCPFChange = (value: string) => {
    const maskedValue = applyCPFMask(value)
    setPatientForm(prev => ({ ...prev, cpf: maskedValue }))
    
    // Validar CPF apenas se tiver 11 dígitos
    const numbers = maskedValue.replace(/\D/g, '')
    if (numbers.length === 11) {
      const validation = validateCPF(maskedValue)
      setCpfValidation(validation)
    } else if (numbers.length > 0) {
      setCpfValidation({ valid: false, message: 'CPF incompleto' })
    } else {
      setCpfValidation({ valid: false, message: '' })
    }
  }

  // Função para lidar com mudança no telefone com validação em tempo real
  const handlePhoneChange = (value: string) => {
    // Permite digitação completa sem máscara durante a digitação
    const cleanValue = value.replace(/\D/g, '')
    setPatientForm(prev => ({ ...prev, telefone: cleanValue }))
    
    // Validar telefone apenas se tiver 10 ou 11 dígitos
    if (cleanValue.length === 10 || cleanValue.length === 11) {
      const validation = validatePhone(cleanValue)
      setPhoneValidation(validation)
    } else if (cleanValue.length > 0) {
      setPhoneValidation({ valid: false, message: 'Telefone incompleto' })
    } else {
      setPhoneValidation({ valid: false, message: '' })
    }
  }

  // Função para lidar com mudança no ano
  const handleYearChange = (value: string) => {
    const maskedValue = applyDateMask(value, 'year')
    setPatientForm(prev => ({ ...prev, dataNascimento: prev.dataNascimento.replace(/\d{4}$/, `${maskedValue}` }))
    
    // Validar ano apenas se tiver 4 dígitos
    if (maskedValue.length === 4) {
      const validation = validateYear(maskedValue)
      setYearValidation(validation)
    } else if (maskedValue.length > 0) {
      setYearValidation({ valid: false, message: 'Ano incompleto' })
    } else {
      setYearValidation({ valid: false, message: '' })
    }
  }

  // Função para lidar com mudança no mês
  const handleMonthChange = (value: string) => {
    const maskedValue = applyDateMask(value, 'month')
    setPatientForm(prev => ({ ...prev, dataNascimento: prev.dataNascimento.replace(/\/\d{4}$/, `/${maskedValue}`) }))
    
    // Validar mês apenas se tiver 1 ou 2 dígitos
    if (maskedValue.length === 1 || maskedValue.length === 2) {
      const validation = validateMonth(maskedValue)
      setMonthValidation(validation)
    } else if (maskedValue.length > 0) {
      setMonthValidation({ valid: false, message: 'Mês incompleto' })
    } else {
      setMonthValidation({ valid: false, message: '' })
    }
  }

  // Função para lidar com mudança no dia
  const handleDayChange = (value: string) => {
    const maskedValue = applyDateMask(value, 'day')
    setPatientForm(prev => ({ ...prev, dataNascimento: prev.dataNascimento.replace(/\/\d{2}\/\d{4}/, `/${maskedValue}`) }))
    
    // Validar dia apenas se tiver 1 ou 2 dígitos
    if (maskedValue.length === 1 || maskedValue.length === 2) {
      const monthNum = parseInt(patientForm.dataNascimento.split('/')[1]) || 1
      const yearNum = parseInt(patientForm.dataNascimento.split('/')[2]) || 2024
      
      const validation = validateDay(maskedValue, monthNum, yearNum)
      setDayValidation(validation)
    } else if (maskedValue.length > 0) {
      setDayValidation({ valid: false, message: 'Dia incompleto' })
    } else {
      setDayValidation({ valid: false, message: '' })
    }
  }

  // Função para validar data completa quando todos os campos estiverem preenchidos
  const validateCompleteDateOfBirth = (): { valid: boolean; message: string } => {
    const { day, month, year } = patientForm.dataNascimento.split('/')
    
    // Validar data completa
    const dateValidation = validateCompleteDate(`${day}/${month}/${year}`)
    if (!dateValidation.valid) {
      return dateValidation
    }
    
    // Validar componentes individualmente
    if (!yearValidation.valid) {
      return yearValidation
    }
    
    if (!monthValidation.valid) {
      return monthValidation
    }
    
    if (!dayValidation.valid) {
      return dayValidation
    }
    
    return { valid: true, message: 'Data de nascimento válida' }
  }

  // Função para verificar se um horário está disponível considerando a duração do procedimento
  const checkTimeSlotAvailability = (
    startTime: string, 
    duration: number, 
    date: string, 
    existingAppointments: Appointment[]
  ): { available: boolean; conflictingSlots: string[]; reason?: string } => {
    // Converter horário de início para minutos
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const startTotalMinutes = startHour * 60 + startMinute
    
    // Calcular horário de fim
    const endTotalMinutes = startTotalMinutes + duration
    
    // Verificar se o procedimento termina após as 18:00 (1080 minutos)
    if (endTotalMinutes > 1080) {
      return {
        available: false,
        conflictingSlots: [],
        reason: `Procedimento de ${duration} minutos terminaria às ${Math.floor(endTotalMinutes / 60).toString().padStart(2, '0')}:${(endTotalMinutes % 60).toString().padStart(2, '0')}, que é após o horário de funcionamento (18:00)`
      }
    }
    
    // Gerar todos os slots de 30 minutos que o procedimento ocupará
    const requiredSlots: string[] = []
    let currentMinutes = startTotalMinutes
    
    while (currentMinutes < endTotalMinutes) {
      const hour = Math.floor(currentMinutes / 60)
      const minute = currentMinutes % 60
      const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      requiredSlots.push(slotTime)
      currentMinutes += 30 // Slots de 30 em 30 minutos
    }
    
    // Verificar conflitos com agendamentos existentes
    const conflictingSlots: string[] = []
    
    for (const slot of requiredSlots) {
      const hasConflict = existingAppointments.some(apt => 
        apt.data === date && apt.horario === slot
      )
      
      if (hasConflict) {
        conflictingSlots.push(slot)
      }
    }
    
    return {
      available: conflictingSlots.length === 0,
      conflictingSlots,
      reason: conflictingSlots.length > 0 
        ? `Conflito nos horários: ${conflictingSlots.join(', ')} já estão agendados`
        : undefined
    }
  }

  // Função para obter horários disponíveis considerando a duração do procedimento
  const getAvailableTimeSlots = (duration: number, date: string, existingAppointments: Appointment[]): string[] => {
    const availableSlots: string[] = []
    const startHour = 8
    const endHour = 18
    const slotInterval = 30
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        const availability = checkTimeSlotAvailability(timeString, duration, date, existingAppointments)
        
        if (availability.available) {
          availableSlots.push(timeString)
        }
      }
    }
    
    return availableSlots
  }

  // Funções de filtragem baseadas no filtro global
  const getFilteredPatients = () => {
    return patients.filter(patient => {
      const patientDate = new Date(patient.createdAt)
      return patientDate >= globalDateFilter.startDate && patientDate <= globalDateFilter.endDate
    })
  }

  const getFilteredProcedures = () => {
    return procedures.filter(procedure => {
      const procedureDate = new Date(procedure.createdAt)
      return procedureDate >= globalDateFilter.startDate && procedureDate <= globalDateFilter.endDate
    })
  }

  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.data)
      return appointmentDate >= globalDateFilter.startDate && appointmentDate <= globalDateFilter.endDate
    })
  }

  const getFilteredPatientsByLastVisit = () => {
    return patients.filter(patient => {
      if (!patient.ultimaVisita) return false
      const lastVisitDate = new Date(patient.ultimaVisita.split('/').reverse().join('-'))
      return lastVisitDate >= globalDateFilter.startDate && lastVisitDate <= globalDateFilter.endDate
    })
  }

  const handleAddPatient = () => {
    if (!patientForm.nome || !patientForm.email) {
      toast.error('Preencha nome e email do paciente')
      return
    }

    // Validação completa de CPF
    if (!cpfValidation.valid) {
      toast.error(`CPF inválido: ${cpfValidation.message}`)
      return
    }

    // Validação completa de telefone
    if (!phoneValidation.valid) {
      toast.error(`Telefone inválido: ${phoneValidation.message}`)
      return
    }

    // Validação completa de data de nascimento
    const dateValidation = validateCompleteDateOfBirth()
    if (!dateValidation.valid) {
      toast.error(`Data de nascimento inválida: ${dateValidation.message}`)
      return
    }

    const newPatient: Patient = {
      id: Date.now().toString(),
      ...patientForm,
      cpf: formatCPF(patientForm.cpf),
      telefone: formatPhone(patientForm.telefone),
      dataNascimento: formatDateComplete(
        patientForm.dataNascimento.split('/')[0] || '01',
        patientForm.dataNascimento.split('/')[1] || '01',
        patientForm.dataNascimento.split('/')[2] || '2024'
      ),
      ultimaVisita: '',
      createdAt: new Date().toISOString().split('T')[0]
    }

    if (editingPatient) {
      setPatients(patients.map(p => p.id === editingPatient.id ? { ...newPatient, id: editingPatient.id } : p))
      toast.success('Paciente atualizado com sucesso!')
    } else {
      setPatients([...patients, newPatient])
      toast.success('Paciente adicionado com sucesso!')
    }

    setPatientForm({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: ''
    })
    setCpfValidation({ valid: false, message: '' })
    setPhoneValidation({ valid: false, message: '' })
    setEditingPatient(null)
    setIsAddPatientOpen(false)
  }

  const handleAddProcedure = () => {
    if (!procedureForm.nome || !procedureForm.valor || !procedureForm.duracao) {
      toast.error('Preencha nome, valor e duração')
      return
    }

    const newProcedure: Procedure = {
      id: Date.now().toString(),
      nome: procedureForm.nome,
      valor: parseFloat(procedureForm.valor),
      duracao: parseInt(procedureForm.duracao),
      descricao: procedureForm.descricao,
      materiais: procedureForm.materiais,
      sessoes: parseInt(procedureForm.sessoes) || 1,
      emSessao: procedureForm.emSessao,
      materiaisUsados: [],
      createdAt: new Date().toISOString().split('T')[0]
    }

    if (editingProcedure) {
      setProcedures(procedures.map(p => p.id === editingProcedure.id ? { ...newProcedure, id: editingProcedure.id } : p))
      toast.success('Procedimento atualizado com sucesso!')
    } else {
      setProcedures([...procedures, newProcedure])
      toast.success('Procedimento adicionado com sucesso!')
    }

    setProcedureForm({
      nome: '',
      valor: '',
      duracao: '',
      descricao: '',
      materiais: '',
      sessoes: '',
      emSessao: false
    })
    setEditingProcedure(null)
    setIsAddProcedureOpen(false)
  }

  const handleAddAppointment = () => {
    if (!appointmentForm.pacienteId || !appointmentForm.data || !appointmentForm.horario) {
      toast.error('Preencha paciente, data e horário')
      return
    }

    // Validação de pagamento recebido
    if (appointmentForm.pagamentoRecebido && !appointmentForm.formaPagamento) {
      toast.error('Se o pagamento foi recebido, informe a forma de pagamento')
      return
    }

    // Validação de data
    const selectedDate = new Date(appointmentForm.data)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 100)

    if (selectedDate < today) {
      toast.error('A data da consulta não pode ser anterior à data atual')
      return
    }

    if (selectedDate > maxDate) {
      toast.error('A data da consulta não pode ser superior a 100 anos no futuro')
      return
    }

    const selectedPatient = patients.find(p => p.id === appointmentForm.pacienteId)
    const selectedProcedure = procedures.find(p => p.id === appointmentForm.procedimentoId)

    if (!selectedProcedure) {
      toast.error('Selecione um procedimento válido')
      return
    }

    // Verificar disponibilidade do horário considerando a duração do procedimento
    const availability = checkTimeSlotAvailability(
      appointmentForm.horario,
      selectedProcedure.duracao,
      appointmentForm.data,
      appointments
    )

    if (!availability.available) {
      toast.error(`Horário não disponível: ${availability.reason}`)
      return
    }

    // Calcular horário de término do procedimento
    const [startHour, startMinute] = appointmentForm.horario.split(':').map(Number)
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = startTotalMinutes + selectedProcedure.duracao
    const endHour = Math.floor(endTotalMinutes / 60)
    const endMinute = endTotalMinutes % 60
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

    // Criar o agendamento principal
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      pacienteId: appointmentForm.pacienteId,
      paciente: selectedPatient!,
      procedimentoId: appointmentForm.procedimentoId,
      procedimento: selectedProcedure,
      data: appointmentForm.data,
      horario: appointmentForm.horario,
      status: appointmentForm.status,
      valor: selectedProcedure.valor,
      observacoes: `${appointmentForm.observacoes}\n\n[Procedimento: ${appointmentForm.horario} - ${endTime}]`,
      pagamentoRecebido: appointmentForm.pagamentoRecebido,
      formaPagamento: appointmentForm.formaPagamento,
      createdAt: new Date().toISOString().split('T')[0]
    }

    // Criar agendamentos bloqueados para os slots subsequentes (para controle visual)
    const blockedAppointments: Appointment[] = []
    let currentMinutes = startTotalMinutes + 30 // Próximo slot após o início
    
    while (currentMinutes < endTotalMinutes) {
      const hour = Math.floor(currentMinutes / 60)
      const minute = currentMinutes % 60
      const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      // Criar agendamento "bloqueado" para controle visual
      const blockedAppointment: Appointment = {
        id: `blocked_${Date.now()}_${currentMinutes}`,
        pacienteId: 'blocked',
        paciente: {
          id: 'blocked',
          nome: '[BLOQUEADO]',
          email: '',
          telefone: '',
          cpf: '',
          dataNascimento: '',
          endereco: '',
          cidade: '',
          estado: '',
          cep: '',
          ultimaVisita: '',
          createdAt: new Date().toISOString().split('T')[0]
        },
        procedimentoId: selectedProcedure.id,
        procedimento: selectedProcedure,
        data: appointmentForm.data,
        horario: slotTime,
        status: 'BLOQUEADO',
        valor: 0,
        observacoes: `Horário bloqueado pelo procedimento "${selectedProcedure.nome}" iniciado às ${appointmentForm.horario}`,
        pagamentoRecebido: false,
        formaPagamento: '',
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      blockedAppointments.push(blockedAppointment)
      currentMinutes += 30
    }

    // Adicionar todos os agendamentos
    if (editingAppointment) {
      // Para edição, primeiro remover os agendamentos antigos
      const appointmentsWithoutOld = appointments.filter(a => 
        a.id !== editingAppointment.id && !a.id.startsWith('blocked_')
      )
      
      // Adicionar o novo agendamento e os bloqueios
      setAppointments([...appointmentsWithoutOld, newAppointment, ...blockedAppointments])
      toast.success('Consulta atualizada com sucesso!')
    } else {
      setAppointments([...appointments, newAppointment, ...blockedAppointments])
      toast.success(`Consulta agendada com sucesso! (${appointmentForm.horario} - ${endTime})`)
    }

    setAppointmentForm({
      pacienteId: '',
      procedimentoId: '',
      data: '',
      horario: '',
      status: 'AGENDADO',
      valor: '',
      observacoes: '',
      pagamentoRecebido: false,
      formaPagamento: ''
    })
    setEditingAppointment(null)
    setIsAddAppointmentOpen(false)
  }

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient)
    
    // Extrair apenas números do telefone para edição
    const phoneNumbers = patient.telefone.replace(/\D/g, '')
    
    setPatientForm({
      nome: patient.nome,
      email: patient.email,
      telefone: phoneNumbers,
      cpf: patient.cpf,
      dataNascimento: patient.dataNascimento,
      endereco: patient.endereco,
      cidade: patient.cidade,
      estado: patient.estado,
      cep: patient.cep
    })
    
    // Validar o CPF existente
    const cpfValidationResult = validateCPF(patient.cpf)
    setCpfValidation(cpfValidationResult)
    
    // Validar o telefone existente
    const phoneValidationResult = validatePhone(patient.telefone)
    setPhoneValidation(phoneValidationResult)
    
    // Validar a data de nascimento existente
    const dateValidationResult = validateCompleteDate(patient.dataNascimento)
    setDateValidation(dateValidationResult)
    
    // Validar componentes individuais da data
    const [day, month, year] = patient.dataNascimento.split('/')
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    
    const yearValidationResult = validateYear(year)
    setYearValidation(yearValidationResult)
    
    const monthValidationResult = validateMonth(month)
    setMonthValidation(monthValidationResult)
    
    const dayValidationResult = validateDay(day, monthNum, yearNum)
    setDayValidation(dayValidationResult)
    
    setIsAddPatientOpen(true)
  }

  const handleEditProcedure = (procedure: Procedure) => {
    setEditingProcedure(procedure)
    setProcedureForm({
      nome: procedure.nome,
      valor: procedure.valor.toString(),
      duracao: procedure.duracao.toString(),
      descricao: procedure.descricao,
      materiais: procedure.materiais,
      sessoes: procedure.sessoes.toString(),
      emSessao: procedure.emSessao
    })
    setIsAddProcedureOpen(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setAppointmentForm({
      pacienteId: appointment.pacienteId,
      procedimentoId: appointment.procedimentoId,
      data: appointment.data,
      horario: appointment.horario,
      status: appointment.status,
      valor: appointment.valor.toString(),
      observacoes: appointment.observacoes,
      pagamentoRecebido: appointment.pagamentoRecebido,
      formaPagamento: appointment.formaPagamento
    })
    setIsAddAppointmentOpen(true)
  }

  const handleDeletePatient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      setPatients(patients.filter(p => p.id !== id))
      toast.success('Paciente excluído com sucesso!')
    }
  }

  const handleDeleteProcedure = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      setProcedures(procedures.filter(p => p.id !== id))
      toast.success('Procedimento excluído com sucesso!')
    }
  }

  const handleDeleteAppointment = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta consulta?')) {
      // Encontrar o agendamento principal para obter data e horário
      const appointmentToDelete = appointments.find(a => a.id === id)
      
      if (appointmentToDelete) {
        // Remover o agendamento principal e todos os bloqueios relacionados
        setAppointments(appointments.filter(a => 
          a.id !== id && 
          !(a.id.startsWith('blocked_') && 
            a.data === appointmentToDelete.data && 
            a.procedimentoId === appointmentToDelete.procedimentoId &&
            a.observacoes.includes(`iniciado às ${appointmentToDelete.horario}`))
        ))
        toast.success('Consulta e horários bloqueados removidos com sucesso!')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AGENDADO: { label: 'Agendado', variant: 'secondary' },
      CONFIRMADO: { label: 'Confirmado', variant: 'default' },
      REALIZADO: { label: 'Realizado', variant: 'default' },
      FALTOU: { label: 'Faltou', variant: 'destructive' },
      CANCELADO: { label: 'Cancelado', variant: 'destructive' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.AGENDADO
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredPatients = getFilteredPatients().filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProcedures = getFilteredProcedures().filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAppointments = getFilteredAppointments().filter(a => 
    a.status !== 'BLOQUEADO' && 
    a.paciente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFilteredFinancialData = () => {
    let filteredAppointments = getFilteredAppointments().filter(a => a.pagamentoRecebido && a.status !== 'BLOQUEADO')
    
    // Filtrar por forma de pagamento
    if (financeiroFilters.formaPagamento !== 'todas') {
      filteredAppointments = filteredAppointments.filter(a => a.formaPagamento === financeiroFilters.formaPagamento)
    }
    
    return filteredAppointments
  }

  const getFinancialSummary = () => {
    const filteredData = getFilteredFinancialData()
    
    const summary = {
      totalRecebido: filteredData.reduce((sum, a) => sum + a.valor, 0),
      totalConsultas: filteredData.length,
      formasPagamento: {} as Record<string, { count: number; total: number }>
    }
    
    // Agrupar por forma de pagamento
    filteredData.forEach(appointment => {
      const forma = appointment.formaPagamento || 'Não informado'
      if (!summary.formasPagamento[forma]) {
        summary.formasPagamento[forma] = { count: 0, total: 0 }
      }
      summary.formasPagamento[forma].count++
      summary.formasPagamento[forma].total += appointment.valor
    })
    
    return summary
  }

  const dashboardData = {
    totalPatients: getFilteredPatients().length,
    totalProcedures: getFilteredProcedures().length,
    totalAppointments: getFilteredAppointments().length,
    todayAppointments: getFilteredAppointments().filter(a => a.data === new Date().toISOString().split('T')[0]).length,
    completedAppointments: getFilteredAppointments().filter(a => a.status === 'REALIZADO').length,
    monthlyRevenue: getFilteredAppointments().filter(a => a.pagamentoRecebido).reduce((sum, a) => sum + a.valor, 0),
    pendingPayments: getFilteredAppointments().filter(a => !a.pagamentoRecebido && a.status === 'REALIZADO').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleBackToMain}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Clínica Médica</h1>
            </div>
            
            {userType && (
              <Badge className="bg-purple-100 text-purple-800 border-0">
                <Stethoscope className="w-3 h-3 mr-1" />
                {userType}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!userType ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-md shadow-xl border-0">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Bem-vindo!
                </CardTitle>
                <CardDescription>
                  Selecione o tipo de acesso para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleLogin('Dra. Josiane Canali')}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium text-lg"
                  >
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Dra. Josiane Canali
                  </Button>
                  
                  <Button 
                    onClick={() => handleLogin('Financeiro')}
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium text-lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Financeiro
                  </Button>
                  
                  <Button 
                    onClick={() => handleLogin('Secretaria')}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-lg"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Secretaria
                  </Button>
                  
                  <Button 
                    onClick={() => handleLogin('Desenvolvedor')}
                    className="w-full h-14 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white font-medium text-lg"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Desenvolvedor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo(a), {userType}!
              </h2>
              <p className="text-gray-600 mb-4">
                Sistema completo de gestão da clínica médica
              </p>
              <div className="max-w-xs mx-auto">
                <DateFilter onFilterChange={handleGlobalDateFilter} />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
                <TabsTrigger value="procedimentos">Procedimentos</TabsTrigger>
                <TabsTrigger value="materiais">Materiais</TabsTrigger>
                <TabsTrigger value="meios-pagamento">Meios Pagto</TabsTrigger>
                <TabsTrigger value="calendario">Calendário</TabsTrigger>
                <TabsTrigger value="consultas">Consultas</TabsTrigger>
                <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Pacientes</p>
                          <p className="text-3xl font-bold">{dashboardData.totalPatients}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Consultas</p>
                          <p className="text-3xl font-bold">{dashboardData.totalAppointments}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Faturamento</p>
                          <p className="text-3xl font-bold">R$ {dashboardData.monthlyRevenue.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">Hoje</p>
                          <p className="text-3xl font-bold">{dashboardData.todayAppointments}</p>
                        </div>
                        <Activity className="w-8 h-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100">Pagamentos Pendentes</p>
                          <p className="text-3xl font-bold">{dashboardData.pendingPayments}</p>
                        </div>
                        <Clock className="w-8 h-8 text-red-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Pacientes Tab */}
              <TabsContent value="pacientes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Buscar pacientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Paciente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingPatient ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
                        </DialogTitle>
                        <DialogDescription>
                          Preencha os dados do paciente
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                              id="nome"
                              value={patientForm.nome}
                              onChange={(e) => setPatientForm(prev => ({ ...prev, nome: e.target.value }))}
                              placeholder="Nome completo"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                              id="email"
                              type="email"
                              value={patientForm.email}
                              onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="email@exemplo.com"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input
                              id="telefone"
                              value={patientForm.telefone}
                              onChange={(e) => handlePhoneChange(e.target.value)}
                              placeholder="Digite apenas números (ex: 11987654321)"
                              maxLength={11}
                              className={phoneValidation.message ? (phoneValidation.valid ? 'border-green-500' : 'border-red-500') : ''}
                            />
                            {phoneValidation.message && (
                              <p className={`text-xs ${phoneValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                                {phoneValidation.message}
                              </p>
                            )}
                            {phoneValidation.valid && (
                              <p className="text-xs text-green-600">
                                Formatado: {formatPhone(patientForm.telefone)}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input
                              id="cpf"
                              value={patientForm.cpf}
                              onChange={(e) => handleCPFChange(e.target.value)}
                              placeholder="000.000.000-00"
                              maxLength={14}
                              className={cpfValidation.message ? (cpfValidation.valid ? 'border-green-500' : 'border-red-500') : ''}
                            />
                            {cpfValidation.message && (
                              <p className={`text-xs ${cpfValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                                {cpfValidation.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                          <Input
                            id="dataNascimento"
                            type="date"
                            value={patientForm.dataNascimento}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, dataNascimento: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endereco">Endereço</Label>
                          <Input
                            id="endereco"
                            value={patientForm.endereco}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, endereco: e.target.value }))}
                            placeholder="Rua, número"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input
                              id="cidade"
                              value={patientForm.cidade}
                              onChange={(e) => setPatientForm(prev => ({ ...prev, cidade: e.target.value }))}
                              placeholder="Cidade"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Input
                              id="estado"
                              value={patientForm.estado}
                              onChange={(e) => setPatientForm(prev => ({ ...prev, estado: e.target.value }))}
                              placeholder="UF"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input
                              id="cep"
                              value={patientForm.cep}
                              onChange={(e) => setPatientForm(prev => ({ ...prev, cep: e.target.value }))}
                              placeholder="00000-000"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddPatient} className="bg-purple-600 hover:bg-purple-700">
                          <Save className="w-4 h-4 mr-2" />
                          {editingPatient ? 'Atualizar' : 'Salvar'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{patient.nome}</h3>
                            <p className="text-sm text-gray-600">{patient.email}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditPatient(patient)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeletePatient(patient.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><strong>Telefone:</strong> {patient.telefone}</p>
                          <p><strong>CPF:</strong> {patient.cpf}</p>
                          <p><strong>Última visita:</strong> {patient.ultimaVisita}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Procedimentos Tab */}
              <TabsContent value="procedimentos" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Buscar procedimentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Dialog open={isAddProcedureOpen} onOpenChange={setIsAddProcedureOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Procedimento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProcedure ? 'Editar Procedimento' : 'Adicionar Novo Procedimento'}
                        </DialogTitle>
                        <DialogDescription>
                          Cadastre os dados do procedimento
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="nomeProc">Nome</Label>
                          <Input
                            id="nomeProc"
                            value={procedureForm.nome}
                            onChange={(e) => setProcedureForm(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Nome do procedimento"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="valor">Valor (R$)</Label>
                            <Input
                              id="valor"
                              type="number"
                              value={procedureForm.valor}
                              onChange={(e) => setProcedureForm(prev => ({ ...prev, valor: e.target.value }))}
                              placeholder="0,00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duracao">Duração (min)</Label>
                            <Input
                              id="duracao"
                              type="number"
                              value={procedureForm.duracao}
                              onChange={(e) => setProcedureForm(prev => ({ ...prev, duracao: e.target.value }))}
                              placeholder="30"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="descricao">Descrição</Label>
                          <Textarea
                            id="descricao"
                            value={procedureForm.descricao}
                            onChange={(e) => setProcedureForm(prev => ({ ...prev, descricao: e.target.value }))}
                            placeholder="Descrição do procedimento"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="materiais">Materiais</Label>
                          <Textarea
                            id="materiais"
                            value={procedureForm.materiais}
                            onChange={(e) => setProcedureForm(prev => ({ ...prev, materiais: e.target.value }))}
                            placeholder="Materiais necessários"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sessoes">Nº de Sessões</Label>
                            <Input
                              id="sessoes"
                              type="number"
                              value={procedureForm.sessoes}
                              onChange={(e) => setProcedureForm(prev => ({ ...prev, sessoes: e.target.value }))}
                              placeholder="1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emSessao">Em Sessão?</Label>
                            <select
                              id="emSessao"
                              value={procedureForm.emSessao.toString()}
                              onChange={(e) => setProcedureForm(prev => ({ ...prev, emSessao: e.target.value === 'true' }))}
                              className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Valor Total</Label>
                          <Input
                            value={`R$ ${(parseFloat(procedureForm.valor || '0') * parseInt(procedureForm.sessoes || '1')).toFixed(2)}`}
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddProcedureOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddProcedure} className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          {editingProcedure ? 'Atualizar' : 'Salvar'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProcedures.map((procedure) => (
                    <Card key={procedure.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{procedure.nome}</h3>
                            <p className="text-2xl font-bold text-green-600">R$ {procedure.valor.toFixed(2)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditProcedure(procedure)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteProcedure(procedure.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><strong>Duração:</strong> {procedure.duracao} minutos</p>
                          <p><strong>Descrição:</strong> {procedure.descricao}</p>
                          <p><strong>Materiais:</strong> {procedure.materiais}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Gestão de Materiais do Procedimento */}
                {editingProcedure && (
                  <div className="mt-6">
                    <ProcedureMaterials 
                      materials={editingProcedure.materiaisUsados}
                      onMaterialsUpdate={(materials) => {
                        if (editingProcedure) {
                          setProcedures(procedures.map(p => 
                            p.id === editingProcedure.id 
                              ? { ...p, materiaisUsados: materials }
                              : p
                          ))
                          toast.success('Materiais do procedimento atualizados!')
                        }
                      }}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Materiais Tab */}
              <TabsContent value="materiais" className="space-y-4">
                <MaterialsManager onAddMaterial={(material) => {
                  console.log('Material adicionado:', material)
                  toast.success('Material gerenciado com sucesso!')
                }} />
              </TabsContent>

              {/* Meios de Pagamento Tab */}
              <TabsContent value="meios-pagamento" className="space-y-4">
                <PaymentMethodsManager onAddPaymentMethod={(method) => {
                  console.log('Meio de pagamento adicionado:', method)
                  toast.success('Meio de pagamento gerenciado com sucesso!')
                }} />
              </TabsContent>

              {/* Calendário Tab */}
              <TabsContent value="calendario" className="space-y-4">
                <FullCalendar 
                  appointments={appointments}
                  procedures={procedures}
                  onDateClick={handleCalendarDateClick}
                  onAddAppointment={handleCalendarAddAppointment}
                />
              </TabsContent>

              {/* Consultas Tab */}
              <TabsContent value="consultas" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Buscar consultas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Consulta
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAppointment ? 'Editar Consulta' : 'Agendar Nova Consulta'}
                        </DialogTitle>
                        <DialogDescription>
                          Preencha os dados da consulta
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="paciente">Paciente</Label>
                            <Select value={appointmentForm.pacienteId} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, pacienteId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o paciente" />
                              </SelectTrigger>
                              <SelectContent>
                                {patients.map((patient) => (
                                  <SelectItem key={patient.id} value={patient.id}>
                                    {patient.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="procedimento">Procedimento</Label>
                            <Select value={appointmentForm.procedimentoId} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, procedimentoId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o procedimento" />
                              </SelectTrigger>
                              <SelectContent>
                                {procedures.map((procedure) => (
                                  <SelectItem key={procedure.id} value={procedure.id}>
                                    {procedure.nome} - R$ {procedure.valor.toFixed(2)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <Input
                              id="data"
                              type="date"
                              value={appointmentForm.data}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, data: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="horario">Horário</Label>
                            <Input
                              id="horario"
                              type="time"
                              value={appointmentForm.horario}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, horario: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={appointmentForm.status} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AGENDADO">Agendado</SelectItem>
                              <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                              <SelectItem value="REALIZADO">Realizado</SelectItem>
                              <SelectItem value="FALTOU">Faltou</SelectItem>
                              <SelectItem value="CANCELADO">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="observacoes">Observações</Label>
                          <Textarea
                            id="observacoes"
                            value={appointmentForm.observacoes}
                            onChange={(e) => setAppointmentForm(prev => ({ ...prev, observacoes: e.target.value }))}
                            placeholder="Observações sobre a consulta"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pagamentoRecebido">Pagamento Recebido</Label>
                            <Select value={appointmentForm.pagamentoRecebido.toString()} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, pagamentoRecebido: value === 'true' }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Sim</SelectItem>
                                <SelectItem value="false">Não</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                            <Select value={appointmentForm.formaPagamento} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, formaPagamento: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                                <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                                <SelectItem value="PIX">PIX</SelectItem>
                                <SelectItem value="Transferência">Transferência</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddAppointmentOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddAppointment} className="bg-blue-600 hover:bg-blue-700">
                          <Save className="w-4 h-4 mr-2" />
                          {editingAppointment ? 'Atualizar' : 'Agendar'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.paciente.nome}</h3>
                            <p className="text-sm text-gray-600">{appointment.procedimento.nome}</p>
                            <p className="text-sm text-gray-600">{appointment.data} às {appointment.horario}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(appointment.status)}
                            {appointment.pagamentoRecebido ? (
                              <Badge className="bg-green-100 text-green-800 border-0">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Pago
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-0">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditAppointment(appointment)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><strong>Valor:</strong> R$ {appointment.valor.toFixed(2)}</p>
                          {appointment.formaPagamento && <p><strong>Forma Pagamento:</strong> {appointment.formaPagamento}</p>}
                          {appointment.observacoes && <p><strong>Observações:</strong> {appointment.observacoes}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Financeiro Tab */}
              <TabsContent value="financeiro" className="space-y-4">
                {/* Filtro de Forma de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle>Filtro de Forma de Pagamento</CardTitle>
                    <CardDescription>
                      Selecione a forma de pagamento para análise (o período é controlado pelo filtro global acima)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                        <select
                          id="formaPagamento"
                          value={financeiroFilters.formaPagamento}
                          onChange={(e) => setFinanceiroFilters(prev => ({ ...prev, formaPagamento: e.target.value }))}
                          className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="todas">Todas</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Cartão de Crédito">Cartão de Crédito</option>
                          <option value="Cartão de Débito">Cartão de Débito</option>
                          <option value="PIX">PIX</option>
                          <option value="Transferência">Transferência</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo Financeiro */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Recebido</p>
                          <p className="text-2xl font-bold text-green-600">
                            R$ {getFinancialSummary().totalRecebido.toFixed(2)}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total de Consultas</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {getFinancialSummary().totalConsultas}
                          </p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">A Receber</p>
                          <p className="text-2xl font-bold text-blue-600">
                            R$ {appointments.filter(a => !a.pagamentoRecebido && a.status === 'REALIZADO').reduce((sum, a) => sum + a.valor, 0).toFixed(2)}
                          </p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                          <p className="text-2xl font-bold text-purple-600">
                            R$ {getFinancialSummary().totalConsultas > 0 ? (getFinancialSummary().totalRecebido / getFinancialSummary().totalConsultas).toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detalhes por Forma de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo por Forma de Pagamento</CardTitle>
                    <CardDescription>
                      Detalhamento dos valores recebidos por cada forma de pagamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(getFinancialSummary().formasPagamento).map(([forma, data]) => (
                        <div key={forma} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <div>
                              <h4 className="font-semibold">{forma}</h4>
                              <p className="text-sm text-gray-600">{data.count} consultas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              R$ {data.total.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Média: R$ {data.count > 0 ? (data.total / data.count).toFixed(2) : '0.00'}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {Object.keys(getFinancialSummary().formasPagamento).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhum pagamento recebido no período selecionado</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Transações */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transações Recebidas</CardTitle>
                    <CardDescription>
                      Lista detalhada de todas as consultas pagas no período
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getFilteredFinancialData().map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <h4 className="font-medium">{appointment.paciente.nome}</h4>
                              <p className="text-sm text-gray-600">
                                {appointment.procedimento.nome} • {appointment.data} • {appointment.horario}
                              </p>
                              <p className="text-xs text-purple-600">{appointment.formaPagamento}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              R$ {appointment.valor.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {getFilteredFinancialData().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhuma transação encontrada no período selecionado</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}