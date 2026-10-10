import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVehiculos } from '@/hooks/useVehiculos';
import StatusDot from '@/components/ui/StatusDot';
import { Table, Th, Tr, Td, TableMessage } from '@/components/ui/Table';
import { PencilIcon, TrashIcon, PlusIcon, CloseIcon } from '@/components/ui/icons';
import {
  labelClass,
  inputClass,
  buttonPrimaryClass,
  buttonGhostClass,
  iconButtonClass,
  alertErrorClass,
  alertSuccessClass
} from '@/components/ui/tokens';

const formDataInicial = () => ({ placa: '', marca: '', modelo: '', activo: true });

const GestionVehiculos = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const {
    vehiculos,
    choferesDisponibles,
    loading,
    error,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
  } = useVehiculos();

  // Estado exclusivamente de UI
  const [success, setSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todos');
  const [filtroChofer, setFiltroChofer] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState(formDataInicial());

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const abrirCrear = () => {
    setEditando(null);
    setFormData(formDataInicial());
    setFormError(null);
    setSuccess(null);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setEditando(null);
    setFormData(formDataInicial());
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setFormError('Solo los administradores pueden gestionar vehículos');
      return;
    }
    setFormError(null);
    setSuccess(null);
    try {
      if (editando) {
        await actualizarVehiculo(editando, formData);
        setSuccess('Vehículo actualizado');
      } else {
        await crearVehiculo(formData);
        setSuccess('Vehículo creado');
      }
      cerrarFormulario();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // El hook ya deja el mensaje disponible en `error`.
    }
  };

  const handleEdit = (vehiculo) => {
    if (!isAdmin || vehiculo.tiene_asignacion_activa) {
      setFormError(vehiculo.tiene_asignacion_activa ? 'No se puede editar un vehículo con asignación activa' : 'Solo los administradores pueden editar vehículos');
      return;
    }
    setEditando(vehiculo.id);
    setFormData({
      placa: vehiculo.placa,
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      activo: vehiculo.activo
    });
    setFormError(null);
    setSuccess(null);
    setMostrarFormulario(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setFormError('Solo los administradores pueden eliminar vehículos');
      return;
    }
    const vehiculo = vehiculos.find(v => v.id === id);
    if (vehiculo?.tiene_asignacion_activa) {
      setFormError('No se puede eliminar un vehículo con asignación activa');
      return;
    }
    if (vehiculo?.chofer_id) {
      setFormError('No se puede eliminar un vehículo asignado a un chofer. Desasigne el chofer primero.');
      return;
    }
    if (!window.confirm('¿Eliminar este vehículo? Esta acción no se puede deshacer.')) return;
    try {
      await eliminarVehiculo(id);
      setSuccess('Vehículo eliminado');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { /* error del hook */ }
  };

  const vehiculosFiltrados = vehiculos.filter(vehiculo => {
    if (filtroEstado === 'activos' && !vehiculo.activo) return false;
    if (filtroEstado === 'inactivos' && vehiculo.activo) return false;
    if (filtroDisponibilidad === 'disponibles' && vehiculo.tiene_asignacion_activa) return false;
    if (filtroDisponibilidad === 'asignados' && !vehiculo.tiene_asignacion_activa) return false;
    if (isAdmin && filtroChofer !== 'todos') {
      if (filtroChofer === 'sin_asignar' && vehiculo.chofer_id) return false;
      if (filtroChofer !== 'sin_asignar' && vehiculo.chofer_id !== parseInt(filtroChofer)) return false;
    }
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (
        vehiculo.placa?.toLowerCase().includes(q) ||
        vehiculo.marca?.toLowerCase().includes(q) ||
        vehiculo.modelo?.toLowerCase().includes(q) ||
        vehiculo.chofer_nombre_completo?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (authLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--signal)]" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            {isAdmin ? 'Vehículos' : 'Mis vehículos asignados'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-mute)]">Flota y disponibilidad de la flota</p>
        </div>
        {isAdmin && (
          <button type="button" onClick={abrirCrear} className={buttonPrimaryClass}>
            <PlusIcon />
            Nuevo vehículo
          </button>
        )}
      </header>

      {(error || formError) && (
        <div className={alertErrorClass} role="alert">{error || formError}</div>
      )}

      {success && (
        <div className={alertSuccessClass}>
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess(null)} aria-label="Cerrar aviso" className={iconButtonClass}>
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Barra de filtros */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px]">
          <label htmlFor="veh-buscar" className={labelClass}>Buscar</label>
          <input
            id="veh-buscar"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Placa, marca o modelo…"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="veh-estado" className={labelClass}>Estado</label>
          <select id="veh-estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={inputClass}>
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>
        <div>
          <label htmlFor="veh-disponibilidad" className={labelClass}>Disponibilidad</label>
          <select id="veh-disponibilidad" value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value)} className={inputClass}>
            <option value="todos">Todos</option>
            <option value="disponibles">Disponibles</option>
            <option value="asignados">En asignación</option>
          </select>
        </div>
        {isAdmin && (
          <div>
            <label htmlFor="veh-chofer" className={labelClass}>Chofer</label>
            <select id="veh-chofer" value={filtroChofer} onChange={(e) => setFiltroChofer(e.target.value)} className={inputClass}>
              <option value="todos">Todos</option>
              <option value="sin_asignar">Sin asignar</option>
              {choferesDisponibles.map(chofer => (
                <option key={chofer.id} value={chofer.id}>{chofer.nombre_completo}</option>
              ))}
            </select>
          </div>
        )}
        <p className="ml-auto text-xs text-[var(--text-faint)]">
          {vehiculosFiltrados.length} vehículo{vehiculosFiltrados.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading && vehiculos.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--text-mute)]">Cargando vehículos…</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Placa</Th>
              <Th>Marca / Modelo</Th>
              <Th>Chofer asignado</Th>
              <Th>Ruta activa</Th>
              <Th>Estado</Th>
              {isAdmin && <Th align="right">Acciones</Th>}
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.length === 0 ? (
              <TableMessage colSpan={isAdmin ? 6 : 5}>No hay vehículos que coincidan con los filtros.</TableMessage>
            ) : (
              vehiculosFiltrados.map((vehiculo) => (
                <Tr key={vehiculo.id}>
                  <Td className="font-mono font-medium text-[var(--text)]">{vehiculo.placa}</Td>
                  <Td className="text-[var(--text-mute)]">
                    {[vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' ') || '—'}
                  </Td>
                  <Td className="text-[var(--text)]">{vehiculo.chofer_nombre_completo || 'Sin asignar'}</Td>
                  <Td className="text-[var(--text-mute)]">{vehiculo.nombre_ruta_activa || '—'}</Td>
                  <Td>
                    <StatusDot
                      tone={!vehiculo.activo ? 'danger' : vehiculo.tiene_asignacion_activa ? 'warn' : 'ok'}
                      label={!vehiculo.activo ? 'Inactivo' : vehiculo.tiene_asignacion_activa ? 'En asignación' : 'Disponible'}
                    />
                  </Td>
                  {isAdmin && (
                    <Td className="py-0 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(vehiculo)}
                          disabled={vehiculo.tiene_asignacion_activa}
                          className={iconButtonClass}
                          aria-label="Editar vehículo"
                          title={vehiculo.tiene_asignacion_activa ? 'No se puede editar con asignación activa' : 'Editar'}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vehiculo.id)}
                          disabled={vehiculo.tiene_asignacion_activa || Boolean(vehiculo.chofer_id)}
                          className={iconButtonClass}
                          aria-label="Eliminar vehículo"
                          title={vehiculo.tiene_asignacion_activa ? 'No se puede eliminar con asignación activa' : vehiculo.chofer_id ? 'Desasigne el chofer primero' : 'Eliminar'}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal de creación / edición */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="veh-modal-title">
          <div className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="veh-modal-title" className="text-base font-semibold text-[var(--text)]">
                {editando ? 'Editar vehículo' : 'Nuevo vehículo'}
              </h2>
              <button type="button" onClick={cerrarFormulario} aria-label="Cerrar" className={iconButtonClass}>
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="veh-placa" className={labelClass}>Placa</label>
                <input id="veh-placa" name="placa" type="text" value={formData.placa} onChange={handleInputChange} required className={`${inputClass} font-mono`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="veh-marca" className={labelClass}>Marca</label>
                  <input id="veh-marca" name="marca" type="text" value={formData.marca} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="veh-modelo" className={labelClass}>Modelo / año</label>
                  <input id="veh-modelo" name="modelo" type="text" value={formData.modelo} onChange={handleInputChange} required className={inputClass} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="veh-activo" name="activo" type="checkbox" checked={formData.activo} onChange={handleInputChange} className="h-4 w-4 rounded border-[var(--line-strong)] bg-[var(--raised)] accent-[var(--signal)]" />
                <label htmlFor="veh-activo" className="text-sm text-[var(--text)]">Vehículo activo</label>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={cerrarFormulario} className={buttonGhostClass}>Cancelar</button>
                <button type="submit" disabled={loading} className={buttonPrimaryClass}>
                  {loading ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionVehiculos;
