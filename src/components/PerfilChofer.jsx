import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../Supabase/Conection';

const PerfilChofer = () => {
  const { isChofer, loading: authLoading, userData } = useAuth();
  const [chofer, setChofer] = useState(null);
  const [asignacionActiva, setAsignacionActiva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && isChofer && userData) {
      cargarPerfil();
    }
  }, [authLoading, isChofer, userData]);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos del chofer desde la vista
      const { data: choferData, error: choferError } = await supabase
        .from('vista_choferes_disponibles')
        .select('*')
        .eq('id', userData.id)
        .single();

      if (choferError) {
        console.error('Error obteniendo chofer:', choferError);
        throw new Error('Error al cargar perfil del chofer');
      }

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

      setAsignacionActiva(asignacionData);

    } catch (err) {
      console.error('Error cargando perfil:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-400"></div>
        <div className="text-xl font-semibold text-white font-montserrat">
          Cargando perfil...
        </div>
      </div>
    );
  }

  if (!isChofer) {
    return (
      <div className="p-5 max-w-4xl mx-auto">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Acceso Denegado</h2>
          <p className="text-gray-300">
            Esta sección es solo para choferes. Por favor, contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 max-w-4xl mx-auto">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={cargarPerfil}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white font-montserrat mb-2">
          Mi Perfil
        </h1>
        <p className="text-gray-300">
          Información personal y asignación actual
        </p>
      </div>

      {/* Información Personal */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-6 shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-white mb-4 font-montserrat flex items-center gap-2">
          👤 Información Personal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Nombre Completo</p>
            <p className="text-white text-lg font-semibold">
              {chofer?.nombre} {chofer?.apellido}
            </p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white text-lg font-semibold">{chofer?.email}</p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Estado</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              chofer?.activo
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
            }`}>
              {chofer?.activo ? '✓ Activo' : '✗ Inactivo'}
            </span>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Disponibilidad</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              chofer?.disponible
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
            }`}>
              {chofer?.disponible ? '✓ Disponible' : '⚠ En asignación'}
            </span>
          </div>
        </div>
      </div>

      {/* Asignación Activa */}
      {asignacionActiva ? (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4 font-montserrat flex items-center gap-2">
            🚗 Asignación Activa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Vehículo Asignado */}
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">🚙 Vehículo</p>
              <p className="text-white font-semibold">
                {asignacionActiva.vehiculo?.marca} {asignacionActiva.vehiculo?.modelo}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Placa: {asignacionActiva.vehiculo?.placa}
              </p>
            </div>

            {/* Ruta Asignada */}
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">🗺️ Ruta</p>
              <p className="text-white font-semibold">
                {asignacionActiva.ruta?.nombre_ruta || 'Sin nombre'}
              </p>
            </div>

            {/* Estado de Asignación */}
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">📅 Estado</p>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/50">
                {asignacionActiva.estado}
              </span>
              <p className="text-gray-300 text-xs mt-2">
                Inicio: {new Date(asignacionActiva.fecha_inicio).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          {asignacionActiva.observaciones && (
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">📝 Observaciones</p>
              <p className="text-white">{asignacionActiva.observaciones}</p>
            </div>
          )}

          {asignacionActiva.admin && (
            <div className="mt-4 text-sm text-gray-400">
              Asignado por: {asignacionActiva.admin.nombre} {asignacionActiva.admin.apellido}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-8 shadow-lg text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold text-white mb-2">Sin Asignación Activa</h2>
          <p className="text-gray-400">
            Actualmente no tienes ninguna asignación de vehículo o ruta.
          </p>
          <p className="text-gray-400 mt-2">
            Contacta al administrador si necesitas asistencia.
          </p>
        </div>
      )}

      {/* Botón de actualizar */}
      <div className="mt-6 text-center">
        <button
          onClick={cargarPerfil}
          disabled={loading}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-medium transition disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : '🔄 Actualizar Información'}
        </button>
      </div>
    </div>
  );
};

export default PerfilChofer;
