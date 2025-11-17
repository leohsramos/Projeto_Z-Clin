import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

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

    // Buscar pagamentos do período
    const payments = await db.payment.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        appointment: {
          select: {
            id: true
          }
        }
      }
    })

    // Calcular resumo
    const totalReceived = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + (p.amount - p.discount), 0)

    const totalPending = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + (p.amount - p.discount), 0)

    const totalCancelled = payments
      .filter(p => p.status === 'CANCELLED')
      .reduce((sum, p) => sum + (p.amount - p.discount), 0)

    const appointmentCount = payments.length

    const averageTicket = appointmentCount > 0 
      ? totalReceived / payments.filter(p => p.status === 'PAID').length
      : 0

    // Agrupar por forma de pagamento
    const paymentMethods = {
      PIX: 0,
      CARTAO: 0,
      DINHEIRO: 0,
      BOLETO: 0
    }

    payments
      .filter(p => p.status === 'PAID')
      .forEach(payment => {
        paymentMethods[payment.paymentMethod as keyof typeof paymentMethods] += (payment.amount - payment.discount)
      })

    const summary = {
      totalReceived,
      totalPending,
      totalCancelled,
      appointmentCount,
      averageTicket,
      paymentMethods
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}