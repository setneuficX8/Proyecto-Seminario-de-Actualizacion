import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAsignaciones } from '@/hooks/useAsignaciones';
import StatusDot from '@/components/ui/StatusDot';
import { Table, Th, Tr, Td, TableMessage } from '@/components/ui/Table';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { CheckIcon, TrashIcon, PlusIcon, CloseIcon } from '@/components/ui/icons';
import {
  labelClass,
  inputClass,
  buttonPrimaryClass,
  buttonGhostClass,
  iconButtonClass,
  alertErrorClass
} from '@/components/ui/tokens';

// Constantes para días de la semana
const DIAS_SEMANA = [
  { id: 0, nombre: 'Dom', nombreCompleto: 'Domingo' },
  { id: 1, nombre: 'Lun', nombreCompleto: 'Lunes' },
  { id: 2, nombre: 'Mar', nombreCompleto: 'Martes' },
  { id: 3, nombre: 'Mié', nombreCompleto: 'Miércoles' },
  { id: 4, nombre: 'Jue', nombreCompleto: 'Jueves' },
  { id: 5, nombre: 'Vie', nombreCompleto: 'Viernes' },
  { id: 6, nombre: 'Sáb', nombreCompleto: 'Sábado' }
];

const FILTROS = [
  { value: 'todas', label: 'Todas' },
  { value: 'activas', label: 'Activas' },
  { value: 'completada', label: 'Completadas' },
  { value: 'cancelada', label: 'Canceladas' }
];

const ESTADO_TONE = { activa: 'ok', completada: 'idle', cancelada: 'danger' };

const formatearHorario = (diasSemana, horaInicio, horaFin) => {
  if (!diasSemana || diasSemana.length === 0) return 'Sin horario';
  const dias = [...diasSemana].sort((a, b) => a - b)
    .map(d => DIAS_SEMANA.find(dia => dia.id === d)?.nombre || '')
    .join(', ');
  const h = (v) => (v ? v.substring(0, 5) : '--:--');
  return `${dias} · ${h(horaInicio)}–${h(horaFin)}`;
};

const formDataInicial = () => ({
  chofer_id: '',
  vehiculo_id: '',
  ruta_id: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  dias_semana: [],
  hora_inicio: '08:00',
  hora_fin: '14:00',
  observaciones: ''
});

const segBase = 'inline-flex h-9 items-center rounded-md px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]';
const segActive = `${segBase} bg-[var(--signal)] text-[var(--canvas)]`;
const segInactive = `${segBase} text-[var(--text-mute)] transition-colors hover:bg-[var(--raised)] hover:text-[var(--text)]`;

