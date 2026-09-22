"""
Synthetic training dataset generator for replay attack detection.

IMPORTANT DISCLAIMER:
This dataset is SYNTHETIC and generated for educational/demonstration purposes only.
It does NOT represent real-world attack prevalence, distributions, or statistics.
The feature values and ratios are designed to clearly illustrate classification concepts
for an academic/college project demonstration.

Classes:
  0 = NORMAL        (legitimate traffic)
  1 = SUSPICIOUS    (borderline anomalous traffic)
  2 = REPLAY_ATTACK (confirmed replay attacks)
"""

import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

N_NORMAL = 1000
N_SUSPICIOUS = 300
N_ADAPTIVE = 400
N_REPLAY = 500

def generate_normal():
    """Legitimate traffic: low frequency, unique IDs/nonces, fresh timestamps, normal behavior."""
    return pd.DataFrame({
        "requestFrequency":         np.random.uniform(0, 5, N_NORMAL),
        "transactionIdReuse":       np.zeros(N_NORMAL, dtype=int),
        "nonceReuse":               np.zeros(N_NORMAL, dtype=int),
        "timestampAge":             np.random.uniform(0, 60, N_NORMAL),
        "requestInterval":          np.random.uniform(10, 60, N_NORMAL),
        "ipChanged":                np.random.choice([0, 1], N_NORMAL, p=[0.95, 0.05]),
        "sessionChanged":           np.random.choice([0, 1], N_NORMAL, p=[0.97, 0.03]),
        "behaviorDeviation":        np.random.uniform(0.0, 0.2, N_NORMAL),
        "previousRequestCount":     np.random.randint(0, 5, N_NORMAL),
        "duplicateRequestCount":    np.zeros(N_NORMAL, dtype=int),
        "sessionSequenceDeviation": np.random.uniform(0.0, 0.15, N_NORMAL),
        "transactionFrequency":     np.random.uniform(0.5, 3.0, N_NORMAL),
        "sessionDuration":          np.random.uniform(120, 600, N_NORMAL),
        "loginTimeDeviation":       np.random.uniform(0.0, 0.2, N_NORMAL),
        "deviceDeviation":          np.zeros(N_NORMAL, dtype=int),
        "label": "NORMAL"
    })

def generate_suspicious():
    """Borderline traffic: slightly elevated frequency, some anomalies, but no clear replay."""
    return pd.DataFrame({
        "requestFrequency":         np.random.uniform(5, 15, N_SUSPICIOUS),
        "transactionIdReuse":       np.random.choice([0, 1], N_SUSPICIOUS, p=[0.85, 0.15]),
        "nonceReuse":               np.random.choice([0, 1], N_SUSPICIOUS, p=[0.85, 0.15]),
        "timestampAge":             np.random.uniform(60, 300, N_SUSPICIOUS),
        "requestInterval":          np.random.uniform(2, 10, N_SUSPICIOUS),
        "ipChanged":                np.random.choice([0, 1], N_SUSPICIOUS, p=[0.7, 0.3]),
        "sessionChanged":           np.random.choice([0, 1], N_SUSPICIOUS, p=[0.75, 0.25]),
        "behaviorDeviation":        np.random.uniform(0.2, 0.6, N_SUSPICIOUS),
        "previousRequestCount":     np.random.randint(5, 20, N_SUSPICIOUS),
        "duplicateRequestCount":    np.random.randint(0, 3, N_SUSPICIOUS),
        "sessionSequenceDeviation": np.random.uniform(0.2, 0.5, N_SUSPICIOUS),
        "transactionFrequency":     np.random.uniform(3.0, 8.0, N_SUSPICIOUS),
        "sessionDuration":          np.random.uniform(30, 120, N_SUSPICIOUS),
        "loginTimeDeviation":       np.random.uniform(0.2, 0.5, N_SUSPICIOUS),
        "deviceDeviation":          np.random.choice([0, 1], N_SUSPICIOUS, p=[0.7, 0.3]),
        "label": "SUSPICIOUS"
    })

