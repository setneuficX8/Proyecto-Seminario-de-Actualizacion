import { useEffect, useState } from 'react';
import { getAsignaciones } from '@/services/AsignacionesService';
import { obtenerChoferesActivos } from '@/services/ChoferesService';
import { getVehiculos } from '@/services/VehiculosService';
import { getRutasActivas } from '@/services/RutasService';

function Home() {
  const [activeRoutes, setActiveRoutes] = useState(0);
  const [trucksInOperation, setTrucksInOperation] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        const [rutas, vehiculos, , choferesActivos] = await Promise.all([
          getRutasActivas(),
          getVehiculos(),
          getAsignaciones(),
          obtenerChoferesActivos()
        ]);

        if (!isMounted) return;

        setActiveRoutes(rutas?.length || 0);
        setTrucksInOperation((vehiculos || []).filter(v => v.tiene_asignacion_activa).length);
        setActiveDrivers((choferesActivos || []).length || 0);
      } catch (error) {
        console.error('Error al cargar métricas:', error);
      } finally {
        if (isMounted) setLoadingMetrics(false);
      }
    };

    fetchMetrics();
    return () => { isMounted = false; };
  }, []);

  const kpis = [
    { label: 'Rutas activas', value: activeRoutes },
    { label: 'Camiones en operación', value: trucksInOperation },
    { label: 'Choferes activos', value: activeDrivers }
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Panel</h1>
        <p className="mt-1 text-sm text-[var(--text-mute)]">Resumen operativo de la flota</p>
      </header>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[var(--surface)] p-4">
            <p className="text-xs font-medium text-[var(--text-mute)]">{kpi.label}</p>
            <p className="mt-2 font-mono text-2xl tabular-nums text-[var(--text)]">
              {loadingMetrics ? '—' : kpi.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
