"""
High-Altitude Weather & SASE Avalanche Intelligence Router
"""
from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
from ..services.weather_service import weather_service

router = APIRouter(prefix="/api/v1/weather", tags=["Weather & Avalanche Intelligence"])

class BlizzardSimulateRequest(BaseModel):
    location_id: str = "PASS_KHARDUNG_LA"
    enable: bool = True

@router.get("/current")
def get_current_sector_weather():
    """Returns real-time temperature, wind chill, visibility, and avalanche risk across all corridor posts."""
    return weather_service.get_current_weather()

@router.get("/forecast")
def get_location_weather_forecast(
    location_id: str = Query("FOP_SIACHEN_BASE", description="Target node/pass ID"),
    days: int = Query(7, ge=1, le=14, description="Forecast horizon days")
):
    """Returns 7-day high-altitude meteorological forecast including snowfall and wind chill."""
    return weather_service.get_forward_forecast(location_id=location_id, days=days)

@router.get("/alerts")
def get_avalanche_weather_alerts():
    """Returns active DGRE / SASE avalanche hazard warnings and blizzards."""
    current = weather_service.get_current_weather()
    alerts = []
    for c in current:
        if c["avalanche_risk"] in ["LEVEL_3_HIGH", "LEVEL_4_EXTREME"]:
            alerts.append({
                "location_id": c["location_id"],
                "location_name": c["name"],
                "severity": "CRITICAL" if c["avalanche_risk"] == "LEVEL_4_EXTREME" else "WARNING",
                "hazard_type": "AVALANCHE_DANGER",
                "temperature": c["temperature_c"],
                "wind_chill": c["wind_chill_c"],
                "snowfall_24h": c["snowfall_cm_24h"],
                "directive": "CONVOY TRANSIT RESTRICTED. MANDATORY SNOW CHAINS & ICE CLEATS."
            })
    return alerts

@router.post("/simulate-blizzard")
def toggle_simulated_blizzard(req: BlizzardSimulateRequest):
    """
    HACKATHON DEMO ENDPOINT:
    Triggers sudden Himalayan blizzard at Khardung La or Siachen Base Camp.
    Causes severe temperature drop (-8.5°C), high snowfall (+45cm), and forces pass closure.
    """
    weather_service.trigger_blizzard(req.location_id, req.enable)
    return {
        "status": "APPLIED",
        "location_id": req.location_id,
        "blizzard_active": req.enable,
        "message": (
            f"Severe Category 10 Blizzard triggered at {req.location_id}. SASE Avalanche Alert raised to Level 4."
            if req.enable
            else f"Blizzard subsided at {req.location_id}. Weather returning to winter baseline."
        )
    }
