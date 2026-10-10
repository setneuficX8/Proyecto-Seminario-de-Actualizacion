import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import useAuth from './hooks/useAuth';
import RoleRoute from './components/RoleRoute';

// Utilizando lazy loading para los componentes
const Mapa = lazy(() => import('./Mapbox/Mapa'));
const GestionVehiculos = lazy(() => import('./components/GestionVehiculos'));
const GestionAsignaciones = lazy(() => import('./components/GestionAsignaciones'));
const GestionChoferes = lazy(() => import('./components/GestionChoferes'));
const GestionRutas = lazy(() => import('./components/GestionRutas'));
const PerfilChofer = lazy(() => import('./components/PerfilChofer'));
const RegisterSupabase = lazy(() => import('./Supabase/RegisterSupabase'));
const LoginSupabase = lazy(() => import('./Supabase/LoginSupabase'));
const Home = lazy(() => import('./components/Home'));

// Componente interno que maneja la autenticación
function AppContent() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Redirección según el estado de sesión. La suscripción a Supabase vive en
  // AuthProvider (una única suscripción para toda la aplicación).
  useEffect(() => {
    if (loading) return;

    const path = window.location.pathname;

    if (!user) {
      // Sin sesión: solo se permite permanecer en login/registro.
      if (path !== '/RegisterSupabase' && path !== '/LoginSupabase') {
        navigate('/LoginSupabase');
      }
    } else if (path === '/LoginSupabase') {
      // Con sesión: salir de la pantalla de login.
      navigate('/');
    }
  }, [user, loading, navigate]);

  const navItems = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/mapa', label: 'Mapa' },
    { to: '/gestion-vehiculos', label: 'Vehículos' },
    { to: '/gestion-asignaciones', label: 'Asignaciones' },
    ...(role !== 'chofer'
      ? [
          { to: '/gestion-choferes', label: 'Choferes' },
          { to: '/gestion-rutas', label: 'Rutas' },
          { to: '/RegisterSupabase', label: 'Registro' },
        ]
      : []),
  ];

  const navLinkClass = ({ isActive }) =>
    [
      'inline-flex min-h-[44px] items-center rounded-md px-3.5 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]',
      isActive
        ? 'bg-[var(--raised)] text-[var(--text)]'
        : 'text-[var(--text-mute)] hover:bg-[var(--raised)] hover:text-[var(--text)]',
    ].join(' ');

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text)]">
      {/* Barra de navegación (solo visible cuando hay sesión iniciada) */}
      {!loading && user && (
        <nav className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
              <span className="mr-1 whitespace-nowrap text-sm font-semibold tracking-tight text-[var(--text)]">
                Recolección
              </span>

              {/* Hamburguesa (móvil) */}
              <button
                type="button"
                aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--text-mute)] transition-colors hover:bg-[var(--raised)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] md:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <ul className={`${isMenuOpen ? 'flex' : 'hidden'} w-full flex-col gap-1 md:flex md:w-auto md:flex-row md:items-center md:gap-1`}>
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={() => setIsMenuOpen(false)}
                      className={navLinkClass}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* Contenido Principal */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Suspense fallback={
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--signal)]" aria-hidden="true" />
            <p className="text-sm text-[var(--text-mute)]">Cargando…</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/gestion-vehiculos" element={<GestionVehiculos />} />
            <Route path="/gestion-asignaciones" element={<GestionAsignaciones />} />
            <Route path="/gestion-choferes" element={
              <RoleRoute blockedRoles={["chofer"]}>
                <GestionChoferes />
              </RoleRoute>
            } />
            <Route path="/gestion-rutas" element={
              <RoleRoute blockedRoles={["chofer"]}>
                <GestionRutas />
              </RoleRoute>
            } />
            <Route path="/perfil-chofer" element={<PerfilChofer />} />
            <Route path="/RegisterSupabase" element={
              <RoleRoute blockedRoles={["chofer"]}>
                <RegisterSupabase />
              </RoleRoute>
            } />
            <Route path="/LoginSupabase" element={<LoginSupabase />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] py-6">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-sm text-[var(--text-mute)]">
          {new Date().getFullYear()} Sistema de Recolección. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContent />
      <Footer />
    </BrowserRouter>
  )
}

export default App
