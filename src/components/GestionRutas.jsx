import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRutas } from '@/hooks/useRutas';
import StatusDot from '@/components/ui/StatusDot';
import { Table, Th, Tr, Td, TableMessage } from '@/components/ui/Table';
import { PencilIcon, TrashIcon, PowerIcon, CloseIcon } from '@/components/ui/icons';
import {
  labelClass,
  inputClass,
  buttonPrimaryClass,
  buttonGhostClass,
  iconButtonClass,
  alertErrorClass,
  alertSuccessClass
} from '@/components/ui/tokens';

const GestionRutas = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const {
    rutas,
    loading,
    actionLoading,
    error,
    actualizarRuta,
    desactivarRuta,
    reactivarRuta,
    eliminarRuta,
    limpiarError
  } = useRutas();

  // Estado exclusivamente de UI
  const [success, setSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [editando, setEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const handleEdit = (ruta) => {
    setEditando({ id: ruta.id, nombre_ruta: ruta.nombre_ruta, activo: ruta.activo });
    limpiarError();
    setFormError(null);
    setSuccess(null);
  };

  const cerrarModal = () => {
    setEditando(null);
    limpiarError();
    setFormError(null);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!editando.nombre_ruta.trim()) {
      setFormError('El nombre de la ruta es requerido');
      return;
    }
    try {
      await actualizarRuta(editando.id, {
        nombre_ruta: editando.nombre_ruta,
        activo: editando.activo
      });
      setSuccess('Ruta actualizada');
      setEditando(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // El hook ya deja el mensaje disponible en `error`.
    }
  };

  const handleDesactivar = async (ruta) => {
    if (!window.confirm(`¿Desactivar la ruta "${ruta.nombre_ruta}"?`)) return;
    try {
      await desactivarRuta(ruta.id);
      setSuccess('Ruta desactivada');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { /* error del hook */ }
  };

  const handleReactivar = async (ruta) => {
    if (!window.confirm(`¿Reactivar la ruta "${ruta.nombre_ruta}"?`)) return;
    try {
      await reactivarRuta(ruta.id);
      setSuccess('Ruta reactivada');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { /* error del hook */ }
  };

  const handleEliminar = async (ruta) => {
    if (!window.confirm(`¿Eliminar permanentemente la ruta "${ruta.nombre_ruta}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarRuta(ruta.id);
      setSuccess('Ruta eliminada');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { /* error del hook */ }
  };

  const rutasFiltradas = rutas.filter(ruta => {
    const coincideBusqueda = ruta.nombre_ruta.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'activas' && ruta.activo) ||
      (filtroEstado === 'inactivas' && !ruta.activo);
    return coincideBusqueda && coincideEstado;
  });

  if (authLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--signal)]" aria-hidden="true" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 p-6 text-center">
        <h2 className="text-base font-semibold text-[var(--text)]">Acceso denegado</h2>
        <p className="mt-1 text-sm text-[var(--text-mute)]">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Rutas</h1>
        <p className="mt-1 text-sm text-[var(--text-mute)]">Administra las rutas de recolección</p>
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
        <div className="min-w-[220px]">
          <label htmlFor="rutas-buscar" className={labelClass}>Buscar</label>
          <input
            id="rutas-buscar"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre de ruta…"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="rutas-estado" className={labelClass}>Estado</label>
          <select
            id="rutas-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className={inputClass}
          >
            <option value="todos">Todas</option>
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>
        </div>
        <p className="ml-auto text-xs text-[var(--text-faint)]">
          {rutasFiltradas.length} ruta{rutasFiltradas.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading && rutas.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--text-mute)]">Cargando rutas…</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th className="w-16">ID</Th>
              <Th>Nombre</Th>
              <Th>Origen</Th>
              <Th align="right">Asignaciones</Th>
              <Th>Estado</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {rutasFiltradas.length === 0 ? (
              <TableMessage colSpan={6}>No hay rutas que coincidan con los filtros.</TableMessage>
            ) : (
              rutasFiltradas.map((ruta) => (
                <Tr key={ruta.id}>
                  <Td className="font-mono text-xs tabular-nums text-[var(--text-faint)]">{ruta.id}</Td>
                  <Td className="font-medium text-[var(--text)]">{ruta.nombre_ruta}</Td>
                  <Td className="text-[var(--text-mute)]">{ruta.ruta_id_api ? 'API externa' : 'Local'}</Td>
                  <Td className="text-right font-mono tabular-nums text-[var(--text)]">
                    {ruta.cantidad_asignaciones_activas || 0}
                  </Td>
                  <Td>
                    <StatusDot tone={ruta.activo ? 'ok' : 'danger'} label={ruta.activo ? 'Activa' : 'Inactiva'} />
                  </Td>
                  <Td className="py-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => handleEdit(ruta)} className={iconButtonClass} aria-label="Editar ruta" title="Editar">
                        <PencilIcon />
                      </button>
                      {ruta.activo ? (
                        <button type="button" onClick={() => handleDesactivar(ruta)} className={iconButtonClass} aria-label="Desactivar ruta" title="Desactivar">
                          <PowerIcon />
                        </button>
                      ) : (
                        <button type="button" onClick={() => handleReactivar(ruta)} className={iconButtonClass} aria-label="Reactivar ruta" title="Reactivar">
                          <PowerIcon />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEliminar(ruta)}
                        disabled={ruta.cantidad_asignaciones_activas > 0}
                        className={iconButtonClass}
                        aria-label="Eliminar ruta"
                        title={ruta.cantidad_asignaciones_activas > 0 ? 'No se puede eliminar una ruta con asignaciones activas' : 'Eliminar'}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal de edición */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="ruta-modal-title">
          <div className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="ruta-modal-title" className="text-base font-semibold text-[var(--text)]">Editar ruta</h2>
              <button type="button" onClick={cerrarModal} aria-label="Cerrar" className={iconButtonClass}>
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              <div>
                <label htmlFor="ruta-nombre" className={labelClass}>Nombre de la ruta</label>
                <input
                  id="ruta-nombre"
                  type="text"
                  value={editando.nombre_ruta}
                  onChange={(e) => setEditando({ ...editando, nombre_ruta: e.target.value })}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="ruta-activo" className={labelClass}>Estado</label>
                <select
                  id="ruta-activo"
                  value={editando.activo}
                  onChange={(e) => setEditando({ ...editando, activo: e.target.value === 'true' })}
                  className={inputClass}
                >
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={cerrarModal} className={buttonGhostClass}>Cancelar</button>
                <button type="submit" disabled={actionLoading} className={buttonPrimaryClass}>
                  {actionLoading ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionRutas;
