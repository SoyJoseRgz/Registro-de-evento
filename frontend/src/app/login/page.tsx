'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-md p-8 bg-paper-dark rounded-2xl shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp text-center mb-2">Acceso</p>
        <h1 className="font-display text-2xl font-semibold text-ink text-center mb-6">Iniciar Sesion</h1>

        {error && (
          <div className="mb-4 p-3 bg-stamp/10 border border-stamp/30 text-stamp rounded-md text-sm font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-ink/50 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-ink/20 rounded-md text-ink focus:outline-none focus:ring-2 focus:ring-stamp/40 focus:border-stamp"
              required
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-ink/50 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-ink/20 rounded-md text-ink focus:outline-none focus:ring-2 focus:ring-stamp/40 focus:border-stamp"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-stamp text-paper rounded-md font-mono uppercase tracking-wide text-sm hover:bg-stamp/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>
        </form>
      </div>
    </div>
  );
}
