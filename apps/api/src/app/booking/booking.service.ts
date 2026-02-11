import { 
  BadRequestException, 
  ConflictException, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '@spot-monorepo/db-prisma';
import { CreateBookingDto } from '@spot-monorepo/shared-dtos';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue
  ) {}

  async createBooking(dto: CreateBookingDto, userId: string) {
    const startAt = new Date(dto.startAt);

    // Règle 1: Pas de réservation dans le passé
    if (startAt < new Date()) {
      throw new BadRequestException('Impossible de réserver dans le passé.');
    }

    // On lance une transaction pour assurer la cohérence des données
    return await this.prisma.$transaction(async (tx) => {
      
      // 1. Récupérer le Service (pour la durée et le prix)
      const service = await tx.service.findUnique({
        where: { id: dto.serviceId },
      });

      if (!service) throw new NotFoundException('Service introuvable.');

      // 2. Calculer la date de fin (Source of Truth = Backend)
      // On ajoute la durée (minutes) à la date de début
      const endAt = new Date(startAt.getTime() + service.durationMin * 60000);

      // 3. Vérifier les Horaires du Staff (Working Hours)
      await this.checkStaffAvailability(tx, dto.staffId, startAt, endAt);

      // 4. Vérifier les Collisions (Double Booking)
      // Formule de chevauchement : (StartA < EndB) et (EndA > StartB)
      const collision = await tx.booking.findFirst({
        where: {
          staffId: dto.staffId,
          status: { not: BookingStatus.CANCELLED }, // On ignore les annulés
          AND: [
            { startAt: { lt: endAt } },   // Le RDV existant commence AVANT que le nouveau finisse
            { endAt: { gt: startAt } },   // Le RDV existant finit APRÈS que le nouveau commence
          ],
        },
      });

      if (collision) {
        throw new ConflictException('Ce créneau est déjà pris (Collision detected).');
      }

      // 5. Créer le Booking
      // Source of truth: authenticated user ID from JWT, not client-provided value
      const booking = await tx.booking.create({
        data: {
          businessId: dto.businessId,
          staffId: dto.staffId,
          serviceId: dto.serviceId,
          clientId: userId, // Vient du JWT maintenant, pas du body
          startAt: startAt,
          endAt: endAt,
          status: BookingStatus.CONFIRMED, // Ou PENDING selon la logique métier
        },
        include: {
          client: true,
          service: true,
          staff: true,
          business: true,
        }
      });

      return booking;
    });
  }

  // Envoyer la notification après la transaction
  async sendBookingNotification(booking: any) {
    await this.notificationQueue.add('booking-confirmation', {
      email: booking.client.email,
      clientName: booking.client.firstName,
      date: booking.startAt,
      serviceName: booking.service.name,
      businessName: booking.business.name
    });
  }

  // Récupérer les RDV d'un client
  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { clientId: userId },
      include: {
        business: { select: { name: true, address: true } },
        service: { select: { name: true, price: true } },
        staff: { select: { name: true } }
      },
      orderBy: { startAt: 'desc' }
    });
  }

  // Récupérer les RDV d'un salon sur une période donnée
  async findRangeForBusiness(businessId: string, start: string, end: string) {
    return this.prisma.booking.findMany({
      where: {
        businessId,
        startAt: {
          gte: new Date(start), // >= Date de début
        },
        endAt: {
          lte: new Date(end),   // <= Date de fin
        },
        status: {
          not: 'CANCELLED' // Optionnel : on peut vouloir les afficher barrés
        }
      },
      include: {
        client: { select: { firstName: true, lastName: true, email: true } }, // Infos légères du client
        staff: { select: { name: true, colorCode: true } }, // Pour afficher qui coiffe
        service: { select: { name: true } }
      },
      orderBy: { startAt: 'asc' }
    });
  }

  // Helper pour vérifier si le staff travaille à cette heure-là
  private async checkStaffAvailability(tx: any, staffId: string, start: Date, end: Date) {
    const dayOfWeek = start.getDay(); // 0 = Dimanche, 1 = Lundi...

    // Récupérer les horaires du staff pour ce jour spécifique
    const availability = await tx.availability.findFirst({
      where: {
        staffId: staffId,
        dayOfWeek: dayOfWeek,
      },
    });

    if (!availability) {
      throw new BadRequestException('Le staff ne travaille pas ce jour-là.');
    }

    if (availability.isBreak) {
      throw new BadRequestException('Le staff est en pause.');
    }

    // Conversion "HH:mm" en minutes depuis minuit pour comparaison facile
    const getMinutes = (timeStr: string) => {
      const [hours, mins] = timeStr.split(':').map(Number);
      return hours * 60 + mins;
    };

    const shopStartMins = getMinutes(availability.startTime);
    const shopEndMins = getMinutes(availability.endTime);

    const bookingStartMins = start.getUTCHours() * 60 + start.getUTCMinutes();
    const bookingEndMins = end.getUTCHours() * 60 + end.getUTCMinutes();

    // Vérifier si le RDV est dans les horaires d'ouverture
    if (bookingStartMins < shopStartMins || bookingEndMins > shopEndMins) {
      throw new BadRequestException('Le créneau est en dehors des horaires de travail du staff.');
    }
  }
}
