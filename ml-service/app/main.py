"""
main.py — FastAPI ML service for Replay Attack Detection Lab

Endpoints:
  POST /predict  — run ML prediction on extracted features
  GET  /health   — service health + model status
  GET  /metrics  — training metrics from last model run
  GET  /features — feature importance from trained model
"""

import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PredictRequest, PredictResponse, HealthResponse
from app.model import store, FEATURE_ORDER

MODEL_DIR = Path(__file__).parent.parent / "model"

app = FastAPI(
    title="Replay Attack ML Detection Service",
    description=(
        "Random Forest + Isolation Forest classifier for replay attack detection. "
        "Operates only on features extracted by the Spring Boot backend from local demo traffic."
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    Run ML prediction on extracted request features.
    Returns prediction class, confidence, risk score, and feature importance.
    """
    features_dict = request.features.model_dump()
    result = store.predict(features_dict)
    return PredictResponse(**result)


@app.get("/health", response_model=HealthResponse)
def health():
    """Check ML service health and model load status."""
    classes = list(store.le.classes_) if store.le is not None else []
    return HealthResponse(
        status="UP",
        modelLoaded=store.loaded,
        version="1.0.0",
        classes=classes,
        featuresExpected=FEATURE_ORDER
    )


@app.get("/metrics")
def metrics():
    """Return training metrics from the last model run."""
    metrics_path = MODEL_DIR / "training_metrics.json"
    if not metrics_path.exists():
        raise HTTPException(
            status_code=404,
            detail="No training metrics found. Run train.py first."
        )
    with open(metrics_path) as f:
        return json.load(f)


@app.get("/features")
def feature_importance():
    """Return feature importance from the trained Random Forest."""
    if not store.feature_importance:
        raise HTTPException(
            status_code=404,
            detail="Feature importance not available. Run train.py first."
        )
    return {
        "featureImportance": store.feature_importance,
        "featuresOrdered": FEATURE_ORDER
    }
