# System Architecture & Design

## 1. High-Level Architecture Overview

The **AI-Based Replay Attack Detection, Explanation & Automated Response Lab** is designed with a defense-in-depth architecture across three decoupled tiers:

```
+-------------------------------------------------------------+
|                 PRESENTATION LAYER (Frontend)               |
|  React 18 + Vite + Material UI (MUI v6) + Recharts + Axios  |
|  Port: 5173                                                 |
+------------------------------+------------------------------+
                               | HTTPS / JSON (JWT Auth)
                               v
+-------------------------------------------------------------+
|                  CORE ENGINE LAYER (Backend)                |
|  Spring Boot 3.3 (Java 21 LTS) + Spring Security 6          |
|  Port: 8080                                                 |
|                                                             |
|  +---------------------+   +-----------------------------+  |
|  | Replay Protection   |   | Feature Extraction Service  |  |
|  | - Nonce Cache       |   | - Latency, Freq, Payload    |  |
|  | - Freshness Window  |   +--------------+--------------+  |
|  | - Fingerprint SHA256|                  |                 |
|  +----------+----------+                  | REST/JSON       |
|             |                             v                 |
|             |              +-----------------------------+  |
|             |              | Python ML Detection Service |  |
|             |              | FastAPI + scikit-learn      |  |
|             |              | Port: 8000                  |  |
|             |              +--------------+--------------+  |
|             +------------+----------------+                 |
|                          |                                  |
|                          v                                  |
|  +-------------------------------------------------------+  |
|  | Risk Engine & Automated Response Policy Engine        |  |
|  | - Score aggregation (0-100)                           |  |
|  | - Deterministic actions (ALLOW, LOG, MFA, BLOCK)      |  |
|  +-----------------------+-------------------------------+  |
|                          |                                  |
+--------------------------+----------------------------------+
                           |
                           v
+-------------------------------------------------------------+
|                  DATA PERSISTENCE LAYER                     |
|  PostgreSQL 16 (Relational Entities & Forensics)            |
|  Port: 5432                                                 |
+-------------------------------------------------------------+
```

---

## 2. Core Components

### 2.1 Backend Core (Spring Boot 3.3 / Java 21)
- **Authentication & Authorization**: Stateless JWT security filter verifying HMAC-SHA256 tokens on protected routes.
- **Traditional Replay Protection Filter**:
  - `txId` unique constraint.
  - `nonce` storage with automatic expiration.
  - `timestamp` verification within a configurable freshness window (±300 seconds).
  - SHA-256 request payload + header fingerprinting.
- **Feature Extractor**: Computes 10 real-time behavioral features from incoming HTTP requests.
- **Risk Engine**: Normalizes traditional validation flags and ML model inference into a unified risk score (0–100).
- **Automated Response Engine**: Enforces deterministic mitigation policies (`ALLOW`, `FLAG_AND_LOG`, `STEP_UP_CHALLENGE`, `REQUEST_BLOCKED`, `SESSION_REVOKED`).
- **Incident & Forensics Service**: Records every blocked or suspicious transaction with full evidence JSON payloads for forensic review.

### 2.2 Machine Learning Service (FastAPI + scikit-learn)
- **Random Forest Classifier**: Multi-tree ensemble trained on synthetic normal vs. replayed HTTP transaction traffic.
- **Isolation Forest**: Unsupervised anomaly detection identifying out-of-distribution network payloads and timing anomalies.
- **Explainability Engine**: Computes feature importance deltas and generates deterministic natural language explanations for why a request was flagged.

### 2.3 Frontend Dashboard (React + Material UI)
- Interactive 3-panel Attack Simulator (Victim View, Attacker Intercept & Replay, Defense Engine View).
- Real-time visual pipeline diagrams showing the exact layer where a transaction was allowed or rejected.
- Metrics dashboard with charts displaying attack frequency, severity breakdowns, and ML confidence distributions.
- Forensics log viewer with deep JSON inspection and incident audit trails.

---

## 3. Communication Protocols

| Source | Target | Protocol | Format | Security |
|--------|--------|----------|--------|----------|
| Frontend | Backend | HTTP/1.1 REST | JSON | Bearer JWT Token |
| Backend | ML Service | HTTP/1.1 REST | JSON | Internal Network / Localhost |
| Backend | PostgreSQL | JDBC (TCP) | Binary Protocol | Credential Auth / Connection Pool |
