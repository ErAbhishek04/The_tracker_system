/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header, ActiveTab } from "./components/Header";
import { FleetPulseDashboard } from "./components/FleetPulseDashboard";
import { PipelineSimulator } from "./components/PipelineSimulator";
import { AiProjectAdvisor } from "./components/AiProjectAdvisor";
import { GitHubRepoViewer } from "./components/GitHubRepoViewer";
import { Car, Cpu, Database, Bot, ShieldCheck } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("app");
  const [healthStatus, setHealthStatus] = useState<{ geminiConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => console.log("Health check note:", err));
  }, []);

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
        {activeTab === "app" && (
          <FleetPulseDashboard />
        )}

        {activeTab === "simulator" && (
          <PipelineSimulator initialScenarioId="highway-cut-in-braking" />
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
              FleetPulse AV Perception & Decision System
            </span>
            <span className="text-slate-600">|</span>
            <span>Sub-6ms XGBoost + Vector RAG + Gemini Copilot</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              10Hz CAN-bus FIFO
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              NHTSA FMVSS 126 Vector RAG
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              SAE J2735 V2X
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
