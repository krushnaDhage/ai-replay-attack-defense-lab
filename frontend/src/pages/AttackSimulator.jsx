import { useState } from 'react'
import {
  Box, Paper, Grid, Typography, Button, Alert, Chip, Divider,
  Stepper, Step, StepLabel, CircularProgress, LinearProgress
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CaptureIcon from '@mui/icons-material/FiberSmartRecord'
import ReplayIcon from '@mui/icons-material/Replay'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SecurityIcon from '@mui/icons-material/Security'
import PsychologyIcon from '@mui/icons-material/Psychology'
import SendIcon from '@mui/icons-material/Send'
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
  const [step, setStep] = useState('idle') // idle | sending | captured | replaying | done
  const [legitResult, setLegitResult] = useState(null)
  const [replayResult, setReplayResult] = useState(null)
  const [error, setError] = useState('')
  const [flowStep, setFlowStep] = useState(0)

  const [txData] = useState({ txId: genTxId(), nonce: genNonce() })

  const animateFlow = async (steps, delay = 600) => {
    for (let i = 0; i <= steps; i++) {
      setFlowStep(i)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  const sendLegitimate = async () => {
    setStep('sending'); setError(''); setReplayResult(null)
    try {
      // Step 1: Send legitimate transaction
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

      // Step 2: Capture for replay
      await simulatorAPI.capture({
        transactionId: txData.txId,
        senderAccount: 'A001',
        receiverAccount: 'A002',
        amount: 1000,
        nonce: txData.nonce,
        timestamp: new Date(Date.now() - 600000).toISOString() // intentionally old timestamp for replay
      })
      setStep('captured')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send transaction')
      setStep('idle')
    }
  }

  const simulateReplay = async () => {
    setStep('replaying'); setError('')
    await animateFlow(6, 500)
    try {
      const res = await simulatorAPI.replay()
      setReplayResult(res.data)
    } catch (err) {
      // 409 = blocked (expected!)
      if (err.response?.data?.status === 'BLOCKED') {
        setReplayResult(err.response.data)
      } else {
        setError(err.response?.data?.message || 'Replay simulation failed')
      }
    }
    setStep('done')
  }

  const reset = () => { setStep('idle'); setLegitResult(null); setReplayResult(null); setFlowStep(0); setError('') }

  const isBlocked = replayResult?.status === 'BLOCKED'

  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 0.5 }}>Replay Attack Simulator</Typography>
        <Typography variant="caption" sx={{ color: '#475569' }}>
          Controlled lab demonstration — all attacks are performed ONLY against the local demo API
        </Typography>
        <Chip label="EDUCATIONAL LAB ONLY" size="small" sx={{ ml: 2, bgcolor: 'rgba(255,140,0,0.1)', color: '#ff8c00', border: '1px solid rgba(255,140,0,0.3)', fontSize: 10 }} />
      </Box>

      {/* Attack Flow Diagram */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>Attack Flow Visualization</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
          <FlowNode label="LEGITIMATE REQUEST" icon={<SendIcon sx={{ color: '#00ff88' }} />} color="#00ff88" active={flowStep === 1} done={flowStep > 1} />
          <FlowArrow active={flowStep >= 1} />
          <FlowNode label="SERVER" icon={<SecurityIcon sx={{ color: '#00d4ff' }} />} color="#00d4ff" active={flowStep === 2} done={flowStep > 2} />
          <FlowArrow active={flowStep >= 2} />
          <FlowNode label="SUCCESS" icon={<CheckCircleIcon sx={{ color: '#00ff88' }} />} color="#00ff88" active={flowStep === 3} done={flowStep > 3} />
          <FlowArrow active={flowStep >= 3} />
          <FlowNode label="CAPTURED" icon={<CaptureIcon sx={{ color: '#ff8c00' }} />} color="#ff8c00" active={flowStep === 4} done={flowStep > 4} />
          <FlowArrow active={flowStep >= 4} />
          <FlowNode label="ATTACKER REPLAYS" icon={<ReplayIcon sx={{ color: '#ff3366' }} />} color="#ff3366" active={flowStep === 5} done={flowStep > 5} />
          <FlowArrow active={flowStep >= 5} />
          <FlowNode label="AI DETECTION" icon={<PsychologyIcon sx={{ color: '#8b5cf6' }} />} color="#8b5cf6" active={flowStep === 6} done={flowStep > 6} />
          <FlowArrow active={flowStep >= 6} />
          <FlowNode label="BLOCKED" icon={<BlockIcon sx={{ color: '#ff3366' }} />} color="#ff3366" active={flowStep === 7} done={flowStep > 7} />
        </Box>
        {step === 'replaying' && <LinearProgress sx={{ mt: 2, bgcolor: 'rgba(255,51,102,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#ff3366' } }} />}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,51,102,0.1)' }}>{error}</Alert>}

      {/* Three Panels */}
      <Grid container spacing={2}>
        {/* Panel 1 — Legitimate */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%', border: step !== 'idle' ? '1px solid rgba(0,255,136,0.3)' : undefined }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SendIcon sx={{ color: '#00ff88' }} />
              <Typography variant="subtitle2" sx={{ color: '#00ff88', fontWeight: 700 }}>PANEL 1 — Legitimate Request</Typography>
            </Box>

            {!legitResult ? (
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 2 }}>
                  Send a legitimate transaction to capture for replay demonstration.
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1, mb: 2, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8' }}>
                  <pre>{JSON.stringify({ transactionId: txData.txId, senderAccount: 'A001', receiverAccount: 'A002', amount: 1000, nonce: txData.nonce }, null, 2)}</pre>
                </Box>
                <Button id="send-legit-btn" fullWidth variant="contained" onClick={sendLegitimate}
                  disabled={step !== 'idle'}
                  startIcon={step === 'sending' ? <CircularProgress size={16} /> : <SendIcon />}
                  sx={{ background: 'linear-gradient(135deg, #00ff88, #00aa55)', color: '#000', fontWeight: 700 }}>
                  {step === 'sending' ? 'Sending...' : 'Send Legitimate Transaction'}
                </Button>
              </Box>
            ) : (
              <Box>
                <Chip label="SUCCESS" sx={{ mb: 1.5, bgcolor: 'rgba(0,255,136,0.15)', color: '#00ff88', fontWeight: 700 }} />
                {[['TX ID', legitResult.transactionId], ['Nonce', legitResult.nonce], ['Amount', `$${legitResult.amount}`], ['Status', legitResult.status], ['Risk', `${legitResult.riskScore?.toFixed(1)}/100`]].map(([k, v]) => (
                  <Box key={k} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#475569' }}>{k}</Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, wordBreak: 'break-all' }}>{v}</Typography>
                  </Box>
                ))}
                <Chip label="REQUEST CAPTURED FOR REPLAY" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,140,0,0.1)', color: '#ff8c00', fontSize: 10 }} />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Panel 2 — Replay */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%', border: replayResult ? '1px solid rgba(255,51,102,0.3)' : undefined }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ReplayIcon sx={{ color: '#ff3366' }} />
              <Typography variant="subtitle2" sx={{ color: '#ff3366', fontWeight: 700 }}>PANEL 2 — Replayed Request</Typography>
            </Box>

            {step === 'captured' || step === 'replaying' || step === 'done' ? (
              <Box>
                {step === 'captured' && (
                  <>
                    <Typography variant="caption" sx={{ color: '#ff8c00', display: 'block', mb: 2 }}>
                      ⚠ Request captured! Click below to simulate the attacker replaying this request.
                    </Typography>
                    <Box sx={{ p: 1.5, bgcolor: 'rgba(255,51,102,0.05)', borderRadius: 1, mb: 2, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8', border: '1px dashed rgba(255,51,102,0.3)' }}>
                      <Typography variant="caption" sx={{ color: '#ff3366', display: 'block', mb: 1 }}>IDENTICAL REQUEST BEING REPLAYED:</Typography>
                      <pre>{JSON.stringify({ transactionId: txData.txId, senderAccount: 'A001', receiverAccount: 'A002', amount: 1000, nonce: txData.nonce }, null, 2)}</pre>
                    </Box>
                    <Button id="replay-attack-btn" fullWidth variant="contained" onClick={simulateReplay}
                      startIcon={<ReplayIcon />}
                      sx={{ background: 'linear-gradient(135deg, #ff3366, #cc0033)', fontWeight: 700, py: 1.3, fontSize: 13 }}>
                      SIMULATE REPLAY ATTACK
                    </Button>
                  </>
                )}
                {(step === 'replaying') && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#ff3366', mb: 2 }} />
                    <Typography sx={{ color: '#ff3366', fontWeight: 600 }}>Sending replay to security gateway...</Typography>
                  </Box>
                )}
                {replayResult && (
                  <Box>
                    <Chip label={replayResult.status} sx={{ mb: 1.5, bgcolor: isBlocked ? 'rgba(255,51,102,0.15)' : 'rgba(255,140,0,0.1)', color: isBlocked ? '#ff3366' : '#ff8c00', fontWeight: 700 }} />
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
                  Complete Step 1 first
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Panel 3 — AI Analysis */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%', border: replayResult ? '1px solid rgba(139,92,246,0.3)' : undefined }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PsychologyIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="subtitle2" sx={{ color: '#8b5cf6', fontWeight: 700 }}>PANEL 3 — AI Analysis</Typography>
            </Box>

            {replayResult ? (
              <Box>
                <Box sx={{ p: 2, bgcolor: 'rgba(139,92,246,0.08)', borderRadius: 1, border: '1px solid rgba(139,92,246,0.2)', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#8b5cf6' }}>Prediction</Typography>
                  <Typography variant="h6" sx={{ color: isBlocked ? '#ff3366' : '#00ff88', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{replayResult.securityStatus}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Confidence: {((replayResult.confidence || 0) * 100).toFixed(1)}%</Typography>
                  <br />
                  <Typography variant="caption" sx={{ color: isBlocked ? '#ff3366' : '#00ff88' }}>Risk: {replayResult.riskScore?.toFixed(1)} / 100 — {replayResult.severity}</Typography>
                </Box>

                {replayResult.evidence?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>Detection Evidence:</Typography>
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
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>AI Response Actions:</Typography>
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
                  Reset Demo
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography sx={{ color: '#334155', textAlign: 'center', fontSize: 13 }}>
                  AI analysis will appear after replay simulation
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
