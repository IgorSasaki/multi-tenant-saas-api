import bcrypt from 'bcryptjs'

import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Limpar dados existentes
  console.log('🗑️  Cleaning existing data...')
  await prisma.invite.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Existing data cleaned')

  // Hash padrão para todas as senhas (password123)
  const passwordHash = await bcrypt.hash('password123', 10)

  // ========== USUÁRIOS ==========
  console.log('👤 Creating users...')

  const user1 = await prisma.user.create({
    data: {
      email: 'joao.silva@techsolutions.com',
      name: 'João Silva',
      passwordHash
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'maria.santos@techsolutions.com',
      name: 'Maria Santos',
      passwordHash
    }
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'pedro.oliveira@digitalmarketing.com',
      name: 'Pedro Oliveira',
      passwordHash
    }
  })

  const user4 = await prisma.user.create({
    data: {
      email: 'ana.costa@startup.com',
      name: 'Ana Costa',
      passwordHash
    }
  })

  const user5 = await prisma.user.create({
    data: {
      email: 'carlos.mendes@freelancer.com',
      name: 'Carlos Mendes',
      passwordHash
    }
  })

  console.log('✅ 5 users created')

  // ========== EMPRESAS ==========
  console.log('🏢 Creating companies...')

  const company1 = await prisma.company.create({
    data: {
      logoUrl:
        'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D8ABC&color=fff',
      name: 'Tech Solutions LTDA'
    }
  })

  const company2 = await prisma.company.create({
    data: {
      logoUrl:
        'https://ui-avatars.com/api/?name=Digital+Marketing&background=FF6B6B&color=fff',
      name: 'Digital Marketing Agency'
    }
  })

  const company3 = await prisma.company.create({
    data: {
      logoUrl:
        'https://ui-avatars.com/api/?name=Startup&background=4ECDC4&color=fff',
      name: 'Startup Inovadora'
    }
  })

  const company4 = await prisma.company.create({
    data: {
      logoUrl: null,
      name: 'Consultoria Empresarial'
    }
  })

  console.log('✅ 4 companies created')

  // ========== MEMBERSHIPS ==========
  console.log('👥 Creating memberships...')

  // Tech Solutions LTDA
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
      userId: user5.id
    }
  })

  // Digital Marketing Agency
  await prisma.membership.create({
    data: {
      companyId: company2.id,
      role: Role.OWNER,
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

  // Startup Inovadora
  await prisma.membership.create({
    data: {
      companyId: company3.id,
      role: Role.OWNER,
      userId: user4.id
    }
  })

  await prisma.membership.create({
    data: {
      companyId: company3.id,
      role: Role.MEMBER,
      userId: user5.id
    }
  })

  // Consultoria Empresarial (só owner, sem membros ainda)
  await prisma.membership.create({
    data: {
      companyId: company4.id,
      role: Role.OWNER,
      userId: user2.id
    }
  })

  console.log('✅ 9 memberships created')

  // ========== DEFINIR EMPRESAS ATIVAS ==========
  console.log('🎯 Setting active companies...')

  await prisma.user.update({
    data: { activeCompanyId: company1.id },
    where: { id: user1.id }
  })

  await prisma.user.update({
    data: { activeCompanyId: company1.id },
    where: { id: user2.id }
  })

  await prisma.user.update({
    data: { activeCompanyId: company2.id },
    where: { id: user3.id }
  })

  await prisma.user.update({
    data: { activeCompanyId: company3.id },
    where: { id: user4.id }
  })

  await prisma.user.update({
    data: { activeCompanyId: company1.id },
    where: { id: user5.id }
  })

  console.log('✅ Active companies set')

  // ========== CONVITES ==========
  console.log('📧 Creating invites...')

  // Convite válido para Tech Solutions
  await prisma.invite.create({
    data: {
      companyId: company1.id,
      email: 'novo.dev@example.com',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      role: Role.MEMBER,
      token: `invite-${Date.now()}-valid-tech`
    }
  })

  // Convite válido para Digital Marketing
  await prisma.invite.create({
    data: {
      companyId: company2.id,
      email: 'designer@example.com',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      role: Role.ADMIN,
      token: `invite-${Date.now()}-valid-marketing`
    }
  })

  // Convite expirado
  await prisma.invite.create({
    data: {
      companyId: company1.id,
      email: 'expirado@example.com',
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      role: Role.MEMBER,
      token: `invite-${Date.now()}-expired`
    }
  })

  // Convite já usado
  await prisma.invite.create({
    data: {
      companyId: company2.id,
      email: 'usado@example.com',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      role: Role.MEMBER,
      token: `invite-${Date.now()}-used`,
      used: true,
      usedAt: new Date()
    }
  })

  // Convite para usuário já existente (deve associar à empresa)
  await prisma.invite.create({
    data: {
      companyId: company2.id,
      email: user5.email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      role: Role.MEMBER,
      token: `invite-${Date.now()}-existing-user`
    }
  })

  console.log('✅ 5 invites created')

  // ========== RESUMO ==========
  console.log('\n📊 Seed Summary:')
  console.log('================')
  console.log(`👤 Users: 5`)
  console.log(`🏢 Companies: 4`)
  console.log(`👥 Memberships: 9`)
  console.log(`📧 Invites: 5`)
  console.log('\n🔑 Test Credentials:')
  console.log('================')
  console.log('Email: joao.silva@techsolutions.com')
  console.log('Password: password123')
  console.log('\nEmail: maria.santos@techsolutions.com')
  console.log('Password: password123')
  console.log('\nEmail: pedro.oliveira@digitalmarketing.com')
  console.log('Password: password123')
  console.log('\n✅ Seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
