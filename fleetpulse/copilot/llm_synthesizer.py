"""
LLM Tactical Advisory & V2X Packet Synthesizer.
Fuses XGBoost tabular inference + SHAP attributions + Retrieved DOT/OEM Standards.
"""

import os
import json
from typing import Dict, Any, List
from pydantic import BaseModel, Field

class TacticalAdvisoryOutput(BaseModel):
    tactical_summary: str = Field(..., description="Ultra-concise <7 word in-cabin alert")
    root_cause_analysis: str = Field(..., description="Neuro-symbolic root cause grounded in telemetry & standards")
    immediate_action: str = Field(..., description="Targeted vehicle actuator directive")
    safety_standard_compliance: str = Field(..., description="Citations to NHTSA FMVSS or Bosch OEM specs")
    v2x_broadcast_payload: str = Field(..., description="SAE J2735 standard compliant hex/JSON packet")

class LLMTacticalSynthesizer:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[Synthesizer] GenAI Client init note: {e}")

    def synthesize(
        self,
        telemetry: Dict[str, Any],
        predicted_prob: float,
        shap_drivers: List[Dict[str, Any]],
        retrieved_standards: List[Dict[str, Any]]
    ) -> TacticalAdvisoryOutput:
        """
        Generates tactical advisory grounded in both physical telemetry and regulatory rules.
        """
        if self.client:
            try:
                prompt = f"""
You are FleetPulse, an Autonomous Vehicle Tactical Safety Co-Pilot.
Synthesize an immediate tactical advisory for the vehicle control unit and human operator.

EGO TELEMETRY:
- Longitudinal Speed: {telemetry.get('speed_kmh', 0):.1f} km/h
- Time-to-Collision (TTC): {telemetry.get('ttc_sec', 0):.2f} s
- Lateral Acceleration: {telemetry.get('lateral_accel', 0):.2f} m/s^2
- Yaw Rate: {telemetry.get('yaw_rate', 0):.2f} deg/s
- Road Friction (mu): {telemetry.get('road_friction', 0.85):.2f}

XGBOOST PREDICTION:
- Collision / Cut-in Hazard Probability: {predicted_prob * 100:.1f}%
- Primary SHAP Drivers: {json.dumps(shap_drivers[:3])}

RETRIEVED SAFETY STANDARDS:
{json.dumps([{'title': d['title'], 'source': d['source'], 'content': d['content']} for d in retrieved_standards])}

Output STRICT JSON matching:
{{
  "tactical_summary": "Short 4-6 word urgent alert",
  "root_cause_analysis": "2 sentence explanation combining telemetry physics with safety standards",
  "immediate_action": "Specific braking or steering actuation command",
  "safety_standard_compliance": "Explicit reference to standard (e.g. FMVSS 126 or FMVSS 135)",
  "v2x_broadcast_payload": "SAE J2735 formatted BSM packet summary"
}}
"""
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "temperature": 0.2
                    }
                )
                parsed = json.loads(response.text)
                return TacticalAdvisoryOutput(**parsed)
            except Exception as e:
                print(f"[Synthesizer] Live generation fallback: {e}")

        # Deterministic deterministic fallback generator
        speed = telemetry.get("speed_kmh", 80.0)
        ttc = telemetry.get("ttc_sec", 1.2)
        lat = telemetry.get("lateral_accel", 2.8)
        
        if predicted_prob > 0.75:
            summary = "WARNING: RAPID CUT-IN DETECTED — BRAKE PRE-FILL ENGAGED"
            root = f"Lead vehicle cut-in at {speed:.0f} km/h reduced TTC to {ttc:.2f}s with lateral acceleration of {lat:.2f} m/s², violating stopping distance margins."
            action = "Apply 4.2 m/s² deceleration, pre-tension seatbelts, and shift steering bias 3° away from cut-in vector."
            compliance = "NHTSA FMVSS 135 (Light Vehicle Emergency Deceleration) & Bosch Radar Gen6 Track ID Verification."
            v2x = "SAE_J2735_BSM_PART2: { EventHazard: 0x0A, HazardType: 'CutInImminent', TTC_ds: " + str(int(ttc * 10)) + ", Speed_kmh: " + str(int(speed)) + " }"
        else:
            summary = "ELEVATED CONVERGENCE: PREPARE LANE STABILIZATION"
            root = f"Adjacent vehicle trajectory trending toward ego corridor at {lat:.2f} m/s² lateral rate."
            action = "Maintain headway buffer, ping forward radar at 20Hz, prime ABS hydraulics."
            compliance = "NHTSA FMVSS 126 (Electronic Stability Control)."
            v2x = "SAE_J2735_BSM_PART2: { EventHazard: 0x01, HazardType: 'TrajectoryConvergence', Speed_kmh: " + str(int(speed)) + " }"

        return TacticalAdvisoryOutput(
            tactical_summary=summary,
            root_cause_analysis=root,
            immediate_action=action,
            safety_standard_compliance=compliance,
            v2x_broadcast_payload=v2x
        )
