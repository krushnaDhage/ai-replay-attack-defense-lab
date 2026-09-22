import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050b14', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      {/* Background grid effect */}
      <Box sx={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

      <Paper sx={{ width: '100%', maxWidth: 420, p: 4, bgcolor: '#0a1628', border: '1px solid rgba(0,212,255,0.2)', position: 'relative', overflow: 'hidden' }}>
        {/* Top accent line */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #00d4ff, #8b5cf6, #ff3366)' }} />

        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(0,212,255,0.1)', borderRadius: '50%', border: '2px solid rgba(0,212,255,0.3)', mb: 2, animation: 'pulse-glow 2s infinite' }}>
            <ShieldIcon sx={{ color: '#00d4ff', fontSize: 40 }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#00d4ff', fontWeight: 700, mb: 0.5 }}>AI Defense Lab</Typography>
          <Typography variant="caption" sx={{ color: '#475569', textAlign: 'center' }}>
            Replay Attack Detection System — Secure Login
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff3366' }}>{error}</Alert>}

        <form onSubmit={handleSubmit} id="login-form">
          <TextField fullWidth id="username" label="Username" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#00d4ff', fontSize: 18 }} /></InputAdornment> }}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(0,212,255,0.2)' }, '&:hover fieldset': { borderColor: '#00d4ff' } } }} />

          <TextField fullWidth id="password" label="Password" type={showPw ? 'text' : 'password'} value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#00d4ff', fontSize: 18 }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPw(!showPw)} size="small" sx={{ color: '#64748b' }}>{showPw ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment>
            }}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(0,212,255,0.2)' }, '&:hover fieldset': { borderColor: '#00d4ff' } } }} />

          <Button type="submit" id="login-btn" fullWidth variant="contained" disabled={loading}
            sx={{ py: 1.4, background: 'linear-gradient(135deg, #00d4ff, #0066cc)', '&:hover': { background: 'linear-gradient(135deg, #0099cc, #004499)' }, fontSize: 15, fontWeight: 700, mb: 2 }}>
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'SECURE LOGIN'}
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ color: '#64748b' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
        </Typography>

        {/* Demo hint */}
        <Box sx={{ mt: 3, p: 1.5, bgcolor: 'rgba(0,212,255,0.05)', borderRadius: 1, border: '1px solid rgba(0,212,255,0.1)' }}>
          <Typography variant="caption" sx={{ color: '#475569', display: 'block', textAlign: 'center' }}>
            Demo: Register first, then login with your credentials
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
