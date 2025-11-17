import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const status = searchParams.get('status') || 'all'

    // Calcular data de início com base no período
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const whereClause: any = {
      createdAt: {
        gte: startDate
      }
    }

    if (status !== 'all') {
      whereClause.status = status
    }

    const payments = await db.payment.findMany({
      where: whereClause,
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                name: true
              }
            },
            procedure: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, amount, paymentMethod, discount } = await request.json()

    if (!appointmentId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Consulta, valor e forma de pagamento são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se consulta existe
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já existe pagamento para esta consulta
    const existingPayment = await db.payment.findFirst({
      where: { appointmentId }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Já existe um pagamento registrado para esta consulta' },
        { status: 400 }
      )
    }

    const payment = await db.payment.create({
      data: {
        appointmentId,
        amount: parseFloat(amount),
        paymentMethod,
        discount: parseFloat(discount) || 0,
        status: 'PENDING'
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                name: true
              }
            },
            procedure: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}