import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  ShieldAlert, 
  Crosshair, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Plane, 
  Fuel, 
  Users, 
  Lock, 
  Unlock, 
  Zap, 
  Play, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Activity,
  Layers,
  FastForward,
  Gauge
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ReconAircraft } from '../../../data/reconAircraft';
import { ReconIntelTarget, ReconState, Aircraft, Crew } from '../../../types';
import { WEAPON_OPTIONS } from '../../../engine/reconEngine';
import { MilitaryAirport, MILITARY_AIRPORTS } from '../../../airports';
import { AirportSelector } from '../AirportSelector';

interface ReconIntelConsoleProps {
  language: 'id' | 'en';
  reconState: ReconState;
  selectedRecon: ReconAircraft;
  playerAircraft: Aircraft;
  playerCrew: Crew;
  onSetPlayerCrew: (c: Crew) => void;
  homeAirbase: MilitaryAirport;
  strikeLandingBase: MilitaryAirport;
  onSelectStrikeLandingBase: (ap: MilitaryAirport) => void;
  targetLatInput: string;
  onSetTargetLatInput: (val: string) => void;
  targetLngInput: string;
  onSetTargetLngInput: (val: string) => void;
  selectedWeaponId: string;
  onSelectWeapon: (id: string) => void;
  useSubTank: boolean;
  onSetUseSubTank: (use: boolean) => void;
  onScrambleStrike: () => void;
  onEngageTarget: () => void;
  isPlayerAirborne: boolean;
  isTargetLocked: boolean;
  isStrikeCompleted: boolean;
  simulationSpeed?: number;
  onSetSimulationSpeed?: (s: number) => void;
}

