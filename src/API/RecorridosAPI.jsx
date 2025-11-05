const API_BASE = "http://apirecoleccion.gonzaloandreslucio.com/api";
const PERFIL_ID = "50dad3d9-66ea-42a1-a06f-c502606d638f";

export const createRecorrido = async (data) => { // Metodo para crear un nuevo recorrido
    try {
        const recorrido = {
            lat: data.lat,
            lon: data.lon,
            perfil_id: PERFIL_ID
        };

        const response = await fetch(`${API_BASE}/recorridos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recorrido),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }

        const resultado = await response.json();
        console.log("Recorrido creado exitosamente:", resultado);
        return resultado;

    } catch (error) {
        console.error("Error al crear recorrido:", error);
        throw error;
    }
};