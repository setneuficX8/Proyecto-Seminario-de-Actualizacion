import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Landing from './components/Landing.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Landing/>
  </StrictMode>,
)
