# Project Rudra-Logistics 🇮🇳
### Intelligent Predictive Forward Supply Chain & Multi-Modal Logistics Decision Support System
**Target Organization:** Indian Army (Army Service Corps / Army Ordnance Corps)  
**Primary Strategic Sector:** Northern Command (14 Corps, Leh – Nubra – Siachen – DBO Corridor)  
**Problem Statement ID:** 26251  

---

## 1. Executive Summary & Operational Context
Forward operating posts in high-altitude terrain (Siachen Glacier, DBO, Turtuk) face extreme sub-zero blizzards (-40°C), avalanches, and pass closures that suddenly sever ground supply corridors.

**Project Rudra-Logistics** delivers a unified, air-gapped military Common Operating Picture (COP) that:
1. **Predicts supply demand 15 to 45 days in advance** using non-linear thermodynamics for heating kerosene and threat multipliers for ammo/medical items.
2. **Tracks Days of Supplies (DOS)** in real-time across four army supply classes (Class I, III, V, VIII).
3. **Instantly computes multi-modal detour routes** when passes like Khardung La (17,982 ft) are blocked, re-routing via Chang La / Agham-Shyok.
4. **Streams IoT convoy telemetry & cold-chain monitoring** for Class VIII blood plasma/anti-venom (+2°C to +8°C).
5. **Enforces Military Cyber Defense** using a cryptographic SHA-256 hash-chained immutable audit ledger and kinematic GPS anti-spoofing heuristics.

---

## 2. System Architecture & Directory Structure

```
rudra_logistics/
├── Backend/
│   ├── main.py                     # FastAPI Application entrypoint & CORS config
│   ├── config.py                   # Military operational parameters & constants
│   ├── database.py                 # SQLite engine & session management
│   ├── models.py                   # SQLAlchemy schema (Nodes, Inventory, Convoys, Passes, Audits)
│   ├── schemas.py                  # Pydantic v2 validation schemas
│   ├── seed_data.py                # 14 Corps tactical dataset seeder with Genesis block
│   ├── data_generator.py           # 180-day seasonal synthetic consumption generator
│   ├── run.py                      # Uvicorn server launcher
│   ├── requirements.txt            # Python dependencies
│   ├── services/
│   │   ├── audit_service.py        # SHA-256 cryptographic hash-chaining ledger
│   │   ├── forecast_service.py     # Sub-zero thermodynamic burn rate & DOS calculation
│   │   ├── routing_service.py      # NetworkX GIS graph solver & avalanche rerouter
│   │   ├── telemetry_service.py    # Convoy GPS simulator & kinematic anti-spoofing filter
│   │   └── wargame_service.py      # 30-day mobilization & weather stress simulator
│   └── routers/
│       ├── nodes.py                # Outpost health & smart indent endpoints
│       ├── routes.py               # GIS routing & pass toggle endpoints
│       ├── telemetry.py            # WebSocket & REST telemetry streams
│       ├── wargame.py              # What-If war-gaming endpoints
│       ├── admin.py                # Master parameter overrides & stock injection
│       └── security.py             # Cyber defense, audit verify, tamper & repair
│
└── Frontend/
    ├── index.html                  # Air-gapped offline HTML container
    ├── package.json                # React 19, Vite, Tailwind CSS v4, Lucide
    ├── vite.config.js              # Vite bundler with API and WS proxy
    └── src/
        ├── main.jsx                # Application root mount
        ├── index.css               # Tactical dark theme, glow effects & HUD typography
        ├── App.jsx                 # Master C2 layout & tab coordination
        └── components/
            ├── HeaderHUD.jsx           # Military clocks (IST/Zulu), Defcon, threat toggles
            ├── TacticalMap.jsx         # Offline 3D vector GIS map with pass blockage switch
            ├── DOSStockMatrix.jsx      # Outpost inventory cards & critical shortage alerts
            ├── ConvoyTelemetryHUD.jsx  # Cold-chain IoT gauge & GPS spoof detection HUD
            ├── WarGamingSandbox.jsx    # Mobilization & temperature stress sliders
            ├── MasterAdminConsole.jsx  # Multipliers & emergency stock injection
            ├── CyberSecurityHUD.jsx    # SHA-256 ledger explorer with tamper simulator
            └── IndentModal.jsx         # One-click dispatch authorization modal
```

---

## 3. How to Run Locally

### Backend Server (FastAPI):
```bash
# Terminal 1 - In repository root:
python -m uvicorn Backend.main:app --host 127.0.0.1 --port 8000
```
- API Swagger Docs: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/healthz`

### Frontend Application (Vite + React):
```bash
# Terminal 2 - In Frontend directory:
cd Frontend
npm run dev
```
- Tactical Command Dashboard: `http://localhost:5173/`

---

## 4. Key Demonstration Workflows for Evaluators

1. **The Avalanche & Dynamic Rerouting Demonstration:**
   - On the Tactical Map, click **`Khardung La: 🟢 CLEAR`** to toggle it to **`🔴 BLOCKED`**.
   - The primary route instantly turns into a red dashed alert line.
   - The route solver automatically pivots to the **Agham-Shyok bypass corridor** and recalculates delay (+4.2 hrs) and fuel (+160 L).

2. **Electronic Warfare GPS Anti-Spoofing:**
   - In the IoT Convoy Telemetry HUD, click **`TEST GPS SPOOF ATTACK`**.
   - The kinematic heuristic engine immediately flags an impossible velocity jump (>90 km/h) or teleportation.
   - The HUD flashes **`⚠️ GPS EW SPOOF DETECTED`** and smoothly falls back to inertial dead reckoning.

3. **Tamper-Evident SHA-256 Cryptographic Audit Ledger:**
   - In the top header, click **`SHA-256 VERIFIED`** to open the Cyber Defense modal.
   - Click **`SIMULATE TAMPER ATTACK`**: the system alters an inventory transaction in the local database.
   - The verification shield immediately turns **🔴 RED ALERT: INTEGRITY COMPROMISE DETECTED (Hash mismatch at Block #2)**.
   - Click **`RE-SIGN CHAIN`** to restore cryptographic authority and re-seal the ledger.

4. **"What-If" War-Gaming Sandbox:**
   - Navigate to the **WAR-GAMING SANDBOX** tab.
   - Adjust the Temperature slider to `-35°C` and Troop Mobilization to `+50%`.
   - Watch the 30-day depletion curve recompute in real-time and recommend pre-positioning kerosene prior to pass freeze.
