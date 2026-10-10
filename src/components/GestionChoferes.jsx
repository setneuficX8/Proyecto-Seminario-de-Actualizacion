import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChoferes } from '@/hooks/useChoferes';
import StatusDot from '@/components/ui/StatusDot';
import { Table, Th, Tr, Td, TableMessage } from '@/components/ui/Table';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
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

const formDataInicial = () => ({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: '',
  activo: true
});

const GestionChoferes = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const {
    choferes,
    loading,
    error,
    crearChofer,
    actualizarChofer,
    eliminarChofer
  } = useChoferes();

  // Estado exclusivamente de UI
  const [success, setSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState(formDataInicial());
  const [confirm, setConfirm] = useState(null);

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
    setFormError(null);
    setSuccess(null);
    try {
      if (editando) {
        await actualizarChofer(editando, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          activo: formData.activo
        });
        setSuccess('Chofer actualizado');
      } else {
        if (!formData.password || !formData.confirmPassword) {
          setFormError('La contraseña es requerida');
          return;
        }
        if (formData.password.length < 6) {
          setFormError('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setFormError('Las contraseñas no coinciden');
          return;
        }
        const result = await crearChofer({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password
        });
        setSuccess(result.message || 'Chofer creado');
      }
      cerrarFormulario();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      // El hook ya deja el mensaje disponible en `error`.
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
    setFormError(null);
    setSuccess(null);
    setMostrarFormulario(true);
  };

  const handleEliminar = (chofer) => setConfirm({
    title: 'Eliminar chofer',
    message: `Se eliminará a ${chofer.nombre} ${chofer.apellido}. Esta acción no se puede deshacer.`,
    confirmLabel: 'Eliminar',
    tone: 'danger',
    onConfirm: async () => {
      await eliminarChofer(chofer.id);
      setSuccess('Chofer eliminado');
      setTimeout(() => setSuccess(null), 3000);
    }
  });

  const ejecutarConfirmacion = async () => {
    const action = confirm?.onConfirm;
    setConfirm(null);
    if (action) {
      try { await action(); } catch (err) { /* error del hook */ }
    }
  };

  const choferesFiltrados = choferes.filter(chofer => {
    if (filtroEstado === 'activos' && !chofer.activo) return false;
    if (filtroEstado === 'inactivos' && chofer.activo) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (
        chofer.nombre?.toLowerCase().includes(q) ||
        chofer.apellido?.toLowerCase().includes(q) ||
        chofer.email?.toLowerCase().includes(q)
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

  if (!isAdmin) {
    return (
      <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 p-6 text-center">
        <h2 className="text-base font-semibold text-[var(--text)]">Acceso denegado</h2>
        <p className="mt-1 text-sm text-[var(--text-mute)]">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Choferes</h1>
          <p className="mt-1 text-sm text-[var(--text-mute)]">Personal del sistema y su disponibilidad</p>
        </div>
        <button type="button" onClick={abrirCrear} className={buttonPrimaryClass}>
          <PlusIcon />
          Nuevo chofer
        </button>
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
          <label htmlFor="cho-buscar" className={labelClass}>Buscar</label>
          <input
            id="cho-buscar"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, apellido o email…"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cho-estado" className={labelClass}>Estado</label>
          <select id="cho-estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={inputClass}>
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>
        <p className="ml-auto text-xs text-[var(--text-faint)]">
          {choferesFiltrados.length} chofer{choferesFiltrados.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {loading && choferes.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--text-mute)]">Cargando choferes…</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th className="w-16">ID</Th>
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Estado</Th>
              <Th>Disponibilidad</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {choferesFiltrados.length === 0 ? (
              <TableMessage colSpan={6}>No hay choferes que coincidan con los filtros.</TableMessage>
            ) : (
              choferesFiltrados.map((chofer) => (
                <Tr key={chofer.id}>
                  <Td className="font-mono text-xs tabular-nums text-[var(--text-faint)]">{chofer.id}</Td>
                  <Td className="font-medium text-[var(--text)]">{chofer.nombre} {chofer.apellido}</Td>
                  <Td className="font-mono text-xs text-[var(--text-mute)]">{chofer.email}</Td>
                  <Td>
                    <StatusDot tone={chofer.activo ? 'ok' : 'danger'} label={chofer.activo ? 'Activo' : 'Inactivo'} />
                  </Td>
                  <Td>
                    <StatusDot
                      tone={chofer.activo ? (chofer.disponible ? 'ok' : 'warn') : 'idle'}
                      label={chofer.activo ? (chofer.disponible ? 'Disponible' : 'Ocupado') : '—'}
                    />
                  </Td>
                  <Td className="py-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => handleEdit(chofer)} className={iconButtonClass} aria-label="Editar chofer" title="Editar">
                        <PencilIcon />
                      </button>
                      <button type="button" onClick={() => handleEliminar(chofer)} className={iconButtonClass} aria-label="Eliminar chofer" title="Eliminar">
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

      {/* Modal de creación / edición */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="cho-modal-title">
          <div className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="cho-modal-title" className="text-base font-semibold text-[var(--text)]">
                {editando ? 'Editar chofer' : 'Nuevo chofer'}
              </h2>
              <button type="button" onClick={cerrarFormulario} aria-label="Cerrar" className={iconButtonClass}>
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cho-nombre" className={labelClass}>Nombre</label>
                  <input id="cho-nombre" name="nombre" type="text" value={formData.nombre} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="cho-apellido" className={labelClass}>Apellido</label>
                  <input id="cho-apellido" name="apellido" type="text" value={formData.apellido} onChange={handleInputChange} required className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="cho-email" className={labelClass}>Email</label>
                <input
                  id="cho-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={Boolean(editando)}
                  spellCheck={false}
                  className={`${inputClass} disabled:opacity-60`}
                />
                {editando && <p className="mt-1 text-xs text-[var(--text-faint)]">El email no puede modificarse.</p>}
              </div>

              {!editando && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cho-password" className={labelClass}>Contraseña</label>
                    <input id="cho-password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className={inputClass} placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div>
                    <label htmlFor="cho-confirm" className={labelClass}>Confirmar contraseña</label>
                    <input id="cho-confirm" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required className={inputClass} />
                  </div>
                </div>
              )}

              {editando && (
                <div className="flex items-center gap-2">
                  <input id="cho-activo" name="activo" type="checkbox" checked={formData.activo} onChange={handleInputChange} className="h-4 w-4 rounded border-[var(--line-strong)] bg-[var(--raised)] accent-[var(--signal)]" />
                  <label htmlFor="cho-activo" className="text-sm text-[var(--text)]">Chofer activo</label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={cerrarFormulario} className={buttonGhostClass}>Cancelar</button>
                <button type="submit" disabled={loading} className={buttonPrimaryClass}>
                  {loading ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear chofer'}
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
        busy={loading}
        onCancel={() => setConfirm(null)}
        onConfirm={ejecutarConfirmacion}
      />
    </div>
  );
};

export default GestionChoferes;
