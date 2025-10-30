import { supabase } from '../Supabase/Conection';

const API_BASE = "http://apirecoleccion.gonzaloandreslucio.com/api";
const PERFIL_ID = "50dad3d9-66ea-42a1-a06f-c502606d638f";

/**
 * ============================================
 * SERVICIO DE VEHÍCULOS INTEGRADO
 * ============================================
 * Maneja la sincronización entre:
 * 1. API Externa (con PERFIL_ID compartido)
 * 2. Supabase (con filtrado por usuario)
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
 * Obtener el chofer asociado al usuario autenticado
 */
const getChoferDelUsuario = async () => {
    const user = await getCurrentUser();
    
    // Nota: La tabla Chofer tiene id como INTEGER, no UUID
    const { data: chofer, error } = await supabase
        .from('Chofer')
        .select('id, nombre, apellido, email')
        .eq('user_id', user.id)
        .maybeSingle(); // Usar maybeSingle() en lugar de single()
    
    if (error) {
        console.error('Error al buscar chofer:', error);
        throw new Error('Error al buscar tu perfil de chofer: ' + error.message);
    }
    
    if (!chofer) {
        throw new Error('No se encontró un chofer asociado a tu usuario. Por favor, contacta al administrador.');
    }
    
    console.log('✅ Chofer encontrado (id INTEGER):', chofer.id);
    return chofer;
};

// ============================================
// OPERACIONES CRUD
// ============================================

/**
 * Obtener todos los vehículos del usuario actual
 * Lee desde Supabase (ya filtrado por RLS automáticamente)
 */
export const getVehiculos = async () => {
    try {
        console.log('📖 Obteniendo vehículos del usuario...');
        
        // Leer de Supabase usando la vista que incluye datos del chofer
        const { data, error } = await supabase
            .from('vehiculos_con_chofer')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error al obtener vehículos:', error);
            throw error;
        }
        
        console.log('✅ Vehículos obtenidos:', data?.length || 0);
        return data || [];
        
    } catch (error) {
        console.error("❌ Error en getVehiculos:", error);
        throw error;
    }
};

/**
 * Crear un nuevo vehículo
 * 1. Crea en API externa (con PERFIL_ID compartido)
 * 2. Guarda el mapeo en Supabase (vinculado al chofer del usuario)
 */
