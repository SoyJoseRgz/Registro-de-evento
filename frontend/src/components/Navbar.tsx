'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const dashboardLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/events', label: 'Eventos' },
  { href: '/dashboard/settings', label: 'Configuracion' },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-paper border-b-2 border-dashed border-perforation px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-y-2">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          Registro <span className="text-stamp">de Eventos</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {isAuthenticated ? (
            <>
              {dashboardLinks.map((link) => {
                const isActive =
                  link.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-mono text-sm uppercase tracking-wide ${
                      isActive ? 'text-stamp' : 'text-ink/70 hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <span className="font-mono text-sm text-ink/50">{user?.name}</span>
              <button
                onClick={logout}
                className="font-mono text-sm uppercase tracking-wide text-stamp hover:text-stamp/80"
              >
                Cerrar Sesion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-ink text-paper font-mono text-sm uppercase tracking-wide rounded hover:bg-ink/90"
            >
              Iniciar Sesion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
