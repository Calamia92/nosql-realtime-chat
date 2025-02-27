import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // L'import de ton fichier principal
import 'bootstrap/dist/css/bootstrap.min.css';

  // Si tu as des styles globaux

const rootElement = document.getElementById('app') as HTMLElement;  // Cibler l'élément 'app' dans index.html
const root = ReactDOM.createRoot(rootElement);  // Créer la racine de l'application

root.render(
  <React.StrictMode>
    <App />  {/* Rendu du composant App */}
  </React.StrictMode>
);