export const createVehiculo = async (vehiculoData) => {
    try {
        console.log('🚀 Iniciando creación de vehículo...');
        console.log('📦 Datos recibidos:', vehiculoData);
        
        // 1. Obtener el chofer del usuario autenticado
        const chofer = await getChoferDelUsuario();
        console.log('👤 Chofer encontrado:', chofer);
        
        // 2. Crear en API Externa (con PERFIL_ID compartido)
        const dataParaAPI = {
            placa: vehiculoData.placa,
            marca: vehiculoData.marca || null,
            modelo: vehiculoData.modelo || null,
            activo: vehiculoData.activo !== undefined ? vehiculoData.activo : true,
            perfil_id: PERFIL_ID
        };
        
        console.log('🌐 Enviando a API externa:', dataParaAPI);
        
        const responseAPI = await fetch(`${API_BASE}/vehiculos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataParaAPI)
        });
        
        if (!responseAPI.ok) {
            const errorText = await responseAPI.text();
            throw new Error(`Error en API externa: ${responseAPI.status} - ${errorText}`);
        }
        
        const vehiculoAPI = await responseAPI.json();
        console.log('✅ Vehículo creado en API externa:', vehiculoAPI);
        
        // 3. Guardar mapeo en Supabase (vinculado al chofer)
        console.log('💾 Guardando en Supabase con chofer_id (INTEGER):', chofer.id);
        console.log('🆔 vehiculo_id_api de la API (puede ser UUID o número):', vehiculoAPI.id);
        
        const { data: vehiculoLocal, error: errorSupabase } = await supabase
            .from('vehiculos')
            .insert([
                {
                    chofer_id: parseInt(chofer.id), // Asegurar que sea número entero
                    vehiculo_id_api: String(vehiculoAPI.id), // Guardar como STRING (soporta UUID y números)
                    placa: vehiculoData.placa,
                    marca: vehiculoData.marca || null,
                    modelo: vehiculoData.modelo || null,
                    activo: vehiculoData.activo !== undefined ? vehiculoData.activo : true
                }
            ])
            .select()
            .single();
        
        if (errorSupabase) {
            console.error('⚠️ Error al guardar en Supabase:', errorSupabase);
            // El vehículo ya fue creado en la API externa
            // Intentar eliminarlo para mantener consistencia
            try {
                await fetch(`${API_BASE}/vehiculos/${vehiculoAPI.id}?perfil_id=${PERFIL_ID}`, {
                    method: "DELETE"
                });
            } catch (deleteError) {
                console.error('Error al hacer rollback en API externa:', deleteError);
            }
            throw new Error('No se pudo completar el registro: ' + errorSupabase.message);
        }
        
        console.log('✅ Vehículo mapeado en Supabase:', vehiculoLocal);
        
        // Retornar con información del chofer
        return {
            ...vehiculoLocal,
            chofer_nombre: chofer.nombre,
            chofer_apellido: chofer.apellido,
            chofer_nombre_completo: `${chofer.nombre} ${chofer.apellido}`
        };
        
    } catch (error) {
        console.error("❌ Error al crear vehículo:", error);
        throw error;
    }
};

/**
 * Actualizar un vehículo existente
 * 1. Actualiza en API externa
 * 2. Actualiza en Supabase
 */
export const updateVehiculo = async (vehiculoId, vehiculoData) => {
    try {
        console.log('🔄 Actualizando vehículo:', vehiculoId);
        
        // 1. Obtener el vehiculo_id_api desde Supabase
        const { data: vehiculoLocal, error: errorGet } = await supabase
            .from('vehiculos')
            .select('vehiculo_id_api, chofer_id')
            .eq('id', vehiculoId)
            .single();
        
        if (errorGet || !vehiculoLocal) {
            throw new Error('Vehículo no encontrado o no tienes permiso para editarlo');
        }
        
        // 2. Actualizar en API Externa
        const dataParaAPI = {
            placa: vehiculoData.placa,
            marca: vehiculoData.marca || null,
            modelo: vehiculoData.modelo || null,
            activo: vehiculoData.activo !== undefined ? vehiculoData.activo : true,
            perfil_id: PERFIL_ID
        };
        
        const responseAPI = await fetch(`${API_BASE}/vehiculos/${vehiculoLocal.vehiculo_id_api}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataParaAPI)
        });
        
        if (!responseAPI.ok) {
            const errorText = await responseAPI.text();
            throw new Error(`Error en API externa: ${responseAPI.status} - ${errorText}`);
        }
        
        console.log('✅ Vehículo actualizado en API externa');
        
        // 3. Actualizar en Supabase
        const { data: vehiculoActualizado, error: errorUpdate } = await supabase
            .from('vehiculos')
            .update({
                placa: vehiculoData.placa,
                marca: vehiculoData.marca,
                modelo: vehiculoData.modelo,
                activo: vehiculoData.activo
            })
            .eq('id', vehiculoId)
            .select()
            .single();
        
        if (errorUpdate) {
            throw new Error('Error al actualizar en Supabase: ' + errorUpdate.message);
        }
        
        console.log('✅ Vehículo actualizado en Supabase');
        return vehiculoActualizado;
        
    } catch (error) {
        console.error("❌ Error al actualizar vehículo:", error);
        throw error;
    }
};

/**
 * Eliminar un vehículo
 * 1. Elimina de API externa
 * 2. Elimina de Supabase (automático por CASCADE si eliminas el mapeo)
 */
export const deleteVehiculo = async (vehiculoId) => {
    try {
        console.log('🗑️ Eliminando vehículo:', vehiculoId);
        
        // 1. Obtener el vehiculo_id_api desde Supabase
        const { data: vehiculoLocal, error: errorGet } = await supabase
            .from('vehiculos')
            .select('vehiculo_id_api')
            .eq('id', vehiculoId)
            .single();
        
        if (errorGet || !vehiculoLocal) {
            throw new Error('Vehículo no encontrado o no tienes permiso para eliminarlo');
        }
        
        // 2. Eliminar de API Externa primero
        const url = `${API_BASE}/vehiculos/${vehiculoLocal.vehiculo_id_api}?perfil_id=${PERFIL_ID}`;
        const responseAPI = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        
        if (!responseAPI.ok) {
            const errorText = await responseAPI.text();
            throw new Error(`Error en API externa: ${responseAPI.status} - ${errorText}`);
        }
        
        console.log('✅ Vehículo eliminado de API externa');
        
        // 3. Eliminar de Supabase
        const { error: errorDelete } = await supabase
            .from('vehiculos')
            .delete()
            .eq('id', vehiculoId);
        
        if (errorDelete) {
            throw new Error('Error al eliminar de Supabase: ' + errorDelete.message);
        }
        
        console.log('✅ Vehículo eliminado de Supabase');
        return { success: true, message: 'Vehículo eliminado correctamente' };
        
    } catch (error) {
        console.error("❌ Error al eliminar vehículo:", error);
        throw error;
    }
};

/**
 * Obtener un vehículo específico por su ID
 */
export const getVehiculoById = async (vehiculoId) => {
    try {
        const { data, error } = await supabase
            .from('vehiculos_con_chofer')
            .select('*')
            .eq('id', vehiculoId)
            .single();
        
        if (error) {
            throw error;
        }
        
        return data;
        
    } catch (error) {
        console.error("❌ Error al obtener vehículo:", error);
        throw error;
    }
};
