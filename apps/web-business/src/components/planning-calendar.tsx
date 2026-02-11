'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { BookingModal } from './booking-modal';
import { Service, Staff } from '@spot-monorepo/db-prisma';

interface PlanningCalendarProps {
  businessId: string;
  services: Service[]; // On passe les services pour la liste déroulante
  staff: Staff[];      // On passe le staff pour la liste déroulante
}

export function PlanningCalendar({ businessId, services, staff }: PlanningCalendarProps) {
  // État pour la plage de dates actuelle (Géré par FullCalendar)
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // État pour la Modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{startAt: string, staffId?: string} | undefined>(undefined);

  // 1. React Query pour fetcher les bookings
  // Se déclenche automatiquement quand businessId ou dateRange change
  const { data: events = [] } = useQuery({
    queryKey: ['bookings', businessId, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!dateRange.start) return [];
      const { data } = await apiClient.get('/bookings/range', {
        params: { businessId, start: dateRange.start, end: dateRange.end }
      });
      // Transformation des données (Mapping)
      return data.map((b: any) => ({
        id: b.id,
        title: `${b.client.firstName || 'Client'} - ${b.service.name}`,
        start: b.startAt,
        end: b.endAt,
        backgroundColor: b.status === 'CONFIRMED' ? '#10b981' : '#f59e0b',
        resourceId: b.staffId // Utile si on utilise la vue ResourceTimeGrid
      }));
    },
    enabled: !!dateRange.start, // Ne pas lancer la requête si pas de dates
    staleTime: 1000 * 60 * 5, // Cache de 5 minutes
  });

  // Callback FullCalendar : Quand l'utilisateur change de vue
  const handleDatesSet = (arg: any) => {
    setDateRange({
      start: arg.startStr,
      end: arg.endStr
    });
  };

  // Callback FullCalendar : Clic sur une case vide
  const handleDateClick = (arg: any) => {
    console.log('📅 Date clicked:', arg.dateStr);
    console.log('📋 Services disponibles:', services);
    console.log('👥 Staff disponible:', staff);
    // On prépare les données pour le formulaire
    setModalInitialData({
      startAt: arg.dateStr, // Format ISO complet fourni par FullCalendar
      // Note: Si on avait une vue "Ressource" (Staff en colonne), arg.resource.id donnerait le staffId
    });
    setIsModalOpen(true);
    console.log('🚀 Modale ouverte');
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow h-[80vh]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          locale="fr"
          firstDay={1}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          events={events} // On lie directement les données de React Query
          datesSet={handleDatesSet}
          dateClick={handleDateClick}
          height="100%"
          nowIndicator={true}
        />
      </div>

      {/* La Modale connectée */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        businessId={businessId}
        services={services}
        staffList={staff}
        initialData={modalInitialData}
      />
    </>
  );
}
