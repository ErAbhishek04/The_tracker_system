export interface ProjectIdea {
  id: string;
  title: string;
  category: string;
  domain: string;
  tagline: string;
  badge: string;
  resumeImpactScore: number; // out of 10
  difficulty: "Intermediate" | "Advanced" | "Production-Grade";
  targetRoles: string[];
  summary: string;
  whyThisWorks: string;
  xgboostLayer: {
    title: string;
    objective: string;
    features: string[];
    metrics: string;
    latencyTarget: string;
    shapRole: string;
  };
  ragLayer: {
    title: string;
    documentsIndexed: string[];
    vectorStore: string;
    chunkingStrategy: string;
    queryTrigger: string;
  };
  llmLayer: {
    title: string;
    modelType: string;
    purpose: string;
    outputs: string[];
  };
  dataset: {
    name: string;
    sourceUrl: string;
    description: string;
    recordCount: string;
  };
  resumeBullets: string[];
  architectureSummary: string;
  technologies: string[];
}

export interface TelemetryData {
  vehicleId: string;
  timestamp: string;
  speedKmh: number;
  longitudinalAccel: number; // m/s^2
  lateralAccel: number; // m/s^2
  yawRate: number; // deg/s
  timeToCollision: number; // seconds
  headwayDistance: number; // meters
  lanePositionOffset: number; // meters from center
  brakePressureBar: number;
  steeringAngleDeg: number;
  roadSurfaceFriction: number; // 0 to 1
  surroundingVehicleCount: number;
}

export interface ShapContribution {
  feature: string;
  value: number | string;
  shapValue: number; // positive increases risk, negative decreases
  description: string;
}

export interface RagDocumentChunk {
  id: string;
  title: string;
  sourceDoc: string;
  category: string;
  similarityScore: number;
  content: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  telemetry: TelemetryData;
  predictedClass: string;
  predictedProbability: number;
  inferenceLatencyMs: number;
  shapValues: ShapContribution[];
  retrievedDocs: RagDocumentChunk[];
  defaultAiAdvisory: {
    threatLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "NOMINAL";
    tacticalSummary: string;
    rootCauseAnalysis: string;
    immediateAction: string;
    safetyStandardCompliance: string;
    v2xBroadcastPayload: string;
  };
}

export interface InterviewQA {
  id: string;
  question: string;
  category: "Architecture" | "ML & XGBoost" | "RAG & Vector Search" | "Production Systems";
  difficulty: "Medium" | "Hard" | "Staff/Lead";
  whatHiringManagerLooksFor: string;
  rockSolidAnswer: string;
  keyPhrasesToSay: string[];
  pitfallToAvoid: string;
}
