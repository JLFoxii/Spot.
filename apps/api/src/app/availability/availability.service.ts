import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@spot-monorepo/db-prisma';
import { addMinutes, format, parse, isBefore, isAfter, isEqual } from 'date-fns';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailableSlots(businessId: string, staffId: string, serviceId: string, dateStr: string) {
    // 1. Récupérer la durée du service
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new BadRequestException("Service inconnu");
    const duration = service.durationMin;

    // 2. Récupérer les horaires du Staff pour ce jour
    const dateQuery = new Date(dateStr);
    const dayOfWeek = dateQuery.getDay(); // 0 = Dimanche
    
    const availability = await this.prisma.availability.findFirst({
      where: { staffId, dayOfWeek, isBreak: false }
    });

    if (!availability) return []; // Le staff ne bosse pas ce jour-là

    // 3. Récupérer les RDV existants ce jour-là (Collision Check)
    // On prend une marge large (00:00 à 23:59)
    const startOfDay = new Date(dateStr); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(dateStr); endOfDay.setHours(23,59,59,999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        staffId,
        status: { not: 'CANCELLED' },
        startAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 4. Algorithme de génération des slots
    const slots: string[] = [];
    
    // Parse l'heure de début et fin de journée (ex: "09:00" -> Date Object)
    let cursor = parse(`${dateStr} ${availability.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endShift = parse(`${dateStr} ${availability.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

    // On boucle par pas de 30min (ou paramétrable) jusqu'à la fin de la journée
    const step = 30; 

    while (isBefore(addMinutes(cursor, duration), endShift) || isEqual(addMinutes(cursor, duration), endShift)) {
      const slotStart = cursor;
      const slotEnd = addMinutes(cursor, duration);

      // Vérifier si ce slot chevauche un booking existant
      const isOverlapping = bookings.some(b => {
        // Logique stricte : (SlotStart < BookingEnd) && (SlotEnd > BookingStart)
        return isBefore(slotStart, b.endAt) && isAfter(slotEnd, b.startAt);
      });

      // Vérifier si le slot est dans le futur (si c'est aujourd'hui)
      const now = new Date();
      const isInPast = isBefore(slotStart, now);

      if (!isOverlapping && !isInPast) {
        slots.push(slotStart.toISOString());
      }

      // Incrémenter le curseur
      cursor = addMinutes(cursor, step);
    }

    return slots;
  }
}
