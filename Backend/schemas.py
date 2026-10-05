"""
Pydantic Schemas for Project Rudra-Logistics
Strict data validation to prevent injection attacks and ensure operational integrity
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- Node & Inventory Schemas ---
class InventoryItemStatus(BaseModel):
    item_id: str
    name: str
    supply_class: str
    unit_of_measure: str
    current_quantity: float
    safety_threshold_qty: float
    daily_burn_rate: float
    days_of_supply_dos: float
    status: str  # RED, AMBER, GREEN
    is_cold_chain: bool = False

class MilitaryNodeHealth(BaseModel):
    node_id: str
    name: str
    node_type: str
    latitude: float
    longitude: float
    altitude_feet: float
    troop_count: int
    threat_level: str
    ambient_temp_c: float
    overall_status: str  # CRITICAL, WARNING, OPTIMAL
    critical_items_count: int
    inventory: List[InventoryItemStatus]

# --- Route & Pass Schemas ---
class PassToggleRequest(BaseModel):
    pass_id: str = Field(..., description="ID of pass, e.g., PASS_KHARDUNG_LA")
    is_blocked: bool
    hazard_reason: Optional[str] = "AVALANCHE"
    user_id: Optional[str] = "OFFICER_14C_LOG"

class RouteOptimizeRequest(BaseModel):
    origin_node_id: str = "BASE_LEH_DEPOT"
    destination_node_id: str = "FOP_SIACHEN_BASE"
    blocked_passes: Optional[List[str]] = []
    cargo_priority: Optional[str] = "CRITICAL_POL_KEROSENE"
    threat_level: Optional[str] = "PEACE"

class RouteWaypoint(BaseModel):
    lat: float
    lon: float
    name: str
    altitude_feet: float

class RouteOptimizeResponse(BaseModel):
    route_id: str
    route_name: str
    is_diverted: bool
    primary_pass_blocked: bool
    distance_km: float
    estimated_travel_time_hours: float
    elevation_gain_m: float
    hazard_level: str  # LOW, MODERATE, HIGH, EXTREME
    fuel_consumption_liters: float
    recommended_convoy_type: str
    path_coordinates: List[List[float]]  # [[lat, lon], ...]
    waypoints: List[RouteWaypoint]
    advisory_notes: str

# --- Telemetry & Convoy Schemas ---
class TelemetryPayload(BaseModel):
    convoy_id: str
    call_sign: str
    status: str
    current_lat: float
    current_lon: float
    speed_kmh: float
    fuel_level_pct: float
    cargo_temp_celsius: float
    cold_chain_breach: bool
    is_spoofed: bool
    spoof_warning: Optional[str] = None
    vehicle_type: str
    total_payload_tonnes: float
    cargo_type: str
    origin_node_id: str
    destination_node_id: str
    timestamp: str

class SpoofSimulationRequest(BaseModel):
    convoy_id: str = "CNV_14C_08"
    enable_spoof: bool
    teleport_lat: Optional[float] = 34.9900
    teleport_lon: Optional[float] = 78.4500
    impossible_speed: Optional[float] = 165.0

# --- Audit & Security Schemas ---
class AuditEntryOut(BaseModel):
    audit_id: int
    action_type: str
    executed_by_user_id: str
    details: Dict[str, Any]
    prev_hash: str
    current_hash: str
    timestamp: datetime

class AuditChainVerifyResponse(BaseModel):
    chain_length: int
    tamper_detected: bool
    compromised_block_index: Optional[int] = None
    latest_block_hash: str
    status: str
    verified_at: str

class ParameterOverrideRequest(BaseModel):
    parameter_name: str
    new_value: float
    justification: str
    user_id: str = "LT_COL_SHARMA"

class EmergencyInventoryInjectRequest(BaseModel):
    node_id: str
    item_id: str
    quantity: float
    mode: str = "AIRDROP_ALH"  # AIRDROP_ALH, EMERGENCY_CONVOY, AUDIT_RECONCILE
    justification: str
    user_id: str = "LT_COL_SHARMA"

class IndentAuthorizeRequest(BaseModel):
    indent_id: str
    authorized_by: str = "BRIGADIER_LOGISTICS"
    convoy_callsign: Optional[str] = "STALLION_BRAVO_RUSH"

# --- War Game Simulator Schemas ---
class WarGameSimulateRequest(BaseModel):
    temperature_drop_c: float = Field(-32.0, ge=-50.0, le=10.0)
    troop_mobilization_pct: float = Field(40.0, ge=0.0, le=200.0)
    pass_blockade_days: int = Field(7, ge=0, le=30)
    threat_level: str = "HEIGHTENED"
    target_node_id: str = "FOP_SIACHEN_BASE"

class DailySupplyDepletion(BaseModel):
    day: int
    baseline_stock: float
    simulated_stock: float
    daily_burn_rate: float
    is_stockout: bool

class WarGameSimulateResponse(BaseModel):
    target_node_id: str
    target_node_name: str
    tested_temperature: float
    tested_mobilization_pct: float
    threat_level: str
    item_tested: str
    initial_stock: float
    baseline_days_of_supply: float
    simulated_days_of_supply: float
    days_until_stockout: int
    stockout_prevented: bool
    burn_rate_increase_pct: float
    depletion_curve: List[DailySupplyDepletion]
    tactical_recommendation: str

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    service_number: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    service_number: str
    rank_and_name: str
    role: str
    clearance_level: str
