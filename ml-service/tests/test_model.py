"""
tests/test_model.py — pytest tests for the ML service model
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from unittest.mock import patch, MagicMock
import numpy as np

# ──────────────────────────────────────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────────────────────────────────────

NORMAL_FEATURES = {
    "requestFrequency": 1.0,
    "transactionIdReuse": 0,
    "nonceReuse": 0,
    "timestampAge": 5.0,
    "requestInterval": 30.0,
    "ipChanged": 0,
    "sessionChanged": 0,
    "behaviorDeviation": 0.05,
    "previousRequestCount": 1,
    "duplicateRequestCount": 0
}

REPLAY_FEATURES = {
    "requestFrequency": 30.0,
    "transactionIdReuse": 1,
    "nonceReuse": 1,
    "timestampAge": 900.0,
    "requestInterval": 0.2,
    "ipChanged": 1,
    "sessionChanged": 1,
    "behaviorDeviation": 0.95,
    "previousRequestCount": 25,
    "duplicateRequestCount": 10
}


class TestFallbackPredict:
    """Tests for the rule-based fallback (no model file needed)."""

    def test_normal_features_fallback(self):
        from app.model import ModelStore
        ms = ModelStore.__new__(ModelStore)
        ms.rf = None
        ms.le = None
        ms.iso_forest = None
        ms.feature_importance = {}
        ms.loaded = False
        result = ms._fallback_predict(NORMAL_FEATURES)
        assert result["prediction"] == "NORMAL"
        assert result["riskScore"] <= 30
        assert 0.0 <= result["confidence"] <= 1.0
        assert result["fromMlService"] is False

    def test_replay_features_fallback(self):
        from app.model import ModelStore
        ms = ModelStore.__new__(ModelStore)
        ms.rf = None
        ms.le = None
        ms.iso_forest = None
        ms.feature_importance = {}
        ms.loaded = False
        result = ms._fallback_predict(REPLAY_FEATURES)
        assert result["prediction"] == "REPLAY_ATTACK"
        assert result["riskScore"] > 70
        assert result["confidence"] > 0.5

    def test_confidence_is_in_range(self):
        from app.model import ModelStore
        ms = ModelStore.__new__(ModelStore)
        ms.loaded = False
        result = ms._fallback_predict(REPLAY_FEATURES)
        assert 0.0 <= result["confidence"] <= 1.0

    def test_risk_score_capped_at_100(self):
        from app.model import ModelStore
        ms = ModelStore.__new__(ModelStore)
        ms.loaded = False
        extreme = {**REPLAY_FEATURES, "requestFrequency": 1000, "timestampAge": 99999}
        result = ms._fallback_predict(extreme)
        assert result["riskScore"] <= 100.0


class TestSchemas:
    """Tests for Pydantic schemas."""

    def test_features_defaults(self):
        from app.schemas import FeaturesInput
        f = FeaturesInput()
        assert f.requestFrequency == 0.0
        assert f.nonceReuse == 0

    def test_predict_request_valid(self):
        from app.schemas import PredictRequest, FeaturesInput
        req = PredictRequest(features=FeaturesInput(**NORMAL_FEATURES))
        assert req.features.transactionIdReuse == 0

    def test_predict_response_model(self):
        from app.schemas import PredictResponse
        resp = PredictResponse(
            prediction="REPLAY_ATTACK",
            confidence=0.97,
            riskScore=97.4,
            importantFeatures=["nonceReuse", "transactionIdReuse"],
            featureImportance={"nonceReuse": 0.35},
            classProbabilities={"REPLAY_ATTACK": 0.97}
        )
        assert resp.prediction == "REPLAY_ATTACK"
        assert resp.fromMlService is True


class TestTraining:
    """Tests that training script generates expected outputs."""

    def test_dataset_generation(self):
        import tempfile, os
        from data.generate_dataset import generate_dataset
        df = generate_dataset()
        assert len(df) == 2000
        assert set(df["label"].unique()) == {"NORMAL", "SUSPICIOUS", "REPLAY_ATTACK"}
        assert "nonceReuse" in df.columns

    def test_replay_class_has_nonce_reuse(self):
        from data.generate_dataset import generate_dataset
        df = generate_dataset()
        replay_df = df[df["label"] == "REPLAY_ATTACK"]
        assert replay_df["nonceReuse"].mean() == 1.0

    def test_normal_class_has_no_tx_reuse(self):
        from data.generate_dataset import generate_dataset
        df = generate_dataset()
        normal_df = df[df["label"] == "NORMAL"]
        assert normal_df["transactionIdReuse"].mean() == 0.0
