import { useState, useEffect, useRef, useCallback } from 'react';
import {
  obtenerChoferes,
  crearChofer as crearChoferService,
  actualizarChofer as actualizarChoferService,
  eliminarChofer as eliminarChoferService
} from '@/services/ChoferesService';

/**
 * Hook de datos para la gestión de choferes.
 * Desacopla de GestionChoferes el fetching, las mutaciones y el estado asíncrono.
 *
 * Devuelve: { choferes, loading, error, reload, crearChofer, actualizarChofer, eliminarChofer }
 */
export const useChoferes = () => {
  const [choferes, setChoferes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Flag de montaje: evita setState tras el desmontaje.
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cargarChoferes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerChoferes();
      if (!isMountedRef.current) return;
      setChoferes(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError('Error al cargar choferes: ' + err.message);
      setChoferes([]);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  // Carga inicial: el hook es dueño del fetching.
  useEffect(() => {
    cargarChoferes();
  }, [cargarChoferes]);

  const crearChofer = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const result = await crearChoferService(datos);
      await cargarChoferes();
      return result;
    } catch (err) {
      if (isMountedRef.current) setError(err.message);
      throw err;
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [cargarChoferes]);

  const actualizarChofer = useCallback(async (id, datos) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actualizarChoferService(id, datos);
      await cargarChoferes();
      return result;
    } catch (err) {
      if (isMountedRef.current) setError(err.message);
      throw err;
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [cargarChoferes]);

  const eliminarChofer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await eliminarChoferService(id);
      await cargarChoferes();
      return true;
    } catch (err) {
      if (isMountedRef.current) setError(err.message);
      throw err;
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [cargarChoferes]);

  return {
    choferes,
    loading,
    error,
    reload: cargarChoferes,
    crearChofer,
    actualizarChofer,
    eliminarChofer
  };
};

export default useChoferes;
