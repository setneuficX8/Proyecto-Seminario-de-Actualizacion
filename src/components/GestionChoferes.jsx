import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { crearChofer, obtenerChoferes, actualizarChofer, eliminarChofer } from '../services/ChoferesService';

const GestionChoferes = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [choferes, setChoferes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    activo: true
  });

  useEffect(() => {
    if (!authLoading && isAdmin) {
      cargarChoferes();
    }
  }, [authLoading, isAdmin]);

  const cargarChoferes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerChoferes();
      setChoferes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar choferes: ' + err.message);
      setChoferes([]);
    } finally {
      setLoading(false);
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
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editando) {
        // Modo edición: NO se actualiza password
        await actualizarChofer(editando, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          activo: formData.activo
        });
        setSuccess('Chofer actualizado correctamente');
        setEditando(null);
      } else {
        // Modo creación: Validar passwords
        if (!formData.password || !formData.confirmPassword) {
          setError('La contraseña es requerida');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        const result = await crearChofer({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password
        });
        
        setSuccess(result.message || 'Chofer creado exitosamente');
      }

      setFormData({ 
        nombre: '', 
        apellido: '', 
        email: '', 
        password: '',
        confirmPassword: '',
        activo: true 
      });
      setMostrarFormulario(false);
      await cargarChoferes();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chofer) => {
    setEditando(chofer.id);
    setFormData({
      nombre: chofer.nombre,
      apellido: chofer.apellido,
      email: chofer.email,
      password: '',
      confirmPassword: '',
      activo: chofer.activo
    });
    setError(null);
    setSuccess(null);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setEditando(null);
    setMostrarFormulario(false);
    setFormData({ 
      nombre: '', 
      apellido: '', 
      email: '', 
      password: '',
      confirmPassword: '',
      activo: true 
    });
    setError(null);
    setSuccess(null);
  };

  const handleEliminar = async (id) => {
    const chofer = choferes.find(c => c.id === id);
    
    if (!window.confirm(`¿Estás seguro de eliminar a ${chofer.nombre} ${chofer.apellido}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await eliminarChofer(id);
      setSuccess('Chofer eliminado correctamente');
      await cargarChoferes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const choferesFiltrados = choferes.filter(chofer => {
    if (filtroEstado !== 'todos') {
      if (filtroEstado === 'activos' && !chofer.activo) return false;
      if (filtroEstado === 'inactivos' && chofer.activo) return false;
    }

    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      return (
        chofer.nombre?.toLowerCase().includes(searchLower) ||
        chofer.apellido?.toLowerCase().includes(searchLower) ||
        chofer.email?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

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
    <div className="p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white font-montserrat mb-2">
          Gestión de Choferes
        </h1>
        <p className="text-gray-300">
          Administra los choferes del sistema y envía invitaciones de registro
        </p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200 flex justify-between items-center">
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-400 hover:text-green-300 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Botón para mostrar formulario */}
      <div className="mb-6">
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md font-semibold flex items-center gap-2"
        >
          {mostrarFormulario ? '❌ Cancelar' : '➕ Nuevo Chofer'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className={`mb-8 p-6 border rounded-lg shadow-md backdrop-blur-sm ${
          editando ? 'border-yellow-500 bg-yellow-900/30' : 'border-sky-400 bg-slate-800/50'
        }`}>
          <h2 className="text-xl font-semibold mb-4 text-white font-montserrat">
            {editando ? '✏️ Editar Chofer' : '➕ Nuevo Chofer'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Apellido <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="chofer@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={editando}
                  className="w-full p-2.5 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {editando && (
                  <p className="text-xs text-gray-400 mt-1">El email no puede modificarse</p>
                )}
              </div>

              {/* Campos de contraseña - Solo en modo creación */}
              {!editando && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Contraseña <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Confirmar Contraseña <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Repite la contraseña"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 border border-gray-600 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </>
              )}

              {editando && (
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-gray-200 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                    />
                    Chofer activo
                  </label>
                </div>
              )}
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
                {loading ? 'Guardando...' : editando ? '💾 Actualizar' : '✅ Crear Chofer'}
              </button>

              <button
                type="button"
                onClick={handleCancelar}
                disabled={loading}
                className="py-2.5 px-6 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Nombre, apellido o email..."
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
        </div>
      </div>

      {/* Lista de Choferes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white font-montserrat">
            {choferesFiltrados.length} {choferesFiltrados.length === 1 ? 'Chofer' : 'Choferes'}
          </h2>
          <button
            onClick={cargarChoferes}
            disabled={loading}
            className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? 'Cargando...' : '🔄 Actualizar'}
          </button>
        </div>

        {loading && choferes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-400 mb-4"></div>
            <p className="text-white italic">Cargando choferes...</p>
          </div>
        ) : choferesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No hay choferes que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {choferesFiltrados.map((chofer) => (
              <div
                key={chofer.id}
                className="p-5 border border-slate-700 rounded-lg bg-slate-800/70 shadow-lg hover:border-slate-600 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      👤 {chofer.nombre} {chofer.apellido}
                    </h3>
                    <p className="text-gray-300">📧 {chofer.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      chofer.activo
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                    }`}>
                      {chofer.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    
                    {/* Badge de disponibilidad basado en asignaciones activas */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      chofer.disponible
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    }`}>
                      {chofer.disponible ? 'Disponible' : 'Ocupado'}
                    </span>
                  </div>
                </div>

                {chofer.updated_at && (
                  <div className="text-sm text-gray-400 mb-4">
                    Última actualización: {new Date(chofer.updated_at).toLocaleDateString('es-ES')}
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleEdit(chofer)}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => handleEliminar(chofer.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionChoferes;
