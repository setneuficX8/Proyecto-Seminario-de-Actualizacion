import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./Conection";

function LoginSupabase(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            const res = await supabase.auth.signInWithPassword({
                email,
                password
            })
            console.log(res);
        } catch (error){
            console.error('Error al iniciar sesion:', error);
        }
    }

    return(
        <div className="max-w-md mx-auto p-5">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 border-t-4 border-sky-400">
                <h2 className="text-3xl font-bold text-white mb-2 text-center font-montserrat">
                    Iniciar Sesión
                </h2>
                <p className="text-gray-300 text-center mb-6">
                    Accede a tu cuenta del sistema
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                            Correo Electrónico
                        </label>
                        <input 
                            type="email"
                            id="email"
                            value={email}
                            placeholder="ejemplo@correo.com"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                            Contraseña
                        </label>
                        <input 
                            type="password"
                            id="password"
                            value={password}
                            placeholder="Tu contraseña"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-montserrat"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/RegisterSupabase" className="text-sky-400 hover:text-sky-300 font-semibold transition duration-200">
                            Registrarse
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
} 

export default LoginSupabase;