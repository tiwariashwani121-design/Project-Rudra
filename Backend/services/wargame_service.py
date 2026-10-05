"""
War-Gaming & Stress Scenario Simulation Service
Allows Commanders to run "What-If" stress tests (mobilization spikes, temperature drops, pass blockades).
"""
from typing import Dict, Any, List
from .forecast_service import (
    get_bukhari_temperature_multiplier,
    get_threat_multiplier,
    calculate_dos
)

def run_wargame_simulation(
    target_node_id: str,
    target_node_name: str,
    initial_stock: float,
    base_troop_count: int,
    base_rate_per_soldier: float,
    temperature_drop_c: float,
    troop_mobilization_pct: float,
    pass_blockade_days: int,
    threat_level: str
) -> Dict[str, Any]:
    """
    Simulates forward depletion trajectory over 30 days.
    """
    # 1. Baseline parameters (Normal condition: -15°C, 0% mobilization, PEACE)
    baseline_temp_mult = get_bukhari_temperature_multiplier(-15.0)
    baseline_threat_mult = get_threat_multiplier("PEACE", "CLASS_III")
    baseline_daily_burn = base_rate_per_soldier * base_troop_count * baseline_temp_mult * baseline_threat_mult
    baseline_dos = calculate_dos(initial_stock, baseline_daily_burn)

    # 2. Stress parameters
    stress_troops = int(base_troop_count * (1.0 + (troop_mobilization_pct / 100.0)))
    stress_temp_mult = get_bukhari_temperature_multiplier(temperature_drop_c)
    stress_threat_mult = get_threat_multiplier(threat_level, "CLASS_III")
    stress_daily_burn = base_rate_per_soldier * stress_troops * stress_temp_mult * stress_threat_mult

    burn_increase_pct = round(((stress_daily_burn - baseline_daily_burn) / baseline_daily_burn) * 100.0, 1)
    simulated_dos = calculate_dos(initial_stock, stress_daily_burn)

    # 3. Simulate 30-day projection
    depletion_curve: List[Dict[str, Any]] = []
    base_curr = initial_stock
    sim_curr = initial_stock
    days_until_stockout = 30

    for day in range(1, 31):
        # Baseline depletion
        base_curr = max(0.0, base_curr - baseline_daily_burn)
        
        # Stress scenario: zero replenishment during pass blockade days
        sim_curr = max(0.0, sim_curr - stress_daily_burn)

        if sim_curr <= 0.0 and days_until_stockout == 30:
            days_until_stockout = day

        depletion_curve.append({
            "day": day,
            "baseline_stock": round(base_curr, 1),
            "simulated_stock": round(sim_curr, 1),
            "daily_burn_rate": round(stress_daily_burn, 1),
            "is_stockout": sim_curr <= 0.0
        })

    # Tactical pre-positioning recommendation
    shortfall = max(0.0, round((stress_daily_burn * pass_blockade_days) - (initial_stock * 0.3), 1))
    recommendation = (
        f"CRITICAL ACTION REQUIRED: Pre-position at least {shortfall:,.0f} Liters of Heating Kerosene "
        f"at Forward Staging Depot before Pass Closure Day {pass_blockade_days}. "
        f"Burn rate elevated by +{burn_increase_pct}% under {temperature_drop_c}°C blizzard conditions."
    )

    return {
        "target_node_id": target_node_id,
        "target_node_name": target_node_name,
        "tested_temperature": temperature_drop_c,
        "tested_mobilization_pct": troop_mobilization_pct,
        "threat_level": threat_level,
        "item_tested": "CLASS_III_BUKHARI_KEROSENE",
        "initial_stock": initial_stock,
        "baseline_days_of_supply": baseline_dos,
        "simulated_days_of_supply": simulated_dos,
        "days_until_stockout": days_until_stockout,
        "stockout_prevented": days_until_stockout > pass_blockade_days,
        "burn_rate_increase_pct": burn_increase_pct,
        "depletion_curve": depletion_curve,
        "tactical_recommendation": recommendation
    }
