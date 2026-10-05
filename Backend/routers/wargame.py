"""
What-If War-Gaming & Mobilization Sandbox Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import MilitaryNode, InventoryStock, SupplyItem
from ..schemas import WarGameSimulateRequest, WarGameSimulateResponse
from ..services.wargame_service import run_wargame_simulation

router = APIRouter(prefix="/api/v1/wargame", tags=["War-Gaming Sandbox"])

@router.post("/simulate", response_model=WarGameSimulateResponse)
def simulate_stress_scenario(req: WarGameSimulateRequest, db: Session = Depends(get_db)):
    """
    Executes What-If war game simulation for logistics commanders:
    - Temperature down to -40°C
    - Troop reinforcement +0% to +100%
    - Pass blockage duration 0 to 14 days
    Returns 30-day projected depletion curves and pre-positioning recommendation.
    """
    node = db.query(MilitaryNode).filter(MilitaryNode.node_id == req.target_node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Target node not found")

    # Find heating kerosene inventory
    stock = db.query(InventoryStock).filter(
        InventoryStock.node_id == req.target_node_id,
        InventoryStock.item_id == "ITEM_POL_KEROSENE"
    ).first()

    initial_stock = stock.current_quantity if stock else 4800.0

    item = db.query(SupplyItem).filter(SupplyItem.item_id == "ITEM_POL_KEROSENE").first()
    base_rate = item.base_consumption_per_soldier_day if item else 1.2

    result = run_wargame_simulation(
        target_node_id=node.node_id,
        target_node_name=node.name,
        initial_stock=initial_stock,
        base_troop_count=node.troop_count,
        base_rate_per_soldier=base_rate,
        temperature_drop_c=req.temperature_drop_c,
        troop_mobilization_pct=req.troop_mobilization_pct,
        pass_blockade_days=req.pass_blockade_days,
        threat_level=req.threat_level
    )

    return result

@router.get("/scenarios/presets")
def get_preset_scenarios():
    """Returns curated military tactical wargaming presets for quick evaluation."""
    return [
        {
            "id": "SCN_BLIZZARD_SIACHEN",
            "title": "Operation White Blizzard (Siachen Corridor)",
            "description": "Temperature plunges to -35°C, heating fuel consumption jumps by 240%, Khardung La pass blocked for 7 days.",
            "target_node_id": "FOP_SIACHEN_BASE",
            "temperature_drop_c": -35.0,
            "troop_mobilization_pct": 25.0,
            "pass_blockade_days": 7,
            "threat_level": "HEIGHTENED"
        },
        {
            "id": "SCN_MOBILIZATION_DBO",
            "title": "Eastern Ladakh Reinforcement Surge (DBO)",
            "description": "Forward strike battalion mobilizes (+60% personnel), heightened border vigilance, intense POL & ammo burn.",
            "target_node_id": "FOP_DBO",
            "temperature_drop_c": -28.0,
            "troop_mobilization_pct": 60.0,
            "pass_blockade_days": 4,
            "threat_level": "ACTIVE"
        },
        {
            "id": "SCN_AVALANCHE_EXTREME",
            "title": "Axis-Severing Catastrophic Landslide",
            "description": "Double pass closure on primary and secondary axes lasting 12 days. Evaluates rotary wing airdrop necessity.",
            "target_node_id": "FOP_SIACHEN_BASE",
            "temperature_drop_c": -30.0,
            "troop_mobilization_pct": 30.0,
            "pass_blockade_days": 12,
            "threat_level": "HEIGHTENED"
        }
    ]
