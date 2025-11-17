import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const procedures = await db.procedure.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('Erro ao buscar procedimentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, value, duration, materials } = await request.json()

    if (!name || !value || !duration) {
      return NextResponse.json(
        { error: 'Nome, valor e duração são obrigatórios' },
        { status: 400 }
      )
    }

    const procedure = await db.procedure.create({
      data: {
        name,
        description,
        value: parseFloat(value),
        duration: parseInt(duration),
        materials
      }
    })

    return NextResponse.json(procedure)
  } catch (error) {
    console.error('Erro ao criar procedimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}