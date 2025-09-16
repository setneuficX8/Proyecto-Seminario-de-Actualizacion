import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import {lazy, Suspense} from 'react'
import './App.css'

const Nosotros = lazy(() => import('./components/Nosotros'))
const Ruta = lazy(() => import('./components/Ruta'))


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
          <h3><Link to="/ruta" >Links</Link></h3>
        </nav>
        <main>
          <Suspense fallback={<div>Cargando...</div>}>
             <Routes>
            <Route path="/" element={<Nosotros />} />
            <Route path="/ruta" element={<Ruta />} />
          </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
