import { createContext } from 'react';

/**
 * Contexto de autenticación.
 *
 * Se mantiene en un archivo SIN componentes (no .jsx) para que React Fast Refresh
 * no advierta por "non-component export" (`only-export-components`). El proveedor
 * vive en `AuthProvider.jsx` y el consumidor público en `src/hooks/useAuth.js`.
 */
export const AuthContext = createContext(undefined);
