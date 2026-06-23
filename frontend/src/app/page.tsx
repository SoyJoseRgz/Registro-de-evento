'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Home() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/tenants/demo/events?status=published');
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Registro de Eventos</h1>
          <p className="text-lg text-gray-600">Encuentra y participa en los mejores eventos</p>
        </div>

        {isLoading ? (
          <p className="text-center">Cargando eventos...</p>
        ) : events?.length === 0 ? (
          <p className="text-center text-gray-500">No hay eventos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event: any) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{event.eventType}</p>
                {event.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  {format(new Date(event.startDate), "d 'de' MMMM yyyy", { locale: es })}
                </p>
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Ver detalles
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
