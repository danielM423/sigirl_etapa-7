// Punto de entrada principal de React.
// Aquí se cargan los estilos globales y se monta la aplicación en el elemento root.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'

// createRoot conecta React con el DOM real del navegador.
// StrictMode ayuda a detectar malas prácticas durante el desarrollo.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
