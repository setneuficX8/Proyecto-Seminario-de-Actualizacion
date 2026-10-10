import { buttonGhostClass, buttonDangerClass, buttonPrimaryClass } from './tokens';

/**
 * Diálogo de confirmación accesible para acciones destructivas.
 * Reemplaza a window.confirm().
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={message ? 'confirm-dialog-desc' : undefined}
    >
      <div className="w-full max-w-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 id="confirm-dialog-title" className="text-base font-semibold text-[var(--text)]">{title}</h2>
        {message && <p id="confirm-dialog-desc" className="mt-2 text-sm text-[var(--text-mute)]">{message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={buttonGhostClass}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={tone === 'danger' ? buttonDangerClass : buttonPrimaryClass}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
