import React from 'react';
import { useState } from 'react';
import { supabase } from './Conection';

function RegisterSupabase() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log(email);
        //console.log(password);
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


    return(
        <>
            <div>
                <form onSubmit={handleSubmit} >
                    <h2>Registro</h2>
                    <label>Correo Electrónico:</label>
                    <input type="email" name="email" required
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />
                    <label>Contraseña:</label>
                    <input type="password" name="password" required
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <br />
                    <button type="submit">Registrarse</button>
                </form>
            </div>
        </>
    )
}

export default RegisterSupabase;
