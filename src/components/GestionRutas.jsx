import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRutas, updateRuta, deleteRuta, desactivarRuta, reactivarRuta } from '../services/RutasService';

const GestionRutas = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editando, setEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!authLoading && isAdmin) {
      cargarRutas();
    }
  }, [authLoading, isAdmin]);

  const cargarRutas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRutas();
      setRutas(data);
    } catch (err) {
      setError(err.message || 'Error al cargar rutas');
      console.error('Error cargando rutas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ruta) => {
    setEditando({
      id: ruta.id,
      nombre_ruta: ruta.nombre_ruta,
      activo: ruta.activo
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
    setError(null);
  };

  const handleGuardarEdicion = async () => {
    if (!editando.nombre_ruta.trim()) {
      setError('El nombre de la ruta es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await updateRuta(editando.id, {
        nombre_ruta: editando.nombre_ruta,
        activo: editando.activo
      });
      
      setSuccess('Ruta actualizada correctamente');
      setEditando(null);
      await cargarRutas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar ruta');
      console.error('Error actualizando ruta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDesactivar = async (id, nombreRuta) => {
    if (!window.confirm(`¿Estás seguro de desactivar la ruta "${nombreRuta}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await desactivarRuta(id);
      setSuccess('Ruta desactivada correctamente');
      await cargarRutas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al desactivar ruta');
      console.error('Error desactivando ruta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivar = async (id, nombreRuta) => {
    if (!window.confirm(`¿Deseas reactivar la ruta "${nombreRuta}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await reactivarRuta(id);
      setSuccess('Ruta reactivada correctamente');
      await cargarRutas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al reactivar ruta');
      console.error('Error reactivando ruta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombreRuta) => {
    if (!window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE la ruta "${nombreRuta}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteRuta(id);
      setSuccess('Ruta eliminada correctamente');
      await cargarRutas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al eliminar ruta');
      console.error('Error eliminando ruta:', err);
    } finally {
      setLoading(false);
    }
  };

  const rutasFiltradas = rutas.filter(ruta => {
    const coincideBusqueda = ruta.nombre_ruta
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'activas' && ruta.activo) ||
      (filtroEstado === 'inactivas' && !ruta.activo);

    return coincideBusqueda && coincideEstado;
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-white">Cargando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-5 max-w-4xl mx-auto">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Acceso Denegado</h2>
          <p className="text-gray-300">
            No tienes permisos para acceder a esta sección. Por favor, contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-montserrat">Gestión de Rutas</h1>
        <p className="text-gray-300">Administra las rutas de recolección</p>
      </div>

      {/* Mensajes de éxito y error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Controles superiores */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg p-6 mb-6 border border-sky-400">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar ruta
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre de ruta..."
              className="w-full px-4 py-2 border border-gray-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent placeholder-gray-400"
            />
          </div>

          {/* Filtro de estado */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            >
              <option value="todos">Todas</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-300">
          Total: {rutasFiltradas.length} ruta{rutasFiltradas.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla de rutas */}
      {loading && !editando ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-xl text-gray-300">Cargando rutas...</div>
        </div>
      ) : rutasFiltradas.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg p-12 text-center border border-sky-400">
          <p className="text-gray-300 text-lg mb-4">No hay rutas disponibles</p>
          <p className="text-gray-400 text-sm">
            {busqueda || filtroEstado !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea rutas desde el mapa de visualización'}
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg overflow-hidden border border-sky-400">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre de Ruta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/50 divide-y divide-gray-700">
                {rutasFiltradas.map((ruta) => (
                  <tr key={ruta.id} className="hover:bg-slate-700/50 transition-colors">
                    {editando && editando.id === ruta.id ? (
                      // Modo edición
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {ruta.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editando.nombre_ruta}
                            onChange={(e) => setEditando({ ...editando, nombre_ruta: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent placeholder-gray-400"
                            placeholder="Nombre de la ruta"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ruta.ruta_id_api
                              ? 'bg-sky-900/50 text-sky-300 border border-sky-600'
                              : 'bg-gray-700 text-gray-300 border border-gray-600'
                          }`}>
                            {ruta.ruta_id_api ? 'API Externa' : 'Solo Local'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {ruta.cantidad_asignaciones_activas || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={editando.activo}
                            onChange={(e) => setEditando({ ...editando, activo: e.target.value === 'true' })}
                            className="px-3 py-2 border border-gray-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                          >
                            <option value="true">Activa</option>
                            <option value="false">Inactiva</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={handleGuardarEdicion}
                            disabled={loading}
                            className="text-green-400 hover:text-green-300 mr-3 disabled:text-gray-600"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelarEdicion}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-300 disabled:text-gray-600"
                          >
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      // Modo vista
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {ruta.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {ruta.nombre_ruta}
                          </div>
                          {ruta.ruta_id_api && (
                            <div className="text-xs text-gray-400">
                              API ID: {ruta.ruta_id_api}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ruta.ruta_id_api
                              ? 'bg-sky-900/50 text-sky-300 border border-sky-600'
                              : 'bg-gray-700 text-gray-300 border border-gray-600'
                          }`}>
                            {ruta.ruta_id_api ? 'API Externa' : 'Solo Local'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${
                            ruta.cantidad_asignaciones_activas > 0
                              ? 'text-orange-400 font-semibold'
                              : 'text-gray-400'
                          }`}>
                            {ruta.cantidad_asignaciones_activas || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ruta.activo
                              ? 'bg-green-900/50 text-green-300 border border-green-600'
                              : 'bg-red-900/50 text-red-300 border border-red-600'
                          }`}>
                            {ruta.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(ruta)}
                            className="text-sky-400 hover:text-sky-300 mr-3 transition-colors"
                          >
                            Editar
                          </button>
                          {ruta.activo ? (
                            <button
                              onClick={() => handleDesactivar(ruta.id, ruta.nombre_ruta)}
                              className="text-yellow-400 hover:text-yellow-300 mr-3 transition-colors"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivar(ruta.id, ruta.nombre_ruta)}
                              className="text-green-400 hover:text-green-300 mr-3 transition-colors"
                            >
                              Reactivar
                            </button>
                          )}
                          <button
                            onClick={() => handleEliminar(ruta.id, ruta.nombre_ruta)}
                            disabled={ruta.cantidad_asignaciones_activas > 0}
                            className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                            title={
                              ruta.cantidad_asignaciones_activas > 0
                                ? 'No se puede eliminar una ruta con asignaciones activas'
                                : 'Eliminar ruta'
                            }
                          >
                            Eliminar
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


    </div>
  );
};

export default GestionRutas;
