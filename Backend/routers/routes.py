"""
GIS Multi-Modal Route Optimization & Pass Hazard Router
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PassStatus
from ..schemas import RouteOptimizeRequest, RouteOptimizeResponse, PassToggleRequest
from ..services.routing_service import optimize_route, WAYPOINTS_DATA
from ..services.telemetry_service import telemetry_engine
from ..services.audit_service import append_audit_entry

router = APIRouter(prefix="/api/v1", tags=["GIS Routes & Passes"])

@router.get("/passes")
def get_all_passes(db: Session = Depends(get_db)):
    """Returns real-time status of high-altitude Himalayan passes."""
    passes = db.query(PassStatus).all()
    return [
        {
            "pass_id": p.pass_id,
            "name": p.name,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "altitude_feet": p.altitude_feet,
            "is_blocked": p.is_blocked,
            "hazard_reason": p.hazard_reason,
            "hazard_score": p.hazard_score,
            "last_updated": p.last_updated.isoformat()
        }
        for p in passes
    ]

@router.post("/passes/toggle")
def toggle_pass_status(payload: PassToggleRequest, db: Session = Depends(get_db)):
    """
    Toggles mountain pass clearance (e.g. Khardung La BLOCKED by avalanche).
    Instantly triggers network re-routing and updates live convoy path vectors.
    """
    pass_obj = db.query(PassStatus).filter(PassStatus.pass_id == payload.pass_id).first()
    if not pass_obj:
        raise HTTPException(status_code=404, detail="Pass not found")

    pass_obj.is_blocked = payload.is_blocked
    pass_obj.hazard_reason = payload.hazard_reason if payload.is_blocked else "CLEAR"
    pass_obj.hazard_score = 92.0 if payload.is_blocked else 20.0
    db.commit()

    # Inform live telemetry engine to redirect moving convoy if Khardung La is affected
    if payload.pass_id == "PASS_KHARDUNG_LA":
        telemetry_engine.set_route_diverted(payload.is_blocked)

    # Cryptographic Audit Log
    audit = append_audit_entry(
        db=db,
        action_type="PASS_STATUS_TOGGLE",
        user_id=payload.user_id or "COMMAND_LOGISTICS_DESK",
        details={
            "pass_id": payload.pass_id,
            "new_state": "BLOCKED" if payload.is_blocked else "CLEAR",
            "hazard_reason": pass_obj.hazard_reason
        }
    )

    return {
        "status": "UPDATED",
        "pass_id": payload.pass_id,
        "is_blocked": payload.is_blocked,
        "hazard_reason": pass_obj.hazard_reason,
        "audit_id": audit.audit_id,
        "sha256_hash": audit.current_hash,
        "message": f"Pass {pass_obj.name} set to {'BLOCKED (' + pass_obj.hazard_reason + ')' if payload.is_blocked else 'CLEAR'}. Route solver re-indexed."
    }

@router.post("/routes/optimize", response_model=RouteOptimizeResponse)
def get_optimized_route(req: RouteOptimizeRequest, db: Session = Depends(get_db)):
    """
    Computes optimal convoy transit trajectory across the Leh-Siachen corridor.
    Automatically factors in blocked passes, elevation gain, and fuel burn.
    """
    # Check active database pass blocks if not explicitly provided
    active_blocked = list(req.blocked_passes or [])
    db_blocked = db.query(PassStatus).filter(PassStatus.is_blocked == True).all()
    for bp in db_blocked:
        if bp.pass_id not in active_blocked:
            active_blocked.append(bp.pass_id)

    result = optimize_route(
        origin_id=req.origin_node_id,
        dest_id=req.destination_node_id,
        blocked_passes=active_blocked
    )
    return result

@router.get("/corridor/nodes")
def get_corridor_nodes():
    """Returns static spatial waypoints and checkpoints for tactical map rendering."""
    return list(WAYPOINTS_DATA.values())
