'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function PublicEventPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/events/public/${slug}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando evento...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Evento no encontrado</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Tipo</p>
              <p className="font-medium">{event.eventType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ubicacion</p>
              <p className="font-medium">{event.location || 'No especificada'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de inicio</p>
              <p className="font-medium">
                {format(new Date(event.startDate), "d 'de' MMMM yyyy HH:mm", { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de fin</p>
              <p className="font-medium">
                {format(new Date(event.endDate), "d 'de' MMMM yyyy HH:mm", { locale: es })}
              </p>
            </div>
          </div>

          {event.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Descripcion</p>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Lugares disponibles: {event.capacity - (event._count?.registrations || 0)} / {event.capacity}
            </p>
          </div>

          <Link
            href={`/events/${slug}/register`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
