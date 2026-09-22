import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TransactionSimulator from './pages/TransactionSimulator'
import AttackSimulator from './pages/AttackSimulator'
import AttackVisualization from './pages/AttackVisualization'
import AIAnalysis from './pages/AIAnalysis'
import Incidents from './pages/Incidents'
import SecurityEvents from './pages/SecurityEvents'
import BeforeAfter from './pages/BeforeAfter'
import Architecture from './pages/Architecture'
import About from './pages/About'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00d4ff' },
    secondary: { main: '#00ff88' },
    error: { main: '#ff3366' },
    warning: { main: '#ff8c00' },
    background: { default: '#050b14', paper: '#0a1628' },
    text: { primary: '#e2e8f0', secondary: '#94a3b8' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(0,212,255,0.12)',
          backgroundColor: '#0a1628',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' }
    }
  }
})

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<TransactionSimulator />} />
              <Route path="attack-simulator" element={<AttackSimulator />} />
              <Route path="attack-visualization" element={<AttackVisualization />} />
              <Route path="ai-analysis" element={<AIAnalysis />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="events" element={<SecurityEvents />} />
              <Route path="before-after" element={<BeforeAfter />} />
              <Route path="architecture" element={<Architecture />} />
              <Route path="about" element={<About />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
