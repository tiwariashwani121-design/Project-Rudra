"""
IoT Telemetry Streaming & Anti-Spoofing Heuristic Router
"""
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..schemas import SpoofSimulationRequest, TelemetryPayload
from ..services.telemetry_service import telemetry_engine

router = APIRouter(tags=["IoT Telemetry & Anti-Spoofing"])

@router.get("/api/v1/telemetry/live", response_model=TelemetryPayload)
def get_live_telemetry_snapshot():
    """Returns single point-in-time telemetry snapshot for REST clients."""
    return telemetry_engine.step()

@router.post("/api/v1/telemetry/simulate-spoof")
def simulate_gps_spoofing(req: SpoofSimulationRequest):
    """
    Simulates Electronic Warfare (EW) GPS Spoofing injection.
    Tests kinematic plausibility heuristic (speed > 90 km/h or impossible coordinates).
    """
    telemetry_engine.trigger_spoof_event(
        enable=req.enable_spoof,
        lat=req.teleport_lat or 34.95,
        lon=req.teleport_lon or 78.40,
        speed=req.impossible_speed or 165.0
    )
    return {
        "status": "APPLIED",
        "spoof_active": req.enable_spoof,
        "message": (
            "GPS Spoofing signal injected. Kinematic heuristics will detect anomaly."
            if req.enable_spoof
            else "GPS Spoofing cleared. Telemetry returned to normal satellite lock."
        )
    }

@router.websocket("/ws/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    """
    Real-Time WebSocket stream broadcasting convoy coordinates, speed, fuel,
    and cold-chain temperature alerts every 2 seconds.
    """
    await websocket.accept()
    try:
        while True:
            # Advance simulation 1 tick
            data = telemetry_engine.step()
            await websocket.send_json(data)
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
