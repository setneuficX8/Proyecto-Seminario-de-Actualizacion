import React from 'react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { supabase } from './Conection';
import Swal from 'sweetalert2';

function RegisterSupabase() {
    const { role, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Firstname, setFirstname] = useState('');
    const [Lastname, setLastname] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Registrar usuario en Authentication
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre: Firstname,
                        apellido: Lastname,
                        rol: 'administrador', 
                        display_name: `${Firstname} ${Lastname}`
                    }
                }
            });

            if (error) {
                console.error('Error al registrar:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al registrar',
                    text: error.message,
                    confirmButtonColor: '#0ea5e9'
                });
                return;
            }

            console.log('Usuario registrado:', data);
            
            // El trigger de Supabase creará automáticamente el registro en la tabla administrador
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Se ha enviado un correo de confirmación a tu email. El trigger insertará tu usuario como administrador.',
                showConfirmButton: true,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#0ea5e9',
                timer: 5000,
                timerProgressBar: true
            });

        } catch (error) {
            console.error('Error inesperado:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error inesperado',
                text: 'Ocurrió un error inesperado. Intenta de nuevo.',
                confirmButtonColor: '#0ea5e9'
            });
        }
    }


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-400" />
            </div>
        );
    }

    // Si el usuario está autenticado y es chofer, bloquear acceso
    if (role === 'chofer') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="max-w-md mx-auto p-5">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 border-t-4 border-sky-400">
                <h2 className="text-3xl font-bold text-white mb-2 text-center font-montserrat">
                    Crear Cuenta
                    (Administrador)
                </h2>
                <p className="text-gray-300 text-center mb-6">
                    Registra tu cuenta para acceder al sistema
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Campo de Nombre */}
                    <div>
                        <label htmlFor="Firstname" className="block text-sm font-semibold text-gray-300 mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="Firstname"
                            name="Firstname"
                            required
                            placeholder="Tu nombre"
                            onChange={(e) => setFirstname(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                        />
                    </div>
                    {/* Campo de Apellido */}
                    <div>
                        <label htmlFor="Lastname" className="block text-sm font-semibold text-gray-300 mb-2">
                            Apellido
                        </label>
                        <input
                            type="text"
                            id="Lastname"
                            name="Lastname"
                            required
                            placeholder="Tu apellido"
                            onChange={(e) => setLastname(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200"
                        />
                    </div>

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
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                required
                                placeholder="Mínimo 6 caracteres"
                                onChange={(e) => setPassword(e.target.value)}
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
