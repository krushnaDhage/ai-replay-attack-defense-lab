import { useState } from 'react'
import {
  Box, Paper, Grid, Typography, Button, Alert, Chip, Divider,
  ToggleButtonGroup, ToggleButton, CircularProgress, LinearProgress
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CaptureIcon from '@mui/icons-material/FiberSmartRecord'
import ReplayIcon from '@mui/icons-material/Replay'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SecurityIcon from '@mui/icons-material/Security'
import PsychologyIcon from '@mui/icons-material/Psychology'
import SendIcon from '@mui/icons-material/Send'
import SpeedIcon from '@mui/icons-material/Speed'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import InfoIcon from '@mui/icons-material/Info'
import { transactionAPI, simulatorAPI } from '../services/api'

function genNonce() { return Math.random().toString(36).substring(2, 14).toUpperCase() }
function genTxId() { return 'TX-SIM-' + Date.now().toString(36).toUpperCase() }

const FlowNode = ({ label, icon, color, active, done }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, opacity: done || active ? 1 : 0.3, transition: 'opacity 0.5s' }}>
    <Box sx={{ p: 2, bgcolor: active ? `${color}20` : done ? `${color}10` : 'rgba(255,255,255,0.03)', border: `2px solid ${active || done ? color : 'rgba(255,255,255,0.08)'}`, borderRadius: 2, boxShadow: active ? `0 0 20px ${color}40` : 'none', transition: 'all 0.5s' }}>
      {icon}
    </Box>
    <Typography variant="caption" sx={{ color: active || done ? color : '#475569', fontWeight: active ? 700 : 400, textAlign: 'center', fontSize: 11 }}>{label}</Typography>
  </Box>
)

const FlowArrow = ({ active }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
    <Box sx={{ width: 30, height: 2, bgcolor: active ? '#00d4ff' : 'rgba(255,255,255,0.08)', transition: 'background 0.5s', position: 'relative' }}>
      {active && <Box sx={{ position: 'absolute', right: -4, top: -4, width: 10, height: 10, borderTop: '2px solid #00d4ff', borderRight: '2px solid #00d4ff', transform: 'rotate(45deg)' }} />}
    </Box>
  </Box>
)

