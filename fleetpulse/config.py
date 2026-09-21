"""
Configuration parameters for FleetPulse pipeline.
"""

import os
from pydantic import BaseModel, Field

class FleetPulseConfig(BaseModel):
    # Telemetry Sampling
    can_frequency_hz: int = Field(default=10, description="CAN-bus telemetry sample frequency in Hz")
    rolling_window_seconds: float = Field(default=2.0, description="Sliding window duration for kinematics")
    prediction_horizon_seconds: float = Field(default=3.5, description="Lookahead horizon for hazard anticipation")

    # XGBoost Inference Thresholds
    collision_prob_threshold_critical: float = Field(default=0.75, description="Probability triggering immediate brake alert")
    collision_prob_threshold_warning: float = Field(default=0.45, description="Probability triggering prep alert")
    max_acceptable_latency_ms: float = Field(default=10.0, description="P99 edge SLA limit")

    # Vector RAG Configuration
    chroma_collection_name: str = "dot_oem_safety_standards"
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    rag_top_k: int = 3

    # LLM Settings
    gemini_model_name: str = "gemini-2.5-flash"
    fallback_local_model: str = "meta-llama/Llama-3-8B-Instruct"

CONFIG = FleetPulseConfig()
