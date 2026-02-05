import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

try {
  window.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) e.preventDefault()
    },
    { passive: false }
  )

  window.addEventListener(
    'keydown',
    (e) => {
      if (!e.ctrlKey) return
      const key = (e.key || '').toLowerCase()
      if (key === '+' || key === '-' || key === '=' || key === '0') e.preventDefault()
    },
    { passive: false }
  )

  window.addEventListener(
    'gesturestart',
    (e) => {
      e.preventDefault()
    },
    { passive: false }
  )
  window.addEventListener(
    'gesturechange',
    (e) => {
      e.preventDefault()
    },
    { passive: false }
  )
  window.addEventListener(
    'gestureend',
    (e) => {
      e.preventDefault()
    },
    { passive: false }
  )
} catch (e) {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
