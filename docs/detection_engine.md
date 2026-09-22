# Detection & Response Engine Architecture

## 1. Dual-Layer Defense Overview

Replay attacks exploit the fundamental nature of HTTP requests: a captured valid packet can be re-transmitted unchanged to trigger duplicate operations (such as bank transfers or balance debits).

This system uses a **Dual-Layer Defense Model**:
1. **Deterministic Cryptographic Verification (Traditional Layer)**: Verifies unique tokens, nonces, timestamps, and request signatures.
2. **Behavioral Machine Learning (AI Layer)**: Analyzes statistical anomalies in timing, request frequency, inter-arrival intervals, and payload patterns.

```
Incoming Request
      │
      ├─► [Traditional Layer]
      │     ├─ Nonce Reuse Check
      │     ├─ Timestamp Freshness (±300s window)
      │     ├─ Transaction ID Uniqueness
      │     └─ Request Fingerprint Check
      │
      ├─► [AI Layer (FastAPI)]
      │     ├─ Random Forest Classification (Normal vs. Replay)
      │     ├─ Isolation Forest Anomaly Detection
      │     └─ Feature Importance & Explainability
      │
      ▼
[Risk Engine: Composite Score 0-100]
      │
      ▼
[Response Engine: Deterministic Action Matrix]
```

---

## 2. Feature Extraction Pipeline

The backend extracts 10 features per transaction before calling the ML model:

| Feature Name | Description | Normal Range | Replay Indicator |
|--------------|-------------|--------------|------------------|
| `time_delta_seconds` | Elapsed time since original timestamp | 0 - 5 | > 300 |
| `nonce_age_seconds` | Time elapsed since nonce generation | 0 - 30 | > 300 |
| `request_frequency` | Requests per minute from client IP | 1 - 20 | > 60 |
| `payload_size` | Size of JSON payload in bytes | 200 - 800 | Exact match with cached tx |
| `amount` | Transaction value | 1.0 - 50000.0 | High value targeted |
| `is_duplicate_nonce` | Binary flag for nonce collision | 0 | 1 |
| `is_duplicate_txid` | Binary flag for txId collision | 0 | 1 |
| `ip_reputation_score` | Threat intelligence score (0-100) | 0 - 20 | > 70 |
| `user_agent_divergence`| Divergence from user's historical UA | 0 | 1 |
| `latency_jitter_ms` | Network transit jitter variance | 10 - 150 | Anomalous timing |

---

## 3. Risk Engine Scoring & Response Matrix

The Risk Engine calculates a normalized risk score from 0 to 100 combining deterministic flags and ML output.

| Risk Score | Severity Level | Policy Action | Incident Created? |
|------------|----------------|---------------|-------------------|
| 0 - 29 | `NORMAL` | `ALLOW` | No |
| 30 - 59 | `SUSPICIOUS` | `FLAG_AND_LOG` | Yes (INFO) |
| 60 - 84 | `HIGH` | `STEP_UP_CHALLENGE` / `BLOCK` | Yes (WARNING) |
| 85 - 100 | `CRITICAL` | `REQUEST_BLOCKED` + `SESSION_REVOKED` | Yes (CRITICAL) |
