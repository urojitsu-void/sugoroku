import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const baseStyles = document.createElement('style')
baseStyles.textContent = `
  * { box-sizing: border-box; }
  :root {
    font-family: 'Segoe UI', 'Hiragino Sans', 'Yu Gothic', sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color: #f3f5ff;
    background-color: #05060f;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
  body { margin: 0; min-height: 100vh; }
  main { min-height: 100vh; }
  button { font-family: inherit; }
`
document.head.appendChild(baseStyles)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
