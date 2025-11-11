import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getAsignaciones,
  getAsignacionesActivas,
  createAsignacion,
  cambiarEstadoAsignacion,
  deleteAsignacion,
  getChoferesDisponibles,
  getVehiculosDisponibles,
  getRutasActivas
} from '../services/AsignacionesService';

const GestionAsignaciones = () => {
  const { isAdmin, isChofer, loading: authLoading, userData } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todas'); // todas, activas, completadas, canceladas
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    chofer_id: '',
    vehiculo_id: '',
    ruta_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    observaciones: ''
  });

  useEffect(() => {
    if (!authLoading) {
      cargarDatos();
    }
  }, [authLoading, filtro]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar asignaciones según filtro
      let data;
      if (filtro === 'activas') {
        data = await getAsignacionesActivas();
      } else {
        data = await getAsignaciones();
        
        // Aplicar filtro local si no es 'todas'
        if (filtro !== 'todas') {
          data = data.filter(a => a.estado === filtro);
        }
      }
      
      setAsignaciones(data);

      // Solo cargar recursos si es admin
      if (isAdmin) {
        const [choferesData, vehiculosData, rutasData] = await Promise.all([
          getChoferesDisponibles(),
          getVehiculosDisponibles(),
          getRutasActivas()
        ]);
        
        setChoferes(choferesData);
        setVehiculos(vehiculosData);
        setRutas(rutasData);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createAsignacion({
        chofer_id: parseInt(formData.chofer_id),
        vehiculo_id: formData.vehiculo_id,
        ruta_id: parseInt(formData.ruta_id),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || null,
        observaciones: formData.observaciones
      });
      
      // Resetear formulario
      setFormData({
        chofer_id: '',
        vehiculo_id: '',
        ruta_id: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        observaciones: ''
      });
      setMostrarFormulario(false);
      
      await cargarDatos();
    } catch (err) {
      setError('Error al crear asignación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (asignacionId, nuevoEstado) => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await cambiarEstadoAsignacion(asignacionId, nuevoEstado);
      await cargarDatos();
    } catch (err) {
      setError('Error al cambiar estado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (asignacionId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta asignación?')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteAsignacion(asignacionId);
      await cargarDatos();
    } catch (err) {
      setError('Error al eliminar asignación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading de autenticación
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-400"></div>
        <div className="text-xl font-semibold text-white font-montserrat">
          Verificando permisos...
        </div>
      </div>
    );
  }

  // Si no tiene rol válido
  if (!isAdmin && !isChofer) {
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
    <div className="p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white font-montserrat mb-2">
          Gestión de Asignaciones
        </h1>
        <p className="text-gray-300">
          {isAdmin ? 'Administra las asignaciones de choferes, vehículos y rutas' : 'Consulta tus asignaciones'}
        </p>
      </div>

      {/* Botón para mostrar formulario (solo admin) */}
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md font-semibold flex items-center gap-2"
          >
            {mostrarFormulario ? '❌ Cancelar' : '➕ Nueva Asignación'}
          </button>
        </div>
      )}

      {/* Formulario de creación (solo admin) */}
      {isAdmin && mostrarFormulario && (
        <div className="mb-8 p-6 border border-sky-400 rounded-lg shadow-md backdrop-blur-sm bg-slate-800/50">
          <h2 className="text-xl font-semibold mb-4 text-white font-montserrat">
            ➕ Nueva Asignación
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Selector de Chofer */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Chofer <span className="text-red-400">*</span>
                </label>
                <select
                  name="chofer_id"
                  value={formData.chofer_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-white"
                >
                  <option value="">Seleccionar chofer...</option>
                  {choferes.map(chofer => (
                    <option key={chofer.id} value={chofer.id}>
                      {chofer.nombre_completo} - {chofer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Vehículo */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Vehículo <span className="text-red-400">*</span>
                </label>
                <select
                  name="vehiculo_id"
                  value={formData.vehiculo_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-white"
                >
                  <option value="">Seleccionar vehículo...</option>
                  {vehiculos.map(vehiculo => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Ruta */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Ruta <span className="text-red-400">*</span>
                </label>
                <select
                  name="ruta_id"
                  value={formData.ruta_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-white"
                >
                  <option value="">Seleccionar ruta...</option>
                  {rutas.map(ruta => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.nombre_ruta}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de inicio */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Fecha de Inicio <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-white"
                />
              </div>

              {/* Fecha de fin (opcional) */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Fecha de Fin (opcional)
                </label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-white"
                />
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2">
                <label className="block text-gray-300 font-medium mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Notas adicionales sobre esta asignación..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-white placeholder-gray-400"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`py-3 px-6 bg-sky-600 text-white rounded-md transition duration-150 ease-in-out font-semibold
                          ${loading ? 'cursor-not-allowed opacity-60' : 'hover:bg-sky-700 cursor-pointer'}`}
              >
                {loading ? 'Creando...' : '✅ Crear Asignación'}
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                disabled={loading}
                className={`py-3 px-6 bg-gray-600 text-white rounded-md transition duration-150 ease-in-out
                          ${loading ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-700 cursor-pointer'}`}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            filtro === 'todas'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFiltro('activas')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            filtro === 'activas'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          Activas
        </button>
        <button
          onClick={() => setFiltro('completada')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            filtro === 'completada'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          Completadas
        </button>
        <button
          onClick={() => setFiltro('cancelada')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            filtro === 'cancelada'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          Canceladas
        </button>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="p-4 bg-red-900/30 text-red-300 border border-red-500 rounded-md mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Lista de asignaciones */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-white font-montserrat">
            {filtro === 'todas' ? 'Todas las Asignaciones' : `Asignaciones ${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`}
          </h2>
          <button
            onClick={cargarDatos}
            disabled={loading}
            className={`py-2 px-4 bg-green-600 text-white rounded-md transition duration-150 ease-in-out 
                      ${loading ? 'cursor-not-allowed opacity-60' : 'hover:bg-green-700 cursor-pointer'}`}
          >
            {loading ? 'Cargando...' : '🔄 Actualizar'}
          </button>
        </div>

        {loading && asignaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-400 mb-4"></div>
            <p className="text-white italic">Cargando asignaciones...</p>
          </div>
        ) : asignaciones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No hay asignaciones {filtro !== 'todas' ? filtro : ''}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {asignaciones.map((asignacion) => (
              <div
                key={asignacion.asignacion_id}
                className={`p-5 border rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
                  asignacion.estado === 'activa'
                    ? 'bg-green-900/20 border-green-500'
                    : asignacion.estado === 'completada'
                    ? 'bg-blue-900/20 border-blue-500'
                    : 'bg-red-900/20 border-red-500'
                }`}
              >
                {/* Header de la asignación */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {asignacion.chofer_completo}
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        asignacion.estado === 'activa'
                          ? 'bg-green-600 text-white'
                          : asignacion.estado === 'completada'
                          ? 'bg-blue-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {asignacion.estado.toUpperCase()}
                    </span>
                  </div>

                  {/* Botones de acción (solo admin) */}
                  {isAdmin && (
                    <div className="flex gap-2">
                      {asignacion.estado === 'activa' && (
                        <>
                          <button
                            onClick={() => handleCambiarEstado(asignacion.asignacion_id, 'completada')}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-3 text-sm transition"
                            title="Marcar como completada"
                          >
                            ✅ Completar
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(asignacion.asignacion_id, 'cancelada')}
                            disabled={loading}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-md py-2 px-3 text-sm transition"
                            title="Cancelar asignación"
                          >
                            ⚠️ Cancelar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEliminar(asignacion.asignacion_id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-md py-2 px-3 text-sm transition"
                        title="Eliminar asignación"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>

                {/* Información de la asignación */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Chofer */}
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">👤 Chofer</p>
                    <p className="text-white font-semibold">{asignacion.chofer_completo}</p>
                    <p className="text-gray-300 text-sm">{asignacion.chofer_email}</p>
                  </div>

                  {/* Vehículo */}
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">🚗 Vehículo</p>
                    <p className="text-white font-semibold">{asignacion.vehiculo_completo}</p>
                    <p className={`text-sm ${asignacion.vehiculo_disponible ? 'text-red-400' : 'text-green-400'}`}>
                      {asignacion.vehiculo_disponible ? 'Disponible' : 'En uso'}
                    </p>
                  </div>

                  {/* Ruta */}
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">🗺️ Ruta</p>
                    <p className="text-white font-semibold">{asignacion.nombre_ruta}</p>
                  </div>

                  {/* Fechas */}
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">📅 Fecha Inicio</p>
                    <p className="text-white font-semibold">
                      {new Date(asignacion.fecha_inicio).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  {asignacion.fecha_fin && (
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">📅 Fecha Fin</p>
                      <p className="text-white font-semibold">
                        {new Date(asignacion.fecha_fin).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}

                  {/* Asignado por */}
                  {asignacion.admin_completo && (
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">👨‍💼 Asignado por</p>
                      <p className="text-white font-semibold">{asignacion.admin_completo}</p>
                    </div>
                  )}
                </div>

                {/* Observaciones */}
                {asignacion.observaciones && (
                  <div className="mt-4 bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">📝 Observaciones</p>
                    <p className="text-gray-300">{asignacion.observaciones}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionAsignaciones;
