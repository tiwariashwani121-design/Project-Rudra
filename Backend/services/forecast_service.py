"""
AI Demand Forecasting & Days of Supplies (DOS) Calculation Engine
Incorporates troop strength, extreme sub-zero temperature non-linear curve,
and operational threat levels.
"""
from typing import Dict, Any, List
from ..config import BUKHARI_BURN_RATES, THREAT_MULTIPLIERS, DOS_CRITICAL_THRESHOLD, DOS_WARNING_THRESHOLD

def get_bukhari_temperature_multiplier(temp_c: float) -> float:
    """
    Sub-zero thermodynamic burn curve for Bukharis heaters:
    - > 0°C: 1.0x (Basic mess heating / cooking)
    - -15°C to 0°C: 1.8x
    - -30°C to -15°C: 2.8x
    - <= -30°C: 3.6x (Continuous 24-hr high-output blast)
    """
    if temp_c > 0.0:
        return BUKHARI_BURN_RATES["WARM"]
    elif temp_c > -15.0:
        # Linear interpolation between 1.0 and 1.8
        t = (0.0 - temp_c) / 15.0
        return round(1.0 + t * 0.8, 2)
    elif temp_c > -30.0:
        # Linear interpolation between 1.8 and 2.8
        t = (-15.0 - temp_c) / 15.0
        return round(1.8 + t * 1.0, 2)
    else:
        # Extreme blizzard conditions
        extra_freeze = min(1.0, (-30.0 - temp_c) / 10.0)
        return round(2.8 + extra_freeze * 0.8, 2)

def get_threat_multiplier(threat_level: str, supply_class: str) -> float:
    """Multiplier based on Operational Readiness State (PEACE, HEIGHTENED, ACTIVE)"""
    level_dict = THREAT_MULTIPLIERS.get(threat_level.upper(), THREAT_MULTIPLIERS["PEACE"])
    if supply_class == "CLASS_I":
        return level_dict.get("rations", 1.0)
    elif supply_class == "CLASS_III":
        return level_dict.get("pol", 1.0)
    elif supply_class == "CLASS_V":
        return level_dict.get("ammo", 1.0)
    elif supply_class == "CLASS_VIII":
        return level_dict.get("medical", 1.0)
    return 1.0

def calculate_daily_burn_rate(
    base_rate_per_soldier: float,
    troop_count: int,
    supply_class: str,
    item_id: str,
    ambient_temp_c: float,
    threat_level: str,
    custom_bukhari_multiplier: float = None
) -> float:
    """
    Calculates deterministic forecasted daily consumption rate for a forward military node.
    """
    base_consumption = base_rate_per_soldier * troop_count

    # Temperature factor
    if "KEROSENE" in item_id.upper() or supply_class == "CLASS_III":
        temp_mult = custom_bukhari_multiplier or get_bukhari_temperature_multiplier(ambient_temp_c)
    else:
        temp_mult = 1.0

    # Threat readiness factor
    threat_mult = get_threat_multiplier(threat_level, supply_class)

    daily_burn = base_consumption * temp_mult * threat_mult
    return round(max(daily_burn, 1.0), 2)

def calculate_dos(current_stock: float, daily_burn_rate: float) -> float:
    """
    Days of Supplies formula:
    DOS = Current Inventory / Forecasted Daily Burn Rate
    """
    if daily_burn_rate <= 0.0:
        return 999.0
    return round(current_stock / daily_burn_rate, 1)

def classify_dos_status(dos: float) -> str:
    """
    Military classification:
    - RED (Critical): <= 5.0 Days
    - AMBER (Warning): 5.0 to 15.0 Days
    - GREEN (Optimal): > 15.0 Days
    """
    if dos <= DOS_CRITICAL_THRESHOLD:
        return "RED"
    elif dos <= DOS_WARNING_THRESHOLD:
        return "AMBER"
    return "GREEN"
