import { Box, Paper, Grid, Typography, Chip, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import ShieldIcon from '@mui/icons-material/Shield'
import BlockIcon from '@mui/icons-material/Block'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import SpeedIcon from '@mui/icons-material/Speed'
import PsychologyIcon from '@mui/icons-material/Psychology'

const FlowStep = ({ label, color, icon }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
    <Box sx={{ px: 2.5, py: 1.2, bgcolor: `${color}15`, border: `1px solid ${color}40`, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, minWidth: 180, justifyContent: 'center' }}>
      {icon}
      <Typography variant="caption" sx={{ color, fontWeight: 600, fontSize: 12 }}>{label}</Typography>
    </Box>
  </Box>
)

const Arrow = ({ color = '#00d4ff' }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
    <ArrowDownwardIcon sx={{ color, fontSize: 18 }} />
  </Box>
)

export default function BeforeAfter() {
  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 0.5 }}>Before vs After Dual-Layer AI Defense</Typography>
      <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 3 }}>
        Comparing how traditional security vs Behavioral AI handles both Exact Replay and Adaptive Replay attacks
      </Typography>

      <Grid container spacing={3}>
        {/* WITHOUT Protection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,51,102,0.3)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <ErrorIcon sx={{ color: '#ff3366', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#ff3366', fontWeight: 700 }}>TRADITIONAL SECURITY ONLY</Typography>
                <Typography variant="caption" sx={{ color: '#475569' }}>Standard auth + static duplicate checks</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Scenario 1: Exact Duplicate Replay</Typography>
              <FlowStep label="Attacker replays exact Tx & Nonce" color="#ff8c00" icon={null} />
              <Arrow color="#ff8c00" />
              <FlowStep label="Deterministic Nonce Lookup" color="#00d4ff" icon={null} />
              <Arrow color="#ff8c00" />
              <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: 2, textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#ff8c00', fontWeight: 700 }}>✓ Blocked by Nonce Reuse Rule (AI not needed)</Typography>
              </Box>

              <Divider sx={{ mb: 3, borderColor: 'rgba(255,51,102,0.2)' }} />

              <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 600, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Scenario 2: Adaptive Behavioral Replay</Typography>
              <FlowStep label="Attacker generates FRESH Nonce & Tx ID" color="#ff3366" icon={<SpeedIcon sx={{ color: '#ff3366', fontSize: 16 }} />} />
              <Arrow color="#ff3366" />
              <FlowStep label="Traditional Duplicate Checks PASS" color="#00ff88" icon={null} />
              <Arrow color="#ff3366" />
              <Box sx={{ px: 2, py: 1.2, bgcolor: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.4)', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 700 }}>✗ BYPASSED TRADITIONAL CHECKS ← FRAUD EXECUTED!</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,51,102,0.05)', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 600 }}>Vulnerability Root Cause:</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, lineHeight: 1.6 }}>
                Deterministic duplicate filters only check past nonces and identical transaction IDs. When attackers adapt by generating unique nonces and valid timestamps, traditional rules fail completely.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* WITH Dual-Layer AI Defense */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(0,255,136,0.3)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <ShieldIcon sx={{ color: '#00ff88', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 700 }}>DUAL-LAYER AI DEFENSE</Typography>
                <Typography variant="caption" sx={{ color: '#475569' }}>Deterministic filters + Behavioral ML Engine</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Scenario 1: Exact Duplicate Replay</Typography>
              <FlowStep label="Exact Replay Attempt" color="#ff8c00" icon={null} />
              <Arrow color="#00d4ff" />
              <FlowStep label="Tier 1: Nonce / TxID Check" color="#00d4ff" icon={null} />
              <Arrow color="#00ff88" />
              <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 2, textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 700 }}>✓ Blocked instantly at Tier 1 (Fast & Deterministic)</Typography>
              </Box>

              <Divider sx={{ mb: 3, borderColor: 'rgba(0,255,136,0.2)' }} />

              <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 600, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Scenario 2: Adaptive Behavioral Replay</Typography>
              <FlowStep label="Attacker sends Fresh Nonce & Tx ID" color="#8b5cf6" icon={<SpeedIcon sx={{ color: '#8b5cf6', fontSize: 16 }} />} />
              <Arrow color="#8b5cf6" />
              <FlowStep label="Tier 1 Passes → Tier 2 ML Evaluation" color="#8b5cf6" icon={<PsychologyIcon sx={{ color: '#8b5cf6', fontSize: 16 }} />} />
              <Arrow color="#ff3366" />
              <Box sx={{ px: 2, py: 1.2, bgcolor: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.4)', borderRadius: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <BlockIcon sx={{ color: '#ff3366', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 700 }}>BEHAVIORAL ANOMALY DETECTED → BLOCKED & MITIGATED</Typography>
                  <ShieldIcon sx={{ color: '#00ff88', fontSize: 16 }} />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(0,255,136,0.05)', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 600 }}>Why Dual-Layer Defense Wins:</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, lineHeight: 1.6 }}>
                Tier 1 stops simple exact duplicates instantly without loading ML models. Tier 2 Behavioral ML inspects 15 feature anomaly metrics (0.2s inter-request interval, frequency, sequence index) to stop advanced adaptive replays.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Protection Layer Comparison Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Protection Layer Matrix</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Attack Type', 'Traditional Checks Only', 'Behavioral AI Defense', 'Key Detection Indicator'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Exact Duplicate Replay', '✓ BLOCKED (Duplicate Nonce)', '✓ BLOCKED (Tier 1 Rule)', 'Identical Nonce / Tx ID reuse'],
                    ['Stale Timestamp Replay', '✓ BLOCKED (Expired Window)', '✓ BLOCKED (Tier 1 Rule)', 'Timestamp age > 300s window'],
                    ['Adaptive Rapid Burst Replay', '✗ BYPASSED (Fresh Nonce)', '✓ BLOCKED (Tier 2 Behavioral AI)', 'Inter-request interval 0.2s / Frequency 12 req/min'],
                    ['Out-of-Sequence Workflow', '✗ BYPASSED (Valid JWT)', '✓ BLOCKED (Sequence Anomaly)', 'Sequence Deviation Index 0.85'],
                    ['Device & Session Deviation', '✗ BYPASSED (No Device Check)', '✓ BLOCKED (Device Anomaly)', 'Unrecognized Device Fingerprint Hash'],
                  ].map(([attack, trad, ai, indicator], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 16px', color: '#e2e8f0', fontWeight: 600 }}>{attack}</td>
                      <td style={{ padding: '10px 16px', color: trad.startsWith('✗') ? '#ff3366' : '#00ff88' }}>{trad}</td>
                      <td style={{ padding: '10px 16px', color: '#00ff88', fontWeight: 700 }}>{ai}</td>
                      <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 12 }}>{indicator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
