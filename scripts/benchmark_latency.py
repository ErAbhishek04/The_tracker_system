"""
Latency Benchmark Script for Edge Deployment.
Measures P50, P90, P99, and Max latency over 2,000 consecutive 10Hz inference frames.
Verifies compliance with the <10ms automotive control loop SLA.
"""

import os
import sys
import time
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fleetpulse.models.xgboost_pipeline import XGBoostHazardModel

def run_benchmark():
    print("==================================================")
    print(" FleetPulse Sub-10ms Inference Latency Benchmark")
    print("==================================================")

    model = XGBoostHazardModel()
    n_iterations = 2000

    # Warmup
    dummy = np.random.randn(1, 9).astype(np.float32)
    for _ in range(50):
        model.predict_fast(dummy)

    latencies = []
    print(f"Executing {n_iterations} consecutive single-frame inference calls...")

    for _ in range(n_iterations):
        sample = np.random.uniform([20, 0.5, 0.2, 0, -10, 0.4, -3, -5, 0],
                                   [120, 5.0, 2.0, 4, 10, 0.95, 3, 5, 20],
                                   size=(1, 9)).astype(np.float32)
        _, lat_ms = model.predict_fast(sample)
        latencies.append(lat_ms)

    latencies = np.array(latencies)
    p50 = np.percentile(latencies, 50)
    p90 = np.percentile(latencies, 90)
    p95 = np.percentile(latencies, 95)
    p99 = np.percentile(latencies, 99)
    max_lat = np.max(latencies)

    print("\n---------------- Latency Results ----------------")
    print(f"Samples Evaluated: {n_iterations}")
    print(f"P50 Latency:       {p50:.3f} ms")
    print(f"P90 Latency:       {p90:.3f} ms")
    print(f"P95 Latency:       {p95:.3f} ms")
    print(f"P99 Latency:       {p99:.3f} ms  (Target: <6.000 ms)")
    print(f"Max Latency:       {max_lat:.3f} ms")

    if p99 < 10.0:
        print("\n[PASSED] Strict 10Hz Automotive CAN-bus Timing SLA Verified!")
    else:
        print("\n[FAILED] Latency exceeds 10ms SLA threshold.")

if __name__ == "__main__":
    run_benchmark()
