"""
train.py — Random Forest + Isolation Forest training script
for AI-Based Replay Attack Detection Lab.

Run:
    python train.py

Output:
    model/replay_forest.joblib         — trained Random Forest classifier
    model/label_encoder.joblib         — fitted LabelEncoder
    model/feature_importance.json      — feature importance from Random Forest
    model/training_metrics.json        — accuracy, precision, recall, F1
    model/isolation_forest.joblib      — Isolation Forest for anomaly detection

DISCLAIMER: Trained on synthetic educational data — do NOT claim these metrics
represent real-world system performance.
"""

import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, classification_report, confusion_matrix)
import joblib

from data.generate_dataset import generate_dataset

RANDOM_SEED = 42
MODEL_DIR = "model"

FEATURE_COLUMNS = [
    "requestFrequency",
    "transactionIdReuse",
    "nonceReuse",
    "timestampAge",
    "requestInterval",
    "ipChanged",
    "sessionChanged",
    "behaviorDeviation",
    "previousRequestCount",
    "duplicateRequestCount",
    "sessionSequenceDeviation",
    "transactionFrequency",
    "sessionDuration",
    "loginTimeDeviation",
    "deviceDeviation"
]

def train():
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("=" * 60)
    print("AI Replay Attack Detection — Model Training")
    print("=" * 60)

    # 1. Generate / load dataset
    print("\n[1] Generating synthetic training dataset...")
    df = generate_dataset()

    X = df[FEATURE_COLUMNS].values
    le = LabelEncoder()
    y = le.fit_transform(df["label"])
    print(f"Classes: {list(le.classes_)}")

    # 2. Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )
    print(f"\n[2] Split: {len(X_train)} train / {len(X_test)} test samples")

    # 3. Train Random Forest
    print("\n[3] Training Random Forest Classifier...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=RANDOM_SEED,
        n_jobs=-1,
        class_weight="balanced"
    )
    rf.fit(X_train, y_train)

    # 4. Evaluate
    y_pred = rf.predict(X_test)
    y_prob = rf.predict_proba(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print(f"\n[4] Evaluation Metrics (on synthetic test set):")
    print(f"    Accuracy  : {accuracy:.4f}")
    print(f"    Precision : {precision:.4f}")
    print(f"    Recall    : {recall:.4f}")
    print(f"    F1-Score  : {f1:.4f}")
    print(f"\n    Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Cross-validation
    cv_scores = cross_val_score(rf, X, y, cv=5, scoring="f1_weighted")
    print(f"    5-Fold CV F1: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # 5. Feature importance
    importances = rf.feature_importances_
    feature_importance = dict(zip(FEATURE_COLUMNS, [float(v) for v in importances]))
    sorted_fi = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True))

    print("\n[5] Feature Importance:")
    for feat, imp in sorted_fi.items():
        bar = "#" * int(imp * 50)
        print(f"    {feat:<28} {bar} {imp:.4f}")

    # 6. Train Isolation Forest (anomaly detection supplement)
    print("\n[6] Training Isolation Forest (anomaly detection)...")
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.3,
        random_state=RANDOM_SEED
    )
    iso_forest.fit(X_train)

    # 7. Save models and metadata
    print("\n[7] Saving models...")
    joblib.dump(rf, f"{MODEL_DIR}/replay_forest.joblib")
    joblib.dump(le, f"{MODEL_DIR}/label_encoder.joblib")
    joblib.dump(iso_forest, f"{MODEL_DIR}/isolation_forest.joblib")

    with open(f"{MODEL_DIR}/feature_importance.json", "w") as f:
        json.dump(sorted_fi, f, indent=2)

    metrics = {
        "disclaimer": "Metrics calculated on SYNTHETIC educational dataset only",
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "classes": list(le.classes_),
        "accuracy": float(accuracy),
        "precision_weighted": float(precision),
        "recall_weighted": float(recall),
        "f1_weighted": float(f1),
        "cv_f1_mean": float(cv_scores.mean()),
        "cv_f1_std": float(cv_scores.std()),
        "feature_importance": sorted_fi,
        "features_used": FEATURE_COLUMNS
    }

    with open(f"{MODEL_DIR}/training_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n[OK] Random Forest  -> {MODEL_DIR}/replay_forest.joblib")
    print(f"[OK] Label Encoder  -> {MODEL_DIR}/label_encoder.joblib")
    print(f"[OK] Isolation Forest -> {MODEL_DIR}/isolation_forest.joblib")
    print(f"[OK] Feature Importance -> {MODEL_DIR}/feature_importance.json")
    print(f"[OK] Metrics -> {MODEL_DIR}/training_metrics.json")
    print("\n[DONE] Models ready. Start the API with: uvicorn app.main:app --port 8000")
    return metrics

if __name__ == "__main__":
    train()
