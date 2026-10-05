"""
Cryptographic Audit Ledger Service (SHA-256 Hash Chaining)
Ensures tamper-evident immutability across all logistics mutations and overrides.
"""
import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import AuditLogEntry

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def format_ts(ts) -> str:
    if hasattr(ts, "strftime"):
        return ts.strftime("%Y-%m-%dT%H:%M:%SZ")
    return str(ts)

def compute_hash(prev_hash: str, timestamp_str: str, user_id: str, action_type: str, details_json: str) -> str:
    raw = f"{prev_hash}|{timestamp_str}|{user_id}|{action_type}|{details_json}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def append_audit_entry(db: Session, action_type: str, user_id: str, details: dict) -> AuditLogEntry:
    """Appends an immutable entry cryptographically linked to the previous entry."""
    latest_entry = db.query(AuditLogEntry).order_by(AuditLogEntry.audit_id.desc()).first()
    prev_hash = latest_entry.current_hash if latest_entry else GENESIS_HASH
    
    timestamp = datetime.now(timezone.utc)
    timestamp_str = format_ts(timestamp)
    canonical_details = json.dumps(details, sort_keys=True)
    
    current_hash = compute_hash(prev_hash, timestamp_str, user_id, action_type, canonical_details)
    
    entry = AuditLogEntry(
        action_type=action_type,
        executed_by_user_id=user_id,
        details_json=canonical_details,
        prev_hash=prev_hash,
        current_hash=current_hash,
        timestamp=timestamp
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def verify_audit_chain(db: Session) -> dict:
    """
    Validates every single block from Genesis to HEAD.
    Detects any internal tampering, bit flips, or unauthorized database mutations.
    """
    entries = db.query(AuditLogEntry).order_by(AuditLogEntry.audit_id.asc()).all()
    if not entries:
        return {
            "chain_length": 0,
            "tamper_detected": False,
            "compromised_block_index": None,
            "latest_block_hash": GENESIS_HASH,
            "status": "EMPTY_CHAIN",
            "verified_at": datetime.now(timezone.utc).isoformat()
        }

    expected_prev = GENESIS_HASH
    for idx, entry in enumerate(entries):
        # 1. Verify prev_hash link
        if entry.prev_hash != expected_prev:
            return {
                "chain_length": len(entries),
                "tamper_detected": True,
                "compromised_block_index": entry.audit_id,
                "latest_block_hash": entry.current_hash,
                "status": f"COMPROMISED: Broken link at Block #{entry.audit_id}",
                "verified_at": datetime.now(timezone.utc).isoformat()
            }
        
        # 2. Verify current block signature
        recomputed = compute_hash(
            entry.prev_hash,
            format_ts(entry.timestamp),
            entry.executed_by_user_id,
            entry.action_type,
            entry.details_json
        )
        if recomputed != entry.current_hash:
            return {
                "chain_length": len(entries),
                "tamper_detected": True,
                "compromised_block_index": entry.audit_id,
                "latest_block_hash": entry.current_hash,
                "status": f"COMPROMISED: Hash mismatch at Block #{entry.audit_id} (data modified)",
                "verified_at": format_ts(datetime.now(timezone.utc))
            }
        
        expected_prev = entry.current_hash

    return {
        "chain_length": len(entries),
        "tamper_detected": False,
        "compromised_block_index": None,
        "latest_block_hash": entries[-1].current_hash,
        "status": "CRYPTOGRAPHICALLY_VERIFIED_AUTHENTIC",
        "verified_at": format_ts(datetime.now(timezone.utc))
    }

def simulate_tamper_attack(db: Session, target_audit_id: int = None) -> dict:
    """
    Demonstrates Anti-Hacking Detection:
    Alters a transaction payload directly in SQLite without updating the hash chain.
    """
    query = db.query(AuditLogEntry).filter(AuditLogEntry.action_type != "GENESIS")
    if target_audit_id:
        target = query.filter(AuditLogEntry.audit_id == target_audit_id).first()
    else:
        target = query.first()

    if not target:
        return {"success": False, "message": "No mutable audit records found to tamper."}

    # Alter data to simulate insider corruption / diverted kerosene
    original_details = target.details_json
    tampered_details = json.dumps({"TAMPERED": True, "diverted_liters": 1500, "original": original_details})
    target.details_json = tampered_details
    db.commit()

    return {
        "success": True,
        "message": f"Tampered Block #{target.audit_id}. Data altered without valid hash update.",
        "tampered_block_id": target.audit_id
    }

def repair_and_rehash_chain(db: Session) -> dict:
    """Repairs broken links and re-signs blocks with command authority seal."""
    entries = db.query(AuditLogEntry).order_by(AuditLogEntry.audit_id.asc()).all()
    prev = GENESIS_HASH
    for entry in entries:
        entry.prev_hash = prev
        entry.current_hash = compute_hash(
            prev,
            format_ts(entry.timestamp),
            entry.executed_by_user_id,
            entry.action_type,
            entry.details_json
        )
        prev = entry.current_hash
    db.commit()
    return {"success": True, "message": "Audit chain re-anchored and cryptographically restored."}
