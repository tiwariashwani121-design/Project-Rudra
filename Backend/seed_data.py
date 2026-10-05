"""
Database Seed Data for Project Rudra-Logistics
Populates realistic military data for Northern Command (14 Corps Leh-Siachen Corridor)
"""
import hashlib
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import (
    MilitaryNode, SupplyItem, InventoryStock, PassStatus, Convoy,
    UserAccount, AuditLogEntry, SystemParameter, IndentRequest
)
from .services.audit_service import compute_hash, GENESIS_HASH, format_ts

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(MilitaryNode).first():
            return

        print("[INIT] Seeding Northern Command 14 Corps Logistics Data...")

        # 1. Military Nodes
        nodes = [
            MilitaryNode(
                node_id="BASE_LEH_DEPOT",
                name="Leh Central Base Logistics Depot",
                node_type="BASE_DEPOT",
                latitude=34.1526,
                longitude=77.5771,
                altitude_feet=11500,
                troop_count=1200,
                threat_level="PEACE",
                ambient_temp_c=-12.0
            ),
            MilitaryNode(
                node_id="CP_SOUTH_PULLU",
                name="South Pullu Checkpoint",
                node_type="CHECKPOINT",
                latitude=34.2381,
                longitude=77.6189,
                altitude_feet=15300,
                troop_count=150,
                threat_level="PEACE",
                ambient_temp_c=-18.0
            ),
            MilitaryNode(
                node_id="CP_NORTH_PULLU",
                name="North Pullu Transit Post",
                node_type="CHECKPOINT",
                latitude=34.3321,
                longitude=77.6321,
                altitude_feet=15100,
                troop_count=120,
                threat_level="PEACE",
                ambient_temp_c=-19.0
            ),
            MilitaryNode(
                node_id="FLD_PARTAPUR",
                name="Partapur Forward Logistics Depot",
                node_type="TRANSIT_DEPOT",
                latitude=34.6644,
                longitude=77.6258,
                altitude_feet=10200,
                troop_count=650,
                threat_level="PEACE",
                ambient_temp_c=-14.0
            ),
            MilitaryNode(
                node_id="FOP_SIACHEN_BASE",
                name="Siachen Base Camp (FOP)",
                node_type="FORWARD_POST",
                latitude=35.2008,
                longitude=77.1264,
                altitude_feet=12000,
                troop_count=420,
                threat_level="HEIGHTENED",
                ambient_temp_c=-28.5
            ),
            MilitaryNode(
                node_id="FOP_TURTUK",
                name="Turtuk Forward Post (LOC)",
                node_type="FORWARD_POST",
                latitude=34.8465,
                longitude=76.8294,
                altitude_feet=9900,
                troop_count=250,
                threat_level="PEACE",
                ambient_temp_c=-10.0
            ),
            MilitaryNode(
                node_id="FOP_DBO",
                name="Daulat Beg Oldi - DBO Strategic Post",
                node_type="FORWARD_POST",
                latitude=35.4012,
                longitude=77.9254,
                altitude_feet=16600,
                troop_count=310,
                threat_level="HEIGHTENED",
                ambient_temp_c=-32.0
            )
        ]
        db.add_all(nodes)
        db.commit()

        # 2. Mountain Passes
        passes = [
            PassStatus(
                pass_id="PASS_KHARDUNG_LA",
                name="Khardung La Pass (17,982 ft)",
                latitude=34.2787,
                longitude=77.6047,
                altitude_feet=17982,
                is_blocked=False,
                hazard_reason="CLEAR",
                hazard_score=20.0
            ),
            PassStatus(
                pass_id="PASS_CHANG_LA",
                name="Chang La Pass (17,688 ft)",
                latitude=34.0478,
                longitude=77.9304,
                altitude_feet=17688,
                is_blocked=False,
                hazard_reason="CLEAR",
                hazard_score=35.0
            )
        ]
        db.add_all(passes)
        db.commit()

        # 3. Supply Items across 4 Army Classes
        items = [
            SupplyItem(
                item_id="ITEM_CLASS_I_RATIONS",
                name="High Altitude Rations (RTE & Dry)",
                supply_class="CLASS_I",
                unit_of_measure="PACKETS",
                base_consumption_per_soldier_day=1.0,
                is_cold_chain_required=False
            ),
            SupplyItem(
                item_id="ITEM_POL_KEROSENE",
                name="Kerosene Bukharis Heating Grade",
                supply_class="CLASS_III",
                unit_of_measure="LITERS",
                base_consumption_per_soldier_day=1.2,  # Multiplied by cold
                is_cold_chain_required=False
            ),
            SupplyItem(
                item_id="ITEM_POL_DIESEL",
                name="High-Speed Winterized Diesel (HSD)",
                supply_class="CLASS_III",
                unit_of_measure="LITERS",
                base_consumption_per_soldier_day=0.8,
                is_cold_chain_required=False
            ),
            SupplyItem(
                item_id="ITEM_CLASS_V_AMMO",
                name="5.56mm INSAS / 7.62mm Small Arms Ammo",
                supply_class="CLASS_V",
                unit_of_measure="ROUNDS",
                base_consumption_per_soldier_day=3.0,
                is_cold_chain_required=False
            ),
            SupplyItem(
                item_id="ITEM_CLASS_VIII_MEDICAL",
                name="Class VIII Medical Cold-Chain (Blood Plasma / Frostbite)",
                supply_class="CLASS_VIII",
                unit_of_measure="UNITS",
                base_consumption_per_soldier_day=0.1,
                is_cold_chain_required=True,
                min_safe_temp=2.0,
                max_safe_temp=8.0
            )
        ]
        db.add_all(items)
        db.commit()

        # 4. Inventory Stocks (Simulate Critical Red at Siachen Base Camp to demonstrate pivot)
        stocks = [
            # Siachen Base Camp (CRITICAL KEROSENE SHORTAGE: 4.1 DOS)
            InventoryStock(stock_id="STK_SIA_KEROSENE", node_id="FOP_SIACHEN_BASE", item_id="ITEM_POL_KEROSENE", current_quantity=4800.0, safety_threshold_qty=6000.0, days_of_supply_dos=4.1),
            InventoryStock(stock_id="STK_SIA_RATIONS", node_id="FOP_SIACHEN_BASE", item_id="ITEM_CLASS_I_RATIONS", current_quantity=8400.0, safety_threshold_qty=4200.0, days_of_supply_dos=20.0),
            InventoryStock(stock_id="STK_SIA_AMMO", node_id="FOP_SIACHEN_BASE", item_id="ITEM_CLASS_V_AMMO", current_quantity=14200.0, safety_threshold_qty=8000.0, days_of_supply_dos=8.5),
            InventoryStock(stock_id="STK_SIA_MED", node_id="FOP_SIACHEN_BASE", item_id="ITEM_CLASS_VIII_MEDICAL", current_quantity=280.0, safety_threshold_qty=150.0, days_of_supply_dos=6.6),

            # Daulat Beg Oldi (DBO)
            InventoryStock(stock_id="STK_DBO_KEROSENE", node_id="FOP_DBO", item_id="ITEM_POL_KEROSENE", current_quantity=18500.0, safety_threshold_qty=6000.0, days_of_supply_dos=19.2),
            InventoryStock(stock_id="STK_DBO_RATIONS", node_id="FOP_DBO", item_id="ITEM_CLASS_I_RATIONS", current_quantity=6200.0, safety_threshold_qty=3100.0, days_of_supply_dos=20.0),
            InventoryStock(stock_id="STK_DBO_AMMO", node_id="FOP_DBO", item_id="ITEM_CLASS_V_AMMO", current_quantity=22000.0, safety_threshold_qty=10000.0, days_of_supply_dos=18.0),
            InventoryStock(stock_id="STK_DBO_MED", node_id="FOP_DBO", item_id="ITEM_CLASS_VIII_MEDICAL", current_quantity=410.0, safety_threshold_qty=200.0, days_of_supply_dos=13.2),

            # Turtuk Post
            InventoryStock(stock_id="STK_TUR_KEROSENE", node_id="FOP_TURTUK", item_id="ITEM_POL_KEROSENE", current_quantity=9200.0, safety_threshold_qty=4000.0, days_of_supply_dos=18.5),
            InventoryStock(stock_id="STK_TUR_RATIONS", node_id="FOP_TURTUK", item_id="ITEM_CLASS_I_RATIONS", current_quantity=5000.0, safety_threshold_qty=2500.0, days_of_supply_dos=20.0),
            InventoryStock(stock_id="STK_TUR_AMMO", node_id="FOP_TURTUK", item_id="ITEM_CLASS_V_AMMO", current_quantity=18000.0, safety_threshold_qty=5000.0, days_of_supply_dos=24.0),
            InventoryStock(stock_id="STK_TUR_MED", node_id="FOP_TURTUK", item_id="ITEM_CLASS_VIII_MEDICAL", current_quantity=320.0, safety_threshold_qty=100.0, days_of_supply_dos=12.8),

            # Partapur Forward Depot (Staging Reserve)
            InventoryStock(stock_id="STK_PAR_KEROSENE", node_id="FLD_PARTAPUR", item_id="ITEM_POL_KEROSENE", current_quantity=65000.0, safety_threshold_qty=20000.0, days_of_supply_dos=35.0),
            InventoryStock(stock_id="STK_PAR_RATIONS", node_id="FLD_PARTAPUR", item_id="ITEM_CLASS_I_RATIONS", current_quantity=45000.0, safety_threshold_qty=15000.0, days_of_supply_dos=42.0),
            InventoryStock(stock_id="STK_PAR_AMMO", node_id="FLD_PARTAPUR", item_id="ITEM_CLASS_V_AMMO", current_quantity=120000.0, safety_threshold_qty=40000.0, days_of_supply_dos=61.0),
            InventoryStock(stock_id="STK_PAR_MED", node_id="FLD_PARTAPUR", item_id="ITEM_CLASS_VIII_MEDICAL", current_quantity=2200.0, safety_threshold_qty=800.0, days_of_supply_dos=33.0),

            # Leh Central Base (Command Hub)
            InventoryStock(stock_id="STK_LEH_KEROSENE", node_id="BASE_LEH_DEPOT", item_id="ITEM_POL_KEROSENE", current_quantity=450000.0, safety_threshold_qty=100000.0, days_of_supply_dos=90.0),
            InventoryStock(stock_id="STK_LEH_RATIONS", node_id="BASE_LEH_DEPOT", item_id="ITEM_CLASS_I_RATIONS", current_quantity=300000.0, safety_threshold_qty=80000.0, days_of_supply_dos=90.0),
            InventoryStock(stock_id="STK_LEH_AMMO", node_id="BASE_LEH_DEPOT", item_id="ITEM_CLASS_V_AMMO", current_quantity=800000.0, safety_threshold_qty=200000.0, days_of_supply_dos=90.0),
            InventoryStock(stock_id="STK_LEH_MED", node_id="BASE_LEH_DEPOT", item_id="ITEM_CLASS_VIII_MEDICAL", current_quantity=15000.0, safety_threshold_qty=3000.0, days_of_supply_dos=90.0)
        ]
        db.add_all(stocks)
        db.commit()

        # 5. Pending Smart Indent (Siachen Kerosene is <= 5 DOS)
        indent = IndentRequest(
            indent_id="IND_14C_SIA_001",
            node_id="FOP_SIACHEN_BASE",
            item_id="ITEM_POL_KEROSENE",
            requested_qty=8500.0,
            priority="URGENT",
            status="PENDING_AUTHORIZATION",
            trigger_dos=4.1
        )
        db.add(indent)
        db.commit()

        # 6. Active Convoy: Stallion Alpha
        convoy = Convoy(
            convoy_id="CNV_14C_08",
            call_sign="STALLION ALPHA",
            origin_node_id="BASE_LEH_DEPOT",
            destination_node_id="FLD_PARTAPUR",
            status="EN_ROUTE",
            assigned_route_id="AXIS_1_PRIMARY",
            vehicle_count=8,
            vehicle_type="STALLION_HEAVY_4X4",
            total_payload_tonnes=14.5,
            cargo_type="CLASS_VIII_BLOOD_PLASMA",
            current_lat=34.2100,
            current_lon=77.6050,
            speed_kmh=34.0,
            fuel_level_pct=85.0,
            cargo_temp_celsius=4.2,
            is_spoofed=False
        )
        db.add(convoy)
        db.commit()

        # 7. Default Tactical Users
        users = [
            UserAccount(
                user_id="USR_ADMIN_01",
                service_number="IC-48291M",
                rank_and_name="Col Rajeshwar Sen (Col Q)",
                role="ADMIN",
                password_hash="rudra_secret_pass_hash_14c",
                clearance_level="TOP_SECRET"
            ),
            UserAccount(
                user_id="USR_CMD_01",
                service_number="IC-52109P",
                rank_and_name="Lt Col A K Sharma (HQ 14 Corps)",
                role="COMMANDER",
                password_hash="rudra_secret_pass_hash_14c",
                clearance_level="SECRET"
            ),
            UserAccount(
                user_id="USR_QM_01",
                service_number="JC-782103K",
                rank_and_name="Subedar Major Gurmeet Singh",
                role="QUARTERMASTER",
                password_hash="rudra_secret_pass_hash_14c",
                clearance_level="CONFIDENTIAL"
            )
        ]
        db.add_all(users)
        db.commit()

        # 8. Operational Parameters
        params = [
            SystemParameter(param_key="BUKHARI_HEATING_BURN_RATE_MULTIPLIER", param_value=1.0, unit="multiplier", description="Global heating fuel consumption multiplier"),
            SystemParameter(param_key="ALTITUDE_FUEL_PENALTY_PCT", param_value=15.0, unit="percent", description="Engine efficiency loss per 3,000 ft ascent"),
            SystemParameter(param_key="SAFETY_STOCK_BUFFER_DAYS", param_value=7.0, unit="days", description="Minimum reserve before automatic indent triggers")
        ]
        db.add_all(params)
        db.commit()

        # 9. Genesis Block for Cryptographic Audit Ledger
        genesis_time = datetime.now(timezone.utc)
        genesis_time_str = format_ts(genesis_time)
        genesis_details = '{"event": "GENESIS_ROOT", "network": "14_CORPS_TACTICAL_MESH", "status": "AIR_GAPPED_INITIALIZED"}'
        genesis_hash = compute_hash(GENESIS_HASH, genesis_time_str, "SYSTEM_ROOT", "GENESIS", genesis_details)

        audit_genesis = AuditLogEntry(
            action_type="GENESIS",
            executed_by_user_id="SYSTEM_ROOT",
            details_json=genesis_details,
            prev_hash=GENESIS_HASH,
            current_hash=genesis_hash,
            timestamp=genesis_time
        )
        db.add(audit_genesis)
        db.commit()

        # Add initial sample audit events
        sample_details = '{"action": "INITIAL_STOCK_AUDIT_VERIFIED", "depots_checked": 5}'
        audit_sample = AuditLogEntry(
            action_type="SYSTEM_BOOT",
            executed_by_user_id="COL_RAJESHWAR_SEN",
            details_json=sample_details,
            prev_hash=genesis_hash,
            current_hash=compute_hash(genesis_hash, genesis_time_str, "COL_RAJESHWAR_SEN", "SYSTEM_BOOT", sample_details),
            timestamp=genesis_time
        )
        db.add(audit_sample)
        db.commit()

        print("[INIT] Database initialized with Northern Command tactical datasets.")
    finally:
        db.close()
