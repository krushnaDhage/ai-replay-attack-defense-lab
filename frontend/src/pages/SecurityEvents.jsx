import { useState, useEffect } from 'react'
import { Box, Paper, Typography, Chip, CircularProgress, TextField, InputAdornment } from '@mui/material'
import TimelineIcon from '@mui/icons-material/Timeline'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import BugReportIcon from '@mui/icons-material/BugReport'
import InfoIcon from '@mui/icons-material/Info'
import { securityAPI } from '../services/api'

const iconFor = sev => ({
  CRITICAL: <BugReportIcon sx={{ color: '#ff3366', fontSize: 16 }} />,
  HIGH: <WarningIcon sx={{ color: '#ff8c00', fontSize: 16 }} />,
  WARNING: <WarningIcon sx={{ color: '#ff8c00', fontSize: 16 }} />,
  INFO: <InfoIcon sx={{ color: '#00d4ff', fontSize: 16 }} />,
  NORMAL: <CheckCircleIcon sx={{ color: '#00ff88', fontSize: 16 }} />,
})[sev] || <InfoIcon sx={{ color: '#64748b', fontSize: 16 }} />

const chipColor = sev => ({
  CRITICAL: { bg: 'rgba(255,51,102,0.1)', text: '#ff3366' },
  HIGH: { bg: 'rgba(255,140,0,0.1)', text: '#ff8c00' },
  SUSPICIOUS: { bg: 'rgba(255,204,0,0.1)', text: '#ffcc00' },
  NORMAL: { bg: 'rgba(0,255,136,0.1)', text: '#00ff88' },
  INFO: { bg: 'rgba(0,212,255,0.1)', text: '#00d4ff' },
})[sev] || { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' }

export default function SecurityEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    securityAPI.getEvents().then(r => { setEvents(r.data); setLoading(false) }).catch(() => setLoading(false))
    const id = setInterval(() => securityAPI.getEvents().then(r => setEvents(r.data)).catch(() => {}), 8000)
    return () => clearInterval(id)
  }, [])

  const filtered = events.filter(e =>
    !search || e.eventType?.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.transactionId?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress sx={{ color:'#00d4ff' }} /></Box>

  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TimelineIcon sx={{ color: '#00d4ff', fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700 }}>Security Events Timeline</Typography>
          <Typography variant="caption" sx={{ color: '#475569' }}>Real-time audit trail — auto-refreshes every 8s</Typography>
        </Box>
        <Chip label={`${events.length} EVENTS`} size="small" sx={{ ml: 'auto', bgcolor: 'rgba(0,212,255,0.1)', color: '#00d4ff' }} />
      </Box>

      <TextField fullWidth placeholder="Search events by type, description, or TX ID..." value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#475569' }} /></InputAdornment> }}
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(0,212,255,0.15)' } } }} />

      {filtered.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <TimelineIcon sx={{ fontSize: 48, color: '#1e3a5f', mb: 2 }} />
          <Typography sx={{ color: '#475569' }}>
            {events.length === 0 ? 'No events yet — send transactions to generate events' : 'No events match your search'}
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          {filtered.map((ev, i) => {
            const c = chipColor(ev.severity)
            return (
              <Box key={ev.id} sx={{ display: 'flex', gap: 2, px: 2, py: 1.5, borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, alignItems: 'flex-start' }}>
                {/* Time */}
                <Typography variant="caption" sx={{ color: '#334155', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, pt: 0.3, minWidth: 70, flexShrink: 0 }}>
                  {new Date(ev.occurredAt).toLocaleTimeString()}
                </Typography>
                {/* Icon */}
                <Box sx={{ pt: 0.3, flexShrink: 0 }}>{iconFor(ev.severity)}</Box>
                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 0.3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label={ev.eventType} size="small" sx={{ height: 18, fontSize: 9, bgcolor: c.bg, color: c.text, fontFamily: 'JetBrains Mono, monospace' }} />
                    {ev.transactionId && (
                      <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                        TX: {ev.transactionId}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.5 }}>
                    {ev.description}
                  </Typography>
                </Box>
                {/* Severity */}
                <Chip label={ev.severity} size="small" sx={{ height: 18, fontSize: 9, bgcolor: c.bg, color: c.text, flexShrink: 0 }} />
              </Box>
            )
          })}
        </Paper>
      )}
    </Box>
  )
}
