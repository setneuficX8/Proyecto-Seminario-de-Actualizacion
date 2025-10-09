const API_BASE = "http://apirecoleccion.gonzaloandreslucio.com/api";
const PERFIL_ID = "50dad3d9-66ea-42a1-a06f-c502606d638f";

// Obtener todos los vehículos
export const getVehiculos = async () => {
  try {
    const url = `${API_BASE}/vehiculos?perfil_id=${PERFIL_ID}`;
    console.log('GET URL:', url);
    
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    throw error;
  }
};

// Crear un nuevo vehículo
export const createVehiculo = async (data) => {
  try {
    // Añadir automáticamente el perfil_id al objeto data
    const vehiculoData = {
      ...data,
      perfil_id: PERFIL_ID
    };

    const response = await fetch(`${API_BASE}/vehiculos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vehiculoData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    throw error;
  }
};