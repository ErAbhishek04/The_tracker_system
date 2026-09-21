import { InterviewQA } from "../types";

export const INTERVIEW_QUESTIONS: InterviewQA[] = [
  {
    id: "q1-why-xgboost-not-pure-llm",
    question: "Why did you use XGBoost for vehicle movement & telemetry prediction instead of feeding the sensor data directly to an LLM or Vision-Language Model?",
    category: "Architecture",
    difficulty: "Hard",
    whatHiringManagerLooksFor:
      "Hiring managers want to see if you understand real-world engineering trade-offs: latency budgets, cost, token limits, inductive bias for tabular/time-series data, and catastrophic hallucination risks in mission-critical loops.",
    rockSolidAnswer:
      "1. Latency & Control Loop: In autonomous driving or ADAS, perception and maneuver prediction operate at 10Hz to 100Hz (10ms-100ms cycle). An LLM takes 500ms to 2000ms just to output the first token—by then, a car traveling at 100 km/h has already traveled 50+ meters!\n\n2. Inductive Bias & Tabular Accuracy: Gradient-boosted decision trees (XGBoost/LightGBM) consistently outperform deep learning and LLMs on dense, heterogeneous tabular sensor telemetry (continuous floats, discrete flags, non-linear physical boundaries) with 100x fewer parameters.\n\n3. Token & Cost Economics: Streaming 10Hz CAN-bus telemetry (50 sensors x 10 times/sec) into an LLM would burn millions of tokens per minute. XGBoost runs locally on a small CPU or edge micro-controller in <6ms for fractions of a cent.\n\n4. Role of the LLM: The LLM is used where it shines—semantic synthesis, regulatory compliance cross-referencing (RAG), and generating natural language operator advisories when an anomaly threshold is breached.",
    keyPhrasesToSay: [
      "Sub-10ms edge inference vs 1000ms LLM latency",
      "Inductive bias for tabular non-linear boundaries",
      "Token explosion on 100Hz sensor telemetry",
      "Asynchronous trigger gate architecture"
    ],
    pitfallToAvoid: "Never say 'Because LLMs can't read numbers'. Say that LLMs have the wrong latency profile and lack the physical boundary inductive bias needed for 10Hz edge control."
  },
  {
    id: "q2-how-bridge-shap-to-rag",
    question: "How exactly do you bridge tabular XGBoost outputs to your Vector RAG knowledge base? How does the retrieval query get formed?",
    category: "RAG & Vector Search",
    difficulty: "Staff/Lead",
    whatHiringManagerLooksFor:
      "They want to see if you just wrote a naive hardcoded prompt or if you engineered a real neuro-symbolic bridge using SHAP (SHapley Additive exPlanations) or TreeExplainer to dynamically construct semantic queries.",
    rockSolidAnswer:
      "Instead of sending raw sensor arrays to the vector search, we use a two-tier bridge:\n\n1. Dynamic Feature Extraction via SHAP: When XGBoost scores a risk > 0.70, we run TreeExplainer to extract the top 3 features with the highest absolute SHAP values (e.g., 'TTC < 1.15s', 'Lateral Acceleration > 3.4 m/s²', 'Friction < 0.6').\n\n2. Semantic Query Assembly: We synthesize these feature attributions into a structured semantic query: 'NHTSA FMVSS emergency braking stopping distance for sudden cut-in lateral acceleration > 3.0 m/s² on wet pavement'.\n\n3. Metadata Filtering: We apply metadata pre-filtering on the vector database (e.g., filtering by vehicle type = 'commercial_freight' or road_type = 'interstate') before computing cosine similarity on chunk embeddings, ensuring 100% precision in safety standard retrieval.",
    keyPhrasesToSay: [
      "SHAP TreeExplainer feature attributions",
      "Metadata pre-filtering in vector DB (HNSW / FAISS)",
      "Dynamic prompt formulation",
      "Deterministic threshold trigger gate"
    ],
    pitfallToAvoid: "Don't say you pass 50 raw sensor numbers into the embedding model. Embeddings of raw numbers lose physical units and semantic meaning."
  },
  {
    id: "q3-handling-drift-and-imbalance",
    question: "In real-world vehicle telemetry, dangerous cut-ins and near-collisions represent less than 0.1% of all driving data. How did you handle extreme class imbalance in XGBoost?",
    category: "ML & XGBoost",
    difficulty: "Medium",
    whatHiringManagerLooksFor:
      "Testing your foundational ML knowledge on severe class imbalance, loss weighting, evaluation metrics (PR-AUC vs Accuracy), and synthetic oversampling.",
    rockSolidAnswer:
      "1. Objective & Loss Weighting: We tuned XGBoost's `scale_pos_weight` parameter, setting it to the ratio of negative to positive instances (sum(negative) / sum(positive)), which penalizes false negatives in the gradient Hessian calculation.\n\n2. Focal Loss Alternative: For multi-class trajectory prediction, we implemented a custom Focal Loss objective to down-weight easy well-classified highway cruising frames and force the booster to focus on hard boundary cut-ins.\n\n3. Evaluation Metrics: We never evaluated on Accuracy (which would be 99.9% by predicting 'safe' always). We optimized for Precision-Recall AUC (PR-AUC) and set the decision threshold based on cost-matrix optimization (a missed collision is 100x worse than a false alert).\n\n4. Data Mining: We applied hard negative mining on sudden deceleration events that did not result in cut-ins.",
    keyPhrasesToSay: [
      "scale_pos_weight tuning",
      "PR-AUC over ROC-AUC for imbalanced data",
      "Cost-sensitive thresholding",
      "Hard negative mining"
    ],
    pitfallToAvoid: "Do not say you used SMOTE blindly on time-series telemetry; SMOTE can generate physically impossible sensor combinations (e.g., high speed with zero wheel rpm)."
  },
  {
    id: "q4-rag-hallucination-safety",
    question: "In safety-critical automotive systems, LLMs can hallucinate. How did you guarantee that the advisory output is faithful to official safety manuals?",
    category: "Production Systems",
    difficulty: "Staff/Lead",
    whatHiringManagerLooksFor:
      "Evaluating your knowledge of guardrails, RAGAS metrics, schema enforcement (JSON Schema / function calling), and deterministic fallback rules.",
    rockSolidAnswer:
      "We implemented a defense-in-depth safety sandwich:\n\n1. Structured Output Schema: We constrained the LLM using strict JSON schema mode / function calling with enumerated threat levels (CRITICAL, HIGH, ELEVATED, NOMINAL), disallowing free-form unparseable text.\n\n2. Citation Enforcement: Every advisory statement must cite the exact document ID and section number from the retrieved RAG chunks (e.g. FMVSS 126 §S5.2). If a claim lacks an indexed citation, it fails automated validation.\n\n3. RAGAS Automated Evaluation: During CI/CD testing, we evaluate Faithfulness, Answer Relevance, and Context Recall using synthetic adversarial telemetry scenarios.\n\n4. Fallback Rule Engine: If the LLM latency exceeds 800ms or fails schema validation, the system instantly defaults to a deterministic safety lookup matrix, ensuring the vehicle's physical braking is NEVER blocked by the LLM.",
    keyPhrasesToSay: [
      "Structured output schema / JSON mode",
      "Faithfulness and Groundedness evaluation via RAGAS",
      "Fail-safe deterministic rule engine",
      "Asynchronous non-blocking architecture"
    ],
    pitfallToAvoid: "Never claim the LLM directly actuates the steering wheel or brake pedal! The LLM provides decision support and operator advisories; the low-level CAN-bus safety controller is always deterministic."
  },
  {
    id: "q5-production-serving-architecture",
    question: "Walk me through how you would serve this system in production at scale with low latency and high availability.",
    category: "Architecture",
    difficulty: "Hard",
    whatHiringManagerLooksFor:
      "Testing end-to-end system design: messaging queues, edge vs cloud split, caching, ONNX runtime, and horizontal scaling.",
    rockSolidAnswer:
      "We decouple the pipeline into two asynchronous loops:\n\n1. Fast Path (Edge / Sub-10ms): Ingests vehicle CAN-bus/GPS telemetry into a lightweight in-memory sliding window buffer. The trained XGBoost model is exported to ONNX Runtime (or Treelite for C++ compilation), executing inference in <5ms. If risk score is below 0.65, telemetry is simply archived to cold storage.\n\n2. Slow Path (Cloud / Async Dispatch): If risk score > 0.65, an event is emitted to Apache Kafka / Redis Streams. A worker pool picks up the event, computes SHAP values, queries the FAISS vector index in <15ms, and dispatches the prompt to an LLM serving cluster (vLLM / Gemini API). Results are cached in Redis to prevent redundant LLM invocations for similar recurrent traffic situations.\n\n3. Observability: Monitored via Prometheus and Grafana tracking P95/P99 latency, prediction drift (Evidently AI), and vector search recall.",
    keyPhrasesToSay: [
      "Fast-path vs Slow-path decoupled architecture",
      "ONNX Runtime / Treelite compilation",
      "Redis Streams / Kafka event bus",
      "Semantic caching of LLM responses"
    ],
    pitfallToAvoid: "Don't design a synchronous pipeline where the telemetry loop waits for the LLM before processing the next sensor packet."
  }
];
