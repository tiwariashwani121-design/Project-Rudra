"""
SQLAlchemy Models for Project Rudra-Logistics
Fully aligned with Military Architecture Schema & Cryptographic Audit Requirements
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

def utc_now():
    return datetime.now(timezone.utc)

class MilitaryNode(Base):
    __tablename__ = "military_nodes"

    node_id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    node_type = Column(String(32), nullable=False)  # BASE_DEPOT, TRANSIT_DEPOT, FORWARD_POST, CHECKPOINT
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude_feet = Column(Float, nullable=False)
    troop_count = Column(Integer, default=100)
    threat_level = Column(String(32), default="PEACE")  # PEACE, HEIGHTENED, ACTIVE
    ambient_temp_c = Column(Float, default=-15.0)

    # Relationships
    inventory = relationship("InventoryStock", back_populates="node", cascade="all, delete-orphan")
    indents = relationship("IndentRequest", back_populates="node")

class SupplyItem(Base):
    __tablename__ = "supply_items"

    item_id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    supply_class = Column(String(32), nullable=False)  # CLASS_I, CLASS_III, CLASS_V, CLASS_VIII
    unit_of_measure = Column(String(32), nullable=False)  # LITERS, PACKETS, ROUNDS, UNITS
    base_consumption_per_soldier_day = Column(Float, default=1.0)
    is_cold_chain_required = Column(Boolean, default=False)
    min_safe_temp = Column(Float, nullable=True)
    max_safe_temp = Column(Float, nullable=True)

    # Relationships
    stocks = relationship("InventoryStock", back_populates="item")

class InventoryStock(Base):
    __tablename__ = "inventory_stocks"

    stock_id = Column(String(64), primary_key=True, index=True)
    node_id = Column(String(64), ForeignKey("military_nodes.node_id"), nullable=False)
    item_id = Column(String(64), ForeignKey("supply_items.item_id"), nullable=False)
    current_quantity = Column(Float, nullable=False, default=0.0)
    safety_threshold_qty = Column(Float, nullable=False, default=100.0)
    days_of_supply_dos = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    node = relationship("MilitaryNode", back_populates="inventory")
    item = relationship("SupplyItem", back_populates="stocks")

class PassStatus(Base):
    __tablename__ = "pass_statuses"

    pass_id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude_feet = Column(Float, nullable=False)
    is_blocked = Column(Boolean, default=False)
    hazard_reason = Column(String(128), default="CLEAR")  # CLEAR, BLIZZARD, AVALANCHE, ROCKFALL, MILITARY_ALERT
    hazard_score = Column(Float, default=15.0)  # 0 to 100
    last_updated = Column(DateTime, default=utc_now, onupdate=utc_now)

# Alias for backward/fleet compatibility
StrategicPass = PassStatus


class Convoy(Base):
    __tablename__ = "convoys"

    convoy_id = Column(String(64), primary_key=True, index=True)
    call_sign = Column(String(64), nullable=False)
    origin_node_id = Column(String(64), ForeignKey("military_nodes.node_id"), nullable=False)
    destination_node_id = Column(String(64), ForeignKey("military_nodes.node_id"), nullable=False)
    status = Column(String(32), default="EN_ROUTE")  # PLANNED, EN_ROUTE, DIVERTED, DELIVERED, HALTED
    assigned_route_id = Column(String(64), default="AXIS_1_PRIMARY")
    vehicle_count = Column(Integer, default=8)
    vehicle_type = Column(String(64), default="STALLION_4X4")  # STALLION_4X4, ALS_4X4, HELO_ALH
    total_payload_tonnes = Column(Float, default=14.5)
    cargo_type = Column(String(64), default="CLASS_VIII_COLD_CHAIN")
    current_lat = Column(Float, default=34.2000)
    current_lon = Column(Float, default=77.5900)
    speed_kmh = Column(Float, default=35.0)
    fuel_level_pct = Column(Float, default=82.0)
    cargo_temp_celsius = Column(Float, default=4.2)
    is_spoofed = Column(Boolean, default=False)
    dispatch_time = Column(DateTime, default=utc_now)
    eta = Column(DateTime, nullable=True)

    telemetry_logs = relationship("TelemetryLog", back_populates="convoy", cascade="all, delete-orphan")

class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    convoy_id = Column(String(64), ForeignKey("convoys.convoy_id"), nullable=False)
    current_lat = Column(Float, nullable=False)
    current_lon = Column(Float, nullable=False)
    speed_kmh = Column(Float, nullable=False)
    fuel_level_pct = Column(Float, nullable=False)
    cargo_temp_celsius = Column(Float, nullable=False)
    cold_chain_breach = Column(Boolean, default=False)
    spoof_detected = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=utc_now)

    convoy = relationship("Convoy", back_populates="telemetry_logs")

class IndentRequest(Base):
    __tablename__ = "indent_requests"

    indent_id = Column(String(64), primary_key=True, index=True)
    node_id = Column(String(64), ForeignKey("military_nodes.node_id"), nullable=False)
    item_id = Column(String(64), ForeignKey("supply_items.item_id"), nullable=False)
    requested_qty = Column(Float, nullable=False)
    priority = Column(String(32), default="URGENT")  # ROUTINE, PRIORITY, URGENT, FLASH
    status = Column(String(32), default="PENDING_AUTHORIZATION")  # PENDING_AUTHORIZATION, AUTHORIZED, DISPATCHED, REJECTED
    trigger_dos = Column(Float, default=4.5)
    created_at = Column(DateTime, default=utc_now)
    authorized_at = Column(DateTime, nullable=True)

    node = relationship("MilitaryNode", back_populates="indents")

class UserAccount(Base):
    __tablename__ = "user_accounts"

    user_id = Column(String(64), primary_key=True, index=True)
    service_number = Column(String(64), unique=True, nullable=False)
    rank_and_name = Column(String(128), nullable=False)
    role = Column(String(32), default="COMMANDER")  # ADMIN, COMMANDER, LOGISTICS_OFFICER, QUARTERMASTER, AUDITOR
    password_hash = Column(String(256), nullable=False)
    clearance_level = Column(String(32), default="TOP_SECRET")
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, default=utc_now)

class AuditLogEntry(Base):
    __tablename__ = "audit_log_entries"

    audit_id = Column(Integer, primary_key=True, autoincrement=True)
    action_type = Column(String(64), nullable=False)  # GENESIS, PARAM_OVERRIDE, PASS_TOGGLE, DISPATCH_AUTH, STOCK_ADJUST, TAMPER_EVENT
    executed_by_user_id = Column(String(64), nullable=False)
    details_json = Column(Text, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False)
    timestamp = Column(DateTime, default=utc_now)

class SystemParameter(Base):
    __tablename__ = "system_parameters"

    param_key = Column(String(64), primary_key=True, index=True)
    param_value = Column(Float, nullable=False)
    unit = Column(String(32), default="")
    description = Column(String(256), default="")
    last_modified_by = Column(String(64), default="SYSTEM_INIT")
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
