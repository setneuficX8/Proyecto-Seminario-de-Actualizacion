import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Nosotros from './components/Nosotros.jsx'
import Ruta from './components/Ruta.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <div className="App">
        <h1>BIENVENID@</h1>
        <nav >
          <h3><Link to="/" >Inicio</Link></h3>
          <h3><Link to="/ruta" >Links</Link></h3>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Nosotros />} />
            <Route path="/ruta" element={<Ruta />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
