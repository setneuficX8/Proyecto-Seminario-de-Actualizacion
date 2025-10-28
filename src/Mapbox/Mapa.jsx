import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import { createRuta } from '../API/RutasAPI'

import 'mapbox-gl/dist/mapbox-gl.css'
import './Mapa.css'

function Mapa() {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nombreRuta, setNombreRuta] = useState('')
  const [rutaActual, setRutaActual] = useState(null)
  const [guardando, setGuardando] = useState(false)
  
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const directionsRef = useRef()

  useEffect(() => {
    if (!mapContainerRef.current) {
      setError('Contenedor del mapa no disponible')
      setIsLoading(false)
      return
    }

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoiZmVybmFuZG96MjIiLCJhIjoiY21nZDN4MmMwMDBpZjJxcTFkOG8wZng1aCJ9.1MwuOu0F6-9rzHfZBs-4rw'
      
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-77.03116, 3.8801],
        zoom: 10.12
      })

      // Inicializar el control de direcciones
      directionsRef.current = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
        profile: 'mapbox/driving', // Opciones: driving, walking, cycling
        controls: {
          inputs: true,
          instructions: true,
          profileSwitcher: true
        },
        interactive: true,
        language: 'es'
      })

      // Agregar el control de direcciones al mapa
      mapRef.current.addControl(directionsRef.current, 'top-left')

      mapRef.current.on('load', () => {
        setIsLoading(false)
        setError(null)
      })

      mapRef.current.on('error', (e) => {
        setError(`Error al cargar el mapa: ${e.error.message}`)
        setIsLoading(false)
      })

      // Event listeners para las direcciones
      directionsRef.current.on('route', (event) => {
        console.log('Ruta calculada:', event.route)
        setRutaActual(event.route[0]) // Guardar la primera ruta
      })

      directionsRef.current.on('error', (event) => {
        console.error('Error en direcciones:', event.error)
        setRutaActual(null)
      })

    } catch (err) {
      setError(`Error al inicializar el mapa: ${err.message}`)
      setIsLoading(false)
    }

    return () => {
      if (directionsRef.current) {
        directionsRef.current.removeRoutes()
      }
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  const handleGuardarRuta = async (e) => {
    e.preventDefault()
    
    if (!nombreRuta.trim()) {
      alert('Por favor ingresa un nombre para la ruta')
      return
    }

    if (!rutaActual) {
      alert('No hay ninguna ruta trazada en el mapa')
      return
    }

    try {
      setGuardando(true)

      // Esto es para xtraer las coordenadas de la geometría de la ruta
      const coordinates = rutaActual.geometry.coordinates

      const dataRuta = {
        nombre_ruta: nombreRuta,
        coordinates: coordinates
      }

      await createRuta(dataRuta)
      
      alert('Ruta guardada exitosamente')
      setNombreRuta('')
      setRutaActual(null)
      
      // Para limpiar la ruta del mapa
      if (directionsRef.current) {
        directionsRef.current.removeRoutes()
      }
      
    } catch (error) {
      alert(`Error al guardar la ruta: ${error.message}`)
    } finally {
      setGuardando(false)
    }
  }

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
    <div className="relative w-full h-full">
      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Cargando mapa...</p>
        </div>
      )}
      
      {/* Formulario para guardar ruta */}
      {rutaActual && (
        <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <form onSubmit={handleGuardarRuta} className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold mb-2">Crea una Ruta</h3>
              <p className="text-sm text-gray-600 mb-2">
                Distancia: {(rutaActual.distance / 1000).toFixed(2)} km
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Duración: {Math.round(rutaActual.duration / 60)} min
              </p>
            </div>
            
            <div>
              <label htmlFor="nombreRuta" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la ruta
              </label>
              <input
                id="nombreRuta"
                type="text"
                value={nombreRuta}
                onChange={(e) => setNombreRuta(e.target.value)}
                placeholder="Ej: Ruta Centro - Norte"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={guardando}
              />
            </div>
            
            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {guardando ? 'Guardando...' : 'Guardar Ruta'}
            </button>
          </form>
        </div>
      )}
      
      <div id='map-container' ref={mapContainerRef}/>
    </div>
  )
}

export default Mapa