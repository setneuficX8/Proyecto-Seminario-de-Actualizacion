import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getRutas,
  createRuta,
  updateRuta,
  deleteRuta,
  desactivarRuta as desactivarRutaService,
  reactivarRuta as reactivarRutaService
} from '@/services/RutasService';

/**
 * Hook de datos para la gestión de rutas.
 * Desacopla de GestionRutas el fetching, las mutaciones y el estado asíncrono.
 *
 * Devuelve: { rutas, loading, actionLoading, error, reload, crearRuta,
 *            actualizarRuta, eliminarRuta, desactivarRuta, reactivarRuta, limpiarError }
 * (desactivarRuta/reactivarRuta se exponen porque la vista los usa; van más allá
 *  de la lista mínima solicitada.)
 */
export const useRutas = () => {
  const [rutas, setRutas] = useState([]);
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
    try {
      const data = await getRutas();
      if (!isMountedRef.current) return;
      setRutas(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err.message || 'Error al cargar rutas');
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  // Carga inicial: el hook es dueño del fetching.
  useEffect(() => {
    reload();
  }, [reload]);

  // Ejecuta una mutación, recarga y encapsula loading/error.
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

  const crearRuta = useCallback((datos) => runAction(() => createRuta(datos), 'Error al crear ruta'), [runAction]);
  const actualizarRuta = useCallback((id, datos) => runAction(() => updateRuta(id, datos), 'Error al actualizar ruta'), [runAction]);
  const eliminarRuta = useCallback((id) => runAction(() => deleteRuta(id), 'Error al eliminar ruta'), [runAction]);
  const desactivarRuta = useCallback((id) => runAction(() => desactivarRutaService(id), 'Error al desactivar ruta'), [runAction]);
  const reactivarRuta = useCallback((id) => runAction(() => reactivarRutaService(id), 'Error al reactivar ruta'), [runAction]);

  return {
    rutas,
    loading,
    actionLoading,
    error,
    reload,
    crearRuta,
    actualizarRuta,
    eliminarRuta,
    desactivarRuta,
    reactivarRuta,
    limpiarError
  };
};

export default useRutas;
