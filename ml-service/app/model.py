"""
model.py — Loads the trained Random Forest and Isolation Forest models
and exposes a predict() function for the FastAPI app.
"""

import os
import json
import numpy as np
import joblib
from pathlib import Path

MODEL_DIR = Path(__file__).parent.parent / "model"

FEATURE_ORDER = [
    "requestFrequency",
    "transactionIdReuse",
    "nonceReuse",
    "timestampAge",
    "requestInterval",
    "ipChanged",
    "sessionChanged",
    "behaviorDeviation",
    "previousRequestCount",
    "duplicateRequestCount"
]

# Top features to always report (sorted by trained importance)
TOP_N_FEATURES = 5


class ModelStore:
    """Singleton that loads and caches models at startup."""

    def __init__(self):
        self.rf = None
        self.le = None
        self.iso_forest = None
        self.feature_importance: dict = {}
        self.loaded = False
        self._load()

    def _load(self):
        rf_path = MODEL_DIR / "replay_forest.joblib"
        le_path = MODEL_DIR / "label_encoder.joblib"
        iso_path = MODEL_DIR / "isolation_forest.joblib"
        fi_path = MODEL_DIR / "feature_importance.json"

        if not rf_path.exists():
            print(f"[WARN] Model not found at {rf_path}. Run train.py first.")
            return

        self.rf = joblib.load(rf_path)
        self.le = joblib.load(le_path)

        if iso_path.exists():
            self.iso_forest = joblib.load(iso_path)

        if fi_path.exists():
            with open(fi_path) as f:
                self.feature_importance = json.load(f)

        self.loaded = True
        print(f"[OK] Models loaded from {MODEL_DIR}")
        print(f"[OK] Classes: {list(self.le.classes_)}")

    def predict(self, features: dict) -> dict:
        if not self.loaded:
            return self._fallback_predict(features)

        # Build feature vector in correct order
        x = np.array([[features.get(f, 0.0) for f in FEATURE_ORDER]])

        # Random Forest prediction
        y_pred = self.rf.predict(x)[0]
        y_prob = self.rf.predict_proba(x)[0]
        prediction = self.le.inverse_transform([y_pred])[0]

        # Class probabilities
        class_probs = {cls: float(p) for cls, p in zip(self.le.classes_, y_prob)}

        # Confidence = max probability
        confidence = float(max(y_prob))

        # Risk score: weighted by class danger
        danger_weights = {"NORMAL": 0.0, "SUSPICIOUS": 0.5, "REPLAY_ATTACK": 1.0}
        risk_score = sum(
            class_probs.get(cls, 0.0) * danger_weights.get(cls, 0.5) * 100
            for cls in danger_weights
        )
        risk_score = min(round(risk_score, 2), 100.0)

        # Important features from feature importance
        sorted_fi = sorted(self.feature_importance.items(), key=lambda x: x[1], reverse=True)
        important_features = [f for f, _ in sorted_fi[:TOP_N_FEATURES]]

        # Isolation Forest anomaly score
        iso_score = None
        if self.iso_forest is not None:
            raw = float(self.iso_forest.decision_function(x)[0])
            iso_score = round(raw, 4)

        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "riskScore": risk_score,
            "importantFeatures": important_features,
            "featureImportance": self.feature_importance,
            "classProbabilities": {k: round(v, 4) for k, v in class_probs.items()},
            "isolationScore": iso_score,
            "fromMlService": True
        }

    def _fallback_predict(self, features: dict) -> dict:
        """Rule-based fallback when model is not loaded."""
        risk = 0.0
        important = []
        if features.get("nonceReuse", 0) > 0:
            risk += 40; important.append("nonceReuse")
        if features.get("transactionIdReuse", 0) > 0:
            risk += 35; important.append("transactionIdReuse")
        if features.get("requestFrequency", 0) > 10:
            risk += 15; important.append("requestFrequency")
        if features.get("timestampAge", 0) > 300:
            risk += 10; important.append("timestampAge")
        risk = min(risk, 100.0)
        confidence = risk / 100.0
        prediction = "REPLAY_ATTACK" if risk > 80 else "SUSPICIOUS" if risk > 40 else "NORMAL"
        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "riskScore": round(risk, 2),
            "importantFeatures": important,
            "featureImportance": {},
            "classProbabilities": {prediction: confidence},
            "isolationScore": None,
            "fromMlService": False
        }


# Global model store instance
store = ModelStore()
