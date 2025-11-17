import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const patients = await db.patient.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      phone, 
      cpf, 
      birthDate, 
      address, 
      city, 
      state, 
      zipCode, 
      notes 
    } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do paciente é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se CPF já existe
    if (cpf) {
      const existingPatientByCpf = await db.patient.findUnique({
        where: { cpf }
      })

      if (existingPatientByCpf) {
        return NextResponse.json(
          { error: 'CPF já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Verificar se e-mail já existe
    if (email) {
      const existingPatientByEmail = await db.patient.findUnique({
        where: { email }
      })

      if (existingPatientByEmail) {
        return NextResponse.json(
          { error: 'E-mail já cadastrado' },
          { status: 400 }
        )
      }
    }

    const patient = await db.patient.create({
      data: {
        name,
        email,
        phone,
        cpf,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        city,
        state,
        zipCode,
        notes
      }
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Erro ao criar paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}