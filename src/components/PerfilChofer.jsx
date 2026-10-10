import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '../Supabase/Conection';
import StatusDot from '@/components/ui/StatusDot';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { buttonGhostClass } from '@/components/ui/tokens';

const formatearFecha = (valor) => {
  if (!valor) return '—';
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES');
};

const PerfilChofer = () => {
  const { isChofer, loading: authLoading, userData } = useAuth();
  const [chofer, setChofer] = useState(null);
  const [asignacionActiva, setAsignacionActiva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Referencia de montaje: evita actualizar estado tras el desmontaje.
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cargarPerfil = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos del chofer directamente desde la tabla Chofer
      const { data: choferData, error: choferError } = await supabase
        .from('Chofer')
        .select('*')
        .eq('id', userData.id)
        .single();

      if (choferError) {
        console.error('Error obteniendo chofer:', choferError);
        throw new Error('Error al cargar perfil del chofer');
      }

      if (!isMountedRef.current) return;
      setChofer(choferData);

      // Obtener asignación activa con detalles completos
      const { data: asignacionData, error: asignacionError } = await supabase
        .from('asignaciones')
        .select(`
          *,
          vehiculo:vehiculos(id, placa, marca, modelo, vehiculo_id_api),
          ruta:Rutas(id, nombre_ruta, id_ruta),
          admin:administrador(id, nombre, apellido)
        `)
        .eq('chofer_id', userData.id)
        .eq('estado', 'activa')
        .maybeSingle();

      if (asignacionError && asignacionError.code !== 'PGRST116') {
        console.error('Error obteniendo asignación:', asignacionError);
      }

      if (!isMountedRef.current) return;
      setAsignacionActiva(asignacionData);

    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error cargando perfil:', err);
      setError(err.message);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (!authLoading && isChofer && userData) {
      cargarPerfil();
    }
  }, [authLoading, isChofer, userData, cargarPerfil]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--signal)]" aria-hidden="true" />
      </div>
    );
  }

  if (!isChofer) {
    return (
      <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 p-6 text-center">
        <h2 className="text-base font-semibold text-[var(--text)]">Acceso denegado</h2>
        <p className="mt-1 text-sm text-[var(--text-mute)]">Esta sección es solo para choferes.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 p-6 text-center">
        <h2 className="text-base font-semibold text-[var(--text)]">Error</h2>
        <p className="mt-1 text-sm text-[var(--text-mute)]">{error}</p>
        <button type="button" onClick={cargarPerfil} className={`${buttonGhostClass} mt-4`}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Mi perfil</h1>
        <p className="mt-1 text-sm text-[var(--text-mute)]">Información personal y asignación actual</p>
      </header>

      {/* Ficha del chofer */}
      <section className="rounded-md border border-[var(--line)]">
        <h2 className="border-b border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--text-mute)]">
          Información personal
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-[var(--text-mute)]">Nombre completo</dt>
            <dd className="mt-1 text-sm text-[var(--text)]">{chofer?.nombre} {chofer?.apellido}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[var(--text-mute)]">Email</dt>
            <dd className="mt-1 font-mono text-sm text-[var(--text)]">{chofer?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[var(--text-mute)]">Estado</dt>
            <dd className="mt-1">
              <StatusDot tone={chofer?.activo ? 'ok' : 'danger'} label={chofer?.activo ? 'Activo' : 'Inactivo'} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[var(--text-mute)]">Disponibilidad</dt>
            <dd className="mt-1">
              <StatusDot
                tone={chofer?.disponible ? 'ok' : 'warn'}
                label={chofer?.disponible ? 'Disponible' : 'En asignación'}
              />
            </dd>
          </div>
        </dl>
      </section>

      {/* Asignación activa */}
      <section className="mt-6">
        {asignacionActiva ? (
          <>
            <h2 className="mb-2 text-xs font-medium text-[var(--text-mute)]">Asignación activa</h2>
            <Table>
              <thead>
                <tr>
                  <Th>Vehículo</Th>
                  <Th>Ruta</Th>
                  <Th>Estado</Th>
                  <Th>Inicio</Th>
                </tr>
              </thead>
              <tbody>
                <Tr>
                  <Td className="text-[var(--text)]">
                    <span className="font-mono">{asignacionActiva.vehiculo?.placa || '—'}</span>
                    <span className="ml-2 text-[var(--text-mute)]">
                      {[asignacionActiva.vehiculo?.marca, asignacionActiva.vehiculo?.modelo].filter(Boolean).join(' ')}
                    </span>
                  </Td>
                  <Td className="text-[var(--text)]">{asignacionActiva.ruta?.nombre_ruta || 'Sin nombre'}</Td>
                  <Td>
                    <StatusDot tone="ok" label={asignacionActiva.estado} />
                  </Td>
                  <Td className="font-mono tabular-nums text-[var(--text-mute)]">{formatearFecha(asignacionActiva.fecha_inicio)}</Td>
                </Tr>
              </tbody>
            </Table>

            {asignacionActiva.observaciones && (
              <div className="mt-3 rounded-md border border-[var(--line)] bg-[var(--surface)] p-3">
                <p className="text-xs font-medium text-[var(--text-mute)]">Observaciones</p>
                <p className="mt-1 text-sm text-[var(--text)]">{asignacionActiva.observaciones}</p>
              </div>
            )}
            {asignacionActiva.admin && (
              <p className="mt-3 text-xs text-[var(--text-faint)]">
                Asignado por {asignacionActiva.admin.nombre} {asignacionActiva.admin.apellido}
              </p>
            )}
          </>
        ) : (
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
            <h2 className="text-base font-semibold text-[var(--text)]">Sin asignación activa</h2>
            <p className="mt-1 text-sm text-[var(--text-mute)]">
              No tienes ninguna asignación de vehículo o ruta. Contacta al administrador si necesitas asistencia.
            </p>
          </div>
        )}
      </section>

      <div className="mt-6">
        <button type="button" onClick={cargarPerfil} disabled={loading} className={buttonGhostClass}>
          Actualizar información
        </button>
      </div>
    </div>
  );
};

export default PerfilChofer;
