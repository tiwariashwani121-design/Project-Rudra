# Project Memory & Decisions Log

## Project: Project Rudra-Logistics
**Problem Statement ID:** 26251  
**Category:** Defence / AI-Driven Supply Chain & Spatial Logistics  
**Last Updated:** 2026-10-04  

---

## 1. Key Architectural & Strategic Decisions

### Decision 1: Target Operational Corridor Selection
- **Choice:** Northern Command (14 Corps) – Leh to Siachen Base Camp and Daulat Beg Oldi (DBO).
- **Rationale:** High-altitude warfare presents the most severe logistical challenges in the world. Demonstrating our solution on famous passes like Khardung La (17,982 ft) and Chang La instantly grounds the demo in realistic military context that Indian Army evaluators immediately recognize and respect.

### Decision 2: Air-Gapped & Offline Architecture
- **Choice:** Zero dependence on public cloud APIs (no Google Maps API, no commercial cloud AWS/GCP dependencies).
- **Rationale:** Military operations are strictly classified. Defense evaluators will reject any system that requires active internet connectivity or leaks GPS/inventory telemetry to commercial cloud endpoints. All maps run off local GeoJSON/vector tiles, and the backend runs on local FastAPI + SQLite/PostGIS.

### Decision 3: "Days of Supplies" (DOS) as the Core KPI
- **Choice:** Standardize all inventory health metrics around **DOS** rather than raw volume or monetary valuation.
- **Rationale:** Military quartermasters do not think in terms of dollar value; they need to know: *"How many days will our bukharis burn before the jawans freeze?"* Highlighting DOS gives the platform immediate operational authenticity.

### Decision 4: Master Admin Control Plane & Cryptographic Anti-Tamper
- **Choice:** Implement a dedicated Master Admin panel protected by Argon2id + Role-Based Access Control, backed by an immutable SHA-256 hash-chained audit ledger and kinematic GPS anti-spoofing detector.
- **Rationale:** Military logistics systems are prime targets for cyber-sabotage and internal corruption/pilferage. Adding cryptographic non-repudiation and anti-spoofing defense elevates the project from an academic hackathon prototype to a field-ready military solution.

---

## 2. Core Domain Formulas & Logic Rules

### 1. Days of Supplies (DOS):
$$\text{DOS} = \frac{\text{Current Inventory (Liters / Units)}}{\text{Forecasted Daily Burn Rate}}$$

### 2. Temperature Multiplier on Kerosene (Bukharis Heating):
- Ambient Temp $> 0^\circ\text{C}$: Multiplier = $1.0\times$ (Standard cooking)
- $-15^\circ\text{C} < \text{Temp} \le 0^\circ\text{C}$: Multiplier = $1.8\times$
- $-30^\circ\text{C} < \text{Temp} \le -15^\circ\text{C}$: Multiplier = $2.8\times$
- $\text{Temp} \le -30^\circ\text{C}$: Multiplier = $3.6\times$ (Continuous 24-hr bukhari operation)

### 3. Operational Threat Level Multiplier (Ammunition & Medical):
- `PEACE` (Routine peacetime patrol): Multiplier = $1.0\times$
- `HEIGHTENED` (Border standoff alert): Multiplier = $1.6\times$
- `ACTIVE` (Active border firing / skirmish): Multiplier = $4.0\times$ (High ammo expenditure and urgent trauma medical demand)

### 4. Dynamic Route Hazard Score:
$$\text{Hazard Score} = (\text{Slope Gradient} \times 0.3) + (\text{Snowfall Intensity} \times 0.4) + (\text{Avalanche History Risk} \times 0.3)$$
- If Pass Hazard $> 80 \rightarrow$ Route is automatically flagged as `UNSAFE / BLOCKED`, triggering automatic diversion.

---

## 3. High-Value Demonstration Script Anchors (For Hackathon Judges)

1. **The Shock & Pivot Demo:**
   - Start with healthy green dashboard.
   - Inject a live weather hazard: Khardung La hit by heavy blizzard (-32°C).
   - Show two simultaneous AI responses:
     - Kerosene demand at Siachen Base Camp triples, turning DOS gauge into **CRITICAL RED (3.1 Days)**.
     - GIS engine immediately recalculates alternate route via Agham-Shyok axis, adjusting convoy ETA.
2. **Cold-Chain Medical Integrity:**
   - Show live moving convoy carrying blood plasma.
   - Temperature gauge monitors cargo in real-time. If heater fails, alert triggers before life-saving plasma is ruined.
3. **What-If War-Gaming:**
   - Move the troop slider by +40% to demonstrate how logistics planners pre-position supplies before the harsh winter freeze cut-off.
4. **Anti-Hacking & Anti-Spoofing Defense:**
   - Trigger a simulated GPS spoofing event (convoy jumping at 120 km/h) -> The C2 HUD flags it with a purple warning and falls back to dead reckoning without losing convoy track.
   - Show the Cryptographic Audit Chain Explorer with a 100% verified SHA-256 seal.

---

## 4. Current State & Artifacts Created

| Artifact File | Path | Status |
|---|---|---|
| `prd.md` | `C:/Users/tiwar/rudra_logistics/prd.md` | ✅ Completed |
| `architecture.md` | `C:/Users/tiwar/rudra_logistics/architecture.md` | ✅ Completed |
| `rules.md` | `C:/Users/tiwar/rudra_logistics/rules.md` | ✅ Completed |
| `design.md` | `C:/Users/tiwar/rudra_logistics/design.md` | ✅ Completed |
| `task.md` | `C:/Users/tiwar/rudra_logistics/task.md` | ✅ Completed |
| `memory.md` | `C:/Users/tiwar/rudra_logistics/memory.md` | ✅ Completed |
