# UI/UX Tactical Design System

## Project: Project Rudra-Logistics
**Interface Style:** Military-Grade Tactical Command & Control (C2) HUD  
**Form Factor:** Responsive Desktop / Command Room Large Displays (1920x1080 minimum target)

---

## 1. Visual Design Philosophy & Aesthetics

The design of Project Rudra-Logistics avoids commercial e-commerce aesthetics. Instead, it mirrors modern military situational awareness systems (such as AFMS, C4ISR, and NATO Blue Force Trackers):

1. **Dark Matte Surfaces:** Deep slate and charcoal surfaces minimize glare and optical fatigue in low-light tactical command bunkers.
2. **High-Contrast Telemetry:** Crucial status indicators pop vividly against dark backgrounds with clear semantic coloring (Emerald, Amber, Crimson, Cyan).
3. **Information Density with Zero Clutter:** Every pixel conveys actionable operational data: coordinates, temperatures, Days of Supply, and convoy movement vectors.
4. **Monospaced Data Alignment:** All quantitative telemetry is rendered in monospaced fonts to ensure rapid, jitter-free reading by logistics staff.

---

## 2. Color Palette & Semantic Tokens

| Token Name | Hex Code | Tailwind Equivalent | Purpose / Usage |
|---|---|---|---|
| **Base Surface** | `#090d16` | `bg-slate-950` | Primary application canvas background |
| **Panel Surface** | `#0f172a` | `bg-slate-900` | Card, sidebar, and floating HUD modal background |
| **Border & Divider** | `#1e293b` | `border-slate-800` | Subtle boundaries between modular panels |
| **HUD Accent (Cyan)** | `#06b6d4` | `text-cyan-400` | Active filters, selected routes, GPS coordinates |
| **Tactical Olive** | `#4d7c0f` | `text-lime-700` | Military branding accents and secondary buttons |
| **Status Nominal (Green)** | `#10b981` | `text-emerald-400` | Healthy stock ($\text{DOS} > 15$), open pass, normal temp |
| **Status Warning (Amber)**| `#f59e0b` | `text-amber-400` | Medium stock ($5 < \text{DOS} \le 15$), pass caution alert |
| **Status Critical (Red)** | `#f43f5e` | `text-rose-500` | Critical shortage ($\text{DOS} \le 5$), blocked pass, cold-chain breach |

---

## 3. Typography & Hierarchy

- **Primary Interface Font:** `Inter`, `-apple-system`, `sans-serif` (Clean, legible labels).
- **Telemetry & Numbers:** `JetBrains Mono`, `Roboto Mono`, `monospace` (Grid-aligned numerals).
- **Text Scale:**
  - **Screen / Sector Title:** `text-lg font-bold tracking-wider uppercase`
  - **Metric Stat Value:** `text-2xl font-mono font-bold tracking-tight`
  - **Label / Caption:** `text-xs font-mono uppercase tracking-widest text-slate-400`
  - **Military Timestamps:** `text-xs font-mono text-cyan-400`

---

## 4. Master Screen Layout Structure

The layout is arranged into a dense 4-quadrant Command Operating Picture (COP):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TACTICAL COMMAND HEADER                                                  │
│ [INDIAN ARMY LOGISTICS]  [SECTOR: 14 CORPS LEH]  [ZULU: 09:41:20Z] [DEFCON: 2] │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 2. INTERACTIVE 3D GIS CORRIDOR MAP   │ 3. DOS & OUTPOST INVENTORY GRID     │
│                                      │                                      │
│ - Leh Base Depot (Node)              │ [SIACHEN BASE CAMP]                  │
│ - Khardung La Pass (🟢/🔴 Toggle)    │ - Kerosene Heating: 🔴 3.2 Days      │
│ - Partapur Transit Camp              │ - High Alt Rations: 🟢 21.0 Days     │
│ - Siachen Base Camp (FOP)            │ - 5.56mm Ammo:      🟡 8.5 Days      │
│ - Moving Convoy Blips (Live GPS)     │ [DAULAT BEG OLDI]                    │
│                                      │ - Kerosene Heating: 🟢 19.5 Days     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 4. CONVOY TELEMETRY & COLD-CHAIN HUD │ 5. "WHAT-IF" WAR-GAMING SANDBOX      │
│                                      │                                      │
│ Convoy: STALLION-ALPHA (14C/TRK-09)  │ [SLIDER] Temp: -30°C [Spike: +240%]  │
│ - Location: 34.279 N, 77.604 E       │ [SLIDER] Mobilization: +50% Troops   │
│ - Cargo: Plasma (+4.2°C 🟢)          │ [TOGGLE] Block Khardung La Pass      │
│ - Fuel Tank: 68% | Speed: 32 km/h    │ [ACTION] RECALCULATE LOGISTICS CHAIN │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 5. Key Component Specifications

