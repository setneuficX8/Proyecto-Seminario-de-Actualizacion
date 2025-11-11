import { supabase } from '../Supabase/Conection';

/**
 * ============================================
 * SERVICIO DE ASIGNACIONES
 * ============================================
 * Maneja el CRUD de asignaciones (Chofer + Vehículo + Ruta)
 */

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtener el usuario autenticado actual
 */
const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
    }
    
    return user;
};

/**
 * Verificar si el usuario es administrador
 */
const isUserAdmin = async () => {
    const user = await getCurrentUser();
    
    const { data: admin, error } = await supabase
        .from('administrador')
        .select('id, activo')
        .eq('user_id', user.id)
        .eq('activo', true)
        .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
        console.error('Error al verificar admin:', error);
        return { isAdmin: false, adminId: null };
    }
    
    return { isAdmin: !!admin, adminId: admin?.id || null };
};

// ============================================
// OPERACIONES CRUD
// ============================================

/**
 * Obtener todas las asignaciones
 * - Admin: ve todas
 * - Chofer: solo las suyas (filtrado automático por RLS)
 */
export const getAsignaciones = async () => {
    try {
        console.log('📖 Obteniendo asignaciones...');
        
        // Primero intentar sin los JOINs para ver si hay datos
        const { data, error } = await supabase
            .from('asignaciones')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error al obtener asignaciones:', error);
            throw error;
        }
        
        console.log('✅ Asignaciones obtenidas (sin relaciones):', data?.length || 0);
        
        // Si hay datos, intentar cargar las relaciones por separado
        if (data && data.length > 0) {
            const asignacionesConRelaciones = await Promise.all(
                data.map(async (asignacion) => {
                    // Cargar chofer
                    const { data: chofer } = await supabase
                        .from('Chofer')
                        .select('id, nombre, apellido, email, user_id')
                        .eq('id', asignacion.chofer_id)
                        .single();
                    
                    // Cargar vehículo
                    const { data: vehiculo } = await supabase
                        .from('vehiculos')
                        .select('id, placa, marca, modelo, vehiculo_id_api, activo, disponible')
                        .eq('id', asignacion.vehiculo_id)
                        .single();
                    
                    // Cargar ruta
                    const { data: ruta } = await supabase
                        .from('Rutas')
                        .select('id, nombre_ruta, id_ruta')
                        .eq('id', asignacion.ruta_id)
                        .single();
                    
                    // Cargar admin (puede ser null)
                    let admin = null;
                    if (asignacion.asignado_por) {
                        const { data: adminData } = await supabase
                            .from('administrador')
                            .select('id, nombre, apellido')
                            .eq('id', asignacion.asignado_por)
                            .maybeSingle();
                        admin = adminData;
                    }
                    
                    return {
                        asignacion_id: asignacion.id,
                        fecha_inicio: asignacion.fecha_inicio,
                        fecha_fin: asignacion.fecha_fin,
                        estado: asignacion.estado,
                        observaciones: asignacion.observaciones,
                        fecha_asignacion: asignacion.created_at,
                        updated_at: asignacion.updated_at,
                        chofer_id: asignacion.chofer_id,
                        chofer_nombre: chofer?.nombre,
                        chofer_apellido: chofer?.apellido,
                        chofer_completo: chofer ? `${chofer.nombre} ${chofer.apellido}` : 'N/A',
                        chofer_email: chofer?.email,
                        chofer_user_id: chofer?.user_id,
                        vehiculo_id: asignacion.vehiculo_id,
                        placa: vehiculo?.placa,
                        marca: vehiculo?.marca,
                        modelo: vehiculo?.modelo,
                        vehiculo_id_api: vehiculo?.vehiculo_id_api,
                        vehiculo_completo: vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}` : 'N/A',
                        vehiculo_activo: vehiculo?.activo,
                        vehiculo_disponible: vehiculo?.disponible,
                        ruta_id: asignacion.ruta_id,
                        nombre_ruta: ruta?.nombre_ruta,
                        ruta_uuid: ruta?.id_ruta,
                        asignado_por: asignacion.asignado_por,
                        admin_nombre: admin?.nombre,
                        admin_apellido: admin?.apellido,
                        admin_completo: admin ? `${admin.nombre} ${admin.apellido}` : null
                    };
                })
            );
            
            return asignacionesConRelaciones;
        }
        
        return [];
        
    } catch (error) {
        console.error("❌ Error en getAsignaciones:", error);
        throw error;
    }
};

/**
 * Obtener solo asignaciones activas
 */
export const getAsignacionesActivas = async () => {
    try {
        console.log('📖 Obteniendo asignaciones activas...');
        
        const { data, error } = await supabase
            .from('asignaciones')
            .select(`
                *,
                chofer:Chofer!inner(id, nombre, apellido, email, user_id),
                vehiculo:vehiculos!inner(id, placa, marca, modelo, vehiculo_id_api, activo, disponible),
                ruta:Rutas!inner(id, nombre_ruta, id_ruta),
                admin:administrador(id, nombre, apellido)
            `)
            .eq('estado', 'activa')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error al obtener asignaciones activas:', error);
            throw error;
        }
        
        // Transformar datos
        const asignacionesTransformadas = data?.map(a => ({
            asignacion_id: a.id,
            fecha_inicio: a.fecha_inicio,
            fecha_fin: a.fecha_fin,
            estado: a.estado,
            observaciones: a.observaciones,
            fecha_asignacion: a.created_at,
            updated_at: a.updated_at,
            chofer_id: a.chofer_id,
            chofer_nombre: a.chofer?.nombre,
            chofer_apellido: a.chofer?.apellido,
            chofer_completo: `${a.chofer?.nombre} ${a.chofer?.apellido}`,
            chofer_email: a.chofer?.email,
            chofer_user_id: a.chofer?.user_id,
            vehiculo_id: a.vehiculo_id,
            placa: a.vehiculo?.placa,
            marca: a.vehiculo?.marca,
            modelo: a.vehiculo?.modelo,
            vehiculo_id_api: a.vehiculo?.vehiculo_id_api,
            vehiculo_completo: `${a.vehiculo?.marca} ${a.vehiculo?.modelo} - ${a.vehiculo?.placa}`,
            vehiculo_activo: a.vehiculo?.activo,
            vehiculo_disponible: a.vehiculo?.disponible,
            ruta_id: a.ruta_id,
            nombre_ruta: a.ruta?.nombre_ruta,
            ruta_uuid: a.ruta?.id_ruta,
            asignado_por: a.asignado_por,
            admin_nombre: a.admin?.nombre,
            admin_apellido: a.admin?.apellido,
            admin_completo: a.admin ? `${a.admin.nombre} ${a.admin.apellido}` : null
        })) || [];
        
        console.log('✅ Asignaciones activas obtenidas:', asignacionesTransformadas.length);
        return asignacionesTransformadas;
        
    } catch (error) {
        console.error("❌ Error en getAsignacionesActivas:", error);
        throw error;
    }
};

/**
 * Crear una nueva asignación
 * Solo administradores pueden crear asignaciones
 */
export const createAsignacion = async (asignacionData) => {
    try {
        console.log('🚀 Iniciando creación de asignación...');
        console.log('📦 Datos recibidos:', asignacionData);
        
        // Verificar que el usuario es admin
        const { isAdmin, adminId } = await isUserAdmin();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden crear asignaciones');
        }
        
        // Preparar datos para inserción
        const dataParaInsertar = {
            chofer_id: asignacionData.chofer_id,
            vehiculo_id: asignacionData.vehiculo_id,
            ruta_id: asignacionData.ruta_id,
            fecha_inicio: asignacionData.fecha_inicio || new Date().toISOString().split('T')[0],
            fecha_fin: asignacionData.fecha_fin || null,
            estado: asignacionData.estado || 'activa',
            observaciones: asignacionData.observaciones || null,
            asignado_por: adminId
        };
        
        console.log('💾 Insertando asignación:', dataParaInsertar);
        
        const { data: asignacion, error } = await supabase
            .from('asignaciones')
            .insert([dataParaInsertar])
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error al crear asignación:', error);
            throw error;
        }
        
        console.log('✅ Asignación creada:', asignacion);
        
        // Recargar la asignación con todos los datos relacionados
        const { data: asignacionCompleta } = await supabase
            .from('asignaciones')
            .select(`
                *,
                chofer:Chofer!inner(id, nombre, apellido, email),
                vehiculo:vehiculos!inner(id, placa, marca, modelo),
                ruta:Rutas!inner(id, nombre_ruta),
                admin:administrador(id, nombre, apellido)
            `)
            .eq('id', asignacion.id)
            .single();
        
        return asignacionCompleta || asignacion;
        
    } catch (error) {
        console.error("❌ Error al crear asignación:", error);
        throw error;
    }
};

/**
 * Actualizar una asignación existente
 * Solo administradores pueden actualizar
 */
export const updateAsignacion = async (asignacionId, asignacionData) => {
    try {
        console.log('🔄 Actualizando asignación:', asignacionId);
        
        // Verificar que el usuario es admin
        const { isAdmin } = await isUserAdmin();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden actualizar asignaciones');
        }
        
        const { data: asignacion, error } = await supabase
            .from('asignaciones')
            .update(asignacionData)
            .eq('id', asignacionId)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error al actualizar asignación:', error);
            throw error;
        }
        
        console.log('✅ Asignación actualizada:', asignacion);
        return asignacion;
        
    } catch (error) {
        console.error("❌ Error al actualizar asignación:", error);
        throw error;
    }
};

/**
 * Cambiar el estado de una asignación
 * (activa → completada/cancelada)
 */
export const cambiarEstadoAsignacion = async (asignacionId, nuevoEstado) => {
    try {
        console.log('🔄 Cambiando estado de asignación:', asignacionId, 'a', nuevoEstado);
        
        // Verificar que el usuario es admin
        const { isAdmin } = await isUserAdmin();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden cambiar el estado de asignaciones');
        }
        
        const updateData = {
            estado: nuevoEstado
        };
        
        // Si se completa o cancela, establecer fecha_fin
        if (nuevoEstado === 'completada' || nuevoEstado === 'cancelada') {
            updateData.fecha_fin = new Date().toISOString().split('T')[0];
        }
        
        const { data: asignacion, error } = await supabase
            .from('asignaciones')
            .update(updateData)
            .eq('id', asignacionId)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error al cambiar estado:', error);
            throw error;
        }
        
        console.log('✅ Estado cambiado:', asignacion);
        return asignacion;
        
    } catch (error) {
        console.error("❌ Error al cambiar estado:", error);
        throw error;
    }
};

/**
 * Eliminar una asignación
 * Solo administradores pueden eliminar
 */
export const deleteAsignacion = async (asignacionId) => {
    try {
        console.log('🗑️ Eliminando asignación:', asignacionId);
        
        // Verificar que el usuario es admin
        const { isAdmin } = await isUserAdmin();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden eliminar asignaciones');
        }
        
        const { error } = await supabase
            .from('asignaciones')
            .delete()
            .eq('id', asignacionId);
        
        if (error) {
            console.error('❌ Error al eliminar asignación:', error);
            throw error;
        }
        
        console.log('✅ Asignación eliminada');
        return { success: true, message: 'Asignación eliminada correctamente' };
        
    } catch (error) {
        console.error("❌ Error al eliminar asignación:", error);
        throw error;
    }
};

// ============================================
// FUNCIONES AUXILIARES PARA FORMULARIOS
// ============================================

/**
 * Obtener choferes activos disponibles
 */
export const getChoferesDisponibles = async () => {
    try {
        const { data, error } = await supabase
            .from('Chofer')
            .select('*')
            .eq('activo', true)
            .order('nombre', { ascending: true });
        
        if (error) throw error;
        
        // Transformar para incluir nombre_completo
        const choferesTransformados = data?.map(c => ({
            ...c,
            nombre_completo: `${c.nombre} ${c.apellido}`
        })) || [];
        
        return choferesTransformados;
        
    } catch (error) {
        console.error("❌ Error al obtener choferes disponibles:", error);
        throw error;
    }
};

/**
 * Obtener vehículos disponibles (sin asignación activa)
 */
export const getVehiculosDisponibles = async () => {
    try {
        const { data, error } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('activo', true)
            .eq('disponible', true)
            .order('placa', { ascending: true });
        
        if (error) throw error;
        
        // Transformar para incluir vehiculo_completo
        const vehiculosTransformados = data?.map(v => ({
            ...v,
            vehiculo_id: v.id, // Agregar alias para compatibilidad
            vehiculo_completo: `${v.marca} ${v.modelo} - ${v.placa}`
        })) || [];
        
        return vehiculosTransformados;
        
    } catch (error) {
        console.error("❌ Error al obtener vehículos disponibles:", error);
        throw error;
    }
};

/**
 * Obtener rutas activas
 */
export const getRutasActivas = async () => {
    try {
        const { data, error } = await supabase
            .from('Rutas')
            .select('*')
            .eq('activo', true)
            .order('nombre_ruta', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
        
    } catch (error) {
        console.error("❌ Error al obtener rutas activas:", error);
        throw error;
    }
};
