import { useState, useEffect } from "react";  
import Card from "./Card";
import "./Card.css";

export default function ApiEjemplo() {
    const [data, setData] = useState(null);
    const [characterId, setCharacterId] = useState(3); // Nuevo estado para el id
    const BASE_URL = 'https://dragonball-api.com/api/characters/';

    const fetchData = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}${id}`);
            const data = await response.json();
            setData(data);
            console.log(data);
        } catch (error) {
            console.error("Error en obtener datos:", error);
        }
    };

    useEffect(() => {
        fetchData(characterId);
    }, [characterId]); // Se actualiza cuando cambia el id

    const handlePrev = () => {
        if (characterId > 1) setCharacterId(characterId - 1);
    };

    const handleNext = () => {
        setCharacterId(characterId + 1);
    };

    if (!data) return <div>Cargando...</div>;
    return (
        <>
            <div>
                <h1>Personajes</h1>
                <div className="anterior" >
                     <button onClick={handlePrev}>&larr; Anterior</button>
                </div>
                <div className="siguiente">
                    <button onClick={handleNext}>Siguiente &rarr;</button>
                </div>
                <Card Data={data} />
            </div>
        </>
    );
}
