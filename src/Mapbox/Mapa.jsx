import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import polyline from '@mapbox/polyline';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import { createRuta } from '@/services/RutasService'
import { labelClass, inputClass, buttonPrimaryClass } from '@/components/ui/tokens'

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

    // Manejadores con referencia estable para poder removerlos explícitamente
    // en el cleanup (map.on/.off y directions.on/.off).
    const handleLoad = () => {
      setIsLoading(false)
      setError(null)
    }

    const handleMapError = (e) => {
      setError(`Error al cargar el mapa: ${e.error.message}`)
      setIsLoading(false)
    }

    const handleRoute = (event) => {
      console.log('Ruta calculada:', event.route)
      setRutaActual(event.route[0]) // Guardar la primera ruta
    }

    const handleDirectionsError = (event) => {
      console.error('Error en direcciones:', event.error)
      setRutaActual(null)
    }

    try {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-77.0312, 3.8801],
        zoom: 10.12
      })
      console.log("Mapa inicializado:", mapRef.current.getCenter())

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

      mapRef.current.on('load', handleLoad)
      mapRef.current.on('error', handleMapError)

      // Event listeners para las direcciones
      directionsRef.current.on('route', handleRoute)
      directionsRef.current.on('error', handleDirectionsError)

    } catch (err) {
      setError(`Error al inicializar el mapa: ${err.message}`)
      setIsLoading(false)
    }

    return () => {
      const map = mapRef.current
      const directions = directionsRef.current

      // El mapa de Mapbox GL SÍ expone .off(): se remueven sus escuchadores.
      if (map) {
        map.off('load', handleLoad)
        map.off('error', handleMapError)
      }

      // IMPORTANTE: MapboxDirections NO expone .off() en esta versión (solo
      // on/onAdd/onRemove/removeRoutes). Llamarlo revienta el cleanup y tumba el
      // componente. Se retira el control del mapa (map.removeControl dispara su
      // onRemove, que limpia sus listeners internos) y se limpian sus rutas.
      if (directions) {
        if (typeof directions.off === 'function') {
          directions.off('route', handleRoute)
          directions.off('error', handleDirectionsError)
        }
        if (typeof directions.removeRoutes === 'function') {
          directions.removeRoutes()
        }
        if (map && typeof map.removeControl === 'function') {
          try {
            map.removeControl(directions)
          } catch (err) {
            // El control pudo no agregarse si el mapa falló al inicializar.
            console.warn('No se pudo retirar el control de direcciones:', err)
          }
        }
      }

      if (map) {
        map.remove()
      }

      // Nulificar referencias para liberar memoria y evitar usos colgantes.
      mapRef.current = null
      directionsRef.current = null
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
      
      
      const coordenadas = polyline.decode(rutaActual.geometry);
      console.log("Coordenadas HDP ", coordenadas.slice(0, 3));
      const Coordenadas = coordenadas.map(([lat, lng]) => [lng, lat]);
      console.log("Coordenadas en formato GeoJSON (lng, lat):", Coordenadas.slice(0, 3));
      console.log("Ruta actual:", rutaActual)

      const dataRuta = {
        nombre_ruta: nombreRuta,
        coordinates: Coordenadas
      }

      await createRuta(dataRuta)
      
      alert('Ruta guardada exitosamente en Supabase y API externa')
      setNombreRuta('')
      setRutaActual(null)
      
      // Limpiar la ruta del mapa
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
      <div className="p-5 text-center text-[var(--text-mute)]">
        <h3 className="text-base font-semibold text-[var(--text)]">No se pudo cargar el mapa</h3>
        <p className="mt-1 text-sm">{error}</p>
        <p className="mt-1 text-sm">Verifica tu conexión a internet y que el token de Mapbox sea válido.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[calc(100vh-11rem)] min-h-[420px]">
      {isLoading && (
        <div className="p-5 text-center text-sm text-[var(--text-mute)]">Cargando mapa…</div>
      )}
      
      {/* Formulario para guardar ruta */}
      {rutaActual && (
        <div className="absolute right-4 top-4 z-10 w-full max-w-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <form onSubmit={handleGuardarRuta} className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Crear ruta</h3>
              <p className="mt-1 font-mono text-xs tabular-nums text-[var(--text-mute)]">
                Distancia: {(rutaActual.distance / 1000).toFixed(2)} km · Duración: {Math.round(rutaActual.duration / 60)} min
              </p>
            </div>
            
            <div>
              <label htmlFor="nombreRuta" className={labelClass}>Nombre de la ruta</label>
              <input
                id="nombreRuta"
                type="text"
                value={nombreRuta}
                onChange={(e) => setNombreRuta(e.target.value)}
                placeholder="Ej: Ruta Centro - Norte"
                disabled={guardando}
                className={`${inputClass} disabled:opacity-60`}
              />
            </div>
            
            <button type="submit" disabled={guardando} className={`${buttonPrimaryClass} w-full`}>
              {guardando ? 'Guardando…' : 'Guardar ruta'}
            </button>
          </form>
        </div>
      )}
      
      <div id='map-container' ref={mapContainerRef}/>
    </div>
  )
}

export default Mapa
