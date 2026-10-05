"""
Tactical Fleet Management & Driver Location Service
Tracks all Army supply vehicles, convoy drivers, and military posts in real-time.
"""
import math
from datetime import datetime, timezone
from typing import List, Dict, Any

INITIAL_FLEET = [
    {
        "vehicle_id": "VEH_STALLION_ALPHA",
        "call_sign": "STALLION ALPHA",
        "reg_number": "14C/TRK-0921",
        "vehicle_type": "Ashok Leyland Stallion 4x4",
        "vehicle_category": "HEAVY_TRUCK",
        "driver": {
            "driver_id": "DRV_01",
            "name": "Sepoy Jaswinder Singh",
            "service_number": "15894201A",
            "rank": "Sepoy",
            "unit": "14 Corps ASC Bn",
            "phone_radio": "UHF-142.85 MHz (Tactical Radio)",
            "duty_status": "DRIVING_ON_DUTY",
            "medical_clearance": "SHAPE-1 (High Altitude Fit)",
            "blood_group": "B+ve"
        },
        "cargo": {
            "item_name": "Class VIII Blood Plasma & Vaccines",
            "supply_class": "CLASS_VIII",
            "payload_tonnes": 14.5,
            "cold_chain_temp_c": 4.2,
            "cold_chain_safe": True
        },
        "origin_node_id": "BASE_LEH_DEPOT",
        "origin_name": "Leh Central Base Depot",
        "destination_node_id": "FLD_PARTAPUR",
        "destination_name": "Partapur Forward Logistics Depot",
        "status": "EN_ROUTE",
        "current_lat": 34.2250,
        "current_lon": 77.6120,
        "speed_kmh": 34.0,
        "fuel_level_pct": 82.5,
        "eta_minutes": 145,
        "path_waypoints": [
            [34.1526, 77.5771], [34.1950, 77.5950], [34.2381, 77.6189],
            [34.2787, 77.6047], [34.3321, 77.6321], [34.4800, 77.6300], [34.6644, 77.6258]
        ],
        "step": 2
    },
    {
        "vehicle_id": "VEH_KEROSENE_TANKER",
        "call_sign": "SUTLEJ BOWSER-03",
        "reg_number": "14C/BWS-4810",
        "vehicle_type": "Tatra 6x6 Heavy Fuel Bowser",
        "vehicle_category": "FUEL_TANKER",
        "driver": {
            "driver_id": "DRV_02",
            "name": "Havildar Manoj Kumar",
            "service_number": "14782034K",
            "rank": "Havildar",
            "unit": "623 ASC Supply Coy",
            "phone_radio": "UHF-143.10 MHz (Tactical Radio)",
            "duty_status": "DRIVING_ON_DUTY",
            "medical_clearance": "SHAPE-1 (High Altitude Fit)",
            "blood_group": "O+ve"
        },
        "cargo": {
            "item_name": "Class III Bukhari Heating Kerosene (12,000 Liters)",
            "supply_class": "CLASS_III",
            "payload_tonnes": 10.8,
            "cold_chain_temp_c": None,
            "cold_chain_safe": True
        },
        "origin_node_id": "FLD_PARTAPUR",
        "origin_name": "Partapur Staging Depot",
        "destination_node_id": "FOP_SIACHEN_BASE",
        "destination_name": "Siachen Base Camp (FOP)",
        "status": "EN_ROUTE",
        "current_lat": 34.8800,
        "current_lon": 77.4100,
        "speed_kmh": 28.0,
        "fuel_level_pct": 68.0,
        "eta_minutes": 85,
        "path_waypoints": [
            [34.6644, 77.6258], [34.8000, 77.5200], [34.9500, 77.3500],
            [35.0800, 77.2200], [35.2008, 77.1264]
        ],
        "step": 2
    },
    {
        "vehicle_id": "VEH_ALS_RATIONS",
        "call_sign": "CHETAK RATIONS-07",
        "reg_number": "14C/ALS-1124",
        "vehicle_type": "ALS 4x4 Mountain Cargo Carrier",
        "vehicle_category": "LIGHT_4X4",
        "driver": {
            "driver_id": "DRV_03",
            "name": "Naik Tenzing Norbu",
            "service_number": "16024891M",
            "rank": "Naik",
            "unit": "Ladakh Scouts Logistics Detachment",
            "phone_radio": "UHF-141.50 MHz (Tactical Radio)",
            "duty_status": "DRIVING_ON_DUTY",
            "medical_clearance": "SHAPE-1 (Ladakh Native Expert)",
            "blood_group": "AB+ve"
        },
        "cargo": {
            "item_name": "Class I High Altitude Rations & Fresh Veg (4,000 Packs)",
            "supply_class": "CLASS_I",
            "payload_tonnes": 5.2,
            "cold_chain_temp_c": None,
            "cold_chain_safe": True
        },
        "origin_node_id": "FLD_PARTAPUR",
        "origin_name": "Partapur Staging Depot",
        "destination_node_id": "FOP_TURTUK",
        "destination_name": "Turtuk Border Post (LOC)",
        "status": "EN_ROUTE",
        "current_lat": 34.7200,
        "current_lon": 77.2000,
        "speed_kmh": 38.0,
        "fuel_level_pct": 91.0,
        "eta_minutes": 55,
        "path_waypoints": [
            [34.6644, 77.6258], [34.7200, 77.4000], [34.7800, 77.1000],
            [34.8465, 76.8294]
        ],
        "step": 1
    },
    {
        "vehicle_id": "VEH_AMMO_HEAVY",
        "call_sign": "THUNDERBOLT AMMO-02",
        "reg_number": "14C/STN-7732",
        "vehicle_type": "Ashok Leyland Armored 6x6",
        "vehicle_category": "HEAVY_TRUCK",
        "driver": {
            "driver_id": "DRV_04",
            "name": "Sepoy Vikram Rawat",
            "service_number": "15930218P",
            "rank": "Sepoy",
            "unit": "Garhwal Rifles Logistics Platoon",
            "phone_radio": "UHF-144.20 MHz (Tactical Radio)",
            "duty_status": "STATIONARY_INSPECTION",
            "medical_clearance": "SHAPE-1",
            "blood_group": "A+ve"
        },
        "cargo": {
            "item_name": "Class V Ammunition (5.56mm INSAS & 81mm Mortar Bombs)",
            "supply_class": "CLASS_V",
            "payload_tonnes": 12.0,
            "cold_chain_temp_c": None,
            "cold_chain_safe": True
        },
        "origin_node_id": "BASE_LEH_DEPOT",
        "origin_name": "Leh Central Base Depot",
        "destination_node_id": "FOP_DBO",
        "destination_name": "Daulat Beg Oldi (DBO)",
        "status": "STAGED_AT_DEPOT",
        "current_lat": 34.1526,
        "current_lon": 77.5771,
        "speed_kmh": 0.0,
        "fuel_level_pct": 98.0,
        "eta_minutes": 320,
        "path_waypoints": [
            [34.1526, 77.5771], [33.9210, 77.7420], [34.0478, 77.9304],
            [34.4820, 77.8210], [34.5800, 77.7800], [34.6644, 77.6258], [35.4012, 77.9254]
        ],
        "step": 0
    },
    {
        "vehicle_id": "VEH_ALH_DHRUV_HELO",
        "call_sign": "GARUDA AIRDROP-01",
        "reg_number": "IA-3042_ALH",
        "vehicle_type": "HAL ALH Dhruv Mk-III (Rotary Wing)",
        "vehicle_category": "HELICOPTER",
        "driver": {
            "driver_id": "DRV_05",
            "name": "Major Rohit Deshmukh (Aviation Pilot)",
            "service_number": "IC-62410H",
            "rank": "Major",
            "unit": "205 Army Aviation Squadron",
            "phone_radio": "VHF-121.50 MHz TAC",
            "duty_status": "AIRBORNE_READY",
            "medical_clearance": "CLASS-1 AIRCREW",
            "blood_group": "O-ve"
        },
        "cargo": {
            "item_name": "Emergency Class VIII Frostbite Treatment & Blood Units",
            "supply_class": "CLASS_VIII",
            "payload_tonnes": 1.8,
            "cold_chain_temp_c": 3.8,
            "cold_chain_safe": True
        },
        "origin_node_id": "FLD_PARTAPUR",
        "origin_name": "Thoise / Partapur Helipad",
        "destination_node_id": "FOP_SIACHEN_BASE",
        "destination_name": "Siachen Base Camp (Forward Helipad)",
        "status": "AIRBORNE",
        "current_lat": 34.9800,
        "current_lon": 77.3000,
        "speed_kmh": 185.0,
        "fuel_level_pct": 74.0,
        "eta_minutes": 22,
        "path_waypoints": [
            [34.6644, 77.6258], [34.9500, 77.3800], [35.2008, 77.1264]
        ],
        "step": 1
    }
]

