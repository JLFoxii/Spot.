'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBookingSchema, CreateBookingFormValues } from '../lib/schemas/booking-schema';
import { apiClient } from '../lib/api-client';
import { useEffect } from 'react';
import { Service, Staff } from '@spot-monorepo/db-prisma';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  services: Service[];
  staffList: Staff[];
  initialData?: { startAt: string; staffId?: string }; // Données contextuelles du clic
}

export function BookingModal({ isOpen, onClose, businessId, services, staffList, initialData }: BookingModalProps) {
  const queryClient = useQueryClient();

  // 1. Setup du Formulaire
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateBookingFormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      serviceId: '',
      staffId: '',
      startAt: new Date().toISOString(),
    }
  });

  // 2. Pré-remplissage intelligent (Contextual UX)
  useEffect(() => {
    if (isOpen && initialData) {
      // Conversion ISO -> datetime-local format (YYYY-MM-DDTHH:mm)
      const isoDate = new Date(initialData.startAt);
      const localDateTime = new Date(isoDate.getTime() - isoDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setValue('startAt', localDateTime);
      if (initialData.staffId) setValue('staffId', initialData.staffId);
    }
  }, [isOpen, initialData, setValue]);

  // 3. La Mutation (Appel API)
  const mutation = useMutation({
    mutationFn: async (data: CreateBookingFormValues) => {
      // Conversion datetime-local -> ISO pour l'API
      const isoStartAt = new Date(data.startAt).toISOString();
      // On combine les données du form avec le businessId contextuel
      return apiClient.post('/bookings', { 
        ...data, 
        startAt: isoStartAt,
        businessId 
      });
    },
    onSuccess: () => {
      // Magie React Query : On invalide le cache 'bookings' pour rafraîchir le calendrier
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      reset();
      onClose();
      // Ici on pourrait ajouter un Toast de succès
      alert("Rendez-vous confirmé !");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Impossible de créer le RDV';
      alert(`Erreur: ${errorMessage}`);
    }
  });

  if (!isOpen) return null;

  console.log('🎭 Modale rendue, services:', services.length, 'staff:', staffList.length);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '28rem',
          padding: '1.5rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Nouveau Rendez-vous
        </h3>
        
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          
          {/* Date & Heure (Readonly ou Editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Début du RDV</label>
            <input 
              {...register('startAt')}
              type="datetime-local" // Simplification pour la démo, format à adapter
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100"
              // On convertit l'ISO string en format datetime-local pour l'input HTML si besoin
              // Pour ce snippet, on suppose que l'utilisateur valide la date cliquée
            />
          </div>

          {/* Service Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Prestation</label>
            <select {...register('serviceId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              <option value="">Choisir une prestation...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min - {Number(s.price)}€)</option>
              ))}
            </select>
            {errors.serviceId && <p className="text-red-500 text-sm">{errors.serviceId.message}</p>}
          </div>

          {/* Staff Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Coiffeur / Staff</label>
            <select {...register('staffId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              <option value="">Peu importe / Premier dispo</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
             {errors.staffId && <p className="text-red-500 text-sm">{errors.staffId.message}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Création...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
