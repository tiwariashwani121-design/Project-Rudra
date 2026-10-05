"""
Synthetic Military Consumption Data Generator
Produces 180 days of daily consumption records with realistic sub-zero seasonality.
"""
import random
import json
from datetime import datetime, timedelta, timezone

def generate_historical_records(days: int = 180):
    nodes = ["FOP_SIACHEN_BASE", "FOP_DBO", "FOP_TURTUK", "FLD_PARTAPUR"]
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    records = []
    current_date = start_date

    while current_date <= end_date:
        day_of_year = current_date.timetuple().tm_yday
        # Winter peak between December (day ~340) and February (day ~50)
        is_winter = day_of_year > 300 or day_of_year < 75

        for node_id in nodes:
            if "SIACHEN" in node_id or "DBO" in node_id:
                temp_c = random.uniform(-35.0, -18.0) if is_winter else random.uniform(-15.0, -2.0)
            else:
                temp_c = random.uniform(-20.0, -8.0) if is_winter else random.uniform(-5.0, 10.0)

            # Bukharis fuel consumption heavily spikes in winter
            kerosene_burn = 1400.0 * (2.8 if is_winter else 1.2) + random.uniform(-80, 80)
            rations_burn = 350.0 + random.uniform(-20, 20)
            ammo_expenditure = random.choice([0.0, 120.0, 350.0, 0.0]) # periodic firing practice
            medical_demand = random.uniform(2.0, 8.0)

            records.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "node_id": node_id,
                "ambient_temp_c": round(temp_c, 1),
                "kerosene_liters": round(kerosene_burn, 1),
                "rations_packets": round(rations_burn, 1),
                "ammo_rounds": round(ammo_expenditure, 0),
                "medical_units": round(medical_demand, 1)
            })

        current_date += timedelta(days=1)

    return records

if __name__ == "__main__":
    data = generate_historical_records(180)
    with open("historical_consumption_180d.json", "w") as f:
        json.dump(data, f, indent=2)
    print(f"[OK] Generated {len(data)} historical consumption data points.")
