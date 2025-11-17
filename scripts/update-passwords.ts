import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePasswords() {
  console.log('🔄 Atualizando senhas dos usuários...')

  const users = [
    { email: 'financeiro@clinica.com', password: 'Fin@nc2024#' },
    { email: 'drajosiane@clinica.com', password: 'Dra.Josi@2024!' },
    { email: 'secretaria@clinica.com', password: 'Sec@2024$' },
    { email: 'dev@clinica.com', password: 'Dev@2024&' }
  ]

  for (const user of users) {
    await prisma.user.update({
      where: { email: user.email },
      data: { password: user.password }
    })
    console.log(`✅ Senha atualizada para: ${user.email}`)
  }

  console.log('🎉 Senhas atualizadas com sucesso!')
}

updatePasswords()
  .catch((e) => {
    console.error('❌ Erro ao atualizar senhas:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })