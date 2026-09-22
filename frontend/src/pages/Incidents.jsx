import { useState, useEffect } from 'react'
import { Box, Paper, Typography, Chip, CircularProgress, Grid, Divider } from '@mui/material'
import BugReportIcon from '@mui/icons-material/BugReport'
import { securityAPI } from '../services/api'

const severityColor = s => ({ CRITICAL:'#ff3366', HIGH:'#ff8c00', SUSPICIOUS:'#ffcc00', NORMAL:'#00ff88' }[s] || '#94a3b8')

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    securityAPI.getIncidents().then(r => { setIncidents(r.data); setLoading(false) }).catch(() => setLoading(false))
    const id = setInterval(() => securityAPI.getIncidents().then(r => setIncidents(r.data)).catch(() => {}), 10000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress sx={{ color:'#ff3366' }} /></Box>

  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <BugReportIcon sx={{ color: '#ff3366', fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700 }}>Security Incident Management</Typography>
          <Typography variant="caption" sx={{ color: '#475569' }}>Forensic evidence and incident tracking — auto-refreshes every 10s</Typography>
        </Box>
        <Chip label={`${incidents.length} TOTAL`} size="small" sx={{ ml: 'auto', bgcolor: 'rgba(255,51,102,0.1)', color: '#ff3366' }} />
      </Box>

      {incidents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <BugReportIcon sx={{ fontSize: 48, color: '#1e3a5f', mb: 2 }} />
          <Typography sx={{ color: '#475569' }}>No incidents yet — run the Attack Simulator to generate incidents</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {/* List */}
          <Grid item xs={12} md={selected ? 5 : 12}>
            {incidents.map(inc => (
              <Paper key={inc.id} onClick={() => setSelected(inc)}
                sx={{ p: 2, mb: 1.5, cursor: 'pointer', border: selected?.id === inc.id ? `1px solid ${severityColor(inc.severity)}` : '1px solid rgba(255,255,255,0.05)',
                  '&:hover': { border: `1px solid ${severityColor(inc.severity)}40` }, transition: 'border 0.2s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ width: 4, height: 40, bgcolor: severityColor(inc.severity), borderRadius: 1, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{inc.incidentId}</Typography>
                      <Chip label={inc.severity} size="small" sx={{ height: 16, fontSize: 9, bgcolor: `${severityColor(inc.severity)}15`, color: severityColor(inc.severity) }} />
                      <Chip label={inc.status} size="small" sx={{ height: 16, fontSize: 9, bgcolor: inc.status === 'MITIGATED' ? 'rgba(0,255,136,0.1)' : 'rgba(255,140,0,0.1)', color: inc.status === 'MITIGATED' ? '#00ff88' : '#ff8c00' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: 11 }}>
                      {inc.attackType} · TX: {inc.transactionId} · Risk: {inc.riskScore?.toFixed(1)} · Conf: {(inc.confidence * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#334155', fontSize: 10, flexShrink: 0 }}>
                    {new Date(inc.detectedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Grid>

          {/* Detail panel */}
          {selected && (
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, border: `1px solid ${severityColor(selected.severity)}30`, position: 'sticky', top: 16 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: severityColor(selected.severity), fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{selected.incidentId}</Typography>
                  <Chip label={selected.status} sx={{ bgcolor: `${severityColor(selected.severity)}15`, color: severityColor(selected.severity), fontWeight: 700 }} />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {[['Attack Type', selected.attackType], ['Severity', selected.severity], ['Risk Score', `${selected.riskScore?.toFixed(2)}/100`], ['Confidence', `${(selected.confidence*100).toFixed(1)}%`], ['Transaction', selected.transactionId], ['User ID', selected.userId], ['Source IP', selected.sourceIp || 'N/A'], ['Action Taken', selected.actionTaken]].map(([k,v]) => (
                    <Grid item xs={6} key={k}>
                      <Typography variant="caption" sx={{ color: '#475569' }}>{k}</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, wordBreak: 'break-all' }}>{v}</Typography>
                    </Grid>
                  ))}
                </Grid>
                {selected.explanation && (
                  <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1, mb: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, fontWeight: 600 }}>AI Explanation</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.7 }}>{selected.explanation}</Typography>
                  </Box>
                )}
                {selected.evidenceJson && (() => {
                  try {
                    const ev = JSON.parse(selected.evidenceJson)
                    return (
                      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 1, fontWeight: 600 }}>Forensic Evidence</Typography>
                        <pre style={{ color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {JSON.stringify(ev, null, 2)}
                        </pre>
                      </Box>
                    )
                  } catch { return null }
                })()}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}
