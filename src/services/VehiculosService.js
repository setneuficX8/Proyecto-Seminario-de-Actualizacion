import { supabase } from '../Supabase/Conection';

const API_BASE = "http://apirecoleccion.gonzaloandreslucio.com/api";
const PERFIL_ID = "50dad3d9-66ea-42a1-a06f-c502606d638f";



// Obtener el usuario autenticado actual
const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
    }
    
    return user;
};


  //Verificar el rol del usuario autenticado (admin o chofer)
const verificarRolUsuario = async () => {
    const user = await getCurrentUser();
    
    // Verificar si es administrador
    const { data: admin, error: errorAdmin } = await supabase
        .from('administrador')
        .select('id, nombre, apellido, email')
        .eq('user_id', user.id)
        .maybeSingle();
    
    // Verificar si es chofer
    const { data: chofer, error: errorChofer } = await supabase
        .from('Chofer')
        .select('id, nombre, apellido, email')
        .eq('user_id', user.id)
        .maybeSingle();
    
    if (errorAdmin || errorChofer) {
        console.error('Error al verificar rol:', errorAdmin || errorChofer);
    }
    
    return {
        isAdmin: !!admin,
        isChofer: !!chofer,
        adminData: admin,
        choferData: chofer,
        user
    };
};

/**
 * Obtener el chofer asociado al usuario autenticado (LEGACY - mantener para compatibilidad)
 */
const getChoferDelUsuario = async () => {
    const { isChofer, choferData } = await verificarRolUsuario();
    
    if (!isChofer || !choferData) {
        throw new Error('No se encontró un chofer asociado a tu usuario. Por favor, contacta al administrador.');
    }
    
    console.log('Chofer encontrado (id INTEGER):', choferData.id);
    return choferData;
};



/**
 * Obtener todos los vehículos
 * - Admin: ve TODOS los vehículos
 * - Chofer: ve SOLO vehículos con asignación activa a su nombre
 */
export const getVehiculos = async () => {
    try {
        console.log('📖 Obteniendo vehículos...');
        
        // Consulta básica
        const { data, error } = await supabase
            .from('vehiculos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error al obtener vehículos:', error);
            throw error;
        }
        
        if (!data || data.length === 0) {
            console.log('✅ No hay vehículos registrados');
            return [];
        }
        
        // Para cada vehículo, cargar información de asignación activa
        const vehiculosConInfo = await Promise.all(
            data.map(async (vehiculo) => {
                // Buscar asignación activa
                const { data: asignacionActiva } = await supabase
                    .from('asignaciones')
                    .select(`
                        id,
                        fecha_inicio,
                        fecha_fin,
                        estado,
                        chofer_id,
                        ruta_id
                    `)
                    .eq('vehiculo_id', vehiculo.id)
                    .eq('estado', 'activa')
                    .maybeSingle();
                
                // Si hay asignación activa, cargar chofer y ruta
                let choferNombre = 'Sin asignar';
                let nombreRuta = null;
                
                if (asignacionActiva) {
                    // Cargar chofer
                    const { data: choferData } = await supabase
                        .from('Chofer')
                        .select('nombre, apellido')
                        .eq('id', asignacionActiva.chofer_id)
                        .maybeSingle();
                    
                    if (choferData) {
                        choferNombre = `${choferData.nombre} ${choferData.apellido}`;
                    }
                    
                    // Cargar ruta
                    const { data: rutaData } = await supabase
                        .from('Rutas')
                        .select('nombre_ruta')
                        .eq('id', asignacionActiva.ruta_id)
                        .maybeSingle();
                    
                    nombreRuta = rutaData?.nombre_ruta;
                }
                
                return {
                    ...vehiculo,
                    chofer_nombre_completo: choferNombre,
                    tiene_asignacion_activa: !!asignacionActiva,
                    nombre_ruta_activa: nombreRuta,
                    asignacion_activa: asignacionActiva
                };
            })
        );
        
        console.log('✅ Vehículos obtenidos:', vehiculosConInfo.length);
        
        return vehiculosConInfo;
        
    } catch (error) {
        console.error("❌ Error en getVehiculos:", error);
        throw error;
    }
};

/**
 * Crear un nuevo vehículo (SOLO ADMINS)
 * RESTAURADA: Integración con API externa
 */
