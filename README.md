# AI-Based Replay Attack Detection, Explanation & Automated Response Lab

> **Educational Cybersecurity Laboratory** — College/University Project Demonstration
>
> All attack simulations operate ONLY against the application's own local demo API.

---

## Project Overview

This platform is a complete cybersecurity laboratory demonstrating how traditional security mechanisms and Machine Learning combine to detect, explain, and automatically respond to **replay attacks** in real time.

The application features **Dual Replay Attack Modes**:
1. **EXACT REPLAY (Deterministic Duplicate Detection)**: Replaying exact duplicate requests (identical Transaction ID, Nonce, and payload). Blocked deterministically by Tier 1 checks. *Note: AI is not required for basic duplicate detection.*
2. **ADAPTIVE / BEHAVIORAL REPLAY (Fresh Nonce/TxID Attack Vector)**: Attacker generates a fresh Transaction ID, fresh Nonce, and valid Timestamp to bypass traditional checks (`"NO EXACT REPLAY DETECTED"`). **Behavioral ML** detects rapid inter-request intervals (0.2s), frequency anomalies, and sequence deviations to predict `SUSPICIOUS_BEHAVIOR` or `REPLAY_ATTACK` and trigger automated mitigation.

```
ATTACK → OBSERVATION → DUAL-TIER INSPECTION (Rule + ML) → EXPLANATION → DECISION → MITIGATION → VERIFICATION
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite + MUI | 18.x / 5.x |
| Backend | Spring Boot + Java | 3.3.x / 21 LTS |
| Security | Spring Security + JWT (JJWT) | 6.x / 0.12.6 |
| Database | PostgreSQL | 16 |
| ML Service | Python FastAPI | 0.141+ |
| ML Model | scikit-learn Random Forest + Isolation Forest | 1.9+ |
| Containerization | Docker + Docker Compose | 29.x |

---

## Architecture

```
Browser (React/Vite :3000 / :5173)
         │
         │ Axios + JWT
         ▼
Spring Boot API (:8080)
         │
    ┌────┴────────────────────────────────┐
    │                                     │
    ▼                                     ▼
Tier 1: Deterministic ReplayCheck    Tier 2: Behavioral Feature Extractor (15 features)
(Nonce & TxID Lookup)                     │
    │                                Python FastAPI ML Service (:8000)
    │                                Random Forest (Supervised) + Isolation Forest (Anomaly)
    │                                     │
    └──────────────────┬──────────────────┘
                       │
                  Risk Engine (0-100)
                       │
                Response Policy Engine
                       │
                ┌──────┴──────┐
              ALLOW         BLOCK / THROTTLE
                             │
                      PostgreSQL (:5432)
                      SecurityIncident Audit Record
