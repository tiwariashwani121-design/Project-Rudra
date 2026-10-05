import React, { useState } from 'react';
import { 
  Send, 
  Truck, 
  ShieldAlert, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Lock 
} from 'lucide-react';

export default function IndentModal({ node, onClose, onAuthorized, t }) {
  const safeT = t || ((k) => k);
  const [convoyCallsign, setConvoyCallsign] = useState('STALLION_BRAVO_RUSH');
  const [authorizingOfficer, setAuthorizingOfficer] = useState('BRIGADIER_LOGISTICS_HQ');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!node) return null;

  // Find critical items
  const criticalItems = node.inventory.filter(i => i.status === 'RED' || i.days_of_supply_dos <= 5.0);

  const handleAuthorize = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/nodes/indents/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indent_id: `IND_14C_${node.node_id}_${Date.now()}`,
          authorized_by: authorizingOfficer,
          convoy_callsign: convoyCallsign
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (onAuthorized) onAuthorized();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {safeT.indent_title || "Authorize Emergency Supply Dispatch"}
              </h2>
              <span className="text-xs text-slate-400">
                {safeT.indent_subtitle || "14 Corps Forward Logistics Requisition Order"}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {result ? (
            <div className="p-4 rounded bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{safeT.convoy_authorized_sealed || "CONVOY DISPATCH AUTHORIZED & SEALED"}</span>
              </div>
              <p className="text-xs text-slate-300">
                Convoy <strong className="text-cyan-300">{result.assigned_convoy}</strong> dispatched from Leh Base Depot.
              </p>
              <div className="text-[10px] p-2 rounded bg-slate-950 border border-slate-800 text-slate-400">
                <div>AUDIT ID: #{result.audit_id}</div>
                <div className="truncate">SHA-256: {result.sha256_hash}</div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                RETURN TO COMMON OPERATING PICTURE
              </button>
            </div>
          ) : (
            <>
              {/* Target Post Info */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span>OUTPOST:</span>
                  <span className="font-bold text-slate-100 text-sm">{node.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>TROOP STRENGTH:</span>
                  <span className="text-slate-200">{node.troop_count} {safeT.jawans || 'Jawans'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>AMBIENT TEMP:</span>
                  <span className="text-cyan-400 font-bold">{node.ambient_temp_c}°C</span>
                </div>
              </div>

              {/* Critical Shortages List */}
              <div>
                <label className="text-[10px] text-rose-400 font-bold uppercase block mb-1.5">
                  CRITICAL SHORTAGE ITEMS REQUIRING IMMEDIATE RUSH DISPATCH:
                </label>
                <div className="space-y-1.5">
                  {criticalItems.map((item) => (
                    <div 
                      key={item.item_id}
                      className="p-2.5 rounded bg-rose-950/30 border border-rose-800/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-400" />
                        <div>
                          <div className="font-bold text-slate-200">{item.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Daily Burn: {item.daily_burn_rate} {item.unit_of_measure}/day
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-300 font-bold">
                          {item.days_of_supply_dos} DOS
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Stock: {item.current_quantity} {item.unit_of_measure}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allocation Inputs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{safeT.assigned_convoy || "ASSIGN CONVOY UNIT"}</label>
                  <input
                    type="text"
                    value={convoyCallsign}
                    onChange={(e) => setConvoyCallsign(e.target.value)}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{safeT.authorizing_officer || "AUTHORIZING OFFICER"}</label>
                  <input
                    type="text"
                    value={authorizingOfficer}
                    onChange={(e) => setAuthorizingOfficer(e.target.value)}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {safeT.close || 'CANCEL'}
                </button>
                <button
                  type="button"
                  onClick={handleAuthorize}
                  disabled={loading}
                  className="px-5 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {loading ? 'CRYPTOGRAPHICALLY SIGNING...' : (safeT.sign_dispatch || 'AUTHORIZE & DISPATCH CONVOY')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
