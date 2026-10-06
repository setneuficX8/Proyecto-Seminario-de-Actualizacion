import { useEffect, useState, useCallback, useMemo } from 'react';
import { AuthContext } from './auth-context';
import { supabase } from '../Supabase/Conection';

/**
 * ============================================
 * PROVEEDOR: AuthProvider
 * ============================================
 * Mantiene UNA sola suscripción a onAuthStateChange y resuelve el rol
 * (admin/chofer) una única vez para toda la aplicación. El valor del contexto se
 * memoiza con useMemo para evitar re-renderizados innecesarios de los consumidores.
 *
 * Este archivo exporta únicamente el componente (Fast Refresh).
 */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChofer, setIsChofer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Verificar y cargar los datos del usuario actual
  const checkUserRole = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        setUser(null);
        setIsAdmin(false);
        setIsChofer(false);
        setUserData(null);
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // Verificar si es administrador
      const { data: adminData, error: adminError } = await supabase
        .from('administrador')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('activo', true)
        .maybeSingle();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error al verificar admin:', adminError);
      }

      if (adminData) {
        setIsAdmin(true);
        setIsChofer(false);
        setUserData({
          role: 'admin',
          id: adminData.id,
          nombre: adminData.nombre,
          apellido: adminData.apellido,
          email: adminData.email,
          permisos: {
            puede_crear_choferes: adminData.puede_crear_choferes,
            puede_crear_vehiculos: adminData.puede_crear_vehiculos,
            puede_crear_rutas: adminData.puede_crear_rutas,
            puede_crear_asignaciones: adminData.puede_crear_asignaciones
          }
        });
        return;
      }

      // Verificar si es chofer
      const { data: choferData, error: choferError } = await supabase
        .from('Chofer')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('activo', true)
        .maybeSingle();

      if (choferError && choferError.code !== 'PGRST116') {
        console.error('Error al verificar chofer:', choferError);
      }

      if (choferData) {
        setIsAdmin(false);
        setIsChofer(true);
        setUserData({
          role: 'chofer',
          id: choferData.id,
          nombre: choferData.nombre,
          apellido: choferData.apellido,
          email: choferData.email
        });
        return;
      }

      // Usuario sin rol asignado
      setIsAdmin(false);
      setIsChofer(false);
      setUserData({
        role: 'sin_rol',
        email: currentUser.email
      });

    } catch (err) {
      console.error('Error en checkUserRole:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Una única suscripción a los cambios de autenticación
  useEffect(() => {
    checkUserRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkUserRole();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [checkUserRole]);

  // Valor memoizado del contexto
  const value = useMemo(() => ({
    user,
    isAdmin,
    isChofer,
    loading,
    error,
    userData,
    role: userData?.role || null
  }), [user, isAdmin, isChofer, loading, error, userData]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
