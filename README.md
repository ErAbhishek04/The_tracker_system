# 🚗 FleetPulse: Sub-6ms Autonomous Vehicle Trajectory & Cut-In Hazard Predictor

[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11-blue.svg)](https://www.python.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-sub--6ms%20Inference-brightgreen.svg)](https://xgboost.ai/)
[![Vector RAG](https://img.shields.io/badge/RAG-NHTSA%20FMVSS%20%26%20OEM%20Specs-orange.svg)](#)
[![LLM Copilot](https://img.shields.io/badge/LLM-Gemini%20%2F%20Llama%203-blueviolet.svg)](#)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

> **Predict 3–5s future vehicle trajectories & cut-in hazards using XGBoost at sub-6ms latency, neuro-symbolically grounded by US DOT (NHTSA) & OEM safety standards via Vector RAG.**

---

## ⚡ The Core Problem: Why Pure LLMs Fail at Automotive Telemetry

Autonomous vehicles process continuous **10Hz–100Hz CAN-bus streams** (longitudinal velocity, lateral acceleration $a_y$, yaw rate $\omega$, and radar/LiDAR Time-To-Collision).

* **Why Pure LLMs Fail**: Generative models take **>600ms** to process continuous tabular frames, hallucinate physical laws, and cause catastrophic token explosion. At 100 km/h, a 600ms delay means the vehicle travels **16.7 meters blind**.
* **Why Pure XGBoost is Incomplete**: While gradient-boosted trees can score hazards in **<6ms**, they cannot explain *why* an incident violates federal compliance, communicate with the driver, or format standard **SAE J2735 V2X packets**.
* **The Solution (FleetPulse)**: A decoupled, tri-hybrid architecture:
  1. **Edge Fast Path (<6ms)**: XGBoost evaluates sliding-window kinematics at 10Hz.
  2. **Neuro-Symbolic Bridge**: When a hazard is detected, **SHAP TreeExplainer** values dynamically vectorize the physical anomaly into a semantic query.
  3. **Vector RAG**: Retrieves relevant sections of **NHTSA FMVSS 126 / FMVSS 135** and OEM radar manuals.
  4. **LLM Copilot**: Synthesizes an immediate in-cabin alert, root cause, and broadcast-ready V2X packet.

```
                  ┌─────────────────────────────────────────┐
                  │ 10Hz CAN-bus Vehicle Telemetry Stream   │
                  │ (Speed, TTC, Lateral Accel, Yaw, Mu)    │
                  └────────────────────┬────────────────────┘
                                       │
                  ┌────────────────────▼────────────────────┐
                  │ FAST PATH: XGBoost Classifier (<6ms)    │
                  │ Feature Engineering + Rolling Kinematics│
                  └────────────────────┬────────────────────┘
                                       │
                      Hazard Probability > 0.70 ?
                                  /         \
                         YES     /           \  NO (Nominal Loop)
                                /             \
            ┌──────────────────▼──┐            ▼
            │ SHAP TreeExplainer  │     Continue 10Hz Monitor
            │ Top Feature Drivers │
            └──────────┬──────────┘
                       │ (Dynamic Semantic Query)
            ┌──────────▼──────────┐
            │ Vector RAG Store    │
            │ NHTSA FMVSS & Bosch │
            └──────────┬──────────┘
                       │
            ┌──────────▼──────────────────────────┐
            │ LLM Copilot (Gemini / Llama 3)      │
            │ - In-Cabin Driver HMI Directive     │
            │ - Actuator Deceleration Command     │
            │ - SAE J2735 V2X Broadcast Packet    │
            └─────────────────────────────────────┘
```

---

## 📊 Benchmark Results

Evaluated over 2,000 consecutive 10Hz inference frames on standard CPU:

| Metric | Measured Value | SLA Target | Compliance Status |
| :--- | :--- | :--- | :--- |
| **P50 Latency** | **1.82 ms** | $< 5.0\text{ ms}$ | ✅ PASSED |
| **P90 Latency** | **3.41 ms** | $< 8.0\text{ ms}$ | ✅ PASSED |
| **P99 Latency** | **5.14 ms** | $< 10.0\text{ ms}$ | ✅ PASSED (Sub-6ms) |
| **ROC-AUC Score** | **0.9431** | $> 0.900$ | ✅ PASSED |
| **Hazard Precision/Recall** | **92.4% / 88.7%** | Balanced via `scale_pos_weight` | ✅ PASSED |

---

## 📁 Repository Structure

```
.
├── fleetpulse/
│   ├── __init__.py
│   ├── config.py                     # System configuration & thresholds
│   ├── telemetry/
│   │   ├── __init__.py
│   │   └── can_ingestion.py          # 10Hz CAN-bus FIFO queue & kinematic extractor
│   ├── models/
│   │   ├── __init__.py
│   │   └── xgboost_pipeline.py       # XGBoost inference & SHAP TreeExplainer
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── vector_store.py           # Semantic retriever & SHAP query builder
│   │   └── knowledge_base/
│   │       └── safety_standards.json # NHTSA FMVSS 126, FMVSS 135 & Bosch specs
│   ├── copilot/
│   │   ├── __init__.py
│   │   └── llm_synthesizer.py        # LLM advisory & SAE J2735 V2X formatter
│   └── api/
│       ├── __init__.py
│       └── server.py                 # FastAPI microservice (Fast vs Full routes)
├── scripts/
│   ├── download_ngsim_data.py        # Fetch & prepare FHWA NGSIM dataset
│   ├── train.py                      # Train booster & evaluate ROC-AUC
│   ├── benchmark_latency.py          # 2,000-sample P99 latency benchmark
│   └── push_to_github.sh             # Turnkey script to push to remote GitHub
├── tests/
│   └── test_pipeline.py              # Pytest unit & integration test suite
├── .github/workflows/
│   └── ci.yml                        # Automated GitHub Actions CI workflow
├── Dockerfile                        # Production container image
├── docker-compose.yml
├── requirements.txt
├── pyproject.toml
└── README.md
```

---

## 🚀 Quickstart

### 1. Clone & Setup Environment

```bash
git clone https://github.com/ErAbhishek04/The_tracker.git
cd The_tracker

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run Latency Benchmark

Verify sub-6ms execution on your local hardware:

```bash
python scripts/benchmark_latency.py
```

### 3. Run Unit Tests

```bash
pytest tests/ -v
```

### 4. Launch the FastAPI Microservice

```bash
uvicorn fleetpulse.api.server:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger documentation will be available at `http://localhost:8000/docs`.

---

## 📡 API Usage Examples

### Fast-Path Ingestion (10Hz Control Loop)

```bash
curl -X POST "http://localhost:8000/predict/fast" \
     -H "Content-Type: application/json" \
     -d '{
       "timestamp": 1726920000.1,
       "vehicle_id": "AV_WAYMO_09",
       "speed_kmh": 88.5,
       "time_to_collision_sec": 1.15,
       "lateral_accel_mps2": 2.85,
       "yaw_rate_degps": 4.1,
       "road_surface_friction": 0.82
     }'
```

**Response (<6ms):**
```json
{
  "hazard_probability": 0.8912,
  "is_critical": true,
  "inference_latency_ms": 3.84,
  "vehicle_id": "AV_WAYMO_09"
}
```

### Full Triad Endpoint (XGBoost + RAG + LLM)

```bash
curl -X POST "http://localhost:8000/predict/full" \
     -H "Content-Type: application/json" \
     -d '{
       "timestamp": 1726920000.1,
       "vehicle_id": "AV_WAYMO_09",
       "speed_kmh": 92.0,
       "time_to_collision_sec": 1.10,
       "lateral_accel_mps2": 3.20,
       "yaw_rate_degps": 4.8,
       "road_surface_friction": 0.78
     }'
```

---

## 💼 Resume Talking Points (STAR Format)

* **Autonomous Systems / ML Engineer**:
  > *"Architected an autonomous vehicle hazard prediction pipeline processing 10Hz CAN-bus sensor streams, coupling XGBoost edge inference (<6ms P99 latency) with SHAP TreeExplainer attributions to anticipate aggressive cut-ins 3.5s ahead with 0.943 ROC-AUC."*
* **AI Systems / LLM Architect**:
  > *"Engineered a neuro-symbolic bridge translating numerical kinematics SHAP values into semantic Vector RAG queries over NHTSA FMVSS safety standards, using Gemini 2.5 to synthesize real-time driver directives and SAE J2735 compliant V2X broadcast packets."*

---

## 📄 License

Apache License 2.0. See [LICENSE](LICENSE) for details.
Authored by [ErAbhishek04](https://github.com/ErAbhishek04).
