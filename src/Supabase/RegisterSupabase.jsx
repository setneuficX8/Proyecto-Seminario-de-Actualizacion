import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { supabase } from './Conection';
import { labelClass, inputClass, buttonPrimaryClass } from '@/components/ui/tokens';
import { CloseIcon } from '@/components/ui/icons';

function RegisterSupabase() {
  const { role, loading } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido,
            rol: 'administrador',
            display_name: `${nombre} ${apellido}`
          }
        }
      });

      if (error) {
        const isRateLimit = error.status === 429 || /rate limit/i.test(error.message || '');
        setFormError(
          isRateLimit
            ? 'Se alcanzó el límite de intentos de registro. Espera unos minutos antes de volver a intentar.'
            : (error.message || 'Error al registrar')
        );
        return;
      }

      setFormSuccess('Registro exitoso. Se envió un correo de confirmación a tu email.');
    } catch (error) {
      console.error('Error inesperado:', error);
      const isRateLimit = error?.status === 429 || /rate limit/i.test(error?.message || '');
      setFormError(
        isRateLimit
          ? 'Se alcanzó el límite de intentos de registro. Espera unos minutos antes de volver a intentar.'
          : 'Ocurrió un error inesperado. Intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--signal)]" aria-hidden="true" />
      </div>
    );
  }

  // Si el usuario está autenticado y es chofer, bloquear acceso
  if (role === 'chofer') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
        <h1 className="text-lg font-semibold text-[var(--text)]">Crear cuenta</h1>
        <p className="mt-1 text-sm text-[var(--text-mute)]">Registra una cuenta de administrador</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {formError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start justify-between gap-3 rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--text)]"
            >
              <span>{formError}</span>
              <button
                type="button"
                onClick={() => setFormError(null)}
                aria-label="Cerrar alerta"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--text-mute)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {formSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-md border border-[var(--ok)] bg-[var(--ok)]/10 px-3 py-2 text-sm text-[var(--text)]"
            >
              {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-nombre" className={labelClass}>Nombre</label>
              <input
                id="reg-nombre"
                name="nombre"
                type="text"
                autoComplete="given-name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="reg-apellido" className={labelClass}>Apellido</label>
              <input
                id="reg-apellido"
                name="apellido"
                type="text"
                autoComplete="family-name"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className={labelClass}>Correo electrónico</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="reg-password" className={labelClass}>Contraseña</label>
            <div className="relative">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
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

          <button type="submit" disabled={isSubmitting} className={`${buttonPrimaryClass} w-full`}>
            {isSubmitting ? 'Registrando…' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-mute)]">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/LoginSupabase" className="font-medium text-[var(--signal)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterSupabase;
