'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiClient } from '../../lib/api';

interface Booking {
  id: string;
  startAt: string;
  status: string;
  business: {
    name: string;
    address: string;
  };
  service: {
    name: string;
    price: number;
    durationMin: number;
  };
  staff: {
    name: string;
  };
}

export default function MyAccountPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('spot_token_client');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    try {
      const { data } = await apiClient.get('/bookings/me');
      setBookings(data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des RDV:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('spot_token_client');
        router.push('/login');
      } else {
        setError('Impossible de charger vos rendez-vous');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé';
      case 'PENDING':
        return 'En attente';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Chargement de vos rendez-vous...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Retour à l'accueil
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Rendez-vous</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de rendez-vous</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Prendre un rendez-vous
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.business.name}
                    </h3>
                    <p className="text-sm text-gray-500">{booking.business.address}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      booking.status
                    )}`}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Service:</span>
                    <span className="ml-2 font-medium">{booking.service.name}</span>
                    <span className="ml-2 text-gray-500">
                      ({booking.service.durationMin} min • {Number(booking.service.price)}€)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avec:</span>
                    <span className="ml-2 font-medium">{booking.staff.name}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {format(parseISO(booking.startAt), "EEEE d MMMM yyyy 'à' HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
