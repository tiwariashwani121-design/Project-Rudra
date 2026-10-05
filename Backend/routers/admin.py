"""
Master Admin Operational Console & Command Overrides Router
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import SystemParameter, InventoryStock, MilitaryNode, SupplyItem
from ..schemas import ParameterOverrideRequest, EmergencyInventoryInjectRequest
from ..services.audit_service import append_audit_entry

router = APIRouter(prefix="/api/v1/admin", tags=["Master Admin C2 Controls"])

@router.get("/parameters")
def get_system_parameters(db: Session = Depends(get_db)):
    """Returns operational multipliers across the command sector."""
    params = db.query(SystemParameter).all()
    return [
        {
            "param_key": p.param_key,
            "param_value": p.param_value,
            "unit": p.unit,
            "description": p.description,
            "last_modified_by": p.last_modified_by,
            "updated_at": p.updated_at.isoformat()
        }
        for p in params
    ]

@router.post("/overrides/parameter")
def override_operational_parameter(req: ParameterOverrideRequest, db: Session = Depends(get_db)):
    """
    Overrides core operational multipliers (e.g., Bukhari heating burn multiplier).
    Cryptographically logs change into the SHA-256 tamper-evident ledger.
    """
    param = db.query(SystemParameter).filter(SystemParameter.param_key == req.parameter_name).first()
    old_val = param.param_value if param else 1.0

    if not param:
        param = SystemParameter(
            param_key=req.parameter_name,
            param_value=req.new_value,
            last_modified_by=req.user_id,
            description=req.justification
        )
        db.add(param)
    else:
        param.param_value = req.new_value
        param.last_modified_by = req.user_id

    db.commit()

    # Append to SHA-256 Immutable Audit Chain
    audit = append_audit_entry(
        db=db,
        action_type="PARAM_OVERRIDE",
        user_id=req.user_id,
        details={
            "parameter_name": req.parameter_name,
            "old_value": old_val,
            "new_value": req.new_value,
            "justification": req.justification
        }
    )

    return {
        "status": "APPLIED",
        "parameter_name": req.parameter_name,
        "new_value": req.new_value,
        "audit_id": audit.audit_id,
        "sha256_hash": audit.current_hash,
        "message": f"Parameter {req.parameter_name} updated to {req.new_value}. Block #{audit.audit_id} signed."
    }

@router.post("/inventory/inject")
def inject_emergency_inventory(req: EmergencyInventoryInjectRequest, db: Session = Depends(get_db)):
    """
    Emergency stock injection (e.g., ALH Dhruv helicopter airdrop of heating kerosene/ammo).
    Directly updates stock and appends immutable cryptographic record.
    """
    stock = db.query(InventoryStock).filter(
        InventoryStock.node_id == req.node_id,
        InventoryStock.item_id == req.item_id
    ).first()

    if not stock:
        stock = InventoryStock(
            stock_id=f"STK_{req.node_id}_{req.item_id}",
            node_id=req.node_id,
            item_id=req.item_id,
            current_quantity=req.quantity,
            safety_threshold_qty=100.0,
            days_of_supply_dos=10.0
        )
        db.add(stock)
    else:
        stock.current_quantity += req.quantity

    db.commit()

    # Cryptographic Audit Log
    audit = append_audit_entry(
        db=db,
        action_type="EMERGENCY_STOCK_INJECT",
        user_id=req.user_id,
        details={
            "node_id": req.node_id,
            "item_id": req.item_id,
            "injected_qty": req.quantity,
            "delivery_mode": req.mode,
            "justification": req.justification,
            "new_total": stock.current_quantity
        }
    )

    return {
        "status": "SUCCESS",
        "node_id": req.node_id,
        "item_id": req.item_id,
        "new_quantity": stock.current_quantity,
        "audit_id": audit.audit_id,
        "sha256_hash": audit.current_hash,
        "message": f"Successfully injected {req.quantity} units via {req.mode}. Signed in audit chain."
    }

@router.post("/threat-level")
def set_global_threat_level(threat_level: str, db: Session = Depends(get_db)):
    """Updates operational threat readiness state across all forward posts."""
    threat_level = threat_level.upper()
    if threat_level not in ["PEACE", "HEIGHTENED", "ACTIVE"]:
        raise HTTPException(status_code=400, detail="Invalid threat level")

    nodes = db.query(MilitaryNode).all()
    for n in nodes:
        n.threat_level = threat_level
    db.commit()

    audit = append_audit_entry(
        db=db,
        action_type="THREAT_LEVEL_CHANGE",
        user_id="COMMAND_HQ",
        details={"new_threat_level": threat_level}
    )

    return {
        "status": "APPLIED",
        "threat_level": threat_level,
        "audit_id": audit.audit_id,
        "sha256_hash": audit.current_hash,
        "message": f"Global Sector Threat Level changed to {threat_level}."
    }
