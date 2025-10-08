import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import './Mapa.css'

function Mapa() {

  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVybmFuZG96MjIiLCJhIjoiY21nZDN4MmMwMDBpZjJxcTFkOG8wZng1aCJ9.1MwuOu0F6-9rzHfZBs-4rw'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-58.3816, -34.6037], // Coordenadas de Buenos Aires
      zoom: 10.12
    });

    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <>
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}

export default Mapa