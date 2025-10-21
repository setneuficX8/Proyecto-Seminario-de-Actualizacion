import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import './Mapa.css'

function Mapa() {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    if (!mapContainerRef.current) {
      setError('Contenedor del mapa no disponible')
      setIsLoading(false)
      return
    }

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoiZmVybmFuZG96MjIiLCJhIjoiY21nZDN4MmMwMDBpZjJxcTFkOG8wZng1aCJ9.1MwuOu0F6-9rzHfZBs-4rw';
      
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11', // Estilo del mapa
        center: [-77.03116, 3.8801], // Coordenadas de Tura
        zoom: 10.12
      });

      mapRef.current.on('load', () => {
        setIsLoading(false)
        setError(null)
      })

      mapRef.current.on('error', (e) => {
        setError(`Error al cargar el mapa: ${e.error.message}`)
        setIsLoading(false)
      })

    } catch (err) {
      setError(`Error al inicializar el mapa: ${err.message}`)
      setIsLoading(false)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Error en el mapa</h3>
        <p>{error}</p>
        <p>Verifica tu conexión a internet y que el token de Mapbox sea válido.</p>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Cargando mapa...</p>
        </div>
      )}
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}

export default Mapa