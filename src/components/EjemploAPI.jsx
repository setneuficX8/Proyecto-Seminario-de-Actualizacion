import React, { useState, useEffect } from 'react';
import { getVehiculos, createVehiculo } from '../API/VehiculoAPI';

const EjemploAPI = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      console.log('Datos recibidos:', data);
      
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
    try {
      await createVehiculo(formData);
      setFormData({ placa: '', marca: '', modelo: '', activo: true });
      await cargarVehiculos(); // Recargar la lista
    } catch (err) {
      setError('Error al crear vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Gestión de Vehículos</h1>
      
      {/* Formulario para crear vehículo */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Agregar Nuevo Vehículo</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              name="placa"
              placeholder="Placa (ej: ABC123)"
              value={formData.placa}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="text"
              name="marca"
              placeholder="Marca (ej: Chevrolet)"
              value={formData.marca}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="text"
              name="modelo"
              placeholder="Modelo/Año (ej: 2020)"
              value={formData.modelo}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                />
                Vehículo activo
              </label>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Guardando...' : 'Agregar Vehículo'}
          </button>
        </form>
      </div>

      {/* Lista de vehículos */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Lista de Vehículos</h2>
          <button 
            onClick={cargarVehiculos}
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            border: '1px solid #f5c6cb', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {loading && vehiculos.length === 0 ? (
          <p>Cargando vehículos...</p>
        ) : vehiculos.length === 0 ? (
          <p>No hay vehículos registrados</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {Array.isArray(vehiculos) && vehiculos.map((vehiculo, index) => (
              <div 
                key={vehiculo.id || index}
                style={{ 
                  padding: '15px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#333'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: ' #f9f9f9' }}>
                  {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  <p><strong>Placa:</strong> {vehiculo.placa}</p>
                  <p><strong>Marca:</strong> {vehiculo.marca}</p>
                  <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
                  <p><strong>Estado:</strong> 
                    <span style={{ 
                      color: vehiculo.activo ? '#28a745' : '#dc3545',
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {vehiculo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                  {vehiculo.id && <p><strong>ID:</strong> {vehiculo.id}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EjemploAPI;