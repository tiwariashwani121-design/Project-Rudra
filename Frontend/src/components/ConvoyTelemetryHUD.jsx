import React from 'react';
import { 
  Truck, 
  Thermometer, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  ShieldAlert, 
  Radio, 
  AlertTriangle, 
  Zap, 
  CheckCircle2,
  Info,
  Clock,
  Compass
} from 'lucide-react';

export default function ConvoyTelemetryHUD({ 
  telemetry, 
  onToggleSpoof,
  t
}) {
  const safeT = t || ((k) => k);

  const data = telemetry || {
    convoy_id: 'CNV_14C_08',
    call_sign: 'STALLION ALPHA',
    speed_kmh: 34.0,
    fuel_level_pct: 82.5,
    cargo_temp_celsius: 4.2,
    cold_chain_breach: false,
    is_spoofed: false,
    vehicle_type: 'STALLION_HEAVY_4X4',
    total_payload_tonnes: 14.5,
    cargo_type: 'CLASS_VIII_BLOOD_PLASMA'
  };

  // Safe cold-chain window: 2.0°C to 8.0°C
  const isColdChainBreach = data.cold_chain_breach || data.cargo_temp_celsius < 2.0 || data.cargo_temp_celsius > 8.0;

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{safeT.telemetry_title || 'IoT Convoy Telemetry & Cold-Chain'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-600/40">
                {safeT.live_sensor_feed || 'Live Sensor Feed'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">{safeT.telemetry_subtitle || 'Live vehicle location, speed, fuel and temperature tracking'}</p>
          </div>
        </div>

        {/* EW GPS Anti-Spoof Test Button */}
        <button
          onClick={onToggleSpoof}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            data.is_spoofed
              ? 'bg-purple-900/90 border-purple-400 text-purple-200 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Simulate Electronic Warfare GPS Spoofing Attack"
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>{data.is_spoofed ? (safeT.btn_disarm_spoof || 'Disarm GPS Attack') : (safeT.btn_test_spoof || 'Test GPS Spoof Attack')}</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Convoy Identification Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-700/40 flex items-center justify-center text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">{safeT.active_military_convoy || 'Active Military Convoy'}</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{data.call_sign}</span>
                <span className="text-xs text-slate-400 font-normal">({data.convoy_id})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{safeT.vehicle_model || 'Vehicle Model'}</span>
              <span className="font-semibold text-slate-200">{safeT.vehicle_model_name || 'Stallion Heavy 4x4'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{safeT.payload || 'Payload'}</span>
              <span className="font-semibold text-emerald-400">{safeT.payload_name || 'Class VIII Blood Plasma (14.5 T)'}</span>
            </div>
          </div>
        </div>

        {/* Primary Gauges / Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Cold-Chain Temperature */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isColdChainBreach 
              ? 'bg-rose-950/30 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>{safeT.cargo_temperature || 'Cargo Temperature'}</span>
              </span>
              <span className="text-[10px] text-slate-500">{safeT.temp_safe_range || '2°C – 8°C'}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
                {data.cargo_temp_celsius}°C
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isColdChainBreach 
                  ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse' 
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
              }`}>
                {isColdChainBreach ? (safeT.badge_temp_breach || 'Temperature Breach!') : (safeT.badge_temp_safe || '✓ Safe Storage')}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              {safeT.cold_chain_notice || 'Blood plasma and anti-venom require strict cold-chain maintenance.'}
            </p>
          </div>

          {/* 2. Convoy Speed */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            data.speed_kmh > 85 
              ? 'bg-purple-950/30 border-purple-500' 
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>{safeT.convoy_speed || 'Convoy Speed'}</span>
              </span>
              <span className="text-[10px] text-slate-500">{safeT.max_speed_limit || 'Max 60 km/h'}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
                {data.speed_kmh} <span className="text-sm font-normal text-slate-400">km/h</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-full">
                {data.speed_kmh > 85 ? (safeT.badge_anomaly || 'Anomaly') : (safeT.badge_safe_pace || 'Safe Mountain Pace')}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              {safeT.speed_notice || 'High mountain roads restrict speed to prevent loss of control.'}
            </p>
          </div>

          {/* 3. Fuel Tank Level */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Fuel className="w-4 h-4 text-amber-400" />
                <span>{safeT.winter_diesel_hsd || 'Winter Diesel (HSD)'}</span>
              </span>
              <span className="text-[10px] text-slate-500">{safeT.als_tank || 'ALS 4x4'}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
                {data.fuel_level_pct}%
              </span>
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-700/50">
                {safeT.adequate_range || 'Adequate Range'}
              </span>
            </div>

            {/* Fuel Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500" 
                style={{ width: `${data.fuel_level_pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* GPS Anti-Spoofing Defense Shield Card */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          data.is_spoofed
            ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
            : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-white">
              {data.is_spoofed ? (
                <ShieldAlert className="w-4 h-4 text-purple-400 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span>
                {data.is_spoofed 
                  ? (safeT.spoof_detected_title || '⚠️ ADVERSARY EW GPS SPOOFING ATTACK DETECTED') 
                  : (safeT.shield_active_title || 'Kinematic GPS Anti-Spoofing Shield: Active')}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              data.is_spoofed 
                ? 'bg-purple-900 text-purple-200 border-purple-500' 
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
            }`}>
              {data.is_spoofed ? (safeT.badge_dead_reckoning || 'Dead Reckoning Active') : (safeT.badge_signals_verified || 'Signals Verified')}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {data.is_spoofed 
              ? (safeT.spoof_detected_desc || 'Adversary injected fake satellite signals with an impossible speed jump (>90 km/h). The system instantly rejected the corrupt GPS coordinates and safely switched to inertial navigation.') 
              : (safeT.shield_active_desc || 'Continuous heuristic analysis compares vehicle acceleration, pass elevation, and previous coordinates every 2 seconds to guard against enemy GPS spoofing.')}
          </p>
        </div>
      </div>
    </div>
  );
}