class TacticalFleetService:
    def __init__(self):
        self.fleet = INITIAL_FLEET

    def advance_fleet_simulation(self):
        """Advances vehicle coordinates along waypoints."""
        for v in self.fleet:
            if v["status"] in ["EN_ROUTE", "AIRBORNE"]:
                waypoints = v["path_waypoints"]
                v["step"] = (v["step"] + 1) % len(waypoints)
                coord = waypoints[v["step"]]
                v["current_lat"] = coord[0]
                v["current_lon"] = coord[1]
                v["fuel_level_pct"] = max(10.0, round(v["fuel_level_pct"] - 0.05, 1))

    def get_all_vehicles(self) -> List[Dict[str, Any]]:
        self.advance_fleet_simulation()
        return self.fleet

    def get_all_drivers(self) -> List[Dict[str, Any]]:
        results = []
        for v in self.fleet:
            d = dict(v["driver"])
            d["assigned_vehicle_id"] = v["vehicle_id"]
            d["assigned_vehicle_callsign"] = v["call_sign"]
            d["current_lat"] = v["current_lat"]
            d["current_lon"] = v["current_lon"]
            d["destination_name"] = v["destination_name"]
            results.append(d)
        return results

    def dispatch_vehicle(
        self,
        vehicle_id: str,
        destination_node_id: str,
        destination_name: str,
        driver_name: str = None
    ) -> Dict[str, Any]:
        target = next((v for v in self.fleet if v["vehicle_id"] == vehicle_id), None)
        if not target:
            return {"success": False, "message": "Vehicle not found in fleet"}

        target["destination_node_id"] = destination_node_id
        target["destination_name"] = destination_name
        target["status"] = "EN_ROUTE"
        target["step"] = 0
        if driver_name:
            target["driver"]["name"] = driver_name

        return {
            "success": True,
            "vehicle_id": vehicle_id,
            "call_sign": target["call_sign"],
            "new_destination": destination_name,
            "status": "DISPATCHED"
        }

    def ping_driver(self, driver_id: str, message: str) -> Dict[str, Any]:
        target = next((v for v in self.fleet if v["driver"]["driver_id"] == driver_id), None)
        if not target:
            return {"success": False, "message": "Driver not found"}

        return {
            "success": True,
            "driver_name": target["driver"]["name"],
            "radio_frequency": target["driver"]["phone_radio"],
            "ping_status": "DELIVERED_OVER_TACTICAL_UHF",
            "message": f"UHF Ping to {target['driver']['name']} ({target['driver']['phone_radio']}): '{message}'"
        }

fleet_service = TacticalFleetService()
