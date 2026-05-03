'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.replace('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-blush/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-mauve mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-mauve/20">
              <span className="text-white font-serif text-2xl font-bold">BV</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-gray-800">
              Panel de Administración
            </h1>
            <p className="text-gray-500 text-sm mt-1">El Bazar Viajero</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-mauve focus:outline-none transition-colors text-sm"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-mauve focus:outline-none transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl"
              >
                <AlertTriangle size={16} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-mauve text-white py-3 rounded-xl font-medium hover:bg-brand-mauve/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-mauve/20"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-brand-mauve transition-colors"
            >
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
