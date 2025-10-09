const API_BASE = "http://apirecoleccion.gonzaloandreslucio.com/api";
const PERFIL_ID = "50dad3d9-66ea-42a1-a06f-c502606d638f";
// Para obtener todas las calles
export const getCalles = async () => {
    try {
        const url = `${API_BASE}/calles?perfil_id=${PERFIL_ID}`;
        console.log('GET URL:', url);

        const response = await fetch(url);

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if(!response.ok){
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error("Error al obtener calles:", error);
        throw error;
    }
};

// Para obtener los detalles de las calles con su geometría

export const getCallesDetalles = async () => {
    try {
        const url = `${API_BASE}/calles?perfil_id=${PERFIL_ID}`;
        console.log('GET URL:', url);

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error("Error al obtener detalles de calles:", error);
        throw error;
    }
};
