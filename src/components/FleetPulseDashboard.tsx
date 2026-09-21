import React, { useState, useEffect, useRef } from "react";
import { 
  Car, 
  Cpu, 
  Database, 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  Terminal, 
  FileCode, 
  ShieldAlert, 
  Sliders, 
  Compass, 
  Activity, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  GitBranch,
  Copy,
  Check
} from "lucide-react";
import { SIMULATION_SCENARIOS } from "../data/simulationScenarios";
import { TelemetryData } from "../types";

export const FleetPulseDashboard: React.FC = () => {
  // Active Scenario
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const scenario = SIMULATION_SCENARIOS[activeScenarioIndex];

  // Live Telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData>(scenario.telemetry);
  
  // Real-time animation playback loop
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [tick, setTick] = useState<number>(0);
  const [calcProb, setCalcProb] = useState<number>(scenario.predictedProbability);
  const [calcLatency, setCalcLatency] = useState<number>(scenario.inferenceLatencyMs);
  const [selectedTab, setSelectedTab] = useState<"live" | "api" | "rag" | "github">("live");

  // Live streaming logs
  const [logs, setLogs] = useState<{ time: string; text: string; type: "info" | "warn" | "danger" | "rag" }[]>([
    { time: "10:00:00.10", text: "CAN-bus 10Hz socket connected: EGO_VEH_WAYMO_8924", type: "info" },
    { time: "10:00:00.20", text: "Feature extractor initialized: [speed, ttc, lat_accel, yaw, mu]", type: "info" },
    { time: "10:00:00.30", text: "XGBoost booster active (v2.0, hist tree method, sub-6ms latency)", type: "info" },
  ]);

  // Copilot Live response
  const [aiAdvisory, setAiAdvisory] = useState(scenario.defaultAiAdvisory);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sync when scenario tab is clicked
  useEffect(() => {
    setTelemetry(scenario.telemetry);
    setCalcProb(scenario.predictedProbability);
    setCalcLatency(scenario.inferenceLatencyMs);
    setAiAdvisory(scenario.defaultAiAdvisory);
    setLogs(prev => [
      { time: new Date().toISOString().substring(11, 19), text: `Scenario loaded: ${scenario.name}`, type: "info" },
      ...prev.slice(0, 15)
    ]);
  }, [activeScenarioIndex]);

  // Continuous 10Hz Simulation Engine Tick
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);

      // Micro-fluctuations mimicking real 10Hz CAN-bus noise
      setTelemetry(prev => {
        const noiseTtc = Math.sin(tick * 0.15) * 0.08;
        const noiseLat = Math.cos(tick * 0.2) * 0.12;
        const currentTtc = Math.max(0.6, Math.min(4.5, prev.timeToCollision + noiseTtc));
        const currentLat = Math.max(0.1, Math.min(4.8, prev.lateralAccel + noiseLat));

        // Recompute hazard probability
        let prob = 1.0 / (1.0 + Math.exp(-((1.0 / currentTtc) * 2.2 + currentLat * 0.7 - 2.8)));
        prob = Math.max(0.04, Math.min(0.98, prob));
        setCalcProb(prob);

        // Latency simulation (2.4ms to 5.8ms)
        const lat = 2.4 + (tick % 7) * 0.45;
        setCalcLatency(Number(lat.toFixed(2)));

        return {
          ...prev,
          timeToCollision: Number(currentTtc.toFixed(2)),
          lateralAccel: Number(currentLat.toFixed(2)),
          speedKmh: Number((prev.speedKmh + (Math.sin(tick * 0.1) * 0.4)).toFixed(1)),
          yawRate: Number((prev.yawRate + (Math.cos(tick * 0.1) * 0.25)).toFixed(1))
        };
      });

      // Periodic stream log
      if (tick % 10 === 0) {
        const isHazard = calcProb > 0.75;
        setLogs(prev => [
          {
            time: new Date().toISOString().substring(11, 21),
            text: isHazard 
              ? `[CRITICAL HAZARD] TTC: ${telemetry.timeToCollision}s | LatAccel: ${telemetry.lateralAccel}m/s² | Prob: ${(calcProb * 100).toFixed(1)}%`
              : `[CAN-10Hz] Speed: ${telemetry.speedKmh} km/h | TTC: ${telemetry.timeToCollision}s | Inference: ${calcLatency}ms`,
            type: isHazard ? "danger" : "info"
          },
          ...prev.slice(0, 18)
        ]);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, tick, calcProb, calcLatency, telemetry]);

  const handleSlider = (key: keyof TelemetryData, val: number) => {
    setTelemetry(prev => ({ ...prev, [key]: val }));
    let baseTtc = key === "timeToCollision" ? val : telemetry.timeToCollision;
    let baseLat = key === "lateralAccel" ? val : telemetry.lateralAccel;
    let prob = 1.0 / (1.0 + Math.exp(-((1.0 / Math.max(0.1, baseTtc)) * 2.3 + baseLat * 0.8 - 2.9)));
    setCalcProb(Math.max(0.04, Math.min(0.98, prob)));
  };

  const handleLiveCopilotQuery = async () => {
    setIsAiLoading(true);
    try {
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
        if (data.analysis) {
          setAiAdvisory(prev => ({
            ...prev,
            tacticalSummary: `LIVE ADVISORY: Hazard Probability ${(calcProb * 100).toFixed(1)}%`,
            rootCauseAnalysis: data.analysis
          }));
          setLogs(prev => [
            { time: new Date().toISOString().substring(11, 19), text: "Gemini 2.5 Live Tactical Synthesis Completed", type: "rag" },
            ...prev
          ]);
        }
      }
    } catch (e) {
      console.warn("Using local advisory fallback", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isCritical = calcProb > 0.75;
  const isElevated = calcProb > 0.45 && !isCritical;

  return (
    <div className="space-y-6">
      {/* Real-time Top Control Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live 10Hz Vehicle Loop
              </span>
              <span className="text-xs text-slate-400 font-mono">
                P99 Latency: <strong className="text-emerald-400">{calcLatency} ms</strong> (&lt;6ms Edge SLA)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>FleetPulse: Real-Time Cut-In & Trajectory Predictor</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-md ${
                isPlaying 
                  ? "bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900/80"
                  : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/50"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Loop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Loop</span>
                </>
              )}
            </button>

            {/* Scenario Picker */}
            <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
              {SIMULATION_SCENARIOS.slice(0, 3).map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScenarioIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeScenarioIndex === idx
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s.badge.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Live Vehicle Canvas & Telemetry Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Animated 2D Highway Trajectory Canvas */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Live Trajectory Field
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                isCritical 
                  ? "bg-red-950 text-red-300 border-red-800 animate-pulse" 
                  : isElevated 
                  ? "bg-amber-950 text-amber-300 border-amber-800" 
                  : "bg-emerald-950 text-emerald-300 border-emerald-800"
              }`}>
                {isCritical ? "CRITICAL HAZARD" : isElevated ? "ELEVATED CONVERGENCE" : "NOMINAL STREAM"}
              </span>
            </div>

            {/* Simulated 2D Road Stage */}
            <div className="relative h-44 w-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Highway Lane Lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none opacity-40">
                <div className="w-full border-b border-dashed border-slate-600" />
                <div className="w-full border-b border-dashed border-slate-600" />
              </div>

              {/* Ego Vehicle (Green/Blue) */}
              <div className="absolute left-10 transition-all duration-200 flex flex-col items-center">
                <div className="w-11 h-7 rounded-md bg-gradient-to-r from-cyan-500 to-emerald-500 border border-white/40 shadow-lg flex items-center justify-center text-[10px] font-bold text-black font-mono">
                  EGO
                </div>
                <span className="text-[9px] font-mono text-cyan-300 mt-1">
                  {telemetry.speedKmh.toFixed(0)} km/h
                </span>
              </div>

              {/* Distance Line Indicator */}
              <div 
                className="absolute h-0.5 border-t border-dashed transition-all duration-200"
                style={{
                  left: "90px",
                  width: `${Math.max(40, Math.min(180, (telemetry.timeToCollision / 3.5) * 160))}px`,
                  borderColor: isCritical ? "#ef4444" : "#10b981"
                }}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-400 bg-slate-950 px-1 rounded">
                  TTC {telemetry.timeToCollision.toFixed(1)}s
                </span>
              </div>

              {/* Target / Cut-In Vehicle */}
              <div 
                className="absolute transition-all duration-200 flex flex-col items-center"
                style={{
                  left: `${Math.max(130, Math.min(260, 90 + (telemetry.timeToCollision / 3.5) * 160))}px`,
                  top: `${Math.max(25, Math.min(105, 60 - telemetry.lateralAccel * 8))}px`
                }}
              >
                <div className={`w-11 h-7 rounded-md border shadow-lg flex items-center justify-center text-[10px] font-bold text-white font-mono ${
                  isCritical 
                    ? "bg-red-600 border-red-300 shadow-red-950/70 animate-bounce" 
                    : "bg-amber-600 border-amber-300"
                }`}>
                  TGT
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1">
                  ay: {telemetry.lateralAccel.toFixed(1)}m/s²
                </span>
              </div>

              {/* Conflict Cone / Radar Beam */}
              <div 
                className="absolute left-20 w-36 h-28 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{ clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 60%)" }}
              />
            </div>
          </div>

          {/* Interactive Kinematic Sliders */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                CAN-bus Telemetry Controls
              </span>
              <button
                onClick={() => {
                  setTelemetry(scenario.telemetry);
                  setCalcProb(scenario.predictedProbability);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Time to collision */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Time-To-Collision (TTC):</span>
                <span className={`font-mono font-bold ${telemetry.timeToCollision < 1.4 ? "text-red-400" : "text-emerald-400"}`}>
                  {telemetry.timeToCollision.toFixed(2)} s
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.5"
                step="0.05"
                value={telemetry.timeToCollision}
                onChange={(e) => handleSlider("timeToCollision", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Lateral Acceleration */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Lateral Acceleration (ay):</span>
                <span className="font-mono font-bold text-amber-400">
                  {telemetry.lateralAccel.toFixed(2)} m/s²
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={telemetry.lateralAccel}
                onChange={(e) => handleSlider("lateralAccel", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Ego Speed:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {telemetry.speedKmh.toFixed(1)} km/h
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="140"
                step="1"
                value={telemetry.speedKmh}
                onChange={(e) => handleSlider("speedKmh", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Road Friction */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Pavement Grip (mu):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {telemetry.roadSurfaceFriction.toFixed(2)} ({telemetry.roadSurfaceFriction > 0.75 ? "Dry Asphalt" : "Wet / Slick"})
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={telemetry.roadSurfaceFriction}
                onChange={(e) => handleSlider("roadSurfaceFriction", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Column 2: XGBoost Fast Path & SHAP Attribution (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* XGBoost Probability Gauge */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                Edge XGBoost Booster
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                P99: {calcLatency} ms
              </span>
            </div>

            {/* Big Risk Indicator */}
            <div className={`p-4 rounded-xl border ${
              isCritical ? "bg-red-950/60 border-red-800" : isElevated ? "bg-amber-950/60 border-amber-800" : "bg-emerald-950/60 border-emerald-800"
            } flex items-center justify-between`}>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Trajectory Cut-In Risk
                </span>
                <div className="text-3xl font-black font-mono text-white mt-0.5">
                  {(calcProb * 100).toFixed(1)}%
                </div>
                <span className="text-xs text-slate-300">
                  {isCritical ? "Imminent Collision Maneuver" : isElevated ? "Trajectory Convergence Threat" : "Nominal Cruising State"}
                </span>
              </div>

              <div className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
                isCritical ? "bg-red-900/80 text-red-200 border-red-700" : isElevated ? "bg-amber-900/80 text-amber-200 border-amber-700" : "bg-emerald-900/80 text-emerald-200 border-emerald-700"
              }`}>
                {isCritical ? "CRITICAL" : isElevated ? "WARNING" : "CLEAR"}
              </div>
            </div>

            {/* SHAP Drivers */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                SHAP TreeExplainer Impact Drivers
              </span>
              <div className="space-y-1.5">
                {scenario.shapValues.map((shap, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                    <span className="text-slate-300 text-[11px] truncate max-w-[200px]">{shap.feature}</span>
                    <span className={`font-mono font-bold text-[11px] ${shap.shapValue > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {shap.shapValue > 0 ? `+${shap.shapValue.toFixed(2)}` : shap.shapValue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RAG Knowledge Base Retrieval Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                Grounded Vector RAG
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                NHTSA / OEM Standards
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {scenario.retrievedDocs.map(doc => (
                <div key={doc.id} className="p-2.5 rounded-lg bg-slate-950 border border-cyan-900/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 text-[11px] truncate max-w-[220px]">
                      {doc.title}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {(doc.similarityScore * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: LLM Tactical Advisory & SAE J2735 V2X Packet (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4" />
                LLM Tactical Copilot
              </span>
              <button
                onClick={handleLiveCopilotQuery}
                disabled={isAiLoading}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800 flex items-center gap-1 transition disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{isAiLoading ? "Synthesizing..." : "Ask Gemini Live"}</span>
              </button>
            </div>

            {/* In-Cabin Audible / Visual Alert */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/70 to-slate-950 border border-red-800/80 space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                In-Cabin Driver Warning
              </span>
              <p className="text-xs font-extrabold text-white font-mono leading-tight">
                {aiAdvisory.tacticalSummary}
              </p>
            </div>

            {/* Root Cause grounded in RAG */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Neuro-Symbolic Root Cause
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {aiAdvisory.rootCauseAnalysis}
              </p>
            </div>

            {/* Actuator Deceleration Command */}
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vehicle Control Unit Directive
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {aiAdvisory.immediateAction}
              </p>
            </div>

            {/* SAE J2735 V2X Broadcast Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  SAE J2735 V2X Broadcast Packet
                </span>
                <button
                  onClick={() => handleCopy(aiAdvisory.v2xBroadcastPayload, "v2x")}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copiedText === "v2x" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText === "v2x" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded-lg bg-black/70 border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto">
                {aiAdvisory.v2xBroadcastPayload}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live CAN-bus Ingestion Console */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Real-Time CAN-Bus Telemetry Stream Log
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            10Hz • Non-blocking async queue
          </span>
        </div>

        <div className="h-28 overflow-y-auto font-mono text-[11px] bg-black/60 rounded-xl p-3 border border-slate-800/80 space-y-1 scrollbar-thin">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-slate-500 shrink-0">{log.time}</span>
              <span className={
                log.type === "danger" 
                  ? "text-red-400 font-bold" 
                  : log.type === "rag" 
                  ? "text-cyan-300" 
                  : "text-slate-300"
              }>
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
