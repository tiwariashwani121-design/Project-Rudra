import React, { useState } from 'react';
import { 
  Navigation, 
  Mountain, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  Clock,
  Fuel
} from 'lucide-react';

export default function TacticalMap({ 
  passes = [], 
  onTogglePass, 
  convoyTelemetry, 
  optimizedRoute, 
  onRefreshRoute,
  t
}) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Tactical Corridor Waypoints projected onto SVG coordinates (960 x 540 viewbox)
  const mapNodes = [
    { id: 'BASE_LEH_DEPOT', name: 'Leh Central Depot', x: 260, y: 470, alt: '11,500 FT', type: 'BASE', role: 'Main Supply Hub' },
    { id: 'CP_SOUTH_PULLU', name: 'South Pullu CP', x: 330, y: 390, alt: '15,300 FT', type: 'CHECKPOINT', role: 'Transit Checkpoint' },
    { id: 'PASS_KHARDUNG_LA', name: 'Khardung La Pass', x: 380, y: 320, alt: '17,982 FT', type: 'PASS', role: 'Strategic Pass' },
    { id: 'CP_NORTH_PULLU', name: 'North Pullu Post', x: 430, y: 250, alt: '15,100 FT', type: 'CHECKPOINT', role: 'Transit Checkpoint' },
    { id: 'FLD_PARTAPUR', name: 'Partapur Logistics Base', x: 500, y: 190, alt: '10,200 FT', type: 'DEPOT', role: 'Forward Depot' },
    { id: 'FOP_SIACHEN_BASE', name: 'Siachen Base Camp', x: 470, y: 65, alt: '12,000 FT', type: 'FOP', role: 'Forward Operating Post' },
    { id: 'FOP_TURTUK', name: 'Turtuk Sector Post', x: 200, y: 160, alt: '9,900 FT', type: 'FOP', role: 'Forward LOC Post' },
    { id: 'FOP_DBO', name: 'Daulat Beg Oldi (DBO)', x: 790, y: 55, alt: '16,600 FT', type: 'FOP', role: 'Highest Airstrip' },

    // Bypass Corridor Nodes
    { id: 'WP_KARU', name: 'Karu Junction', x: 460, y: 480, alt: '11,400 FT', type: 'WAYPOINT', role: 'Detour Staging' },
    { id: 'PASS_CHANG_LA', name: 'Chang La Pass', x: 620, y: 420, alt: '17,688 FT', type: 'PASS', role: 'High Mountain Pass' },
    { id: 'TP_AGHAM', name: 'Agham Post', x: 650, y: 270, alt: '11,200 FT', type: 'WAYPOINT', role: 'River Valley Route' },
    { id: 'TP_SHYOK', name: 'Shyok River Axis', x: 600, y: 210, alt: '10,500 FT', type: 'WAYPOINT', role: 'Bypass Corridor' },
  ];

  const khardungLa = passes.find(p => p.pass_id === 'PASS_KHARDUNG_LA') || { is_blocked: false };
  const changLa = passes.find(p => p.pass_id === 'PASS_CHANG_LA') || { is_blocked: false };

  // Calculate approximate SVG position for convoy
  const getConvoySvgPos = () => {
    if (!convoyTelemetry) return { x: 355, y: 355 };
    if (convoyTelemetry.is_spoofed) {
      return { x: 710, y: 320 };
    }
    if (khardungLa.is_blocked) {
      return { x: 570, y: 345 }; // Moving along Agham-Shyok
    }
    return { x: 355, y: 355 }; // Near South Pullu / Khardung La
  };

  const convoyPos = getConvoySvgPos();

  const safeT = t || ((k) => k);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full border border-slate-800 bg-slate-900/90 shadow-xl">
      {/* Map Control Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{safeT.gis_title || 'Interactive Supply Route Corridor'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                {safeT.corridor_gis_tag || '14 Corps GIS'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">{safeT.gis_subtitle || 'Leh – Khardung La – Nubra Valley – Siachen Base'}</p>
          </div>
        </div>

        {/* Quick Simulation Toggles for Mountain Passes */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 hidden sm:inline">{safeT.pass_status_label || 'Pass Status:'}</span>
            
            {/* Khardung La Toggle */}
            <button
              onClick={() => onTogglePass('PASS_KHARDUNG_LA', !khardungLa.is_blocked)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                khardungLa.is_blocked
                  ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse shadow-sm'
                  : 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900/50'
              }`}
            >
              <span>{safeT.khardung_la || 'Khardung La:'}</span>
              <span className="font-bold">{khardungLa.is_blocked ? (safeT.status_closed || '🔴 Closed') : (safeT.status_open || '🟢 Open')}</span>
            </button>

            {/* Chang La Toggle */}
            <button
              onClick={() => onTogglePass('PASS_CHANG_LA', !changLa.is_blocked)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                changLa.is_blocked
                  ? 'bg-rose-950/90 border-rose-500 text-rose-300'
                  : 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900/50'
              }`}
            >
              <span>{safeT.chang_la || 'Chang La:'}</span>
              <span className="font-bold">{changLa.is_blocked ? (safeT.status_closed || '🔴 Closed') : (safeT.status_open || '🟢 Open')}</span>
            </button>
          </div>

          <button
            onClick={onRefreshRoute}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={safeT.recalculate_route || 'Recalculate Route'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Tactical Map Canvas with Overlays */}
      <div className="relative flex-1 bg-[#060a12] overflow-hidden min-h-[360px] tactical-grid-bg select-none">
        {/* Dynamic Route Info Badge */}
        <div className="absolute top-3 left-3 z-10 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 text-xs max-w-xs shadow-2xl space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">{safeT.recommended_route || 'Current Recommended Route'}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              khardungLa.is_blocked
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
            }`}>
              {khardungLa.is_blocked ? (safeT.badge_bypass_detour || '⚠️ Bypass Detour') : (safeT.badge_primary_corridor || '✓ Primary Corridor')}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-cyan-400" /> {safeT.distance || 'Distance:'}
              </span>
              <span className="font-bold text-white">{optimizedRoute?.distance_km || 216.0} km</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> {safeT.transit_time || 'Transit Time:'}
              </span>
              <span className="font-bold text-cyan-300">{optimizedRoute?.estimated_travel_time_hours || 6.2} hrs</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" /> {safeT.convoy_fuel || 'Convoy Fuel:'}
              </span>
              <span className="font-bold text-slate-200">{optimizedRoute?.fuel_consumption_liters || 97.2} L</span>
            </div>

            {khardungLa.is_blocked && (
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-300 mt-2">
                <p className="font-semibold">{safeT.avalanche_reroute_title || 'Avalanche Reroute Active:'}</p>
                <p className="text-slate-300 mt-0.5">{safeT.avalanche_reroute_desc || '+4.2 hrs delay · +160 L extra fuel via Agham-Shyok'}</p>
              </div>
            )}
          </div>
        </div>

        {/* SVG Visualization */}
        <svg viewBox="0 0 960 520" className="w-full h-full">
          <defs>
            <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="route-gradient-primary" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="route-gradient-bypass" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Himalayan Mountain Ridge Contours */}
          <path d="M 100 500 Q 240 430 380 460 T 640 450 T 900 480" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M 80 390 Q 280 310 450 340 T 720 330 T 920 350" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d="M 120 260 Q 320 180 500 210 T 780 170 T 920 190" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M 180 120 Q 380 60 580 90 T 840 70" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 6" />

          {/* Primary Route: Leh -> South Pullu -> Khardung La -> North Pullu -> Partapur */}
          <path 
            d="M 260 470 L 330 390 L 380 320 L 430 250 L 500 190" 
            fill="none" 
            stroke={khardungLa.is_blocked ? "#f43f5e" : "#10b981"} 
            strokeWidth={khardungLa.is_blocked ? "3" : "4.5"}
            strokeDasharray={khardungLa.is_blocked ? "8 6" : "none"}
            filter={khardungLa.is_blocked ? "none" : "url(#map-glow)"}
          />

          {/* Bypass Route: Leh -> Karu -> Chang La -> Agham -> Shyok -> Partapur */}
          <path 
            d="M 260 470 L 460 480 L 620 420 L 650 270 L 600 210 L 500 190" 
            fill="none" 
            stroke={khardungLa.is_blocked ? "#f59e0b" : "#334155"} 
            strokeWidth={khardungLa.is_blocked ? "4.5" : "2.5"}
            strokeDasharray={khardungLa.is_blocked ? "none" : "6 6"}
            filter={khardungLa.is_blocked ? "url(#map-glow)" : "none"}
          />

          {/* Forward Staging from Partapur */}
          {/* Partapur -> Siachen Base Camp */}
          <path d="M 500 190 L 470 65" fill="none" stroke="#06b6d4" strokeWidth="3.5" filter="url(#map-glow)" />
          {/* Partapur -> Turtuk */}
          <path d="M 500 190 L 200 160" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="4 4" />
          {/* Partapur -> DBO */}
          <path d="M 500 190 L 790 55" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="4 4" />

          {/* Roadblock Indicator over Khardung La */}
          {khardungLa.is_blocked && (
            <g transform="translate(380, 320)">
              <circle r="20" fill="#f43f5e" fillOpacity="0.3" className="animate-ping" />
              <circle r="13" fill="#991b1b" stroke="#f43f5e" strokeWidth="2.5" />
              <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">✕</text>
              <rect x="-45" y="-32" width="90" height="20" rx="6" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
              <text x="0" y="-18" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">
                BLOCKED PASS
              </text>
            </g>
          )}

          {/* Interactive Map Nodes */}
          {mapNodes.map((node) => {
            const isPass = node.type === 'PASS';
            const passStatus = passes.find(p => p.pass_id === node.id);
            const isBlocked = passStatus?.is_blocked;

            let fillCol = "#06b6d4";
            let strokeCol = "#0891b2";
            if (node.type === 'BASE') { fillCol = "#3b82f6"; strokeCol = "#2563eb"; }
            if (node.type === 'FOP') { fillCol = "#ec4899"; strokeCol = "#db2777"; }
            if (node.type === 'DEPOT') { fillCol = "#10b981"; strokeCol = "#059669"; }
            if (isPass) { fillCol = isBlocked ? "#f43f5e" : "#eab308"; strokeCol = isBlocked ? "#dc2626" : "#ca8a04"; }

            return (
              <g 
                key={node.id} 
                transform={`translate(${node.x}, ${node.y})`} 
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedNode(node);
                  if (isPass) {
                    onTogglePass(node.id, !isBlocked);
                  }
                }}
              >
                {/* Node Halo */}
                <circle 
                  r={isPass ? 12 : 8} 
                  fill={fillCol} 
                  fillOpacity="0.2"
                  className="transition-all group-hover:scale-125"
                />
                {/* Node Core */}
                <circle 
                  r={isPass ? 7 : 5} 
                  fill={fillCol} 
                  stroke="#0f172a" 
                  strokeWidth="2"
                />
                
                {/* Node Title */}
                <text 
                  x="0" 
                  y={node.y > 280 ? 22 : -14} 
                  textAnchor="middle" 
                  fill="#f1f5f9" 
                  fontSize="11" 
                  fontWeight="600"
                  className="select-none pointer-events-none drop-shadow-md"
                >
                  {node.name}
                </text>
                
                {/* Altitude Subtitle */}
                <text 
                  x="0" 
                  y={node.y > 280 ? 33 : -25} 
                  textAnchor="middle" 
                  fill="#94a3b8" 
                  fontSize="9" 
                  className="select-none pointer-events-none"
                >
                  {node.alt}
                </text>
              </g>
            );
          })}

          {/* Active Convoy Blip */}
          <g transform={`translate(${convoyPos.x}, ${convoyPos.y})`}>
            {convoyTelemetry?.is_spoofed ? (
              <>
                <circle r="24" fill="#a855f7" fillOpacity="0.3" className="animate-ping" />
                <circle r="13" fill="#6b21a8" stroke="#c084fc" strokeWidth="2.5" />
                <text x="0" y="4" textAnchor="middle" fill="#f3e8ff" fontSize="11" fontWeight="bold">⚠️</text>
                <g transform="translate(18, -10)">
                  <rect width="130" height="26" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                  <text x="8" y="12" fill="#d8b4fe" fontSize="9" fontWeight="bold">
                    GPS SPOOF DETECTED
                  </text>
                  <text x="8" y="22" fill="#94a3b8" fontSize="8">
                    Kinematic Jump Ignored
                  </text>
                </g>
              </>
            ) : (
              <>
                <circle r="20" fill="#06b6d4" fillOpacity="0.25" className="animate-ping" />
                <circle r="11" fill="#0e7490" stroke="#38bdf8" strokeWidth="2.5" />
                <circle r="4" fill="#bae6fd" />
                <g transform="translate(16, -10)">
                  <rect width="125" height="26" rx="6" fill="#090d16" fillOpacity="0.95" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="8" y="12" fill="#38bdf8" fontSize="9.5" fontWeight="bold">
                    🚚 STALLION ALPHA
                  </text>
                  <text x="8" y="22" fill="#cbd5e1" fontSize="8">
                    {convoyTelemetry?.speed_kmh || 34.0} km/h · {convoyTelemetry?.cargo_temp_celsius || 4.2}°C
                  </text>
                </g>
              </>
            )}
          </g>
        </svg>

        {/* Clean Map Legend */}
        <div className="absolute bottom-3 right-3 z-10 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md text-xs space-y-1.5 shadow-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Map Legend:</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Leh Base Hub
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Partapur Depot
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Forward Posts
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Mountain Passes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
