// Primitivas de tabla densa (Modo Operate).

export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--line)]">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ className = '', align = 'left', children }) {
  return (
    <th
      scope="col"
      className={`border-b border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--text-mute)] ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function Tr({ className = '', children }) {
  return (
    <tr className={`border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--raised)] ${className}`}>
      {children}
    </tr>
  );
}

export function Td({ className = '', children }) {
  return <td className={`px-3 py-2 align-middle ${className}`}>{children}</td>;
}

export function TableMessage({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-sm text-[var(--text-mute)]">
        {children}
      </td>
    </tr>
  );
}
