'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  eventType: string;
  location?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: string;
  _count?: { registrations: number };
}

const eventTypeLabels: Record<string, string> = {
  conference: 'Conferencia',
  workshop: 'Taller',
  meetup: 'Meetup',
  webinar: 'Webinar',
  other: 'Otro',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function EventCard({ event }: { event: Event }) {
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Eliminar "${event.title}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/tenants/${user?.tenantId}/events/${event.id}`);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch {
      alert('Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <span className={`px-2 py-1 text-xs rounded ${statusColors[event.status] || 'bg-gray-100'}`}>
          {event.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-2">
        {eventTypeLabels[event.eventType] || event.eventType}
      </p>
      {event.description && (
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
      )}
      <div className="text-sm text-gray-500 space-y-1">
        <p>Fecha: {format(new Date(event.startDate), "d 'de' MMMM yyyy", { locale: es })}</p>
        {event.location && <p>Ubicacion: {event.location}</p>}
        <p>Capacidad: {event._count?.registrations || 0} / {event.capacity}</p>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          href={`/dashboard/events/${event.id}`}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ver
        </Link>
        <Link
          href={`/events/${event.slug}`}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Publico
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? '...' : 'Eliminar'}
        </button>
      </div>
    </div>
  );
}
