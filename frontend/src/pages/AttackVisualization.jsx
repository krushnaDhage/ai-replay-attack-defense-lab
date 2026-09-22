import { Box, Paper, Grid, Typography, Chip, Divider } from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

const Node = ({ label, sublabel, color, icon }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
    <Box sx={{ px: 2.5, py: 1.5, bgcolor: `${color}12`, border: `1.5px solid ${color}50`, borderRadius: 2, textAlign: 'center', minWidth: 140, boxShadow: `0 0 15px ${color}20` }}>
      {icon && <Box sx={{ mb: 0.5 }}>{icon}</Box>}
      <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: 11 }}>{label}</Typography>
      {sublabel && <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: 9 }}>{sublabel}</Typography>}
    </Box>
  </Box>
)

const VArrow = () => <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.8 }}><ArrowDownwardIcon sx={{ color: '#00d4ff', fontSize: 16 }} /></Box>

export default function AttackVisualization() {
  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>How Replay Attacks Work & How AI Stops Them</Typography>
      <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 3 }}>An educational step-by-step breakdown of the attack and defense mechanisms</Typography>

      {/* Full architecture flow */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#00d4ff' }}>Complete Attack & Defense Flow</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 400 }}>
            <Node label="USER / CLIENT" sublabel="Legitimate user" color="#00ff88" />
            <VArrow />
            <Node label="LEGITIMATE REQUEST" sublabel="Signed JWT + unique nonce + timestamp" color="#00d4ff" />
            <VArrow />
            <Node label="SERVER" sublabel="Spring Boot API" color="#00d4ff" />
            <VArrow />
            <Node label="SUCCESS ✓" sublabel="Transaction processed, nonce stored" color="#00ff88" />
            <VArrow />
            <Node label="REQUEST INTERCEPTED" sublabel="Attacker captures the request" color="#ff8c00" />
            <VArrow />
            <Node label="ATTACKER REPLAYS" sublabel="Same request sent again" color="#ff3366" />
            <VArrow />
            <Node label="SECURITY GATEWAY" sublabel="Spring Security + Replay Protection" color="#00d4ff" />
            <VArrow />
            <Box sx={{ display: 'flex', gap: 3, my: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Node label="TRADITIONAL CHECKS" sublabel="TX ID / Nonce / Timestamp / Fingerprint" color="#00d4ff" />
                <VArrow />
                <Node label="ML FEATURE EXTRACTION" sublabel="10 behavioral features" color="#8b5cf6" />
                <VArrow />
                <Node label="RANDOM FOREST" sublabel="Prediction + confidence" color="#8b5cf6" />
              </Box>
            </Box>
            <VArrow />
            <Node label="RISK ENGINE" sublabel="Score 0–100 → Severity" color="#ff8c00" />
            <VArrow />
            <Node label="RESPONSE POLICY" sublabel="Deterministic action selection" color="#00d4ff" />
            <VArrow />
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Node label="ALLOW" sublabel="Normal traffic" color="#00ff88" />
              <Node label="BLOCK" sublabel="Replay attack" color="#ff3366" />
            </Box>
            <VArrow />
            <Node label="INCIDENT LOG" sublabel="PostgreSQL forensic record" color="#8b5cf6" />
            <VArrow />
            <Node label="DASHBOARD" sublabel="Real-time SOC metrics" color="#00d4ff" />
          </Box>
        </Box>
      </Paper>

      {/* Educational Sections */}
      <Grid container spacing={2}>
        {[
          {
            num: '01', title: 'What is a Replay Attack?', color: '#ff3366',
            content: 'A replay attack (also called playback attack) occurs when an adversary intercepts a valid network transmission and retransmits it to trick the recipient into executing it again. The attacker does not need to decrypt or understand the content — they simply resend the captured bytes. This can lead to duplicate financial transactions, unauthorized access, or data corruption.'
          },
          {
            num: '02', title: 'Why Standard Authentication is Insufficient', color: '#ff8c00',
            content: 'Standard authentication (passwords, JWT tokens) verifies WHO sent the request, but not WHEN or WHETHER it has been processed before. A valid signed JWT remains valid until it expires. If an attacker intercepts such a request, they can replay it multiple times within the token\'s validity period, each time appearing as a legitimate authenticated user.'
          },
          {
            num: '03', title: 'Nonce & Timestamp Protection', color: '#00d4ff',
            content: 'A nonce (Number Used Once) is a cryptographically random value included in each request. The server stores every nonce it processes — if a nonce appears twice, the second request is rejected. Timestamps enforce a freshness window (e.g. ±5 minutes): requests outside this window are rejected regardless of valid credentials. Together, these mechanisms prevent exact replay and delayed replay attacks.'
          },
          {
            num: '04', title: 'ML Behavioral Detection', color: '#8b5cf6',
            content: 'Even if an attacker crafts a new nonce (partial replay), the Random Forest classifier detects behavioral anomalies: sudden spike in request frequency, IP changes, session changes, timing patterns, and behavioral deviation scores. The model was trained on 2000 labeled samples and classifies requests as NORMAL, SUSPICIOUS, or REPLAY_ATTACK with a confidence score.'
          },
          {
            num: '05', title: 'Risk Scoring & Automated Response', color: '#00ff88',
            content: 'The risk engine combines ML confidence with traditional check results into a risk score (0–100). CRITICAL (81–100) triggers immediate request blocking, nonce invalidation, session restriction, incident creation, and admin alert. All responses are deterministic — predefined rules ensure consistent, auditable behaviour without relying on an LLM for command generation.'
          },
          {
            num: '06', title: 'Forensic Evidence & Audit Trail', color: '#00ff88',
            content: 'Every security incident is stored in PostgreSQL with a unique incident ID (e.g., INC-2026-0001), full forensic evidence JSON, AI explanation, ML confidence scores, feature importance values, and all actions taken. This creates a complete audit trail for post-incident investigation and compliance reporting.'
          },
        ].map(s => (
          <Grid item xs={12} md={6} key={s.num}>
            <Paper sx={{ p: 3, height: '100%', border: `1px solid ${s.color}20` }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="h4" sx={{ color: `${s.color}40`, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{s.num}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: s.color, alignSelf: 'center' }}>{s.title}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 13 }}>{s.content}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
