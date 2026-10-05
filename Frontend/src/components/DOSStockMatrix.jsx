import React, { useState } from 'react';
import { 
  Flame, 
  Package, 
  ShieldAlert, 
  HeartPulse, 
  Thermometer, 
  Users, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  Info
} from 'lucide-react';

export default function DOSStockMatrix({ 
  nodes = [], 
  onOpenIndentModal, 
  onQuickAuthorize,
  t
}) {
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, FORWARD
  const safeT = t || ((k) => k);

  const getItemDisplayName = (item) => {
    if (!item) return '';
    const id = item.item_id || '';
    const sClass = item.supply_class || '';
    if (id.includes('KEROSENE') || (sClass === 'CLASS_III' && item.name?.toLowerCase().includes('kerosene'))) {
      return safeT.supply_pol || item.name;
    }
    if (id.includes('DIESEL') || (sClass === 'CLASS_III' && item.name?.toLowerCase().includes('diesel'))) {
      return safeT.supply_diesel || item.name;
    }
    if (sClass === 'CLASS_I' || id.includes('RATION')) {
      return safeT.supply_rations || item.name;
    }
    if (sClass === 'CLASS_V' || id.includes('AMMO')) {
      return safeT.supply_ammo || item.name;
    }
    if (sClass === 'CLASS_VIII' || id.includes('MED') || id.includes('PLASMA')) {
      return safeT.supply_med || item.name;
    }
    return item.name;
  };

  const filteredNodes = nodes.filter(node => {
    if (filter === 'CRITICAL') return node.overall_status === 'CRITICAL';
    if (filter === 'FORWARD') return node.node_type === 'FORWARD_POST';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RED':
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/60 animate-pulse';
      case 'AMBER':
      case 'WARNING':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60';
    }
  };

  const getSupplyIcon = (supplyClass, itemId) => {
    if (itemId.includes('KEROSENE') || supplyClass === 'CLASS_III') {
      return <Flame className="w-4 h-4 text-amber-400" />;
    }
    if (supplyClass === 'CLASS_I') {
      return <Package className="w-4 h-4 text-blue-400" />;
    }
    if (supplyClass === 'CLASS_V') {
      return <ShieldAlert className="w-4 h-4 text-purple-400" />;
    }
    if (supplyClass === 'CLASS_VIII') {
      return <HeartPulse className="w-4 h-4 text-rose-400" />;
    }
    return <Package className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{safeT.dos_title || 'Outpost Supply Reserves (DOS)'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                {safeT.live_inventory || 'Live Inventory'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {safeT.dos_subtitle || 'Days of Supply (DOS) remaining before post runs out'}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: safeT.filter_all || 'All Posts' },
            { id: 'CRITICAL', label: safeT.filter_critical || 'Needs Supply' },
            { id: 'FORWARD', label: safeT.filter_forward || 'Forward LOC' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === btn.id
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Helper Legend Bar */}
      <div className="bg-slate-950/40 px-4 py-1.5 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>{safeT.burn_rate_notice || 'Burn rates adjusted automatically for extreme sub-zero weather'}</span>
        </span>
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {safeT.legend_safe || '>15 Days (Safe)'}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> {safeT.legend_low || '7–15 Days (Low)'}
          </span>
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> {safeT.legend_critical || '<7 Days (Critical)'}
          </span>
        </div>
      </div>

      {/* Grid of Outpost Cards */}
      <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto max-h-[520px]">
        {filteredNodes.map((node) => {
          const isCritical = node.overall_status === 'CRITICAL';
          
          return (
            <div
              key={node.node_id}
              className={`p-3.5 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {node.name}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusBadge(node.overall_status)}`}>
                      {isCritical ? (safeT.badge_supply_urgent || '⚠️ Supply Urgent') : (safeT.badge_stocked || '✓ Stocked')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                      <span className={node.ambient_temp_c < -15 ? "text-cyan-300 font-semibold" : ""}>
                        {node.ambient_temp_c}°C
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{node.troop_count} {safeT.jawans || 'Jawans'}</span>
                    </span>
                    <span className="text-slate-500">
                      {Math.round(node.altitude_feet).toLocaleString()} FT
                    </span>
                  </div>
                </div>

                {/* Dispatch Button */}
                {isCritical && (
                  <button
                    onClick={() => onOpenIndentModal(node)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(244,63,94,0.35)] shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    <span>{safeT.authorize_dispatch || 'Authorize Dispatch'}</span>
                  </button>
                )}
              </div>

              {/* Supply Items Progress Bars */}
              <div className="mt-3 space-y-2.5">
                {node.inventory.map((item) => {
                  const isRed = item.status === 'RED';
                  const isAmber = item.status === 'AMBER';
                  // Calculate width percentage capped at 30 days
                  const barWidth = Math.min(100, Math.round((item.days_of_supply_dos / 30) * 100));

                  return (
                    <div key={item.item_id} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          {getSupplyIcon(item.supply_class, item.item_id)}
                          <span className="font-medium truncate max-w-[170px]">{getItemDisplayName(item)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">
                            {item.current_quantity.toLocaleString()} {item.unit_of_measure}
                          </span>
                          <span className={`font-bold tabular-nums text-xs px-2 py-0.5 rounded-full ${
                            isRed 
                              ? 'text-rose-300 bg-rose-950/80 border border-rose-700/60' 
                              : isAmber 
                              ? 'text-amber-300 bg-amber-950/80 border border-amber-700/60' 
                              : 'text-emerald-300 bg-emerald-950/80 border border-emerald-700/60'
                          }`}>
                            {item.days_of_supply_dos} {safeT.days_left || 'Days Left'}
                          </span>
                        </div>
                      </div>

                      {/* Clean Progress Meter Bar */}
                      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isRed 
                              ? 'bg-rose-500' 
                              : isAmber 
                              ? 'bg-amber-400' 
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