export const createVehiculo = async (vehiculoData) => {
    try {
        console.log('🚀 Iniciando creación de vehículo...');
        console.log('📦 Datos recibidos:', vehiculoData);
        
        // 1. Verificar que el usuario es ADMIN
        const { isAdmin, adminData } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden crear vehículos');
        }
        
        console.log('👤 Admin autorizado:', adminData);
        
        // 2. Crear vehículo en la API externa CON perfil_id
        console.log('🌐 Creando en API externa...');
        const apiResponse = await fetch(`${API_BASE}/vehiculos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                perfil_id: PERFIL_ID,
                placa: vehiculoData.placa,
                marca: vehiculoData.marca || null,
                modelo: vehiculoData.modelo || null,
            })
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('⚠️ Error en API externa:', errorText);
            throw new Error('Error al crear vehículo en API externa: ' + errorText);
        }

        const vehiculoApi = await apiResponse.json();
        console.log('✅ Vehículo creado en API:', vehiculoApi);
        
        // 3. Guardar en Supabase con el ID de la API y creado_por
        console.log('💾 Guardando en Supabase con vehiculo_id_api:', vehiculoApi.id);
        
        const { data: vehiculoLocal, error: errorSupabase } = await supabase
            .from('vehiculos')
            .insert([
                {
                    vehiculo_id_api: vehiculoApi.id,
                    placa: vehiculoData.placa,
                    marca: vehiculoData.marca || null,
                    modelo: vehiculoData.modelo || null,
                    activo: vehiculoData.activo !== undefined ? vehiculoData.activo : true,
                    disponible: true,
                    creado_por: adminData.id
                }
            ])
            .select()
            .single();
        
        if (errorSupabase) {
            console.error('⚠️ Error al guardar en Supabase:', errorSupabase);
            throw new Error('No se pudo crear el vehículo en Supabase: ' + errorSupabase.message);
        }
        
        console.log('✅ Vehículo creado completamente:', vehiculoLocal);
        
        return {
            ...vehiculoLocal,
            chofer_nombre_completo: 'Sin asignar',
            tiene_asignacion_activa: false,
            nombre_ruta_activa: null
        };
        
    } catch (error) {
        console.error("❌ Error al crear vehículo:", error);
        throw error;
    }
};

/**
 * Actualizar un vehículo existente (SOLO ADMINS)
 * Sincroniza cambios con API externa
 */
export const updateVehiculo = async (vehiculoId, vehiculoData) => {
    try {
        console.log('🔄 Actualizando vehículo:', vehiculoId);
        
        // 1. Verificar que el usuario es ADMIN
        const { isAdmin } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden editar vehículos');
        }
        
        // 2. Obtener vehiculo_id_api para actualizar en API externa
        const { data: vehiculoActual, error: errorGet } = await supabase
            .from('vehiculos')
            .select('vehiculo_id_api')
            .eq('id', vehiculoId)
            .single();
        
        if (errorGet) {
            throw new Error('No se encontró el vehículo: ' + errorGet.message);
        }
        
        // 3. Actualizar en API externa CON perfil_id
        console.log('🌐 Actualizando en API externa...');
        const apiResponse = await fetch(`${API_BASE}/vehiculos/${vehiculoActual.vehiculo_id_api}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                perfil_id: PERFIL_ID,
                placa: vehiculoData.placa,
                marca: vehiculoData.marca || null,
                modelo: vehiculoData.modelo || null,
            })
        });
        
        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('⚠️ Error en API externa:', errorText);
            throw new Error('Error al actualizar en API externa: ' + errorText);
        }
        
        console.log('✅ Vehículo actualizado en API externa');
        
        // 4. Actualizar en Supabase
        const updateData = {
            placa: vehiculoData.placa,
            marca: vehiculoData.marca,
            modelo: vehiculoData.modelo,
            activo: vehiculoData.activo !== undefined ? vehiculoData.activo : true,
            updated_at: new Date().toISOString()
        };
        
        const { data: vehiculoActualizado, error: errorUpdate } = await supabase
            .from('vehiculos')
            .update(updateData)
            .eq('id', vehiculoId)
            .select()
            .single();
        
        if (errorUpdate) {
            throw new Error('Error al actualizar en Supabase: ' + errorUpdate.message);
        }
        
        console.log('✅ Vehículo actualizado correctamente');
        return vehiculoActualizado;
        
    } catch (error) {
        console.error("❌ Error al actualizar vehículo:", error);
        throw error;
    }
};

