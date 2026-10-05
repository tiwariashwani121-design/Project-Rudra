# Product Requirements Document (PRD)

## Project Title: Project Rudra-Logistics
**Subtitle:** Intelligent Predictive Forward Supply Chain & Multi-Modal Logistics Decision Support System  
**Problem Statement ID:** 26251  
**Target Organization:** Indian Army (Army Service Corps / Army Ordnance Corps)  
**Primary Strategic Sector:** Northern Command (14 Corps, Leh – Nubra – Siachen – DBO Corridor)

---

## 1. Executive Summary & Problem Context
Forward posts of the Indian Army operating in high-altitude terrain (Ladakh, Siachen, Arunachal Pradesh) face severe operational logistics constraints. Rations, Petroleum-Oil-Lubricants (POL), ammunition, and critical medical supplies must travel through high-altitude passes that are vulnerable to sudden blizzards, avalanches, and landslides.

Currently, supply operations rely on fragmented communication channels, manual indenting registers, and siloed depot data. Logistics response is predominantly **reactive** rather than **predictive**. 

**Project Rudra-Logistics** provides a single unified military Common Operating Picture (COP) that:
1. Predicts supply demand 15 to 45 days in advance using weather and threat intelligence.
2. Tracks Days of Supplies (DOS) per forward post in real time.
3. Automatically computes multi-modal detour routes when Himalayan passes are blocked.
4. Monitors IoT cargo conditions (fuel levels, cold-chain temperature for blood/plasma/vaccines).
5. Provides an air-gapped, offline-first tactical decision system for military commanders.

---

## 2. Target User Personas

| Persona | Role | Key Goal / Pain Point |
|---|---|---|
| **Brigadier Logistics / Col Q (Command HQ)** | High-level decision maker | Needs macro visibility across all Northern Command depots; needs to ensure winter stocking goals are met before pass closures. |
| **Convoy Commander (Transit Base)** | Tactical movement leader | Needs real-time route clearance, avalanche hazard alerts, and alternative bypass routes. |
| **Forward Post Quartermaster (JCO/NCO)** | End-post supply manager | Needs automated replenishment requests before critical supplies (especially heating kerosene and ammo) drop below safety margins. |

---

## 3. Supply Classes In-Scope

- **Class I (Rations):** Fresh provisions, dry rations, high-altitude ready-to-eat (RTE) ration packs, drinking water.
- **Class III (POL - Petroleum, Oil, Lubricants):** Kerosene (Bukharis heating), High-Speed Diesel (ALS/Stallion fleet), Aviation Turbine Fuel (ALH/Cheetah helos).
- **Class V (Ammunition):** Small arms rounds (5.56mm INSAS/AK), 81mm mortar bombs, artillery rounds.
- **Class VIII (Medical Cold-Chain):** Frostbite treatment units, blood plasma, oxygen cylinders, emergency life-saving anti-venom/vaccines.

---

## 4. Functional Requirements (FR)

### FR-1: AI-Driven Multi-Factor Demand Forecasting
- **FR-1.1:** System shall ingest historical daily consumption, troop strength, forecasted ambient temperature (-40°C to +30°C), altitude, and Operational Readiness State (PEACE, HEIGHTENED, ACTIVE).
- **FR-1.2:** System shall forecast daily and 15-day aggregate demand for Class I, III, V, and VIII supplies per outpost.
- **FR-1.3:** System shall calculate **Days of Supplies (DOS)**:
  $$\text{DOS} = \frac{\text{Current Available Inventory}}{\text{Predicted Daily Consumption Rate}}$$
- **FR-1.4:** System shall classify posts into three alert tiers:
  - 🔴 **CRITICAL RED:** $\text{DOS} \le 5\text{ days}$
  - 🟡 **WARNING AMBER:** $5\text{ days} < \text{DOS} \le 15\text{ days}$
  - 🟢 **OPTIMAL GREEN:** $\text{DOS} > 15\text{ days}$

### FR-2: GIS-Enabled Multi-Modal Route Optimization
- **FR-2.1:** Maintain geospatial coordinates and digital elevation maps for the Leh-Nubra-Siachen axis.
- **FR-2.2:** Dynamic Roadblock Simulator: Allow dispatchers to flag passes (e.g., Khardung La, Chang La) as BLOCKED due to snow/landslide.
- **FR-2.3:** System shall automatically calculate least-hazard alternative routes with updated travel times, fuel consumption, and gradient profiles.
- **FR-2.4:** Support multi-modal handoffs: Heavy Truck (Stallion) $\rightarrow$ Light 4x4 (ALS) $\rightarrow$ Heavy-Lift Drone / Rotary Wing $\rightarrow$ Mules/Porters.

