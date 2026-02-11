const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestClient() {
  // Vérifier si un client existe déjà
  let client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  
  if (!client) {
    client = await prisma.user.create({
      data: {
        email: 'client.test@spot.ks',
        passwordHash: 'test_hash',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+383123456',
        role: 'CLIENT'
      }
    });
    console.log('✅ Client créé:', client.id);
  } else {
    console.log('✅ Client existe déjà:', client.id);
  }
  
  // Récupérer tous les IDs
  const business = await prisma.business.findFirst();
  const staff = await prisma.staff.findFirst();
  const service = await prisma.service.findFirst();
  
  console.log('\n=== IDs pour les tests ===');
  console.log(JSON.stringify({
    businessId: business.id,
    staffId: staff.id,
    serviceId: service.id,
    clientId: client.id,
    startAt: '2026-02-10T10:00:00.000Z'
  }, null, 2));
  
  await prisma.$disconnect();
}

createTestClient();
