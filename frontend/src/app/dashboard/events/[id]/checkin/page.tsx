'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false });

export default function CheckInPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const { data: event } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const { data: registrations } = useQuery({
    queryKey: ['registrations', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}/registrations`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const { data: checkins } = useQuery({
    queryKey: ['checkins', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}/checkins`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const doCheckIn = async (regId: string) => {
    setLoading(regId);
    setMessage('');
    setError('');

    try {
      const { data } = await api.post(`/api/v1/tenants/${user?.tenantId}/checkin`, {
        registrationId: regId,
      });
      setMessage(`Check-in exitoso: ${data.registration.attendeeName}`);
      queryClient.invalidateQueries({ queryKey: ['checkins', id] });
      queryClient.invalidateQueries({ queryKey: ['registrations', id] });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al hacer check-in');
    } finally {
      setLoading(null);
    }
  };

  const handleQRScan = async (qrData: string) => {
    setShowScanner(false);
    setLoading('qr');
    setMessage('');
    setError('');

    try {
      const { data } = await api.post(`/api/v1/tenants/${user?.tenantId}/checkin`, {
        qrToken: qrData,
      });
      setMessage(`Check-in exitoso: ${data.registration.attendeeName}`);
      queryClient.invalidateQueries({ queryKey: ['checkins', id] });
      queryClient.invalidateQueries({ queryKey: ['registrations', id] });
    } catch (err: any) {
      setError(err.response?.data?.error || 'QR no valido o ya fue escaneado');
    } finally {
      setLoading(null);
    }
  };

  const checkedInIds = new Set(checkins?.map((c: any) => c.registrationId) || []);

  const filtered = registrations?.filter((reg: any) =>
    (reg.attendeeName?.toLowerCase().includes(search.toLowerCase()) ||
     reg.attendeeEmail?.toLowerCase().includes(search.toLowerCase())) &&
    reg.status !== 'cancelled'
  );

  const pending = filtered?.filter((r: any) => !checkedInIds.has(r.id)) || [];
  const done = filtered?.filter((r: any) => checkedInIds.has(r.id)) || [];

  return (
    <div>
      <div className="mb-6">
        <Link href={`/dashboard/events/${id}`} className="text-blue-600 hover:underline">
          ← Volver al evento
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-500">{event?.title || 'Cargando evento...'}</p>
          <h1 className="text-2xl font-bold">Check-in</h1>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-lg flex items-center gap-2"
        >
          📷 Escanear QR
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Registrados</p>
          <p className="text-3xl font-bold text-blue-600">{registrations?.filter((r: any) => r.status !== 'cancelled').length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Check-in</p>
          <p className="text-3xl font-bold text-green-600">{checkins?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-3xl font-bold text-orange-600">{(registrations?.filter((r: any) => r.status !== 'cancelled').length || 0) - (checkins?.length || 0)}</p>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-orange-700">Pendientes ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map((reg: any) => (
              <div key={reg.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    {reg.attendeeName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{reg.attendeeName}</p>
                    <p className="text-sm text-gray-500">{reg.attendeeEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => doCheckIn(reg.id)}
                  disabled={loading === reg.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading === reg.id ? '...' : 'Check-in'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-green-700">Asistieron ({done.length})</h2>
          <div className="space-y-2">
            {done.map((reg: any) => {
              const checkin = checkins?.find((c: any) => c.registrationId === reg.id);
              return (
                <div key={reg.id} className="bg-green-50 rounded-lg p-4 flex items-center justify-between border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold">
                      {reg.attendeeName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{reg.attendeeName}</p>
                      <p className="text-sm text-gray-500">{reg.attendeeEmail}</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">
                    {checkin ? new Date(checkin.checkedInAt).toLocaleTimeString() : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!search && pending.length === 0 && done.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">No hay participantes registrados</p>
          <p className="text-gray-400 text-sm mt-1">Registra asistentes desde la pagina publica del evento</p>
        </div>
      )}

      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
