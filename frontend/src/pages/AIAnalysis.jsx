import { useState, useEffect } from 'react'
import { Box, Paper, Grid, Typography, Chip, CircularProgress, Divider } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PsychologyIcon from '@mui/icons-material/Psychology'
import { mlAPI, securityAPI } from '../services/api'

const FEATURE_COLORS = ['#00d4ff','#8b5cf6','#ff8c00','#00ff88','#ff3366','#ffcc00','#00bcd4','#e91e63','#9c27b0','#4caf50','#3f51b5','#009688','#cddc39','#ff9800','#795548']

export default function AIAnalysis() {
  const [mlMetrics, setMlMetrics] = useState(null)
  const [featureImportance, setFeatureImportance] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      mlAPI.getMetrics(),
      mlAPI.getFeatures(),
      securityAPI.getIncidents()
    ]).then(([m, f, i]) => {
      if (m.status === 'fulfilled') setMlMetrics(m.value.data)
      if (f.status === 'fulfilled') {
        const fi = f.value.data.featureImportance
        const data = Object.entries(fi).map(([name, value]) => ({ name, value: parseFloat((value * 100).toFixed(2)) }))
          .sort((a, b) => b.value - a.value)
        setFeatureImportance(data)
      }
      if (i.status === 'fulfilled') setIncidents(i.value.data.slice(0, 5))
      setLoading(false)
    })
  }, [])

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress sx={{ color:'#8b5cf6' }} /></Box>

  const metricCards = mlMetrics ? [
    { label: 'Accuracy', value: `${(mlMetrics.accuracy * 100).toFixed(1)}%`, color: '#00ff88' },
    { label: 'Precision', value: `${(mlMetrics.precision_weighted * 100).toFixed(1)}%`, color: '#00d4ff' },
    { label: 'Recall', value: `${(mlMetrics.recall_weighted * 100).toFixed(1)}%`, color: '#8b5cf6' },
    { label: 'F1-Score', value: `${(mlMetrics.f1_weighted * 100).toFixed(1)}%`, color: '#ff8c00' },
    { label: 'CV F1 Mean', value: `${(mlMetrics.cv_f1_mean * 100).toFixed(1)}%`, color: '#ffcc00' },
    { label: 'Dataset Size', value: mlMetrics.dataset_size, color: '#94a3b8' },
  ] : []

  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700 }}>AI Analysis & Model Transparency</Typography>
        <Typography variant="caption" sx={{ color: '#475569' }}>
          Dual Model Ensemble: Random Forest (Supervised Classification) + Isolation Forest (Unsupervised Behavioral Anomaly Detection)
        </Typography>
        <Chip label="EDUCATIONAL LAB MODEL" size="small" sx={{ ml: 2, bgcolor: 'rgba(255,140,0,0.1)', color: '#ff8c00', fontSize: 10 }} />
      </Box>

      {mlMetrics && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(255,140,0,0.05)', border: '1px solid rgba(255,140,0,0.2)' }}>
          <Typography variant="caption" sx={{ color: '#ff8c00' }}>
            ⚠ DISCLAIMER: {mlMetrics.disclaimer}
          </Typography>
        </Paper>
      )}

      {/* ML Metrics */}
      {mlMetrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {metricCards.map(m => (
            <Grid item xs={6} sm={4} md={2} key={m.label}>
              <Paper sx={{ p: 2, textAlign: 'center', border: `1px solid ${m.color}30` }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</Typography>
                <Typography variant="h5" sx={{ color: m.color, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', mt: 0.5 }}>{m.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Feature Importance Chart */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PsychologyIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Behavioral & Structural Feature Importance (15 Features)</Typography>
            </Box>
            {featureImportance ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={featureImportance} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={180} />
                  <Tooltip contentStyle={{ bgcolor: '#0a1628', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8 }}
                    formatter={v => [`${v}%`, 'Importance']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {featureImportance.map((_, i) => <Cell key={i} fill={FEATURE_COLORS[i % FEATURE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography sx={{ color: '#475569' }}>Start ML service to load feature importance</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Model Info + Classes */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#00d4ff', mb: 2 }}>Model Architecture & Config</Typography>
            {[
              ['Supervised Algorithm', 'Random Forest Classifier (200 trees)'],
              ['Unsupervised Model', 'Isolation Forest (Contamination 0.08)'],
              ['Feature Vector Size', '15 features (Behavioral + Metadata)'],
              ['Target Classes', 'NORMAL / SUSPICIOUS / SUSPICIOUS_BEHAVIOR / REPLAY_ATTACK'],
              ['Training Set Size', `${mlMetrics?.train_size ?? '1,760'} samples`],
              ['Test Set Size', `${mlMetrics?.test_size ?? '440'} samples`],
              ['Validation Strategy', 'Stratified 5-Fold Cross Validation'],
              ['Explanation Model', 'SHAP-inspired feature attribution'],
            ].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>{k}</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'right', maxWidth: 200, fontWeight: 600 }}>{v}</Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#00d4ff', mb: 2 }}>Security Risk Classification Scale</Typography>
            {[
              { range: '0 – 30', label: 'NORMAL', color: '#00ff88', desc: 'Legitimate request — Allow transaction' },
              { range: '31 – 60', label: 'SUSPICIOUS', color: '#ffcc00', desc: 'Minor anomaly — Flag & monitor' },
              { range: '61 – 80', label: 'SUSPICIOUS_BEHAVIOR', color: '#ff8c00', desc: 'Adaptive Replay / Rapid Burst — Throttle & Lock' },
              { range: '81 – 100', label: 'REPLAY_ATTACK', color: '#ff3366', desc: 'Exact Replay / Heavy Abuse — Block + Incident' },
            ].map(r => (
              <Box key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <Box sx={{ width: 4, height: 32, bgcolor: r.color, borderRadius: 1, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: r.color, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{r.label}</Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: 10 }}>{r.range} — {r.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Recent Incident Analysis */}
        {incidents.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>Forensic Incident Analysis Log</Typography>
              {incidents.map(inc => (
                <Box key={inc.id} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,51,102,0.04)', borderRadius: 1, border: '1px solid rgba(255,51,102,0.12)' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={inc.incidentId} size="small" sx={{ bgcolor: 'rgba(255,51,102,0.1)', color: '#ff3366', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
                    <Chip label={inc.attackType} size="small" sx={{ bgcolor: 'rgba(139,92,246,0.1)', color: '#8b5cf6', fontSize: 10 }} />
                    <Chip label={`Method: ${inc.detectionMethod || 'TRADITIONAL'}`} size="small" sx={{ bgcolor: inc.detectionMethod === 'BEHAVIORAL_AI' ? 'rgba(139,92,246,0.2)' : 'rgba(255,140,0,0.2)', color: inc.detectionMethod === 'BEHAVIORAL_AI' ? '#8b5cf6' : '#ff8c00', fontSize: 10, fontWeight: 700 }} />
                    <Chip label={`Risk: ${inc.riskScore?.toFixed(1)}`} size="small" sx={{ bgcolor: 'rgba(255,140,0,0.1)', color: '#ff8c00', fontSize: 10 }} />
                    <Chip label={`Conf: ${((inc.confidence || 0) * 100).toFixed(1)}%`} size="small" sx={{ bgcolor: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontSize: 10 }} />
                    <Chip label={inc.status} size="small" sx={{ bgcolor: 'rgba(0,255,136,0.1)', color: '#00ff88', fontSize: 10 }} />
                  </Box>
                  {inc.explanation && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>{inc.explanation}</Typography>
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
