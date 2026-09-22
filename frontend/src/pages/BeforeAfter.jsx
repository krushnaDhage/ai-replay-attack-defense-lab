import { Box, Paper, Grid, Typography, Chip, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import ShieldIcon from '@mui/icons-material/Shield'
import BlockIcon from '@mui/icons-material/Block'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

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
      <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 0.5 }}>Before vs After AI Defense</Typography>
      <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 3 }}>
        Comparing how replay attacks succeed without protection, vs how AI stops them
      </Typography>

      <Grid container spacing={3}>
        {/* WITHOUT Protection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,51,102,0.3)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <ErrorIcon sx={{ color: '#ff3366', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#ff3366', fontWeight: 700 }}>WITHOUT PROTECTION</Typography>
                <Typography variant="caption" sx={{ color: '#475569' }}>Traditional auth only — vulnerable to replay</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Legitimate Transaction</Typography>
              <FlowStep label="User sends Request" color="#94a3b8" icon={null} />
              <Arrow />
              <FlowStep label="Server (Auth only)" color="#94a3b8" icon={null} />
              <Arrow />
              <Box sx={{ px: 2.5, py: 1.2, bgcolor: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 2, textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 700 }}>✓ Transaction Executed</Typography>
              </Box>

              <Divider sx={{ mb: 3, borderColor: 'rgba(255,51,102,0.2)' }} />

              <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 600, display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Replay Attack</Typography>
              <FlowStep label="Attacker Replays Request" color="#ff3366" icon={null} />
              <Arrow color="#ff3366" />
              <FlowStep label="Server (Auth only)" color="#94a3b8" icon={null} />
              <Arrow color="#ff3366" />
              <Box sx={{ px: 2.5, py: 1.2, bgcolor: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.4)', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 700 }}>✗ Transaction Executed AGAIN ← FRAUD</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,51,102,0.05)', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 600 }}>Why it fails:</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, lineHeight: 1.6 }}>
                Traditional authentication verifies identity but not freshness. A valid signed token stays valid for its entire lifetime, so an intercepted request can be replayed successfully multiple times.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* WITH AI Protection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(0,255,136,0.3)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <ShieldIcon sx={{ color: '#00ff88', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 700 }}>WITH AI DEFENSE</Typography>
                <Typography variant="caption" sx={{ color: '#475569' }}>Nonce + timestamp + ML detection</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Legitimate Transaction</Typography>
              <FlowStep label="User sends Request" color="#94a3b8" icon={null} />
              <Arrow />
              <FlowStep label="Security Gateway" color="#00d4ff" icon={null} />
              <Arrow />
              <FlowStep label="Nonce + Timestamp Check" color="#00d4ff" icon={null} />
              <Arrow />
              <Box sx={{ px: 2.5, py: 1.2, bgcolor: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 2, textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 700 }}>✓ Transaction Executed</Typography>
              </Box>

              <Divider sx={{ mb: 3, borderColor: 'rgba(0,255,136,0.2)' }} />

              <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 600, display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Replay Attack Attempt</Typography>
              <FlowStep label="Attacker Replays Request" color="#ff3366" icon={null} />
              <Arrow color="#ff3366" />
              <FlowStep label="Security Gateway" color="#00d4ff" icon={null} />
              <Arrow />
              <FlowStep label="Traditional Checks FAIL" color="#ff8c00" icon={null} />
              <Arrow />
              <FlowStep label="ML Detection → 97% Risk" color="#8b5cf6" icon={null} />
              <Arrow color="#ff3366" />
              <Box sx={{ px: 2.5, py: 1.2, bgcolor: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.4)', borderRadius: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <BlockIcon sx={{ color: '#ff3366', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 700 }}>BLOCKED + Incident Created</Typography>
                  <ShieldIcon sx={{ color: '#00ff88', fontSize: 16 }} />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(0,255,136,0.05)', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 600 }}>Why it succeeds:</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, lineHeight: 1.6 }}>
                Multi-layer defence: unique nonces prevent replay, timestamps enforce freshness windows, and the Random Forest ML model detects behavioral anomalies even if individual checks are bypassed.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Comparison Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Protection Layer Comparison</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Protection Layer', 'Without Defense', 'With AI Defense', 'How it Works'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Authentication', '✓ Password/JWT', '✓ Password/JWT', 'Verifies identity'],
                    ['Nonce Check', '✗ Missing', '✓ Per-request unique nonce', 'Prevents exact request reuse'],
                    ['Timestamp Check', '✗ Missing', '✓ 5-minute freshness window', 'Prevents stale replays'],
                    ['TX ID Dedup', '✗ Missing', '✓ Stored & checked', 'Blocks identical transaction IDs'],
                    ['Request Fingerprint', '✗ Missing', '✓ SHA-256 hash', 'Detects identical request content'],
                    ['ML Detection', '✗ Missing', '✓ Random Forest (10 features)', 'Detects behavioral anomalies'],
                    ['Auto Response', '✗ Manual', '✓ Deterministic policy engine', 'Instant mitigation without human delay'],
                    ['Incident Logging', '✗ None', '✓ Forensic evidence stored', 'Full audit trail for investigation'],
                  ].map(([layer, without, withDef, how], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 16px', color: '#e2e8f0', fontWeight: 500 }}>{layer}</td>
                      <td style={{ padding: '10px 16px', color: without.startsWith('✗') ? '#ff3366' : '#00ff88' }}>{without}</td>
                      <td style={{ padding: '10px 16px', color: '#00ff88' }}>{withDef}</td>
                      <td style={{ padding: '10px 16px', color: '#64748b', fontSize: 12 }}>{how}</td>
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
