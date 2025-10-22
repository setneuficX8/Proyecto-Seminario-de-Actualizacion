import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../Supabase/Conection';

function Home() {
  const navigate = useNavigate();

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

  return (
    <div className="text-center py-16">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 border-t-4 border-sky-400">
          {/* Botón de cerrar sesión */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md font-montserrat flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>

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
  );
}

export default Home;
