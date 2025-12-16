import React from 'react' // Import React library
import ReactDOM from 'react-dom/client' // Import ReactDOM for rendering
import App from './App.tsx' // Import the main App component
import './index.css' // Import global CSS styles

// Create a root and render the App component in StrictMode
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> {/* Enable React Strict Mode for development checks */}
    <App /> {/* Render the App component */}
  </React.StrictMode>,
)