# API Reference & Endpoints

Base URL: `http://localhost:8080/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account.
- **Request Body:**
```json
{
  "username": "alice",
  "password": "Password123!",
  "email": "alice@example.com"
}
```
- **Response `201 Created`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "alice",
  "roles": ["USER"]
}
```

### `POST /api/auth/login`
Authenticates a user and issues a JWT token.
- **Request Body:**
```json
{
  "username": "alice",
  "password": "Password123!"
}
```
- **Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "alice",
  "roles": ["USER"]
}
```

---

## 2. Transaction Endpoints

### `POST /api/transactions/transfer`
Initiates a financial transfer with replay defenses.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "txId": "tx-8f2e-4b1a",
  "senderAccount": "ACC-1001",
  "recipientAccount": "ACC-2002",
  "amount": 250.00,
  "currency": "USD",
  "timestamp": 1726938000000,
  "nonce": "n-a81d4e21b0",
  "fingerprint": "a3f5c9..."
}
```
- **Response `200 OK`:**
```json
{
  "transactionId": "tx-8f2e-4b1a",
  "status": "COMPLETED",
  "riskScore": 4,
  "severity": "NORMAL",
  "action": "ALLOW",
  "replayChecks": {
    "txIdReused": false,
    "nonceReused": false,
    "timestampFresh": true,
    "fingerprintValid": true
  },
  "mlPrediction": {
    "prediction": "NORMAL",
    "confidence": 0.98,
    "anomalyScore": 0.05
  },
  "explanation": "Transaction passed all nonce freshness and ML behavioral baselines."
}
```

---

## 3. Attack Simulator Endpoints

### `POST /api/attack-simulator/capture`
Simulates an attacker sniffing a valid request from the network.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** (Any raw transaction payload)
- **Response `200 OK`:**
```json
{
  "capturedId": "cap-9912",
  "capturedAt": "2026-09-21T17:22:00Z",
  "payload": { ... }
}
```

### `POST /api/attack-simulator/replay`
Attacker re-submits the captured request payload to the live API.
- **Request Body:**
```json
{
  "capturedId": "cap-9912",
  "tamperTimestamp": false,
  "tamperNonce": false
}
```
- **Response `200 OK`:** (Returns defensive evaluation result showing blocked status and risk scoring).

---

## 4. Security & Incident Endpoints

### `GET /api/security/events`
Returns timeline stream of all transaction security evaluations.

### `GET /api/security/incidents`
Returns forensic incident records with evidence payloads.

### `GET /api/security/dashboard`
Returns aggregated analytics (total transactions, attacks blocked, risk score distribution, top flagged IPs).
