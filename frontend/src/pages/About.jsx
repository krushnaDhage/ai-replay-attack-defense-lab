import { Box, Paper, Grid, Typography, Chip, Divider } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'
import SchoolIcon from '@mui/icons-material/School'

export default function About() {
  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ShieldIcon sx={{ color: '#00d4ff', fontSize: 36 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>AI-Based Replay Attack Detection, Explanation & Automated Response Lab</Typography>
          <Typography variant="caption" sx={{ color: '#475569' }}>Educational Cybersecurity Laboratory — College Project Demonstration</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#00d4ff', fontWeight: 700, mb: 2 }}>Project Overview</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.9 }}>
              This platform is a complete, end-to-end educational cybersecurity laboratory demonstrating how AI and traditional security techniques can be combined to detect, explain, and automatically respond to replay attacks.
              <br /><br />
              The system is built as a realistic microservice architecture: a React frontend, a Spring Boot backend with full replay protection, a Python ML service running a trained Random Forest classifier, and a PostgreSQL database persisting all transactions, events, and forensic incidents.
              <br /><br />
              All attack simulations are performed ONLY against the application's own local demo API — never against external systems.
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#00ff88', fontWeight: 700, mb: 2 }}>Demo Flow (Final Demonstration)</Typography>
            {[
              'Login as a normal user',
              'Open Transaction Simulator → send a legitimate transaction',
              'View SUCCESS response with security details',
              'Open Attack Simulator → capture the request',
              'Click "SIMULATE REPLAY ATTACK" — the captured request is sent again to the local API',
              'Watch the animated security gateway receive the duplicate request',
              'Traditional checks flag: TX ID reuse + Nonce reuse + Stale timestamp',
              'ML features extracted → sent to Python FastAPI → Random Forest predicts REPLAY_ATTACK',
              'Risk score calculated (typically 85–97) → CRITICAL severity',
              'AI explanation generated from structured evidence',
              'Response engine selects: BLOCK + INVALIDATE_NONCE + CREATE_INCIDENT',
              'Security incident created with full forensic evidence',
              'Dashboard updates: attacks blocked counter increments',
              'Send a new legitimate transaction → shows normal traffic still works',
              'View AI Analysis page → see feature importance from trained model',
              'View Incidents page → forensic evidence record',
            ].map((step, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, minWidth: 24 }}>{String(i+1).padStart(2,'0')}</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>{step}</Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3, bgcolor: 'rgba(255,140,0,0.03)', border: '1px solid rgba(255,140,0,0.15)' }}>
            <Typography variant="subtitle1" sx={{ color: '#ff8c00', fontWeight: 700, mb: 1 }}>Limitations & Honest Disclosures</Typography>
            {[
              'ML model trained on SYNTHETIC data — metrics (accuracy, F1) are on the synthetic test set, not real-world traffic',
              'Perfect classifier accuracy is expected and expected on synthetic data with clearly separated feature distributions',
              'LLM explanation integration is disabled by default — deterministic rule-based explainer is used',
              'The Isolation Forest anomaly scores supplement but do not replace the Random Forest classifier',
              'This is an educational demonstration, not a production security system',
            ].map((lim, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: '#ff8c00', flexShrink: 0 }}>⚠</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.6 }}>{lim}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2, fontWeight: 700 }}>Key Features</Typography>
            {[
              ['Real ML Detection', '#00d4ff'],
              ['4-Layer Replay Protection', '#00d4ff'],
              ['Automated Response Engine', '#00ff88'],
              ['Forensic Incident Logging', '#8b5cf6'],
              ['Live Dashboard Metrics', '#00d4ff'],
              ['Feature Importance Display', '#8b5cf6'],
              ['AI Explanation Generator', '#8b5cf6'],
              ['Before vs After Demo', '#ff8c00'],
              ['Full API Documentation', '#94a3b8'],
              ['Docker Compose Deploy', '#94a3b8'],
            ].map(([f, c]) => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>{f}</Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2, fontWeight: 700 }}>Quick Start</Typography>
            {[
              ['1. Start PostgreSQL', 'docker compose up postgres -d'],
              ['2. Train ML Model', 'cd ml-service && python train.py'],
              ['3. Start ML Service', 'uvicorn app.main:app --port 8000'],
              ['4. Start Backend', 'mvn spring-boot:run (in backend/)'],
              ['5. Start Frontend', 'npm run dev (in frontend/)'],
              ['6. Open Browser', 'http://localhost:5173'],
              ['Full Docker Deploy', 'docker compose up --build'],
            ].map(([step, cmd]) => (
              <Box key={step} sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: 10 }}>{step}</Typography>
                <Box sx={{ px: 1.5, py: 0.8, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#00ff88' }}>
                  {cmd}
                </Box>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2, fontWeight: 700 }}>Detection Flow Summary</Typography>
            <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 700, display: 'block', mb: 1 }}>
              ATTACK → OBSERVE → DETECT → EXPLAIN → DECIDE → MITIGATE → VERIFY
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {[
              ['Traditional', 'TX ID, Nonce, Timestamp, Fingerprint'],
              ['ML', 'Random Forest on 10 behavioral features'],
              ['Risk', '0–100 score → 4 severity levels'],
              ['Explain', 'Deterministic evidence-based explanation'],
              ['Respond', 'Predefined policy per severity level'],
              ['Store', 'PostgreSQL forensic incident record'],
            ].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <Typography variant="caption" sx={{ color: '#475569', minWidth: 70 }}>{k}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'right', fontSize: 10 }}>{v}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
