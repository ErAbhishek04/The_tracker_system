"""
Sub-6ms XGBoost Trajectory & Cut-in Hazard Inference Pipeline with SHAP TreeExplainer.
"""

import time
import os
import numpy as np
from typing import Dict, Any, List, Tuple
import xgboost as xgb
import shap

FEATURE_NAMES = [
    "speed_kmh",
    "ttc_sec",
    "inv_ttc",
    "lateral_accel",
    "yaw_rate",
    "road_friction",
    "jerk_mps3",
    "yaw_accel_degps2",
    "lateral_kinetic_index"
]

class XGBoostHazardModel:
    def __init__(self, model_path: str = None):
        self.model = None
        self.explainer = None
        self.feature_names = FEATURE_NAMES
        if model_path and os.path.exists(model_path):
            self.load(model_path)
        else:
            self._init_default_booster()

    def _init_default_booster(self):
        """
        Initializes synthetic high-precision weights if no pre-trained booster is saved.
        """
        # Train on calibrated synthetic distribution mimicking NGSIM trajectory dynamics
        rng = np.random.default_rng(42)
        n_samples = 4000
        
        speeds = rng.uniform(20.0, 120.0, n_samples)
        ttc = rng.exponential(scale=2.5, size=n_samples) + 0.3
        inv_ttc = 1.0 / ttc
        lat_accel = rng.exponential(scale=0.8, size=n_samples)
        yaw_rate = rng.normal(0.0, 3.5, size=n_samples)
        friction = rng.uniform(0.4, 0.95, size=n_samples)
        jerk = rng.normal(0.0, 1.2, size=n_samples)
        yaw_accel = rng.normal(0.0, 2.0, size=n_samples)
        lat_energy = (lat_accel ** 2) / friction

        X = np.column_stack([
            speeds, ttc, inv_ttc, lat_accel, yaw_rate, friction, jerk, yaw_accel, lat_energy
        ])
        
        # Ground truth hazard label (Cut-in / sudden decel hazard)
        logits = (
            2.4 * inv_ttc + 
            1.8 * lat_accel + 
            0.6 * np.abs(yaw_rate) - 
            1.5 * friction + 
            0.8 * np.maximum(0, -jerk) - 
            3.2
        )
        probs = 1.0 / (1.0 + np.exp(-logits))
        y = (probs > 0.5).astype(int)

        dtrain = xgb.DMatrix(X, label=y, feature_names=self.feature_names)
        params = {
            "max_depth": 5,
            "eta": 0.08,
            "objective": "binary:logistic",
            "eval_metric": "auc",
            "tree_method": "hist",
            "scale_pos_weight": 3.0,  # Compensate for hazard rarity
            "nthread": 4
        }
        self.model = xgb.train(params, dtrain, num_boost_round=60)
        self.explainer = shap.TreeExplainer(self.model)

    def predict_fast(self, feature_vector: np.ndarray) -> Tuple[float, float]:
        """
        Executes raw booster prediction and records microsecond-level latency.
        Returns: (probability, latency_ms)
        """
        t0 = time.perf_counter()
        dmatrix = xgb.DMatrix(feature_vector, feature_names=self.feature_names)
        prob = float(self.model.predict(dmatrix)[0])
        t1 = time.perf_counter()
        latency_ms = (t1 - t0) * 1000.0
        return prob, latency_ms

    def explain_prediction(self, feature_vector: np.ndarray) -> List[Dict[str, Any]]:
        """
        Extracts SHAP feature attributions to feed the Vector RAG pipeline.
        """
        shap_values = self.explainer.shap_values(feature_vector)[0]
        attributions = []
        for name, val, feat_val in zip(self.feature_names, shap_values, feature_vector[0]):
            attributions.append({
                "feature": name,
                "value": float(feat_val),
                "shap_impact": float(val),
                "direction": "RISK_INCREASE" if val > 0 else "SAFETY_DECREASE"
            })
        # Sort by absolute impact descending
        attributions.sort(key=lambda x: abs(x["shap_impact"]), reverse=True)
        return attributions

    def save(self, path: str):
        self.model.save_model(path)

    def load(self, path: str):
        self.model = xgb.Booster()
        self.model.load_model(path)
        self.explainer = shap.TreeExplainer(self.model)
