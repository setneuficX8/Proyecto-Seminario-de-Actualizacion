import { useState, useEffect, useRef, useCallback } from 'react';
import { getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo } from '@/services/VehiculosService';
import { getChoferesDisponibles } from '@/services/ChoferesService';

/**
 * Hook de datos para la gestión de vehículos.
 * Desacopla de GestionVehiculos el fetching, las mutaciones y el estado asíncrono.
 *
 * Devuelve: { vehiculos, choferesDisponibles, loading, error, reload,
 *            crearVehiculo, actualizarVehiculo, eliminarVehiculo }
 */
export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [choferesDisponibles, setChoferesDisponibles] = useState([]);
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

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Vehículos es crítico; los choferes son best-effort (un usuario no-admin
    // puede no tener permiso para leer la lista completa de choferes).
    const [vehiculosRes, choferesRes] = await Promise.allSettled([
      getVehiculos(),
      getChoferesDisponibles()
    ]);

    if (!isMountedRef.current) return;

    if (vehiculosRes.status === 'fulfilled') {
      setVehiculos(Array.isArray(vehiculosRes.value) ? vehiculosRes.value : []);
    } else {
      setError('Error al cargar vehículos: ' + (vehiculosRes.reason?.message || vehiculosRes.reason));
      setVehiculos([]);
    }

    if (choferesRes.status === 'fulfilled') {
      setChoferesDisponibles(Array.isArray(choferesRes.value) ? choferesRes.value : []);
    } else {
      console.error('Error al cargar choferes:', choferesRes.reason);
    }

    if (isMountedRef.current) setLoading(false);
  }, []);

  // Carga inicial: el hook es dueño del fetching.
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const crearVehiculo = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createVehiculo(datos);
      await cargarDatos();
      return result;
    } catch (err) {
      if (isMountedRef.current) setError(err.message);
      throw err;
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [cargarDatos]);

  const actualizarVehiculo = useCallback(async (id, datos) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateVehiculo(id, datos);
      await cargarDatos();
      return result;
    } catch (err) {
      if (isMountedRef.current) setError(err.message);
      throw err;
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [cargarDatos]);

  const eliminarVehiculo = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteVehiculo(id);
      await cargarDatos();
      return true;
    } catch (err) {
      if (isMountedRef.current) setError(err.message);
      throw err;
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [cargarDatos]);

  return {
    vehiculos,
    choferesDisponibles,
    loading,
    error,
    reload: cargarDatos,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
  };
};

export default useVehiculos;
