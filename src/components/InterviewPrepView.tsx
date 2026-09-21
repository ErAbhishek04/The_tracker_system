import React, { useState } from "react";
import { INTERVIEW_QUESTIONS } from "../data/interviewPrep";
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Tag
} from "lucide-react";

export const InterviewPrepView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string>(INTERVIEW_QUESTIONS[0].id);

  const categories = ["All", "Architecture", "ML & XGBoost", "RAG & Vector Search", "Production Systems"];

  const filtered = selectedCategory === "All"
    ? INTERVIEW_QUESTIONS
    : INTERVIEW_QUESTIONS.filter(q => q.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? "" : id));
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 mb-2">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Technical Interview Masterclass
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How to Defend the XGBoost + RAG + LLM Stack to Tech Leads
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            The toughest questions asked by hiring managers at autonomous vehicle and AI companies (Waymo, Tesla, Uber, Databricks).
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-4">
        {filtered.map((item, idx) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? "bg-slate-900/95 border-amber-500/70 shadow-lg shadow-amber-950/20"
                  : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-5 cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.difficulty === "Staff/Lead"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : item.difficulty === "Hard"
                        ? "bg-red-950 text-red-300 border border-red-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}>
                      {item.difficulty} Level
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {idx + 1}. {item.question}
                  </h3>
                </div>

                <div className="shrink-0 p-1.5 rounded-lg bg-slate-800 text-slate-300">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-800/80 space-y-5 text-xs sm:text-sm">
                  {/* Hiring Manager Insights */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1 uppercase tracking-wide">
                      <HelpCircle className="w-4 h-4" />
                      What the Interviewer is Evaluating:
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {item.whatHiringManagerLooksFor}
                    </p>
                  </div>

                  {/* Rock Solid Answer */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4" />
                      Battle-Tested Model Answer:
                    </div>
                    <div className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {item.rockSolidAnswer}
                    </div>
                  </div>

                  {/* Key Phrases to Say */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      High-Impact Keywords to Mention:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.keyPhrasesToSay.map((phrase, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                        >
                          "{phrase}"
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pitfall to Avoid */}
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wide block">
                        Common Candidate Pitfall:
                      </span>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {item.pitfallToAvoid}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
