import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const appointments = await db.appointment.findMany({
      include: {
        patient: true,
        procedure: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Erro ao buscar consultas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, procedureId, date, time, notes, doctorId } = await request.json()

    if (!patientId || !date || !time || !doctorId) {
      return NextResponse.json(
        { error: 'Paciente, data, horário e médico são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se paciente existe
    const patient = await db.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se procedimento existe (se informado)
    if (procedureId) {
      const procedure = await db.procedure.findUnique({
        where: { id: procedureId }
      })

      if (!procedure) {
        return NextResponse.json(
          { error: 'Procedimento não encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar se já existe consulta no mesmo horário
    const existingAppointment = await db.appointment.findFirst({
      where: {
        date: new Date(date),
        time: time,
        status: {
          notIn: ['CANCELADO', 'FALTOU']
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Já existe uma consulta agendada neste horário' },
        { status: 400 }
      )
    }

    // Buscar valor do procedimento
    let value = null
    if (procedureId) {
      const procedure = await db.procedure.findUnique({
        where: { id: procedureId },
        select: { value: true }
      })
      value = procedure?.value
    }

    const appointment = await db.appointment.create({
      data: {
        patientId,
        procedureId,
        date: new Date(date),
        time,
        notes,
        doctorId,
        value,
        status: 'AGENDADO'
      },
      include: {
        patient: true,
        procedure: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true
          }
        }
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Erro ao criar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}