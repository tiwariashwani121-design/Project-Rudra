import React from 'react';
import { 
  X, 
  HelpCircle, 
  Package, 
  Mountain, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  ThermometerSnowflake,
  Lock
} from 'lucide-react';

export default function SystemGuideModal({ onClose, t }) {
  const safeT = t || ((k) => k);
  const guideSections = [
    {
      icon: <Package className="w-6 h-6 text-emerald-400" />,
      title: safeT.guide_sec1_title || "1. Days of Supplies (DOS) Prediction",
      badge: safeT.guide_sec1_badge || "Supply Readiness",
      badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-600/50",
      desc: safeT.guide_sec1_desc || "Instead of static inventory counts, Rudra predicts how many days an outpost can survive before exhausting fuel, food, or ammunition. In sub-zero temperatures (-20°C to -40°C), Bukhari heating kerosene burns up to 2.5x faster to prevent soldier frostbite."
    },
    {
      icon: <Mountain className="w-6 h-6 text-amber-400" />,
      title: safeT.guide_sec2_title || "2. Automatic Avalanche Rerouting",
      badge: safeT.guide_sec2_badge || "Multi-Modal Detours",
      badgeColor: "bg-amber-950/80 text-amber-300 border-amber-600/50",
      desc: safeT.guide_sec2_desc || "When Khardung La (17,982 ft) is closed due to blizzards or avalanches, the GIS solver immediately reroutes supply convoys through Chang La and the Agham-Shyok axis, calculating extra transit time (+4.2 hrs) and fuel (+160 L)."
    },
    {
      icon: <Truck className="w-6 h-6 text-cyan-400" />,
      title: safeT.guide_sec3_title || "3. IoT Convoy & Cold-Chain Tracking",
      badge: safeT.guide_sec3_badge || "Class VIII Medical",
      badgeColor: "bg-cyan-950/80 text-cyan-300 border-cyan-600/50",
      desc: safeT.guide_sec3_desc || "Streams live telemetry from Stallion supply trucks carrying lifesaving plasma and anti-venom. It strictly monitors the +2°C to +8°C temperature window and flags electronic warfare (EW) GPS spoofing using kinematic speed limit checks."
    },
    {
      icon: <Lock className="w-6 h-6 text-purple-400" />,
      title: safeT.guide_sec4_title || "4. SHA-256 Tamper-Proof Audit Ledger",
      badge: safeT.guide_sec4_badge || "Zero-Trust Security",
      badgeColor: "bg-purple-950/80 text-purple-300 border-purple-600/50",
      desc: safeT.guide_sec4_desc || "Every supply dispatch and stock adjustment is cryptographically hash-chained with SHA-256. If an adversary attempts to secretly edit database inventory numbers, the hash mismatch immediately sounds a tamper alert."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{safeT.guide_title || "How Project Rudra Works"}</h2>
              <p className="text-xs text-slate-400">{safeT.guide_subtitle || "Indian Army 14 Corps Logistics Decision Support System"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Concepts Cards */}
        <div className="mt-5 space-y-3.5">
          {guideSections.map((sec, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-4">
              <div className="mt-0.5 p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                {sec.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{sec.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sec.badgeColor}`}>
                    {sec.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {sec.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Testing Tips */}
        <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-950 border border-cyan-800/40 text-xs text-cyan-200 flex items-center justify-between">
          <span className="font-medium">
            {safeT.guide_tip || '💡 Quick Demo Tip: Click "Simulate Avalanche Block" on the map to see real-time dynamic rerouting!'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shrink-0 ml-3"
          >
            {safeT.guide_got_it || "Got It!"}
          </button>
        </div>
      </div>
    </div>
  );
}