/**
 * Eliminar un vehículo (SOLO ADMINS)
 * Sincroniza eliminación con API externa
 */
export const deleteVehiculo = async (vehiculoId) => {
    try {
        console.log('🗑️ Eliminando vehículo:', vehiculoId);
        
        // 1. Verificar que el usuario es ADMIN
        const { isAdmin } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden eliminar vehículos');
        }
        
        // 2. Verificar que NO tenga asignaciones activas
        const { data: asignaciones } = await supabase
            .from('asignaciones')
            .select('id, estado')
            .eq('vehiculo_id', vehiculoId)
            .eq('estado', 'activa');
        
        if (asignaciones && asignaciones.length > 0) {
            throw new Error('No se puede eliminar un vehículo con asignaciones activas');
        }
        
        // 3. Obtener vehiculo_id_api antes de eliminar
        const { data: vehiculo, error: errorGet } = await supabase
            .from('vehiculos')
            .select('vehiculo_id_api')
            .eq('id', vehiculoId)
            .single();
        
        if (errorGet) {
            throw new Error('No se encontró el vehículo: ' + errorGet.message);
        }
        
        // 4. Eliminar de Supabase primero
        const { error: errorDelete } = await supabase
            .from('vehiculos')
            .delete()
            .eq('id', vehiculoId);
        
        if (errorDelete) {
            throw new Error('Error al eliminar de Supabase: ' + errorDelete.message);
        }
        
        // 5. Eliminar de API externa CON perfil_id
        console.log('🌐 Eliminando de API externa...');
        const apiResponse = await fetch(`${API_BASE}/vehiculos/${vehiculo.vehiculo_id_api}?perfil_id=${PERFIL_ID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!apiResponse.ok) {
            console.warn('⚠️ El vehículo fue eliminado de Supabase pero hubo un error en la API externa');
        } else {
            console.log('✅ Vehículo eliminado de API externa');
        }
        
        console.log('✅ Vehículo eliminado correctamente');
        return { success: true, message: 'Vehículo eliminado correctamente' };
        
    } catch (error) {
        console.error("❌ Error al eliminar vehículo:", error);
        throw error;
    }
};

/**
 * Obtener todos los choferes disponibles (para selector de admin)
 */

/**
 * Obtener todos los choferes disponibles (para selector de admin)
 */
export const getChoferesDisponibles = async () => {
    try {
        const { data, error } = await supabase
            .from('Chofer')
            .select('id, nombre, apellido, email, activo')
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        return data?.map(c => ({
            ...c,
            nombre_completo: `${c.nombre} ${c.apellido}`
        })) || [];
        
    } catch (error) {
        console.error("❌ Error al obtener choferes:", error);
        throw error;
    }
};

/**
 * Obtener un vehículo específico por su ID
 */
export const getVehiculoById = async (vehiculoId) => {
    try {
        const { data, error } = await supabase
            .from('vehiculos')
            .select(`
                *,
                chofer:Chofer(id, nombre, apellido, email)
            `)
            .eq('id', vehiculoId)
            .single();
        
        if (error) {
            throw error;
        }
        
        // Agregar información de asignación activa
        const { data: asignacionActiva } = await supabase
            .from('asignaciones')
            .select(`
                id,
                fecha_inicio,
                fecha_fin,
                estado,
                ruta:Rutas(id, nombre_ruta)
            `)
            .eq('vehiculo_id', vehiculoId)
            .eq('estado', 'activa')
            .maybeSingle();
        
        return {
            ...data,
            chofer_nombre_completo: data.chofer 
                ? `${data.chofer.nombre} ${data.chofer.apellido}`
                : 'Sin asignar',
            tiene_asignacion_activa: !!asignacionActiva,
            nombre_ruta_activa: asignacionActiva?.ruta?.nombre_ruta || null,
            asignacion_activa: asignacionActiva
        };
        
    } catch (error) {
        console.error("❌ Error al obtener vehículo:", error);
        throw error;
    }
};
