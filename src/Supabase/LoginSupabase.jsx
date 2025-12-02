import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import { supabase } from "./Conection";

function LoginSupabase(){
    const { role } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState(null);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            const res = await supabase.auth.signInWithPassword({
                email,
                password
            })
            // Si hay un error en la respuesta, mostrar mensaje inline encima de los campos
            if(res?.error){
                // Mensajes comunes en Supabase para credenciales inválidas
                const msg = res.error.message || 'Error al iniciar sesión';
                if(msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('incorrect')){
                    setLoginError('Correo o contraseña incorrectos');
                } else {
                    setLoginError(msg);
                }
                // Ocultar después de unos segundos
                setTimeout(() => setLoginError(null), 4500);
                return;
            }
            console.log(res);
        } catch (error){
            console.error('Error al iniciar sesion:', error);
            setLoginError('Error al iniciar sesión');
            setTimeout(() => setLoginError(null), 4500);
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
                    {loginError && (
                        <div className="mb-2">
                            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                                <strong className="font-semibold">Error: </strong>
                                <span className="ml-1">{loginError}</span>
                                <button
                                    onClick={() => setLoginError(null)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-red-700 hover:text-red-900"
                                    aria-label="Cerrar alerta"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
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
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                placeholder="Tu contraseña"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-400 transition duration-200"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
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
                        {role !== 'chofer' && (
                        <Link to="/RegisterSupabase" className="text-sky-400 hover:text-sky-300 font-semibold transition duration-200">
                            Registrarse
                        </Link>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
} 

export default LoginSupabase;