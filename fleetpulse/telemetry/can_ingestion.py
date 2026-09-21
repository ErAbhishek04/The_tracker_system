"""
10Hz CAN-bus Telemetry Parser & Rolling-Window Kinematic Feature Extractor.
"""

from collections import deque
from typing import List, Dict, Any, Optional
import numpy as np
from pydantic import BaseModel, Field

class CANTelemetryFrame(BaseModel):
    timestamp: float = Field(..., description="Unix epoch timestamp in seconds")
    vehicle_id: str = Field(default="EGO_VEH_01")
    speed_kmh: float = Field(..., description="Longitudinal vehicle speed in km/h")
    time_to_collision_sec: float = Field(..., description="Radar/LiDAR estimated time to collision (TTC)")
    lateral_accel_mps2: float = Field(..., description="Lateral acceleration in m/s²")
    yaw_rate_degps: float = Field(..., description="Yaw angular rate in degrees/sec")
    road_surface_friction: float = Field(default=0.85, description="Estimated friction coefficient mu (0.3=wet to 1.0=dry)")
    steering_angle_deg: float = Field(default=0.0, description="Steering wheel angle in degrees")
    brake_pressure_bar: float = Field(default=0.0, description="Hydraulic brake line pressure")

class KinematicFeatureExtractor:
    """
    Maintains a rolling FIFO queue of 10Hz CAN frames and calculates dynamic derivatives:
    - Longitudinal Jerk (da/dt)
    - Yaw Acceleration (d(omega)/dt)
    - Inverse TTC (1 / TTC) for numerical stability
    - Lateral Energy Flux
    """
    def __init__(self, window_size: int = 20):  # 2.0s at 10Hz
        self.window_size = window_size
        self.history = deque(maxlen=window_size)

    def push_frame(self, frame: CANTelemetryFrame) -> None:
        self.history.append(frame)

    def extract_features(self) -> Dict[str, float]:
        if len(self.history) < 2:
            current = self.history[-1] if self.history else None
            return {
                "speed_kmh": current.speed_kmh if current else 60.0,
                "ttc_sec": current.time_to_collision_sec if current else 3.5,
                "inv_ttc": 1.0 / max(0.1, current.time_to_collision_sec if current else 3.5),
                "lateral_accel": current.lateral_accel_mps2 if current else 0.5,
                "yaw_rate": current.yaw_rate_degps if current else 1.0,
                "road_friction": current.road_surface_friction if current else 0.85,
                "jerk_mps3": 0.0,
                "yaw_accel_degps2": 0.0,
                "lateral_kinetic_index": 0.0,
            }

        frames = list(self.history)
        dt = max(0.01, frames[-1].timestamp - frames[-2].timestamp)

        # Acceleration and Jerk calculation
        v_curr = frames[-1].speed_kmh / 3.6
        v_prev = frames[-2].speed_kmh / 3.6
        accel_curr = (v_curr - v_prev) / dt

        if len(frames) >= 3:
            v_prev2 = frames[-3].speed_kmh / 3.6
            dt_prev = max(0.01, frames[-2].timestamp - frames[-3].timestamp)
            accel_prev = (v_prev - v_prev2) / dt_prev
            jerk = (accel_curr - accel_prev) / dt
        else:
            jerk = 0.0

        # Yaw Acceleration
        yaw_accel = (frames[-1].yaw_rate_degps - frames[-2].yaw_rate_degps) / dt

        # Current values
        curr_ttc = frames[-1].time_to_collision_sec
        inv_ttc = 1.0 / max(0.05, curr_ttc)

        # Lateral kinetic index: ay^2 / friction
        mu = max(0.1, frames[-1].road_surface_friction)
        lat_energy = (frames[-1].lateral_accel_mps2 ** 2) / mu

        return {
            "speed_kmh": frames[-1].speed_kmh,
            "ttc_sec": curr_ttc,
            "inv_ttc": inv_ttc,
            "lateral_accel": frames[-1].lateral_accel_mps2,
            "yaw_rate": frames[-1].yaw_rate_degps,
            "road_friction": frames[-1].road_surface_friction,
            "jerk_mps3": jerk,
            "yaw_accel_degps2": yaw_accel,
            "lateral_kinetic_index": lat_energy,
        }

    def get_feature_vector(self) -> np.ndarray:
        feats = self.extract_features()
        return np.array([
            feats["speed_kmh"],
            feats["ttc_sec"],
            feats["inv_ttc"],
            feats["lateral_accel"],
            feats["yaw_rate"],
            feats["road_friction"],
            feats["jerk_mps3"],
            feats["yaw_accel_degps2"],
            feats["lateral_kinetic_index"],
        ], dtype=np.float32).reshape(1, -1)