export default function AttackSimulator() {
  const [mode, setMode] = useState('EXACT_REPLAY') // EXACT_REPLAY | ADAPTIVE_REPLAY
  const [step, setStep] = useState('idle') // idle | sending | captured | replaying | done
  const [legitResult, setLegitResult] = useState(null)
  const [replayResult, setReplayResult] = useState(null)
  const [error, setError] = useState('')
  const [flowStep, setFlowStep] = useState(0)

  const [txData, setTxData] = useState({ txId: genTxId(), nonce: genNonce() })

  const animateFlow = async (steps, delay = 500) => {
    for (let i = 0; i <= steps; i++) {
      setFlowStep(i)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  const handleModeChange = (_, newMode) => {
    if (newMode) {
      setMode(newMode)
      reset()
    }
  }

  const reset = () => {
    setStep('idle')
    setLegitResult(null)
    setReplayResult(null)
    setFlowStep(0)
    setError('')
    setTxData({ txId: genTxId(), nonce: genNonce() })
  }

  const sendLegitimate = async () => {
    setStep('sending')
    setError('')
    setReplayResult(null)
    try {
      const res = await transactionAPI.transfer({
        transactionId: txData.txId,
        senderAccount: 'A001',
        receiverAccount: 'A002',
        amount: 1000,
        nonce: txData.nonce,
        timestamp: new Date().toISOString()
      })
      setLegitResult(res.data)
      await animateFlow(2, 400)

      if (mode === 'EXACT_REPLAY') {
        await simulatorAPI.capture({
          transactionId: txData.txId,
          senderAccount: 'A001',
          receiverAccount: 'A002',
          amount: 1000,
          nonce: txData.nonce,
          timestamp: new Date(Date.now() - 600000).toISOString()
        })
      }
      setStep('captured')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send transaction')
      setStep('idle')
    }
  }

  const simulateReplay = async () => {
    setStep('replaying')
    setError('')
    await animateFlow(6, 500)
    try {
      const res = mode === 'EXACT_REPLAY'
        ? await simulatorAPI.replay()
        : await simulatorAPI.replayAdaptive()
      setReplayResult(res.data)
    } catch (err) {
      const errData = err.response?.data
      const isBlockedResponse =
        errData?.status === 'BLOCKED' ||
        errData?.securityStatus === 'REPLAY_ATTACK' ||
        errData?.securityStatus === 'SUSPICIOUS_BEHAVIOR' ||
        err.response?.status === 409
      if (isBlockedResponse && errData) {
        setReplayResult(errData)
      } else {
        setError(errData?.message || err.message || 'Replay simulation failed')
      }
    }
    setStep('done')
  }

  const isBlocked = replayResult?.status === 'BLOCKED' || replayResult?.status === 'SUCCESS_FLAGGED' || replayResult?.securityStatus === 'REPLAY_ATTACK' || replayResult?.securityStatus === 'SUSPICIOUS_BEHAVIOR'

  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 0.5 }}>Replay Attack Simulator</Typography>
          <Typography variant="caption" sx={{ color: '#475569' }}>
            Controlled cybersecurity laboratory — test traditional duplicate checks vs behavioral AI detection
          </Typography>
          <Chip label="EDUCATIONAL LAB ONLY" size="small" sx={{ ml: 2, bgcolor: 'rgba(255,140,0,0.1)', color: '#ff8c00', border: '1px solid rgba(255,140,0,0.3)', fontSize: 10 }} />
        </Box>

        {/* Mode Selector */}
        <Paper sx={{ p: 0.5, bgcolor: '#0a1628', border: '1px solid rgba(0,212,255,0.2)' }}>
          <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} size="small">
            <ToggleButton value="EXACT_REPLAY" sx={{ color: '#94a3b8', '&.Mui-selected': { bgcolor: 'rgba(255,140,0,0.2)', color: '#ff8c00', fontWeight: 700 } }}>
              <ReplayIcon sx={{ mr: 1, fontSize: 16 }} />
              1. Exact Replay (Duplicate)
            </ToggleButton>
            <ToggleButton value="ADAPTIVE_REPLAY" sx={{ color: '#94a3b8', '&.Mui-selected': { bgcolor: 'rgba(139,92,246,0.2)', color: '#8b5cf6', fontWeight: 700 } }}>
              <SpeedIcon sx={{ mr: 1, fontSize: 16 }} />
              2. Adaptive Behavioral Replay
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Box>

      {/* Mode Information Banner */}
      <Alert severity={mode === 'EXACT_REPLAY' ? 'warning' : 'info'} icon={mode === 'EXACT_REPLAY' ? <ReplayIcon /> : <PsychologyIcon />} sx={{ mb: 3, bgcolor: mode === 'EXACT_REPLAY' ? 'rgba(255,140,0,0.08)' : 'rgba(139,92,246,0.08)', border: `1px solid ${mode === 'EXACT_REPLAY' ? 'rgba(255,140,0,0.3)' : 'rgba(139,92,246,0.3)'}`, color: '#e2e8f0' }}>
        {mode === 'EXACT_REPLAY' ? (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ff8c00' }}>
              SCENARIO A — Exact Replay (Duplicate Request Reuse)
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Attacker replays the <strong>EXACT same request</strong> (identical Transaction ID, Nonce, and payload). Traditional security checks (nonce registry & Tx ID lookup) catch this deterministically. <em>Note: AI is NOT strictly required for basic duplicate detection.</em>
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
              SCENARIO B — Adaptive Behavioral Replay (Fresh Nonce/TxID Bypasses Traditional Security)
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Attacker modifies request metadata — generating a <strong>fresh Transaction ID, fresh Nonce, and valid Timestamp</strong>. Traditional security checks pass ("NO EXACT REPLAY DETECTED"). Only <strong>Behavioral AI</strong> detects the rapid inter-request interval (0.2s), frequency anomaly, and sequence deviation to block the attack.
            </Typography>
          </Box>
        )}
      </Alert>

      {/* Attack Flow Diagram */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>
          {mode === 'EXACT_REPLAY' ? 'Exact Replay Detection Flow' : 'Adaptive Behavioral AI Detection Flow'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
          <FlowNode label="LEGITIMATE REQUEST" icon={<SendIcon sx={{ color: '#00ff88' }} />} color="#00ff88" active={flowStep === 1} done={flowStep > 1} />
          <FlowArrow active={flowStep >= 1} />
          <FlowNode label="SERVER" icon={<SecurityIcon sx={{ color: '#00d4ff' }} />} color="#00d4ff" active={flowStep === 2} done={flowStep > 2} />
          <FlowArrow active={flowStep >= 2} />
          <FlowNode label="SUCCESS" icon={<CheckCircleIcon sx={{ color: '#00ff88' }} />} color="#00ff88" active={flowStep === 3} done={flowStep > 3} />
          <FlowArrow active={flowStep >= 3} />
          <FlowNode label={mode === 'EXACT_REPLAY' ? 'CAPTURED REPLAY' : 'ADAPTIVE BURST'} icon={mode === 'EXACT_REPLAY' ? <CaptureIcon sx={{ color: '#ff8c00' }} /> : <SpeedIcon sx={{ color: '#8b5cf6' }} />} color={mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6'} active={flowStep === 4} done={flowStep > 4} />
          <FlowArrow active={flowStep >= 4} />
          <FlowNode label="GATEWAY INSPECTION" icon={<SecurityIcon sx={{ color: '#ff3366' }} />} color="#ff3366" active={flowStep === 5} done={flowStep > 5} />
          <FlowArrow active={flowStep >= 5} />
          <FlowNode label={mode === 'EXACT_REPLAY' ? 'DETERMINISTIC RULE' : 'BEHAVIORAL AI'} icon={mode === 'EXACT_REPLAY' ? <SecurityIcon sx={{ color: '#ff8c00' }} /> : <PsychologyIcon sx={{ color: '#8b5cf6' }} />} color={mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6'} active={flowStep === 6} done={flowStep > 6} />
          <FlowArrow active={flowStep >= 6} />
          <FlowNode label="BLOCKED & MITIGATED" icon={<BlockIcon sx={{ color: '#ff3366' }} />} color="#ff3366" active={flowStep === 7} done={flowStep > 7} />
        </Box>
        {step === 'replaying' && <LinearProgress sx={{ mt: 2, bgcolor: 'rgba(255,51,102,0.1)', '& .MuiLinearProgress-bar': { bgcolor: mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6' } }} />}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,51,102,0.1)' }}>{error}</Alert>}

      {/* Three Panels */}
      <Grid container spacing={2}>
        {/* Panel 1 — Legitimate */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%', border: step !== 'idle' ? '1px solid rgba(0,255,136,0.3)' : undefined }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SendIcon sx={{ color: '#00ff88' }} />
              <Typography variant="subtitle2" sx={{ color: '#00ff88', fontWeight: 700 }}>PANEL 1 — Legitimate Session Baseline</Typography>
            </Box>

            {!legitResult ? (
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 2 }}>
                  {mode === 'EXACT_REPLAY'
                    ? 'Send a legitimate transaction to capture payload & nonce for duplicate replay.'
                    : 'Establish baseline legitimate transaction session before triggering adaptive burst replay.'}
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1, mb: 2, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8' }}>
                  <pre>{JSON.stringify({ transactionId: txData.txId, senderAccount: 'A001', receiverAccount: 'A002', amount: 1000, nonce: txData.nonce }, null, 2)}</pre>
                </Box>
                <Button id="send-legit-btn" fullWidth variant="contained" onClick={sendLegitimate}
                  disabled={step !== 'idle'}
                  startIcon={step === 'sending' ? <CircularProgress size={16} /> : <SendIcon />}
                  sx={{ background: 'linear-gradient(135deg, #00ff88, #00aa55)', color: '#000', fontWeight: 700 }}>
                  {step === 'sending' ? 'Sending...' : '1. Send Legitimate Transaction'}
                </Button>
              </Box>
            ) : (
              <Box>
                <Chip label="SUCCESS — BASELINE ESTABLISHED" sx={{ mb: 1.5, bgcolor: 'rgba(0,255,136,0.15)', color: '#00ff88', fontWeight: 700 }} />
                {[['TX ID', legitResult.transactionId], ['Nonce', legitResult.nonce], ['Amount', `$${legitResult.amount}`], ['Status', legitResult.status], ['Risk Score', `${legitResult.riskScore?.toFixed(1)}/100`]].map(([k, v]) => (
                  <Box key={k} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#475569' }}>{k}</Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, wordBreak: 'break-all' }}>{v}</Typography>
                  </Box>
                ))}
                <Chip label={mode === 'EXACT_REPLAY' ? "EXACT PAYLOAD CAPTURED" : "SESSION HISTORICAL BASELINE READY"} size="small" sx={{ mt: 1, bgcolor: mode === 'EXACT_REPLAY' ? 'rgba(255,140,0,0.1)' : 'rgba(139,92,246,0.1)', color: mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6', fontSize: 10 }} />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Panel 2 — Attack Payload & Traditional Checks */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%', border: replayResult ? '1px solid rgba(255,51,102,0.3)' : undefined }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ReplayIcon sx={{ color: mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6' }} />
              <Typography variant="subtitle2" sx={{ color: mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6', fontWeight: 700 }}>
                PANEL 2 — {mode === 'EXACT_REPLAY' ? 'Exact Replay Request' : 'Adaptive Burst Request'}
              </Typography>
            </Box>

            {step === 'captured' || step === 'replaying' || step === 'done' ? (
              <Box>
                {step === 'captured' && (
                  <>
                    <Typography variant="caption" sx={{ color: mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6', display: 'block', mb: 2 }}>
                      {mode === 'EXACT_REPLAY'
                        ? '⚠ Payload captured. Attacker will replay the exact same Nonce & Tx ID.'
                        : '⚡ Attacker will launch rapid requests with FRESH Tx ID & FRESH Nonce to attempt bypass.'}
                    </Typography>
                    <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1, mb: 2, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Typography variant="caption" sx={{ color: mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6', display: 'block', mb: 1, fontWeight: 700 }}>
                        {mode === 'EXACT_REPLAY' ? 'REPLAYING IDENTICAL METADATA:' : 'ATTACKER GENERATING FRESH METADATA:'}
                      </Typography>
                      {mode === 'EXACT_REPLAY' ? (
                        <pre>{JSON.stringify({ transactionId: txData.txId, nonce: txData.nonce, timestamp: 'STALE_OR_SAME' }, null, 2)}</pre>
                      ) : (
                        <pre>{JSON.stringify({ transactionId: 'TX-ADAPTIVE-NEW', nonce: 'NONCE-FRESH-NEW', interRequestInterval: '0.2s', sequenceDeviation: '0.85' }, null, 2)}</pre>
                      )}
                    </Box>
                    <Button id="replay-attack-btn" fullWidth variant="contained" onClick={simulateReplay}
                      startIcon={mode === 'EXACT_REPLAY' ? <ReplayIcon /> : <SpeedIcon />}
                      sx={{ background: mode === 'EXACT_REPLAY' ? 'linear-gradient(135deg, #ff8c00, #cc6600)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', fontWeight: 700, py: 1.3, fontSize: 13 }}>
                      {mode === 'EXACT_REPLAY' ? '2. SIMULATE EXACT REPLAY' : '2. SIMULATE ADAPTIVE BEHAVIORAL REPLAY'}
                    </Button>
                  </>
                )}
                {step === 'replaying' && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: mode === 'EXACT_REPLAY' ? '#ff8c00' : '#8b5cf6', mb: 2 }} />
                    <Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>Executing security gateway evaluation...</Typography>
                  </Box>
                )}
                {replayResult && (
                  <Box>
                    <Chip label={replayResult.status} sx={{ mb: 1.5, bgcolor: isBlocked ? 'rgba(255,51,102,0.15)' : 'rgba(0,255,136,0.15)', color: isBlocked ? '#ff3366' : '#00ff88', fontWeight: 700 }} />
                    
                    {/* Traditional Security Check Banner */}
                    <Box sx={{ p: 1.5, mb: 2, borderRadius: 1, bgcolor: mode === 'EXACT_REPLAY' ? 'rgba(255,140,0,0.1)' : 'rgba(0,255,136,0.1)', border: `1px solid ${mode === 'EXACT_REPLAY' ? 'rgba(255,140,0,0.3)' : 'rgba(0,255,136,0.3)'}` }}>
                      <Typography variant="caption" sx={{ color: mode === 'EXACT_REPLAY' ? '#ff8c00' : '#00ff88', fontWeight: 700, display: 'block' }}>
                        TRADITIONAL SECURITY CHECK RESULT:
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#e2e8f0', fontSize: 11 }}>
                        {mode === 'EXACT_REPLAY'
                          ? 'DUPLICATE DETECTED (Nonce / TxID reuse). AI NOT REQUIRED FOR BASIC DUPLICATE BLOCK.'
                          : 'NO EXACT REPLAY DETECTED — Nonce, TxID, and Timestamp are valid! Passed Tier 1 checks.'}
                      </Typography>
                    </Box>

                    {['Transaction ID', 'Nonce', 'Status', 'Security Status', 'Risk Score', 'Severity'].map((k, i) => {
                      const vals = [replayResult.transactionId, replayResult.nonce, replayResult.status, replayResult.securityStatus, `${replayResult.riskScore?.toFixed(1)}/100`, replayResult.severity]
                      return (
                        <Box key={k} sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ color: '#475569' }}>{k}</Typography>
                          <Typography variant="body2" sx={{ color: i === 3 ? '#ff3366' : '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{vals[i]}</Typography>
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography sx={{ color: '#334155', textAlign: 'center', fontSize: 13 }}>
                  Complete Step 1 first to send baseline transaction
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Panel 3 — Behavioral AI & Mitigation Response */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%', border: replayResult ? '1px solid rgba(139,92,246,0.3)' : undefined }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PsychologyIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="subtitle2" sx={{ color: '#8b5cf6', fontWeight: 700 }}>PANEL 3 — AI Risk & Explanation Engine</Typography>
            </Box>

            {replayResult ? (
              <Box>
                <Box sx={{ p: 2, bgcolor: 'rgba(139,92,246,0.08)', borderRadius: 1, border: '1px solid rgba(139,92,246,0.2)', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#8b5cf6' }}>Detection Classification</Typography>
                  <Typography variant="h6" sx={{ color: isBlocked ? '#ff3366' : '#00ff88', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{replayResult.securityStatus}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>ML Model Confidence: {((replayResult.confidence || 0) * 100).toFixed(1)}%</Typography>
                  <br />
                  <Typography variant="caption" sx={{ color: isBlocked ? '#ff3366' : '#00ff88' }}>Overall Risk Score: {replayResult.riskScore?.toFixed(1)} / 100 — {replayResult.severity}</Typography>
                </Box>

                {/* Mode Specific Explanation Card */}
                {replayResult.explanation && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1, borderLeft: '3px solid #8b5cf6' }}>
                    <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      AI EXPLANATION ENGINE SUMMARY:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.5, display: 'block' }}>
                      {replayResult.explanation}
                    </Typography>
                  </Box>
                )}

                {replayResult.evidence?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>Feature Contributor Evidence:</Typography>
                    {replayResult.evidence.map((e, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 0.8, mb: 0.5 }}>
                        <CheckCircleIcon sx={{ color: '#ff8c00', fontSize: 12, mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 11 }}>{e}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {replayResult.actionsApplied?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>Automated Defense Actions:</Typography>
                    {replayResult.actionsApplied.map((a, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 0.8, mb: 0.5 }}>
                        <CheckCircleIcon sx={{ color: '#00ff88', fontSize: 12, mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#00ff88', fontSize: 11 }}>{a}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {replayResult.incidentId && (
                  <Chip label={`Incident: ${replayResult.incidentId}`} size="small" sx={{ bgcolor: 'rgba(255,51,102,0.1)', color: '#ff3366', fontFamily: 'JetBrains Mono, monospace' }} />
                )}

                <Button fullWidth variant="outlined" onClick={reset} size="small" sx={{ mt: 2, color: '#64748b', borderColor: '#1e293b' }}>
                  Reset Demo Simulator
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography sx={{ color: '#334155', textAlign: 'center', fontSize: 13 }}>
                  AI risk analysis and feature evidence will render after attack simulation
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

