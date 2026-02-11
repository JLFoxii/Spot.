import { PrismaClient } from '@prisma/client';

// Singleton pattern pour éviter d'ouvrir trop de connexions en dev (Hot Reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
