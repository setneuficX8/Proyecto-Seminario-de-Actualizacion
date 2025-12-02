import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../Supabase/Conection';
import { useAuth } from '../hooks/useAuth';
import { getAsignaciones } from '../services/AsignacionesService';
import { obtenerChoferesActivos } from '../services/ChoferesService';
import { getVehiculos } from '../services/VehiculosService';
import { getRutasActivas } from '../services/RutasService';

function Home() {
  const navigate = useNavigate();
  const { isChofer } = useAuth();
  const [activeRoutes, setActiveRoutes] = useState(0);
  const [trucksInOperation, setTrucksInOperation] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Sesión cerrada exitosamente');
      navigate('/LoginSupabase');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
    }
  };

  useEffect(() => {
    // Fetch metrics on mount
    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        const [rutas, vehiculos, asignaciones, choferesActivos] = await Promise.all([
          getRutasActivas(),
          getVehiculos(),
          getAsignaciones()
          , obtenerChoferesActivos()
        ]);

        // Active routes count
        setActiveRoutes(rutas?.length || 0);

        // Trucks in operation: vehicles with an active assignment
        const inOperation = (vehiculos || []).filter(v => v.tiene_asignacion_activa).length;
        setTrucksInOperation(inOperation);

        // Choferes activos
        setActiveDrivers((choferesActivos || []).length || 0);

        // Nota: Métrica de eficiencia removida por petición del usuario

      } catch (error) {
        console.error('Error fetching metrics: ', error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 border-t-4 border-sky-400">
        <div className="flex items-start justify-between mb-6">
          {/* Hero text */}
          <div className="text-left">
            <div className="inline-block mb-1 px-3 py-1 bg-white/6 rounded-full border border-white/10 text-xs font-semibold text-sky-300">EcoRuta</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-montserrat text-white tracking-wide">
              Transforma la gestión de tu flota de recolección
            </h2>
            <p className="mt-2 text-sm text-gray-300 max-w-xl">
              EcoRuta optimiza rutas en tiempo real, asigna camiones de manera inteligente y maximiza la eficiencia operativa de tus servicios de limpia.
            </p>
            <div className="mt-4">
              <button
                onClick={() => navigate('/gestion-asignaciones')}
                aria-label="Ver mi panel de control"
                className="inline-flex items-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold shadow-lg transition transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3v6h8v-6h3a1 1 0 001-1V7M8 3h8v4H8z"/></svg>
                Ver mi panel de control
              </button>
            </div>
          </div>

          {/* Botón de cerrar sesión */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md font-montserrat flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* panel de resumen*/}
        <div className="my-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Rutas activas */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-white/5">
                <div className="p-3 bg-white/5 rounded-lg">
                  <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Rutas activas</p>
                  <p className="text-3xl font-bold text-white">{loadingMetrics ? '—' : activeRoutes}</p>
                </div>
              </div>

              {/* Veiculos activos */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-white/5">
                <div className="p-3 bg-white/5 rounded-lg">
                  <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h6l3 3v5a2 2 0 01-2 2h-1M9 17a2 2 0 01-2 2H6a2 2 0 01-2-2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Camiones en operación</p>
                  <p className="text-3xl font-bold text-white">{loadingMetrics ? '—' : trucksInOperation}</p>
                </div>
              </div>

              {/* Choferes activos*/}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-white/5">
                <div className="p-3 bg-white/5 rounded-lg">
                  <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Choferes activos</p>
                  <p className="text-3xl font-bold text-white">{loadingMetrics ? '—' : activeDrivers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default Home;
