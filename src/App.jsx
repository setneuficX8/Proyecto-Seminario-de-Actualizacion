import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useEffect } from 'react';
import { supabase } from './Supabase/Conection';
//import PrivateRoute from './components/PrivateRoute';

// Utilizando lazy loading para los componentes
const Mapa = lazy(() => import('./Mapbox/Mapa'));
const GestionVehiculos = lazy(() => import('./components/GestionVehiculos'));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 font-poppins">
      {/* Header de Bienvenida */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md text-white py-6 px-4 shadow-lg border-b border-white/10">
        <h1 className="mt-0 text-2xl md:text-4xl lg:text-5xl font-bold text-center font-montserrat tracking-wide drop-shadow-lg">
          BIENVENID@ A TU SISTEMA DE RECOLECCIÓN
        </h1>
      </div>

      {/* Navegación */}
      <nav className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md text-white shadow-md border-t-4 border-sky-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 py-4">
            <Link 
              to="/" 
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span>Inicio</span>
              </span>
            </Link>
            
            <Link 
              to="/mapa" 
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span>Mapa de Rutas</span>
              </span>
            </Link>
            
            <Link 
              to="/gestion-vehiculos" 
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span>Gestión de Vehículos</span>
              </span>
            </Link>
            
            <Link
              to="/RegisterSupabase"
              className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
            >
              <span className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <span>Registro</span>
              </span>
            </Link>
          </div>
        </div>
      </nav>

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
            <Route path="/RegisterSupabase" element={<RegisterSupabase />} />
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
    <BrowserRouter>
      <AppContent />
      <Footer />
    </BrowserRouter>
  )
}

export default App
