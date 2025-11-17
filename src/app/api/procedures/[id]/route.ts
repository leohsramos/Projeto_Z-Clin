import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, value, duration, materials } = await request.json()
    const { id } = params

    if (!name || !value || !duration) {
      return NextResponse.json(
        { error: 'Nome, valor e duração são obrigatórios' },
        { status: 400 }
      )
    }

    const procedure = await db.procedure.update({
      where: { id },
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
    console.error('Erro ao atualizar procedimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se existem consultas associadas
    const appointmentsCount = await db.appointment.count({
      where: { procedureId: id }
    })

    if (appointmentsCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um procedimento que possui consultas associadas' },
        { status: 400 }
      )
    }

    await db.procedure.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Procedimento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir procedimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}