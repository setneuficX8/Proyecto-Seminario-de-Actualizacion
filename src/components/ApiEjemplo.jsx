import { useState,useEffect } from "react";  
import Card from "./Card";

export default function ApiEjemplo() {
    const [data, setData] = useState(null);
    const BASE_URL = 'https://dragonball-api.com/api/characters/';

    const fetchData = async (id) => {
        try{
            const response = await fetch(`${BASE_URL}${id}`);
            const data = await response.json();
            setData(data);
            console.log(data);
        }catch(error){
            console.error("Error en obtener datos:", error);
        }

}
    useEffect(() => {
        fetchData(2);
    }, []);

    if(!data) return <div>Cargando...</div>;
    return(
        <>
        <div>
         <h1>Personajes</h1>
        <Card Data={data} />
        </div>
        </>
    )
}
