import { Box, Paper, Grid, Typography, Chip, Divider } from '@mui/material'
import AccountTreeIcon from '@mui/icons-material/AccountTree'

const Tech = ({ name, version, role, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <Box sx={{ width: 4, height: 24, bgcolor: color, borderRadius: 1, flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>{name}</Typography>
      <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: 10 }}>{role}</Typography>
    </Box>
    <Chip label={version} size="small" sx={{ height: 18, fontSize: 9, bgcolor: `${color}15`, color, fontFamily: 'JetBrains Mono, monospace' }} />
  </Box>
)

export default function Architecture() {
  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AccountTreeIcon sx={{ color: '#00d4ff', fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>System Architecture</Typography>
          <Typography variant="caption" sx={{ color: '#475569' }}>Four-service microservice architecture</Typography>
        </Box>
      </Box>

      {/* Architecture Diagram */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ color: '#00d4ff', mb: 3, textAlign: 'center' }}>System Component Diagram</Typography>
        <Box sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94a3b8', whiteSpace: 'pre', overflowX: 'auto', lineHeight: 1.8 }}>
{`┌──────────────────────────────────────────────────────────────┐
│                   BROWSER (React + Vite)                     │
│                        Port: 5173                            │
│  Login │ Dashboard │ AttackSimulator │ AIAnalysis │ ...      │
└────────────────────────┬─────────────────────────────────────┘
                         │  HTTP / Axios
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              Spring Boot API (Java 21)                       │
│                     Port: 8080                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  AuthFilter  │  │ TransactionSvc│  │ ReplayProtection  │  │
│  │  JWT Util    │  │  (10 steps)  │  │ Service           │  │
│  └──────────────┘  └──────┬───────┘  └───────────────────┘  │
│                            │                                  │
│  ┌──────────────┐  ┌──────▼───────┐  ┌───────────────────┐  │
│  │ RiskEngine   │  │FeatureExtract│  │ ResponsePolicy    │  │
│  │ 0-100 score  │  │ 10 features  │  │ Engine            │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘  │
│         │                  │                                  │
│         └──────────────────┘                                  │
│                    │                                          │
│  ┌─────────────────▼────────────────────────────────────┐   │
│  │           Incident & Event Service                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────────┬───────────┘
           │  REST (RestTemplate)                  │  JPA
           ▼                                       ▼
┌─────────────────────┐              ┌──────────────────────┐
│  Python FastAPI      │              │  PostgreSQL           │
│  ML Service          │              │  Port: 5432           │
│  Port: 8000          │              │                      │
│                      │              │  Tables:             │
│  POST /predict       │              │  • users             │
│  GET  /health        │              │  • transactions      │
│  GET  /metrics       │              │  • nonce_records     │
│  GET  /features      │              │  • security_events   │
│                      │              │  • security_incidents│
│  RandomForest  +     │              │  • attack_simulations│
│  IsolationForest     │              │                      │
└─────────────────────┘              └──────────────────────┘`}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Tech Stacks */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#00d4ff', mb: 2, fontWeight: 700 }}>Frontend</Typography>
            <Tech name="React" version="18.3" role="UI framework" color="#00d4ff" />
            <Tech name="Vite" version="5.x" role="Build tool + dev server" color="#00d4ff" />
            <Tech name="Material UI" version="5.x" role="Component library" color="#8b5cf6" />
            <Tech name="Recharts" version="2.x" role="Charts and graphs" color="#00ff88" />
            <Tech name="Axios" version="1.x" role="HTTP client + JWT interceptor" color="#00d4ff" />
            <Tech name="React Router" version="6.x" role="SPA routing" color="#ff8c00" />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#00ff88', mb: 2, fontWeight: 700 }}>Backend (Spring Boot)</Typography>
            <Tech name="Java" version="21 LTS" role="Runtime" color="#ff8c00" />
            <Tech name="Spring Boot" version="3.3.5" role="Web framework" color="#00ff88" />
            <Tech name="Spring Security" version="6.x" role="Auth + JWT filter" color="#00ff88" />
            <Tech name="Spring Data JPA" version="3.x" role="ORM + repositories" color="#00ff88" />
            <Tech name="JJWT" version="0.12.6" role="JWT generation" color="#00d4ff" />
            <Tech name="springdoc" version="2.6" role="Swagger/OpenAPI docs" color="#94a3b8" />
            <Tech name="Lombok" version="latest" role="Boilerplate reduction" color="#94a3b8" />
            <Tech name="PostgreSQL" version="16" role="Primary database" color="#00d4ff" />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 700 }}>ML Service (Python)</Typography>
            <Tech name="Python" version="3.14" role="Runtime" color="#8b5cf6" />
            <Tech name="FastAPI" version="0.141" role="REST API framework" color="#8b5cf6" />
            <Tech name="scikit-learn" version="1.9" role="Random Forest + IsolationForest" color="#ff8c00" />
            <Tech name="pandas" version="2.x" role="Dataset manipulation" color="#00d4ff" />
            <Tech name="NumPy" version="1.x" role="Numerical operations" color="#00ff88" />
            <Tech name="joblib" version="1.3" role="Model serialization" color="#94a3b8" />
            <Tech name="Pydantic" version="2.x" role="Request/response schemas" color="#00d4ff" />
          </Paper>
        </Grid>

        {/* API Endpoints */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2, fontWeight: 700 }}>REST API Endpoints</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Method', 'Endpoint', 'Auth', 'Description'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['POST', '/api/auth/register', 'Public', 'Register new user'],
                    ['POST', '/api/auth/login', 'Public', 'Login and get JWT'],
                    ['POST', '/api/transactions/transfer', 'JWT', 'Submit replay-protected transaction'],
                    ['GET', '/api/transactions', 'JWT', 'Get user transactions'],
                    ['POST', '/api/attack-simulator/capture', 'JWT', 'Capture request for replay'],
                    ['POST', '/api/attack-simulator/replay', 'JWT', 'Replay captured request (lab only)'],
                    ['GET', '/api/security/events', 'JWT', 'Get security events timeline'],
                    ['GET', '/api/security/incidents', 'JWT', 'Get security incidents'],
                    ['GET', '/api/security/dashboard', 'JWT', 'Get live dashboard metrics'],
                    ['GET', '/api/health', 'Public', 'System health check'],
                    ['POST', '/predict', 'ML Service', 'ML prediction on features'],
                    ['GET', '/health', 'ML Service', 'ML service health'],
                    ['GET', '/metrics', 'ML Service', 'Training metrics'],
                    ['GET', '/features', 'ML Service', 'Feature importance'],
                  ].map(([m, ep, auth, desc], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 12px', color: m === 'GET' ? '#00ff88' : '#ff8c00', fontWeight: 700 }}>{m}</td>
                      <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{ep}</td>
                      <td style={{ padding: '8px 12px', color: auth === 'Public' ? '#94a3b8' : '#00d4ff', fontSize: 11 }}>{auth}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>{desc}</td>
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
