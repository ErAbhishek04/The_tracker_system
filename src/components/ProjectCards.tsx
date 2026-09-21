import React, { useState } from "react";
import { 
  ProjectIdea 
} from "../types";
import { PROJECT_IDEAS } from "../data/projectIdeas";
import { 
  CheckCircle2, 
  ExternalLink, 
  Cpu, 
  Database, 
  Bot, 
  Award, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  PlayCircle,
  Copy,
  Check
} from "lucide-react";

interface ProjectCardsProps {
  onSelectForSimulation: (projectId: string) => void;
  onSelectForResume: (projectId: string) => void;
}

export const ProjectCards: React.FC<ProjectCardsProps> = ({
  onSelectForSimulation,
  onSelectForResume
}) => {
  const [selectedId, setSelectedId] = useState<string>(PROJECT_IDEAS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "Autonomous Vehicles & Connected Fleet", "Clean Energy & Connected Electric Fleets", "Logistics & Supply Chain Logistics", "FinTech & Payment Infrastructure", "Aerospace & Industrial IoT"];

  const filteredProjects = filterCategory === "All"
    ? PROJECT_IDEAS
    : PROJECT_IDEAS.filter(p => p.category === filterCategory);

  const activeProject = PROJECT_IDEAS.find(p => p.id === selectedId) || PROJECT_IDEAS[0];

  const handleCopySummary = (project: ProjectIdea) => {
    const text = `${project.title}\n\nSummary:\n${project.summary}\n\nXGBoost Layer:\n${project.xgboostLayer.objective}\n\nRAG Layer:\n${project.ragLayer.title}\n\nLLM Layer:\n${project.llmLayer.purpose}\n\nResume Bullets:\n${project.resumeBullets.map(b => "- " + b).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Explainer Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Why Hiring Managers Love the XGBoost + RAG + LLM Stack
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Predictive Tabular ML meets Generative Semantic Intelligence
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Pure LLMs take &gt;800ms, hallucinate math, and cannot process 100Hz continuous sensor telemetry like CAN-bus or kinematics.
            Pure XGBoost cannot parse regulatory safety codes or speak to operators.
            Combining <span className="text-emerald-400 font-semibold">XGBoost edge inference (&lt;10ms)</span> + <span className="text-cyan-400 font-semibold">Vector RAG</span> + <span className="text-indigo-400 font-semibold">LLM reasoning</span> creates a defensible, production-grade system that sets your resume apart from 99% of candidates.
          </p>
        </div>

        {/* Quick Badges */}
        <div className="mt-6 flex flex-wrap gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>XGBoost (Sub-10ms Tabular Inference)</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vector RAG (FMVSS & OEM Standards)</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>LLM Copilot (Actionable Tactical Dispatch)</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCategory === cat
                ? "bg-slate-100 text-slate-900 font-semibold shadow"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {cat === "All" ? "All Top 5 Blueprints" : cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Projects List (Left) + Deep Dive Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Project Selector Cards (Left: 5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
            <span>Select a Blueprint to inspect</span>
            <span>{filteredProjects.length} projects</span>
          </div>

          {filteredProjects.map((project) => {
            const isSelected = project.id === selectedId;
            const isFlagship = project.id === "fleetpulse-autonomous-telemetry";

            return (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                onClick={() => setSelectedId(project.id)}
                className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "bg-slate-900/90 border-cyan-500/80 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/40"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {project.domain.split("/")[0]}
                      </span>
                      {isFlagship && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                          Car Movement Flagship
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {project.title.split(":")[0]}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded">
                      <Award className="w-3 h-3" />
                      {project.resumeImpactScore}/10
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {project.tagline}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    <Cpu className="w-3 h-3" />
                    {project.xgboostLayer.latencyTarget}
                  </span>
                  <span className="text-slate-500">
                    {project.difficulty}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Project Full Deep Dive (Right: 7 cols on lg) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-xl space-y-6">
            {/* Header with Title and Action CTA */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {activeProject.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Resume Impact: <strong className="text-amber-300">{activeProject.resumeImpactScore}/10</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-blueprint"
                    onClick={() => handleCopySummary(activeProject)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    title="Copy full project blueprint"
                  >
                    {copiedId === activeProject.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Blueprint</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-launch-sim"
                    onClick={() => onSelectForSimulation(activeProject.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Run in Simulator</span>
                  </button>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeProject.title}
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {activeProject.summary}
              </p>
            </div>

            {/* Why This Project Sells to Hiring Managers */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1 uppercase tracking-wide">
                <Award className="w-4 h-4" />
                Why This Stands Out in Technical Interviews
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeProject.whyThisWorks}
              </p>
            </div>

            {/* The Triad Architecture Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                The Triad Architecture Breakdown
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* XGBoost Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-900/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <Cpu className="w-4 h-4" />
                    <span>XGBoost Layer</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {activeProject.xgboostLayer.title}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {activeProject.xgboostLayer.objective}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-300">
                    {activeProject.xgboostLayer.metrics}
                  </div>
                </div>

                {/* RAG Layer Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-900/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                    <Database className="w-4 h-4" />
                    <span>Vector RAG Layer</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {activeProject.ragLayer.title}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Indexed: {activeProject.ragLayer.documentsIndexed[0]}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300">
                    Store: {activeProject.ragLayer.vectorStore}
                  </div>
                </div>

                {/* LLM Layer Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-900/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                    <Bot className="w-4 h-4" />
                    <span>LLM Layer</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {activeProject.llmLayer.title}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {activeProject.llmLayer.purpose}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-indigo-300">
                    Model: {activeProject.llmLayer.modelType}
                  </div>
                </div>
              </div>
            </div>

            {/* Dataset Information */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Recommended Dataset
                </span>
                <h4 className="text-sm font-bold text-white">
                  {activeProject.dataset.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeProject.dataset.description} ({activeProject.dataset.recordCount})
                </p>
              </div>

              <a
                href={activeProject.dataset.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
              >
                <span>View Dataset</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Target Job Roles */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Optimal Target Roles for Resume:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeProject.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/60"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                id="btn-view-resume-bullets"
                onClick={() => onSelectForResume(activeProject.id)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>View ready-to-copy Resume STAR Bullets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
