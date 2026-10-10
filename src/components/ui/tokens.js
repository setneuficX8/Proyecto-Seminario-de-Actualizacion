// Clases compartidas del sistema visual (Modo Operate).
// Tokens definidos en src/index.css (@theme).

export const labelClass =
  'mb-1 block text-xs font-medium text-[var(--text-mute)]';

export const inputClass =
  'h-9 w-full rounded-md border border-[var(--line-strong)] bg-[var(--raised)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]';

export const buttonPrimaryClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--signal)] px-4 text-sm font-semibold text-[var(--canvas)] transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas)] disabled:pointer-events-none disabled:opacity-50';

export const buttonGhostClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--line-strong)] px-4 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] disabled:pointer-events-none disabled:opacity-50';

export const buttonDangerClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--danger)] px-4 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)] disabled:pointer-events-none disabled:opacity-50';

// Botón-icono con touch target de 44x44 px.
export const iconButtonClass =
  'inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--text-mute)] transition-colors hover:bg-[var(--raised)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] disabled:pointer-events-none disabled:opacity-40';

export const alertErrorClass =
  'mb-4 rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--text)]';

export const alertSuccessClass =
  'mb-4 flex items-center justify-between gap-2 rounded-md border border-[var(--ok)] bg-[var(--ok)]/10 px-3 py-2 text-sm text-[var(--text)]';
