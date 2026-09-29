import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { AuthProvider } from './auth'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter } from 'react-router-dom'
import { WorkflowProvider } from './contexts/WorkflowContext'

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><ThemeProvider><AuthProvider><WorkflowProvider><App /></WorkflowProvider></AuthProvider></ThemeProvider></BrowserRouter></StrictMode>)
