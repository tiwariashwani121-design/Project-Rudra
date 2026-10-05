"""
High-Altitude Military Meteorological Intelligence & Weather Forecast Service
Targeted for Northern Command (Leh, Khardung La, Chang La, Partapur, Siachen, DBO)
Complies with DGRE (Defence Geoinformatics Research Establishment / SASE) protocols.
"""
import math
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

# Sector elevation and weather baseline
WEATHER_BASELINES: Dict[str, Dict[str, Any]] = {
    "FOP_SIACHEN_BASE": {
        "name": "Siachen Base Camp (12,000 FT)",
        "temp_base": -28.5,
        "wind_speed_kmh": 42.0,
        "condition": "HEAVY_SNOW",
        "snowfall_cm_24h": 18.5,
        "visibility_m": 800,
        "avalanche_risk": "LEVEL_3_HIGH" # SASE Alert
    },
    "PASS_KHARDUNG_LA": {
        "name": "Khardung La Pass (17,982 FT)",
        "temp_base": -31.0,
        "wind_speed_kmh": 55.0,
        "condition": "BLIZZARD_GUSTS",
        "snowfall_cm_24h": 26.0,
        "visibility_m": 350,
        "avalanche_risk": "LEVEL_4_EXTREME"
    },
    "PASS_CHANG_LA": {
        "name": "Chang La Pass (17,688 FT)",
        "temp_base": -26.0,
        "wind_speed_kmh": 38.0,
        "condition": "MODERATE_SNOW",
        "snowfall_cm_24h": 12.0,
        "visibility_m": 1200,
        "avalanche_risk": "LEVEL_2_MODERATE"
    },
    "FOP_DBO": {
        "name": "Daulat Beg Oldi - DBO (16,600 FT)",
        "temp_base": -32.5,
        "wind_speed_kmh": 48.0,
        "condition": "EXTREME_COLD_FREEZE",
        "snowfall_cm_24h": 8.0,
        "visibility_m": 2500,
        "avalanche_risk": "LEVEL_2_MODERATE"
    },
    "FLD_PARTAPUR": {
        "name": "Partapur Staging Depot (10,200 FT)",
        "temp_base": -14.0,
        "wind_speed_kmh": 22.0,
        "condition": "PARTLY_CLOUDY",
        "snowfall_cm_24h": 3.0,
        "visibility_m": 4500,
        "avalanche_risk": "LEVEL_1_LOW"
    },
    "BASE_LEH_DEPOT": {
        "name": "Leh Central Base Depot (11,500 FT)",
        "temp_base": -12.0,
        "wind_speed_kmh": 18.0,
        "condition": "CLEAR_SKY",
        "snowfall_cm_24h": 0.0,
        "visibility_m": 8000,
        "avalanche_risk": "LEVEL_1_LOW"
    },
    "FOP_TURTUK": {
        "name": "Turtuk Border Post (9,900 FT)",
        "temp_base": -10.0,
        "wind_speed_kmh": 16.0,
        "condition": "LIGHT_SNOW",
        "snowfall_cm_24h": 4.0,
        "visibility_m": 3500,
        "avalanche_risk": "LEVEL_1_LOW"
    }
}

class WeatherForecastService:
    def __init__(self):
        self.blizzard_active_pass = None

    def calculate_wind_chill(self, temp_c: float, wind_kmh: float) -> float:
        """
        Official Wind Chill Formula for High-Altitude Military Ops:
        Twc = 13.12 + 0.6215*T - 11.37*(V^0.16) + 0.3965*T*(V^0.16)
        """
        v = max(wind_kmh, 5.0)
        twc = 13.12 + (0.6215 * temp_c) - (11.37 * math.pow(v, 0.16)) + (0.3965 * temp_c * math.pow(v, 0.16))
        return round(twc, 1)

    def trigger_blizzard(self, location_id: str, enable: bool):
        if enable:
            self.blizzard_active_pass = location_id
        elif self.blizzard_active_pass == location_id:
            self.blizzard_active_pass = None

    def get_current_weather(self) -> List[Dict[str, Any]]:
        results = []
        for loc_id, base in WEATHER_BASELINES.items():
            temp = base["temp_base"]
            wind = base["wind_speed_kmh"]
            cond = base["condition"]
            snow = base["snowfall_cm_24h"]
            av_risk = base["avalanche_risk"]
            vis = base["visibility_m"]

            # If simulated blizzard is active at this location
            if self.blizzard_active_pass == loc_id:
                temp -= 8.5
                wind += 35.0
                cond = "BLIZZARD_FORCE_10"
                snow += 45.0
                av_risk = "LEVEL_4_EXTREME"
                vis = 150

            wind_chill = self.calculate_wind_chill(temp, wind)

            results.append({
                "location_id": loc_id,
                "name": base["name"],
                "temperature_c": round(temp, 1),
                "wind_chill_c": wind_chill,
                "wind_speed_kmh": round(wind, 1),
                "condition": cond,
                "snowfall_cm_24h": round(snow, 1),
                "visibility_m": vis,
                "avalanche_risk": av_risk,
                "last_updated": datetime.now(timezone.utc).isoformat()
            })
        return results

    def get_forward_forecast(self, location_id: str = "FOP_SIACHEN_BASE", days: int = 7) -> Dict[str, Any]:
        base = WEATHER_BASELINES.get(location_id, WEATHER_BASELINES["FOP_SIACHEN_BASE"])
        forecast_days = []
        now = datetime.now(timezone.utc)

        for i in range(days):
            day_date = now + timedelta(days=i)
            # Weather pattern wave
            temp_var = math.sin(i * 0.8) * 4.0
            day_temp = round(base["temp_base"] + temp_var, 1)
            day_wind = round(base["wind_speed_kmh"] + (math.cos(i * 0.9) * 10.0), 1)
            day_snow = max(0.0, round(base["snowfall_cm_24h"] + (math.sin(i * 1.2) * 8.0), 1))
            
            # Determine condition label
            if day_snow > 20:
                cond = "HEAVY_BLIZZARD"
                risk = "LEVEL_4_EXTREME"
            elif day_snow > 10:
                cond = "STEADY_SNOW"
                risk = "LEVEL_3_HIGH"
            elif day_snow > 2:
                cond = "LIGHT_FLURRIES"
                risk = "LEVEL_2_MODERATE"
            else:
                cond = "COLD_SUNNY"
                risk = "LEVEL_1_LOW"

            forecast_days.append({
                "day_index": i + 1,
                "date": day_date.strftime("%d %b"),
                "weekday": day_date.strftime("%a"),
                "temp_min_c": round(day_temp - 4.0, 1),
                "temp_max_c": round(day_temp + 3.0, 1),
                "wind_chill_c": self.calculate_wind_chill(day_temp, day_wind),
                "wind_speed_kmh": day_wind,
                "snowfall_cm": day_snow,
                "condition": cond,
                "avalanche_risk": risk
            })

        return {
            "location_id": location_id,
            "location_name": base["name"],
            "days_count": days,
            "forecast": forecast_days,
            "meteorological_warning": (
                "SASE WARNING: Heavy snow front moving across Ladakh range. Pass clearance operations on standby."
                if any(d["avalanche_risk"] in ["LEVEL_3_HIGH", "LEVEL_4_EXTREME"] for d in forecast_days)
                else "MET NOMINAL: Window of clear flight corridors available for rotary airdrop."
            )
        }

weather_service = WeatherForecastService()
