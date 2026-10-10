import React, { useState } from 'react';
import { supabase } from './Conection';
import { labelClass, inputClass, buttonPrimaryClass } from '@/components/ui/tokens';
import { CloseIcon } from '@/components/ui/icons';

function LoginSupabase() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res?.error) {
        const msg = res.error.message || 'Error al iniciar sesión';
        setLoginError(/invalid|incorrect/i.test(msg) ? 'Correo o contraseña incorrectos' : msg);
        return;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setLoginError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
        <h1 className="text-lg font-semibold text-[var(--text)]">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-[var(--text-mute)]">Accede a tu cuenta del sistema</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {loginError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start justify-between gap-3 rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--text)]"
            >
              <span>{loginError}</span>
              <button
                type="button"
                onClick={() => setLoginError(null)}
                aria-label="Cerrar alerta"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--text-mute)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <div>
            <label htmlFor="email" className={labelClass}>Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              value={email}
              placeholder="ejemplo@correo.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>Contraseña</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                placeholder="Tu contraseña"
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputClass} pr-24`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-1.5 top-1/2 inline-flex h-7 -translate-y-1/2 items-center rounded px-2 text-xs font-medium text-[var(--text-mute)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`${buttonPrimaryClass} w-full`}>
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginSupabase;
