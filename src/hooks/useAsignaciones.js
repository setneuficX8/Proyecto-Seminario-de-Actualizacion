import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAsignaciones,
  createAsignacion,
  updateAsignacion,
  cambiarEstadoAsignacion as cambiarEstadoAsignacionService,
  deleteAsignacion
} from '@/services/AsignacionesService';
import { getRutasActivas } from '@/services/RutasService';
import { getVehiculos } from '@/services/VehiculosService';
import { getChoferesDisponibles } from '@/services/ChoferesService';

/**
 * Hook de datos para la gestión de asignaciones.
 * Carga agregada con Promise.allSettled (cada fuente falla de forma independiente):
 *  - asignaciones        -> AsignacionesService.getAsignaciones()
 *  - rutasDisponibles    -> RutasService.getRutasActivas()
 *  - vehiculosDisponibles-> VehiculosService.getVehiculos() (activos y sin asignación activa)
 *  - choferesDisponibles -> ChoferesService (fuente canónica; lo necesita el formulario)
 *
 * La validación de conflictos de días sigue delegada en createAsignacion, que usa
 * la estructura Set optimizada en Fase 3.
 *
 * Devuelve: { asignaciones, rutasDisponibles, vehiculosDisponibles, choferesDisponibles,
 *            loading, actionLoading, error, reload, crearAsignacion, actualizarAsignacion,
 *            cambiarEstadoAsignacion, eliminarAsignacion, limpiarError }
 */
export const useAsignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]);
  const [choferesDisponibles, setChoferesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Flag de montaje: evita setState tras el desmontaje.
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const limpiarError = useCallback(() => setError(null), []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [asignacionesRes, rutasRes, vehiculosRes, choferesRes] = await Promise.allSettled([
      getAsignaciones(),
      getRutasActivas(),
      getVehiculos(),
      getChoferesDisponibles()
    ]);

    if (!isMountedRef.current) return;

    if (asignacionesRes.status === 'fulfilled') {
      setAsignaciones(asignacionesRes.value || []);
    } else {
      setError('Error al cargar datos: ' + (asignacionesRes.reason?.message || asignacionesRes.reason));
      setAsignaciones([]);
    }

    if (rutasRes.status === 'fulfilled') {
      setRutasDisponibles(rutasRes.value || []);
    }
    if (choferesRes.status === 'fulfilled') {
      setChoferesDisponibles(choferesRes.value || []);
    }
    if (vehiculosRes.status === 'fulfilled') {
      // Vehículos activos y sin asignación activa (para el selector de creación).
      setVehiculosDisponibles(
        (vehiculosRes.value || []).filter(v => v.activo && !v.tiene_asignacion_activa)
      );
    }

    if (isMountedRef.current) setLoading(false);
  }, []);

  // Carga inicial: el hook es dueño del fetching.
  useEffect(() => {
    reload();
  }, [reload]);

  const runAction = useCallback(async (action, fallbackMessage) => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await action();
      await reload();
      return result;
    } catch (err) {
      if (isMountedRef.current) setError(err.message || fallbackMessage);
      throw err;
    } finally {
      if (isMountedRef.current) setActionLoading(false);
    }
  }, [reload]);

  const crearAsignacion = useCallback((datos) => runAction(() => createAsignacion(datos), 'Error al crear asignación'), [runAction]);
  const actualizarAsignacion = useCallback((id, datos) => runAction(() => updateAsignacion(id, datos), 'Error al actualizar asignación'), [runAction]);
  const cambiarEstadoAsignacion = useCallback((id, nuevoEstado) => runAction(() => cambiarEstadoAsignacionService(id, nuevoEstado), 'Error al cambiar estado'), [runAction]);
  const eliminarAsignacion = useCallback((id) => runAction(() => deleteAsignacion(id), 'Error al eliminar asignación'), [runAction]);

  return {
    asignaciones,
    rutasDisponibles,
    vehiculosDisponibles,
    choferesDisponibles,
    loading,
    actionLoading,
    error,
    reload,
    crearAsignacion,
    actualizarAsignacion,
    cambiarEstadoAsignacion,
    eliminarAsignacion,
    limpiarError
  };
};

export default useAsignaciones;
