'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

const inputClass =
  'w-full px-3 py-2 bg-paper border border-ink/20 rounded-md text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-stamp/40 focus:border-stamp';
const labelClass = 'block font-mono text-xs uppercase tracking-wide text-ink/50 mb-1';

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
  const [qrCode, setQrCode] = useState('');

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

      const { data } = await api.post(`/api/v1/tenants/${event?.tenantId}/events/${event?.id}/registrations/register`, {
        attendeeName: form.attendeeName,
        attendeeEmail: form.attendeeEmail,
        attendeePhone: form.attendeePhone || undefined,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      });
      setQrCode(data.qrCode);
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
      <div className="min-h-screen flex items-center justify-center bg-paper py-12 px-4">
        <div className="w-full max-w-sm">
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-counter mb-3">&#10003; Registro confirmado</p>

          {/* The actual admission stub, built from this registration's data. */}
          <div
            className="bg-paper-dark rounded-2xl shadow-md overflow-hidden"
            style={{ ['--notch-bg' as any]: '#F1ECDD' }}
          >
            <div className="p-6">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink/40 mb-1">Pase de evento</p>
              <h1 className="font-display text-2xl font-semibold text-ink mb-4">{event?.title}</h1>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <p className="uppercase tracking-wide text-ink/40">Asistente</p>
                  <p className="text-ink truncate">{form.attendeeName}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-ink/40">Contacto</p>
                  <p className="text-ink truncate">{form.attendeeEmail}</p>
                </div>
              </div>
            </div>

            {qrCode && (
              <div className="ticket-perforation flex flex-col items-center px-6 py-6">
                <img src={qrCode} alt="Codigo QR de registro" className="w-44 h-44 rounded-lg border border-ink/10" />
                <p className="font-mono text-[0.7rem] text-ink/50 text-center mt-4">
                  Presenta este QR en el check-in. Descárgalo o tómale una captura.
                </p>
                <a
                  href={qrCode}
                  download="qr-registro.png"
                  className="mt-4 px-5 py-2 bg-stamp text-paper rounded-lg font-mono text-sm uppercase tracking-wide hover:bg-stamp/90 transition-colors"
                >
                  Descargar QR
                </a>
              </div>
            )}
          </div>

          <Link href={`/events/${slug}`} className="block text-center font-mono text-sm text-ink/50 hover:text-ink mt-6">
            &larr; Volver al evento
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-12 px-4">
      <div className="w-full max-w-md p-8 bg-paper-dark rounded-2xl shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp text-center mb-2">Registro</p>
        <h1 className="font-display text-2xl font-semibold text-ink text-center mb-6">{event?.title || 'Cargando...'}</h1>

        {error && (
          <div className="mb-4 p-3 bg-stamp/10 border border-stamp/30 text-stamp rounded-md text-sm font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input
              type="text"
              value={form.attendeeName}
              onChange={(e) => handleChange('attendeeName', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              value={form.attendeeEmail}
              onChange={(e) => handleChange('attendeeEmail', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Telefono</label>
            <input
              type="tel"
              value={form.attendeePhone}
              onChange={(e) => handleChange('attendeePhone', e.target.value)}
              className={inputClass}
            />
          </div>

          {fields?.map((field: any) => (
            <div key={field.id}>
              <label className={labelClass}>
                {field.fieldName} {field.isRequired && '*'}
              </label>
              {field.fieldType === 'text' && (
                <input
                  type="text"
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className={inputClass}
                  required={field.isRequired}
                />
              )}
              {field.fieldType === 'email' && (
                <input
                  type="email"
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className={inputClass}
                  required={field.isRequired}
                />
              )}
              {field.fieldType === 'phone' && (
                <input
                  type="tel"
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className={inputClass}
                  required={field.isRequired}
                />
              )}
              {field.fieldType === 'number' && (
                <input
                  type="number"
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className={inputClass}
                  required={field.isRequired}
                />
              )}
              {field.fieldType === 'select' && (
                <select
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  className={inputClass}
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
                    className="rounded border-ink/30 text-stamp focus:ring-stamp/40"
                  />
                  <span className="text-sm text-ink/70">Si</span>
                </label>
              )}
              {field.fieldType === 'textarea' && (
                <textarea
                  value={form[`field_${field.id}`] || ''}
                  onChange={(e) => handleChange(`field_${field.id}`, e.target.value)}
                  rows={3}
                  className={inputClass}
                  required={field.isRequired}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-stamp text-paper rounded-md font-mono uppercase tracking-wide text-sm hover:bg-stamp/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}
