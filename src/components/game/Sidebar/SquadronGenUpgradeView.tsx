import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Cpu, 
  Warehouse, 
  Clock, 
  Check, 
  Lock, 
  Unlock,
  Layers,
  ChevronRight,
  Plane
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Aircraft, OwnedAircraft, PlayerProfile, FacilityState, AircraftGenerationUpgrade } from '../../../types';
import { AIRCRAFT_GENERATION_UPGRADE_CATALOG, getRankLevel, RANK_HIERARCHY } from '../../../data/squadronState';

interface SquadronGenUpgradeViewProps {
  language: 'id' | 'en';
  playerProfile: PlayerProfile | null;
  activeAircraft: OwnedAircraft | null;
  currentHangar: FacilityState;
  budget: number;
  setBudget: React.Dispatch<React.SetStateAction<number>>;
  onUpgradeAircraft: (targetAircraftTail: string, upgrade: AircraftGenerationUpgrade) => void;
  formatCurrency: (val: number) => string;
  setTransactionFeedback: (msg: string | null) => void;
  speak?: (text: string, isATC?: boolean) => void;
}

export const SquadronGenUpgradeView: React.FC<SquadronGenUpgradeViewProps> = ({
  language,
  playerProfile,
  activeAircraft,
  currentHangar,
  budget,
  setBudget,
  onUpgradeAircraft,
  formatCurrency,
  setTransactionFeedback,
  speak
}) => {
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<string>(AIRCRAFT_GENERATION_UPGRADE_CATALOG[0].id);

  const playerRankLevel = getRankLevel(playerProfile?.rank);
  const playerRankLabel = playerProfile?.rank || 'Kapten Pnb';
  const playerHours = activeAircraft?.flightHours || 32.5;

  const selectedUpgrade = AIRCRAFT_GENERATION_UPGRADE_CATALOG.find(u => u.id === selectedUpgradeId) || AIRCRAFT_GENERATION_UPGRADE_CATALOG[0];

  // Requirements checks
  const isRankMet = playerRankLevel >= selectedUpgrade.requiredRankLevel;
  const isHoursMet = playerHours >= selectedUpgrade.minFlightHours;
  const isHangarMet = currentHangar.level >= selectedUpgrade.requiredHangarLevel;
  const isBudgetMet = budget >= selectedUpgrade.cost;
  const isAlreadyApplied = activeAircraft?.upgradesApplied?.includes(selectedUpgrade.id) || (activeAircraft?.generationTier === selectedUpgrade.targetGeneration);

  const allRequirementsMet = isRankMet && isHoursMet && isHangarMet && isBudgetMet && !isAlreadyApplied;

  const handleExecuteUpgrade = () => {
    if (!activeAircraft) return;
    if (isAlreadyApplied) {
      setTransactionFeedback(
        language === 'id'
          ? `Pesawat ${activeAircraft.tailNumber} sudah memiliki peningkatan ${selectedUpgrade.generationBadge}.`
          : `Aircraft ${activeAircraft.tailNumber} already has ${selectedUpgrade.generationBadge}.`
      );
      return;
    }

    if (!allRequirementsMet) {
      const msg = language === 'id'
        ? `Persyaratan belum terpenuhi untuk upgrade ke ${selectedUpgrade.titleId}. Periksa pangkat, jam terbang, level hanggar, atau anggaran.`
        : `Requirements not met for ${selectedUpgrade.titleEn}. Please check rank, flight hours, hangar level, or budget.`;
      setTransactionFeedback(msg);
      if (speak) speak(msg);
      return;
    }

    // Execute upgrade
    setBudget(prev => prev - selectedUpgrade.cost);
    onUpgradeAircraft(activeAircraft.tailNumber, selectedUpgrade);

    const successMsg = language === 'id'
      ? `MODERNISASI SUKSES! Pesawat [${activeAircraft.tailNumber}] kini telah ditingkatkan ke ${selectedUpgrade.generationBadge}!`
      : `MODERNIZATION SUCCESS! Aircraft [${activeAircraft.tailNumber}] upgraded to ${selectedUpgrade.generationBadge}!`;
    setTransactionFeedback(successMsg);

    if (speak) {
      speak(
        language === 'id'
          ? `Proses modernisasi pesawat tempur nomor ekor ${activeAircraft.tailNumber} ke standar ${selectedUpgrade.generationBadge} telah selesai. Sistem radar dan propulsi telah di-flash.`
          : `Modernization of fighter aircraft ${activeAircraft.tailNumber} to ${selectedUpgrade.generationBadge} standard completed.`
      );
    }
  };

  if (!activeAircraft) {
    return (
      <div className="p-4 bg-black/60 border border-white/10 rounded-2xl text-center font-mono text-xs text-white/50">
        Pilih pesawat dari armada skuadron terlebih dahulu untuk melihat opsi modernisasi generasi.
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono">
      {/* Current Aircraft Target Banner */}
      <div className="p-3 bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-black border border-blue-500/30 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">{activeAircraft.customName || activeAircraft.modelName}</span>
              <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                {activeAircraft.generationBadge || `GEN ${activeAircraft.generationTier || '4.0'}`}
              </span>
            </div>
            <span className="text-[7.5px] text-white/50 block">
              Tail: {activeAircraft.tailNumber} | Jam Terbang: {activeAircraft.flightHours.toFixed(1)} Jam
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[7px] text-white/40 block">STATUS KELAYAKAN</span>
          <span className="text-[8px] font-bold text-emerald-400 flex items-center justify-end gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% AIRWORTHY</span>
          </span>
        </div>
      </div>

      {/* Tier Selection Pills */}
      <div className="grid grid-cols-2 gap-1.5">
        {AIRCRAFT_GENERATION_UPGRADE_CATALOG.map((upg, idx) => {
          const isSelected = upg.id === selectedUpgradeId;
          const isApplied = activeAircraft.upgradesApplied?.includes(upg.id) || (activeAircraft.generationTier === upg.targetGeneration);

          return (
            <button
              key={upg.id}
              type="button"
              onClick={() => setSelectedUpgradeId(upg.id)}
              className={cn(
                "p-2 rounded-xl text-left border transition-all relative overflow-hidden",
                isSelected 
                  ? "bg-blue-600/30 border-blue-400 shadow-md shadow-blue-500/20" 
                  : "bg-black/50 border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7.5px] font-bold text-blue-300 font-mono">
                  {upg.generationBadge}
                </span>
                {isApplied ? (
                  <span className="text-[6.5px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    TERAPKAN
                  </span>
                ) : (
                  <span className="text-[6.5px] font-bold text-amber-300">
                    {formatCurrency(upg.cost)}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-bold text-white block truncate">
                {upg.targetNameSuffix}
              </span>
              <span className="text-[6.5px] text-white/40 block">
                Syarat: {upg.requiredRank} • Hangar Lvl {upg.requiredHangarLevel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Upgrade Dossier Card */}
      <div className="p-3.5 bg-black/60 border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest block">
              SPESIFIKASI PROGRAM MODERNISASI
            </span>
            <span className="text-xs font-black text-white font-mono block mt-0.5">
              {selectedUpgrade.titleId}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[7px] text-white/40 block">INVESTASI SKUADRON</span>
            <span className="text-xs font-black text-amber-300 font-mono">
              {formatCurrency(selectedUpgrade.cost)}
            </span>
          </div>
        </div>

        <p className="text-[8px] text-white/70 leading-relaxed">
          {selectedUpgrade.descriptionId}
        </p>

        {/* Requirements Checklist with Live Qualification Status */}
        <div className="space-y-1.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
          <span className="text-[7.5px] font-bold text-white/50 uppercase tracking-wider block">
            PERSYARATAN & KELAYAKAN KOMANDAN (PREREQUISITES)
          </span>

          <div className="grid grid-cols-2 gap-2 text-[7.5px]">
            {/* Rank Check */}
            <div className="flex items-center justify-between p-1.5 bg-black/40 rounded-lg border border-white/5">
              <div>
                <span className="text-white/40 block text-[6.5px]">PANGKAT MINIMAL:</span>
                <span className="text-white font-bold">{selectedUpgrade.requiredRank}</span>
              </div>
              {isRankMet ? (
                <span className="text-emerald-400 font-bold text-[7px] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>MEMENUHI ({playerRankLabel})</span>
                </span>
              ) : (
                <span className="text-red-400 font-bold text-[7px] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>TERKUNCI</span>
                </span>
              )}
            </div>

            {/* Flight Hours Check */}
            <div className="flex items-center justify-between p-1.5 bg-black/40 rounded-lg border border-white/5">
              <div>
                <span className="text-white/40 block text-[6.5px]">MINIMAL JAM TERBANG:</span>
                <span className="text-white font-bold">{selectedUpgrade.minFlightHours} Jam</span>
              </div>
              {isHoursMet ? (
                <span className="text-emerald-400 font-bold text-[7px] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{playerHours.toFixed(1)} JAM</span>
                </span>
              ) : (
                <span className="text-amber-400 font-bold text-[7px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{playerHours.toFixed(1)} / {selectedUpgrade.minFlightHours} JAM</span>
                </span>
              )}
            </div>

            {/* Hangar Level Check */}
            <div className="flex items-center justify-between p-1.5 bg-black/40 rounded-lg border border-white/5">
              <div>
                <span className="text-white/40 block text-[6.5px]">FASILITAS HANGGAR:</span>
                <span className="text-white font-bold">Level {selectedUpgrade.requiredHangarLevel} Skatek</span>
              </div>
              {isHangarMet ? (
                <span className="text-emerald-400 font-bold text-[7px] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>SIAP (Lvl {currentHangar.level})</span>
                </span>
              ) : (
                <span className="text-amber-400 font-bold text-[7px] flex items-center gap-1">
                  <Warehouse className="w-3 h-3" />
                  <span>UPGRADE HANGGAR</span>
                </span>
              )}
            </div>

            {/* Budget Check */}
            <div className="flex items-center justify-between p-1.5 bg-black/40 rounded-lg border border-white/5">
              <div>
                <span className="text-white/40 block text-[6.5px]">DANA SKUADRON:</span>
                <span className="text-white font-bold">{formatCurrency(selectedUpgrade.cost)}</span>
              </div>
              {isBudgetMet ? (
                <span className="text-emerald-400 font-bold text-[7px] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>CUKUP</span>
                </span>
              ) : (
                <span className="text-red-400 font-bold text-[7px] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>KURANG</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Upgraded Stat Boosts Grid */}
        <div className="space-y-1.5">
          <span className="text-[7.5px] font-bold text-cyan-300 uppercase tracking-wider block">
            PENINGKATAN PERFORMA & AVIONIK (STAT BOOSTS)
          </span>

          <div className="grid grid-cols-2 gap-2 text-[7.5px]">
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-white/40 text-[6.5px] block">KECEPATAN MAKSIMUM</span>
              <span className="text-cyan-300 font-bold block">{selectedUpgrade.statBoosts.maxSpeed}</span>
              <span className="text-white/40 text-[6.5px]">Cruise: +{selectedUpgrade.statBoosts.cruiseSpeedBoost} KTS</span>
            </div>

            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-white/40 text-[6.5px] block">JANGKAUAN & CEILING</span>
              <span className="text-emerald-300 font-bold block">{selectedUpgrade.statBoosts.rangeBoost}</span>
              <span className="text-white/40 text-[6.5px]">Ceiling: {selectedUpgrade.statBoosts.ceiling}</span>
            </div>

            <div className="p-2 bg-white/5 rounded-xl border border-white/5 col-span-2">
              <span className="text-white/40 text-[6.5px] block">RADAR & SISTEM DETEKSI</span>
              <span className="text-indigo-300 font-bold block">{selectedUpgrade.statBoosts.radarType}</span>
              <span className="text-amber-300 text-[6.5px] font-bold">{selectedUpgrade.statBoosts.stealthRCS}</span>
            </div>
          </div>
        </div>

        {/* Key Features List */}
        <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-white/5 text-[7.5px]">
          <span className="text-white/50 font-bold text-[7px] uppercase block">KEMAMPUAN TEMPUR UTAMA:</span>
          {selectedUpgrade.keyFeatures.map((feat, fIdx) => (
            <div key={fIdx} className="flex items-center gap-1.5 text-white/80">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Upgrade Action Button */}
        <div className="pt-2 border-t border-white/10">
          {isAlreadyApplied ? (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-[8.5px] text-emerald-300 font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PESAWAT INI SUDAH DITINGKATKAN KE {selectedUpgrade.generationBadge}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleExecuteUpgrade}
              disabled={!allRequirementsMet}
              className={cn(
                "w-full py-2.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-lg flex items-center justify-center gap-2",
                allRequirementsMet
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/40 active:scale-98 cursor-pointer"
                  : "bg-white/10 text-white/30 cursor-not-allowed border border-white/10"
              )}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {allRequirementsMet 
                  ? `EKSEKUSI UPGRADE GENERASI (${formatCurrency(selectedUpgrade.cost)})`
                  : 'SYARAT BELUM TERPENUHI'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
