import React, { useState } from "react";
import { PROJECT_IDEAS } from "../data/projectIdeas";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Cpu, 
  HelpCircle, 
  Copy, 
  Check,
  RefreshCw
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: string;
}

export const AiProjectAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your **AI Systems Career Architect**. I help engineers turn the **XGBoost + RAG + LLM stack** into resume-defining portfolio projects that pass technical screening at top tech and autonomous vehicle companies.\n\nYou can ask me to:\n- Tailor this project for a specific target company (e.g. Waymo, Tesla, Uber, Databricks)\n- Optimize your resume bullet points for ATS\n- Suggest edge cases or custom feature engineering ideas\n- Explain how to defend the system architecture in a live technical interview.",
      source: "system"
    }
  ]);

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("Machine Learning Engineer");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const promptSuggestions = [
    "How do I pitch FleetPulse to a recruiter at Waymo or Tesla?",
    "Why not use an LSTM/GRU or Transformer instead of XGBoost?",
    "How do I handle missing sensor frames in the 10Hz CAN-bus stream?",
    "Review and polish my draft STAR bullet points for maximum impact."
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: textToSend }
    ];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          projectContext: PROJECT_IDEAS[0],
          userRole: selectedRole,
          history: newMessages.slice(-6)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.reply || "No reply generated.",
            source: data.source
          }
        ]);
      } else {
        throw new Error("Failed to reach server");
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "### Architecture Advisory Note\n\n" +
            "To pitch this to an autonomous vehicle recruiter:\n" +
            "1. **Frame the problem clearly**: Emphasize that 10Hz CAN-bus telemetry cannot be processed with LLMs due to a 500ms+ latency budget, while pure XGBoost lacks semantic understanding of DOT safety manuals.\n" +
            "2. **Highlight the bridge**: You used **SHAP TreeExplainer** as the mathematical link to turn continuous physical telemetry anomalies into vectorized semantic queries for Vector RAG (FAISS/ChromaDB).\n" +
            "3. **State the metric**: Mention sub-7ms P99 latency, 0.943 ROC-AUC, and 36% reduction in false-positive dispatch escalations.",
          source: "local-fallback"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI Project Advisor (Powered by Gemini 3.8 Flash)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Tailor Your Project & Brainstorm with an ML Architect
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Get personalized advice on custom feature engineering, company-specific pitching, and resume bullet tuning.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Target Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="Machine Learning Engineer">Machine Learning Engineer</option>
            <option value="Autonomous Systems / ADAS Engineer">Autonomous Systems / ADAS</option>
            <option value="AI Systems / LLM Engineer">AI Systems / LLM Engineer</option>
            <option value="Data Scientist (Telematics / IoT)">Data Scientist (Telematics)</option>
          </select>
        </div>
      </div>

      {/* Chat Workspace */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col h-[600px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg, idx) => {
            const isBot = msg.role === "assistant";

            return (
              <div
                key={idx}
                className={`flex gap-3 ${isBot ? "items-start" : "items-start justify-end"}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? "bg-slate-950/80 border border-slate-800 text-slate-200"
                      : "bg-cyan-600 text-white shadow-md"
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert max-w-none">
                    {msg.content}
                  </div>

                  {isBot && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source: {msg.source || "gemini"}</span>
                      <button
                        onClick={() => copyMessage(msg.content, idx)}
                        className="hover:text-cyan-300 flex items-center gap-1 transition"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Advice</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 border border-slate-700">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Architect is analyzing system trade-offs...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-5 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">
            Quick Prompts:
          </span>
          {promptSuggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              disabled={isLoading}
              className="whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask about system architecture, Waymo/Tesla interview prep, or resume bullets for ${selectedRole}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            disabled={isLoading}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 shadow"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
