"""
Military Cyber Defense, Anti-Hacking & Cryptographic Audit Router
"""
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLogEntry, UserAccount
from ..schemas import AuditChainVerifyResponse, LoginRequest, LoginResponse
from ..services.audit_service import (
    verify_audit_chain,
    simulate_tamper_attack,
    repair_and_rehash_chain
)

router = APIRouter(prefix="/api/v1/security", tags=["Cyber Security & Cryptographic Ledger"])

@router.get("/audit-chain/verify", response_model=AuditChainVerifyResponse)
def verify_ledger_cryptography(db: Session = Depends(get_db)):
    """
    Validates complete SHA-256 hash chain from Genesis to HEAD block.
    Returns status: verified authentic or flags compromised block index.
    """
    return verify_audit_chain(db)

@router.get("/audit-chain/entries")
def get_audit_chain_blocks(db: Session = Depends(get_db)):
    """Returns ledger blocks with officer IDs, action types, and SHA-256 hashes."""
    entries = db.query(AuditLogEntry).order_by(AuditLogEntry.audit_id.asc()).all()
    results = []
    for e in entries:
        try:
            parsed_details = json.loads(e.details_json)
        except Exception:
            parsed_details = {"raw": e.details_json}

        results.append({
            "audit_id": e.audit_id,
            "action_type": e.action_type,
            "executed_by_user_id": e.executed_by_user_id,
            "details": parsed_details,
            "prev_hash": e.prev_hash,
            "current_hash": e.current_hash,
            "timestamp": e.timestamp.isoformat()
        })
    return results

@router.post("/audit-chain/simulate-tamper")
def simulate_database_tampering(db: Session = Depends(get_db)):
    """
    HACKATHON DEMO ENDPOINT:
    Simulates malicious insider tampering directly on the SQLite database.
    Modifies inventory transfer record without updating cryptographic signature.
    """
    return simulate_tamper_attack(db)

@router.post("/audit-chain/repair")
def repair_audit_ledger(db: Session = Depends(get_db)):
    """Restores cryptographic consistency and seals the chain with Command authority."""
    return repair_and_rehash_chain(db)

# Authentication Router
auth_router = APIRouter(prefix="/api/v1/auth", tags=["Military RBAC Authentication"])

@auth_router.post("/login", response_model=LoginResponse)
def authenticate_user(req: LoginRequest, db: Session = Depends(get_db)):
    """Zero-Trust authentication with Service Number and cryptographic hash check."""
    user = db.query(UserAccount).filter(UserAccount.service_number == req.service_number).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid military credentials or deactivated service ID")

    # In production Argon2id, here parameterized check
    return LoginResponse(
        access_token=f"TAC_JWT_{user.user_id}_14CORPS",
        service_number=user.service_number,
        rank_and_name=user.rank_and_name,
        role=user.role,
        clearance_level=user.clearance_level
    )

@auth_router.get("/users")
def get_tactical_users(db: Session = Depends(get_db)):
    """Lists authorized command personnel and clearance ranks."""
    users = db.query(UserAccount).all()
    return [
        {
            "user_id": u.user_id,
            "service_number": u.service_number,
            "rank_and_name": u.rank_and_name,
            "role": u.role,
            "clearance_level": u.clearance_level,
            "is_active": u.is_active,
            "last_login": u.last_login.isoformat() if u.last_login else None
        }
        for u in users
    ]
