'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useState } from 'react';

export default function RegistrationsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ attendeeName: '', attendeeEmail: '', attendeePhone: '' });
  const [qrModal, setQrModal] = useState<any>(null);

  const { data: event } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['registrations', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}/registrations`);
      return data;
    },
    enabled: !!user?.tenantId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ regId, data }: { regId: string; data: any }) => {
      await api.put(`/api/v1/tenants/${user?.tenantId}/registrations/${regId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations', id] });
      setEditing(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (regId: string) => {
      await api.delete(`/api/v1/tenants/${user?.tenantId}/registrations/${regId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations', id] });
    },
  });

  const filteredRegistrations = registrations?.filter((reg: any) =>
    reg.attendeeName?.toLowerCase().includes(search.toLowerCase()) ||
    reg.attendeeEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = async () => {
    try {
      const response = await api.get(`/api/v1/tenants/${user?.tenantId}/events/${id}/report/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations-${id}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const startEdit = (reg: any) => {
    setEditing(reg);
    setEditForm({
      attendeeName: reg.attendeeName,
      attendeeEmail: reg.attendeeEmail,
      attendeePhone: reg.attendeePhone || '',
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    updateMutation.mutate({ regId: editing.id, data: editForm });
  };

  const downloadQR = (reg: any) => {
    if (!reg.qrCode) return;
    const link = document.createElement('a');
    link.href = reg.qrCode;
    link.download = `qr-${reg.attendeeName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmado',
    checked_in: 'Asistio',
    cancelled: 'Cancelado',
    pending: 'Pendiente',
  };

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    checked_in: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

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
          <h1 className="text-2xl font-bold">Participantes</h1>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Exportar CSV
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <p>Cargando registros...</p>
      ) : filteredRegistrations?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl mb-4">👤</div>
          <p className="text-gray-500 text-lg">No hay participantes registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRegistrations?.map((reg: any) => (
            <div key={reg.id} className="bg-white rounded-lg shadow p-4">
              {editing?.id === reg.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={editForm.attendeeName}
                        onChange={(e) => setEditForm({ ...editForm, attendeeName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.attendeeEmail}
                        onChange={(e) => setEditForm({ ...editForm, attendeeEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Telefono</label>
                      <input
                        type="tel"
                        value={editForm.attendeePhone}
                        onChange={(e) => setEditForm({ ...editForm, attendeePhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={updateMutation.isPending}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {reg.attendeeName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{reg.attendeeName}</p>
                      <p className="text-sm text-gray-500 truncate">{reg.attendeeEmail}</p>
                      {reg.attendeePhone && (
                        <p className="text-sm text-gray-400">{reg.attendeePhone}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded whitespace-nowrap ${statusColors[reg.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[reg.status] || reg.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {reg.qrCode && (
                      <>
                        <button
                          onClick={() => setQrModal(reg)}
                          className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                          title="Ver QR"
                        >
                          QR
                        </button>
                        <button
                          onClick={() => downloadQR(reg)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          title="Descargar QR"
                        >
                          ↓
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => startEdit(reg)}
                      className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                      title="Editar"
                    >
                      Editar
                    </button>
                    {reg.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancelar registro de "${reg.attendeeName}"?`)) {
                            cancelMutation.mutate(reg.id);
                          }
                        }}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Cancelar"
                      >
                        X
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {qrModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setQrModal(null)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">{qrModal.attendeeName}</h3>
            <p className="text-gray-500 text-sm mb-4">{qrModal.attendeeEmail}</p>
            {qrModal.qrCode ? (
              <img
                src={qrModal.qrCode}
                alt="QR Code"
                className="w-64 h-64 mx-auto border rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                Sin QR
              </div>
            )}
            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={() => downloadQR(qrModal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Descargar QR
              </button>
              <button
                onClick={() => setQrModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
