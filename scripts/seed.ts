import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuários de teste
  const users = [
    {
      email: 'financeiro@clinica.com',
      password: 'Fin@nc2024#',
      name: 'Setor Financeiro',
      userType: 'FINANCEIRO'
    },
    {
      email: 'drajosiane@clinica.com',
      password: 'Dra.Josi@2024!',
      name: 'Dra. Josiane Canali',
      userType: 'DRA_JOSIANE'
    },
    {
      email: 'secretaria@clinica.com',
      password: 'Sec@2024$',
      name: 'Secretária',
      userType: 'SECRETARIA'
    },
    {
      email: 'dev@clinica.com',
      password: 'Dev@2024&',
      name: 'Desenvolvedor',
      userType: 'DESENVOLVEDOR'
    }
  ]

  for (const userData of users) {
    const existingUser = await prisma.user.findFirst({
      where: { email: userData.email }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: userData
      })
      console.log(`✅ Usuário criado: ${userData.email}`)
    } else {
      console.log(`⚠️ Usuário já existe: ${userData.email}`)
    }
  }

  // Criar procedimentos de exemplo
  const procedures = [
    {
      name: 'Consulta de rotina',
      description: 'Consulta médica geral',
      value: 150.00,
      duration: 30,
      materials: 'Ficha médica, caneta'
    },
    {
      name: 'Retorno',
      description: 'Consulta de retorno',
      value: 120.00,
      duration: 20,
      materials: 'Ficha médica'
    },
    {
      name: 'Exame físico',
      description: 'Exame físico completo',
      value: 200.00,
      duration: 45,
      materials: 'Aparelho de pressão, estetoscópio'
    }
  ]

  for (const procedureData of procedures) {
    const existingProcedure = await prisma.procedure.findFirst({
      where: { name: procedureData.name }
    })

    if (!existingProcedure) {
      await prisma.procedure.create({
        data: procedureData
      })
      console.log(`✅ Procedimento criado: ${procedureData.name}`)
    } else {
      console.log(`⚠️ Procedimento já existe: ${procedureData.name}`)
    }
  }

  // Criar pacientes de exemplo
  const patients = [
    {
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      birthDate: new Date('1980-05-15'),
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    {
      name: 'João Santos',
      email: 'joao.santos@email.com',
      phone: '(11) 91234-5678',
      cpf: '987.654.321-00',
      birthDate: new Date('1975-08-22'),
      address: 'Avenida Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    {
      name: 'Ana Oliveira',
      email: 'ana.oliveira@email.com',
      phone: '(11) 92345-6789',
      cpf: '456.789.123-00',
      birthDate: new Date('1990-03-10'),
      address: 'Rua Augusta, 789',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01304-000'
    }
  ]

  for (const patientData of patients) {
    const existingPatient = await prisma.patient.findFirst({
      where: { email: patientData.email }
    })

    if (!existingPatient) {
      await prisma.patient.create({
        data: patientData
      })
      console.log(`✅ Paciente criado: ${patientData.name}`)
    } else {
      console.log(`⚠️ Paciente já existe: ${patientData.name}`)
    }
  }

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })