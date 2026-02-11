import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApiClient } from '../../lib/api';
import { BookingFlow } from './booking-flow';

// Fonction pour récupérer le business
async function getBusiness(slug: string) {
  try {
    const res = await serverApiClient.get(`/businesses/${slug}`);
    return res.data;
  } catch (e) {
    return null;
  }
}

// 1. Génération dynamique des méta-tags pour Google (SEO)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) return { title: 'Salon introuvable' };
  
  return {
    title: `${business.name} - Rendez-vous en ligne | Spot.`,
    description: `Réservez votre créneau chez ${business.name} à ${business.address}.`,
  };
}

// 2. La Page (Server Component)
export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusiness(slug);

  if (!business) {
    notFound(); // Affiche la page 404 Next.js par défaut
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Mobile-First avec Image de couverture */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        <div className="absolute -bottom-10 left-6">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center text-3xl font-bold text-blue-600">
            {business.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="pt-14 px-6">
        <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{business.address}</p>
        
        {/* Intégration du flux de réservation interactif (Client Component) */}
        <div className="mt-8">
          <BookingFlow business={business} />
        </div>
      </div>
    </div>
  );
}
