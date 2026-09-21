import React, { useState } from "react";
import { PROJECT_IDEAS } from "../data/projectIdeas";
import { CODE_SNIPPETS } from "../data/codeSnippets";
import { 
  Copy, 
  Check, 
  FileText, 
  FolderTree, 
  Code, 
  Layers, 
  Award, 
  Sparkles, 
  CheckCircle2,
  Terminal,
  Cpu
} from "lucide-react";

interface ResumeBuilderProps {
  initialProjectId?: string;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ initialProjectId }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || PROJECT_IDEAS[0].id
  );
  const [targetRole, setTargetRole] = useState<string>("Machine Learning Engineer");
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [activeSnippetIdx, setActiveSnippetIdx] = useState<number>(0);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  const project = PROJECT_IDEAS.find(p => p.id === selectedProjectId) || PROJECT_IDEAS[0];

  // Role-customized bullets
  const getRoleBullets = () => {
    if (targetRole === "Autonomous Systems / ADAS Engineer") {
      return [
        "Architected an autonomous vehicle maneuver & collision hazard predictor processing 1.4M+ trajectory records from the Waymo & NGSIM datasets, forecasting cut-ins 3.0 seconds ahead with 0.943 ROC-AUC.",
        "Built a low-latency edge inference engine using XGBoost with ONNX Runtime, maintaining sub-7ms P99 latency to satisfy strict 10Hz automotive CAN-bus control loop constraints.",
        "Engineered a neuro-symbolic RAG pipeline using FAISS to map anomalous kinematic SHAP drivers (high yaw-rate, critical TTC) to NHTSA FMVSS 126 safety standards and OEM sensor calibration specs.",
        "Synthesized driver in-cabin tactical advisories and automated SAE J2735 compliant V2X broadcast packets via LLM orchestration, cutting secondary collision risks by 36%."
      ];
    }
    if (targetRole === "AI Systems / LLM Engineer") {
      return [
        "Constructed a high-throughput hybrid AI architecture coupling tabular XGBoost inference (<7ms) with an asynchronous Vector RAG & LLM tactical advisory copilot.",
        "Developed a dynamic prompt grounding mechanism using SHAP TreeExplainer to vectorize continuous tabular feature attributions into ChromaDB semantic search queries.",
        "Integrated Gemini 3.8 Flash / Llama 3 with strict JSON schema constraints and automated RAGAS evaluation, guaranteeing zero ungrounded safety hallucinations.",
        "Containerized the end-to-end service using FastAPI, Redis caching, and Docker, achieving 99.9% uptime and handling 1,200 requests/sec in load testing."
      ];
    }
    if (targetRole === "Data Scientist (Telematics / IoT)") {
      return [
        "Formulated feature engineering pipelines extracting rolling jerk, yaw-acceleration, and inverse time-to-collision (TTC) from 10Hz vehicle CAN-bus sensor telemetry.",
        "Addressed extreme class imbalance (100:1 ratio) using custom scale_pos_weight optimization and cost-sensitive thresholding, boosting minority-class recall to 92.4%.",
        "Pioneered a regulatory RAG knowledge retrieval system over 200+ pages of federal safety guidelines, replacing manual compliance search with semantic vector search.",
        "Demonstrated project business value by backtesting on 4,500 real vehicle trips, reducing unnecessary emergency braking false alerts by 38%."
      ];
    }
    // Default: Machine Learning Engineer
    return project.resumeBullets;
  };

  const currentBullets = getRoleBullets();

  const handleCopySingleBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleCopyAllBullets = () => {
    const formatted = currentBullets.map(b => `• ${b}`).join("\n");
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Title Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 mb-2">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            Resume Bullet Generator (STAR / Google XYZ Format)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Portfolio-Defining Resume Content & Production Codebase
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tailored bullet points with quantified metrics, architectural diagram, and GitHub repository starter code.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Blueprint:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {PROJECT_IDEAS.map(p => (
              <option key={p.id} value={p.id}>
                {p.title.split(":")[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role Switcher & STAR Bullets Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Tailor for Your Target Position
            </h3>
            <p className="text-xs text-slate-400">
              Select your role to adjust emphasis (latency optimization vs. RAG architecture vs. statistical modeling).
            </p>
          </div>

          {/* Role Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[
              "Machine Learning Engineer",
              "Autonomous Systems / ADAS Engineer",
              "AI Systems / LLM Engineer",
              "Data Scientist (Telematics / IoT)"
            ].map(role => (
              <button
                key={role}
                onClick={() => setTargetRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  targetRole === role
                    ? "bg-cyan-600 text-white shadow"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Bullets List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ready-to-Paste Resume Bullets (Click any bullet to copy):
            </span>
            <button
              onClick={handleCopyAllBullets}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All Bullets Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Bullets</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2.5">
            {currentBullets.map((bullet, idx) => (
              <div
                key={idx}
                onClick={() => handleCopySingleBullet(bullet, idx)}
                className="group cursor-pointer p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/70 hover:bg-slate-900/60 transition flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 group-hover:bg-cyan-950 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-slate-700">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {bullet}
                  </p>
                </div>

                <div className="shrink-0 text-slate-500 group-hover:text-cyan-400 transition pt-0.5">
                  {copiedBulletIdx === idx ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies Badge Pill Bar */}
        <div className="pt-4 border-t border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Keywords & Tech Stack for Resume Skills Section:
          </span>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map(tech => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-950 text-cyan-300 border border-slate-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Visual System Architecture Diagram */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              Production System Architecture Blueprint
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Decoupled Fast-Path (&lt;10ms) vs. Slow-Path (Async)
          </span>
        </div>

        {/* Interactive Architecture Flowchart Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Node 1 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">1. Ingestion</div>
            <div className="text-xs font-bold text-white">10Hz Telemetry</div>
            <p className="text-[11px] text-slate-400">
              CAN-bus, IMU, GPS, LiDAR bounding boxes streamed via Redis / Kafka.
            </p>
          </div>

          {/* Node 2 */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 space-y-1">
            <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">2. Fast Path (&lt;10ms)</div>
            <div className="text-xs font-bold text-white">XGBoost ONNX</div>
            <p className="text-[11px] text-slate-300">
              Sliding-window kinematics &rarr; Cut-in / collision probability score.
            </p>
          </div>

          {/* Node 3 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">3. Trigger Gate</div>
            <div className="text-xs font-bold text-white">SHAP Explainer</div>
            <p className="text-[11px] text-slate-400">
              If risk &gt; 0.70, extract top 3 SHAP drivers to vectorize query.
            </p>
          </div>

          {/* Node 4 */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/80 space-y-1">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">4. Semantic RAG</div>
            <div className="text-xs font-bold text-white">ChromaDB / FAISS</div>
            <p className="text-[11px] text-slate-300">
              Retrieves NHTSA FMVSS 126, Bosch sensor specs & fleet SOPs.
            </p>
          </div>

          {/* Node 5 */}
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/80 space-y-1">
            <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase">5. Action Loop</div>
            <div className="text-xs font-bold text-white">LLM Copilot</div>
            <p className="text-[11px] text-slate-300">
              Outputs in-cabin driver advisory, V2X SAE J2735 packet, and audit log.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Repository Structure & Starter Code Viewer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              Production Starter Codebase
            </h3>
            <p className="text-xs text-slate-400">
              Complete, runnable Python scripts for model training, vector indexing, and FastAPI serving.
            </p>
          </div>

          {/* Snippet Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {CODE_SNIPPETS.map((snippet, idx) => (
              <button
                key={snippet.filename}
                onClick={() => setActiveSnippetIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                  activeSnippetIdx === idx
                    ? "bg-cyan-600 text-white shadow"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
                }`}
              >
                {snippet.filename}
              </button>
            ))}
          </div>
        </div>

        {/* Active Snippet Viewer */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-300">
              {CODE_SNIPPETS[activeSnippetIdx].description}
            </span>
            <button
              onClick={() => handleCopyCode(CODE_SNIPPETS[activeSnippetIdx].code)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copiedSnippet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 scrollbar-thin leading-relaxed">
            <code>{CODE_SNIPPETS[activeSnippetIdx].code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
