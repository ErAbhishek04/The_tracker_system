"""
Unit & Integration Tests for FleetPulse Architecture.
"""

import numpy as np
import pytest
from fleetpulse.telemetry.can_ingestion import CANTelemetryFrame, KinematicFeatureExtractor
from fleetpulse.models.xgboost_pipeline import XGBoostHazardModel
from fleetpulse.rag.vector_store import VectorRAGStore
from fleetpulse.copilot.llm_synthesizer import LLMTacticalSynthesizer

def test_kinematic_feature_extractor():
    extractor = KinematicFeatureExtractor(window_size=5)
    f1 = CANTelemetryFrame(
        timestamp=100.0,
        speed_kmh=60.0,
        time_to_collision_sec=3.0,
        lateral_accel_mps2=0.2,
        yaw_rate_degps=0.5
    )
    f2 = CANTelemetryFrame(
        timestamp=100.1,
        speed_kmh=58.0,
        time_to_collision_sec=1.4,
        lateral_accel_mps2=2.1,
        yaw_rate_degps=4.0
    )
    extractor.push_frame(f1)
    extractor.push_frame(f2)
    feats = extractor.extract_features()
    vec = extractor.get_feature_vector()

    assert vec.shape == (1, 9)
    assert feats["ttc_sec"] == 1.4
    assert feats["inv_ttc"] > 0.7

def test_xgboost_inference_and_latency():
    model = XGBoostHazardModel()
    sample = np.array([[80.0, 1.2, 0.83, 2.4, 3.5, 0.85, -2.0, 1.5, 6.78]], dtype=np.float32)
    prob, latency_ms = model.predict_fast(sample)

    assert 0.0 <= prob <= 1.0
    assert latency_ms < 25.0  # Safe upper bound even on shared CPU

    shap_vals = model.explain_prediction(sample)
    assert len(shap_vals) == 9
    assert abs(shap_vals[0]["shap_impact"]) >= 0

def test_vector_rag_retrieval():
    rag = VectorRAGStore()
    assert len(rag.documents) >= 4

    query = "NHTSA FMVSS 126 electronic stability control lateral acceleration"
    results = rag.retrieve(query, top_k=2)

    assert len(results) == 2
    assert results[0]["similarity_score"] > 0.5
    assert "FMVSS" in results[0]["title"] or "Electronic Stability" in results[0]["title"]

def test_llm_synthesizer_fallback():
    synth = LLMTacticalSynthesizer()
    out = synth.synthesize(
        telemetry={"speed_kmh": 85.0, "ttc_sec": 1.1, "lateral_accel": 2.6},
        predicted_prob=0.88,
        shap_drivers=[{"feature": "ttc_sec", "value": 1.1, "shap_impact": 0.42}],
        retrieved_standards=[{"title": "FMVSS 135", "source": "NHTSA", "content": "Brake specs"}]
    )

    assert len(out.tactical_summary) > 0
    assert "FMVSS" in out.safety_standard_compliance or "NHTSA" in out.safety_standard_compliance
    assert "SAE_J2735" in out.v2x_broadcast_payload
