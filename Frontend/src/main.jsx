import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {AuthProvider} from "./context/Authprovider.jsx"
import './index.css';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
    <SocketProvider>
      <App />
    </SocketProvider>

  </AuthProvider>,
    </BrowserRouter>
)
