import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getTestIds() {
  const business = await prisma.business.findFirst();
  const staff = await prisma.staff.findFirst();
  const service = await prisma.service.findFirst();
  const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  
  console.log('=== IDs pour les tests ===');
  console.log('businessId:', business?.id);
  console.log('staffId:', staff?.id);
  console.log('serviceId:', service?.id);
  console.log('clientId:', client?.id || 'AUCUN - Créer un CLIENT');
  console.log('');
  console.log('Exemple de requête POST:');
  console.log(JSON.stringify({
    businessId: business?.id,
    staffId: staff?.id,
    serviceId: service?.id,
    clientId: client?.id || 'REMPLACER_PAR_ID_CLIENT',
    startAt: '2026-02-10T10:00:00.000Z'
  }, null, 2));
  
  await prisma.$disconnect();
}

getTestIds();
