import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './Conection';

function RegisterSupabase() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await supabase.auth.signUp({
                email,
                password
            })
            console.log(res);
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
        }
    }


    return (
        <div className="max-w-md mx-auto p-5">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 border-t-4 border-sky-400">
                <h2 className="text-3xl font-bold text-white mb-2 text-center font-montserrat">
                    Crear Cuenta
                </h2>
                <p className="text-gray-300 text-center mb-6">
                    Registra tu cuenta para acceder al sistema
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Campo de Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="ejemplo@correo.com"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                        />
                    </div>

                    {/* Campo de Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Mínimo 6 caracteres"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                        />
                    </div>

                    {/* Botón de registro */}
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-montserrat"
                    >
                        Registrarse
                    </button>
                </form>

                {/* Link a login */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/LoginSupabase" className="text-sky-400 hover:text-sky-300 font-semibold transition duration-200">
                            Iniciar Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterSupabase;
