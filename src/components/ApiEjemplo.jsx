import { useState, useEffect } from "react";  
import Card from "./Card";
import "./Card.css";

export default function ApiEjemplo() {
    const [data, setData] = useState(null);
    const [characterId, setCharacterId] = useState(3);
    const [searchTerm, setSearchTerm] = useState("");
    const [allCharacters, setAllCharacters] = useState([]);
    const BASE_URL = 'https://dragonball-api.com/api/characters/';

    const fetchAllCharacters = async () => {
        try {
            const response = await fetch(`${BASE_URL}?limit=100`);
            const data = await response.json();
            setAllCharacters(data.items || []);
        } catch (error) {
            console.error("Error en obtener todos los personajes:", error);
        }
    };

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

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        
        // Buscar por ID si es un número
        if (!isNaN(searchTerm) && searchTerm.trim() !== "") {
            const id = parseInt(searchTerm);
            setCharacterId(id);
            fetchData(id);
            return;
        }
        
        // Buscar por nombre
        const foundCharacter = allCharacters.find(char => 
            char.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (foundCharacter) {
            setCharacterId(foundCharacter.id);
            setData(foundCharacter);
        } else {
            console.log("Personaje no encontrado");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        fetchData(characterId);
        fetchAllCharacters();
    }, [characterId]);

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
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Buscar por nombre o ID..."
                        style={{ padding: '8px', marginRight: '10px', borderRadius: '4px' }}
                    />
                    <button onClick={handleSearch} style={{ padding: '8px 12px', borderRadius: '4px' }}>
                        Buscar
                    </button>
                </div>
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