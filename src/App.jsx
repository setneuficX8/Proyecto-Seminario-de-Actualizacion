import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Landing from './components/Landing.jsx'
import Ruta from './components/Ruta.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <div className="App">
        <h1>Hola mundo</h1>
        <nav >
          <h3><Link to="/" >Inicio</Link></h3>
          <h3><Link to="/ruta" >Links</Link></h3>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/ruta" element={<Ruta />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
