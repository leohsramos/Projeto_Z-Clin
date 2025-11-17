'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Appointment {
  id: string
  pacienteId: string
  paciente: { nome: string }
  procedimentoId: string
  procedimento: { nome: string; duracao: number }
  data: string
  horario: string
  status: string
  valor: number
  observacoes: string
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

interface CalendarProps {
  appointments: Appointment[]
  procedures: Procedure[]
  onDateClick: (date: Date) => void
  onAddAppointment: (date: Date, time: string) => void
}

export function FullCalendar({ appointments, procedures, onDateClick, onAddAppointment }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false)

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
        reason: `Procedimento terminaria após o horário de funcionamento`
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
        apt.data === date && apt.horario === slot && apt.status !== 'BLOQUEADO'
      )
      
      if (hasConflict) {
        conflictingSlots.push(slot)
      }
    }
    
    return {
      available: conflictingSlots.length === 0,
      conflictingSlots,
      reason: conflictingSlots.length > 0 
        ? `Horários conflitantes já agendados`
        : undefined
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Horários disponíveis para consultas
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return appointments.filter(apt => apt.data === dateStr)
  }

  const getAppointmentsForDateTime = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return appointments.filter(apt => apt.data === dateStr && apt.horario === time)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsDayDialogOpen(true)
    onDateClick(date)
  }

  const handleTimeSlotClick = (date: Date, time: string) => {
    onAddAppointment(date, time)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AGENDADO: { label: 'Agendado', variant: 'secondary' as const },
      CONFIRMADO: { label: 'Confirmado', variant: 'default' as const },
      REALIZADO: { label: 'Realizado', variant: 'default' as const },
      FALTOU: { label: 'Faltou', variant: 'destructive' as const },
      CANCELADO: { label: 'Cancelado', variant: 'destructive' as const },
      BLOQUEADO: { label: 'Bloqueado', variant: 'outline' as const }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.AGENDADO
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
  }

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-4">
      {/* Cabeçalho do Calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Hoje
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grade do Calendário */}
      <Card>
        <CardContent className="p-4">
          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day)
              const isToday = isSameDay(day, new Date())
              const hasAppointments = dayAppointments.length > 0

              return (
                <Dialog key={day.toString()} open={isDayDialogOpen && selectedDate && isSameDay(selectedDate, day)} onOpenChange={setIsDayDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={`h-20 p-2 flex flex-col items-start justify-start relative hover:bg-purple-50 transition-colors ${
                        isToday ? 'bg-purple-100 border-purple-300' : ''
                      } ${hasAppointments ? 'border-purple-300' : ''}`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="text-sm font-medium">{format(day, 'd')}</div>
                      {hasAppointments && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayAppointments.slice(0, 3).map((_, index) => (
                            <div key={index} className="w-1 h-1 bg-purple-500 rounded-full" />
                          ))}
                          {dayAppointments.length > 3 && (
                            <span className="text-xs text-purple-600">+{dayAppointments.length - 3}</span>
                          )}
                        </div>
                      )}
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        {format(day, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                      </DialogTitle>
                      <DialogDescription>
                        Visualize e gerencie as consultas do dia
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Resumo do dia */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Resumo do Dia</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{dayAppointments.length}</div>
                              <div className="text-sm text-gray-600">Total de Consultas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {dayAppointments.filter(a => a.status === 'REALIZADO').length}
                              </div>
                              <div className="text-sm text-gray-600">Realizadas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {dayAppointments.reduce((sum, a) => sum + a.valor, 0).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">Faturamento</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Grade de horários */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Horários do Dia</h3>
                        <div className="text-sm text-gray-600 mb-3">
                          Clique em "Agendar" para selecionar um horário. O sistema verificará automaticamente a disponibilidade baseada na duração do procedimento.
                        </div>
                        <div className="grid gap-2">
                          {timeSlots.map((time) => {
                            const timeAppointments = getAppointmentsForDateTime(day, time)
                            const hasAppointment = timeAppointments.length > 0
                            const hasRegularAppointment = timeAppointments.some(apt => apt.status !== 'BLOQUEADO')

                            return (
                              <Card key={time} className={`p-3 ${
                                hasRegularAppointment ? 'border-purple-200 bg-purple-50' : 
                                timeAppointments.some(apt => apt.status === 'BLOQUEADO') ? 'border-orange-200 bg-orange-50' : ''
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{time}</span>
                                    {timeAppointments.some(apt => apt.status === 'BLOQUEADO') && (
                                      <Badge variant="outline" className="text-xs">Bloqueado</Badge>
                                    )}
                                  </div>
                                  
                                  {hasAppointment ? (
                                    <div className="flex-1 mx-4">
                                      {timeAppointments.map((apt) => (
                                        <div key={apt.id} className={`flex items-center justify-between p-2 rounded border ${
                                          apt.status === 'BLOQUEADO' ? 'bg-orange-100 border-orange-200' : 'bg-white'
                                        }`}>
                                          <div className="flex items-center gap-3">
                                            <Users className={`w-4 h-4 ${
                                              apt.status === 'BLOQUEADO' ? 'text-orange-600' : 'text-purple-600'
                                            }`} />
                                            <div>
                                              <div className="font-medium">
                                                {apt.status === 'BLOQUEADO' ? apt.observacoes : apt.paciente.nome}
                                              </div>
                                              <div className="text-sm text-gray-600">
                                                {apt.status === 'BLOQUEADO' ? 'Horário indisponível' : apt.procedimento.nome}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {getStatusBadge(apt.status)}
                                            {apt.status !== 'BLOQUEADO' && (
                                              <span className="text-sm font-medium text-green-600">
                                                R$ {apt.valor.toFixed(2)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleTimeSlotClick(day, time)}
                                      className="ml-auto hover:bg-purple-100"
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Agendar
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}