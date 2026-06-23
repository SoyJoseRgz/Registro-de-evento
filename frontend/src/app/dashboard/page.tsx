'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Bienvenido, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Eventos</h3>
          <p className="text-3xl font-bold text-blue-600">
            {isLoading ? '...' : events?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Eventos Publicados</h3>
          <p className="text-3xl font-bold text-green-600">
            {isLoading ? '...' : events?.filter((e: any) => e.status === 'published').length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Borradores</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {isLoading ? '...' : events?.filter((e: any) => e.status === 'draft').length || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Eventos Recientes</h2>
          <Link
            href="/dashboard/events"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Ver todos
          </Link>
        </div>
        {isLoading ? (
          <p>Cargando eventos...</p>
        ) : events?.length === 0 ? (
          <p className="text-gray-500">No hay eventos creados</p>
        ) : (
          <div className="space-y-3">
            {events?.slice(0, 5).map((event: any) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="block"
              >
                <div className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.eventType}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {event.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Configuracion</h2>
        </div>
        <div className="space-y-3">
          <Link
            href="/dashboard/settings"
            className="block p-3 border rounded hover:bg-gray-50"
          >
            <p className="font-medium">Campos Personalizados</p>
            <p className="text-sm text-gray-500">Configura campos adicionales para los formularios de registro</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
