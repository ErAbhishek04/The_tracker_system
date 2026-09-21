import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Interactive Project Advisor & Resume Architect (Gemini Powered)
app.post("/api/advisor", async (req: Request, res: Response) => {
  try {
    const { message, projectContext, userRole, history } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // Return high-quality intelligent deterministic response if no key is configured
      return res.json({
        reply: `### Architect Recommendation for ${userRole || "Machine Learning Engineer"}\n\n` +
          `**Project Focus: ${projectContext?.title || "Autonomous Vehicle Telemetry & Collision Risk Predictor"}**\n\n` +
          `1. **System Differentiator**: Emphasize the **XGBoost + RAG + LLM hybrid bridge** in your interview. Most candidates build pure toy LLM wrappers or pure tabular models in silos. By using XGBoost for sub-10ms inference on sensor feeds (CAN-bus, IMU, GPS) and using SHAP TreeExplainer values as dynamic grounding tokens into your Vector RAG retriever, you demonstrate production-grade AI systems design.\n\n` +
          `2. **Resume Action Bullet**:\n` +
          `> *"Architected a real-time vehicle maneuver & collision forecasting engine ingesting 1.4M+ telemetry records (NGSIM / Waymo) with XGBoost (ROC-AUC 0.941, <8ms P99 latency); chained SHAP feature attributions into FAISS vector RAG to retrieve OEM safety protocols, prompting an LLM copilot that cut false dispatch alerts by 37%."*\n\n` +
          `3. **Key Technical Interview Talking Point**: Be prepared to answer *"Why not just feed the telemetry directly to the LLM?"* Answer: Tabular sensor time-series at 100Hz causes catastrophic token explosion, high inference latency (>1500ms vs 6ms with XGBoost), and poor numerical non-linear boundary capture. XGBoost acts as the ultra-fast perception filter; the LLM acts as the semantic synthesizer.`,
        source: "fallback",
      });
    }

    const systemPrompt = `You are a Principal Staff Machine Learning Systems Architect and Executive Hiring Manager at top autonomous vehicle / AI companies (Waymo, Tesla, Uber, Aurora, Cruise, Databricks).
The candidate wants to build a portfolio-defining, real-world project combining:
1. XGBoost (tabular, time-series, or sensor telemetry ML model with SHAP explainability)
2. RAG (Vector database, chunk retrieval from domain manuals, safety SOPs, regulations)
3. LLM (Reasoning, synthesis, root cause analysis, tactical dispatch/decision agent).

Target candidate role: ${userRole || "Machine Learning Engineer / Data Scientist"}.
Active project context: ${JSON.stringify(projectContext || {})}.

Instructions:
- Provide rigorous, specific, and actionable advice.
- Offer exact STAR-format resume bullet points with quantified metrics.
- Address system design nuances (latency, data drift, SHAP thresholding, vector index choice).
- Suggest datasets (e.g. NGSIM, Waymo Motion, Argoverse 2, Kaggle OBD-II, CitySim).
- Keep formatting clean with clear markdown headings, bold terms, and code/bullet points where helpful.`;

    const promptText = `Candidate Query: ${message}\n\nContext History: ${JSON.stringify(history || []).slice(-1000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return res.json({
      reply: response.text || "Unable to generate advice at this moment.",
      source: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Error in /api/advisor:", error);
    return res.status(500).json({
      error: "Failed to generate AI advice",
      details: error.message,
    });
  }
});

// Live XGBoost + RAG + LLM Simulation Endpoint
app.post("/api/simulate-pipeline", async (req: Request, res: Response) => {
  try {
    const { scenarioId, telemetryData, queryContext } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // Deterministic simulation output
      return res.json({
        simulated: true,
        source: "engine-rules",
      });
    }

    const prompt = `Analyze this simulated vehicle / system state and generate a tactical advisory:
Scenario: ${scenarioId}
Telemetry: ${JSON.stringify(telemetryData)}
Contextual Documents Retrieved: ${JSON.stringify(queryContext)}

Generate a structured incident report:
1. Tactical Assessment (1 sentence summary)
2. Root Cause Analysis based on XGBoost feature attribution + retrieved safety standard
3. Recommended Immediate Action (driver advisory or automated fleet dispatch command)
4. Regulatory & Safety Compliance citation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an autonomous vehicle telemetry operations copilot.",
        temperature: 0.3,
      },
    });

    return res.json({
      analysis: response.text,
      source: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Error in /api/simulate-pipeline:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Mount Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
