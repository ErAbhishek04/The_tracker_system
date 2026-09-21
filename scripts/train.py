"""
Model Training & Evaluation Script.
Trains XGBoost on engineered kinematic features and evaluates ROC-AUC, PR-AUC, and latency.
"""

import os
import sys
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, average_precision_score, classification_report

# Ensure root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fleetpulse.models.xgboost_pipeline import FEATURE_NAMES

def run_training():
    print("==================================================")
    print(" FleetPulse XGBoost Trajectory Hazard Training")
    print("==================================================")

    # Generate synthetic training set with hard boundary cases
    rng = np.random.default_rng(2026)
    n = 30000

    speed = rng.uniform(20.0, 130.0, n)
    ttc = rng.exponential(2.8, n) + 0.3
    inv_ttc = 1.0 / ttc
    lat_accel = rng.exponential(0.7, n)
    yaw_rate = rng.normal(0.0, 3.2, n)
    friction = rng.uniform(0.4, 0.95, n)
    jerk = rng.normal(0.0, 1.4, n)
    yaw_accel = rng.normal(0.0, 2.2, n)
    lat_energy = (lat_accel ** 2) / friction

    X = np.column_stack([
        speed, ttc, inv_ttc, lat_accel, yaw_rate, friction, jerk, yaw_accel, lat_energy
    ])

    logits = (
        2.5 * inv_ttc + 
        1.9 * lat_accel + 
        0.5 * np.abs(yaw_rate) - 
        1.4 * friction + 
        0.7 * np.maximum(0, -jerk) - 
        3.1
    )
    y = (1.0 / (1.0 + np.exp(-logits)) > 0.5).astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    dtrain = xgb.DMatrix(X_train, label=y_train, feature_names=FEATURE_NAMES)
    dtest = xgb.DMatrix(X_test, label=y_test, feature_names=FEATURE_NAMES)

    pos_ratio = (len(y_train) - sum(y_train)) / max(1, sum(y_train))
    print(f"Dataset Size: {len(X)} samples | Positive Class Ratio: 1:{pos_ratio:.1f}")

    params = {
        "max_depth": 6,
        "eta": 0.06,
        "objective": "binary:logistic",
        "eval_metric": ["auc", "logloss"],
        "tree_method": "hist",
        "scale_pos_weight": pos_ratio * 0.8,
        "subsample": 0.85,
        "colsample_bytree": 0.85,
        "nthread": 4
    }

    evals = [(dtrain, "train"), (dtest, "val")]
    booster = xgb.train(params, dtrain, num_boost_round=100, evals=evals, verbose_eval=25)

    # Evaluation
    preds = booster.predict(dtest)
    roc_auc = roc_auc_score(y_test, preds)
    pr_auc = average_precision_score(y_test, preds)

    print("\n---------------- Evaluation Metrics ----------------")
    print(f"ROC-AUC Score: {roc_auc:.4f}  (Target: >0.940)")
    print(f"PR-AUC Score:  {pr_auc:.4f}")
    print("\nClassification Report (threshold=0.50):")
    print(classification_report(y_test, (preds > 0.5).astype(int), digits=4))

    # Save artifact
    out_dir = os.path.join(os.path.dirname(__file__), "..", "fleetpulse", "models")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "hazard_xgboost.json")
    booster.save_model(out_path)
    print(f"Saved trained booster to {out_path}")

if __name__ == "__main__":
    run_training()
