import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress, InputAdornment } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const field = (id, label, type, icon, key) => (
    <TextField fullWidth id={id} label={label} type={type} value={form[key]}
      onChange={e => setForm({ ...form, [key]: e.target.value })} required
      InputProps={{ startAdornment: <InputAdornment position="start">{icon}</InputAdornment> }}
      sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(0,212,255,0.2)' }, '&:hover fieldset': { borderColor: '#00d4ff' } } }} />
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050b14', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

      <Paper sx={{ width: '100%', maxWidth: 420, p: 4, bgcolor: '#0a1628', border: '1px solid rgba(0,212,255,0.2)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #00ff88, #00d4ff, #8b5cf6)' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(0,255,136,0.1)', borderRadius: '50%', border: '2px solid rgba(0,255,136,0.3)', mb: 2 }}>
            <ShieldIcon sx={{ color: '#00ff88', fontSize: 40 }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#00ff88', fontWeight: 700 }}>Create Account</Typography>
          <Typography variant="caption" sx={{ color: '#475569' }}>Join the AI Defense Lab</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff3366' }}>{error}</Alert>}

        <form onSubmit={handleSubmit} id="register-form">
          {field('reg-username', 'Username', 'text', <PersonIcon sx={{ color: '#00ff88', fontSize: 18 }} />, 'username')}
          {field('reg-email', 'Email', 'email', <EmailIcon sx={{ color: '#00ff88', fontSize: 18 }} />, 'email')}
          {field('reg-password', 'Password', 'password', <LockIcon sx={{ color: '#00ff88', fontSize: 18 }} />, 'password')}
          {field('reg-confirm', 'Confirm Password', 'password', <LockIcon sx={{ color: '#00ff88', fontSize: 18 }} />, 'confirm')}

          <Button type="submit" id="register-btn" fullWidth variant="contained" disabled={loading}
            sx={{ py: 1.4, background: 'linear-gradient(135deg, #00ff88, #00aa55)', color: '#000', '&:hover': { background: 'linear-gradient(135deg, #00cc66, #008844)' }, fontSize: 15, fontWeight: 700, mb: 2 }}>
            {loading ? <CircularProgress size={20} /> : 'CREATE ACCOUNT'}
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
