'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { PlanningCalendar } from '../components/planning-calendar';
import type { Business, Service, Staff } from '@prisma/client';

type BusinessFull = Business & { services: Service[]; staff: Staff[] };

export default function DashboardHome() {
  const [business, setBusiness] = useState<BusinessFull | null>(null);
  const [loading, setLoading] = useState(true);

  const myBusinessSlug = 'barber-king-pristina'; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get<BusinessFull>(`/businesses/${myBusinessSlug}`);
        setBusiness(data);
      } catch (error) {
        console.error("Erreur chargement dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10">Chargement de votre espace...</div>;
  if (!business) return <div className="p-10 text-red-500">Erreur : Salon introuvable.</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-8">Spot. Business</h1>
        <nav className="space-y-4">
          <a href="#" className="block py-2 px-4 bg-slate-800 rounded">Vue d ensemble</a>
          <a href="#" className="block py-2 px-4 hover:bg-slate-800 rounded">Planning</a>
          <a href="#" className="block py-2 px-4 hover:bg-slate-800 rounded">Services</a>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
        </header>

        {/* Intégration du Calendrier */}
        {business && (
            <div className="w-full">
                <PlanningCalendar 
                  businessId={business.id}
                  services={business.services}
                  staff={business.staff}
                />
            </div>
        )}
      </main>
    </div>
  );
}
