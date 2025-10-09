import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import {lazy, Suspense} from 'react'
import './App.css'
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Mapa from './components/Mapa';
import EjemploAPI from './components/EjemploAPI';

const Nosotros = lazy(() => delay(import('./components/Nosotros')))
const Ruta = lazy(() => delay(import('./components/Ruta')))

function App() {
 
  return (
    <BrowserRouter>
      <div className="App">
          <div className="bienvenida">
            <h1>BIENVENID@</h1>

            <img src="public/rot.png" alt="Logo de la aplicación" width={200} height={200} />
          </div>
        <nav>
          <h3><Link to="/" >Inicio</Link></h3>
          <h3><Link to="/nosotros" >Nosotros</Link></h3>
          <h3><Link to="/ruta" >Links</Link></h3>
          <h3><Link to="/mapa">Mapa de Rutas </Link></h3>
          <h3><Link to="/ejemplo-api">Ejemplo API</Link></h3>
        </nav>
        <main>
          <Suspense fallback={<div>Cargando...
          </div>}>
             <Routes>
              
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<div className='MensajeInicio'>
                <h2>Explora nuestras secciones para ver más contenido.</h2>
                </div>} />
                 <Route path="/mapa" element={<Mapa />}
                 /> <>{/*Hacerla privada*/}</>
                  
              <Route path="/nosotros" element={
                <PrivateRoute>
                  <Nosotros />
                </PrivateRoute>
              } />
              <Route path="/ejemplo-api" element={
                  <EjemploAPI />
                
              } />
              <Route path="/ruta" element={
                <PrivateRoute>
                  <Ruta />
                </PrivateRoute>
              } />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

function delay(promise){
return new Promise(resolve => {
    setTimeout(resolve, 500);
  }).then(() => promise);
}

export default App
