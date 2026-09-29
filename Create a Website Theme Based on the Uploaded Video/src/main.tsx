import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './video-background.css'
import './glassmorphism.css'
import App from './App'
import { AuthProvider } from './auth'
import { ThemeProvider } from './contexts/ThemeContext'
import { VideoBackdrop } from './components/VideoBackdrop'

createRoot(document.getElementById('root')!).render(<StrictMode><VideoBackdrop/><ThemeProvider><AuthProvider><App /></AuthProvider></ThemeProvider></StrictMode>)
