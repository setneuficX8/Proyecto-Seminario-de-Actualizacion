import React, { useState, useEffect } from 'react';
import { getVehiculos, createVehiculo, deleteVehiculo, updateVehiculo, getChoferesDisponibles } from '../services/VehiculosService';
import { useAuth } from '../hooks/useAuth';

const GestionVehiculos = () => {
  const { isAdmin, isChofer, loading: authLoading, userData } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editando, setEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todos');
  const [filtroChofer, setFiltroChofer] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    activo: true,
    chofer_id: ''
  });

  useEffect(() => {
    if (!authLoading) {
      cargarVehiculos();
      if (isAdmin) {
        cargarChoferes();
      }
    }
  }, [authLoading, isAdmin]);

  const cargarVehiculos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVehiculos();
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar vehículos: ' + err.message);
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarChoferes = async () => {
    try {
      const data = await getChoferesDisponibles();
      setChoferes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar choferes:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Solo los administradores pueden gestionar vehículos');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (editando) {
        await updateVehiculo(editando, formData);
        setSuccess('Vehículo actualizado correctamente');
        setEditando(null);
      } else {
        await createVehiculo(formData);
        setSuccess('Vehículo creado correctamente');
      }
      
      setFormData({ placa: '', marca: '', modelo: '', activo: true, chofer_id: '' });
      await cargarVehiculos();
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehiculo) => {
    if (!isAdmin || vehiculo.tiene_asignacion_activa) {
      setError(vehiculo.tiene_asignacion_activa ? 'No se puede editar un vehículo con asignación activa' : 'Solo los administradores pueden editar vehículos');
      return;
    }
    
    setEditando(vehiculo.id);
    setFormData({
      placa: vehiculo.placa,
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      activo: vehiculo.activo,
      chofer_id: vehiculo.chofer_id || ''
    });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
    setFormData({ placa: '', marca: '', modelo: '', activo: true, chofer_id: '' });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setError('Solo los administradores pueden eliminar vehículos');
      return;
    }
    
    const vehiculo = vehiculos.find(v => v.id === id);
    
    if (vehiculo?.tiene_asignacion_activa) {
      setError('No se puede eliminar un vehículo con asignación activa');
      return;
    }
    
    if (vehiculo?.chofer_id) {
      setError('No se puede eliminar un vehículo asignado a un chofer. Desasigne el chofer primero.');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteVehiculo(id);
      setSuccess('Vehículo eliminado correctamente');
      await cargarVehiculos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const vehiculosFiltrados = vehiculos.filter(vehiculo => {
    if (filtroEstado !== 'todos') {
      if (filtroEstado === 'activos' && !vehiculo.activo) return false;
      if (filtroEstado === 'inactivos' && vehiculo.activo) return false;
    }
    
    if (filtroDisponibilidad !== 'todos') {
      if (filtroDisponibilidad === 'disponibles' && vehiculo.tiene_asignacion_activa) return false;
      if (filtroDisponibilidad === 'asignados' && !vehiculo.tiene_asignacion_activa) return false;
    }
    
    if (isAdmin && filtroChofer !== 'todos') {
      if (filtroChofer === 'sin_asignar' && vehiculo.chofer_id) return false;
      if (filtroChofer !== 'sin_asignar' && vehiculo.chofer_id !== parseInt(filtroChofer)) return false;
    }
    
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      return (
        vehiculo.placa?.toLowerCase().includes(searchLower) ||
        vehiculo.marca?.toLowerCase().includes(searchLower) ||
        vehiculo.modelo?.toLowerCase().includes(searchLower) ||
        vehiculo.chofer_nombre_completo?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white text-xl">Verificando permisos...</div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">
        {isAdmin ? 'Gestión de Vehículos' : 'Mis Vehículos Asignados'}
      </h1>
      
      {/* Mensajes */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
          {success}
        </div>
      )}
      
      {/* Formulario - SOLO ADMIN */}
      {isAdmin && (
        <div className={`mb-8 p-6 border rounded-lg shadow-md backdrop-blur-sm ${
          editando ? 'border-yellow-500 bg-yellow-900/30' : 'border-slate-700 bg-slate-800/50'
        }`}>
          <h2 className="text-xl font-semibold mb-4 text-white">
            {editando ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Placa *</label>
                <input
                  type="text"
                  name="placa"
                  placeholder="ABC123"
                  value={formData.placa}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Marca *</label>
                <input
                  type="text"
                  name="marca"
                  placeholder="Chevrolet"
                  value={formData.marca}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Modelo/Año *</label>
                <input
                  type="text"
                  name="modelo"
                  placeholder="2020"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
                </div>
            
            <div className="mb-4">
              <label className="flex items-center gap-2 text-gray-200 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
                Vehículo activo
              </label>
            </div>
            
            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={loading}
                className={`py-2.5 px-6 text-white rounded-md font-medium transition ${
                  editando 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-sky-600 hover:bg-sky-700'
                } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Crear Vehículo'}
              </button>
              
              {editando && (
                <button 
                  type="button"
                  onClick={handleCancelarEdicion}
                  disabled={loading}
                  className="py-2.5 px-6 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition disabled:opacity-60"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      
      {/* Filtros y búsqueda */}
      <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Placa, marca, modelo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Disponibilidad</label>
            <select
              value={filtroDisponibilidad}
              onChange={(e) => setFiltroDisponibilidad(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="todos">Todos</option>
              <option value="disponibles">Disponibles</option>
              <option value="asignados">En asignación</option>
            </select>
          </div>
          
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Chofer</label>
              <select
                value={filtroChofer}
                onChange={(e) => setFiltroChofer(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="todos">Todos</option>
                <option value="sin_asignar">Sin asignar</option>
                {choferes.map(chofer => (
                  <option key={chofer.id} value={chofer.id}>
                    {chofer.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de vehículos */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">
            {vehiculosFiltrados.length} {vehiculosFiltrados.length === 1 ? 'Vehículo' : 'Vehículos'}
          </h2>
          <button 
            onClick={cargarVehiculos}
            disabled={loading}
            className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {loading && vehiculos.length === 0 ? (
          <p className="text-white italic">Cargando vehículos...</p>
        ) : vehiculosFiltrados.length === 0 ? (
          <p className="text-white italic">No hay vehículos que coincidan con los filtros</p>
        ) : (
          <div className="grid gap-4">
            {vehiculosFiltrados.map((vehiculo) => (
              <div 
                key={vehiculo.id}
                className="p-5 border border-slate-700 rounded-lg bg-slate-800/70 shadow-lg hover:border-slate-600 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {vehiculo.placa}
                    </h3>
                    <p className="text-gray-300">
                      {vehiculo.marca} {vehiculo.modelo}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Badge Estado */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      vehiculo.activo 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                    }`}>
                      {vehiculo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    
                    {/* Badge Disponibilidad */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      vehiculo.tiene_asignacion_activa
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'bg-green-500/20 text-green-400 border border-green-500/50'
                    }`}>
                      {vehiculo.tiene_asignacion_activa ? 'En asignación' : 'Disponible'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <span className="text-gray-400">Chofer asignado:</span>
                    <span className="text-white ml-2 font-medium">
                      {vehiculo.chofer_nombre_completo}
                    </span>
                  </div>
                  
                  {vehiculo.tiene_asignacion_activa && (
                    <div>
                      <span className="text-gray-400">Ruta activa:</span>
                      <span className="text-yellow-400 ml-2 font-medium">
                        {vehiculo.nombre_ruta_activa}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Acciones - Solo para Admin */}
                {isAdmin && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                    <button
                      onClick={() => handleEdit(vehiculo)}
                      disabled={vehiculo.tiene_asignacion_activa || loading}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title={vehiculo.tiene_asignacion_activa ? 'No se puede editar con asignación activa' : 'Editar vehículo'}
                    >
                      Editar
                    </button>
                    
                    <button
                      onClick={() => handleDelete(vehiculo.id)}
                      disabled={vehiculo.tiene_asignacion_activa || vehiculo.chofer_id || loading}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        vehiculo.tiene_asignacion_activa 
                          ? 'No se puede eliminar con asignación activa' 
                          : vehiculo.chofer_id 
                            ? 'Desasigne el chofer primero' 
                            : 'Eliminar vehículo'
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Vista de información del chofer - Solo para choferes */}
      {isChofer && userData && (
        <div className="mt-8 p-6 border border-slate-700 rounded-lg bg-slate-800/50">
          <h3 className="text-xl font-semibold text-white mb-4">Mi Información</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Nombre:</span>
              <span className="text-white ml-2 font-medium">
                {userData.nombre} {userData.apellido}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2 font-medium">{userData.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionVehiculos;
