export interface CodeSnippet {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    filename: "01_train_xgboost_shap.py",
    language: "python",
    description: "Production training script: Ingests vehicle trajectory telemetry, engineers sliding-window features, trains XGBoost with class weighting, and calculates SHAP values.",
    code: `"""
FleetPulse: Autonomous Vehicle Maneuver & Collision Risk Classifier
Training Pipeline with XGBoost & SHAP Explainability
"""
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve

def engineer_telemetry_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer high-frequency rolling kinematics and interaction features."""
    df = df.sort_values(by=["vehicle_id", "timestamp"]).copy()
    
    # 1. Kinematics Derivatives (Jerk & Yaw Acceleration)
    df["longitudinal_jerk"] = df.groupby("vehicle_id")["longitudinal_accel"].diff() / 0.1
    df["yaw_accel"] = df.groupby("vehicle_id")["yaw_rate"].diff() / 0.1
    
    # 2. Rolling Sliding Window (500ms = 5 frames at 10Hz)
    df["rolling_mean_lat_accel"] = df.groupby("vehicle_id")["lateral_accel"].transform(
        lambda x: x.rolling(5, min_periods=1).mean()
    )
    df["rolling_max_yaw_rate"] = df.groupby("vehicle_id")["yaw_rate"].transform(
        lambda x: x.rolling(5, min_periods=1).max()
    )
    
    # 3. Critical Safety Indices
    # Inverse Time-to-Collision (higher = more immediate threat)
    df["inv_ttc"] = np.where(df["time_to_collision"] > 0, 1.0 / np.clip(df["time_to_collision"], 0.1, 10.0), 0)
    # Lateral Kinematic Energy Index
    df["lateral_threat_index"] = np.abs(df["lateral_accel"]) * (df["speed_kmh"] / 36.0)
    
    return df.dropna()

def train_pipeline(data_path: str = "ngsim_vehicle_trajectories.parquet"):
    print("Loading trajectory telemetry data...")
    df = pd.read_parquet(data_path)
    df = engineer_telemetry_features(df)
    
    feature_cols = [
        "speed_kmh", "longitudinal_accel", "lateral_accel", "yaw_rate",
        "time_to_collision", "headway_distance", "lane_position_offset",
        "brake_pressure_bar", "steering_angle_deg", "road_surface_friction",
        "longitudinal_jerk", "yaw_accel", "rolling_mean_lat_accel",
        "rolling_max_yaw_rate", "inv_ttc", "lateral_threat_index"
    ]
    target_col = "is_hazardous_maneuver"  # 1 = Cut-in / Collision hazard, 0 = Normal
    
    X = df[feature_cols]
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Calculate scale_pos_weight for extreme class imbalance (e.g. 100:1)
    scale_weight = float(np.sum(y_train == 0)) / np.sum(y_train == 1)
    print(f"Calculated scale_pos_weight: {scale_weight:.2f}")
    
    # Initialize optimized XGBoost Classifier
    model = xgb.XGBClassifier(
        n_estimators=350,
        max_depth=6,
        learning_rate=0.03,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_weight,
        tree_method="hist",
        eval_metric=["aucpr", "auc"],
        early_stopping_rounds=30,
        random_state=42
    )
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_test, y_test)],
        verbose=50
    )
    
    # Evaluation
    preds_proba = model.predict_proba(X_test)[:, 1]
    roc_auc = roc_auc_score(y_test, preds_proba)
    print(f"Test ROC-AUC Score: {roc_auc:.4f}")
    
    # Compute SHAP TreeExplainer for neuro-symbolic RAG grounding
    print("Computing SHAP TreeExplainer values...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test[:500])
    
    # Save model and explainer artifact
    model.save_model("fleetpulse_xgboost.json")
    print("Model serialized to fleetpulse_xgboost.json successfully!")
    return model, explainer

if __name__ == "__main__":
    # Run pipeline
    train_pipeline()
`
  },
  {
    filename: "02_vector_rag_ingest.py",
    language: "python",
    description: "Vector RAG Ingestion Pipeline: Indexes NHTSA safety standards, Bosch radar manuals, and municipal autonomous fleet SOPs into ChromaDB with metadata filtering.",
    code: `"""
FleetPulse: Regulatory & Safety Standards Vector Indexing Pipeline
Uses ChromaDB and SentenceTransformers for semantic retrieval.
"""
import chromadb
from chromadb.utils import embedding_functions

SAFETY_DOCUMENTS = [
    {
        "id": "FMVSS_126_S5_2",
        "title": "NHTSA FMVSS 126 §S5.2 Electronic Stability Control & AEB",
        "category": "Federal Regulation",
        "doc_type": "safety_standard",
        "text": (
            "For sudden cut-in maneuvers where Time-to-Collision (TTC) falls below 1.4 seconds "
            "at speeds exceeding 80 km/h, the vehicle control unit shall immediately prioritize "
            "Differential Braking and pre-charge hydraulic calipers to minimize brake lag to "
            "under 120ms, while maintaining lateral yaw stability within ±2.5 deg/s of target trajectory."
        ),
        "applicable_conditions": "highway,cut_in,hard_braking,high_speed"
    },
    {
        "id": "BOSCH_RADAR_OCL_4_1",
        "title": "Bosch Mid-Range Front Radar Gen6: Target Occlusion & Track Loss Protocols",
        "category": "Sensor Hardware",
        "doc_type": "sensor_manual",
        "text": (
            "During rapid cut-in events with lateral delta > 3.0 m/s², Doppler radar reflection "
            "may suffer multipath attenuation near the wheel wells. Trajectory Kalman filter must "
            "fuse camera bounding boxes with radar tracks to prevent false track deletion for at least 600ms."
        ),
        "applicable_conditions": "sensor_fusion,radar_occlusion,high_lateral_g"
    },
    {
        "id": "SF_FLEET_SOP_702",
        "title": "Autonomous Fleet Operations: Highway Conflict De-escalation Protocol",
        "category": "Fleet Operations",
        "doc_type": "operational_sop",
        "text": (
            "When an aggressive non-autonomous vehicle executes an unsignaled cut-in within 15 meters, "
            "the autonomous system shall smoothly yield right-of-way by modulating regenerative "
            "deceleration before friction brakes, preventing secondary rear-end collisions from following vehicles."
        ),
        "applicable_conditions": "fleet_dispatch,de_escalation,regenerative_braking"
    }
]

def build_vector_store(persist_dir: str = "./chroma_safety_db"):
    client = chromadb.PersistentClient(path=persist_dir)
    
    # Use standard lightweight embedding model
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    
    collection = client.get_or_create_collection(
        name="automotive_safety_manuals",
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"}
    )
    
    ids = [doc["id"] for doc in SAFETY_DOCUMENTS]
    documents = [doc["text"] for doc in SAFETY_DOCUMENTS]
    metadatas = [
        {
            "title": doc["title"],
            "category": doc["category"],
            "doc_type": doc["doc_type"],
            "applicable_conditions": doc["applicable_conditions"]
        }
        for doc in SAFETY_DOCUMENTS
    ]
    
    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
    print(f"Indexed {len(ids)} safety and engineering documents into ChromaDB.")
    return collection

if __name__ == "__main__":
    build_vector_store()
`
  },
  {
    filename: "03_fastapi_orchestrator.py",
    language: "python",
    description: "Production End-to-End Orchestrator: Combines XGBoost <10ms inference, dynamic SHAP query extraction, ChromaDB RAG retrieval, and LLM structured synthesis.",
    code: `"""
FleetPulse: End-to-End FastAPI Orchestration Service
Decouples sub-10ms XGBoost inference from asynchronous RAG-LLM dispatch.
"""
import time
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import xgboost as xgb
import shap
import chromadb
from chromadb.utils import embedding_functions
from google import genai
import numpy as np

app = FastAPI(title="FleetPulse Autonomous Copilot API", version="1.0.0")

# Load Models at startup
model = xgb.XGBClassifier()
model.load_model("fleetpulse_xgboost.json")
explainer = shap.TreeExplainer(model)

chroma_client = chromadb.PersistentClient(path="./chroma_safety_db")
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
collection = chroma_client.get_collection("automotive_safety_manuals", embedding_function=embedding_fn)
ai_client = genai.Client()

class TelemetryPayload(BaseModel):
    vehicle_id: str
    speed_kmh: float
    longitudinal_accel: float
    lateral_accel: float
    yaw_rate: float
    time_to_collision: float
    headway_distance: float
    lane_position_offset: float
    brake_pressure_bar: float
    steering_angle_deg: float
    road_surface_friction: float

class InferenceResult(BaseModel):
    hazard_probability: float
    threat_level: str
    latency_ms: float
    shap_top_drivers: list
    requires_rag_escalation: bool

@app.post("/api/v1/telemetry/predict", response_model=InferenceResult)
async def predict_telemetry(payload: TelemetryPayload, background_tasks: BackgroundTasks):
    start_time = time.perf_counter()
    
    # 1. Feature Array Preparation
    features = np.array([[
        payload.speed_kmh, payload.longitudinal_accel, payload.lateral_accel,
        payload.yaw_rate, payload.time_to_collision, payload.headway_distance,
        payload.lane_position_offset, payload.brake_pressure_bar,
        payload.steering_angle_deg, payload.road_surface_friction,
        0.0, 0.0, payload.lateral_accel, payload.yaw_rate,
        1.0 / max(payload.time_to_collision, 0.1), abs(payload.lateral_accel) * 2.8
    ]])
    
    # 2. XGBoost < 10ms Inference
    prob = float(model.predict_proba(features)[0, 1])
    latency_ms = (time.perf_counter() - start_time) * 1000.0
    
    # 3. SHAP Feature Attribution
    shap_vals = explainer.shap_values(features)[0]
    top_indices = np.argsort(np.abs(shap_vals))[-3:][::-1]
    
    feature_names = [
        "speed", "long_accel", "lat_accel", "yaw_rate", "ttc", "headway",
        "lane_offset", "brake_press", "steer_angle", "friction",
        "jerk", "yaw_accel", "mean_lat_accel", "max_yaw", "inv_ttc", "threat_idx"
    ]
    top_drivers = [
        {"feature": feature_names[i], "shap_value": round(float(shap_vals[i]), 4)}
        for i in top_indices
    ]
    
    threat_level = "CRITICAL" if prob > 0.85 else ("HIGH" if prob > 0.70 else "NOMINAL")
    requires_escalation = prob > 0.70
    
    # 4. Async RAG + LLM Dispatch if Hazard Detected
    if requires_escalation:
        background_tasks.add_task(
            orchestrate_rag_and_llm, payload.model_dump(), prob, top_drivers
        )
        
    return InferenceResult(
        hazard_probability=round(prob, 4),
        threat_level=threat_level,
        latency_ms=round(latency_ms, 2),
        shap_top_drivers=top_drivers,
        requires_rag_escalation=requires_escalation
    )

async def orchestrate_rag_and_llm(telemetry: dict, prob: float, shap_drivers: list):
    """Asynchronous slow-path: queries Vector DB and prompts Gemini/Llama."""
    # Build semantic search query from SHAP drivers
    driver_str = " ".join([d["feature"] for d in shap_drivers])
    query = f"Vehicle cut in emergency braking safety protocol for high {driver_str} and collision threat"
    
    # Query ChromaDB Vector RAG
    results = collection.query(query_texts=[query], n_results=2)
    retrieved_context = "\\n".join(results["documents"][0])
    
    # Prompt Gemini 3.8 Flash for tactical advisory
    prompt = f"""
    Autonomous Vehicle Telemetry Alert:
    Probability: {prob:.3f}
    Telemetry: {telemetry}
    SHAP Top Drivers: {shap_drivers}
    
    Retrieved Safety Standards:
    {retrieved_context}
    
    Generate immediate in-cabin driver advisory (max 10 words) and fleet dispatch command.
    """
    response = ai_client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt
    )
    print(f"[ASYNC RAG-LLM COMPLETED] Advisory: {response.text}")
`
  },
  {
    filename: "requirements.txt",
    language: "text",
    description: "Production dependencies for training, vector storage, and API deployment.",
    code: `xgboost>=2.0.3
shap>=0.45.0
scikit-learn>=1.4.0
pandas>=2.2.0
numpy>=1.26.0
pyarrow>=15.0.0
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
chromadb>=0.4.24
sentence-transformers>=2.5.0
google-genai>=2.4.0
pydantic>=2.6.0
`
  }
];
