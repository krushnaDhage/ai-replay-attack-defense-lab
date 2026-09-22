# Step-by-Step Educational Demo Guide

This lab is designed for live university / college project presentations, cybersecurity defense evaluations, and interactive testing.

---

## Scenario: Replay Attack on Fund Transfer API

### Step 1: Start Normal Transaction
1. Navigate to **Transaction Simulator** at `http://localhost:5173/transactions`.
2. Enter transfer details:
   - Sender: `ACC-1001`
   - Recipient: `ACC-2002`
   - Amount: `$500.00`
3. Click **Submit Legitimate Transfer**.
4. Observe the green **Success** response badge with `Risk Score: 5` and transaction status `COMPLETED`.

### Step 2: Capture Legitimate Request
1. Open the **Replay Attack Simulator** tab (`/simulator`).
2. The transaction captured in Step 1 will appear in the **Captured Traffic Buffer** (simulating packet sniffing or MITM intercept).
3. Inspect the raw HTTP payload, headers, nonce token, and timestamp.

### Step 3: Launch Replay Attack
1. Click **Replay Intercepted Request**.
2. Observe the animated transmission across the network diagram.
3. The request hits the Defense Engine.

### Step 4: Visualizing Detection & Mitigation
1. Notice the real-time evaluation panel:
   - **Nonce Check**: `DUPLICATE_DETECTED` (Red indicator)
   - **Timestamp Check**: `WINDOW_EXPIRED` (if delayed)
   - **ML Prediction**: `REPLAY_ATTACK (Confidence: 99.2%)`
   - **Risk Score**: `95 / 100 (CRITICAL)`
   - **Response Action**: `REQUEST_BLOCKED`
2. The transaction status shows **BLOCKED — 403 Forbidden**. No duplicate funds were deducted!

### Step 5: Incident Investigation & Forensics
1. Navigate to **Incident Management** (`/incidents`).
2. Click on the new `CRITICAL` incident to view the full forensic evidence JSON:
   - Nonce fingerprint match
   - ML feature contributions
   - Source IP and simulation session ID
3. Review the **AI Explanation**:
   > *"Request blocked because Nonce `n-a81d4e21b0` was previously consumed at 22:50:12. Behavioral model flagged identical transaction hash with delta latency anomaly."*
