import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../api';
import { 
  CloudSnow, 
  Wind, 
  Eye, 
  AlertTriangle, 
  Thermometer, 
  Compass, 
  Zap, 
  CheckCircle2, 
  RefreshCw,
  Sun,
  CloudHail
} from 'lucide-react';

export default function WeatherForecastWidget({ t, onBlizzardTriggered }) {
  const [currentWeather, setCurrentWeather] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('FOP_SIACHEN_BASE');
  const [forecastData, setForecastData] = useState(null);
  const [isBlizzardActive, setIsBlizzardActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    try {
      const [currRes, foreRes] = await Promise.all([
        fetch(getApiUrl('/api/v1/weather/current')),
        fetch(getApiUrl(`/api/v1/weather/forecast?location_id=${selectedLocation}&days=7`))
      ]);
      if (currRes.ok) {
        const curr = await currRes.json();
        setCurrentWeather(curr);
      }
      if (foreRes.ok) {
        const fore = await foreRes.json();
        setForecastData(fore);
      }
    } catch (err) {
      console.error("Failed to load weather:", err);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const handleToggleBlizzard = async () => {
    const nextState = !isBlizzardActive;
    setIsBlizzardActive(nextState);
    try {
      const res = await fetch(getApiUrl('/api/v1/weather/simulate-blizzard'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: "PASS_KHARDUNG_LA",
          enable: nextState
        })
      });
      if (res.ok) {
        await fetchWeather();
        if (onBlizzardTriggered) onBlizzardTriggered(nextState);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const safeT = t || ((k) => k);

  const getAvalancheBadge = (risk) => {
    switch (risk) {
      case 'LEVEL_4_EXTREME':
        return 'bg-rose-950 text-rose-300 border-rose-500 font-bold animate-pulse';
      case 'LEVEL_3_HIGH':
        return 'bg-orange-950 text-orange-300 border-orange-500 font-bold';
      case 'LEVEL_2_MODERATE':
        return 'bg-amber-950 text-amber-300 border-amber-500';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-500';
    }
  };

  return (
    <div className="hud-card rounded-lg flex flex-col h-full bg-slate-900 border border-slate-800">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CloudSnow className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            {safeT.weather_title}
          </h2>
        </div>

        {/* Blizzard Demonstration Toggle */}
        <button
          onClick={handleToggleBlizzard}
          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-all flex items-center gap-1.5 ${
            isBlizzardActive
              ? 'bg-rose-900/80 border-rose-500 text-rose-200 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40'
          }`}
          title="Simulate sudden Himalayan blizzard at Khardung La Pass"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          {isBlizzardActive ? safeT.btn_calm_blizzard : safeT.btn_trigger_blizzard}
        </button>
      </div>

      <div className="p-4 space-y-4 font-mono text-xs">
        {/* Active SASE / DGRE Meteorological Alert Banner */}
        {isBlizzardActive && (
          <div className="p-3 rounded bg-rose-950/70 border border-rose-600 text-rose-200 flex items-start gap-2.5 hud-glow-red animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase text-[11px] block text-rose-300">
                {safeT.sase_alert_title || 'SASE RED ALERT: LEVEL 4 EXTREME BLIZZARD & AVALANCHE WARNING'}
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {safeT.sase_alert_desc || 'Khardung La Pass experiencing 55 km/h winds, -39.5°C wind chill, and heavy snow accumulation (45 cm). Ground pass access is SEVERED. Automatic diversion to Agham-Shyok corridor initiated.'}
              </p>
            </div>
          </div>
        )}

        {/* Current Observations Grid Across Himalayan Corridor */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center justify-between">
            <span>{safeT.current_weather}</span>
            <span className="text-slate-500">DGRE / SASE REAL-TIME TELEMETRY</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentWeather.slice(0, 4).map((item) => {
              const isSelected = selectedLocation === item.location_id;
              const isHighRisk = item.avalanche_risk === 'LEVEL_4_EXTREME' || item.avalanche_risk === 'LEVEL_3_HIGH';

              return (
                <div
                  key={item.location_id}
                  onClick={() => setSelectedLocation(item.location_id)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 hud-glow-cyan'
                      : isHighRisk
                      ? 'bg-rose-950/20 border-rose-800 hover:border-rose-600'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-slate-200 text-[11px] truncate">
                      {item.name}
                    </span>
                    <span className={`text-[9px] px-1 py-0.5 rounded border uppercase ${getAvalancheBadge(item.avalanche_risk)}`}>
                      {item.avalanche_risk.replace('LEVEL_', 'LVL ')}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold tabular-nums text-slate-100">
                        {item.temperature_c}°C
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {t.wind_chill}: <strong className="text-cyan-300">{item.wind_chill_c}°C</strong>
                      </span>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <div>{item.wind_speed_kmh} km/h</div>
                      <div className="text-cyan-400">{item.snowfall_cm_24h} cm snow</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Forward Weather Forecast Timeline for Selected Location */}
        {forecastData && (
          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CloudHail className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200 text-xs">
                  {forecastData.location_name} // {t.forward_forecast}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                HORIZON: 7 DAYS (MET SIMULATOR)
              </span>
            </div>

            {/* 7 Day Mini Cards */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {forecastData.forecast.map((day) => {
                const isCold = day.temp_min_c < -25;
                const hasSnow = day.snowfall_cm > 5;

                return (
                  <div key={day.day_index} className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">
                      {day.weekday}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {day.date}
                    </span>

                    <div className="my-1.5 flex justify-center">
                      {hasSnow ? (
                        <CloudSnow className="w-4 h-4 text-cyan-400 animate-pulse" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-400" />
                      )}
                    </div>

                    <div className="text-[11px] font-bold text-slate-200 tabular-nums">
                      {day.temp_max_c}°
                    </div>
                    <div className="text-[9px] text-slate-400 tabular-nums">
                      {day.temp_min_c}°
                    </div>

                    <div className="mt-1 text-[8.5px] text-cyan-300 font-bold">
                      {day.snowfall_cm}cm
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
              <span>{forecastData.meteorological_warning}</span>
              <span className="text-emerald-400 font-bold">ACCURACY INDEX: 94.2%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
