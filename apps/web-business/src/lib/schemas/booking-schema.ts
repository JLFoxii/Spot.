import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, "Veuillez sélectionner une prestation"),
  staffId: z.string().min(1, "Veuillez sélectionner un membre du staff"),
  startAt: z.string().min(1, "Veuillez sélectionner une date et heure"),
  // businessId est injecté automatiquement, pas besoin dans le formulaire UI
});

export type CreateBookingFormValues = z.infer<typeof createBookingSchema>;
