import React from 'react';
import { 
  Package, 
  Mountain, 
  Truck, 
  ThermometerSnowflake, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function ExecutiveSummaryDeck({
  nodes = [],
  passes = [],
  convoyTelemetry,
  optimizedRoute,
  onTogglePass,
  onOpenIndentModal,
  onSwitchTab,
  t
}) {
  const safeT = t || ((k) => k);

  // Compute key high-level statistics
  const totalNodes = nodes.length;
  const criticalNodes = nodes.filter(n => n.overall_status === 'CRITICAL');
  const warningNodes = nodes.filter(n => n.overall_status === 'WARNING');
  const healthyCount = totalNodes - criticalNodes.length - warningNodes.length;
  const healthPercent = totalNodes > 0 ? Math.round(((totalNodes - criticalNodes.length) / totalNodes) * 100) : 100;

  // Pass status
  const khardungLa = passes.find(p => p.pass_id === 'PASS_KHARDUNG_LA') || { is_blocked: false };
  const isKhardungBlocked = khardungLa.is_blocked;

  // Convoy status
  const convoy = convoyTelemetry || {
    call_sign: 'STALLION ALPHA',
    cargo_temp_celsius: 4.2,
    speed_kmh: 34.0,
    fuel_level_pct: 82.5,
    is_spoofed: false
  };

  const isTempOptimal = convoy.cargo_temp_celsius >= 2.0 && convoy.cargo_temp_celsius <= 8.0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Supply Chain Readiness Score Card */}
      <div className="glass-card p-4 flex flex-col justify-between border-slate-700/60 hover:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">{safeT.outpost_readiness || 'Outpost Readiness'}</span>
              <h3 className="text-sm font-semibold text-white">{safeT.forward_supply_level || 'Forward Supply Level'}</h3>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
            criticalNodes.length > 0 
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300' 
              : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
          }`}>
            {criticalNodes.length > 0 ? `${criticalNodes.length} ${safeT.need_resupply || 'Need Resupply'}` : (safeT.all_stocked || 'All Stocked')}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white tracking-tight">{healthPercent}%</span>
            <span className="text-xs text-slate-400">{healthyCount} / {totalNodes} {safeT.posts_normal || 'Posts Normal'}</span>
          </div>

          {/* Clean Progress Meter */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${healthPercent}%` }}
            />
            {criticalNodes.length > 0 && (
              <div 
                className="bg-rose-500 h-full rounded-full" 
                style={{ width: `${Math.round((criticalNodes.length / totalNodes) * 100)}%` }}
              />
            )}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
            {criticalNodes.length > 0 ? (
              <button
                onClick={() => onOpenIndentModal(criticalNodes[0])}
                className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>{safeT.resupply_post || 'Resupply'} {criticalNodes[0]?.name?.split(' ')[0]}</span>
                <Send className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {safeT.all_reserves_safe || 'All reserves above 7 days'}
              </span>
            )}
            <button 
              onClick={() => onSwitchTab('INVENTORY')}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {safeT.tab_inventory || 'Inventory'} →
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Route & Avalanche Detour Card */}
      <div className={`glass-card p-4 flex flex-col justify-between transition-all ${
        isKhardungBlocked ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/20 to-slate-900' : 'border-slate-700/60'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
              isKhardungBlocked 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">{safeT.strategic_corridors || 'Strategic Corridor'}</span>
              <h3 className="text-sm font-semibold text-white">{safeT.khardung_la_pass || 'Khardung La (17,982 ft)'}</h3>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
            isKhardungBlocked 
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse' 
              : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
          }`}>
            {isKhardungBlocked ? (safeT.status_closed_avalanche || '🔴 Closed') : (safeT.status_open_clear || '🟢 Open')}
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-slate-300 leading-relaxed">
            {isKhardungBlocked ? (
              <p className="text-amber-300 font-medium">
                {safeT.avalanche_detour_active || 'Active Detour: Trucks rerouted via Chang La & Agham-Shyok corridor (+4.2 hrs).'}
              </p>
            ) : (
              <p>
                {safeT.primary_clear_siachen || 'Primary highway clear to Siachen. Distance: 216 km · Est. Transit: 6.2 hrs.'}
              </p>
            )}
          </div>

          {/* Quick Interactive Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={() => onTogglePass('PASS_KHARDUNG_LA', !isKhardungBlocked)}
              className={`text-xs px-3 py-1 rounded-lg font-semibold border transition-all flex items-center gap-1.5 ${
                isKhardungBlocked
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-amber-950/80 border-amber-600 text-amber-300 hover:bg-amber-900'
              }`}
            >
              <span>{isKhardungBlocked ? (safeT.clear_pass || 'Clear Avalanche') : (safeT.simulate_block || 'Simulate Block')}</span>
            </button>
            <button 
              onClick={() => onSwitchTab('ROUTES')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-medium"
            >
              {safeT.tab_routes || 'Routes'} →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Convoy Fleet & Cold Chain Card */}
      <div className={`glass-card p-4 flex flex-col justify-between transition-all ${
        convoy.is_spoofed ? 'border-purple-500/60 bg-purple-950/20' : 'border-slate-700/60'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">{safeT.convoy_cold_chain || 'Convoy Cold Chain'}</span>
              <h3 className="text-sm font-semibold text-white">{convoy.call_sign}</h3>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-950/80 border border-blue-500/60 text-blue-300">
            {safeT.convoy_speed || 'Speed'}: {convoy.speed_kmh} km/h
          </span>
        </div>

        <div className="space-y-2">
          {/* Temperature Status Pill */}
          <div className="flex items-center justify-between bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span>{safeT.payload_name || 'Class VIII Blood Plasma'}:</span>
            </span>
            <span className={`font-bold px-2 py-0.5 rounded ${
              isTempOptimal ? 'text-emerald-300 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60 animate-pulse'
            }`}>
              {convoy.cargo_temp_celsius}°C ({isTempOptimal ? (safeT.plasma_safe || 'Safe') : (safeT.temp_breach || 'Breach')})
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
            <span className="text-slate-400">{safeT.winter_diesel_hsd || 'Fuel'}: <strong className="text-slate-200">{convoy.fuel_level_pct}%</strong></span>
            <button 
              onClick={() => onSwitchTab('FLEET')}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {safeT.tab_fleet || 'Fleet'} →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Sub-Zero Weather Burn Multiplier Card */}
      <div className="glass-card p-4 flex flex-col justify-between border-slate-700/60 hover:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">{safeT.tab_weather || 'Weather Intelligence'}</span>
              <h3 className="text-sm font-semibold text-white">Siachen Glacier Zone</h3>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-950/80 border border-cyan-500/60 text-cyan-300">
            -18°C Blizzard Zone
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            {safeT.burn_rate_notice || 'Heating fuel (SKO Bukhari) burn increases exponentially below -15°C to prevent frostbite.'}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
            <span className="text-amber-400 font-medium">{safeT.bukhari_multiplier || 'Bukhari Burn'}: 1.35x</span>
            <button 
              onClick={() => onSwitchTab('WEATHER')}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {safeT.tab_weather || 'Weather'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
