import React, { useState } from "react";
import { 
  SimulationScenario, 
  TelemetryData, 
  ShapContribution, 
  RagDocumentChunk 
} from "../types";
import { SIMULATION_SCENARIOS } from "../data/simulationScenarios";
import { 
  Cpu, 
  Database, 
  Bot, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  Radio, 
  ShieldAlert, 
  Terminal, 
  RotateCcw,
  Zap,
  Info
} from "lucide-react";

interface PipelineSimulatorProps {
  initialScenarioId?: string;
}

export const PipelineSimulator: React.FC<PipelineSimulatorProps> = ({ initialScenarioId }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    initialScenarioId || SIMULATION_SCENARIOS[0].id
  );

  const scenario = SIMULATION_SCENARIOS.find(s => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[0];

  // Modifiable telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData>(scenario.telemetry);
  
  // Pipeline execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(3); // 1: XGBoost, 2: RAG, 3: LLM (default complete)
  const [liveAiAdvisory, setLiveAiAdvisory] = useState(scenario.defaultAiAdvisory);
  const [aiSource, setAiSource] = useState<string>("precomputed");
  const [calculatedProb, setCalculatedProb] = useState<number>(scenario.predictedProbability);
  const [shapList, setShapList] = useState<ShapContribution[]>(scenario.shapValues);

  // When scenario changes, sync telemetry
  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id);
    const newScenario = SIMULATION_SCENARIOS.find(s => s.id === id) || SIMULATION_SCENARIOS[0];
    setTelemetry(newScenario.telemetry);
    setCalculatedProb(newScenario.predictedProbability);
    setShapList(newScenario.shapValues);
    setLiveAiAdvisory(newScenario.defaultAiAdvisory);
    setAiSource("precomputed");
    setActiveStep(3);
  };

  // Re-calculate dynamic probability on slider movement
  const handleTelemetrySlider = (key: keyof TelemetryData, val: number) => {
    const updated = { ...telemetry, [key]: val };
    setTelemetry(updated);

    // Dynamic heuristic calculation approximating XGBoost model response
    let base = scenario.predictedProbability;
    if (key === "timeToCollision") {
      // Lower TTC = higher collision risk
      base = val < 1.5 ? Math.min(0.99, base + (1.5 - val) * 0.15) : Math.max(0.15, base - (val - 1.5) * 0.12);
    } else if (key === "lateralAccel") {
      base = val > 2.5 ? Math.min(0.99, base + (val - 2.5) * 0.1) : Math.max(0.2, base - (2.5 - val) * 0.08);
    } else if (key === "speedKmh") {
      base = val > 90 ? Math.min(0.99, base + 0.04) : base;
    } else if (key === "roadSurfaceFriction") {
      base = val < 0.7 ? Math.min(0.99, base + 0.06) : base;
    }
    setCalculatedProb(Math.max(0.05, Math.min(0.99, base)));
  };

  // Run the full pipeline with live backend AI call
  const runPipeline = async () => {
    setIsRunning(true);
    setActiveStep(1);

    // Step 1: XGBoost calculation simulation
    await new Promise(r => setTimeout(r, 600));
    setActiveStep(2);

    // Step 2: RAG retrieval simulation
    await new Promise(r => setTimeout(r, 700));
    setActiveStep(3);

    try {
      // Call server-side pipeline endpoint
      const res = await fetch("/api/simulate-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          telemetryData: telemetry,
          queryContext: scenario.retrievedDocs.map(d => ({ title: d.title, content: d.content }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis && data.source === "gemini-3.8-flash") {
          setLiveAiAdvisory({
            ...scenario.defaultAiAdvisory,
            tacticalSummary: `[Gemini Live Synthesis] Probability: ${(calculatedProb * 100).toFixed(1)}% | ${data.analysis.split("\n")[0] || scenario.defaultAiAdvisory.tacticalSummary}`,
            rootCauseAnalysis: data.analysis
          });
          setAiSource("gemini-3.8-flash");
        } else {
          setAiSource("edge-engine");
        }
      }
    } catch (err) {
      console.warn("Using local advisory fallback:", err);
      setAiSource("edge-engine");
    } finally {
      setIsRunning(false);
    }
  };

  const getThreatBadge = (prob: number) => {
    if (prob > 0.85) return { label: "CRITICAL", bg: "bg-red-950/80", text: "text-red-400", border: "border-red-800" };
    if (prob > 0.70) return { label: "HIGH THREAT", bg: "bg-amber-950/80", text: "text-amber-400", border: "border-amber-800" };
    if (prob > 0.40) return { label: "ELEVATED", bg: "bg-yellow-950/80", text: "text-yellow-400", border: "border-yellow-800" };
    return { label: "NOMINAL", bg: "bg-emerald-950/80", text: "text-emerald-400", border: "border-emerald-800" };
  };

  const threat = getThreatBadge(calculatedProb);

  return (
    <div className="space-y-8">
      {/* Top Banner & Scenario Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Live Real-Time Telemetry Pipeline
            </span>
            <span className="text-xs text-slate-400">
              Sensor Ingestion &rarr; XGBoost (&lt;6ms) &rarr; SHAP &rarr; ChromaDB RAG &rarr; LLM
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Autonomous Vehicle Movement & Incident Simulator
          </h2>
        </div>

        {/* Scenario Dropdown / Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {SIMULATION_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => handleScenarioChange(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedScenarioId === s.id
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {s.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulator Workspace: 3 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Live CAN-bus Telemetry & Sliders (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  CAN-Bus Sensor Feed (10Hz)
                </h3>
              </div>
              <button
                onClick={() => handleScenarioChange(scenario.id)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                title="Reset to scenario defaults"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
              Vehicle ID: <strong className="text-cyan-300">{telemetry.vehicleId}</strong> | Stream: CAN_ID_0x3B4
            </div>

            {/* Sliders */}
            <div className="space-y-3 text-xs">
              {/* Speed */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Longitudinal Speed:</span>
                  <span className="font-mono text-cyan-300 font-bold">{telemetry.speedKmh.toFixed(1)} km/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="140"
                  step="1"
                  value={telemetry.speedKmh}
                  onChange={(e) => handleTelemetrySlider("speedKmh", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Time to Collision (TTC) */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1">
                    Time-To-Collision (TTC):
                    {telemetry.timeToCollision < 1.4 && (
                      <span className="text-[10px] text-red-400 font-bold uppercase">(Critical)</span>
                    )}
                  </span>
                  <span className={`font-mono font-bold ${telemetry.timeToCollision < 1.4 ? "text-red-400" : "text-emerald-300"}`}>
                    {telemetry.timeToCollision.toFixed(2)} s
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.05"
                  value={telemetry.timeToCollision}
                  onChange={(e) => handleTelemetrySlider("timeToCollision", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Lateral Acceleration */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Lateral Accel (ay):</span>
                  <span className="font-mono text-cyan-300 font-bold">{telemetry.lateralAccel.toFixed(2)} m/s²</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.5"
                  step="0.1"
                  value={telemetry.lateralAccel}
                  onChange={(e) => handleTelemetrySlider("lateralAccel", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Yaw Rate */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Yaw Angular Rate:</span>
                  <span className="font-mono text-cyan-300 font-bold">{telemetry.yawRate.toFixed(1)} °/s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="20.0"
                  step="0.2"
                  value={telemetry.yawRate}
                  onChange={(e) => handleTelemetrySlider("yawRate", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Road Surface Friction */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Pavement Friction (mu):</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {telemetry.roadSurfaceFriction.toFixed(2)} ({telemetry.roadSurfaceFriction > 0.75 ? "Dry" : "Wet/Slick"})
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.02"
                  value={telemetry.roadSurfaceFriction}
                  onChange={(e) => handleTelemetrySlider("roadSurfaceFriction", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              id="btn-run-pipeline"
              onClick={runPipeline}
              disabled={isRunning}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Trajectory & RAG...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-emerald-300" />
                  <span>Execute Full Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Column 2: Stage 1 (XGBoost) & Stage 2 (Vector RAG) (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Stage 1: XGBoost Inference & SHAP Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Stage 1: XGBoost Tree Inference</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                P99 Latency: {scenario.inferenceLatencyMs} ms
              </span>
            </div>

            {/* Probability Gauge Box */}
            <div className={`p-4 rounded-xl border ${threat.bg} ${threat.border} flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Predicted Maneuver Risk
                </span>
                <div className="text-2xl font-extrabold text-white font-mono">
                  {(calculatedProb * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {scenario.predictedClass}
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${threat.text} border ${threat.border}`}>
                {threat.label}
              </div>
            </div>

            {/* SHAP TreeExplainer Attributions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  SHAP Feature Drivers
                  <Info className="w-3 h-3 text-slate-500" />
                </span>
                <span className="text-[10px]">Attribution &plusmn; Impact</span>
              </div>

              <div className="space-y-1.5">
                {shapList.map((item, idx) => {
                  const isPositive = item.shapValue > 0;
                  return (
                    <div key={idx} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">{item.feature}</span>
                        <span className={`font-mono font-bold ${isPositive ? "text-red-400" : "text-emerald-400"}`}>
                          {isPositive ? `+${item.shapValue.toFixed(2)}` : item.shapValue.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stage 2: Vector RAG Knowledge Retrieval */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Stage 2: Vector RAG Chunks</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                Top {scenario.retrievedDocs.length} Chunks
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {scenario.retrievedDocs.map((doc) => (
                <div key={doc.id} className="p-3 rounded-lg bg-slate-950/80 border border-cyan-900/40 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-cyan-300 line-clamp-1">
                      {doc.title}
                    </span>
                    <span className="shrink-0 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded">
                      {(doc.similarityScore * 100).toFixed(1)}% Sim
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                    "{doc.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Stage 3 (LLM Tactical Reasoning & Dispatch) (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>Stage 3: LLM Tactical Advisory</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                Engine: {aiSource}
              </span>
            </div>

            {/* In-Cabin Audio / Visual Alert Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/70 to-slate-950 border border-red-800/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                In-Cabin Driver HMI Command
              </div>
              <div className="text-sm font-extrabold text-white font-mono">
                {liveAiAdvisory.tacticalSummary}
              </div>
            </div>

            {/* Root Cause Analysis (XGBoost SHAP + RAG Grounded) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Neuro-Symbolic Root Cause Analysis
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {liveAiAdvisory.rootCauseAnalysis}
              </p>
            </div>

            {/* Immediate Action Directive */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Immediate Action Directive
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {liveAiAdvisory.immediateAction}
              </p>
            </div>

            {/* Standard Compliance */}
            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              <span className="font-semibold text-slate-300">Compliance Basis: </span>
              {liveAiAdvisory.safetyStandardCompliance}
            </div>

            {/* V2X SAE J2735 Broadcast Packet */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3 h-3 text-cyan-400" />
                V2X Broadcast Packet (SAE J2735)
              </span>
              <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto">
                {liveAiAdvisory.v2xBroadcastPayload}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
