import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';

/**
 * ============================================
 * HOOK: useAuth
 * ============================================
 * Consumidor del AuthContext. Devuelve el estado de autenticación y el rol
 * (admin/chofer) resueltos una sola vez por <AuthProvider />.
 *
 * Debe usarse dentro del árbol de <AuthProvider> (montado en main.jsx).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }

  return context;
};

export default useAuth;
