import React, { useState, useEffect } from 'react';
import HeaderHUD from './components/HeaderHUD';
import ExecutiveSummaryDeck from './components/ExecutiveSummaryDeck';
import TacticalMap from './components/TacticalMap';
import DOSStockMatrix from './components/DOSStockMatrix';
import ConvoyTelemetryHUD from './components/ConvoyTelemetryHUD';
import WarGamingSandbox from './components/WarGamingSandbox';
import MasterAdminConsole from './components/MasterAdminConsole';
import CyberSecurityHUD from './components/CyberSecurityHUD';
import IndentModal from './components/IndentModal';
import WeatherForecastWidget from './components/WeatherForecastWidget';
import SystemGuideModal from './components/SystemGuideModal';
import { TRANSLATIONS, getTranslator } from './locales/translations';
import { getApiUrl, getWsUrl } from './api';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Package, 
  Truck, 
  CloudSnow, 
  Sliders, 
  ShieldCheck, 
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, ROUTES, INVENTORY, FLEET, WEATHER, WARGAME, SECURITY, ADMIN
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedIndentNode, setSelectedIndentNode] = useState(null);
  const [viewMode, setViewMode] = useState('simplified'); // 'simplified' or 'tactical'

  // Localization State with persistent storage
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      return localStorage.getItem('rudra_language') || 'en';
    } catch (e) {
      return 'en';
    }
  });
  const t = getTranslator(currentLang);

  useEffect(() => {
    try {
      localStorage.setItem('rudra_language', currentLang);
    } catch (e) {}
    document.documentElement.lang = currentLang === 'dog' ? 'doi' : currentLang;
  }, [currentLang]);

  // Tactical Core State
  const [threatLevel, setThreatLevel] = useState('HEIGHTENED');
  const [auditVerified, setAuditVerified] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [nodes, setNodes] = useState([]);
  const [passes, setPasses] = useState([]);
  const [convoyTelemetry, setConvoyTelemetry] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);

  // Web Audio Context synthesizer for military pings (100% offline, zero external assets)
  const playTacticalSound = (freq = 880, type = 'sine', duration = 0.15) => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  // Fetch Nodes & Passes
  const fetchAllData = async () => {
    try {
      const [nodesRes, passesRes, auditRes] = await Promise.all([
        fetch(getApiUrl('/api/v1/nodes/health')),
        fetch(getApiUrl('/api/v1/passes')),
        fetch(getApiUrl('/api/v1/security/audit-chain/verify'))
      ]);

      if (nodesRes.ok) {
        const nodesData = await nodesRes.json();
        setNodes(nodesData);
      }
      if (passesRes.ok) {
        const passesData = await passesRes.json();
        setPasses(passesData);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditVerified(!auditData.tamper_detected);
      }
    } catch (err) {
      console.error("Error fetching tactical data:", err);
    }
  };

  // Route Solver
  const fetchOptimizedRoute = async (blockedList = []) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/routes/optimize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_node_id: "BASE_LEH_DEPOT",
          destination_node_id: "FOP_SIACHEN_BASE",
          blocked_passes: blockedList
        })
      });
      if (res.ok) {
        const routeData = await res.json();
        setOptimizedRoute(routeData);
      }
    } catch (err) {
      console.error("Route calculation error:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchOptimizedRoute([]);
  }, []);

  // Real-Time WebSocket Telemetry Connection with REST Polling Fallback
  useEffect(() => {
    let ws;
    let pollInterval;

    const connectWebSocket = () => {
      const wsUrl = getWsUrl('/ws/telemetry');

      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setConvoyTelemetry(data);
          } catch (e) {}
        };
        ws.onerror = () => {
          fallbackPolling();
        };
      } catch (e) {
        fallbackPolling();
      }
    };

    const fallbackPolling = () => {
      if (!pollInterval) {
        pollInterval = setInterval(async () => {
          try {
            const res = await fetch(getApiUrl('/api/v1/telemetry/live'));
            if (res.ok) {
              const data = await res.json();
              setConvoyTelemetry(data);
            }
          } catch (e) {}
        }, 2000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Pass Toggle Handler
  const handleTogglePass = async (passId, newBlockedState) => {
    playTacticalSound(newBlockedState ? 340 : 880, 'triangle', 0.25);
    try {
      const res = await fetch(getApiUrl('/api/v1/passes/toggle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pass_id: passId,
          is_blocked: newBlockedState,
          hazard_reason: newBlockedState ? "AVALANCHE" : "CLEAR",
          user_id: "HQ_14C_WATCH"
        })
      });
      if (res.ok) {
        await fetchAllData();
        const activeBlocked = newBlockedState ? [passId] : [];
        await fetchOptimizedRoute(activeBlocked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Threat Level Toggle
  const handleThreatChange = async (newThreat) => {
    playTacticalSound(620, 'sine', 0.1);
    setThreatLevel(newThreat);
    try {
      await fetch(getApiUrl(`/api/v1/admin/threat-level?threat_level=${newThreat}`), { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // GPS Spoof Simulator Toggle
  const handleToggleSpoof = async () => {
    const nextSpoofState = !convoyTelemetry?.is_spoofed;
    playTacticalSound(nextSpoofState ? 220 : 660, 'sawtooth', 0.3);
    try {
      await fetch(getApiUrl('/api/v1/telemetry/simulate-spoof'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          convoy_id: "CNV_14C_08",
          enable_spoof: nextSpoofState
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Blizzard Trigger Handler from Weather Widget
  const handleBlizzardTriggered = async (isBlizzard) => {
    playTacticalSound(isBlizzard ? 280 : 750, 'sawtooth', 0.3);
    await handleTogglePass('PASS_KHARDUNG_LA', isBlizzard);
  };

  const navTabs = [
    { id: 'OVERVIEW', label: t.tab_overview, icon: <LayoutDashboard className="w-4 h-4" />, badge: null },
    { id: 'ROUTES', label: t.tab_routes, icon: <MapIcon className="w-4 h-4" />, badge: passes.some(p => p.is_blocked) ? t.badge_detour : null },
    { id: 'INVENTORY', label: t.tab_inventory, icon: <Package className="w-4 h-4" />, badge: nodes.filter(n => n.overall_status === 'CRITICAL').length > 0 ? `${nodes.filter(n => n.overall_status === 'CRITICAL').length} ${t.badge_low}` : null },
    { id: 'FLEET', label: t.tab_fleet, icon: <Truck className="w-4 h-4" />, badge: convoyTelemetry?.is_spoofed ? t.badge_ew_alert : t.badge_live },
    { id: 'WEATHER', label: t.tab_weather, icon: <CloudSnow className="w-4 h-4" />, badge: null },
    { id: 'WARGAME', label: t.tab_wargame, icon: <Sliders className="w-4 h-4" />, badge: null },
    { id: 'SECURITY', label: t.tab_security, icon: <ShieldCheck className="w-4 h-4" />, badge: 'SHA-256' },
    { id: 'ADMIN', label: t.tab_admin, icon: <Settings className="w-4 h-4" />, badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#A2BAA5] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-900">
      {/* Modern Command Header */}
      <HeaderHUD
        threatLevel={threatLevel}
        onThreatChange={handleThreatChange}
        auditVerified={auditVerified}
        isSpoofed={convoyTelemetry?.is_spoofed}
        criticalNodesCount={nodes.filter(n => n.overall_status === 'CRITICAL').length}
        audioEnabled={audioEnabled}
        onAudioToggle={() => {
          setAudioEnabled(!audioEnabled);
          if (!audioEnabled) playTacticalSound(880, 'sine', 0.1);
        }}
        onOpenAudit={() => setShowAuditModal(true)}
        currentLang={currentLang}
        onLanguageChange={(l) => {
          playTacticalSound(720, 'sine', 0.08);
          setCurrentLang(l);
        }}
        t={t}
        viewMode={viewMode}
        onToggleViewMode={() => {
          playTacticalSound(600, 'sine', 0.08);
          setViewMode(viewMode === 'simplified' ? 'tactical' : 'simplified');
        }}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Main Tab Navigation Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-2 sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1.5 shrink-0">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    playTacticalSound(700, 'sine', 0.05);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      tab.badge.includes(t.badge_low) || tab.badge.includes(t.badge_ew_alert) || tab.badge.includes(t.badge_detour) || tab.badge.includes('Low') || tab.badge.includes('Alert') || tab.badge.includes('Detour')
                        ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Guide Pill */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="hidden lg:flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 transition-colors shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.how_it_works}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1920px] mx-auto w-full">
        {/* TAB 1: EXECUTIVE COMMAND OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Top 4 Executive KPI Cards */}
            <ExecutiveSummaryDeck
              nodes={nodes}
              passes={passes}
              convoyTelemetry={convoyTelemetry}
              optimizedRoute={optimizedRoute}
              onTogglePass={handleTogglePass}
              onOpenIndentModal={(node) => setSelectedIndentNode(node)}
              onSwitchTab={(tab) => setActiveTab(tab)}
              t={t}
            />

            {/* Split View: Interactive Map & Outpost Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Interactive Supply Route Corridor Map (7 cols) */}
              <div className="lg:col-span-7 h-[500px]">
                <TacticalMap
                  passes={passes}
                  onTogglePass={handleTogglePass}
                  convoyTelemetry={convoyTelemetry}
                  optimizedRoute={optimizedRoute}
                  onRefreshRoute={() => fetchOptimizedRoute([])}
                  t={t}
                />
              </div>

              {/* Right: Outpost Inventory Reserves (5 cols) */}
              <div className="lg:col-span-5 h-[500px]">
                <DOSStockMatrix
                  nodes={nodes}
                  onOpenIndentModal={(node) => setSelectedIndentNode(node)}
                  onQuickAuthorize={() => fetchAllData()}
                  t={t}
                />
              </div>
            </div>

            {/* Bottom Row: Convoy Telemetry + SASE Weather Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 min-h-[340px]">
                <ConvoyTelemetryHUD
                  telemetry={convoyTelemetry}
                  onToggleSpoof={handleToggleSpoof}
                  t={t}
                />
              </div>

              <div className="lg:col-span-6 min-h-[340px]">
                <WeatherForecastWidget
                  t={t}
                  onBlizzardTriggered={handleBlizzardTriggered}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CORRIDORS & ROUTING */}
        {activeTab === 'ROUTES' && (
          <div className="space-y-4">
            <div className="glass-card p-4 border-slate-800 bg-slate-900/60">
              <h2 className="text-base font-bold text-white mb-1">{t.corridor_explanation_title}</h2>
              <p className="text-xs text-slate-300">
                {t.corridor_explanation_desc}
              </p>
            </div>
            <div className="h-[620px]">
              <TacticalMap
                passes={passes}
                onTogglePass={handleTogglePass}
                convoyTelemetry={convoyTelemetry}
                optimizedRoute={optimizedRoute}
                onRefreshRoute={() => fetchOptimizedRoute([])}
                t={t}
              />
            </div>
          </div>
        )}

        {/* TAB 3: OUTPOST SUPPLIES (DOS) */}
        {activeTab === 'INVENTORY' && (
          <div className="space-y-4">
            <div className="glass-card p-4 border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white mb-1">{t.outpost_page_title}</h2>
                <p className="text-xs text-slate-300">
                  {t.outpost_page_desc}
                </p>
              </div>
              <button
                onClick={() => fetchAllData()}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                {t.refresh_stock}
              </button>
            </div>
            <div className="min-h-[580px]">
              <DOSStockMatrix
                nodes={nodes}
                onOpenIndentModal={(node) => setSelectedIndentNode(node)}
                onQuickAuthorize={() => fetchAllData()}
                t={t}
              />
            </div>
          </div>
        )}

        {/* TAB 4: CONVOY FLEET & COLD CHAIN */}
        {activeTab === 'FLEET' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="glass-card p-4 border-slate-800 bg-slate-900/60">
              <h2 className="text-base font-bold text-white mb-1">{t.fleet_page_title}</h2>
              <p className="text-xs text-slate-300">
                {t.fleet_page_desc}
              </p>
            </div>
            <ConvoyTelemetryHUD
              telemetry={convoyTelemetry}
              onToggleSpoof={handleToggleSpoof}
              t={t}
            />
          </div>
        )}

        {/* TAB 5: WEATHER & SASE */}
        {activeTab === 'WEATHER' && (
          <div className="max-w-5xl mx-auto">
            <WeatherForecastWidget
              t={t}
              onBlizzardTriggered={handleBlizzardTriggered}
            />
          </div>
        )}

        {/* TAB 6: WAR GAMING */}
        {activeTab === 'WARGAME' && (
          <div className="max-w-5xl mx-auto">
            <WarGamingSandbox targetNodes={nodes} t={t} />
          </div>
        )}

        {/* TAB 7: CYBER DEFENSE & AUDIT */}
        {activeTab === 'SECURITY' && (
          <div className="max-w-5xl mx-auto">
            <CyberSecurityHUD onClose={() => { setActiveTab('OVERVIEW'); fetchAllData(); }} t={t} />
          </div>
        )}

        {/* TAB 8: ADMIN & SETTINGS */}
        {activeTab === 'ADMIN' && (
          <div className="max-w-5xl mx-auto">
            <MasterAdminConsole onRefreshData={() => fetchAllData()} t={t} />
          </div>
        )}
      </main>

      {/* Cryptographic SHA-256 Audit Ledger Modal */}
      {showAuditModal && (
        <CyberSecurityHUD onClose={() => { setShowAuditModal(false); fetchAllData(); }} t={t} />
      )}

      {/* System Guide Modal */}
      {showGuideModal && (
        <SystemGuideModal onClose={() => setShowGuideModal(false)} t={t} />
      )}

      {/* Smart Indent Authorization Modal */}
      {selectedIndentNode && (
        <IndentModal
          node={selectedIndentNode}
          onClose={() => setSelectedIndentNode(null)}
          onAuthorized={() => {
            playTacticalSound(960, 'sine', 0.2);
            fetchAllData();
          }}
          t={t}
        />
      )}
    </div>
  );
}
