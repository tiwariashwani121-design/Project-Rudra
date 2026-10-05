import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Terminal,
  Bug,
  Wrench
} from 'lucide-react';

export default function CyberSecurityHUD({ onClose, t }) {
  const safeT = t || ((k) => k);
  const [verification, setVerification] = useState(null);
  const [auditEntries, setAuditEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [verRes, entriesRes] = await Promise.all([
        fetch('/api/v1/security/audit-chain/verify'),
        fetch('/api/v1/security/audit-chain/entries')
      ]);

      if (verRes.ok) {
        const verData = await verRes.json();
        setVerification(verData);
      }
      if (entriesRes.ok) {
        const entriesData = await entriesRes.json();
        setAuditEntries(entriesData);
      }
    } catch (err) {
      console.error("Failed to fetch audit ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleSimulateTamper = async () => {
    try {
      const res = await fetch('/api/v1/security/audit-chain/simulate-tamper', { method: 'POST' });
      const data = await res.json();
      setActionMessage(`⚠️ ${data.message}`);
      await fetchAuditData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepairChain = async () => {
    try {
      const res = await fetch('/api/v1/security/audit-chain/repair', { method: 'POST' });
      const data = await res.json();
      setActionMessage(`✅ ${data.message}`);
      await fetchAuditData();
    } catch (err) {
      console.error(err);
    }
  };

  const isTampered = verification?.tamper_detected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isTampered ? (
              <ShieldAlert className="w-6 h-6 text-rose-500 animate-spin" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            )}
            <div>
              <h2 className="text-base font-bold text-white">
                {safeT.cyber_title || "Military Cyber Defense · SHA-256 Audit Ledger"}
              </h2>
              <span className="text-xs text-slate-400">
                {safeT.cyber_subtitle || "Cryptographic zero-trust tamper detection for forward supply chains"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            ✕ {safeT.close || 'Close'}
          </button>
        </div>

        {/* Status Verification Shield Banner */}
        <div className="p-4 border-b border-slate-800">
          <div className={`p-4 rounded-lg border flex flex-col md:flex-row items-center justify-between gap-4 ${
            isTampered
              ? 'bg-rose-950/70 border-rose-600 text-rose-200 hud-glow-red animate-pulse'
              : 'bg-emerald-950/50 border-emerald-600 text-emerald-200 hud-glow-green'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isTampered ? 'bg-rose-900 border border-rose-500' : 'bg-emerald-900 border border-emerald-500'
              }`}>
                {isTampered ? <ShieldAlert className="w-6 h-6 text-rose-300" /> : <Lock className="w-6 h-6 text-emerald-300" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {isTampered ? `🔴 ${safeT.tamper_detected_alert || 'CRITICAL: INTEGRITY COMPROMISE DETECTED'}` : `🟢 ${safeT.integrity_verified || 'CRYPTOGRAPHICALLY VERIFIED & SECURE'}`}
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  {verification?.status || 'Analyzing cryptographic chain hash links...'}
                </p>
                <div className="text-[10px] text-slate-400 mt-1">
                  Block Count: {verification?.chain_length || 0} | Verified At: {verification?.verified_at || 'Just now'}
                </div>
              </div>
            </div>

            {/* Hackathon Interactive Demonstration Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSimulateTamper}
                className="px-3 py-1.5 rounded bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                title="Simulates insider tampering in SQLite database"
              >
                <Bug className="w-3.5 h-3.5" />
                {safeT.simulate_tamper || "SIMULATE TAMPER ATTACK"}
              </button>

              <button
                onClick={handleRepairChain}
                className="px-3 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                title="Re-anchors and signs broken hash blocks"
              >
                <Wrench className="w-3.5 h-3.5" />
                {safeT.repair_chain || "RE-SIGN CHAIN"}
              </button>

              <button
                onClick={fetchAuditData}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh Verification"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {actionMessage && (
            <div className="mt-2 text-xs text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/50">
              {actionMessage}
            </div>
          )}
        </div>

        {/* Ledger Blocks Table */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
          <div className="text-xs text-slate-400 uppercase font-bold mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>{safeT.ledger_transactions || "TRANSACTION BLOCKS"} ({auditEntries.length})</span>
          </div>

          <div className="space-y-2.5">
            {auditEntries.map((entry) => {
              const isCompromisedBlock = isTampered && verification?.compromised_block_index === entry.audit_id;

              return (
                <div
                  key={entry.audit_id}
                  className={`p-3 rounded border text-xs transition-all ${
                    isCompromisedBlock
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400">BLOCK #{entry.audit_id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {entry.action_type}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Officer: <span className="text-slate-200">{entry.executed_by_user_id}</span> | {entry.timestamp}
                    </div>
                  </div>

                  {/* Hash Signatures */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono mt-2">
                    <div>
                      <span className="text-slate-500 block">PREV HASH:</span>
                      <span className="text-slate-400 truncate block">{entry.prev_hash}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">BLOCK SIGNATURE (SHA-256):</span>
                      <span className={isCompromisedBlock ? "text-rose-400 font-bold truncate block" : "text-emerald-400 truncate block"}>
                        {entry.current_hash}
                      </span>
                    </div>
                  </div>

                  {/* Details JSON */}
                  <div className="mt-2 p-1.5 rounded bg-slate-900/90 text-[10px] text-slate-400 overflow-x-auto">
                    Payload: {JSON.stringify(entry.details)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
