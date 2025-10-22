import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
//import PrivateRoute from './components/PrivateRoute';

// Utilizando lazy loading para los componentes
const Mapa = lazy(() => import('./Mapbox/Mapa'));
const GestionVehiculos = lazy(() => import('./components/GestionVehiculos'));
const RegisterSupabase = lazy(() => import('./Supabase/RegisterSupabase'));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 font-poppins">
        {/* Header de Bienvenida */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6 px-4 shadow-lg">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-center font-montserrat tracking-wide">
            BIENVENID@ A TU SISTEMA DE RECOLECCIÓN
          </h1>
        </div>

        {/* Navegación */}
        <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md border-t-4 border-sky-400">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 py-4">
              <Link 
                to="/" 
                className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
              >
                <span className="flex items-center space-x-2">
                  <span>Inicio</span>
                </span>
              </Link>
              
              <Link 
                to="/mapa" 
                className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
              >
                <span className="flex items-center space-x-2">
                  <span>Mapa de Rutas</span>
                </span>
              </Link>
              
              <Link 
                to="/gestion-vehiculos" 
                className="group px-6 py-3 text-lg font-semibold text-white hover:text-sky-400 transition-all duration-300 border-b-2 border-transparent hover:border-sky-400 font-montserrat"
              >
                <span className="flex items-center space-x-2">
                  <span>Gestión de Vehículos</span>
                </span>
              </Link>
              <Link
                to="/RegisterSupabase"
              >
                <span className="flex items-center space-x-2">
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
              <Route path="/" element={
                <div className="text-center py-16">
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 border-t-4 border-sky-400">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-montserrat">
                        Explora nuestras secciones para ver más contenido
                      </h2>
                      <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        Gestiona tus rutas de recolección y vehículos. 
                        Utiliza nuestro sistema para optimizar tu gestión.
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <Link 
                          to="/mapa" 
                          className="group bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white p-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <h3 className="text-xl font-semibold mb-2">Visualizar Rutas</h3>
                          <p className="text-sky-100">Explora el mapa de rutas de recolección</p>
                        </Link>
                        
                        <Link 
                          to="/gestion-vehiculos" 
                          className="group bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white p-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-sky-400"
                        >
                          <h3 className="text-xl font-semibold mb-2">Gestionar Vehículos</h3>
                          <p className="text-gray-300">Administra tus vehículos de recolección</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/mapa" element={<Mapa />} />
              <Route path="/gestion-vehiculos" element={<GestionVehiculos />} />
              <Route path="/RegisterSupabase" element={<RegisterSupabase />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6 mt-auto border-t border-sky-400">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-300">
              {new Date().getFullYear()} Sistema de Recolección. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
