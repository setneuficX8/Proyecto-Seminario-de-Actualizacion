import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import users from '../store/users.json';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      dispatch(login({ username }));
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
      <button type="submit">Entrar</button>
      {error && <p style={{color:'red'}}>{error}</p>}
    </form>
  );
}