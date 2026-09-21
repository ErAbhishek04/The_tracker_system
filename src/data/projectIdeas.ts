import { ProjectIdea } from "../types";

export const PROJECT_IDEAS: ProjectIdea[] = [
  {
    id: "fleetpulse-autonomous-telemetry",
    title: "FleetPulse: Autonomous Vehicle Maneuver & Collision Risk Predictor with Safety RAG Copilot",
    category: "Autonomous Vehicles & Connected Fleet",
    domain: "Automotive / ADAS / Urban Mobility",
    tagline: "Predict 3-5s future vehicle trajectories & cut-in hazards using XGBoost at 6ms latency, grounded by DOT & OEM safety manuals via Vector RAG.",
    badge: "Top Recommendation for Car Movement",
    resumeImpactScore: 9.8,
    difficulty: "Production-Grade",
    targetRoles: [
      "Machine Learning Engineer",
      "Autonomous Systems / ADAS Engineer",
      "Data Scientist (Mobility / Telematics)",
      "AI Systems Engineer"
    ],
    summary:
      "A dual-engine perception and decision support system. An XGBoost model trained on high-frequency CAN-bus and trajectory time-series predicts dangerous vehicle maneuvers (aggressive cut-ins, sudden deceleration, drift) with sub-10ms latency. High-risk inferences trigger SHAP TreeExplainer attributions to query a Vector RAG database of NHTSA FMVSS standards, Bosch radar specs, and fleet emergency SOPs, allowing an LLM to synthesize immediate driver advisories and incident audit reports.",
    whyThisWorks:
      "Interviewers love this architecture because it solves the classic AI dilemma: LLMs are far too slow (>800ms) and token-inefficient for 100Hz sensor telemetry, while pure XGBoost cannot write natural-language safety audits or parse regulatory manuals. By marrying tabular edge inference with semantic RAG retrieval, you demonstrate mature systems engineering.",
    xgboostLayer: {
      title: "Edge Tabular Trajectory Classifier",
      objective: "Classify multi-class maneuver outcome (Cut-In, Emergency Stop, Normal Lane Keeping, Near Collision) within a 3.0-second prediction horizon.",
      features: [
        "Time-to-Collision (TTC) in seconds",
        "Lateral acceleration & yaw-rate delta over 500ms sliding window",
        "Longitudinal deceleration gradient (jerk: d²v/dt²)",
        "Surrounding vehicle headway distance & relative velocity",
        "Road surface friction coefficient estimate (mu)",
        "Steering wheel angular velocity (deg/s)"
      ],
      metrics: "ROC-AUC: 0.943 | PR-AUC: 0.891 | P99 Latency: 6.4 ms",
      latencyTarget: "< 10ms",
      shapRole: "Extracts top 3 feature attributions (e.g. TTC < 1.3s + Yaw Jerk > 4.2°/s) to form the dynamic query embeddings for the RAG retriever."
    },
    ragLayer: {
      title: "Vector Regulatory & Telematics Knowledge Store",
      documentsIndexed: [
        "NHTSA FMVSS 126 (Electronic Stability Control Systems) & FMVSS 135 (Light Vehicle Brake Systems)",
        "Bosch & Continental Radar/LiDAR Sensor Operational Range & Occlusion Specs",
        "City of San Francisco / California Autonomous Vehicle Fleet Emergency Operations Playbook",
        "AASHTO Green Book: Stopping Sight Distance & Pavement Friction Guideline"
      ],
      vectorStore: "ChromaDB / FAISS with HNSW index",
      chunkingStrategy: "Hierarchical Section Chunking (512 tokens with 64-token overlap, preserving clause metadata)",
      queryTrigger: "Triggered whenever XGBoost prediction probability exceeds 0.70 threshold or SHAP attribution identifies out-of-spec sensor readings."
    },
    llmLayer: {
      title: "Synthesizer & Tactical Fleet Advisory Agent",
      modelType: "Gemini 3.8 Flash / Llama 3 8B",
      purpose: "Synthesize tabular telemetry anomalies with retrieved regulatory clauses into an instant, deterministic driver warning, V2X message packet, and automated fleet manager incident ticket.",
      outputs: [
        "Driver HMI Alert (Spoken / Display message in <5 words)",
        "Root Cause Attribution with technical sensor citations",
        "V2X Standardized Incident Packet (SAE J2735 compliant)",
        "Post-Incident Telemetry Audit Trail for Safety Regulators"
      ]
    },
    dataset: {
      name: "NGSIM (Next Generation Simulation - US-101 / I-80) + Waymo Open Motion Dataset",
      sourceUrl: "https://data.transportation.gov/Automobiles/Next-Generation-Simulation-NGSIM-Vehicle-Trajector/9839-g45n",
      description: "High-resolution 10Hz vehicle trajectory dataset tracking individual vehicle coordinates, velocity, acceleration, lane changes, and surrounding spacing over highway segments.",
      recordCount: "1.4M+ telemetry records across 4,500+ unique vehicles"
    },
    resumeBullets: [
      "Architected a real-time vehicle maneuver & collision forecasting engine processing 1.4M+ trajectory records (NGSIM / Waymo) using XGBoost, achieving 0.943 ROC-AUC and <7ms P99 inference latency.",
      "Engineered a dynamic neuro-symbolic RAG pipeline using FAISS and SHAP TreeExplainer to vectorize tabular telemetry anomalies and retrieve corresponding NHTSA FMVSS safety standards and OEM sensor operational manuals.",
      "Integrated Gemini/Llama LLM to synthesize multi-modal telemetry and safety documentation, reducing false-positive safety escalations by 36% and generating automated SAE J2735 compliant incident response summaries.",
      "Deployed end-to-end service using FastAPI, Redis caching, and Docker on Cloud Run, maintaining 99.9% uptime with Prometheus telemetry monitoring."
    ],
    architectureSummary:
      "Streaming CAN-bus & LiDAR Telemetry (Kafka / Redis) → Feature Pipeline (Sliding Window Aggregations) → XGBoost C++ Inference Engine (<10ms) → SHAP Feature Explainer → Threshold Trigger Gate → FAISS Vector Store (ChromaDB) → LLM Orchestrator (Prompt Template with Grounded Chunks) → Dispatch Dashboard & In-Cabin Alert System.",
    technologies: ["Python", "XGBoost", "SHAP", "FastAPI", "FAISS / ChromaDB", "SentenceTransformers", "LangChain / LiteLLM", "Docker", "Redis", "Kafka"]
  },
  {
    id: "voltroute-ev-battery-telematics",
    title: "VoltRoute: EV Battery Thermal Runaway & Range Degradation Forecaster with Warranty RAG",
    category: "Clean Energy & Connected Electric Fleets",
    domain: "EV Fleet Management / Battery Diagnostics (Tesla / Rivian / Proterra)",
    tagline: "Predict EV battery pack cell-temperature spikes and State-of-Health (SoH) degradation with XGBoost, paired with SAE J1772 & OEM manual RAG.",
    badge: "High Commercial Value",
    resumeImpactScore: 9.4,
    difficulty: "Production-Grade",
    targetRoles: [
      "Data Scientist (Energy / IoT)",
      "Machine Learning Engineer",
      "Fleet Telematics Specialist"
    ],
    summary:
      "Predicts lithium-ion cell thermal runaway and accelerated State-of-Health (SoH) degradation from multi-channel battery management system (BMS) CAN-bus streams. When anomaly risk spikes, RAG retrieves OEM cell warranty policies, cooling loop schematics, and SAE thermal safety guidelines, while the LLM generates urgent battery throttling protocols and automated service orders.",
    whyThisWorks:
      "EV makers and commercial fleet operators lose millions on premature battery replacements and fire recalls. This project demonstrates high business ROI and deep mastery of IoT time-series telemetry.",
    xgboostLayer: {
      title: "BMS Thermal & Degradation Regressor",
      objective: "Predict maximum cell temperature delta (ΔT > 15°C) within 10 minutes and classify thermal runaway precursors.",
      features: [
        "Cell voltage variance (min/max delta across 96 cell modules)",
        "Charge/Discharge C-rate and cumulative ampere-hours",
        "Coolant inlet/outlet temperature differential",
        "Ambient temperature vs. internal module thermistor readings",
        "Internal impedance change rate (dZ/dt)"
      ],
      metrics: "RMSE: 0.82°C | R²: 0.962 | Precision on Thermal Anomaly: 91.4%",
      latencyTarget: "< 15ms",
      shapRole: "Pinpoints whether voltage imbalance or coolant pump flow rate is the dominant driver of thermal stress."
    },
    ragLayer: {
      title: "Battery Safety & Warranty RAG Index",
      documentsIndexed: [
        "SAE J2464 / J1772 Electric Vehicle Battery Abuse Testing Standards",
        "OEM Battery Pack Service & Cooling Loop Troubleshooting Manuals",
        "Commercial Fleet Battery Warranty Claim Conditions & Throttling Clauses"
      ],
      vectorStore: "ChromaDB with cosine distance",
      chunkingStrategy: "Semantic chunking based on fault code tables and diagnostic flowcharts",
      queryTrigger: "Triggered on predicted cell temp > 48°C or state-of-health drop rate exceeding 3σ."
    },
    llmLayer: {
      title: "Fleet Maintenance & Warranty Copilot",
      modelType: "Gemini 3.8 Flash / Claude 3.5 Sonnet",
      purpose: "Outputs specific BMS thermal management override commands (coolant pump max-duty cycle, charge current limit) and drafts technician work orders with exact warranty reimbursement codes.",
      outputs: [
        "BMS Dynamic Throttling Directive",
        "Diagnostic Trouble Code (DTC) Translation & Root Cause",
        "Pre-populated Warranty Claim Report"
      ]
    },
    dataset: {
      name: "NASA Battery Prognostics Dataset + Oxford Battery Degradation Dataset",
      sourceUrl: "https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/",
      description: "Continuous cycling and thermal stress records of 18650 and pouch lithium-ion cells operated under diverse driving profiles and fast-charging regimes.",
      recordCount: "850k+ telemetry points across 48 battery test groups"
    },
    resumeBullets: [
      "Constructed an EV battery thermal runaway early-warning system utilizing XGBoost on 850k+ BMS telemetry cycles, predicting cell over-temperature events 10 minutes in advance with 91.4% precision.",
      "Designed an automated diagnostic RAG assistant embedding SAE J2464 safety standards and OEM warranty documentation into ChromaDB to contextualize multi-cell voltage anomalies.",
      "Formulated an LLM-driven fleet dispatch agent generating dynamic BMS power curtailment orders, eliminating manual triage for 400+ connected vehicles and reducing diagnostic time by 65%."
    ],
    architectureSummary:
      "CAN-bus BMS Telematics → Polars Feature Pipeline → XGBoost Regressor → SHAP Cell Anomaly Breakdown → RAG Vector Search (Warranty & Repair Manuals) → LLM Maintenance Dispatcher.",
    technologies: ["Python", "XGBoost", "Polars", "ChromaDB", "FastAPI", "Gemini API", "Streamlit", "Docker"]
  },
  {
    id: "routeguard-heavy-freight-rollover",
    title: "RouteGuard: Heavy Freight Rollover & Weather Hazard Predictor with DOT Regulations RAG",
    category: "Logistics & Supply Chain Logistics",
    domain: "Commercial Trucking / Supply Chain (Uber Freight / Convoy / FedEx)",
    tagline: "Predict commercial truck rollover risk on winding mountain corridors via telematics, with instant DOT regulations and bridge restriction RAG.",
    badge: "High Industrial Relevance",
    resumeImpactScore: 9.2,
    difficulty: "Advanced",
    targetRoles: [
      "Machine Learning Engineer",
      "Supply Chain Data Scientist",
      "Applied AI Engineer"
    ],
    summary:
      "Commercial Class 8 semi-trucks face catastrophic rollover risks in high-crosswind corridors and mountain passes. This system ingests telematics (gross trailer weight, center-of-gravity estimate, curve radius, speed variance) into an XGBoost classifier. When risk threshold is breached, RAG pulls real-time DOT road advisory notices, bridge height/weight restrictions, and FMCSA hours-of-service compliance rules, prompting an LLM co-pilot that recalculates dynamic safe routing.",
    whyThisWorks:
      "Freight logistics is a multi-billion dollar market where rollover incidents cause millions in damages. Demonstrating tabular risk modeling combined with unstructured DOT regulatory parsing is an instant resume standout.",
    xgboostLayer: {
      title: "Dynamic Rollover Index (DRI) Predictor",
      objective: "Predict roll-stability threshold exceedance (Rollover Index > 0.85) 15 seconds prior to curve apex.",
      features: [
        "Lateral acceleration and roll-angle rate (deg/s²)",
        "Trailer weight distribution ratio (front/rear axle load cell)",
        "Road super-elevation (banking) and curvature radius",
        "Wind gust velocity and aerodynamic yaw angle",
        "Driver throttle-to-brake transition speed"
      ],
      metrics: "F1-Score: 0.912 | Recall on Near-Rollover: 96.5% | P99 Latency: 8.1 ms",
      latencyTarget: "< 10ms",
      shapRole: "Identifies whether high crosswinds, excessive speed, or cargo shift was the primary driver of rollover risk."
    },
    ragLayer: {
      title: "DOT & Hazmat Regulatory Knowledge Base",
      documentsIndexed: [
        "FMCSA 49 CFR Part 393 (Parts & Accessories for Safe Operation)",
        "State DOT Commercial Vehicle Mountain Pass Restrictions & Chain Laws",
        "Bridge Clearance & Hazardous Material Transport Corridors"
      ],
      vectorStore: "Pinecone / FAISS",
      chunkingStrategy: "Route-segment indexed geospatial chunks with metadata filtering",
      queryTrigger: "Triggered on high rollover risk or imminent weather road closure."
    },
    llmLayer: {
      title: "Autonomous Logistics Dispatcher",
      modelType: "Gemini 3.8 Flash / GPT-4o-mini",
      purpose: "Generates spoken driver safe-speed warnings and provides fleet dispatchers with DOT-compliant alternative routes avoiding restricted bridges and hazardous mountain passes.",
      outputs: [
        "Immediate In-Cab Speed Advisory",
        "Reroute Recommendation with DOT Clearance Verification",
        "FMCSA Hours-of-Service Impact Calculation"
      ]
    },
    dataset: {
      name: "Federal Motor Carrier Safety Administration (FMCSA) Crash & Telematics Sample Dataset",
      sourceUrl: "https://ai.fmcsa.dot.gov/",
      description: "Fleet telematics logs including CAN-bus speed, braking, lateral g-force, and GPS tracks across heavy commercial freight corridors.",
      recordCount: "2.1M+ data points across 12 interstate freight corridors"
    },
    resumeBullets: [
      "Engineered an end-to-end commercial freight safety copilot ingesting 2.1M+ vehicle telematics records, predicting rollover propensities with 96.5% recall using XGBoost.",
      "Implemented a geospatial RAG architecture using FAISS to query state DOT regulations, hazmat route restrictions, and live weather advisories based on SHAP telematics factors.",
      "Developed an automated rerouting LLM agent that proposed compliant detour corridors, cutting severe weather delivery delays by 22% in backtesting."
    ],
    architectureSummary:
      "Truck Telematics Ingestion → Real-Time Feature Calculation → XGBoost Rollover Classifier → SHAP Feature Explanations → Geospatial RAG (DOT Rules) → LLM Rerouting Agent.",
    technologies: ["Python", "XGBoost", "FAISS", "GeoPandas", "FastAPI", "Docker", "Prometheus"]
  },
  {
    id: "risksentinel-fraud-detection-rag",
    title: "RiskSentinel: Sub-10ms Payment Anomaly Classifier with AML Regulatory RAG Copilot",
    category: "FinTech & Payment Infrastructure",
    domain: "Financial Fraud / Anti-Money Laundering (Stripe / Adyen / JPMorgan)",
    tagline: "Sub-10ms tabular transaction fraud scoring with XGBoost, paired with FinCEN AML regulations and SAR drafting via LLM RAG.",
    badge: "Wall Street & FinTech Favorite",
    resumeImpactScore: 9.5,
    difficulty: "Production-Grade",
    targetRoles: [
      "FinTech Machine Learning Engineer",
      "Quantitative / Risk Data Scientist",
      "AI Governance Specialist"
    ],
    summary:
      "Detects sophisticated synthetic identity fraud and card-not-present transaction anomalies in sub-8ms using an optimized XGBoost classifier. When an anomaly is detected, RAG queries FinCEN regulatory directives, merchant risk compliance tiers, and historical fraud ring dossiers. An LLM investigator agent then auto-drafts complete, audit-ready Suspicious Activity Reports (SAR).",
    whyThisWorks:
      "Every financial institution is racing to replace slow, manual human fraud audits with hybrid AI. This showcases high-throughput tabular engineering (<8ms) combined with legal/compliance document retrieval.",
    xgboostLayer: {
      title: "Transaction Risk Scoring Engine",
      objective: "Score probability of fraudulent transaction (Binary classification) under strict <10ms SLA.",
      features: [
        "Cardholder velocity (transactions in last 5m / 1h / 24h)",
        "Geodetic distance and velocity between consecutive swipes (impossible travel)",
        "Merchant category risk code and chargeback ratio",
        "Device fingerprint entropy and IP risk score",
        "Transaction amount deviation from user 30-day moving average"
      ],
      metrics: "PR-AUC: 0.924 | False Positive Rate: < 0.12% | Latency: 4.8 ms",
      latencyTarget: "< 8ms",
      shapRole: "Outputs exact feature contributions (e.g. Impossible Velocity = +0.54) to justify automated card freezes under Fair Lending laws."
    },
    ragLayer: {
      title: "FinCEN AML & Compliance Vector Store",
      documentsIndexed: [
        "FinCEN Suspicious Activity Report (SAR) Filing Guidance & Red Flags",
        "OFAC Sanctions Lists & PEP (Politically Exposed Persons) Rules",
        "Merchant Card Brand Operating Regulations (Visa / Mastercard Rules)"
      ],
      vectorStore: "Qdrant / Milvus with hybrid sparse/dense search",
      chunkingStrategy: "Clause-aware regulatory chunking with jurisdictional tags",
      queryTrigger: "Triggered whenever fraud probability exceeds 0.75 or sanction keyword matches."
    },
    llmLayer: {
      title: "Automated SAR Drafting & Audit Agent",
      modelType: "Gemini 3.8 Flash / Claude 3.5 Sonnet",
      purpose: "Drafts legally compliant FinCEN Narrative Box summaries, referencing the specific XGBoost SHAP values and regulatory precedents.",
      outputs: [
        "Draft FinCEN Form 111 SAR Narrative",
        "Actionable Card Freeze / Merchant Review Decision",
        "Human-in-the-loop Explanation with Auditable Citations"
      ]
    },
    dataset: {
      name: "IEEE-CIS Fraud Detection Dataset / European Credit Card Fraud Dataset",
      sourceUrl: "https://www.kaggle.com/c/ieee-fraud-detection",
      description: "Over 590k real-world financial transactions with 390+ tabular features spanning transaction amounts, card details, device identity, and fraud labels.",
      recordCount: "590,000+ real transactions"
    },
    resumeBullets: [
      "Engineered an enterprise transaction fraud detection engine on 590k+ IEEE-CIS records using XGBoost, achieving 0.924 PR-AUC with sub-5ms P99 inference latency.",
      "Implemented a regulatory RAG pipeline indexing FinCEN AML guidelines and OFAC sanctions in Qdrant, retrieving relevant compliance precedents using SHAP risk factors.",
      "Automated the generation of audit-compliant Suspicious Activity Report (SAR) narratives via LLM, reducing compliance analyst investigation backlog by 42%."
    ],
    architectureSummary:
      "Transaction Event Stream → Feast Feature Store → XGBoost Model Service (ONNX Runtime) → SHAP TreeExplainer → RAG Regulatory Search → LLM SAR Narrative Generator.",
    technologies: ["Python", "XGBoost", "ONNX Runtime", "Qdrant", "Feast", "FastAPI", "Docker"]
  },
  {
    id: "aeroshield-turbine-prognostics",
    title: "AeroShield: Turbofan Jet Engine Failure Prognostics with FAA Airworthiness RAG",
    category: "Aerospace & Industrial IoT",
    domain: "Aviation Maintenance / Predictive Maintenance (NASA / Boeing / GE)",
    tagline: "Predict Remaining Useful Life (RUL) of aircraft jet engines with XGBoost, cross-referenced with FAA Airworthiness Directives via RAG.",
    badge: "Mission-Critical Systems",
    resumeImpactScore: 9.3,
    difficulty: "Advanced",
    targetRoles: [
      "Predictive Maintenance ML Engineer",
      "Industrial IoT Data Scientist",
      "Reliability Systems Engineer"
    ],
    summary:
      "Predicts Remaining Useful Life (RUL) in flight cycles for commercial jet engines using multi-sensor degradation telemetry (fan speed, core temperature, pressure ratios) from NASA's C-MAPSS dataset. When degradation accelerates, RAG searches FAA Airworthiness Directives, Boeing maintenance manuals, and parts inventory specs, prompting an LLM to generate compliance-ready maintenance work packages.",
    whyThisWorks:
      "Aviation and heavy industry demand 100% explainability and regulatory compliance. Combining continuous sensor regression with FAA manual RAG proves you can build mission-critical enterprise systems.",
    xgboostLayer: {
      title: "Jet Engine RUL Regressor",
      objective: "Predict Remaining Useful Life (cycles until structural failure) across multi-sensor telemetry.",
      features: [
        "Low-pressure turbine temperature & pressure ratios",
        "High-pressure compressor bleed velocity",
        "Coolant bleed and bypass ratio time-derivatives",
        "Operating regime cluster (altitude, Mach number, throttle position)"
      ],
      metrics: "RMSE: 14.8 cycles | NASA Scoring Function: 242.1 | P99 Latency: 5.2 ms",
      latencyTarget: "< 10ms",
      shapRole: "Explains whether compressor blade wear or thermal barrier degradation is the primary failure catalyst."
    },
    ragLayer: {
      title: "FAA Directives & Maintenance Manuals RAG",
      documentsIndexed: [
        "FAA Airworthiness Directives (ADs) for Commercial Turbofan Engines",
        "Aircraft Maintenance Manual (AMM) Inspection Task Cards (ATA Chapter 72)",
        "Component Illustrated Parts Catalog (IPC) & Lead-Time Database"
      ],
      vectorStore: "FAISS with IVFFlat index",
      chunkingStrategy: "Task-card structured chunking preserving ATA chapter hierarchy",
      queryTrigger: "Triggered when predicted RUL falls below 30 flight cycles."
    },
    llmLayer: {
      title: "Aircraft Maintenance Work Package Generator",
      modelType: "Gemini 3.8 Flash",
      purpose: "Outputs certified mechanic work orders specifying exact borescope inspection angles, torque limits, and FAA compliance sign-off requirements.",
      outputs: [
        "FAA-Compliant Maintenance Work Order",
        "Borescope Inspection Guidance & Tool List",
        "Estimated Downtime & Parts Lead-Time Summary"
      ]
    },
    dataset: {
      name: "NASA C-MAPSS (Commercial Modular Aero-Propulsion System Simulation)",
      sourceUrl: "https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/",
      description: "Benchmark multi-sensor time-series tracking jet engine degradation to catastrophic failure across 4 operating conditions and multiple failure modes.",
      recordCount: "100+ full run-to-failure engine trajectories (>160k sensor readings)"
    },
    resumeBullets: [
      "Built a turbofan Remaining Useful Life (RUL) predictive system on NASA C-MAPSS sensor data with XGBoost, achieving 14.8 cycle RMSE under multi-regime flight stress.",
      "Developed a vector RAG pipeline indexing FAA Airworthiness Directives and Boeing maintenance task cards to map continuous degradation signals to regulatory mandates.",
      "Architected an LLM technician co-pilot generating certified maintenance work orders and borescope inspection instructions, cutting scheduled unscheduled downtime by 19%."
    ],
    architectureSummary:
      "Sensor Telemetry Ingestion → Feature Normalization & Rolling Lag Features → XGBoost RUL Regressor → SHAP Diagnostics → FAA RAG Vector Store → LLM Maintenance Work Order Generator.",
    technologies: ["Python", "XGBoost", "SHAP", "FAISS", "FastAPI", "Docker", "Streamlit"]
  }
];
