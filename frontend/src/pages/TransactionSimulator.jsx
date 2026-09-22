import { useState } from 'react'
import {
  Box, Paper, Grid, Typography, TextField, Button, Alert, Chip,
  CircularProgress, Divider, InputAdornment
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { transactionAPI } from '../services/api'

function genNonce() { return Math.random().toString(36).substring(2, 14).toUpperCase() }
function genTxId() { return 'TX-' + Date.now().toString(36).toUpperCase() }

const RiskBar = ({ score }) => {
  const color = score > 80 ? '#ff3366' : score > 60 ? '#ff8c00' : score > 30 ? '#ffcc00' : '#00ff88'
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>Risk Score</Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{score?.toFixed(1)} / 100</Typography>
      </Box>
      <Box sx={{ height: 6, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${score}%`, bgcolor: color, borderRadius: 3, transition: 'width 0.8s ease-out', boxShadow: `0 0 10px ${color}` }} />
      </Box>
    </Box>
  )
}

export default function TransactionSimulator() {
  const [form, setForm] = useState({ sender: 'A001', receiver: 'A002', amount: '1000', txId: genTxId(), nonce: genNonce() })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const refresh = () => setForm(f => ({ ...f, txId: genTxId(), nonce: genNonce() }))

  const submit = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await transactionAPI.transfer({
        transactionId: form.txId,
        senderAccount: form.sender,
        receiverAccount: form.receiver,
        amount: parseFloat(form.amount),
        nonce: form.nonce,
        timestamp: new Date().toISOString()
      })
      setResult(res.data)
      setHistory(h => [res.data, ...h].slice(0, 10))
      refresh()
    } catch (err) {
      const data = err.response?.data
      if (data?.status === 'BLOCKED') { setResult(data) }
      else setError(err.response?.data?.message || 'Transaction failed')
    } finally { setLoading(false) }
  }

  const isBlocked = result?.status === 'BLOCKED'
  const statusColor = isBlocked ? '#ff3366' : result?.status?.startsWith('SUCCESS') ? '#00ff88' : '#ff8c00'

  return (
    <Box sx={{ animation: 'slide-in 0.4s ease-out' }}>
      <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 0.5 }}>Transaction Simulator</Typography>
      <Typography variant="caption" sx={{ color: '#475569', mb: 3, display: 'block' }}>
        Send legitimate transactions through the full replay-protection pipeline
      </Typography>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#00d4ff', mb: 2, fontWeight: 600 }}>New Transaction</Typography>

            <TextField fullWidth label="Transaction ID" value={form.txId}
              onChange={e => setForm({ ...form, txId: e.target.value })}
              sx={{ mb: 2 }} inputProps={{ style: { fontFamily: 'JetBrains Mono, monospace', fontSize: 13 } }} />

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={6}><TextField fullWidth label="Sender Account" value={form.sender} onChange={e => setForm({ ...form, sender: e.target.value })} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Receiver Account" value={form.receiver} onChange={e => setForm({ ...form, receiver: e.target.value })} /></Grid>
            </Grid>

            <TextField fullWidth label="Amount (USD)" type="number" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ mb: 2 }} />

            <TextField fullWidth label="Nonce" value={form.nonce}
              InputProps={{ readOnly: true }}
              sx={{ mb: 3 }}
              helperText="Auto-generated unique nonce — prevents replay attacks"
              inputProps={{ style: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12 } }} />

            <Button id="send-transaction-btn" fullWidth variant="contained" onClick={submit} disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
              sx={{ py: 1.3, background: 'linear-gradient(135deg, #00d4ff, #0066cc)', fontSize: 14, fontWeight: 700 }}>
              {loading ? 'Processing...' : 'Send Legitimate Transaction'}
            </Button>
            <Button fullWidth variant="outlined" onClick={refresh} size="small" sx={{ mt: 1, color: '#64748b', borderColor: '#64748b' }}>
              Generate New ID/Nonce
            </Button>

            {error && <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(255,51,102,0.1)' }}>{error}</Alert>}
          </Paper>
        </Grid>

        {/* Result */}
        <Grid item xs={12} md={7}>
          {result ? (
            <Paper sx={{ p: 3, border: `1px solid ${statusColor}30`, animation: 'slide-in 0.3s ease-out' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                {isBlocked
                  ? <ErrorIcon sx={{ color: '#ff3366', fontSize: 28 }} />
                  : <CheckCircleIcon sx={{ color: '#00ff88', fontSize: 28 }} />}
                <Box>
                  <Typography variant="h6" sx={{ color: statusColor, fontWeight: 700 }}>
                    {isBlocked ? 'TRANSACTION BLOCKED' : 'TRANSACTION SUCCESSFUL'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569' }}>
                    {new Date(result.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip label={result.securityStatus} size="small"
                    sx={{ bgcolor: isBlocked ? 'rgba(255,51,102,0.15)' : 'rgba(0,255,136,0.15)', color: isBlocked ? '#ff3366' : '#00ff88', fontWeight: 700 }} />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                  ['Transaction ID', result.transactionId],
                  ['Nonce', result.nonce],
                  ['Sender', result.senderAccount],
                  ['Receiver', result.receiverAccount],
                  ['Amount', `$${result.amount}`],
                  ['Severity', result.severity],
                  ['Confidence', `${((result.confidence || 0) * 100).toFixed(1)}%`],
                  ['ML Prediction', result.mlPrediction],
                ].map(([k, v]) => (
                  <Grid item xs={6} key={k}>
                    <Typography variant="caption" sx={{ color: '#475569' }}>{k}</Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, wordBreak: 'break-all' }}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>

              <RiskBar score={result.riskScore || 0} />

              {result.explanation && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>AI Explanation</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>{result.explanation}</Typography>
                </Box>
              )}

              {result.evidence?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>Detection Evidence</Typography>
                  {result.evidence.map((e, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8, mb: 0.5 }}>
                      <ErrorIcon sx={{ color: '#ff8c00', fontSize: 12, mt: 0.2, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 11 }}>{e}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {result.incidentId && (
                <Chip label={`Incident: ${result.incidentId}`} size="small" sx={{ mt: 2, bgcolor: 'rgba(255,51,102,0.1)', color: '#ff3366', fontFamily: 'JetBrains Mono, monospace' }} />
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
              <Box sx={{ textAlign: 'center' }}>
                <SendIcon sx={{ fontSize: 48, color: '#1e3a5f', mb: 2 }} />
                <Typography sx={{ color: '#475569' }}>Transaction results will appear here</Typography>
                <Typography variant="caption" sx={{ color: '#334155' }}>Complete the form and click Send</Typography>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* History */}
        {history.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>Transaction History (this session)</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                  <thead>
                    <tr style={{ color: '#475569' }}>
                      {['TX ID', 'Amount', 'Status', 'Security', 'Risk', 'Replay'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{tx.transactionId}</td>
                        <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>${tx.amount}</td>
                        <td style={{ padding: '8px 12px', color: tx.status === 'BLOCKED' ? '#ff3366' : '#00ff88' }}>{tx.status}</td>
                        <td style={{ padding: '8px 12px', color: tx.securityStatus === 'REPLAY_ATTACK' ? '#ff3366' : '#94a3b8' }}>{tx.securityStatus}</td>
                        <td style={{ padding: '8px 12px', color: (tx.riskScore || 0) > 60 ? '#ff3366' : '#00ff88' }}>{tx.riskScore?.toFixed(1)}</td>
                        <td style={{ padding: '8px 12px', color: tx.isReplay ? '#ff3366' : '#00ff88' }}>{tx.isReplay ? 'YES' : 'NO'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
