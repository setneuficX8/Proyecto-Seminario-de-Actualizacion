import { supabase } from '../Supabase/Conection';

const API_BASE = "https://apirecoleccion.gonzaloandreslucio.com/api";
const PERFIL_ID = "50dad3d9-66ea-42a1-a06f-c502606d638f";


// Obtener el usuario autenticado actual
const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
    }
    
    return user;
};


// Verificar el rol del usuario autenticado (admin o chofer)
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
 * Obtener todas las rutas
 * - Admin: ve TODAS las rutas
 * - Chofer: ve SOLO rutas con asignación activa a su nombre
 */
export const getRutas = async () => {
    try {
        console.log('Obteniendo rutas...');
        
        const { data, error } = await supabase
            .from('Rutas')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error al obtener rutas:', error);
            throw error;
        }
        
        if (!data || data.length === 0) {
            console.log('No hay rutas registradas');
            return [];
        }
        
        // Para cada ruta, cargar información de asignaciones activas
        const rutasConInfo = await Promise.all(
            data.map(async (ruta) => {
                // Buscar asignaciones activas
                const { data: asignacionesActivas } = await supabase
                    .from('asignaciones')
                    .select(`
                        id,
                        fecha_inicio,
                        fecha_fin,
                        estado,
                        chofer_id,
                        vehiculo_id
                    `)
                    .eq('ruta_id', ruta.id)
                    .eq('estado', 'activa');
                
                const cantidadAsignaciones = asignacionesActivas?.length || 0;
                
                return {
                    ...ruta,
                    tiene_asignaciones_activas: cantidadAsignaciones > 0,
                    cantidad_asignaciones_activas: cantidadAsignaciones,
                    asignaciones_activas: asignacionesActivas || []
                };
            })
        );
        
        console.log('Rutas obtenidas:', rutasConInfo.length);
        
        return rutasConInfo;
        
    } catch (error) {
        console.error("Error en getRutas:", error);
        throw error;
    }
};


/**
 * Obtener rutas activas (para asignaciones)
 */
export const getRutasActivas = async () => {
    try {
        console.log('Obteniendo rutas activas...');
        
        const { data, error } = await supabase
            .from('Rutas')
            .select('*')
            .eq('activo', true)
            .order('nombre_ruta', { ascending: true });
        
        if (error) {
            console.error('Error al obtener rutas activas:', error);
            throw error;
        }
        
        console.log('Rutas activas obtenidas:', data?.length || 0);
        return data || [];
        
    } catch (error) {
        console.error("Error en getRutasActivas:", error);
        throw error;
    }
};


/**
 * Obtener una ruta específica por su ID
 */
export const getRutaById = async (rutaId) => {
    try {
        console.log('Obteniendo ruta por ID:', rutaId);
        
        const { data, error } = await supabase
            .from('Rutas')
            .select('*')
            .eq('id', rutaId)
            .single();
        
        if (error) {
            console.error('Error al obtener ruta:', error);
            throw error;
        }
        
        // Cargar asignaciones activas
        const { data: asignacionesActivas } = await supabase
            .from('asignaciones')
            .select(`
                id,
                fecha_inicio,
                fecha_fin,
                estado,
                chofer:Chofer(id, nombre, apellido),
                vehiculo:vehiculos(id, placa, marca, modelo)
            `)
            .eq('ruta_id', rutaId)
            .eq('estado', 'activa');
        
        return {
            ...data,
            tiene_asignaciones_activas: asignacionesActivas && asignacionesActivas.length > 0,
            cantidad_asignaciones_activas: asignacionesActivas?.length || 0,
            asignaciones_activas: asignacionesActivas || []
        };
        
    } catch (error) {
        console.error("Error en getRutaById:", error);
        throw error;
    }
};


/**
 * Crear una nueva ruta (SOLO ADMINS)
 * Integración con API externa
 */
