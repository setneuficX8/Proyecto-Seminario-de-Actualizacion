import { supabase } from '../Supabase/Conection';


/**
 * Actualizar la disponibilidad de un vehículo basado en sus asignaciones activas
 * Si no tiene asignaciones activas, se marca como disponible
 */
const actualizarDisponibilidadVehiculo = async (vehiculoId) => {
    try {
        // Verificar si el vehículo tiene alguna asignación activa
        const { data: asignacionesActivas, error: errorBuscar } = await supabase
            .from('asignaciones')
            .select('id')
            .eq('vehiculo_id', vehiculoId)
            .eq('estado', 'activa')
            .limit(1);
        
        if (errorBuscar) {
            console.error('Error al buscar asignaciones activas:', errorBuscar);
            return;
        }
        
        // Si no hay asignaciones activas, marcar vehículo como disponible
        const estaDisponible = !asignacionesActivas || asignacionesActivas.length === 0;
        
        const { error: errorUpdate } = await supabase
            .from('vehiculos')
            .update({ 
                disponible: estaDisponible,
                updated_at: new Date().toISOString()
            })
            .eq('id', vehiculoId);
        
        if (errorUpdate) {
            console.error('Error al actualizar disponibilidad del vehículo:', errorUpdate);
        } else {
            console.log(`Vehículo ${vehiculoId} marcado como ${estaDisponible ? 'disponible' : 'no disponible'}`);
        }
    } catch (error) {
        console.error('Error en actualizarDisponibilidadVehiculo:', error);
    }
};


/**
 * Verificar si hay conflicto de horario para una ruta
 * Compara días de la semana y rangos horarios
 * @param {number} rutaId - ID de la ruta
 * @param {number[]} diasSemana - Array de días (0-6)
 * @param {string} horaInicio - Hora inicio (HH:MM)
 * @param {string} horaFin - Hora fin (HH:MM)
 * @param {string|null} asignacionIdExcluir - ID de asignación a excluir (para edición)
 * @returns {Object} { hayConflicto: boolean, mensaje: string, asignacionConflicto: Object|null }
 */
const verificarConflictoHorarioRuta = async (rutaId, diasSemana, horaInicio, horaFin, asignacionIdExcluir = null) => {
    try {
        // Buscar asignaciones activas en la misma ruta
        let query = supabase
            .from('asignaciones')
            .select(`
                id,
                dias_semana,
                hora_inicio,
                hora_fin,
                chofer:Chofer(nombre, apellido)
            `)
            .eq('ruta_id', rutaId)
            .eq('estado', 'activa')
            .not('dias_semana', 'is', null);
        
        // Excluir la asignación actual si estamos editando
        if (asignacionIdExcluir) {
            query = query.neq('id', asignacionIdExcluir);
        }
        
        const { data: asignacionesExistentes, error } = await query;
        
        if (error) {
            console.error('Error al verificar conflictos:', error);
            return { hayConflicto: false, mensaje: '', asignacionConflicto: null };
        }
        
        if (!asignacionesExistentes || asignacionesExistentes.length === 0) {
            return { hayConflicto: false, mensaje: '', asignacionConflicto: null };
        }
        
        // Convertir horas a minutos para comparación fácil
        const horaAMinutos = (hora) => {
            if (!hora) return 0;
            const [h, m] = hora.split(':').map(Number);
            return h * 60 + m;
        };
        
        const nuevaInicio = horaAMinutos(horaInicio);
        const nuevaFin = horaAMinutos(horaFin);
        
        // Verificar cada asignación existente
        for (const asignacion of asignacionesExistentes) {
            // Verificar si hay días en común
            const diasExistentes = asignacion.dias_semana || [];
            const diasEnComun = diasSemana.filter(d => diasExistentes.includes(d));
            
            if (diasEnComun.length === 0) {
                continue; // No hay días en común, no hay conflicto con esta asignación
            }
            
            // Verificar solapamiento de horas
            const existenteInicio = horaAMinutos(asignacion.hora_inicio);
            const existenteFin = horaAMinutos(asignacion.hora_fin);
            
            // Solapamiento: (inicio1 < fin2) AND (fin1 > inicio2)
            const haySolapamientoHoras = (nuevaInicio < existenteFin) && (nuevaFin > existenteInicio);
            
            if (haySolapamientoHoras) {
                const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const diasConflicto = diasEnComun.map(d => nombresDias[d]).join(', ');
                const choferNombre = asignacion.chofer 
                    ? `${asignacion.chofer.nombre} ${asignacion.chofer.apellido}`
                    : 'Otro chofer';
                
                return {
                    hayConflicto: true,
                    mensaje: `Conflicto de horario: "${choferNombre}" ya tiene asignada esta ruta los días ${diasConflicto} de ${asignacion.hora_inicio} a ${asignacion.hora_fin}.`,
                    asignacionConflicto: asignacion
                };
            }
        }
        
        return { hayConflicto: false, mensaje: '', asignacionConflicto: null };
        
    } catch (error) {
        console.error('Error en verificarConflictoHorarioRuta:', error);
        return { hayConflicto: false, mensaje: '', asignacionConflicto: null };
    }
};

