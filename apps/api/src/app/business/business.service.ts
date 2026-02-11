import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@spot-monorepo/db-prisma';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async findOneBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      include: {
        services: true, // On récupère la liste des prix/services
        staff: {
          include: {
            availabilities: true // On aura besoin des horaires pour le calendrier
          }
        }
      },
    });

    if (!business) {
      throw new NotFoundException(`Le salon avec l'url "${slug}" n'existe pas.`);
    }

    return business;
  }
}
