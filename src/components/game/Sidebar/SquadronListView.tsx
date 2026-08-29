import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Plane, 
  MapPin, 
  Users, 
  ChevronRight, 
  Coins, 
  Crosshair, 
  CheckCircle2, 
  Sparkles,
  Building,
  Radio,
  ArrowRight,
  Activity,
  Layers,
  Lock,
  Unlock,
  Award,
  AlertCircle,
  X,
  CreditCard,
  FileCheck2
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { PlayableSquadron, MILITARY_RANKS } from '../../../constants';
import { PlayerProfile } from '../../../types';
import { HANGAR_LEVELS, INITIAL_SQUADRON_BUDGET } from '../../../data/squadronState';

interface SquadronListViewProps {
  language: 'id' | 'en';
  playableSquadrons: PlayableSquadron[];
  activeSquadronId: string;
  unlockedSquadronIds?: string[];
  onSelectSquadron: (sq: PlayableSquadron) => void;
  onActivateForFlight?: (sq: PlayableSquadron) => void;
  onUnlockSquadron?: (sq: PlayableSquadron) => void;
  formatCurrency: (val: number) => string;
  playerProfile: PlayerProfile | null;
  currentBudget?: number;
}

export const SquadronListView: React.FC<SquadronListViewProps> = ({
  language,
  playableSquadrons,
  activeSquadronId,
  unlockedSquadronIds = ['sq1'],
  onSelectSquadron,
  onActivateForFlight,
  onUnlockSquadron,
  formatCurrency,
  playerProfile,
  currentBudget = 1000000000
}) => {
  const [purchaseModalSquadron, setPurchaseModalSquadron] = useState<PlayableSquadron | null>(null);

  // Player Rank Index Calculation
  const playerRank = playerProfile?.rank || 'Letda';
  const playerRankIndex = Math.max(0, MILITARY_RANKS.indexOf(playerRank));

  // Helper to read squadron quick state from localStorage
  const getSquadronQuickStats = (sqId: string) => {
    let budget = INITIAL_SQUADRON_BUDGET;
    let fleetCount = 1;
    let hangarLvl = 1;

    try {
      const savedBudget = localStorage.getItem(`ais_sq_state_${sqId}_budget`);
      if (savedBudget) budget = Number(savedBudget);

      const savedFleet = localStorage.getItem(`ais_sq_state_${sqId}_owned_fleet`);
      if (savedFleet) {
        const parsed = JSON.parse(savedFleet);
        if (Array.isArray(parsed) && parsed.length > 0) fleetCount = parsed.length;
      }

      const savedHangar = localStorage.getItem(`ais_sq_state_${sqId}_hangar_level`);
      if (savedHangar !== null) hangarLvl = Number(savedHangar) + 1;
    } catch (e) {}

    return { budget, fleetCount, hangarLvl };
  };

  const handleConfirmPurchase = () => {
    if (!purchaseModalSquadron || !onUnlockSquadron) return;
    onUnlockSquadron(purchaseModalSquadron);
    setPurchaseModalSquadron(null);
  };

  return (
    <div className="space-y-3.5 relative">
      {/* HUB HEADER BANNER */}
      <div className="p-3.5 bg-gradient-to-br from-slate-900 via-blue-950 to-black border border-blue-500/30 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute -top-6 -right-6 opacity-10 pointer-events-none">
          <Shield className="w-36 h-36 text-blue-400" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600/30 border border-blue-400/40 rounded-xl text-cyan-300 shadow-inner">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[7.5px] font-mono text-cyan-300 font-bold uppercase tracking-widest block">
                  KOMANDO OPERASI UDARA NASIONAL • TNI AU
                </span>
                <h1 className="text-sm font-black text-white uppercase tracking-wider">
                  {language === 'id' ? 'Daftar Skuadron Tempur' : 'Combat Squadrons Command'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                {unlockedSquadronIds.length} / {playableSquadrons.length} {language === 'id' ? 'TERBUKA' : 'UNLOCKED'}
              </span>
            </div>
          </div>

          <p className="text-[8px] font-mono text-white/70 leading-relaxed">
            {language === 'id' 
              ? 'Kelola pangkalan, personil kru darat, kelaikan pesawat, arsenal persenjataan, dan hanggar pada masing-masing skuadron TNI AU. Buka skuadron baru dengan memenuhi syarat pangkat dan anggaran pangkalan.'
              : 'Command airbases, personnel rosters, aircraft readiness, weapons arsenals, and hangars across TNI AU squadrons. Commission new squadrons with required military rank and acquisition budget.'}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[8px] font-mono border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Award className="w-3 h-3 text-amber-400" />
              <span className="text-white/60">{language === 'id' ? 'Pangkat Komandan:' : 'Commander Rank:'}</span>
              <span className="font-bold text-amber-300">{playerRank}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="w-3 h-3 text-emerald-400" />
              <span className="text-white/60">{language === 'id' ? 'Kas Markas / Saldo:' : 'Treasury Balance:'}</span>
              <span className="font-bold text-emerald-300">{formatCurrency(currentBudget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SQUADRON LIST CARDS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-[8px] font-mono text-white/50">
          <span className="uppercase tracking-wider">
            {language === 'id' ? 'PILIH SKUADRON UNTUK MELIHAT DETAIL & MANAJEMEN' : 'SELECT SQUADRON FOR FULL DETAIL & MANAGEMENT'}
          </span>
          <span>8 SKADRON</span>
        </div>

        <div className="space-y-2.5">
          {playableSquadrons.map((sq, index) => {
            const isUnlocked = unlockedSquadronIds.includes(sq.id);
            const isCurrentActive = isUnlocked && sq.id === activeSquadronId;
            const stats = getSquadronQuickStats(sq.id);

            const meetsRank = playerRankIndex >= sq.minRankIndex;
            const hasEnoughBudget = currentBudget >= sq.unlockPrice;
            const canAffordAndUnlock = meetsRank && hasEnoughBudget;

            return (
              <motion.div
                key={sq.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all relative overflow-hidden shadow-lg group",
                  !isUnlocked 
                    ? "bg-stone-950/70 border-white/10 hover:border-amber-500/30" 
                    : isCurrentActive 
                      ? "border-blue-500/80 bg-gradient-to-r from-blue-950/40 via-black/60 to-black/60 shadow-blue-500/10 ring-1 ring-blue-400/30" 
                      : "bg-black/50 hover:bg-black/70 border-white/10 hover:border-white/25"
                )}
              >
                {/* Background glow accent */}
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-10 rounded-full blur-2xl pointer-events-none",
                  sq.badgeColor
                )} />

                <div className="space-y-2.5 relative z-10">
                  {/* Top Bar: Name, Nickname, Base, and Status Tags */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-md relative",
                        sq.badgeColor,
                        sq.accentBorder
                      )}>
                        {isUnlocked ? (
                          <Shield className="w-5 h-5 text-white" />
                        ) : (
                          <Lock className="w-5 h-5 text-amber-300" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                            {sq.name}
                          </h2>
                          <span className="text-[9px] font-bold text-amber-300">
                            "{sq.nickname}"
                          </span>
                          {isCurrentActive && (
                            <span className="text-[7px] font-mono font-black bg-blue-500 text-white px-1.5 py-0.2 rounded uppercase shadow-sm">
                              SEDANG DIKELOLA
                            </span>
                          )}
                          {!isUnlocked && (
                            <span className="text-[7px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded uppercase flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              {language === 'id' ? 'TERKUNCI' : 'LOCKED'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/60 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                          <span className="text-white/80 font-bold">{sq.baseName}</span>
                          <span>•</span>
                          <span className="text-white/50">{sq.baseLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[7.5px] font-mono text-white/40 block">PANGKALAN</span>
                      <span className="text-[9px] font-mono font-bold text-cyan-300">
                        {sq.baseIcao}
                      </span>
                    </div>
                  </div>

                  {/* Middle Bar: Dedicated Aircraft Specification & Role */}
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5 grid grid-cols-2 gap-2 text-[8px] font-mono">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-black/40 rounded-lg text-cyan-300 border border-white/10">
                        <Plane className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[7px] text-white/40 uppercase block">PESAWAT TUGAS RESMI</span>
                        <span className="text-[9px] font-black text-white truncate block">
                          {sq.aircraftName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-black/40 rounded-lg text-amber-300 border border-white/10">
                        <Crosshair className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[7px] text-white/40 uppercase block">PERAN TAKTIS</span>
                        <span className="text-[8.5px] font-bold text-amber-300 truncate block">
                          {sq.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unlocked Stats vs Locked Requirements */}
                  {isUnlocked ? (
                    <div className="grid grid-cols-3 gap-1.5 text-[7.5px] font-mono">
                      <div className="bg-black/40 p-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-white/40">ARMADA:</span>
                        <span className="font-bold text-cyan-300">{stats.fleetCount} Unit</span>
                      </div>
                      <div className="bg-black/40 p-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-white/40">HANGGAR:</span>
                        <span className="font-bold text-emerald-300">Lvl {stats.hangarLvl}</span>
                      </div>
                      <div className="bg-black/40 p-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-white/40">ANGGARAN:</span>
                        <span className="font-bold text-amber-300 truncate max-w-[55px]">{formatCurrency(stats.budget)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-1.5 text-[8px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-200/70 uppercase tracking-wider font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          {language === 'id' ? 'PERSYARATAN AKUISISI SKUADRON:' : 'COMMISSIONING REQUIREMENTS:'}
                        </span>
                        <span className="text-emerald-400 font-black">
                          {formatCurrency(sq.unlockPrice)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div className={cn(
                          "p-1.5 rounded-lg border flex items-center justify-between",
                          meetsRank ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-red-950/30 border-red-500/30 text-red-300"
                        )}>
                          <span className="text-white/50">Min Pangkat:</span>
                          <span className="font-bold">{sq.minRank} {meetsRank ? '✓' : `(Anda: ${playerRank})`}</span>
                        </div>

                        <div className={cn(
                          "p-1.5 rounded-lg border flex items-center justify-between",
                          hasEnoughBudget ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-red-950/30 border-red-500/30 text-red-300"
                        )}>
                          <span className="text-white/50">Biaya Lisensi:</span>
                          <span className="font-bold">{hasEnoughBudget ? 'Cukup ✓' : 'Kurang Dana'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Motto Quote */}
                  <div className="text-[7.5px] font-mono text-white/50 italic truncate px-0.5">
                    "{language === 'id' ? sq.mottoId : sq.mottoEn}"
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10 gap-2">
                    {isUnlocked ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectSquadron(sq)}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-xl font-mono text-[8.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98",
                            isCurrentActive
                              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                              : "bg-white/10 hover:bg-blue-600 text-white hover:shadow-blue-600/20"
                          )}
                        >
                          <Building className="w-3.5 h-3.5" />
                          <span>{language === 'id' ? 'Kelola Skuadron (Buka Detail)' : 'Manage Squadron (View Detail)'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {onActivateForFlight && (
                          <button
                            type="button"
                            onClick={() => onActivateForFlight(sq)}
                            className="py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl font-mono text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow shrink-0"
                            title="Jadikan Pesawat & Pangkalan Aktif untuk Penerbangan Simulator"
                          >
                            <Plane className="w-3.5 h-3.5" />
                            <span>{language === 'id' ? 'Aktifkan Terbang' : 'Fly'}</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPurchaseModalSquadron(sq)}
                        className={cn(
                          "w-full py-2.5 px-3 rounded-xl font-mono text-[8.5px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98",
                          canAffordAndUnlock
                            ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-600/30 animate-pulse"
                            : "bg-amber-950/40 border border-amber-500/30 text-amber-300/80 hover:bg-amber-900/40"
                        )}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>
                          {language === 'id' 
                            ? `Beli Lisensi & Buka Skuadron (${formatCurrency(sq.unlockPrice)})` 
                            : `Purchase & Commission Squadron (${formatCurrency(sq.unlockPrice)})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SQUADRON COMMISSIONING / PURCHASE MODAL */}
      <AnimatePresence>
        {purchaseModalSquadron && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3">
                <button
                  type="button"
                  onClick={() => setPurchaseModalSquadron(null)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-xl border flex items-center justify-center shadow-lg",
                  purchaseModalSquadron.badgeColor,
                  purchaseModalSquadron.accentBorder
                )}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                    SURAT KEPUTUSAN OTORISASI PANGKALAN • MABES TNI AU
                  </span>
                  <h3 className="text-base font-black text-white font-mono uppercase">
                    {purchaseModalSquadron.fullName}
                  </h3>
                </div>
              </div>

              {/* Squadron Overview Details */}
              <div className="p-3 bg-black/50 rounded-xl border border-white/10 space-y-2 text-[9px] font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-white/50">{language === 'id' ? 'Pangkalan / Lanud:' : 'Airbase Location:'}</span>
                  <span className="font-bold text-cyan-300">{purchaseModalSquadron.baseName} ({purchaseModalSquadron.baseIcao}) - {purchaseModalSquadron.baseLocation}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-white/50">{language === 'id' ? 'Pesawat Tugas Resmi:' : 'Assigned Aircraft:'}</span>
                  <span className="font-bold text-white">{purchaseModalSquadron.aircraftName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-white/50">{language === 'id' ? 'Peran Operasi:' : 'Combat Role:'}</span>
                  <span className="font-bold text-amber-300">{purchaseModalSquadron.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">{language === 'id' ? 'Motto Penugasan:' : 'Squadron Motto:'}</span>
                  <span className="italic text-white/80 truncate max-w-[280px]">"{purchaseModalSquadron.mottoId}"</span>
                </div>
              </div>

              {/* Requirements Assessment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-white/60 uppercase">{language === 'id' ? 'Evaluasi Kualifikasi Perwira:' : 'Qualification Assessment:'}</span>
                  <span className="text-amber-400 font-bold">{playerProfile?.commanderName || 'Komandan'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono">
                  <div className={cn(
                    "p-2.5 rounded-xl border space-y-1",
                    playerRankIndex >= purchaseModalSquadron.minRankIndex
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Syarat Pangkat:</span>
                      <span className="font-bold">{purchaseModalSquadron.minRank}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span>Pangkat Anda:</span>
                      <span>{playerRank} {playerRankIndex >= purchaseModalSquadron.minRankIndex ? '✓' : '✗'}</span>
                    </div>
                  </div>

                  <div className={cn(
                    "p-2.5 rounded-xl border space-y-1",
                    currentBudget >= purchaseModalSquadron.unlockPrice
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Biaya Otorisasi:</span>
                      <span className="font-bold">{formatCurrency(purchaseModalSquadron.unlockPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span>Saldo Tersedia:</span>
                      <span>{formatCurrency(currentBudget)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning or Greenlight message */}
              {playerRankIndex < purchaseModalSquadron.minRankIndex ? (
                <div className="p-2.5 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-2 text-[8px] font-mono text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>
                    {language === 'id' 
                      ? `Pangkat Anda (${playerRank}) belum mencapai batas minimum pangkat komando (${purchaseModalSquadron.minRank}). Naikkan pangkat komandan Anda terlebih dahulu.` 
                      : `Your current rank (${playerRank}) is below the required command rank (${purchaseModalSquadron.minRank}). Promote your rank first.`}
                  </span>
                </div>
              ) : currentBudget < purchaseModalSquadron.unlockPrice ? (
                <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-center gap-2 text-[8px] font-mono text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    {language === 'id' 
                      ? `Saldo anggaran kas tidak mencukupi untuk pembayaran lisensi pangkalan. Kurang: ${formatCurrency(purchaseModalSquadron.unlockPrice - currentBudget)}.` 
                      : `Insufficient treasury funds for commissioning license. Shortfall: ${formatCurrency(purchaseModalSquadron.unlockPrice - currentBudget)}.`}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-[8px] font-mono text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    {language === 'id' 
                      ? 'Semua syarat kepangkatan dan anggaran terpenuhi! Skuadron akan langsung aktif dengan 1 unit pesawat dan fasilitas hanggar siap tempur.' 
                      : 'All rank and budget requirements verified! Squadron will be commissioned with 1 ready unit and standard hangar bay facilities.'}
                  </span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPurchaseModalSquadron(null)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-[9px] font-mono uppercase transition-colors"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>

                <button
                  type="button"
                  disabled={playerRankIndex < purchaseModalSquadron.minRankIndex || currentBudget < purchaseModalSquadron.unlockPrice}
                  onClick={handleConfirmPurchase}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[9px] font-mono font-black uppercase flex items-center gap-2 transition-all shadow-lg",
                    playerRankIndex >= purchaseModalSquadron.minRankIndex && currentBudget >= purchaseModalSquadron.unlockPrice
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/30 active:scale-95 cursor-pointer"
                      : "bg-white/10 text-white/30 cursor-not-allowed border border-white/10"
                  )}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{language === 'id' ? 'Konfirmasi Otorisasi Pembelian' : 'Authorize Commissioning'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