const GestionAsignaciones = () => {
  const { isAdmin, isChofer, loading: authLoading } = useAuth();
  const {
    asignaciones,
    rutasDisponibles,
    vehiculosDisponibles,
    choferesDisponibles,
    loading,
    actionLoading,
    error,
    crearAsignacion,
    cambiarEstadoAsignacion,
    eliminarAsignacion,
    limpiarError
  } = useAsignaciones();

  // Estado exclusivamente de UI
  const [filtro, setFiltro] = useState('todas');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState(formDataInicial());
  const [confirm, setConfirm] = useState(null);

  const abrirCrear = () => {
    limpiarError();
    setFormError(null);
    setFormData(formDataInicial());
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setFormError(null);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleDia = (diaId) => {
    setFormData(prev => {
      const actuales = prev.dias_semana || [];
      const dias = actuales.includes(diaId)
        ? actuales.filter(d => d !== diaId)
        : [...actuales, diaId].sort((a, b) => a - b);
      return { ...prev, dias_semana: dias };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.dias_semana.length) {
      setFormError('Debes seleccionar al menos un día de la semana');
      return;
    }
    if (formData.hora_inicio >= formData.hora_fin) {
      setFormError('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    try {
      await crearAsignacion({
        chofer_id: parseInt(formData.chofer_id),
        vehiculo_id: formData.vehiculo_id,
        ruta_id: parseInt(formData.ruta_id),
        fecha_inicio: formData.fecha_inicio,
        dias_semana: formData.dias_semana,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        observaciones: formData.observaciones
      });
      setFormData(formDataInicial());
      setMostrarFormulario(false);
    } catch (err) {
      // El hook ya deja el mensaje disponible en `error`.
    }
  };

  const pedirCambioEstado = (asignacion, nuevoEstado) => {
    setConfirm({
      title: `Marcar como ${nuevoEstado}`,
      message: `La asignación de ${asignacion.chofer_completo || 'este chofer'} pasará a estado "${nuevoEstado}".`,
      confirmLabel: 'Confirmar',
      tone: nuevoEstado === 'cancelada' ? 'danger' : 'primary',
      onConfirm: () => cambiarEstadoAsignacion(asignacion.asignacion_id, nuevoEstado)
    });
  };

  const pedirEliminar = (asignacion) => {
    setConfirm({
      title: 'Eliminar asignación',
      message: `Se eliminará la asignación de ${asignacion.chofer_completo || 'este chofer'}. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      tone: 'danger',
      onConfirm: () => eliminarAsignacion(asignacion.asignacion_id)
    });
  };

  const ejecutarConfirmacion = async () => {
    const action = confirm?.onConfirm;
    setConfirm(null);
    if (action) {
      try { await action(); } catch (err) { /* error del hook */ }
    }
  };

  const asignacionesFiltradas = filtro === 'todas'
    ? asignaciones
    : asignaciones.filter(a => a.estado === filtro);

  if (authLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--signal)]" aria-hidden="true" />
      </div>
    );
  }

  if (!isAdmin && !isChofer) {
    return (
      <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 p-6 text-center">
        <h2 className="text-base font-semibold text-[var(--text)]">Acceso denegado</h2>
        <p className="mt-1 text-sm text-[var(--text-mute)]">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Asignaciones</h1>
        <p className="mt-1 text-sm text-[var(--text-mute)]">
          {isAdmin ? 'Asigna choferes, vehículos y rutas' : 'Consulta tus asignaciones'}
        </p>
      </header>

      {(error || formError) && (
        <div className={alertErrorClass} role="alert">{error || formError}</div>
      )}

      {/* Barra de filtros + acción */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTROS.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFiltro(f.value)}
            aria-pressed={filtro === f.value}
            className={filtro === f.value ? segActive : segInactive}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-2 text-xs text-[var(--text-faint)]">
          {asignacionesFiltradas.length} registro{asignacionesFiltradas.length !== 1 ? 's' : ''}
        </span>
        {isAdmin && (
          <button type="button" onClick={abrirCrear} className={`${buttonPrimaryClass} ml-auto`}>
            <PlusIcon />
            Nueva asignación
          </button>
        )}
      </div>

      {loading && asignaciones.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--text-mute)]">Cargando asignaciones…</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Ruta</Th>
              <Th>Vehículo</Th>
              <Th>Chofer</Th>
              <Th>Horario</Th>
              <Th>Estado</Th>
              {isAdmin && <Th align="right">Acciones</Th>}
            </tr>
          </thead>
          <tbody>
            {asignacionesFiltradas.length === 0 ? (
              <TableMessage colSpan={isAdmin ? 6 : 5}>No hay asignaciones que coincidan con el filtro.</TableMessage>
            ) : (
              asignacionesFiltradas.map((asignacion) => (
                <Tr key={asignacion.asignacion_id}>
                  <Td className="text-[var(--text)]">{asignacion.nombre_ruta || '—'}</Td>
                  <Td className="text-[var(--text-mute)]">
                    <span className="font-mono">{asignacion.placa || '—'}</span>
                    <span className="ml-2">{[asignacion.marca, asignacion.modelo].filter(Boolean).join(' ')}</span>
                  </Td>
                  <Td className="text-[var(--text)]">{asignacion.chofer_completo || '—'}</Td>
                  <Td className="font-mono text-xs tabular-nums text-[var(--text-mute)]">
                    {formatearHorario(asignacion.dias_semana, asignacion.hora_inicio, asignacion.hora_fin)}
                  </Td>
                  <Td>
                    <StatusDot
                      tone={ESTADO_TONE[asignacion.estado] || 'idle'}
                      label={asignacion.estado ? asignacion.estado.charAt(0).toUpperCase() + asignacion.estado.slice(1) : '—'}
                    />
                  </Td>
                  {isAdmin && (
                    <Td className="py-0 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {asignacion.estado === 'activa' && (
                          <>
                            <button
                              type="button"
                              onClick={() => pedirCambioEstado(asignacion, 'completada')}
                              className={iconButtonClass}
                              aria-label="Marcar como completada"
                              title="Marcar como completada"
                            >
                              <CheckIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => pedirCambioEstado(asignacion, 'cancelada')}
                              className={iconButtonClass}
                              aria-label="Cancelar asignación"
                              title="Cancelar asignación"
                            >
                              <CloseIcon />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => pedirEliminar(asignacion)}
                          className={iconButtonClass}
                          aria-label="Eliminar asignación"
                          title="Eliminar asignación"
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

      {/* Modal de creación */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="asig-modal-title">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="asig-modal-title" className="text-base font-semibold text-[var(--text)]">Nueva asignación</h2>
              <button type="button" onClick={cerrarFormulario} aria-label="Cerrar" className={iconButtonClass}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="asig-chofer" className={labelClass}>Chofer</label>
                  <select id="asig-chofer" name="chofer_id" value={formData.chofer_id} onChange={handleInputChange} required className={inputClass}>
                    <option value="">Seleccionar…</option>
                    {choferesDisponibles.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre_completo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="asig-vehiculo" className={labelClass}>Vehículo</label>
                  <select id="asig-vehiculo" name="vehiculo_id" value={formData.vehiculo_id} onChange={handleInputChange} required className={inputClass}>
                    <option value="">Seleccionar…</option>
                    {vehiculosDisponibles.map(v => (
                      <option key={v.id} value={v.id}>{v.placa} — {[v.marca, v.modelo].filter(Boolean).join(' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="asig-ruta" className={labelClass}>Ruta</label>
                  <select id="asig-ruta" name="ruta_id" value={formData.ruta_id} onChange={handleInputChange} required className={inputClass}>
                    <option value="">Seleccionar…</option>
                    {rutasDisponibles.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre_ruta}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="asig-fecha" className={labelClass}>Vigente desde</label>
                  <input id="asig-fecha" name="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleInputChange} required className={`${inputClass} font-mono`} />
                </div>
              </div>

              <fieldset>
                <legend className={labelClass}>Días de la semana</legend>
                <div className="flex flex-wrap gap-1.5">
                  {DIAS_SEMANA.map(dia => (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => toggleDia(dia.id)}
                      aria-pressed={formData.dias_semana.includes(dia.id)}
                      className={formData.dias_semana.includes(dia.id) ? segActive : segInactive}
                    >
                      {dia.nombre}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="asig-hora-inicio" className={labelClass}>Hora de inicio</label>
                  <input id="asig-hora-inicio" name="hora_inicio" type="time" value={formData.hora_inicio} onChange={handleInputChange} required className={`${inputClass} font-mono`} />
                </div>
                <div>
                  <label htmlFor="asig-hora-fin" className={labelClass}>Hora de fin</label>
                  <input id="asig-hora-fin" name="hora_fin" type="time" value={formData.hora_fin} onChange={handleInputChange} required className={`${inputClass} font-mono`} />
                </div>
              </div>

              <div>
                <label htmlFor="asig-observaciones" className={labelClass}>Observaciones</label>
                <textarea
                  id="asig-observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={cerrarFormulario} className={buttonGhostClass} disabled={actionLoading}>Cancelar</button>
                <button type="submit" disabled={actionLoading} className={buttonPrimaryClass}>
                  {actionLoading ? 'Creando…' : 'Crear asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        busy={actionLoading}
        onCancel={() => setConfirm(null)}
        onConfirm={ejecutarConfirmacion}
      />
    </div>
  );
};

export default GestionAsignaciones;
