import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import { useEffect } from 'react';
import { supabase } from './Supabase/Conection';
import useAuth from './hooks/useAuth';
import RoleRoute from './components/RoleRoute';
//import PrivateRoute from './components/PrivateRoute';

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

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && window.location.pathname !== '/RegisterSupabase' && window.location.pathname !== '/LoginSupabase') {
        navigate('/LoginSupabase');
      }
    });

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      // Solo redirigir en eventos específicos
      if (event === 'SIGNED_IN') {
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        navigate('/LoginSupabase');
      }
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const { user, role, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 font-poppins">
      {/* Header de Bienvenida */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md text-white py-6 px-4 shadow-lg border-b border-white/10">
        <h1 className="mt-0 text-2xl md:text-4xl lg:text-5xl font-bold text-center font-montserrat tracking-wide drop-shadow-lg">
          BIENVENID@ A TU SISTEMA DE RECOLECCIÓN
        </h1>
      </div>

      {/* Navegación (solo visible cuando hay sesión iniciada) */}
      { !loading && user && (
      <nav className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md text-white shadow-md border-t-4 border-sky-400">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top row: brand + hamburger (mobile) */}
          <div className="flex items-center justify-between py-3 md:hidden">
            <div className="text-white font-semibold text-lg">Menu</div>
            <button
              aria-label="Toggle navigation menu"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="text-white focus:outline-none p-2 rounded-md hover:bg-white/5"
            >
              {/* Hamburger icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Links: visible on md and up, or on mobile if menu open */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 py-4">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center min-w-0 space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span className="truncate">Inicio</span>
              </span>
            </Link>
            
            <Link 
              to="/mapa" 
              onClick={() => setIsMenuOpen(false)}
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center min-w-0 space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span className="truncate">Mapa de Rutas</span>
              </span>
            </Link>
            
            <Link 
              to="/gestion-vehiculos" 
              onClick={() => setIsMenuOpen(false)}
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center min-w-0 space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span className="truncate">Gestión de Vehículos</span>
              </span>
            </Link>
            
            <Link 
              to="/gestion-asignaciones" 
              onClick={() => setIsMenuOpen(false)}
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center min-w-0 space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span className="truncate">Asignaciones</span>
              </span>
            </Link>
            
            {role !== 'chofer' && (
            <Link 
              to="/gestion-choferes" 
              onClick={() => setIsMenuOpen(false)}
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center min-w-0 space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span className="truncate">Gestión de Choferes</span>
              </span>
            </Link>
            )}
            
            {role !== 'chofer' && (
            <Link 
              to="/gestion-rutas" 
              onClick={() => setIsMenuOpen(false)}
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center min-w-0 space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span className="truncate">Gestión de Rutas</span>
              </span>
            </Link>
            )}
            
            {role !== 'chofer' && (
            <Link
              to="/RegisterSupabase"
              onClick={() => setIsMenuOpen(false)}
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center min-w-0 space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span className="truncate">Registro</span>
              </span>
            </Link>
            )}
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-400"></div>
            <div className="text-xl font-semibold text-white font-montserrat">
              Cargando...
            </div>
            <div className="text-sm text-gray-300">
              Por favor, espera un momento
            </div>
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

function Footer(){
  return(
    <>
        <footer className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md text-white py-6 border-t border-sky-400">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            {new Date().getFullYear()} Sistema de Recolección. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  )
}

function App() {
  return (
    <BrowserRouter basename='https://setneuficx8.github.io/Proyecto-Seminario-de-Actualizacion/'>
      <AppContent />
      <Footer />
    </BrowserRouter>
  )
}

export default App
