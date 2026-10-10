// Iconos SVG sobrios (trazo 1.6, sin relleno). Reemplazan a los emojis.

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

export function PencilIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export function TrashIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function PowerIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v9" />
      <path d="M18.36 6.64a9 9 0 1 1-12.72 0" />
    </svg>
  );
}

export function PlusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CloseIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CheckIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function LogoutIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
