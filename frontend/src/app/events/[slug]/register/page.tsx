'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<Record<string, string>>({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: event } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/events/public/${slug}`);
      return data;
    },
  });

  const { data: fields } = useQuery({
    queryKey: ['fields', event?.id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/events/public/${event?.id}/fields`);
      return data;
    },
    enabled: !!event?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const customFields: Record<string, string> = {};
      fields?.forEach((f: any) => {
        if (form[`field_${f.id}`]) {
          customFields[f.fieldName] = form[`field_${f.id}`];
        }
      });

      await api.post(`/api/v1/tenants/${event?.tenantId}/events/${event?.id}/registrations/register`, {
        attendeeName: form.attendeeName,
        attendeeEmail: form.attendeeEmail,
        attendeePhone: form.attendeePhone || undefined,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow text-center">
          <div className="text-green-600 text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold mb-2">Registro Exitoso</h1>
          <p className="text-gray-600 mb-4">Te has registrado correctamente en el evento.</p>
          <Link href={`/events/${slug}`} className="text-blue-600 hover:underline">
            Volver al evento
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-2">Registro</h1>
        <p className="text-gray-500 text-center mb-6">{event?.title || 'Cargando...'}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.attendeeName}
              onChange={(e) => handleChange('attendeeName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.attendeeEmail}
              onChange={(e) => handleChange('attendeeEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input
              type="tel"
              value={form.attendeePhone}
              onChange={(e) => handleChange('attendeePhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {fields?.map((field: any) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.fieldName} {field.isRequired && '*'}
              </label>
              {field.fieldType === 'text' && (
                <input
                  type="text"
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={field.isRequired}
                />
              )}
              {field.fieldType === 'email' && (
                <input
                  type="email"
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={field.isRequired}
                />
              )}
              {field.fieldType === 'phone' && (
                <input
                  type="tel"
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={field.isRequired}
                />
              )}
              {field.fieldType === 'number' && (
                <input
                  type="number"
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={field.isRequired}
                />
              )}
              {field.fieldType === 'select' && (
                <select
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={field.isRequired}
                >
                  <option value="">Selecciona...</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {field.fieldType === 'checkbox' && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form[`field_${field.id}`] === 'true'}
                    onChange={(e) => handleChange(`field_${field.id}`, e.target.checked ? 'true' : 'false')}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Si</span>
                </label>
              )}
              {field.fieldType === 'textarea' && (
                <textarea
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={field.isRequired}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}
