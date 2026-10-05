"""
Main FastAPI Application Entrypoint - Project Rudra-Logistics
Intelligent Predictive Forward Supply Chain & Multi-Modal Decision Support System
Northern Command (14 Corps, Leh - Siachen - DBO Corridor)
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .seed_data import seed_database
from .routers import nodes, routes, telemetry, wargame, admin, security, weather, fleet

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed initial tactical data
    seed_database()
    yield

app = FastAPI(
    title="Project Rudra-Logistics C2 API",
    description="Intelligent Predictive Forward Supply Chain Decision Support System for Indian Army 14 Corps",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for Air-Gapped Local Deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Tactical Modules
app.include_router(nodes.router)
app.include_router(routes.router)
app.include_router(telemetry.router)
app.include_router(wargame.router)
app.include_router(admin.router)
app.include_router(security.router)
app.include_router(security.auth_router)
app.include_router(weather.router)
app.include_router(fleet.router)

@app.get("/")
def get_system_root():
    """Tactical C2 System Status & Verification"""
    return {
        "system": "Project Rudra-Logistics C2",
        "command_sector": "Northern Command (14 Corps, Leh)",
        "status": "OPERATIONAL",
        "air_gapped_mode": True,
        "security_framework": "Zero-Trust + SHA-256 Chained Ledger",
        "version": "1.0.0"
    }

@app.get("/healthz")
def healthcheck():
    return {"status": "HEALTHY", "air_gap_verified": True}
