import { useState, useEffect, useCallback } from 'react'
import {
  Box, Grid, Paper, Typography, Chip, CircularProgress,
  List, ListItem, ListItemText, Divider, LinearProgress
} from '@mui/material'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import ShieldIcon from '@mui/icons-material/Shield'
import BugReportIcon from '@mui/icons-material/BugReport'
import BlockIcon from '@mui/icons-material/Block'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StorageIcon from '@mui/icons-material/Storage'
import PsychologyIcon from '@mui/icons-material/Psychology'
import ApiIcon from '@mui/icons-material/Api'
import { securityAPI } from '../services/api'

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper sx={{ p: 2.5, bgcolor: '#0a1628', border: `1px solid ${color}30`, position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: color }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>{title}</Typography>
        <Typography variant="h4" sx={{ color, fontWeight: 800, my: 0.5, fontFamily: 'JetBrains Mono, monospace' }}>{value ?? '—'}</Typography>
        {subtitle && <Typography variant="caption" sx={{ color: '#475569' }}>{subtitle}</Typography>}
      </Box>
      <Box sx={{ p: 1.5, bgcolor: `${color}15`, borderRadius: 2 }}>{icon}</Box>
    </Box>
  </Paper>
)

const StatusDot = ({ status }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: status === 'UP' ? '#00ff88' : '#ff3366', boxShadow: status === 'UP' ? '0 0 8px #00ff88' : '0 0 8px #ff3366', animation: 'pulse-glow 2s infinite' }} />
    <Typography variant="caption" sx={{ color: status === 'UP' ? '#00ff88' : '#ff3366', fontWeight: 600 }}>{status}</Typography>
  </Box>
)

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [events, setEvents] = useState([])
  const [incidents, setIncidents] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [mRes, eRes, iRes, hRes] = await Promise.allSettled([
        securityAPI.getDashboard(),
        securityAPI.getRecentEvents(120),
        securityAPI.getIncidents(),
        securityAPI.getHealth()
      ])
      if (mRes.status === 'fulfilled') setMetrics(mRes.value.data)
      if (eRes.status === 'fulfilled') setEvents(eRes.value.data.slice(0, 15))
      if (iRes.status === 'fulfilled') setIncidents(iRes.value.data.slice(0, 5))
      if (hRes.status === 'fulfilled') setHealth(hRes.value.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id) }, [load])

  // Build chart data from events
  const eventTimeline = events.slice(0, 10).reverse().map((e, i) => ({
    time: new Date(e.occurredAt).toLocaleTimeString(),
    events: 1,
    severity: e.severity === 'CRITICAL' ? 3 : e.severity === 'HIGH' ? 2 : 1
  }))

  const pieData = [
    { name: 'Normal', value: Math.max((metrics?.totalRequests || 0) - (metrics?.replayAttacksDetected || 0), 0), color: '#00ff88' },
    { name: 'Replay Attacks', value: metrics?.replayAttacksDetected || 0, color: '#ff3366' },
    { name: 'Suspicious', value: Math.max((metrics?.suspiciousRequests || 0) - (metrics?.replayAttacksDetected || 0), 0), color: '#ff8c00' },
  ].filter(d => d.value > 0)

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress sx={{ color: '#00d4ff' }} />
      <Typography sx={{ color: '#64748b' }}>Loading security dashboard...</Typography>
    </Box>
  )

  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700 }}>Security Operations Dashboard</Typography>
          <Typography variant="caption" sx={{ color: '#475569' }}>
            Real-time threat monitoring — Auto-refreshes every 10s
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label="LIVE" size="small" sx={{ bgcolor: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.4)', animation: 'blink 1.5s infinite' }} />
        </Box>
      </Box>

      {/* System Status */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'API Service', status: health?.api || 'CHECKING', icon: <ApiIcon sx={{ color: '#00d4ff', fontSize: 18 }} /> },
          { label: 'ML Service', status: health?.mlService || 'CHECKING', icon: <PsychologyIcon sx={{ color: '#8b5cf6', fontSize: 18 }} /> },
          { label: 'Database', status: metrics ? 'UP' : 'CHECKING', icon: <StorageIcon sx={{ color: '#00ff88', fontSize: 18 }} /> },
        ].map(s => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {s.icon}
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>{s.label}</Typography>
              </Box>
              <StatusDot status={s.status} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}><StatCard title="Total Requests" value={metrics?.totalRequests ?? 0} icon={<ApiIcon sx={{ color: '#00d4ff' }} />} color="#00d4ff" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard title="Exact Replays" value={metrics?.exactReplayAttacks ?? 0} icon={<BugReportIcon sx={{ color: '#ff8c00' }} />} color="#ff8c00" subtitle={`Rule: Nonce/TxID`} /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard title="Adaptive Replays" value={metrics?.adaptiveReplayAttacks ?? 0} icon={<PsychologyIcon sx={{ color: '#8b5cf6' }} />} color="#8b5cf6" subtitle={`AI Behavioral`} /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard title="Traditional Catch" value={metrics?.traditionalDetections ?? 0} icon={<ShieldIcon sx={{ color: '#00ff88' }} />} color="#00ff88" subtitle="Deterministic" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard title="AI Behavioral Catch" value={metrics?.aiDetections ?? 0} icon={<PsychologyIcon sx={{ color: '#00d4ff' }} />} color="#00d4ff" subtitle="Machine Learning" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard title="Incidents" value={metrics?.totalIncidents ?? 0} icon={<BlockIcon sx={{ color: '#ff3366' }} />} color="#ff3366" subtitle={`${metrics?.mitigatedIncidents ?? 0} mitigated`} /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Traffic Distribution Pie */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 280 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>Traffic Classification</Typography>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ bgcolor: '#0a1628', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8 }} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography sx={{ color: '#475569' }}>No data yet — send transactions to populate</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Event Timeline */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 280 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>Security Event Timeline</Typography>
            {eventTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={eventTimeline}>
                  <defs>
                    <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.08)" />
                  <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip contentStyle={{ bgcolor: '#0a1628', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="severity" stroke="#00d4ff" fill="url(#evGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography sx={{ color: '#475569' }}>No events yet — use the Attack Simulator to generate events</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Latest Incidents + Attack Timeline */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>Recent Incidents</Typography>
            {incidents.length === 0 ? (
              <Typography sx={{ color: '#475569', fontSize: 13, py: 2, textAlign: 'center' }}>No incidents yet</Typography>
            ) : (
              <List dense disablePadding>
                {incidents.map((inc, i) => (
                  <Box key={inc.id}>
                    <ListItem disablePadding sx={{ py: 0.8 }}>
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BugReportIcon sx={{ color: '#ff3366', fontSize: 16 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{inc.incidentId}</Typography>
                          <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: 10 }}>{inc.attackType} · Risk: {inc.riskScore?.toFixed(1)}</Typography>
                        </Box>
                        <Chip label={inc.status} size="small" sx={{ height: 18, fontSize: 9, bgcolor: inc.status === 'MITIGATED' ? 'rgba(0,255,136,0.1)' : 'rgba(255,140,0,0.1)', color: inc.status === 'MITIGATED' ? '#00ff88' : '#ff8c00' }} />
                      </Box>
                    </ListItem>
                    {i < incidents.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>Attack Timeline</Typography>
            <List dense disablePadding>
              {events.slice(0, 8).map((ev, i) => (
                <Box key={ev.id}>
                  <ListItem disablePadding sx={{ py: 0.8 }}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box sx={{ mt: 0.3 }}>
                        {ev.severity === 'CRITICAL' ? <BugReportIcon sx={{ color: '#ff3366', fontSize: 14 }} /> :
                         ev.severity === 'HIGH' ? <WarningIcon sx={{ color: '#ff8c00', fontSize: 14 }} /> :
                         <CheckCircleIcon sx={{ color: '#00ff88', fontSize: 14 }} />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                          {new Date(ev.occurredAt).toLocaleTimeString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#e2e8f0', display: 'block', fontSize: 11 }}>
                          {ev.description?.substring(0, 60)}{ev.description?.length > 60 ? '...' : ''}
                        </Typography>
                      </Box>
                      <Chip label={ev.eventType} size="small" sx={{ height: 16, fontSize: 8, bgcolor: 'rgba(0,212,255,0.1)', color: '#00d4ff' }} />
                    </Box>
                  </ListItem>
                  {i < 7 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                </Box>
              ))}
              {events.length === 0 && (
                <Typography sx={{ color: '#475569', fontSize: 13, py: 2, textAlign: 'center' }}>No events yet</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
