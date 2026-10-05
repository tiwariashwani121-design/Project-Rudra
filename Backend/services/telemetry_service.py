"""
Real-Time Convoy Telemetry, Cold-Chain IoT Monitor, and Kinematic Anti-Spoofing Engine
"""
import math
from datetime import datetime, timezone
from typing import Dict, Any, List

class ConvoyTelemetryEngine:
    def __init__(self):
        # Default route waypoints (Leh -> South Pullu -> Khardung La -> North Pullu -> Partapur)
        self.primary_path = [
            [34.1526, 77.5771], # Leh
            [34.1800, 77.5900],
            [34.2100, 77.6050],
            [34.2381, 77.6189], # South Pullu
            [34.2600, 77.6100],
            [34.2787, 77.6047], # Khardung La Pass
            [34.3050, 77.6150],
            [34.3321, 77.6321], # North Pullu
            [34.4500, 77.6300],
            [34.5500, 77.6280],
            [34.6644, 77.6258], # Partapur
        ]

        self.bypass_path = [
            [34.1526, 77.5771], # Leh
            [34.0200, 77.6500],
            [33.9210, 77.7420], # Karu
            [33.9800, 77.8500],
            [34.0478, 77.9304], # Chang La
            [34.2500, 77.8800],
            [34.4820, 77.8210], # Agham
            [34.5800, 77.7800], # Shyok
            [34.6644, 77.6258], # Partapur
        ]

        self.step_index = 0
        self.is_diverted = False
        self.spoof_mode = False
        self.spoof_payload: Dict[str, Any] = {}
        
        # Telemetry State
        self.speed_kmh = 34.0
        self.fuel_level_pct = 85.0
        self.cargo_temp_celsius = 4.2  # Normal cold chain
        self.cargo_temp_drift_dir = 1
        self.last_valid_lat = 34.1526
        self.last_valid_lon = 77.5771

    def set_route_diverted(self, diverted: bool):
        if self.is_diverted != diverted:
            self.is_diverted = diverted
            self.step_index = 0

    def trigger_spoof_event(self, enable: bool, lat: float = 34.95, lon: float = 78.40, speed: float = 165.0):
        self.spoof_mode = enable
        if enable:
            self.spoof_payload = {
                "lat": lat,
                "lon": lon,
                "speed": speed
            }
        else:
            self.spoof_payload = {}

    def step(self) -> Dict[str, Any]:
        """Advances simulation by 1 tick (2 seconds) and generates signed telemetry packet."""
        active_path = self.bypass_path if self.is_diverted else self.primary_path

        # Natural movement along path
        self.step_index = (self.step_index + 1) % len(active_path)
        base_coord = active_path[self.step_index]

        # Natural fluctuations
        self.fuel_level_pct = max(15.0, round(self.fuel_level_pct - 0.05, 1))
        
        # Subtle cold-chain temperature micro-variation (safe around 4.2°C)
        self.cargo_temp_celsius = round(4.0 + (math.sin(self.step_index * 0.4) * 0.5), 1)

        raw_lat = base_coord[0]
        raw_lon = base_coord[1]
        raw_speed = round(32.0 + (math.sin(self.step_index) * 6.0), 1)

        # Evaluate Anti-Spoofing Heuristics
        spoof_detected = False
        spoof_reason = None
        reported_lat = raw_lat
        reported_lon = raw_lon
        reported_speed = raw_speed

        if self.spoof_mode:
            # Adversary Electronic Warfare injection
            reported_lat = self.spoof_payload.get("lat", 34.95)
            reported_lon = self.spoof_payload.get("lon", 78.40)
            reported_speed = self.spoof_payload.get("speed", 165.0)

            # Kinematic Anomaly Checks:
            # 1. Convoy speed > 90 km/h on high-altitude passes
            # 2. Coordinate jump > 0.05 degrees in 2 seconds
            coord_jump = math.sqrt((reported_lat - self.last_valid_lat)**2 + (reported_lon - self.last_valid_lon)**2)
            if reported_speed > 90.0 or coord_jump > 0.05:
                spoof_detected = True
                spoof_reason = f"KINEMATIC ANOMALY: Speed {reported_speed} km/h > 90 km/h or teleport jump {round(coord_jump, 3)} deg"
                # Fallback to dead reckoning position
                dead_reckoning_lat = self.last_valid_lat + 0.002
                dead_reckoning_lon = self.last_valid_lon + 0.002
        else:
            self.last_valid_lat = raw_lat
            self.last_valid_lon = raw_lon

        # Cold chain breach check (Class VIII: +2°C to +8°C)
        cold_chain_breach = not (2.0 <= self.cargo_temp_celsius <= 8.0)

        return {
            "convoy_id": "CNV_14C_08",
            "call_sign": "STALLION ALPHA",
            "status": "DIVERTED" if self.is_diverted else "EN_ROUTE",
            "current_lat": reported_lat,
            "current_lon": reported_lon,
            "speed_kmh": reported_speed,
            "fuel_level_pct": self.fuel_level_pct,
            "cargo_temp_celsius": self.cargo_temp_celsius,
            "cold_chain_breach": cold_chain_breach,
            "is_spoofed": spoof_detected,
            "spoof_warning": spoof_reason,
            "vehicle_type": "4x4_ALS_WITH_CHAINS" if self.is_diverted else "STALLION_HEAVY_4X4",
            "total_payload_tonnes": 14.5,
            "cargo_type": "CLASS_VIII_BLOOD_PLASMA",
            "origin_node_id": "BASE_LEH_DEPOT",
            "destination_node_id": "FLD_PARTAPUR",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# Global singleton engine
telemetry_engine = ConvoyTelemetryEngine()
