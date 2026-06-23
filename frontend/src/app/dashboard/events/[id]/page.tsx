'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const { data: registrations, isLoading: regLoading } = useQuery({
    queryKey: ['registrations', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}/registrations`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const { data: report } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}/report`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const handleDelete = async () => {
    if (!confirm('Estas seguro de eliminar este evento?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/tenants/${user?.tenantId}/events/${id}`);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.push('/dashboard/events');
    } catch {
      alert('Error al eliminar evento');
    } finally {
      setDeleting(false);
    }
  };

  if (eventLoading || regLoading) {
    return <p>Cargando...</p>;
  }

  if (!event) {
    return <p>Evento no encontrado</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/events" className="text-blue-600 hover:underline">
          ← Volver a eventos
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-500">{event.eventType} • {event.status}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/events/${id}/edit`}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Editar
            </Link>
            <Link
              href={`/dashboard/events/${id}/registrations`}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Ver registros
            </Link>
            <Link
              href={`/dashboard/events/${id}/checkin`}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Check-in
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
        
        {event.description && (
          <p className="text-gray-600 mt-4">{event.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Inicio</p>
            <p className="font-medium">{format(new Date(event.startDate), "dd/MM/yyyy HH:mm")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fin</p>
            <p className="font-medium">{format(new Date(event.endDate), "dd/MM/yyyy HH:mm")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ubicacion</p>
            <p className="font-medium">{event.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Capacidad</p>
            <p className="font-medium">{event.capacity}</p>
          </div>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Registrados</p>
            <p className="text-2xl font-bold text-blue-600">{report.totalRegistrations}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Asistieron</p>
            <p className="text-2xl font-bold text-green-600">{report.checkedIn}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Tasa asistencia</p>
            <p className="text-2xl font-bold text-purple-600">{report.attendanceRate}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Disponibles</p>
            <p className="text-2xl font-bold text-orange-600">{event.capacity - report.totalRegistrations}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Registros recientes</h2>
        {registrations?.length === 0 ? (
          <p className="text-gray-500">No hay registros aun</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Nombre</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-left py-2">QR</th>
                </tr>
              </thead>
              <tbody>
                {registrations?.slice(0, 10).map((reg: any) => (
                  <tr key={reg.id} className="border-b">
                    <td className="py-2">{reg.attendeeName}</td>
                    <td className="py-2">{reg.attendeeEmail}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        reg.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                        reg.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {reg.qrCode && (
                        <img src={reg.qrCode} alt="QR" className="w-8 h-8" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
