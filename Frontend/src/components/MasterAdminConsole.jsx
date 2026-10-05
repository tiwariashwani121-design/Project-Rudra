import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../api';
import { 
  Settings, 
  Flame, 
  Mountain, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle
} from 'lucide-react';

export default function MasterAdminConsole({ onRefreshData, t }) {
  const safeT = t || ((k) => k);
  const [params, setParams] = useState([]);
  const [bukhariMultiplier, setBukhariMultiplier] = useState(1.0);
  const [safetyBufferDays, setSafetyBufferDays] = useState(7.0);

  // Emergency Stock Injection State
  const [injectNode, setInjectNode] = useState('FOP_SIACHEN_BASE');
  const [injectItem, setInjectItem] = useState('ITEM_POL_KEROSENE');
  const [injectQty, setInjectQty] = useState(5000);
  const [injectMode, setInjectMode] = useState('AIRDROP_ALH');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchParams = async () => {
    try {
      const res = await fetch(getApiUrl('/api/v1/admin/parameters'));
      if (res.ok) {
        const data = await res.json();
        setParams(data);
        const b = data.find(p => p.param_key === 'BUKHARI_HEATING_BURN_RATE_MULTIPLIER');
        if (b) setBukhariMultiplier(b.param_value);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchParams();
  }, []);

  const handleUpdateParameter = async (name, value, justification) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/admin/overrides/parameter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameter_name: name,
          new_value: parseFloat(value),
          justification: justification || "Command logistics tactical adjustment",
          user_id: "COL_RAJESHWAR_SEN"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage(`✅ ${data.message}`);
        await fetchParams();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectStock = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/v1/admin/inventory/inject'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: injectNode,
          item_id: injectItem,
          quantity: parseFloat(injectQty),
          mode: injectMode,
          justification: "Emergency high-altitude relief dispatch",
          user_id: "COL_RAJESHWAR_SEN"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage(`✅ ${data.message}`);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="hud-card rounded-lg flex flex-col h-full bg-slate-900 border border-slate-800">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            {safeT.admin_title || "MASTER ADMIN OPERATIONAL CONTROL PLANE // LEVEL 4 CLEARANCE"}
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/40 text-emerald-400">
          COMMAND SIGNATURE REQUIRED
        </span>
      </div>

      <div className="p-4 space-y-5 font-mono text-xs">
        {statusMessage && (
          <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Section 1: Core Operational Multipliers */}
        <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 uppercase text-[11px] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {safeT.multipliers || "GLOBAL SECTOR MULTIPLIERS"}
            </span>
            <span className="text-[10px] text-slate-400">CRYPTOGRAPHIC LOGGING ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bukhari Multiplier Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">{safeT.bukhari_multiplier || "Bukhari Heating Multiplier"}:</span>
                <span className="text-amber-400 font-bold">{bukhariMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={bukhariMultiplier}
                onChange={(e) => setBukhariMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <button
                onClick={() => handleUpdateParameter('BUKHARI_HEATING_BURN_RATE_MULTIPLIER', bukhariMultiplier, 'Admin manual override for winter blizzard')}
                className="mt-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] transition-colors"
              >
                {safeT.save_parameter || "APPLY MULTIPLIER"}
              </button>
            </div>

            {/* Safety Stock Buffer */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">{safeT.safety_buffer || "Safety Buffer Days"}:</span>
                <span className="text-cyan-300 font-bold">{safetyBufferDays} Days</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={safetyBufferDays}
                onChange={(e) => setSafetyBufferDays(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <button
                onClick={() => handleUpdateParameter('SAFETY_STOCK_BUFFER_DAYS', safetyBufferDays, 'Updated safety reserve policy')}
                className="mt-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] transition-colors"
              >
                {safeT.save_parameter || "UPDATE SAFETY BUFFER"}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Emergency Inventory Injection */}
        <form onSubmit={handleInjectStock} className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 uppercase text-[11px] flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              {safeT.emergency_inject || "EMERGENCY AIR-DROP STOCK INJECTION (ALH DHRUV)"}
            </span>
            <span className="text-[10px] text-cyan-400">ONE-CLICK AUDIT LOGGING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{safeT.target_outpost || "TARGET OUTPOST"}</label>
              <select
                value={injectNode}
                onChange={(e) => setInjectNode(e.target.value)}
                className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
              >
                <option value="FOP_SIACHEN_BASE">Siachen Base Camp</option>
                <option value="FOP_DBO">Daulat Beg Oldi (DBO)</option>
                <option value="FOP_TURTUK">Turtuk Post (LOC)</option>
                <option value="FLD_PARTAPUR">Partapur Staging Depot</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{safeT.supply_item || "SUPPLY CLASS"}</label>
              <select
                value={injectItem}
                onChange={(e) => setInjectItem(e.target.value)}
                className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
              >
                <option value="ITEM_POL_KEROSENE">{safeT.supply_pol || "Class III Kerosene (Liters)"}</option>
                <option value="ITEM_CLASS_I_RATIONS">{safeT.supply_rations || "Class I Rations (Packets)"}</option>
                <option value="ITEM_CLASS_V_AMMO">{safeT.supply_ammo || "Class V Ammo (Rounds)"}</option>
                <option value="ITEM_CLASS_VIII_MEDICAL">{safeT.supply_med || "Class VIII Medical (Units)"}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{safeT.quantity || "INJECTION QUANTITY"}</label>
              <input
                type="number"
                value={injectQty}
                onChange={(e) => setInjectQty(e.target.value)}
                className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{safeT.dispatch_mode || "DELIVERY MODE"}</label>
              <select
                value={injectMode}
                onChange={(e) => setInjectMode(e.target.value)}
                className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
              >
                <option value="AIRDROP_ALH">ALH Dhruv Helicopter Airdrop</option>
                <option value="EMERGENCY_CONVOY">High-Speed ALS 4x4 Convoy</option>
                <option value="AUDIT_RECONCILE">Physical Depot Audit Reconciliation</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
            >
              <Send className="w-3 h-3" />
              {safeT.btn_inject_stock || "EXECUTE INJECTION & APPEND AUDIT BLOCK"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
