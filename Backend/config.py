"""
Configuration and settings for Project Rudra-Logistics
Tactical Supply Chain & Spatial Logistics Decision Support System
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'rudra_logistics.db'}"

# Military Operational Constants
DEFAULT_THREAT_LEVEL = "PEACE"  # PEACE, HEIGHTENED, ACTIVE
DEFAULT_AMBIENT_TEMP_C = -22.0  # Siachen/Ladakh winter baseline

# Bukharis Kerosene burn rates (Liters per soldier per day based on temp)
BUKHARI_BURN_RATES = {
    "WARM": 1.0,     # > 0°C
    "MODERATE": 1.8, # -15°C to 0°C
    "SEVERE": 2.8,   # -30°C to -15°C
    "EXTREME": 3.6   # <= -30°C (24h continuous heating)
}

# Threat Level Multipliers
THREAT_MULTIPLIERS = {
    "PEACE": {"rations": 1.0, "pol": 1.0, "ammo": 1.0, "medical": 1.0},
    "HEIGHTENED": {"rations": 1.1, "pol": 1.3, "ammo": 1.6, "medical": 1.5},
    "ACTIVE": {"rations": 1.2, "pol": 1.8, "ammo": 4.0, "medical": 3.5}
}

# DOS Alert Thresholds (Days)
DOS_CRITICAL_THRESHOLD = 5.0
DOS_WARNING_THRESHOLD = 15.0

# Cold chain Class VIII thresholds (Celsius)
COLD_CHAIN_MIN_TEMP = 2.0
COLD_CHAIN_MAX_TEMP = 8.0

# Security / Token Mock Secret
SECRET_KEY = os.getenv("RUDRA_SECRET_KEY", "RUDRA_SECURE_14CORPS_TAC_KEY_2026")
AIR_GAPPED_MODE = True
