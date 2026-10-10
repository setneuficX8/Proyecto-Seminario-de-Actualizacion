// Indicador de estado: punto de 6px + texto semántico.
// No depende solo del color (acompaña siempre con texto).

const TONES = {
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
  idle: 'var(--text-faint)',
};

export default function StatusDot({ tone = 'idle', label }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[var(--text-mute)]">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: TONES[tone] || TONES.idle }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
