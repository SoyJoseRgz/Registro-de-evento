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
      const { data } = await api.get('/api/v1/events/public?tenantSlug=demo');
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-16 pb-12">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center mb-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp mb-4">Admite uno &middot; Sin reimprimir</p>
            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] text-ink mb-5">
              Tu lugar,<br />sellado en un boleto.
            </h1>
            <p className="text-lg text-ink/70 max-w-md">
              Regístrate y recibe al instante tu pase con código QR. Se descarga,
              se presenta y se sella en la puerta &mdash; nada que imprimir de más.
            </p>
          </div>

          {/* Signature element: a stylized admission stub, the same shape
              every attendee actually receives after registering. */}
          <div
            className="bg-paper-dark rounded-2xl shadow-sm overflow-hidden rotate-1 max-w-sm justify-self-center"
            style={{ ['--notch-bg' as any]: '#F1ECDD' }}
          >
            <div className="p-6">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink/50 mb-1">Pase de evento</p>
              <p className="font-display text-2xl font-semibold text-ink">Conferencia Tech</p>
              <div className="grid grid-cols-2 gap-3 mt-4 font-mono text-xs text-ink/60">
                <div>
                  <p className="uppercase tracking-wide text-ink/40">Asistente</p>
                  <p className="text-ink">A. Ríos</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-ink/40">Folio</p>
                  <p className="text-ink">#0042</p>
                </div>
              </div>
            </div>
            <div className="ticket-perforation flex items-center justify-between px-6 py-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-wide text-counter">&#10003; Confirmado</p>
              <div className="w-12 h-12 bg-ink/90 rounded-sm" aria-hidden />
            </div>
          </div>
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink mb-6">Próximos eventos</h2>

        {isLoading ? (
          <p className="font-mono text-sm text-ink/60">Cargando eventos&hellip;</p>
        ) : events?.length === 0 ? (
          <p className="font-mono text-sm text-ink/60">No hay eventos disponibles por ahora.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event: any) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group bg-paper-dark rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                style={{ ['--notch-bg' as any]: '#F1ECDD' }}
              >
                <div className="p-6 flex-1">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-stamp mb-2">{event.eventType}</p>
                  <h3 className="font-display text-xl font-semibold text-ink mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-ink/60 text-sm line-clamp-2">{event.description}</p>
                  )}
                </div>
                <div className="ticket-perforation flex items-center justify-between px-6 py-3">
                  <p className="font-mono text-xs text-ink/60">
                    {format(new Date(event.startDate), "d MMM yyyy", { locale: es })}
                  </p>
                  <span className="font-mono text-xs uppercase tracking-wide text-ink group-hover:text-stamp">
                    Ver pase &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
