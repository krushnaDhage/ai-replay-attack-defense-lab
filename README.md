# AI-Based Replay Attack Detection, Explanation & Automated Response Lab

> **Educational Cybersecurity Laboratory** — College/University Project Demonstration
>
> All attack simulations operate ONLY against the application's own local demo API.

---

## Project Overview

This platform is a complete, working cybersecurity laboratory demonstrating how AI and traditional security mechanisms combine to detect, explain, and automatically respond to **replay attacks** in real time.

The system implements the full pipeline:

```
ATTACK → OBSERVATION → AI DETECTION → EXPLANATION → DECISION → MITIGATION → VERIFICATION
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
| ML Model | scikit-learn Random Forest | 1.9+ |
| Anomaly Detection | Isolation Forest | (same) |
| Containerization | Docker + Docker Compose | 29.x |

---

## Architecture

```
Browser (React/Vite :5173)
         │
         │ Axios + JWT
         ▼
Spring Boot API (:8080)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
ReplayProtection   Feature Extraction
    │                    │
    │              Python FastAPI (:8000)
    │              Random Forest + Isolation Forest
    │                    │
    └──────┬─────────────┘
           │
      Risk Engine (0-100)
           │
    Response Policy Engine
           │
    ┌──────┴──────┐
  ALLOW         BLOCK
                 │
          PostgreSQL (:5432)
          SecurityIncident
```

---

## Quick Start

### Prerequisites
- Java 21, Maven 3.9+
- Python 3.11+
- Node 18+
- Docker + Docker Compose

### Option A: Local Development

```bash
# 1. Start PostgreSQL via Docker
docker compose up postgres -d

# 2. Train the ML model
cd ml-service
python train.py

# 3. Start ML service
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 4. Start backend (new terminal)
cd backend
mvn spring-boot:run

# 5. Start frontend (new terminal)
cd frontend
npm install
npm run dev

# 6. Open browser
# http://localhost:5173
```

### Option B: Full Docker Deploy

```bash
cp .env.example .env
# Edit .env with your values
docker compose up --build
# Open http://localhost:5173
```

---

## Demo Flow

1. Register a user → Login
2. Open **Transaction Simulator** → send a legitimate transaction
3. Observe: SUCCESS + NORMAL security status + risk score ~5
4. Open **Attack Simulator**
5. A transaction is captured automatically
6. Click **SIMULATE REPLAY ATTACK**
7. Watch the animated flow: Capture → Gateway → AI Detection
8. Observe: BLOCKED + REPLAY_ATTACK + risk score ~90+
9. See the security incident created in **Incidents** page
10. View **AI Analysis** page — feature importance from the trained model
11. Send a new legitimate transaction → shows normal traffic still works

---

## Replay Protection Layers

| Layer | Check | How |
|-------|-------|-----|
| 1 | Transaction ID reuse | DB lookup |
| 2 | Nonce reuse | NonceRecord table |
| 3 | Timestamp freshness | ±5 min window |
| 4 | Request fingerprint | SHA-256 hash |
| 5 | ML behavioral model | Random Forest (10 features) |

---

## ML Model

- **Algorithm**: Random Forest Classifier (200 estimators)
- **Supplement**: Isolation Forest for anomaly detection
- **Classes**: `NORMAL` / `SUSPICIOUS` / `REPLAY_ATTACK`
- **Features**: requestFrequency, transactionIdReuse, nonceReuse, timestampAge, requestInterval, ipChanged, sessionChanged, behaviorDeviation, previousRequestCount, duplicateRequestCount
- **Training data**: 2000 synthetic samples (clearly documented as synthetic)
- **Validation**: 5-fold cross-validation

> **DISCLAIMER**: The model is trained on synthetic educational data. Performance metrics reflect the synthetic dataset only and do not represent real-world system effectiveness.

---

## Risk Classification

| Score | Severity | Response |
|-------|----------|----------|
| 0–30 | NORMAL | Allow request |
| 31–60 | SUSPICIOUS | Flag & log |
| 61–80 | HIGH | Reject + alert admin |
| 81–100 | CRITICAL | Block + invalidate nonce + create incident |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login + JWT |
| POST | `/api/transactions/transfer` | JWT | Replay-protected transaction |
| GET | `/api/transactions` | JWT | List transactions |
| POST | `/api/attack-simulator/capture` | JWT | Capture request |
| POST | `/api/attack-simulator/replay` | JWT | Replay attack (lab only) |
| GET | `/api/security/incidents` | JWT | List incidents |
| GET | `/api/security/events` | JWT | Event timeline |
| GET | `/api/security/dashboard` | JWT | Live metrics |
| GET | `/api/health` | Public | System health |
| POST | `/predict` (ML) | ML Service | ML prediction |
| GET | `/metrics` (ML) | ML Service | Training metrics |
| GET | `/features` (ML) | ML Service | Feature importance |

**Swagger UI**: http://localhost:8080/swagger-ui.html

---

## Testing

```bash
# Backend integration tests (uses H2 in-memory DB)
cd backend
mvn test

# ML service tests
cd ml-service
python -m pytest tests/ -v
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User accounts and roles |
| `transactions` | All processed transactions with security metadata |
| `nonce_records` | Used nonces (prevents reuse) |
| `security_events` | Audit trail of all security events |
| `security_incidents` | Forensic incident records |
| `attack_simulations` | Captured requests for replay demo |

---

## Limitations

- ML trained on **synthetic** data — metrics do not represent real-world accuracy
- LLM explanation is disabled by default; deterministic rule-based explainer is used
- This is an educational demonstration, not a production security system
- Isolation Forest scores are supplementary only

---

## Project Structure

```
replay-attack-defense/
├── backend/                   # Spring Boot 3.3 + Java 21
│   ├── src/main/java/com/replaylab/backend/
│   │   ├── controller/        # REST controllers
│   │   ├── service/           # Business logic
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Spring Data repos
│   │   ├── security/          # JWT filter + util
│   │   ├── ml/                # ML client + feature extractor
│   │   ├── risk/              # Risk engine
│   │   ├── response/          # Response policy engine
│   │   └── incident/          # Incident management
│   └── pom.xml
├── ml-service/                # Python FastAPI + scikit-learn
│   ├── app/                   # FastAPI application
│   ├── data/                  # Dataset generator
│   ├── model/                 # Saved .joblib models
│   ├── tests/                 # pytest suite
│   └── train.py               # Training script
├── frontend/                  # React + Vite + MUI
│   └── src/
│       ├── pages/             # 11 pages
│       ├── components/        # Layout sidebar
│       ├── services/          # Axios API client
│       └── context/           # Auth context
├── docker-compose.yml
├── .env.example
└── README.md
```
