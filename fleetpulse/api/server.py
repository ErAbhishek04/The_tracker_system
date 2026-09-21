"""
FastAPI Production Microservice for FleetPulse.
Architectural Highlights:
- Fast-Path Endpoint (/predict/fast): P99 latency <6ms for automotive CAN-bus loops.
- Async Slow-Path Endpoint (/predict/explain-and-synthesize): Triggers SHAP -> Vector RAG -> LLM Copilot.
"""

import time
from typing import Dict, Any, List
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from fleetpulse.telemetry.can_ingestion import CANTelemetryFrame, KinematicFeatureExtractor
from fleetpulse.models.xgboost_pipeline import XGBoostHazardModel
from fleetpulse.rag.vector_store import VectorRAGStore
from fleetpulse.copilot.llm_synthesizer import LLMTacticalSynthesizer, TacticalAdvisoryOutput

app = FastAPI(
    title="FleetPulse: Autonomous Vehicle Trajectory & Hazard Prediction Engine",
    description="Sub-6ms XGBoost Tabular Inference coupled with Vector RAG (NHTSA / OEM Standards) & LLM Copilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global singleton engine instances
extractor = KinematicFeatureExtractor(window_size=20)
model = XGBoostHazardModel()
rag_store = VectorRAGStore()
synthesizer = LLMTacticalSynthesizer()

class FastPredictResponse(BaseModel):
    hazard_probability: float
    is_critical: bool
    inference_latency_ms: float
    vehicle_id: str

class FullPipelineResponse(BaseModel):
    hazard_probability: float
    inference_latency_ms: float
    shap_drivers: List[Dict[str, Any]]
    retrieved_safety_standards: List[Dict[str, Any]]
    tactical_advisory: TacticalAdvisoryOutput

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "FleetPulse Trajectory Hazard Engine",
        "version": "1.0.0",
        "p99_latency_sla_ms": 10.0
    }

@app.post("/predict/fast", response_model=FastPredictResponse)
def predict_fast(frame: CANTelemetryFrame):
    """
    Sub-6ms High-Frequency Fast Path.
    Directly executed at 10Hz without blocking for RAG or LLM.
    """
    extractor.push_frame(frame)
    feat_vec = extractor.get_feature_vector()
    prob, latency_ms = model.predict_fast(feat_vec)

    return FastPredictResponse(
        hazard_probability=round(prob, 4),
        is_critical=prob > 0.70,
        inference_latency_ms=round(latency_ms, 2),
        vehicle_id=frame.vehicle_id
    )

@app.post("/predict/full", response_model=FullPipelineResponse)
def predict_full(frame: CANTelemetryFrame):
    """
    Comprehensive Neuro-Symbolic Triad Endpoint.
    1. XGBoost fast prediction
    2. SHAP feature attribution
    3. Dynamic Vector RAG query over NHTSA/OEM manuals
    4. LLM synthesis of driver alert & SAE J2735 V2X packet
    """
    extractor.push_frame(frame)
    feats = extractor.extract_features()
    feat_vec = extractor.get_feature_vector()

    # 1. XGBoost
    prob, latency_ms = model.predict_fast(feat_vec)

    # 2. SHAP Attributions
    shap_drivers = model.explain_prediction(feat_vec)

    # 3. Vector RAG Search
    rag_query = rag_store.build_shap_query(shap_drivers)
    retrieved = rag_store.retrieve(rag_query, top_k=3)

    # 4. LLM Synthesis
    advisory = synthesizer.synthesize(
        telemetry=feats,
        predicted_prob=prob,
        shap_drivers=shap_drivers,
        retrieved_standards=retrieved
    )

    return FullPipelineResponse(
        hazard_probability=round(prob, 4),
        inference_latency_ms=round(latency_ms, 2),
        shap_drivers=shap_drivers[:4],
        retrieved_safety_standards=retrieved,
        tactical_advisory=advisory
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fleetpulse.api.server:app", host="0.0.0.0", port=8000, reload=True)
