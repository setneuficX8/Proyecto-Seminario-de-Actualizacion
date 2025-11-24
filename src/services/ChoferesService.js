import { supabase } from '../Supabase/Conection';

/**
 * Crear un nuevo chofer usando Edge Function
 * El admin establece la contraseña inicial del chofer
 */
export const crearChofer = async (choferData) => {
  try {
    // Validar que se incluya password
    if (!choferData.password) {
      throw new Error('La contraseña es requerida');
      
    }

    // Obtener el usuario actual (admin)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('No hay sesión activa');
    }

    // Obtener el ID del administrador
    const { data: admin, error: adminError } = await supabase
      .from('administrador')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !admin) {
      throw new Error('Usuario no es administrador');
    }

    // Invocar Edge Function para crear chofer
    const { data, error } = await supabase.functions.invoke('crear-chofer', {
      body: {
        nombre: choferData.nombre,
        apellido: choferData.apellido,
        email: choferData.email,
        password: choferData.password,
        creado_por: admin.id
      }
    });

    if (error) {
      console.error('Error invocando Edge Function:', error);
      throw new Error(error.message || 'Error al invocar la función');
    }

    // Si no hay data, algo salió mal
    if (!data) {
      throw new Error('No se recibió respuesta de la función');
    }

    // La Edge Function puede retornar error en el body
    if (data.success === false) {
      throw new Error(data.error || 'Error desconocido al crear chofer');
    }

    return {
      success: true,
      chofer: data.chofer,
      message: data.message
    };
consolo.log(('hdp',choferData));
  } 
  
  catch (error) {
    console.error('Error en crearChofer:', error);
    throw new Error(error.message || 'Error al crear chofer');
  }
};

/**
 * Obtener todos los choferes con información de disponibilidad
 */
export const obtenerChoferes = async () => {
  try {
    // Consultar vista que incluye disponibilidad basada en asignaciones activas
    const { data, error } = await supabase
      .from('vista_choferes_disponibles')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error obteniendo choferes:', error);
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('Error en obtenerChoferes:', error);
    throw new Error(error.message || 'Error al obtener choferes');
  }
};

/**
 * Obtener un chofer por ID
 */
export const obtenerChoferPorId = async (id) => {
  try {
    const { data, error } = await supabase
      .from('Chofer')
      .select(`
        id,
        nombre,
        apellido,
        email,
        user_id,
        activo,
        creado_por,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo chofer:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error en obtenerChoferPorId:', error);
    throw new Error(error.message || 'Error al obtener chofer');
  }
};

/**
 * Actualizar un chofer
 */
export const actualizarChofer = async (id, choferData) => {
  try {
    const { data, error } = await supabase
      .from('Chofer')
      .update({
        nombre: choferData.nombre,
        apellido: choferData.apellido,
        activo: choferData.activo
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando chofer:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error en actualizarChofer:', error);
    throw new Error(error.message || 'Error al actualizar chofer');
  }
};

/**
 * Eliminar un chofer
 */
export const eliminarChofer = async (id) => {
  try {
    const { error } = await supabase
      .from('Chofer')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando chofer:', error);
      throw error;
    }

    return true;

  } catch (error) {
    console.error('Error en eliminarChofer:', error);
    throw new Error(error.message || 'Error al eliminar chofer');
  }
};

/**
 * Obtener choferes activos
 */
export const obtenerChoferesActivos = async () => {
  try {
    const { data, error } = await supabase
      .from('vista_choferes_activos')
      .select('*')
      .order('nombre');

    if (error) {
      console.error('Error obteniendo choferes activos:', error);
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('Error en obtenerChoferesActivos:', error);
    throw new Error(error.message || 'Error al obtener choferes activos');
  }
};

/**
 * Obtener choferes disponibles (sin asignación activa)
 */
export const obtenerChoferesDisponibles = async () => {
  try {
    const { data, error } = await supabase
      .from('vista_choferes_disponibles')
      .select('*')
      .order('nombre');

    if (error) {
      console.error('Error obteniendo choferes disponibles:', error);
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('Error en obtenerChoferesDisponibles:', error);
    throw new Error(error.message || 'Error al obtener choferes disponibles');
  }
};

// Exportación para compatibilidad con código antiguo
export const ChoferesService = {
  crearChofer,
  obtenerChoferes,
  obtenerChoferPorId,
  actualizarChofer,
  eliminarChofer,
  obtenerChoferesActivos,
  obtenerChoferesDisponibles
};
