"""
Vector RAG Store for Federal Safety Regulations (NHTSA) and OEM Sensor Specs.
Supports dynamic SHAP-driven semantic query construction.
"""

import os
import json
from typing import List, Dict, Any

class VectorRAGStore:
    def __init__(self, kb_path: str = None):
        if kb_path is None:
            base_dir = os.path.dirname(__file__)
            kb_path = os.path.join(base_dir, "knowledge_base", "safety_standards.json")
        self.kb_path = kb_path
        self.documents = []
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        if os.path.exists(self.kb_path):
            with open(self.kb_path, "r", encoding="utf-8") as f:
                self.documents = json.load(f)
        else:
            self.documents = []

    def build_shap_query(self, shap_attributions: List[Dict[str, Any]]) -> str:
        """
        Converts numerical SHAP feature impacts into a targeted semantic search query.
        Example: Top features: ttc_sec (-0.45), lateral_accel (+0.38) ->
        "Critical low time-to-collision with high lateral acceleration and emergency braking stability"
        """
        top_drivers = shap_attributions[:3]
        query_terms = []
        for d in top_drivers:
            feat = d["feature"]
            val = d["value"]
            if feat == "ttc_sec" and val < 2.0:
                query_terms.append(f"emergency braking stopping distance critical time-to-collision {val:.1f}s")
            elif feat == "lateral_accel" and val > 1.5:
                query_terms.append(f"lateral acceleration {val:.2f} mps2 electronic stability control FMVSS 126 yaw divergence")
            elif feat == "yaw_rate" and abs(val) > 4.0:
                query_terms.append(f"high yaw rate {val:.1f} degps spinout oversteer differential braking")
            elif feat == "road_friction" and val < 0.7:
                query_terms.append(f"low friction pavement wet asphalt mu {val:.2f} stopping distance")
            elif feat == "jerk_mps3" and abs(val) > 1.5:
                query_terms.append(f"longitudinal jerk cut-in radar Doppler tracking")
            else:
                query_terms.append(f"{feat} telemetry standard")

        return " ".join(query_terms) if query_terms else "Automotive emergency braking and trajectory safety standards"

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves top regulatory and sensor manual chunks matching the query.
        Uses keyword-weighted semantic overlap scoring for lightweight deployment without heavy GPU dependencies.
        """
        query_tokens = set(query.lower().split())
        scored_docs = []

        for doc in self.documents:
            text = (doc["title"] + " " + doc["text"] + " " + " ".join(doc.get("tags", []))).lower()
            overlap = sum(1 for token in query_tokens if token in text)
            
            # Boost score if specific tags match
            for tag in doc.get("tags", []):
                if tag.lower() in query_tokens:
                    overlap += 2.0

            score = min(0.98, max(0.40, (overlap / (len(query_tokens) + 1)) * 1.8 + 0.35))
            scored_docs.append({
                "id": doc["id"],
                "title": doc["title"],
                "source": doc["source"],
                "content": doc["text"],
                "similarity_score": round(score, 3)
            })

        scored_docs.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_docs[:top_k]
