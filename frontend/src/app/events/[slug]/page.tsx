'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function PublicEventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [showAttendees, setShowAttendees] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/events/public/${slug}`);
      return data;
    },
  });

  const { data: attendees, isLoading: attendeesLoading } = useQuery({
    queryKey: ['attendees', event?.id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/events/public/${event.id}/attendees`);
      return data as string[];
    },
    enabled: showAttendees && !!event?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-mono text-sm text-ink/60">Cargando evento&hellip;</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">Evento no encontrado</h1>
          <Link href="/" className="font-mono text-sm text-stamp hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isEnded = new Date(event.endDate) < new Date();
  const isFull = (event._count?.registrations || 0) >= event.capacity;
  const seatsLeft = Math.max(0, event.capacity - (event._count?.registrations || 0));

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div
          className="bg-paper-dark rounded-2xl shadow-sm overflow-hidden"
          style={{ ['--notch-bg' as any]: '#F1ECDD' }}
        >
          <div className="p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp mb-3">{event.eventType}</p>
            <h1 className="font-display text-4xl font-semibold text-ink mb-6">{event.title}</h1>

            <div className="grid grid-cols-2 gap-5 mb-6 font-mono text-sm">
              <div>
                <p className="uppercase tracking-wide text-ink/40 text-xs mb-1">Lugar</p>
                <p className="text-ink">{event.location || 'Por confirmar'}</p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-ink/40 text-xs mb-1">Lugares disponibles</p>
                <p className="text-ink">{seatsLeft} / {event.capacity}</p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-ink/40 text-xs mb-1">Inicia</p>
                <p className="text-ink">{format(new Date(event.startDate), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-ink/40 text-xs mb-1">Termina</p>
                <p className="text-ink">{format(new Date(event.endDate), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
              </div>
            </div>

            {event.description && (
              <p className="text-ink/70 leading-relaxed">{event.description}</p>
            )}

            {(event._count?.registrations || 0) > 0 && (
              <div className="mt-6 pt-6 border-t border-ink/10">
                <button
                  onClick={() => setShowAttendees((v) => !v)}
                  className="font-mono text-xs uppercase tracking-wide text-stamp hover:text-stamp/80"
                >
                  {showAttendees ? 'Ocultar' : 'Ver'} quienes ya se registraron ({event._count.registrations})
                </button>
                {showAttendees && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attendeesLoading ? (
                      <p className="font-mono text-xs text-ink/40">Cargando&hellip;</p>
                    ) : (
                      attendees?.map((name, i) => (
                        <span key={i} className="px-3 py-1 bg-paper rounded-full font-mono text-xs text-ink/70">
                          {name}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="ticket-perforation flex items-center justify-between px-8 py-6">
            <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
              {isEnded ? 'Evento finalizado' : isFull ? 'Cupo lleno' : 'Listo para registrarte'}
            </p>

            {isEnded ? (
              <span className="font-mono text-sm text-ink/40">&mdash;</span>
            ) : isFull ? (
              <span className="font-mono text-sm text-stamp">Sin lugares</span>
            ) : (
              <Link
                href={`/events/${slug}/register`}
                className="px-5 py-2.5 bg-stamp text-paper rounded-lg font-mono text-sm uppercase tracking-wide hover:bg-stamp/90 transition-colors"
              >
                Registrarse
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
