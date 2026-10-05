import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Globe, 
  Lock, 
  Info,
  HelpCircle,
  AlertTriangle,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import { TRANSLATIONS, getTranslator } from '../locales/translations';

export default function HeaderHUD({ 
  threatLevel = 'HEIGHTENED', 
  onThreatChange, 
  auditVerified = true, 
  isSpoofed = false,
  criticalNodesCount = 0,
  onAudioToggle,
  audioEnabled = false,
  onOpenAudit,
  currentLang = 'en',
  onLanguageChange,
  t,
  viewMode = 'simplified',
  onToggleViewMode,
  onOpenGuide
}) {
  const safeT = t || getTranslator(currentLang);
  const [timeState, setTimeState] = useState({
    ist: '',
    zulu: ''
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-GB', { 
        timeZone: 'Asia/Kolkata', 
        hour12: false 
      });
      const zuluHours = String(now.getUTCHours()).padStart(2, '0');
      const zuluMins = String(now.getUTCMinutes()).padStart(2, '0');
      const zuluSecs = String(now.getUTCSeconds()).padStart(2, '0');

      setTimeState({
        ist: `${istString} IST`,
        zulu: `${zuluHours}:${zuluMins}:${zuluSecs}Z`
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'dog', label: 'डोगरी' }
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      {/* Primary Top Bar */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Military Crest */}
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-900/60 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Compass className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            {/* Live status dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/50">
                {safeT.command_hq}
              </span>
              <span className="text-[11px] text-slate-400">{safeT.sector_name}</span>
            </div>
            <h1 className="text-lg font-extrabold tracking-wide text-white flex items-center gap-2">
              <span>{safeT.app_title}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 font-medium">
                {safeT.app_subtitle}
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Live Clocks & Threat Status */}
        <div className="flex items-center gap-3">
          {/* Synchronized Clocks */}
          <div className="hidden sm:flex items-center space-x-3 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div className="flex items-center space-x-2.5">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">{safeT.local_clock}</span>
                <span className="font-bold text-slate-100 tabular-nums">{timeState.ist || '00:00:00 IST'}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div>
                <span className="text-[9px] uppercase font-bold text-cyan-400 block leading-tight">{safeT.zulu_clock}</span>
                <span className="font-bold text-cyan-300 tabular-nums">{timeState.zulu || '00:00:00Z'}</span>
              </div>
            </div>
          </div>

          {/* Threat Readiness Selector */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 hidden md:inline">{safeT.defcon_label}</span>
            {[
              { id: 'PEACE', label: safeT.threat_peace, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60' },
              { id: 'HEIGHTENED', label: safeT.threat_heightened, color: 'bg-amber-500/20 text-amber-300 border-amber-500/60' },
              { id: 'ACTIVE', label: safeT.threat_active, color: 'bg-rose-500/20 text-rose-300 border-rose-500/60 animate-pulse' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onThreatChange(item.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  threatLevel === item.id 
                    ? `${item.color} border shadow-sm font-bold` 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Controls, View Mode & Security */}
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle (Simplified vs Full Tactical) */}
          <button
            onClick={onToggleViewMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              viewMode === 'simplified'
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
            title="Toggle between clean executive view and full tactical telemetry"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{viewMode === 'simplified' ? safeT.mode_executive : safeT.mode_tactical}</span>
          </button>

          {/* Cryptographic SHA-256 Audit Status */}
          <button
            onClick={onOpenAudit}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              auditVerified
                ? 'bg-emerald-950/50 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-rose-950/80 border-rose-600 text-rose-200 animate-bounce'
            }`}
            title="Cryptographic SHA-256 Blockchain Ledger. Click to inspect or simulate tamper."
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{auditVerified ? safeT.sha_verified : safeT.tamper_detected}</span>
          </button>

          {/* Audio Ping Toggle */}
          <button
            onClick={onAudioToggle}
            className={`p-2 rounded-xl border transition-all ${
              audioEnabled 
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-400 shadow-sm' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={audioEnabled ? safeT.tactical_audio_on : safeT.tactical_audio_off}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-slate-900 border border-cyan-500/50 text-cyan-300 font-semibold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm"
              title="Select Command Language (English, Hindi, Punjabi, Dogri)"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">{l.label}</option>
              ))}
            </select>
          </div>

          {/* Interactive System Guide Modal */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
              title={safeT.how_it_works}
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </button>
          )}
        </div>
      </div>

      {/* Operational Highlights Banner */}
      <div className="bg-slate-900/80 border-t border-slate-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2 shrink-0 pr-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
            {safeT.sector_alerts}
          </span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full text-xs">
          <div className="inline-block animate-marquee space-x-8 text-slate-300">
            <span className="text-emerald-400 font-medium">
              {safeT.ticker_pass_clear}
            </span>
            <span className="text-amber-300 font-medium">
              {safeT.ticker_weather_advisory}
            </span>
            <span className="text-rose-400 font-medium">
              {safeT.ticker_kerosene_warning}
            </span>
            <span className="text-cyan-300 font-medium">
              {safeT.ticker_convoy_safe}
            </span>
          </div>
        </div>

        {isSpoofed && (
          <div className="shrink-0 pl-3">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-900/80 border border-purple-500 text-purple-200 font-bold text-xs animate-pulse flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
              {safeT.gps_spoof_detected}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