export const ReconIntelConsole: React.FC<ReconIntelConsoleProps> = ({
  language,
  reconState,
  selectedRecon,
  playerAircraft,
  playerCrew,
  onSetPlayerCrew,
  homeAirbase,
  strikeLandingBase,
  onSelectStrikeLandingBase,
  targetLatInput,
  onSetTargetLatInput,
  targetLngInput,
  onSetTargetLngInput,
  selectedWeaponId,
  onSelectWeapon,
  useSubTank,
  onSetUseSubTank,
  onScrambleStrike,
  onEngageTarget,
  isPlayerAirborne,
  isTargetLocked,
  isStrikeCompleted,
  simulationSpeed = 1,
  onSetSimulationSpeed
}) => {
  const [arrSearch, setArrSearch] = useState('');
  const activeTarget = reconState.detectedTargets[reconState.activeTargetIndex] || null;

  const handleAutoFillCoordinates = (target: ReconIntelTarget) => {
    onSetTargetLatInput(target.lat.toFixed(4));
    onSetTargetLngInput(target.lng.toFixed(4));
    // Auto-select recommended weapon if available
    const matched = WEAPON_OPTIONS.find(w => w.suitableFor.includes(target.actionRequired));
    if (matched) {
      onSelectWeapon(matched.id);
    }
  };

  const getActionLabel = (action: ReconIntelTarget['actionRequired']) => {
    switch (action) {
      case 'pengeboman':
        return language === 'id' ? 'PENGEBOMAN (PRECISION BOMBING)' : 'PRECISION BOMBING';
      case 'penghancuran':
        return language === 'id' ? 'PENGHANCURAN (SEARCH & DESTROY)' : 'SEARCH & DESTROY';
      case 'surveillance':
        return language === 'id' ? 'INSPEKSI INTELIJEN (SURVEILLANCE)' : 'SURVEILLANCE';
      case 'escorting':
        return language === 'id' ? 'PENGAWALAN & INTERSEPSI (CAP)' : 'CAP / INTERCEPT';
      default:
        return String(action || '').toUpperCase();
    }
  };

  return (
    <div className="space-y-4 text-white">
      {/* 1. RECON TELEMETRY & RECON FLIGHT STATUS */}
      <div className="p-3.5 bg-gradient-to-br from-[#0a182a] to-[#040d18] border border-cyan-500/30 rounded-2xl space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              {language === 'id' ? 'STATUS PESAWAT INTAI UDARA' : 'AIRBORNE RECON TELEMETRY'}
            </span>
          </div>
          <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {selectedRecon.name}
          </span>
        </div>

        {/* Live scanning progress bar */}
        <div className="p-2.5 bg-black/50 border border-white/5 rounded-xl space-y-1.5 font-mono text-[9px]">
          <div className="flex items-center justify-between text-white/70">
            <span>
              {language === 'id' ? 'Sensor Radar & Kamera FLIR:' : 'FLIR & Radar Sensor Scan:'}
            </span>
            <span className="font-bold text-cyan-400">
              {reconState.reconFlight.scanProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${reconState.reconFlight.scanProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[7.5px] text-white/40">
            <span>ALT: {reconState.reconFlight.altitude.toLocaleString()} FT</span>
            <span>SPD: {reconState.reconFlight.speed} KTS</span>
            <span>HDG: {Math.round(reconState.reconFlight.heading)}°</span>
          </div>
        </div>

        {/* Speed Acceleration Controls in Recon Console */}
        {onSetSimulationSpeed && (
          <div className="p-2 bg-black/40 border border-cyan-500/20 rounded-xl space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[8px]">
              <span className="flex items-center gap-1 text-cyan-300 font-bold uppercase tracking-wider">
                <FastForward className="w-3 h-3 text-cyan-400" />
                {language === 'id' ? 'Percepatan Game (Simulation Speed):' : 'Simulation Speed Acceleration:'}
              </span>
              <span className="font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/40">
                {simulationSpeed}x
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 5, 10, 20, 50].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSetSimulationSpeed(s)}
                  className={cn(
                    "py-1 rounded text-[8px] font-bold font-mono transition-all border",
                    simulationSpeed === s
                      ? "bg-cyan-500 text-black border-cyan-300 shadow-md shadow-cyan-500/30 scale-105"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-cyan-500/20 hover:text-cyan-200"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. SQUADRON HANGAR STANDBY NOTIFICATION */}
      <div className={cn(
        "p-3 rounded-xl border flex items-center justify-between transition-all",
        !isPlayerAirborne
          ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
      )}>
        <div className="flex items-center gap-2">
          <Plane className={cn("w-4 h-4", !isPlayerAirborne ? "text-amber-400 animate-pulse" : "text-emerald-400")} />
          <div>
            <p className="text-[10px] font-black uppercase">
              {!isPlayerAirborne
                ? (language === 'id' ? 'SKUADRON TEMPUR: STANDBY DI HANGAR' : 'STRIKE SQUADRON: STANDBY IN HANGAR')
                : (language === 'id' ? 'SKUADRON TEMPUR: AIRBORNE SCRAMBLE' : 'STRIKE SQUADRON: AIRBORNE SCRAMBLE')}
            </p>
            <p className="text-[8px] text-white/50 font-mono">
              {!isPlayerAirborne
                ? (language === 'id' ? `Siap di ${homeAirbase.icao} (${playerAircraft.name}) menanti koordinat intai` : `Ready at ${homeAirbase.icao} (${playerAircraft.name}) waiting for recon target`)
                : (language === 'id' ? `Menuju koordinat sasaran intai (${targetLatInput}, ${targetLngInput})` : `Vectoring to recon target coordinates (${targetLatInput}, ${targetLngInput})`)}
            </p>
          </div>
        </div>
        <span className={cn(
          "text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase",
          !isPlayerAirborne ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        )}>
          {!isPlayerAirborne ? 'STANDBY' : 'SCRAMBLE ACTIVE'}
        </span>
      </div>

      {/* 3. DETECTED RECON INTEL TARGETS & COMMANDS */}
      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
              {language === 'id' ? 'Laporan Intelijen Sasaran (Discovered Intel Targets)' : 'Discovered Intel Targets'}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {reconState.detectedTargets.length > 1 && (
              <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                {reconState.detectedTargets.filter(t => t.isEliminated).length} / {reconState.detectedTargets.length} {language === 'id' ? 'SELESAI' : 'DONE'}
              </span>
            )}
            <span className="text-[9px] font-mono text-cyan-300 font-bold">
              {reconState.detectedTargets.length} {language === 'id' ? 'Sasaran' : 'Targets'}
            </span>
          </div>
        </div>

        {reconState.detectedTargets.length === 0 ? (
          <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-1.5">
            <Radio className="w-6 h-6 text-cyan-400 mx-auto animate-bounce" />
            <p className="text-[10px] font-bold text-cyan-200 uppercase">
              {language === 'id' ? 'Pesawat Intai Sedang Menyisir Sektor...' : 'Recon Aircraft Scanning Sector...'}
            </p>
            <p className="text-[8px] text-white/40">
              {language === 'id' 
                ? 'Pantau pergerakan pesawat intai di radar. Begitu mencapai titik survey (laut/darat), target dan misi tempur acak akan terdeteksi di sini.'
                : 'Monitor recon flight on radar. When survey points (sea/land) are reached, randomized tactical missions will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reconState.detectedTargets.map((target, idx) => {
              const isSelected = idx === reconState.activeTargetIndex;
              const isSea = target.environment === 'sea';
              return (
                <div
                  key={target.id}
                  className={cn(
                    "p-3.5 rounded-xl border space-y-2.5 transition-all text-xs font-mono relative overflow-hidden",
                    target.isEliminated
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : isSelected
                      ? "bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] text-white"
                      : "bg-[#0d1726] border-white/10 text-white/80"
                  )}
                >
                  {/* Top Badges: Target Number, Sea/Land, and Threat Level */}
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-[7.5px] font-bold text-red-300">
                        #{idx + 1}
                      </span>
                      <Crosshair className={cn("w-3.5 h-3.5", target.isEliminated ? "text-emerald-400" : "text-red-400")} />
                      <span className="font-black text-[11px] text-white uppercase">{target.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Sea / Land Tag */}
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase border",
                        isSea 
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" 
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      )}>
                        {isSea ? (language === 'id' ? '🌊 LAUT' : '🌊 SEA') : (language === 'id' ? '🏔️ DARAT' : '🏔️ LAND')}
                      </span>

                      {/* Threat Status */}
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[7.5px] font-bold uppercase border",
                        target.isEliminated
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                      )}>
                        {target.isEliminated ? (language === 'id' ? '✓ DILUMPUHKAN' : '✓ NEUTRALIZED') : target.threatLevel}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Randomized Tactical Mission Badge */}
                  {target.assignedMission && (
                    <div className="p-2 bg-gradient-to-r from-blue-950/80 to-purple-950/80 border border-blue-500/30 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="text-[8px] font-bold text-white/60 uppercase">
                          {language === 'id' ? 'Tipe Misi Tempur Terpilih:' : 'Assigned Fighter Mission:'}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-amber-300 font-mono tracking-wider bg-black/40 px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                        🎯 {target.assignedMission}
                      </span>
                    </div>
                  )}

                  <p className="text-[8.5px] text-white/70 font-sans leading-relaxed">
                    {language === 'id' ? target.descriptionId : target.descriptionEn}
                  </p>

                  <div className="p-2.5 bg-black/50 rounded-lg border border-white/5 space-y-1 text-[8px]">
                    <div className="flex justify-between items-center text-amber-300 font-bold">
                      <span>{language === 'id' ? 'PERINTAH PESAWAT INTAI:' : 'RECON DIRECTIVE:'}</span>
                      <span>{getActionLabel(target.actionRequired)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span>{language === 'id' ? 'Koordinat Target:' : 'Target Coordinates:'}</span>
                      <span className="text-cyan-300 font-bold font-mono">{target.lat.toFixed(4)}, {target.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span>{language === 'id' ? 'Senjata Dianjurkan:' : 'Recommended Loadout:'}</span>
                      <span className="text-purple-300 font-bold">{target.recommendedWeapons[0]}</span>
                    </div>
                  </div>

                  {!target.isEliminated && !isPlayerAirborne && (
                    <button
                      type="button"
                      onClick={() => handleAutoFillCoordinates(target)}
                      className="w-full py-2 bg-gradient-to-r from-red-600/40 to-amber-600/40 hover:from-red-600/60 hover:to-amber-600/60 border border-red-500/40 rounded-lg text-[9px] font-black uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{language === 'id' ? `Pilih Target #${idx + 1} Untuk Scramble` : `Focus Target #${idx + 1} Coordinates`}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3.5. CREW DATA SECTION (RELOCATED DIRECTLY UNDER DISCOVERED INTEL TARGETS) */}
      <div className="p-4 bg-gradient-to-br from-[#0c1322] to-[#060a14] border border-blue-500/30 rounded-2xl space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h4 className="text-[10.5px] font-black text-cyan-300 uppercase tracking-widest">
              {language === 'id' ? 'Data Awak Pesawat Tempur (Crew Data)' : 'Fighter Aircraft Crew Data'}
            </h4>
          </div>
          <span className="text-[8px] font-mono font-bold text-white/40 uppercase">
            {playerCrew.callSign || 'EAGLE-01'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8.5px] text-white/50 uppercase font-bold tracking-wider">
                {language === 'id' ? 'Pilot Utama (Captain)' : 'Commanding Pilot'}
              </label>
              <input 
                type="text" 
                value={playerCrew.pilot}
                onChange={(e) => onSetPlayerCrew({...playerCrew, pilot: e.target.value})}
                placeholder="CAPT. ADHIATMA"
                className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8.5px] text-white/50 uppercase font-bold tracking-wider">
                {language === 'id' ? 'Kopilot (Co-Pilot / WSO)' : 'Co-Pilot / WSO'}
              </label>
              <input 
                type="text" 
                value={playerCrew.coPilot}
                onChange={(e) => onSetPlayerCrew({...playerCrew, coPilot: e.target.value})}
                placeholder="F/O. DOE"
                className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1 col-span-1">
              <label className="text-[8.5px] text-white/50 uppercase font-bold tracking-wider">
                {language === 'id' ? 'Call Sign' : 'Call Sign'}
              </label>
              <input 
                type="text" 
                value={playerCrew.callSign}
                onChange={(e) => onSetPlayerCrew({...playerCrew, callSign: e.target.value})}
                placeholder="AF-101"
                className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400 transition-all"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-[8.5px] text-white/50 uppercase font-bold tracking-wider">
                {language === 'id' ? 'Kru Kokpit' : 'Crew Count'}
              </label>
              <input 
                type="number" 
                value={playerCrew.crewCount}
                onChange={(e) => onSetPlayerCrew({...playerCrew, crewCount: parseInt(e.target.value) || 0})}
                className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-[8.5px] text-white/50 uppercase font-bold tracking-wider">
                {language === 'id' ? 'Kabin' : 'Cabin'}
              </label>
              <input 
                type="number" 
                value={playerCrew.cabinCount}
                onChange={(e) => onSetPlayerCrew({...playerCrew, cabinCount: parseInt(e.target.value) || 0})}
                className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. PLAYER STRIKE MISSION SETUP (FROM HANGAR TO SCRAMBLE) */}
      {reconState.detectedTargets.length > 0 && (
        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
                {language === 'id' ? 'Konfigurasi Serangan Skuadron (Hangar Scramble)' : 'Strike Squadron Configuration'}
              </h4>
            </div>
            <span className="text-[8px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {playerAircraft.name}
            </span>
          </div>

          {/* Coordinate inputs */}
          <div className="space-y-1.5">
            <label className="text-[8.5px] font-bold uppercase tracking-wider text-white/50 block">
              {language === 'id' ? '1. Koordinat Target Serangan (Dari Pesawat Intai):' : '1. Strike Target Coordinates:'}
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="space-y-1">
                <span className="text-[7.5px] text-white/30 uppercase">Latitude Target</span>
                <input
                  type="text"
                  value={targetLatInput}
                  onChange={(e) => onSetTargetLatInput(e.target.value)}
                  placeholder="-6.1234"
                  className="w-full bg-black/60 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-200 font-bold focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[7.5px] text-white/30 uppercase">Longitude Target</span>
                <input
                  type="text"
                  value={targetLngInput}
                  onChange={(e) => onSetTargetLngInput(e.target.value)}
                  placeholder="106.1234"
                  className="w-full bg-black/60 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-200 font-bold focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Weapon selection */}
          <div className="space-y-1.5">
            <label className="text-[8.5px] font-bold uppercase tracking-wider text-white/50 block">
              {language === 'id' ? '2. Pilih Persenjataan Hangar (Weapons Loadout):' : '2. Select Weapons Loadout:'}
            </label>
            <select
              value={selectedWeaponId}
              onChange={(e) => onSelectWeapon(e.target.value)}
              className="w-full bg-[#0d1626] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-amber-200 font-bold focus:outline-none focus:border-amber-400 font-mono"
            >
              {WEAPON_OPTIONS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (+{w.weight} lbs)
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Sub-Tank Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl font-mono text-[9px]">
            <div className="flex items-center gap-2">
              <Fuel className={cn("w-4 h-4", useSubTank ? "text-blue-400" : "text-white/20")} />
              <div>
                <p className="text-[10px] font-bold text-white uppercase">
                  {language === 'id' ? 'Tangki Tambahan (Sub-Tank +30% Fuel)' : 'External Sub-Tank (+30% Fuel)'}
                </p>
                <p className="text-[7.5px] text-white/40">
                  {language === 'id' ? 'Meningkatkan radius jelajah tempur' : 'Extends strike combat radius'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSetUseSubTank(!useSubTank)}
              className={cn(
                "w-10 h-5 rounded-full relative transition-all",
                useSubTank ? "bg-blue-600" : "bg-white/10"
              )}
            >
              <div className={cn(
                "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                useSubTank ? "right-1" : "left-1"
              )} />
            </button>
          </div>

          {/* Landing / Recovery Base Selection */}
          <div className="space-y-1.5">
            <label className="text-[8.5px] font-bold uppercase tracking-wider text-white/50 block">
              {language === 'id' ? '3. Bandara Mendarat (Recovery Base Setelah Misi Selesai):' : '3. Recovery / Landing Base:'}
            </label>
            <AirportSelector
              label={language === 'id' ? 'Bandara Pendaratan Skuadron' : 'Squadron Landing Base'}
              value={strikeLandingBase}
              search={arrSearch}
              onSearchChange={setArrSearch}
              onSelect={(ap) => {
                onSelectStrikeLandingBase(ap);
                setArrSearch('');
              }}
              language={language}
            />
          </div>

          {/* SCRAMBLE & ENGAGEMENT ACTIONS */}
          <div className="pt-2 space-y-2">
            {!isPlayerAirborne ? (
              <button
                type="button"
                disabled={!targetLatInput || !targetLngInput}
                onClick={onScrambleStrike}
                className={cn(
                  "w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 shadow-2xl border",
                  !targetLatInput || !targetLngInput
                    ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border-red-400 shadow-red-600/30 active:scale-[0.98]"
                )}
              >
                <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>
                  {language === 'id' 
                    ? 'SCRAMBLE! LUNCURKAN TEMPUR DARI HANGAR' 
                    : 'SCRAMBLE STRIKE SQUADRON FROM HANGAR'}
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl flex items-center justify-between font-mono text-[9px]">
                  <div className="flex items-center gap-2">
                    <Crosshair className={cn("w-4 h-4", isTargetLocked ? "text-red-400 animate-ping" : "text-amber-400")} />
                    <div>
                      <span className="font-bold text-white block uppercase">
                        {isTargetLocked 
                          ? (language === 'id' ? 'MISSILE LOCK ON! SASARAN TERKUNCI' : 'TARGET LOCKED IN SIGHT')
                          : (language === 'id' ? 'MENDEKATI SASARAN INTEL...' : 'APPROACHING RECON TARGET...')}
                      </span>
                      <span className="text-[7.5px] text-white/50">
                        {isTargetLocked ? 'Jarak tembak efektif terpenuhi (<5 NM)' : 'Terus terbang mendekati koordinat sasaran'}
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                    isTargetLocked ? "bg-red-500 text-white animate-pulse" : "bg-amber-500/20 text-amber-300"
                  )}>
                    {isTargetLocked ? 'FIRE READY' : 'TRACKING'}
                  </span>
                </div>

                {isTargetLocked && !isStrikeCompleted && (
                  <button
                    type="button"
                    onClick={onEngageTarget}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2 active:scale-95 border border-red-300 animate-bounce"
                  >
                    <Flame className="w-5 h-5 fill-yellow-400" />
                    <span>
                      {language === 'id' ? 'TEMBAK & SERANG TARGET (EXECUTE STRIKE!)' : 'FIRE WEAPONS & DESTROY TARGET'}
                    </span>
                  </button>
                )}

                {isStrikeCompleted && (
                  <div className="p-3 bg-emerald-600/20 border border-emerald-500/40 rounded-xl space-y-1 font-mono text-[9px] text-emerald-200">
                    <div className="flex items-center gap-1.5 font-bold uppercase">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'id' ? 'MISI SERANGAN SUKSES - SASARAN HANCUR!' : 'STRIKE TARGET DESTROYED!'}</span>
                    </div>
                    <p className="text-[8px] text-white/70">
                      {language === 'id'
                        ? `Lakukan pendaratan di pangkalan ${strikeLandingBase.icao} (${strikeLandingBase.name}) untuk menyelesaikan misi secara penuh.`
                        : `Proceed to land at ${strikeLandingBase.icao} (${strikeLandingBase.name}) to conclude operation.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
