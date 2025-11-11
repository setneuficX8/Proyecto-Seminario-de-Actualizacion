import { useState, useEffect } from 'react';
import { supabase } from '../Supabase/Conection';

/**
 * ============================================
 * HOOK PERSONALIZADO: useAuth
 * ============================================
 * Maneja la autenticación y detección de roles
 * Retorna información del usuario y su rol (admin/chofer)
 */

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChofer, setIsChofer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Función para verificar y cargar datos del usuario
    const checkUserRole = async () => {
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
          setLoading(false);
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
          setLoading(false);
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
          setLoading(false);
          return;
        }

        // Usuario sin rol asignado
        setIsAdmin(false);
        setIsChofer(false);
        setUserData({
          role: 'sin_rol',
          email: currentUser.email
        });
        setLoading(false);

      } catch (err) {
        console.error('Error en checkUserRole:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkUserRole();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      checkUserRole();
    });

    // Cleanup
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    isAdmin,
    isChofer,
    loading,
    error,
    userData,
    role: userData?.role || null
  };
};

export default useAuth;