```

---

## Quick Start

### Prerequisites
- Java 21, Maven 3.9+
- Python 3.11+
- Node 18+
- Docker + Docker Compose

### Quick Docker Deploy

```bash
cp .env.example .env
docker compose up --build
# Open http://localhost:3000
```

---

## Dual Attack Simulation Modes

### Mode 1: Exact Duplicate Replay
- **Attacker Action**: Intercepts request and replays it identically (same Tx ID, same Nonce).
- **Security Check Result**: Tier 1 Nonce & Tx ID lookup flags duplicate (`409 Conflict`).
- **Lab Visual Indicator**: *"AI NOT REQUIRED FOR BASIC DUPLICATE DETECTION"*

### Mode 2: Adaptive Behavioral Replay
- **Attacker Action**: Generates fresh Tx ID (`TX-ADAPTIVE-NEW`), fresh Nonce (`NONCE-FRESH-NEW`), and current Timestamp to bypass simple duplicate filters.
- **Traditional Check Result**: `"NO EXACT REPLAY DETECTED"` — All Tier 1 checks pass!
- **Behavioral AI Result**: Tier 2 ML model detects 0.2s inter-request interval, frequency surge, and sequence deviation index 0.85 -> Predicts `SUSPICIOUS_BEHAVIOR`, calculates high risk score (92.5/100), and applies automated mitigation.

---

## ML Model & 15-Feature Vector

- **Algorithms**: Random Forest Classifier (200 trees) + Isolation Forest (Unsupervised Anomaly Detection)
- **Classes**: `NORMAL` / `SUSPICIOUS` / `SUSPICIOUS_BEHAVIOR` / `REPLAY_ATTACK`
- **Feature Vector (15 Features)**:
  1. `requestFrequency` (requests/min)
  2. `transactionIdReuse` (count)
  3. `nonceReuse` (count)
  4. `timestampAge` (seconds)
  5. `requestInterval` (seconds between requests)
  6. `ipChanged` (0 or 1)
  7. `sessionChanged` (0 or 1)
  8. `behaviorDeviation` (index 0.0 - 1.0)
  9. `previousRequestCount`
  10. `duplicateRequestCount`
  11. `sessionSequenceDeviation` (index 0.0 - 1.0)
  12. `transactionFrequency` (tx/min)
  13. `sessionDuration` (seconds)
  14. `loginTimeDeviation` (seconds)
  15. `deviceDeviation` (hash delta)

> **DISCLAIMER**: The model is trained on a synthetic educational dataset (2,200 samples). Performance metrics reflect the synthetic dataset only and do not represent real-world commercial effectiveness.

---

## Risk Classification & Mitigation Scale

| Score | Severity | Classification | Response Action |
|-------|----------|----------------|-----------------|
| 0–30 | NORMAL | `NORMAL` | Allow request |
| 31–60 | LOW/MEDIUM | `SUSPICIOUS` | Flag & log audit event |
| 61–80 | HIGH | `SUSPICIOUS_BEHAVIOR` | Throttle account + temporary rate limit |
| 81–100 | CRITICAL | `REPLAY_ATTACK` | Block request + invalidate nonce + create forensic incident |

---

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/transfer` | Replay-protected financial transaction transfer |
| POST | `/api/attack-simulator/capture` | Capture request payload for lab replay |
| POST | `/api/attack-simulator/replay` | Mode 1: Exact Duplicate Replay simulation |
| POST | `/api/attack-simulator/replay-adaptive` | Mode 2: Adaptive Behavioral Replay simulation |
| GET | `/api/security/incidents` | Forensic incident audit records |
| GET | `/api/security/dashboard` | Live metrics (Exact vs Adaptive counts) |
| GET | `/predict` (ML Service :8000) | Python ML prediction & feature attribution |

---

## Testing

```bash
# Backend integration tests (uses H2 in-memory DB)
cd backend
mvn test

# ML service tests (pytest)
cd ml-service
python -m pytest tests/ -v
```

---

## Project Structure

```
replay-attack-defense/
├── backend/                   # Spring Boot 3.3 + Java 21
│   ├── src/main/java/com/replaylab/backend/
│   │   ├── controller/        # AttackSimulatorController & REST APIs
│   │   ├── service/           # TransactionService, ExplanationService
│   │   ├── entity/            # SecurityIncident, Transaction, NonceRecord
│   │   ├── ml/                # MlFeatures (15 features), FeatureExtractor
│   │   ├── risk/              # RiskEngine
│   │   ├── response/          # ResponsePolicyEngine
│   │   └── incident/          # IncidentService
│   └── pom.xml
├── ml-service/                # Python FastAPI + scikit-learn
│   ├── app/                   # FastAPI schemas, model wrappers
│   ├── data/                  # Synthetic dataset generator (2,200 samples)
│   ├── model/                 # Joblib model artifacts & JSON metrics
│   └── train.py               # ML Training pipeline script
├── frontend/                  # React + Vite + MUI
│   └── src/
│       ├── pages/             # AttackSimulator, BeforeAfter, AIAnalysis, Dashboard, etc.
│       ├── services/          # Axios API client
│       └── context/           # Auth context
├── docker-compose.yml
└── README.md
```
