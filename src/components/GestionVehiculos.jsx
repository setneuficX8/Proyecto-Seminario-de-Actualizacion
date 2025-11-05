import React, { useState, useEffect } from 'react';
import { getVehiculos, createVehiculo, deleteVehiculo,updateVehiculo } from '../services/VehiculosService'; 

const GestionVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null); // ID del vehículo en edición
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    activo: true
  });

  // Cargar vehículos al montar el componente
  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVehiculos();
      console.log('📦 Datos recibidos del servicio:', data);
      console.log('📊 Primer vehículo (si existe):', data[0]);
      
      // Verificar si data es un array o si viene dentro de una propiedad
      if (Array.isArray(data)) {
        setVehiculos(data);
      } else if (data && data.vehiculos && Array.isArray(data.vehiculos)) {
        setVehiculos(data.vehiculos);
      } else if (data && data.data && Array.isArray(data.data)) {
        setVehiculos(data.data);
      } else {
        console.log('Estructura de datos inesperada:', data);
        setVehiculos([]);
      }
    } catch (err) {
      console.error('Error detallado:', err);
      setError('Error al cargar vehículos: ' + err.message);
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
      if (editando) {
        // Actualizar vehículo existente
        await updateVehiculo(editando, formData);
        setEditando(null);
      } else {
        // Crear nuevo vehículo
        await createVehiculo(formData);
      }
      setFormData({ placa: '', marca: '', modelo: '', activo: true });
      await cargarVehiculos(); // Recargar la lista
    } catch (err) {
      setError(editando ? 'Error al actualizar vehículo: ' + err.message : 'Error al crear vehículo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehiculo) => {
    setEditando(vehiculo.id);
    setFormData({
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      activo: vehiculo.activo
    });
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
    setFormData({ placa: '', marca: '', modelo: '', activo: true });
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteVehiculo(id);
      await cargarVehiculos(); // Recargar la lista
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar vehículo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Gestión de Vehículos</h1>
      
      {/* Formulario para crear/editar vehículo */}
      <div className={`mb-8 p-5 border rounded-lg shadow-md backdrop-blur-sm ${
        editando ? 'border-yellow-500 bg-yellow-900/30' : 'border-gray-300 bg-slate-800/50'
      }`}>
        <h2 className="text-xl font-semibold mb-4 text-white">
          {editando ? '✏️ Editar Vehículo' : '➕ Agregar Nuevo Vehículo'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              type="text"
              name="placa"
              placeholder="Placa (ej: ABC123)"
              value={formData.placa}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white placeholder-gray-400 placeholder:text-sm"
            />
            <input
              type="text"
              name="marca"
              placeholder="Marca (ej: Chevrolet)"
              value={formData.marca}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white placeholder-gray-400 placeholder:text-sm"
            />
            <input
              type="text"
              name="modelo"
              placeholder="Modelo/Año (ej: 2020)"
              value={formData.modelo}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white placeholder-gray-400 placeholder:text-sm"
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-gray-200 font-medium">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                Vehículo activo
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className={`py-2.5 px-5 text-white rounded-md transition duration-150 ease-in-out 
                        ${editando ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}
                        ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              {loading ? 'Guardando...' : editando ? 'Actualizar Vehículo' : 'Agregar Vehículo'}
            </button>
            {editando && (
              <button 
                type="button"
                onClick={handleCancelarEdicion}
                disabled={loading}
                className={`py-2.5 px-5 bg-gray-600 text-white rounded-md transition duration-150 ease-in-out 
                          ${loading ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-700 cursor-pointer'}`}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de vehículos */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-white">Lista de Vehículos</h2>
          <button 
            onClick={cargarVehiculos}
            disabled={loading}
            className={`py-2 px-4 bg-green-600 text-white rounded-md transition duration-150 ease-in-out 
                      ${loading ? 'cursor-not-allowed opacity-60' : 'hover:bg-green-700 cursor-pointer'}`}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-100 text-red-800 border border-red-400 rounded-md mb-5" role="alert">
            {error}
          </div>
        )}

        {loading && vehiculos.length === 0 ? (
          <p className="text-white italic">Cargando vehículos...</p>
        ) : vehiculos.length === 0 ? (
          <p className="text-white italic">No hay vehículos registrados</p>
        ) : (
          <div className="grid gap-4">
            {Array.isArray(vehiculos) && vehiculos.map((vehiculo, index) => (
              <div 
                key={vehiculo.id || index}
                className="p-4 border border-gray-300 rounded-lg bg-gray-700 shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="m-0 text-lg font-semibold text-gray-50">
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                  </h3>
                  {vehiculo.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(vehiculo)}
                        disabled={loading}
                        className={`bg-yellow-600 text-white rounded-md py-1.5 px-3 text-xs 
                                    transition duration-150 ease-in-out
                                    ${loading ? 'cursor-not-allowed opacity-60' : 'hover:bg-yellow-700 cursor-pointer'}`}
                        title="Editar vehículo"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(vehiculo.id)}
                        disabled={loading}
                        className={`bg-red-600 text-white rounded-md py-1.5 px-3 text-xs 
                                    transition duration-150 ease-in-out
                                    ${loading ? 'cursor-not-allowed opacity-60' : 'hover:bg-red-700 cursor-pointer'}`}
                        title="Eliminar vehículo"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  <p className="text-white"><strong>Placa:</strong> {vehiculo.placa}</p>
                  <p className="text-white"><strong>Marca:</strong> {vehiculo.marca}</p>
                  <p className="text-white"><strong>Modelo:</strong> {vehiculo.modelo}</p>
                  <p className="text-white"><strong>Estado:</strong> 
                    <span className={`${vehiculo.activo ? 'text-green-400' : 'text-red-400'} font-bold ml-1`}>
                      {vehiculo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                  {/* Mostrar el ID de la API externa (el real) */}
                  {vehiculo.vehiculo_id_api && (
                    <p className="text-white">
                      <strong>ID API:</strong> {vehiculo.vehiculo_id_api}
                    </p>
                  )}
                  {/* Mostrar información del chofer si está disponible */}
                  {vehiculo.chofer_nombre_completo && (
                    <p className="text-white col-span-full">
                      <strong>Chofer:</strong> {vehiculo.chofer_nombre_completo}
                    </p>
                  )}
                  {/* ID de Supabase (UUID) - solo para debug, puedes ocultarlo */}
                  {vehiculo.id && (
                    <p className="text-gray-400 text-xs col-span-full">
                      <strong>ID Interno:</strong> {vehiculo.id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionVehiculos;