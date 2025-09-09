import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Landing from './components/Landing.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Landing/>  
    </Provider>
  </StrictMode>,
)