export const createRuta = async (rutaData) => {
    try {
        console.log('Iniciando creación de ruta...');
        console.log('Datos recibidos:', rutaData);
        
        // 1. Verificar que el usuario es ADMIN
        const { isAdmin, adminData } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden crear rutas');
        }
        
        console.log('Admin autorizado:', adminData);
        
        // 2. Crear ruta en la API externa
        console.log('Creando en API externa...');
        
        const apiPayload = {
            perfil_id: PERFIL_ID,
            nombre_ruta: rutaData.nombre_ruta,
            shape: {
                type: "LineString",
                coordinates: rutaData.coordinates || rutaData.shape?.coordinates
            }
        };
        
        const apiResponse = await fetch(`${API_BASE}/rutas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPayload)
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Error en API externa:', errorText);
            throw new Error('Error al crear ruta en API externa: ' + errorText);
        }

        const rutaApi = await apiResponse.json();
        console.log('Ruta creada en API:', rutaApi);
        
        // 3. Guardar en Supabase con el ID de la API y creado_por
        console.log('Guardando en Supabase con ruta_id_api:', rutaApi.id);
        
        const { data: rutaLocal, error: errorSupabase } = await supabase
            .from('Rutas')
            .insert([
                {
                    ruta_id_api: rutaApi.id ? String(rutaApi.id) : null,
                    nombre_ruta: rutaData.nombre_ruta,
                    shape: apiPayload.shape,
                    activo: rutaData.activo !== undefined ? rutaData.activo : true,
                    creado_por: adminData.id
                }
            ])
            .select()
            .single();
        
        if (errorSupabase) {
            console.error('Error al guardar en Supabase:', errorSupabase);
            throw new Error('No se pudo crear la ruta en Supabase: ' + errorSupabase.message);
        }
        
        console.log('Ruta creada completamente:', rutaLocal);
        
        return {
            ...rutaLocal,
            tiene_asignaciones_activas: false,
            cantidad_asignaciones_activas: 0,
            asignaciones_activas: []
        };
        
    } catch (error) {
        console.error("Error al crear ruta:", error);
        throw error;
    }
};


/**
 * Actualizar una ruta existente (SOLO ADMINS)
 * NOTA: Solo actualiza en Supabase. La API externa no soporta edición.
 */
export const updateRuta = async (rutaId, rutaData) => {
    try {
        console.log('Actualizando ruta:', rutaId);
        
        // 1. Verificar que el usuario es ADMIN
        const { isAdmin } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden editar rutas');
        }
        
        // 2. Actualizar SOLO en Supabase (la API externa no soporta PUT)
        const updateData = {
            nombre_ruta: rutaData.nombre_ruta,
            activo: rutaData.activo !== undefined ? rutaData.activo : true,
            updated_at: new Date().toISOString()
        };
        
        if (rutaData.shape) {
            updateData.shape = rutaData.shape;
        }
        
        const { data: rutaActualizada, error: errorUpdate } = await supabase
            .from('Rutas')
            .update(updateData)
            .eq('id', rutaId)
            .select()
            .single();
        
        if (errorUpdate) {
            throw new Error('Error al actualizar en Supabase: ' + errorUpdate.message);
        }
        
        console.log('Ruta actualizada correctamente en Supabase');
        return rutaActualizada;
        
    } catch (error) {
        console.error("Error al actualizar ruta:", error);
        throw error;
    }
};


/**
 * Eliminar una ruta (SOLO ADMINS)
 * NOTA: Solo elimina de Supabase. La API externa no soporta eliminación.
 */
export const deleteRuta = async (rutaId) => {
    try {
        console.log('Eliminando ruta:', rutaId);
        
        // 1. Verificar que el usuario es ADMIN
        const { isAdmin } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden eliminar rutas');
        }
        
        // 2. Verificar que NO tenga asignaciones activas
        const { data: asignaciones } = await supabase
            .from('asignaciones')
            .select('id, estado')
            .eq('ruta_id', rutaId)
            .eq('estado', 'activa');
        
        if (asignaciones && asignaciones.length > 0) {
            throw new Error('No se puede eliminar una ruta con asignaciones activas');
        }
        
        // 3. Eliminar SOLO de Supabase (la API externa no soporta DELETE)
        const { error: errorDelete } = await supabase
            .from('Rutas')
            .delete()
            .eq('id', rutaId);
        
        if (errorDelete) {
            throw new Error('Error al eliminar de Supabase: ' + errorDelete.message);
        }
        
        console.log('Ruta eliminada correctamente de Supabase');
        return { success: true, message: 'Ruta eliminada correctamente' };
        
    } catch (error) {
        console.error("Error al eliminar ruta:", error);
        throw error;
    }
};


/**
 * Desactivar una ruta (sin eliminarla)
 * Útil cuando hay asignaciones históricas
 */
export const desactivarRuta = async (rutaId) => {
    try {
        console.log('Desactivando ruta:', rutaId);
        
        const { isAdmin } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden desactivar rutas');
        }
        
        // Verificar que NO tenga asignaciones activas
        const { data: asignaciones } = await supabase
            .from('asignaciones')
            .select('id, estado')
            .eq('ruta_id', rutaId)
            .eq('estado', 'activa');
        
        if (asignaciones && asignaciones.length > 0) {
            throw new Error('No se puede desactivar una ruta con asignaciones activas');
        }
        
        const { data, error } = await supabase
            .from('Rutas')
            .update({ 
                activo: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', rutaId)
            .select()
            .single();
        
        if (error) {
            throw new Error('Error al desactivar ruta: ' + error.message);
        }
        
        console.log('Ruta desactivada correctamente');
        return data;
        
    } catch (error) {
        console.error("Error al desactivar ruta:", error);
        throw error;
    }
};


/**
 * Reactivar una ruta previamente desactivada
 */
export const reactivarRuta = async (rutaId) => {
    try {
        console.log('Reactivando ruta:', rutaId);
        
        const { isAdmin } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden reactivar rutas');
        }
        
        const { data, error } = await supabase
            .from('Rutas')
            .update({ 
                activo: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', rutaId)
            .select()
            .single();
        
        if (error) {
            throw new Error('Error al reactivar ruta: ' + error.message);
        }
        
        console.log('Ruta reactivada correctamente');
        return data;
        
    } catch (error) {
        console.error("Error al reactivar ruta:", error);
        throw error;
    }
};


/**
 * Sincronizar rutas desde la API externa
 * Importa todas las rutas del perfil que no estén en Supabase
 */
export const sincronizarRutasDesdeAPI = async () => {
    try {
        console.log('Sincronizando rutas desde API externa...');
        
        // 1. Verificar que el usuario es ADMIN
        const { isAdmin, adminData } = await verificarRolUsuario();
        
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden sincronizar rutas');
        }
        
        // 2. Obtener rutas desde la API externa
        console.log('Obteniendo rutas de la API...');
        const apiResponse = await fetch(`${API_BASE}/rutas?perfil_id=${PERFIL_ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error('Error al obtener rutas de API: ' + errorText);
        }
        
        const rutasApi = await apiResponse.json();
        console.log('Rutas obtenidas de API:', rutasApi.length);
        
        if (!rutasApi || rutasApi.length === 0) {
            return { sincronizadas: 0, mensaje: 'No hay rutas nuevas para sincronizar' };
        }
        
        // 3. Obtener rutas existentes en Supabase
        const { data: rutasLocales } = await supabase
            .from('Rutas')
            .select('ruta_id_api');
        
        const idsExistentes = new Set(
            rutasLocales?.map(r => String(r.ruta_id_api)).filter(Boolean) || []
        );
        
        // 4. Filtrar rutas que NO estén en Supabase
        const rutasNuevas = rutasApi.filter(rutaApi => 
            !idsExistentes.has(String(rutaApi.id))
        );
        
        console.log('Rutas nuevas para importar:', rutasNuevas.length);
        
        if (rutasNuevas.length === 0) {
            return { sincronizadas: 0, mensaje: 'Todas las rutas ya están sincronizadas' };
        }
        
        // 5. Insertar rutas nuevas en Supabase
        const rutasParaInsertar = rutasNuevas.map(rutaApi => ({
            ruta_id_api: String(rutaApi.id),
            nombre_ruta: rutaApi.nombre_ruta,
            shape: rutaApi.shape,
            activo: true,
            creado_por: adminData.id
        }));
        
        const { data: rutasInsertadas, error: errorInsert } = await supabase
            .from('Rutas')
            .insert(rutasParaInsertar)
            .select();
        
        if (errorInsert) {
            console.error('Error al insertar rutas:', errorInsert);
            throw new Error('Error al sincronizar rutas: ' + errorInsert.message);
        }
        
        console.log('Rutas sincronizadas exitosamente:', rutasInsertadas?.length || 0);
        
        return {
            sincronizadas: rutasInsertadas?.length || 0,
            mensaje: `${rutasInsertadas?.length || 0} rutas sincronizadas correctamente`,
            rutas: rutasInsertadas
        };
        
    } catch (error) {
        console.error("Error al sincronizar rutas:", error);
        throw error;
    }
};
