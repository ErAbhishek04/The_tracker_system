/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header, ActiveTab } from "./components/Header";
import { ProjectCards } from "./components/ProjectCards";
import { PipelineSimulator } from "./components/PipelineSimulator";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { InterviewPrepView } from "./components/InterviewPrepView";
import { AiProjectAdvisor } from "./components/AiProjectAdvisor";
import { GitHubRepoViewer } from "./components/GitHubRepoViewer";
import { ShieldCheck, Sparkles, Terminal, Car, Cpu, Database, Bot } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("blueprints");
  const [activeProjectId, setActiveProjectId] = useState<string>("fleetpulse-autonomous-telemetry");
  const [healthStatus, setHealthStatus] = useState<{ geminiConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => console.log("Health check note:", err));
  }, []);

  const handleSelectForSimulation = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveTab("simulator");
  };

  const handleSelectForResume = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveTab("resume");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        geminiConnected={healthStatus?.geminiConfigured}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "blueprints" && (
          <ProjectCards
            onSelectForSimulation={handleSelectForSimulation}
            onSelectForResume={handleSelectForResume}
          />
        )}

        {activeTab === "simulator" && (
          <PipelineSimulator initialScenarioId="highway-cut-in-braking" />
        )}

        {activeTab === "resume" && (
          <ResumeBuilder initialProjectId={activeProjectId} />
        )}

        {activeTab === "interview" && (
          <InterviewPrepView />
        )}

        {activeTab === "advisor" && (
          <AiProjectAdvisor />
        )}

        {activeTab === "github" && (
          <GitHubRepoViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">
              XGBoost + RAG + LLM Portfolio Blueprint
            </span>
            <span className="text-slate-600">|</span>
            <span>Edge Tabular Ingestion + Vector Search + Semantic Synthesis</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Sub-10ms Edge ML
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              FAISS / ChromaDB RAG
            </span>
            <span className="flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
