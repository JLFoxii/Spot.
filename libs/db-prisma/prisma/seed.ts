import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Owner user
  const owner = await prisma.user.upsert({
    where: { email: 'owner@barberking.ks' },
    update: {},
    create: {
      email: 'owner@barberking.ks',
      passwordHash: 'hashed_password_placeholder',
      firstName: 'Adem',
      lastName: 'Jashari',
      role: UserRole.OWNER,
    },
  });
  console.log('Owner created:', owner.email);

  // 2. Create Business
  const business = await prisma.business.upsert({
    where: { slug: 'barber-king-pristina' },
    update: {},
    create: {
      name: 'Barber King Pristina',
      slug: 'barber-king-pristina',
      ownerId: owner.id,
      address: 'Bulevardi Bill Clinton, Prishtine',
    },
  });
  console.log('Business created:', business.name);

  // 3. Create Staff user
  const staffUser = await prisma.user.upsert({
    where: { email: 'drilon@barberking.ks' },
    update: {},
    create: {
      email: 'drilon@barberking.ks',
      passwordHash: 'hashed_password_placeholder',
      firstName: 'Drilon',
      role: UserRole.STAFF,
    },
  });
  console.log('Staff user created:', staffUser.email);

  // 4. Create Service
  const coupeClassique = await prisma.service.upsert({
    where: { id: 'seed-coupe-classique' },
    update: {},
    create: {
      id: 'seed-coupe-classique',
      name: 'Coupe Classique',
      durationMin: 30,
      price: 15.0,
      businessId: business.id,
    },
  });
  console.log('Service created:', coupeClassique.name);

  // 5. Create Staff profile linked to user + service + availability
  const staff = await prisma.staff.upsert({
    where: { userId: staffUser.id },
    update: {},
    create: {
      name: 'Drilon',
      userId: staffUser.id,
      businessId: business.id,
      services: {
        create: {
          serviceId: coupeClassique.id,
        },
      },
      availabilities: {
        create: {
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
        },
      },
    },
  });
  console.log('Staff profile created:', staff.name);

  console.log('Seed finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
