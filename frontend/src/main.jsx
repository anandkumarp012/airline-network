import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import App from './App';
import './index.css';
import { InitialLoadingProvider } from './components/InitialLoadingContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <InitialLoadingProvider>
        <App />
      </InitialLoadingProvider>
    </BrowserRouter>
  </React.StrictMode>
);