def generate_adaptive():
    """Adaptive behavioral replay: fresh nonces & txIDs, valid timestamp, BUT high frequency, burst interval, high sequence deviation."""
    return pd.DataFrame({
        "requestFrequency":         np.random.uniform(20, 60, N_ADAPTIVE),
        "transactionIdReuse":       np.zeros(N_ADAPTIVE, dtype=int),  # FRESH!
        "nonceReuse":               np.zeros(N_ADAPTIVE, dtype=int),  # FRESH!
        "timestampAge":             np.random.uniform(0, 30, N_ADAPTIVE), # FRESH!
        "requestInterval":          np.random.uniform(0.1, 1.5, N_ADAPTIVE), # VERY SHORT BURST
        "ipChanged":                np.random.choice([0, 1], N_ADAPTIVE, p=[0.5, 0.5]),
        "sessionChanged":           np.random.choice([0, 1], N_ADAPTIVE, p=[0.4, 0.6]),
        "behaviorDeviation":        np.random.uniform(0.7, 1.0, N_ADAPTIVE), # HIGH
        "previousRequestCount":     np.random.randint(15, 60, N_ADAPTIVE),
        "duplicateRequestCount":    np.zeros(N_ADAPTIVE, dtype=int),
        "sessionSequenceDeviation": np.random.uniform(0.7, 1.0, N_ADAPTIVE), # ABNORMAL
        "transactionFrequency":     np.random.uniform(10.0, 30.0, N_ADAPTIVE), # HIGH
        "sessionDuration":          np.random.uniform(1, 15, N_ADAPTIVE), # SHORT BURST
        "loginTimeDeviation":       np.random.uniform(0.6, 1.0, N_ADAPTIVE),
        "deviceDeviation":          np.random.choice([0, 1], N_ADAPTIVE, p=[0.3, 0.7]),
        "label": "SUSPICIOUS_BEHAVIOR"
    })

def generate_replay():
    """Confirmed exact replay attacks: reused IDs/nonces, stale timestamps, high frequency."""
    return pd.DataFrame({
        "requestFrequency":         np.random.uniform(15, 50, N_REPLAY),
        "transactionIdReuse":       np.ones(N_REPLAY, dtype=int),
        "nonceReuse":               np.ones(N_REPLAY, dtype=int),
        "timestampAge":             np.random.uniform(300, 3600, N_REPLAY),
        "requestInterval":          np.random.uniform(0.1, 2.0, N_REPLAY),
        "ipChanged":                np.random.choice([0, 1], N_REPLAY, p=[0.4, 0.6]),
        "sessionChanged":           np.random.choice([0, 1], N_REPLAY, p=[0.3, 0.7]),
        "behaviorDeviation":        np.random.uniform(0.6, 1.0, N_REPLAY),
        "previousRequestCount":     np.random.randint(10, 50, N_REPLAY),
        "duplicateRequestCount":    np.random.randint(1, 20, N_REPLAY),
        "sessionSequenceDeviation": np.random.uniform(0.5, 0.9, N_REPLAY),
        "transactionFrequency":     np.random.uniform(5.0, 20.0, N_REPLAY),
        "sessionDuration":          np.random.uniform(5, 60, N_REPLAY),
        "loginTimeDeviation":       np.random.uniform(0.5, 0.9, N_REPLAY),
        "deviceDeviation":          np.random.choice([0, 1], N_REPLAY, p=[0.5, 0.5]),
        "label": "REPLAY_ATTACK"
    })

def generate_dataset():
    df = pd.concat([generate_normal(), generate_suspicious(), generate_adaptive(), generate_replay()], ignore_index=True)
    df = df.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
    os.makedirs("data", exist_ok=True)
    path = "data/replay_attack_dataset.csv"
    df.to_csv(path, index=False)
    print(f"Dataset saved to {path}")
    print(f"Class distribution:\n{df['label'].value_counts()}")
    print(f"Total samples: {len(df)}")
    return df

if __name__ == "__main__":
    generate_dataset()