### FR-3: IoT Telemetry & Cold-Chain Monitoring
- **FR-3.1:** Ingest real-time telemetry from convoy vehicles: GPS position, speed, payload weight, vehicle fuel level.
- **FR-3.2:** Cold-chain monitoring for Class VIII medical cargo: Trigger audible and visual alarms if temperature drifts outside safe limits (+2°C to +8°C).
- **FR-3.3:** Bulk POL storage monitoring: Continuous ultrasonic level sensing in depot tanks to detect leaks or rapid depletion.

### FR-4: Automated Smart Indenting (Replenishment Workflow)
- **FR-4.1:** When any outpost hits $\text{DOS} \le 7\text{ days}$, the system automatically drafts an **Urgent Logistics Indent**.
- **FR-4.2:** Commander can approve the indent with a single click (`AUTHORIZE DISPATCH`), allocating available trucks from the nearest depot.

### FR-5: "What-If" War-Gaming & Mobilization Sandbox
- **FR-5.1:** Allow commanders to simulate stress scenarios via sliders:
  - Scenario A: Sudden troop mobilization (+30% to +100% personnel).
  - Scenario B: Sudden temperature drop to -35°C (Kerosene demand spike).
  - Scenario C: Main axis blocked for 10 consecutive days.
- **FR-5.2:** Graphically visualize how rapidly inventory depletes under simulated conditions and recommend proactive pre-positioning.

### FR-6: Master Admin & Operational Control Console
- **FR-6.1 (Master Parameter Controls):** Admin can override core operational multipliers (Bukhari fuel burn rates, altitude penalties, safety stock thresholds) across all depots.
- **FR-6.2 (Manual Pass & Convoy Override):** Force-toggle pass accessibility (OPEN / BLOCKED / CONVOY ONLY) and manually reassign or recall convoys.
- **FR-6.3 (Emergency Inventory Reconciliation):** Admin can inject emergency air-dropped stock or adjust physical audit discrepancies.
- **FR-6.4 (User & Role Provisioning):** Manage cryptographic credentials, roles, and operational clearance levels (Commander, Logistics Officer, Field Quartermaster, Auditor).

---

## 5. Non-Functional & Military Cyber-Defense Requirements (NFR)

- **NFR-1 (Air-Gapped & Offline Architecture):** System must run completely detached from the public internet using on-premise local servers and military LAN/radio-mesh.
- **NFR-2 (Latency):** Dynamic route recalculation must complete within $\le 3\text{ seconds}$.
- **NFR-3 (Reliability):** Telemetry ingest and alert dispatch must function with zero data loss over intermittent connectivity using local store-and-forward caching.
- **NFR-4 (Visual Usability):** Low-light, high-contrast Tactical Dark Theme complying with night-vision and operational command room ergonomics.
- **NFR-5 (Military Cyber-Defense & Anti-Hacking Architecture):**
  - **Zero-Trust Access Control (RBAC):** Strict least-privilege role separation. Every operational command requires signed token authentication with automated session invalidation.
  - **Anti-Tamper Cryptographic Audit Trail (SHA-256 Hash Chaining):** Every inventory adjustment, convoy dispatch, and pass override is hashed and chained into an immutable audit ledger to prevent insider sabotage or unauthorized inventory diversion.
  - **Telemetry Anomaly & GPS Spoofing Detection:** Behavioral heuristic engine flags abnormal telemetry spikes (e.g., impossible speed jumps, altitude inconsistencies, or unexpected coordinate teleports).
  - **Hardened Edge API Security:** AES-256 encrypted payload transfers, strict rate limiting to neutralize brute-force attacks, parameterized SQL queries preventing SQLi, and complete sanitized outputs eliminating XSS.

---

## 6. Success Metrics & KPIs for Hackathon Demonstration
1. **Accurate Forecasting:** Predicted vs. actual demand curve variance $\le 10\%$.
2. **Instant Re-routing:** Real-time demonstration of avalanche trigger $\rightarrow$ alternative route generated within 2 seconds.
3. **Telemetry Fidelity:** Live WebSocket stream showing moving convoy with active cold-chain temperature telemetry.
4. **Mission Impact:** Proactive warning generated at least 7 days before simulated stockout.
5. **Cyber Defense Demonstration:** Live demo of an unauthorized tampering attempt or spoofed GPS signal being instantly detected and flagged in the Cyber Security HUD.
