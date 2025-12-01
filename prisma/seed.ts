import bcrypt from 'bcryptjs'

import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Limpar dados existentes
  await prisma.invite.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.create({
    data: {
      email: 'joao.silva@empresa.com',
      name: 'João Silva',
      passwordHash
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'maria.santos@empresa.com',
      name: 'Maria Santos',
      passwordHash
    }
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'pedro.oliveira@freelancer.com',
      name: 'Pedro Oliveira',
      passwordHash
    }
  })

  const company1 = await prisma.company.create({
    data: {
      logoUrl: null,
      name: 'Tech Solutions LTDA'
    }
  })

  const company2 = await prisma.company.create({
    data: {
      logoUrl: null,
      name: 'Digital Marketing'
    }
  })

  await prisma.membership.create({
    data: {
      companyId: company1.id,
      role: Role.OWNER,
      userId: user1.id
    }
  })

  await prisma.membership.create({
    data: {
      companyId: company1.id,
      role: Role.ADMIN,
      userId: user2.id
    }
  })

  await prisma.membership.create({
    data: {
      companyId: company1.id,
      role: Role.MEMBER,
      userId: user3.id
    }
  })

  await prisma.membership.create({
    data: {
      companyId: company2.id,
      role: Role.ADMIN,
      userId: user1.id
    }
  })

  await prisma.membership.create({
    data: {
      companyId: company2.id,
      role: Role.MEMBER,
      userId: user2.id
    }
  })

  await prisma.invite.create({
    data: {
      companyId: company1.id,
      email: 'novo.colaborador@empresa.com',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      role: Role.MEMBER,
      token: `token-${Date.now()}-valid`
    }
  })

  await prisma.invite.create({
    data: {
      companyId: company2.id,
      email: 'expirado@empresa.com',
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      role: Role.ADMIN,
      token: `token-${Date.now()}-expired`
    }
  })

  await prisma.user.update({
    data: { activeCompanyId: company1.id },
    where: { id: user1.id }
  })

  await prisma.user.update({
    data: { activeCompanyId: company2.id },
    where: { id: user2.id }
  })

  console.log('✅ Seed completed!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
