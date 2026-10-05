import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Play, 
  AlertTriangle, 
  TrendingDown, 
  ShieldAlert, 
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function WarGamingSandbox({ targetNodes = [], t }) {
  const safeT = t || ((k) => k);
  const [temperature, setTemperature] = useState(-32.0);
  const [mobilization, setMobilization] = useState(40);
  const [blockadeDays, setBlockadeDays] = useState(7);
  const [threatLevel, setThreatLevel] = useState('HEIGHTENED');
  const [selectedNodeId, setSelectedNodeId] = useState('FOP_SIACHEN_BASE');
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/wargame/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature_drop_c: parseFloat(temperature),
          troop_mobilization_pct: parseFloat(mobilization),
          pass_blockade_days: parseInt(blockadeDays),
          threat_level: threatLevel,
          target_node_id: selectedNodeId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [temperature, mobilization, blockadeDays, threatLevel, selectedNodeId]);

  const loadPreset = (preset) => {
    setTemperature(preset.temp);
    setMobilization(preset.mob);
    setBlockadeDays(preset.blockade);
    setThreatLevel(preset.threat);
    setSelectedNodeId(preset.node);
  };

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
      {/* Sandbox Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {safeT.wargame_title || '"What-If" War Gaming & Stress Sandbox'}
            </h2>
            <p className="text-xs text-slate-400">
              {safeT.wargame_subtitle || 'Simulate extreme blizzards, troop surges, and supply cutoff scenarios'}
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <span className="text-[10px] text-slate-400">{safeT.presets || 'PRESETS:'}</span>
          <button
            onClick={() => loadPreset({ temp: -35.0, mob: 30, blockade: 7, threat: 'HEIGHTENED', node: 'FOP_SIACHEN_BASE' })}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
          >
            {safeT.preset_blizzard || 'Blizzard 2026'}
          </button>
          <button
            onClick={() => loadPreset({ temp: -28.0, mob: 75, blockade: 4, threat: 'ACTIVE', node: 'FOP_DBO' })}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
          >
            {safeT.preset_dbo || 'DBO Surge'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Slider Controls Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs">
          {/* 1. Sub-Zero Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">{safeT.temp_drop || 'TEMPERATURE DROP'}</span>
              <span className="text-cyan-300 font-bold tabular-nums">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="-45"
              max="-5"
              step="1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>-5°C</span>
              <span>-25°C</span>
              <span>-45°C</span>
            </div>
          </div>

          {/* 2. Troop Mobilization Surge Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">{safeT.troop_mob || 'TROOP MOBILIZATION'}</span>
              <span className="text-amber-400 font-bold tabular-nums">+{mobilization}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={mobilization}
              onChange={(e) => setMobilization(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>+0%</span>
              <span>+50%</span>
              <span>+100%</span>
            </div>
          </div>

          {/* 3. Pass Blockade Days Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">{safeT.pass_blockade || 'PASS BLOCKADE'}</span>
              <span className="text-rose-400 font-bold tabular-nums">{blockadeDays} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={blockadeDays}
              onChange={(e) => setBlockadeDays(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>0</span>
              <span>7</span>
              <span>14</span>
            </div>
          </div>
        </div>

        {/* Tactical Depletion KPI Row */}
        {simulationResult && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">{safeT.baseline_supply || 'BASELINE SUPPLY'}</span>
              <span className="text-lg font-bold text-slate-200">
                {simulationResult.baseline_days_of_supply} DOS
              </span>
            </div>

            <div className={`p-2.5 rounded border ${
              simulationResult.simulated_days_of_supply <= 5.0
                ? 'bg-rose-950/40 border-rose-600 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-amber-400'
            }`}>
              <span className="text-[10px] text-slate-400 uppercase block">{safeT.stress_supply || 'STRESS SCENARIO DOS'}</span>
              <span className="text-lg font-bold tabular-nums">
                {simulationResult.simulated_days_of_supply} DOS
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">{safeT.heating_spike || 'HEATING BURN SPIKE'}</span>
              <span className="text-lg font-bold text-rose-400">
                +{simulationResult.burn_rate_increase_pct}%
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">{safeT.days_to_zero || 'DAYS TO ZERO STOCK'}</span>
              <span className="text-lg font-bold text-cyan-300">
                {simulationResult.days_until_stockout}
              </span>
            </div>
          </div>
        )}

        {/* 30-Day Forward Depletion SVG Chart */}
        {simulationResult && simulationResult.depletion_curve && (
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-400 font-bold uppercase">
                {safeT.depletion_forecast || '30-DAY STOCK DEPLETION TRAJECTORY (KEROSENE LITERS)'}
              </span>
              <div className="flex items-center space-x-3 text-[10px]">
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-0.5 bg-slate-400 inline-block"></span>
                  <span className="text-slate-400">{safeT.baseline_trajectory || 'Baseline'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
                  <span className="text-rose-400 font-bold">{safeT.stress_trajectory || 'Simulated Stress'}</span>
                </div>
              </div>
            </div>

            <div className="h-32 w-full">
              <svg viewBox="0 0 600 120" className="w-full h-full overflow-visible">
                {/* Horizontal guide lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#334155" strokeWidth="1" />

                {/* Blockade duration shading */}
                {blockadeDays > 0 && (
                  <rect
                    x="0"
                    y="0"
                    width={blockadeDays * 20}
                    height="100"
                    fill="#f43f5e"
                    fillOpacity="0.08"
                  />
                )}

                {/* Baseline depletion path */}
                <path
                  d={simulationResult.depletion_curve.map((pt, i) => {
                    const x = (i / 29) * 600;
                    const y = 100 - (pt.baseline_stock / simulationResult.initial_stock) * 80;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(10, Math.min(100, y))}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Stress depletion path */}
                <path
                  d={simulationResult.depletion_curve.map((pt, i) => {
                    const x = (i / 29) * 600;
                    const y = 100 - (pt.simulated_stock / simulationResult.initial_stock) * 80;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(10, Math.min(100, y))}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        )}

        {/* AI Tactical Recommendation Directive Banner */}
        {simulationResult && (
          <div className="p-3 rounded bg-cyan-950/30 border border-cyan-500/40 font-mono text-xs text-cyan-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300 block mb-0.5">
                {safeT.ai_recommendation || 'AI DECISION SUPPORT RECOMMENDATION:'}
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {simulationResult.tactical_recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
