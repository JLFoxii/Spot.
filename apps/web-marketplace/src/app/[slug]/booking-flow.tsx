'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import type { Service, Staff } from '@prisma/client';

export function BookingFlow({ business }: { business: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Étape 1 : Choix du Service
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  // Étape 2 : Choix du Staff
  const handleSelectStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    // On charge les créneaux dès que le staff est choisi
    fetchSlots(staff.id, selectedService!.id, selectedDate);
    setStep(3);
  };

  // Fetch API des slots
  const fetchSlots = async (staffId: string, serviceId: string, date: string) => {
    setLoadingSlots(true);
    try {
      const { data } = await apiClient.get('/availability/slots', {
        params: { businessId: business.id, staffId, serviceId, date }
      });
      setSlots(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Create booking when slot is clicked
  const handleSlotClick = async (slot: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('spot_token_client') : null;
    
    if (!token) {
      // Save booking intent and redirect to login
      sessionStorage.setItem('pending_booking', JSON.stringify({
        businessId: business.id,
        serviceId: selectedService!.id,
        staffId: selectedStaff!.id,
        startAt: slot,
        returnUrl: window.location.pathname
      }));
      router.push('/login');
      return;
    }

    setBookingInProgress(true);
    try {
      await apiClient.post('/bookings', {
        businessId: business.id,
        serviceId: selectedService!.id,
        staffId: selectedStaff!.id,
        startAt: slot,
      });
      
      // Redirect to my-account on success
      router.push('/my-account');
    } catch (error: any) {
      console.error('Erreur lors de la création du RDV:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création du rendez-vous');
      setBookingInProgress(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      
      {/* Step 1: Services */}
      {step === 1 && (
        <div>
          <h3 className="font-semibold mb-4 text-lg">Choisissez une prestation</h3>
          <div className="space-y-3">
            {business.services.map((s: Service) => (
              <button 
                key={s.id}
                onClick={() => handleSelectService(s)}
                className="w-full text-left p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex justify-between"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-500">{Number(s.price)}€ • {s.durationMin}min</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Staff */}
      {step === 2 && (
        <div>
           <button onClick={() => setStep(1)} className="text-sm text-gray-400 mb-2">← Retour</button>
           <h3 className="font-semibold mb-4 text-lg">Avec qui ?</h3>
           <div className="grid grid-cols-2 gap-3">
             {business.staff.map((st: Staff) => (
               <button 
                  key={st.id}
                  onClick={() => handleSelectStaff(st)}
                  className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 text-center"
               >
                 <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                 <div className="font-medium">{st.name}</div>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Step 3: Slots */}
      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} className="text-sm text-gray-400 mb-2">← Retour</button>
          <h3 className="font-semibold mb-4 text-lg">Disponibilités pour le {selectedDate}</h3>
          
          {/* Date Picker Simplifié */}
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => {
                setSelectedDate(e.target.value);
                if(selectedStaff && selectedService) fetchSlots(selectedStaff.id, selectedService.id, e.target.value);
            }}
            className="w-full border p-2 rounded mb-4"
          />

          {bookingInProgress && (
            <div className="text-center py-4 text-blue-600">Création du rendez-vous en cours...</div>
          )}

          {!bookingInProgress && loadingSlots && (
            <div className="text-center py-4">Recherche des créneaux...</div>
          )}

          {!bookingInProgress && !loadingSlots && (
            <div className="grid grid-cols-3 gap-2">
                {slots.length === 0 ? <p className="col-span-3 text-center text-gray-500">Aucun créneau disponible.</p> : null}
                {slots.map((slot) => (
                    <button 
                        key={slot}
                        className="py-2 px-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                        onClick={() => handleSlotClick(slot)}
                    >
                        {format(new Date(slot), 'HH:mm')}
                    </button>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
