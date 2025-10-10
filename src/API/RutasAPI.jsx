const API_BASE = "http://apirecoleccion.gonzaloandreslucio.com/api";
const PERFIL_ID = "50dad3d9-66ea-42a1-a06f-c502606d638f";
// Para crear una nueva ruta
export const createRuta = async (data) => {
  try {
    const rutaData = {
      nombre_ruta: data.nombre_ruta,
      calles: data.calles, // Array de IDs de calles
      perfil_id: PERFIL_ID
    };

    const response = await fetch(`${API_BASE}/rutas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rutaData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Ruta creada exitosamente:", result);
    return result;

  } catch (error) {
    console.error("Error al crear ruta:", error);
    throw error;
  }
};