// Exportar para uso en componentes
export { verificarConflictoHorarioRuta };


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


export const getAsignaciones = async () => {
    try {
        console.log('Obteniendo asignaciones...');
        
        // Evitar patrón N+1: cargar asignaciones y relaciones en una sola consulta
        const { data, error } = await supabase
            .from('asignaciones')
            .select(`
                *,
                chofer:Chofer(id, nombre, apellido, email, user_id),
                vehiculo:vehiculos(id, placa, marca, modelo, vehiculo_id_api, activo, disponible),
                ruta:Rutas(id, nombre_ruta, id_ruta),
                admin:administrador(id, nombre, apellido)
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error(' Error al obtener asignaciones:', error);
            throw error;
        }
        
        console.log(' Asignaciones obtenidas:', data?.length || 0);

        const asignacionesTransformadas = data?.map((asignacion) => ({
            asignacion_id: asignacion.id,
            fecha_inicio: asignacion.fecha_inicio,
            fecha_fin: asignacion.fecha_fin,
            estado: asignacion.estado,
            observaciones: asignacion.observaciones,
            fecha_asignacion: asignacion.created_at,
            updated_at: asignacion.updated_at,
            // Nuevos campos de horario
            dias_semana: asignacion.dias_semana,
            hora_inicio: asignacion.hora_inicio,
            hora_fin: asignacion.hora_fin,
            // Chofer
            chofer_id: asignacion.chofer_id,
            chofer_nombre: asignacion.chofer?.nombre,
            chofer_apellido: asignacion.chofer?.apellido,
            chofer_completo: asignacion.chofer
                ? `${asignacion.chofer.nombre} ${asignacion.chofer.apellido}`
                : 'N/A',
            chofer_email: asignacion.chofer?.email,
            chofer_user_id: asignacion.chofer?.user_id,
            // Vehículo
            vehiculo_id: asignacion.vehiculo_id,
            placa: asignacion.vehiculo?.placa,
            marca: asignacion.vehiculo?.marca,
            modelo: asignacion.vehiculo?.modelo,
            vehiculo_id_api: asignacion.vehiculo?.vehiculo_id_api,
            vehiculo_completo: asignacion.vehiculo
                ? `${asignacion.vehiculo.marca} ${asignacion.vehiculo.modelo} - ${asignacion.vehiculo.placa}`
                : 'N/A',
            vehiculo_activo: asignacion.vehiculo?.activo,
            vehiculo_disponible: asignacion.vehiculo?.disponible,
            // Ruta
            ruta_id: asignacion.ruta_id,
            nombre_ruta: asignacion.ruta?.nombre_ruta,
            ruta_uuid: asignacion.ruta?.id_ruta,
            // Admin
            asignado_por: asignacion.asignado_por,
            admin_nombre: asignacion.admin?.nombre,
            admin_apellido: asignacion.admin?.apellido,
            admin_completo: asignacion.admin
                ? `${asignacion.admin.nombre} ${asignacion.admin.apellido}`
                : null
        })) || [];

        return asignacionesTransformadas;
        
    } catch (error) {
        console.error(" Error en getAsignaciones:", error);
        throw error;
    }
};

/**
 * Obtener solo asignaciones activas
 */
export const getAsignacionesActivas = async () => {
    try {
        console.log(' Obteniendo asignaciones activas...');
        
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
            console.error(' Error al obtener asignaciones activas:', error);
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
            // Nuevos campos de horario
            dias_semana: a.dias_semana,
            hora_inicio: a.hora_inicio,
            hora_fin: a.hora_fin,
            // Chofer
            chofer_id: a.chofer_id,
            chofer_nombre: a.chofer?.nombre,
            chofer_apellido: a.chofer?.apellido,
            chofer_completo: `${a.chofer?.nombre} ${a.chofer?.apellido}`,
            chofer_email: a.chofer?.email,
            chofer_user_id: a.chofer?.user_id,
            // Vehículo
            vehiculo_id: a.vehiculo_id,
            placa: a.vehiculo?.placa,
            marca: a.vehiculo?.marca,
            modelo: a.vehiculo?.modelo,
            vehiculo_id_api: a.vehiculo?.vehiculo_id_api,
            vehiculo_completo: `${a.vehiculo?.marca} ${a.vehiculo?.modelo} - ${a.vehiculo?.placa}`,
            vehiculo_activo: a.vehiculo?.activo,
            vehiculo_disponible: a.vehiculo?.disponible,
            // Ruta
            ruta_id: a.ruta_id,
            nombre_ruta: a.ruta?.nombre_ruta,
            ruta_uuid: a.ruta?.id_ruta,
            // Admin
            asignado_por: a.asignado_por,
            admin_nombre: a.admin?.nombre,
            admin_apellido: a.admin?.apellido,
            admin_completo: a.admin ? `${a.admin.nombre} ${a.admin.apellido}` : null
        })) || [];
        
        console.log(' Asignaciones activas obtenidas:', asignacionesTransformadas.length);
        return asignacionesTransformadas;
        
    } catch (error) {
        console.error(" Error en getAsignacionesActivas:", error);
        throw error;
    }
};

/**
 * Crear una nueva asignación
 * Solo administradores pueden crear asignaciones
 */
export const createAsignacion = async (asignacionData) => {
    try {
        console.log('Iniciando creación de asignación...');
        console.log(' Datos recibidos:', asignacionData);
        
        // Verificar que el usuario es admin
        const { isAdmin, adminId } = await isUserAdmin();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden crear asignaciones');
        }
        
        // Validar conflicto de horario en la ruta (frontend)
        if (asignacionData.dias_semana && asignacionData.dias_semana.length > 0) {
            const conflicto = await verificarConflictoHorarioRuta(
                asignacionData.ruta_id,
                asignacionData.dias_semana,
                asignacionData.hora_inicio,
                asignacionData.hora_fin,
                null // No hay ID existente porque es nueva
            );
            
            if (conflicto.hayConflicto) {
                throw new Error(conflicto.mensaje);
            }
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
            asignado_por: adminId,
            // Nuevos campos de horario
            dias_semana: asignacionData.dias_semana || null,
            hora_inicio: asignacionData.hora_inicio || null,
            hora_fin: asignacionData.hora_fin || null
        };
        
        console.log(' Insertando asignación:', dataParaInsertar);
        
        const { data: asignacion, error } = await supabase
            .from('asignaciones')
            .insert([dataParaInsertar])
            .select()
            .single();
        
        if (error) {
            console.error(' Error al crear asignación:', error);
            // Manejar error de conflicto desde el trigger de BD
            if (error.message && error.message.includes('CONFLICTO_HORARIO')) {
                throw new Error('Ya existe una asignación activa para esta ruta con horarios que se solapan. Por favor, elige otros días u horarios.');
            }
            throw error;
        }
        
        console.log(' Asignación creada:', asignacion);
        
        // Marcar vehículo como no disponible si la asignación está activa
        if (dataParaInsertar.estado === 'activa') {
            await supabase
                .from('vehiculos')
                .update({ 
                    disponible: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', asignacionData.vehiculo_id);
            console.log(' Vehículo marcado como no disponible');
        }
        
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
        console.error(" Error al crear asignación:", error);
        throw error;
    }
};

/**
 * Actualizar una asignación existente
 * Solo administradores pueden actualizar
 */
export const updateAsignacion = async (asignacionId, asignacionData) => {
    try {
        console.log(' Actualizando asignación:', asignacionId);
        
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
            console.error(' Error al actualizar asignación:', error);
            throw error;
        }
        
        console.log(' Asignación actualizada:', asignacion);
        return asignacion;
        
    } catch (error) {
        console.error(" Error al actualizar asignación:", error);
        throw error;
    }
};

/**
 * Cambiar el estado de una asignación
 * (activa → completada/cancelada)
 */
export const cambiarEstadoAsignacion = async (asignacionId, nuevoEstado) => {
    try {
        console.log(' Cambiando estado de asignación:', asignacionId, 'a', nuevoEstado);
        
        // Verificar que el usuario es admin
        const { isAdmin } = await isUserAdmin();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden cambiar el estado de asignaciones');
        }
        
        // Obtener la asignación actual para saber el vehículo
        const { data: asignacionActual, error: errorGet } = await supabase
            .from('asignaciones')
            .select('vehiculo_id, estado')
            .eq('id', asignacionId)
            .single();
        
        if (errorGet) {
            console.error(' Error al obtener asignación:', errorGet);
            throw errorGet;
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
            console.error(' Error al cambiar estado:', error);
            throw error;
        }
        
        // Si la asignación deja de estar activa, actualizar disponibilidad del vehículo
        if (asignacionActual.estado === 'activa' && nuevoEstado !== 'activa') {
            await actualizarDisponibilidadVehiculo(asignacionActual.vehiculo_id);
        }
        
        console.log(' Estado cambiado:', asignacion);
        return asignacion;
        
    } catch (error) {
        console.error(" Error al cambiar estado:", error);
        throw error;
    }
};

/**
 * Eliminar una asignación
 * Solo administradores pueden eliminar
 */
export const deleteAsignacion = async (asignacionId) => {
    try {
        console.log(' Eliminando asignación:', asignacionId);
        
        // Verificar que el usuario es admin
        const { isAdmin } = await isUserAdmin();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden eliminar asignaciones');
        }
        
        // Obtener la asignación antes de eliminar para conocer el vehículo
        const { data: asignacionActual, error: errorGet } = await supabase
            .from('asignaciones')
            .select('vehiculo_id, estado')
            .eq('id', asignacionId)
            .single();
        
        if (errorGet) {
            console.error(' Error al obtener asignación:', errorGet);
            throw errorGet;
        }
        
        const { error } = await supabase
            .from('asignaciones')
            .delete()
            .eq('id', asignacionId);
        
        if (error) {
            console.error(' Error al eliminar asignación:', error);
            throw error;
        }
        
        // Si la asignación estaba activa, actualizar disponibilidad del vehículo
        if (asignacionActual.estado === 'activa') {
            await actualizarDisponibilidadVehiculo(asignacionActual.vehiculo_id);
        }
        
        console.log('Asignación eliminada');
        return { success: true, message: 'Asignación eliminada correctamente' };
        
    } catch (error) {
        console.error(" Error al eliminar asignación:", error);
        throw error;
    }
};

 // Obtener choferes activos disponibles
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
        console.error(" Error al obtener choferes disponibles:", error);
        throw error;
    }
};


  // Obtener vehículos disponibles (sin asignación activa)
 
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
        console.error(" Error al obtener vehículos disponibles:", error);
        throw error;
    }
};


 // Obtener rutas activas
 
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
        console.error(" Error al obtener rutas activas:", error);
        throw error;
    }
};
