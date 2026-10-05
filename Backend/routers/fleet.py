"""
Tactical Fleet, Driver & Post Location API Router
Provides comprehensive location tracking for Army Posts, Truck Drivers, and Supply Vehicles.
Enables Master Admin Panel COP (Common Operating Picture) visibility and dispatch controls.
"""
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MilitaryNode, StrategicPass
from ..services.fleet_service import fleet_service
from ..services.audit_service import append_audit_entry

router = APIRouter(prefix="/api/v1/fleet", tags=["Tactical Fleet & Location Tracking"])

class DispatchRequest(BaseModel):
    vehicle_id: str
    destination_node_id: str
    destination_name: str
    driver_name: Optional[str] = None
    authorized_by: str = "OFFICER_ADMIN"

class PingDriverRequest(BaseModel):
    driver_id: str
    message: str = "Report current tactical position and road condition."

@router.get("/vehicles")
def get_supply_vehicles():
    """Returns all active tactical supply vehicles with live GPS coordinates, cargo status, and assigned driver."""
    return fleet_service.get_all_vehicles()

@router.get("/drivers")
def get_convoy_drivers():
    """Returns all military drivers, their service credentials, tactical radio channels, and current location."""
    return fleet_service.get_all_drivers()

@router.get("/all-locations")
def get_all_tactical_locations(db: Session = Depends(get_db)):
    """
    Unified tactical Common Operating Picture (COP) endpoint:
    Aggregates Army Posts, Mountain Passes, Supply Vehicles, and Truck Drivers with live coordinates.
    Used by the Master Admin Console and Tactical 3D Map.
    """
    # 1. Fetch Army Posts
    nodes = db.query(MilitaryNode).all()
    army_posts = []
    for n in nodes:
        army_posts.append({
            "id": n.node_id,
            "name": n.name,
            "type": n.node_type,
            "latitude": n.latitude,
            "longitude": n.longitude,
            "altitude_feet": n.altitude_feet,
            "troop_count": n.troop_count,
            "threat_level": n.threat_level,
            "ambient_temp_c": n.ambient_temp_c,
            "status": "OPERATIONAL",
            "category": "ARMY_POST"
        })

    # 2. Fetch Strategic Passes
    passes = db.query(StrategicPass).all()
    pass_locations = []
    for p in passes:
        pass_locations.append({
            "id": p.pass_id,
            "name": p.name,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "altitude_feet": p.altitude_feet,
            "is_blocked": p.is_blocked,
            "status": "BLOCKED" if p.is_blocked else "OPEN",
            "category": "STRATEGIC_PASS"
        })

    # 3. Fetch Supply Vehicles & Drivers
    vehicles = fleet_service.get_all_vehicles()
    drivers = fleet_service.get_all_drivers()

    return {
        "timestamp": "2026-10-04T16:20:00Z",
        "command_sector": "14 Corps - Northern Command",
        "summary": {
            "total_army_posts": len(army_posts),
            "total_passes": len(pass_locations),
            "active_supply_vehicles": len(vehicles),
            "active_drivers_on_duty": len(drivers),
            "network_status": "ENCRYPTED_TACTICAL_UHF_ACTIVE"
        },
        "army_posts": army_posts,
        "passes": pass_locations,
        "supply_vehicles": vehicles,
        "drivers": drivers
    }

@router.post("/dispatch")
def dispatch_vehicle_order(payload: DispatchRequest, db: Session = Depends(get_db)):
    """Admin command to reassign vehicle route or dispatch emergency supply vehicle."""
    result = fleet_service.dispatch_vehicle(
        vehicle_id=payload.vehicle_id,
        destination_node_id=payload.destination_node_id,
        destination_name=payload.destination_name,
        driver_name=payload.driver_name
    )
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message"))

    # Audit log to cryptographic ledger
    audit_entry = append_audit_entry(
        db=db,
        action_type="FLEET_DISPATCH",
        user_id=payload.authorized_by,
        details={
            "vehicle_id": payload.vehicle_id,
            "call_sign": result.get("call_sign"),
            "new_destination": payload.destination_name
        }
    )

    result["audit_id"] = audit_entry.audit_id
    result["sha256_hash"] = audit_entry.current_hash
    return result

@router.post("/ping-driver")
def ping_driver_radio(payload: PingDriverRequest):
    """Sends tactical UHF radio ping to driver."""
    result = fleet_service.ping_driver(payload.driver_id, payload.message)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message"))
    return result
