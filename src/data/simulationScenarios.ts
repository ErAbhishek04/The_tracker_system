import { SimulationScenario } from "../types";

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: "highway-cut-in-braking",
    name: "Highway Aggressive Cut-In & High-Speed Braking",
    category: "Car Movement & Collision Trajectory",
    badge: "Waymo I-80 Telemetry",
    description:
      "Target vehicle in adjacent lane suddenly cuts into our lane at 104 km/h with high yaw rate while braking hard, collapsing Time-To-Collision (TTC) to 1.15 seconds.",
    telemetry: {
      vehicleId: "AV-WAYMO-8924",
      timestamp: "2026-09-21T15:42:09.124Z",
      speedKmh: 104.2,
      longitudinalAccel: -4.8, // heavy deceleration m/s^2
      lateralAccel: 3.4, // aggressive lateral dive m/s^2
      yawRate: 6.8, // high deg/s rotation
      timeToCollision: 1.15, // critically low TTC in seconds
      headwayDistance: 12.8, // meters
      lanePositionOffset: 0.95, // rapid lane crossing
      brakePressureBar: 84.0,
      steeringAngleDeg: 14.5,
      roadSurfaceFriction: 0.82,
      surroundingVehicleCount: 6
    },
    predictedClass: "Aggressive Cut-In with Collision Threat",
    predictedProbability: 0.942,
    inferenceLatencyMs: 5.8,
    shapValues: [
      {
        feature: "Time-to-Collision (TTC < 1.4s)",
        value: "1.15 s",
        shapValue: +0.42,
        description: "Primary catalyst: TTC collapsed below emergency braking threshold of 1.8s."
      },
      {
        feature: "Lateral Acceleration (ay > 3.0 m/s²)",
        value: "3.40 m/s²",
        shapValue: +0.26,
        description: "Vehicle entered lateral trajectory crossing lane marking at 3.4 m/s²."
      },
      {
        feature: "Deceleration Jerk (d²v/dt²)",
        value: "-4.80 m/s²",
        shapValue: +0.18,
        description: "Leading vehicle initiated panic-level braking concurrently with maneuver."
      },
      {
        feature: "Road Surface Grip (Dry Asphalt)",
        value: "0.82 mu",
        shapValue: -0.07,
        description: "High tire grip slightly dampens stopping distance requirements."
      }
    ],
    retrievedDocs: [
      {
        id: "doc-nhtsa-fmvss-126",
        title: "NHTSA FMVSS 126 §S5.2: Electronic Stability & Automatic Emergency Braking (AEB)",
        sourceDoc: "US DOT National Highway Traffic Safety Administration Standards",
        category: "Federal Safety Regulation",
        similarityScore: 0.924,
        content:
          "For sudden cut-in maneuvers where Time-to-Collision (TTC) falls below 1.4 seconds at speeds exceeding 80 km/h, the vehicle control unit shall immediately prioritize Differential Braking and pre-charge hydraulic calipers to minimize brake lag to under 120ms, while maintaining lateral yaw stability within ±2.5 deg/s of target trajectory."
      },
      {
        id: "doc-bosch-radar-gen6",
        title: "Bosch Mid-Range Front Radar Gen6: Target Occlusion & Track Loss Protocols",
        sourceDoc: "Bosch OEM Sensor Hardware Specification Rev 4.1",
        category: "Sensor Calibration Manual",
        similarityScore: 0.887,
        content:
          "During rapid cut-in events with lateral delta > 3.0 m/s², Doppler radar reflection may suffer multipath attenuation near the wheel wells. Trajectory Kalman filter must fuse camera bounding boxes with radar tracks to prevent false track deletion for at least 600ms."
      },
      {
        id: "doc-sf-fleet-sop",
        title: "Autonomous Fleet Operations: Highway Conflict De-escalation Protocol",
        sourceDoc: "City & County Fleet Safety Operating Procedure SOP-702",
        category: "Operational SOP",
        similarityScore: 0.835,
        content:
          "When an aggressive non-autonomous vehicle executes an unsignaled cut-in within 15 meters, the autonomous system shall smoothly yield right-of-way by modulating regenerative deceleration before friction brakes, preventing secondary rear-end collisions from following vehicles."
      }
    ],
    defaultAiAdvisory: {
      threatLevel: "CRITICAL",
      tacticalSummary: "Critical Cut-In Collision Risk (94.2% confidence). Imminent impact in 1.15 seconds without active deceleration.",
      rootCauseAnalysis: "Adjacent vehicle executed an unsignaled lateral cut-in (3.4 m/s² lateral accel) combined with severe deceleration (-4.8 m/s²), violating standard 2.0s highway safety headway. Per FMVSS 126 and Bosch sensor calibration specs, radar Doppler confirms closing speed exceeds 28 km/h relative delta.",
      immediateAction: "Execute Stage-2 Automatic Emergency Braking (-6.2 m/s² deceleration request). Pre-tension seatbelts. Pulse hazard strobes. Disallow evasive steering into left shoulder due to adjacent lane traffic density.",
      safetyStandardCompliance: "Mandated by NHTSA FMVSS 126 §S5.2 (Emergency Deceleration Latency < 120ms) and SAE J3016 Level 4 Dynamic Driving Task fallback.",
      v2xBroadcastPayload: "SAE J2735 BSM: {Event: HARD_BRAKING_CUTIN, VehicleID: 'AV-WAYMO-8924', Lane: 2, LatAccel: 3.4, Speed: 104.2, TTC: 1.15, Action: AEB_ENGAGED}"
    }
  },
  {
    id: "urban-intersection-blindspot",
    name: "Urban Blind Spot Pedestrian / Cyclist Merge",
    category: "Car Movement & Pedestrian Safety",
    badge: "Argoverse 2 Urban Trajectory",
    description:
      "Autonomous vehicle turning right at busy downtown intersection; roadside LiDAR detects high-speed cyclist emerging from bus shadow into vehicle turning arc.",
    telemetry: {
      vehicleId: "AV-ARGO-3012",
      timestamp: "2026-09-21T15:44:18.410Z",
      speedKmh: 24.5,
      longitudinalAccel: -1.2,
      lateralAccel: 1.8,
      yawRate: 11.2, // sharp right turn
      timeToCollision: 1.42,
      headwayDistance: 6.2,
      lanePositionOffset: 1.4,
      brakePressureBar: 35.0,
      steeringAngleDeg: 42.0,
      roadSurfaceFriction: 0.76,
      surroundingVehicleCount: 11
    },
    predictedClass: "Vulnerable Road User (VRU) Intersection Conflict",
    predictedProbability: 0.918,
    inferenceLatencyMs: 4.9,
    shapValues: [
      {
        feature: "Cyclist Projected Crossing Arc",
        value: "Cross-track: 1.8m",
        shapValue: +0.38,
        description: "Cyclist velocity vector intersects vehicle turning radius within 1.4s."
      },
      {
        feature: "Steering Angle & Yaw Rate",
        value: "42° / 11.2°/s",
        shapValue: +0.29,
        description: "Vehicle is committed to right turn with blind A-pillar occlusion zone."
      },
      {
        feature: "Vehicle Speed",
        value: "24.5 km/h",
        shapValue: +0.14,
        description: "Low absolute speed permits instant full-stop within 2.8 meters."
      },
      {
        feature: "Brake Pre-Pressure",
        value: "35.0 bar",
        shapValue: -0.08,
        description: "Driver / system had already engaged soft creep braking."
      }
    ],
    retrievedDocs: [
      {
        id: "doc-nhtsa-vru-2025",
        title: "NHTSA VRU Safety Directive: Vulnerable Road User Protection in Right-Turn Trajectories",
        sourceDoc: "Federal Automated Vehicle Policy 2025-08",
        category: "Federal Safety Regulation",
        similarityScore: 0.941,
        content:
          "Autonomous vehicles operating in municipal zones must enforce a Minimum Safety Bubble of 2.0 meters around detected bicyclists and pedestrians during turning maneuvers. If an intersecting trajectory is confirmed with TTC < 2.0s, vehicle must come to a complete standstill until trajectory clears."
      },
      {
        id: "doc-sensor-lidar-urban",
        title: "Hesai Pandar128 LiDAR Urban Clutter & Occlusion Handling Guide",
        sourceDoc: "LiDAR Integration Engineering Manual Vol 3",
        category: "Sensor Calibration Manual",
        similarityScore: 0.862,
        content:
          "In high-density urban environments with transit buses and street furniture, partial bounding boxes with >40% point cloud occlusion must inherit velocity tracking from preceding 3 frames to avoid tracking dropouts during blind-spot emergence."
      }
    ],
    defaultAiAdvisory: {
      threatLevel: "CRITICAL",
      tacticalSummary: "Imminent Cyclist Collision in Turning Arc (91.8% probability). Immediate full stop required.",
      rootCauseAnalysis: "A cyclist traveling at ~22 km/h in protected bike lane is crossing vehicle right-turn arc while occluded by roadside bus. XGBoost spatial trajectory forecaster projects intercept in 1.42s at current 42° steering angle.",
      immediateAction: "Command Full Standstill Brake (0 km/h target in 1.8 meters). Sound low-frequency acoustic pedestrian warning chime. Keep steering lock fixed until path is verified clear.",
      safetyStandardCompliance: "NHTSA Vulnerable Road User (VRU) Directive 2025-08 and ISO 26262 ASIL-D functional safety compliance.",
      v2xBroadcastPayload: "SAE J2735: {Event: VRU_COLLISION_WARNING, Location: 'MARKET_ST_5TH', Target: CYCLIST, TTC: 1.42s, Status: FULL_STOP}"
    }
  },
  {
    id: "mountain-freight-rollover",
    name: "Mountain Corridor Heavy Freight Rollover Risk",
    category: "Commercial Fleet Logistics",
    badge: "I-70 Mountain Corridor Telemetry",
    description:
      "Fully loaded 80,000-lb Class 8 semi-truck entering 6% downhill hairpin curve at 72 km/h in wet conditions with rising crosswind gusts.",
    telemetry: {
      vehicleId: "TRUCK-VOLVO-441",
      timestamp: "2026-09-21T15:46:50.880Z",
      speedKmh: 72.4,
      longitudinalAccel: -0.6,
      lateralAccel: 3.8, // hazardous lateral g
      yawRate: 8.4,
      timeToCollision: 4.8,
      headwayDistance: 85.0,
      lanePositionOffset: 0.65,
      brakePressureBar: 62.0,
      steeringAngleDeg: 18.0,
      roadSurfaceFriction: 0.58, // wet mountain pavement
      surroundingVehicleCount: 2
    },
    predictedClass: "High Rollover & Jackknife Propensity",
    predictedProbability: 0.886,
    inferenceLatencyMs: 6.2,
    shapValues: [
      {
        feature: "Lateral G-Force (ay > 0.35g)",
        value: "0.38 g (3.8 m/s²)",
        shapValue: +0.44,
        description: "Lateral acceleration exceeds Class 8 semi-trailer rollover threshold."
      },
      {
        feature: "Reduced Road Friction (Wet Pavement)",
        value: "0.58 mu",
        shapValue: +0.28,
        description: "Low friction index increases trailer slide and drive-axle jackknife hazard."
      },
      {
        feature: "Entry Speed vs Curve Banking",
        value: "72.4 km/h (Curve limit: 55 km/h)",
        shapValue: +0.22,
        description: "Vehicle speed is 17.4 km/h above AASHTO recommended design speed."
      },
      {
        feature: "Steering Angle Rate",
        value: "18.0°",
        shapValue: -0.05,
        description: "Driver steering input is relatively smooth, not panic-swerving."
      }
    ],
    retrievedDocs: [
      {
        id: "doc-fmcsa-roll-safety",
        title: "FMCSA Heavy Truck Stability Advisory: Downhill Curve Rollover Prevention",
        sourceDoc: "Federal Motor Carrier Safety Administration Bulletin 49-CFR",
        category: "Federal Safety Regulation",
        similarityScore: 0.932,
        content:
          "Class 8 articulated vehicles carrying gross weights > 70,000 lbs exhibit a rollover threshold as low as 0.35g. On downhill gradients exceeding 5%, drivers and electronic roll stability systems must retard speed prior to the curve tangent point. Applying hard service brakes inside the curve radius induces trailer jackknife."
      },
      {
        id: "doc-cdot-mountain-pass",
        title: "Colorado DOT I-70 Mountain Corridor Commercial Vehicle Speed Restrictions",
        sourceDoc: "CDOT Freight Operations Rules & Chain Law",
        category: "State Highway Bylaw",
        similarityScore: 0.875,
        content:
          "Maximum legal speed for commercial vehicles on the Eisenhower Tunnel west approach curve is 35 mph (56 km/h) under wet or icy conditions. Automatic engine compression braking (Jake Brake) is advised only if pavement friction > 0.65."
      }
    ],
    defaultAiAdvisory: {
      threatLevel: "HIGH",
      tacticalSummary: "Severe Truck Rollover & Jackknife Risk (88.6% probability). Immediate controlled speed reduction required.",
      rootCauseAnalysis: "Semi-trailer lateral acceleration reached 0.38g on wet downhill asphalt (0.58 friction coefficient), exceeding the 0.35g physical tipping threshold for an 80k-lb payload. Speed is 17 km/h above the CDOT corridor safety envelope.",
      immediateAction: "Engage Engine Retarder (Jake Brake Level 2) and pulse trailer roll-stability differential brakes. Issue urgent audio prompt to driver: 'REDUCE SPEED TO 50 KM/H IMMEDIATELY - DO NOT STAB BRAKE'. Alert following traffic via hazard beacons.",
      safetyStandardCompliance: "FMCSA 49 CFR Part 393.71 & CDOT Mountain Pass Commercial Safety Mandate.",
      v2xBroadcastPayload: "SAE J2735: {Event: TRUCK_ROLLOVER_WARNING, Corridor: 'I-70W_MP215', GVW: 80000, LateralG: 0.38, RecommendedSpeed: 50}"
    }
  },
  {
    id: "ev-fastcharge-thermal-runaway",
    name: "EV Battery Fast-Charge Thermal Runaway Anomaly",
    category: "Clean Energy & EV Fleets",
    badge: "Tesla / Rivian BMS Telematics",
    description:
      "Electric fleet delivery van on 350kW DC fast charger: cell temperature in module 4 surges 18°C above average with sudden internal resistance drop.",
    telemetry: {
      vehicleId: "EV-FLEET-VAN-109",
      timestamp: "2026-09-21T15:48:02.115Z",
      speedKmh: 0.0, // stationary charging
      longitudinalAccel: 0.0,
      lateralAccel: 0.0,
      yawRate: 0.0,
      timeToCollision: 99.0,
      headwayDistance: 0.0,
      lanePositionOffset: 0.0,
      brakePressureBar: 0.0,
      steeringAngleDeg: 0.0,
      roadSurfaceFriction: 1.0,
      surroundingVehicleCount: 4
    },
    predictedClass: "Lithium-Ion Cell Thermal Runaway Precursor",
    predictedProbability: 0.957,
    inferenceLatencyMs: 3.8,
    shapValues: [
      {
        feature: "Cell Delta-T Exceedance (Module 4)",
        value: "+18.2°C above mean (58.4°C)",
        shapValue: +0.48,
        description: "Extreme localized temperature divergence indicates internal micro-short."
      },
      {
        feature: "DC Fast Charge Current Rate",
        value: "380 A (350 kW)",
        shapValue: +0.32,
        description: "High continuous current exacerbates active dendrite growth."
      },
      {
        feature: "Internal Resistance Drop (dZ/dt)",
        value: "-24% in 45s",
        shapValue: +0.16,
        description: "Sudden drop in impedance signals separator membrane failure."
      },
      {
        feature: "Coolant Flow Rate",
        value: "14.2 L/min",
        shapValue: -0.06,
        description: "Cooling system is operating at full pump speed but cannot keep pace."
      }
    ],
    retrievedDocs: [
      {
        id: "doc-sae-j2464-thermal",
        title: "SAE J2464: Electric Vehicle Battery Abuse & Thermal Runaway Protocol",
        sourceDoc: "Society of Automotive Engineers Standards",
        category: "Global Automotive Standard",
        similarityScore: 0.958,
        content:
          "When any individual cell within an automotive traction pack exceeds 55°C while neighboring cells remain under 42°C, the Battery Management System (BMS) must trigger an immediate High-Voltage Contactor Open (HV Pyro-Fuse Disconnect) within 200 milliseconds to isolate the pack and activate maximum coolant loop bypass."
      },
      {
        id: "doc-oem-warranty-dtc",
        title: "OEM EV Battery Pack Diagnostic Trouble Code DTC-B1982: Cell Isolation Fault",
        sourceDoc: "Fleet Maintenance & Warranty Repair Guide Rev 8",
        category: "Warranty & Repair Manual",
        similarityScore: 0.892,
        content:
          "DTC-B1982 designates severe thermal cell degradation. The vehicle is unsafe to operate or charge. Fleet managers must dispatch certified high-voltage technicians with Class-D fire suppression gear and quarantine vehicle in outdoor open bay (minimum 15-meter clearance)."
      }
    ],
    defaultAiAdvisory: {
      threatLevel: "CRITICAL",
      tacticalSummary: "Imminent Battery Cell Thermal Runaway (95.7% certainty). Immediate emergency shutdown required.",
      rootCauseAnalysis: "Module 4 Cell #14 temperature spiked to 58.4°C accompanied by a 24% collapse in internal resistance under 380A charging. This matches classic lithium dendrite short-circuit precursor per SAE J2464 testing criteria.",
      immediateAction: "Instantly trip DC fast charger emergency cutoff. Open vehicle HV contactors. Ramp cooling pumps to 100% duty cycle. Broadcast audible siren: 'STAND CLEAR OF VEHICLE'. Generate automated warranty replacement ticket with DTC-B1982.",
      safetyStandardCompliance: "SAE J2464 §4.3 & NFPA 855 Standard for the Installation of Stationary Energy Storage Systems.",
      v2xBroadcastPayload: "BMS_DISPATCH: {Fault: 'DTC_B1982_THERMAL_RUNAWAY', PackID: 'BATT-941', Mod4Temp: 58.4, Action: 'HV_PYRO_DISCONNECT', Status: 'QUARANTINE'}"
    }
  }
];
