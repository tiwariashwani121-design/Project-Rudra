"""
Military Nodes & Inventory Health API Router
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import MilitaryNode, InventoryStock, SupplyItem, IndentRequest
from ..schemas import MilitaryNodeHealth, InventoryItemStatus, IndentAuthorizeRequest
from ..services.forecast_service import calculate_daily_burn_rate, calculate_dos, classify_dos_status
from ..services.audit_service import append_audit_entry

router = APIRouter(prefix="/api/v1/nodes", tags=["Nodes & Inventory Health"])

@router.get("/health", response_model=List[MilitaryNodeHealth])
def get_nodes_health(db: Session = Depends(get_db)):
    """
    Returns Common Operating Picture (COP) inventory health across all forward posts.
    Calculates dynamic burn rates and Days of Supplies (DOS) based on ambient sub-zero temperature.
    """
    nodes = db.query(MilitaryNode).all()
    results = []

    for node in nodes:
        node_inventory = []
        has_critical = False
        has_warning = False
        critical_count = 0

        stocks = db.query(InventoryStock).filter(InventoryStock.node_id == node.node_id).all()
        for stock in stocks:
            item = db.query(SupplyItem).filter(SupplyItem.item_id == stock.item_id).first()
            if not item:
                continue

            daily_burn = calculate_daily_burn_rate(
                base_rate_per_soldier=item.base_consumption_per_soldier_day,
                troop_count=node.troop_count,
                supply_class=item.supply_class,
                item_id=item.item_id,
                ambient_temp_c=node.ambient_temp_c,
                threat_level=node.threat_level
            )

            dos = calculate_dos(stock.current_quantity, daily_burn)
            status = classify_dos_status(dos)

            # Update cached DOS in db if changed
            stock.days_of_supply_dos = dos

            if status == "RED":
                has_critical = True
                critical_count += 1
            elif status == "AMBER":
                has_warning = True

            node_inventory.append(
                InventoryItemStatus(
                    item_id=item.item_id,
                    name=item.name,
                    supply_class=item.supply_class,
                    unit_of_measure=item.unit_of_measure,
                    current_quantity=stock.current_quantity,
                    safety_threshold_qty=stock.safety_threshold_qty,
                    daily_burn_rate=daily_burn,
                    days_of_supply_dos=dos,
                    status=status,
                    is_cold_chain=item.is_cold_chain_required
                )
            )

        db.commit()

        overall = "CRITICAL" if has_critical else ("WARNING" if has_warning else "OPTIMAL")
        results.append(
            MilitaryNodeHealth(
                node_id=node.node_id,
                name=node.name,
                node_type=node.node_type,
                latitude=node.latitude,
                longitude=node.longitude,
                altitude_feet=node.altitude_feet,
                troop_count=node.troop_count,
                threat_level=node.threat_level,
                ambient_temp_c=node.ambient_temp_c,
                overall_status=overall,
                critical_items_count=critical_count,
                inventory=node_inventory
            )
        )

    return results

@router.get("/indents/pending")
def get_pending_indents(db: Session = Depends(get_db)):
    """Returns all automated replenish indents triggered by low DOS."""
    indents = db.query(IndentRequest).all()
    results = []
    for ind in indents:
        node = db.query(MilitaryNode).filter(MilitaryNode.node_id == ind.node_id).first()
        item = db.query(SupplyItem).filter(SupplyItem.item_id == ind.item_id).first()
        results.append({
            "indent_id": ind.indent_id,
            "node_id": ind.node_id,
            "node_name": node.name if node else ind.node_id,
            "item_id": ind.item_id,
            "item_name": item.name if item else ind.item_id,
            "requested_qty": ind.requested_qty,
            "priority": ind.priority,
            "status": ind.status,
            "trigger_dos": ind.trigger_dos,
            "created_at": ind.created_at.isoformat()
        })
    return results

@router.post("/indents/authorize")
def authorize_indent(payload: IndentAuthorizeRequest, db: Session = Depends(get_db)):
    """Authorizes replenishment indent and signs event into the Cryptographic Audit Ledger."""
    indent = db.query(IndentRequest).filter(IndentRequest.indent_id == payload.indent_id).first()
    if not indent:
        raise HTTPException(status_code=404, detail="Indent request not found")

    indent.status = "AUTHORIZED"
    db.commit()

    # Append to SHA-256 Audit Trail
    audit_entry = append_audit_entry(
        db=db,
        action_type="INDENT_AUTHORIZE",
        user_id=payload.authorized_by,
        details={
            "indent_id": indent.indent_id,
            "node_id": indent.node_id,
            "item_id": indent.item_id,
            "qty_authorized": indent.requested_qty,
            "assigned_convoy": payload.convoy_callsign
        }
    )

    return {
        "status": "AUTHORIZED",
        "indent_id": indent.indent_id,
        "assigned_convoy": payload.convoy_callsign,
        "audit_id": audit_entry.audit_id,
        "sha256_hash": audit_entry.current_hash,
        "message": f"Replenishment indent {indent.indent_id} authorized. Convoy dispatched from Base Depot."
    }