### 5.1 Tactical Command Header
- **Military Clock:** Displays both Local IST and Military Zulu (UTC) time with a pulsing synchronization indicator.
- **Threat Indicator Badge:** Toggleable badge (`PEACE` / `HEIGHTENED` / `ACTIVE ENGAGEMENT`) that changes system-wide demand multipliers.
- **Critical Alerts Ticker:** Scrolling marquee with red flasher for real-time roadblock notifications (e.g., *"ALERT: AVALANCHE AT KHARDUNG LA - CONVOY ALPHA RE-ROUTING VIA SHYOK"*).

### 5.2 3D GIS Map Viewport
- **Layer Toggles:**
  - Terrain Elevation & Slope.
  - Active Convoy Vectors with dotted line trajectory.
  - Mountain Passes with Weather Hazard Icons (Snowflake, Landslide, Wind).
- **Interactive Roadblock Switch:** Clicking on any mountain pass opens a contextual prompt: `[SET STATUS: BLOCKED / CLEAR]`. Toggling automatically triggers path re-calculation.

### 5.3 Days of Supplies (DOS) Matrix Card
- Each forward post card displays:
  - Post Name & Altitude badge (`12,000 FT`).
  - Current ambient temperature with dynamic thermometer icon.
  - Mini progress bars for the 4 supply classes.
  - Quick Action button: `[REQUEST AIRDROP]` or `[DISPATCH CONVOY]`.

### 5.4 IoT Cold-Chain Gauge
- Renders an analog-style dial or digital gauge for Class VIII medical containers.
- Visual Thresholds:
  - $< 2^\circ\text{C}$: Blue warning (Risk of freezing).
  - $2^\circ\text{C} - 8^\circ\text{C}$: Solid green (Safe medical window).
  - $> 8^\circ\text{C}$: Red flashing alarm (Spoilage danger).

### 5.5 "What-If" War-Gaming Modal
- Allows tactical planners to test hypotheses before winter passes close.
- Visual outputs: Depletion forecast graph comparing *Baseline Supply* vs *War-Game Stress Scenario*.

### 5.6 Master Admin Operational Console (The Control Plane)
- Accessible via a dedicated top-bar navigation toggle (`[⚙️ MASTER ADMIN C2]`) protected by Admin credential authorization.
- **Controls & Levers:**
  - **Global & Sector Multiplier Sliders:** Real-time adjustments to standard Bukhari kerosene burn rates (L/soldier/day), vehicle fuel efficiency loss curves, and ration buffers.
  - **Manual Pass State Overrides:** Instant force-toggle for mountain passes (Khardung La, Chang La, Rohtang) with one-click broadcast to all field logistics officers.
  - **Emergency Inventory Injection Modal:** Allows the administrator to log sudden air-dropped relief packages (tonnes of food/fuel) into forward posts.
  - **User Clearance & Credential Management:** Toggle active statuses, assign tactical roles (Commander, Logistics Officer, Auditor), and revoke credentials.

### 5.7 Cyber Defense & Anti-Spoofing HUD
- **Cryptographic Audit Badge:** Prominent green shield indicator (`SHIELD: VERIFIED (0 TAMPER BLOCKS)`) at top right. Clicking it opens the **Audit Chain Explorer** showing transaction block hashes, timestamped officer signatures, and unbroken SHA-256 links.
- **GPS Spoofing Threat Banner:** When an abnormal telemetry packet (impossible mountain speeds or coordinate teleportation) is received, the convoy marker on the map blinks in fluorescent violet with a pulsing warning: `⚠️ GPS SPOOF DETECTED - FALLING BACK TO DEAD RECKONING`.
- **System Hardening Status Card:** Live metrics displaying active JWT sessions, failed login attempts (blocked by sliding window rate limiter), and air-gapped network isolation confirmation.

