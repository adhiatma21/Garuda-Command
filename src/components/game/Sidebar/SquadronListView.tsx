import React from 'react';
import { motion } from 'motion/react';
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
  Layers
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { PlayableSquadron } from '../../../constants';
import { PlayerProfile } from '../../../types';
import { HANGAR_LEVELS, INITIAL_SQUADRON_BUDGET } from '../../../data/squadronState';

interface SquadronListViewProps {
  language: 'id' | 'en';
  playableSquadrons: PlayableSquadron[];
  activeSquadronId: string;
  onSelectSquadron: (sq: PlayableSquadron) => void;
  onActivateForFlight?: (sq: PlayableSquadron) => void;
  formatCurrency: (val: number) => string;
  playerProfile: PlayerProfile | null;
}

export const SquadronListView: React.FC<SquadronListViewProps> = ({
  language,
  playableSquadrons,
  activeSquadronId,
  onSelectSquadron,
  onActivateForFlight,
  formatCurrency,
  playerProfile
}) => {
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

  return (
    <div className="space-y-3.5">
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

            <span className="text-[8px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
              8 {language === 'id' ? 'SKADRON AKTIF' : 'ACTIVE SQUADRONS'}
            </span>
          </div>

          <p className="text-[8px] font-mono text-white/70 leading-relaxed">
            {language === 'id' 
              ? 'Kelola pangkalan, personil kru darat, kelaikan pesawat, arsenal persenjataan, dan hanggar pada masing-masing skuadron TNI AU di seluruh nusantara.'
              : 'Command airbases, ground crew personnel, aircraft health, weaponry arsenals, and hangar bays for each TNI AU combat squadron across Indonesia.'}
          </p>

          <div className="flex items-center gap-4 pt-1 text-[8px] font-mono text-white/60 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Building className="w-3 h-3 text-cyan-400" />
              <span>5 Lanud Udara Utama</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Plane className="w-3 h-3 text-amber-400" />
              <span>1 Jenis Pesawat / Skuadron</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Siaga Kedaulatan Udara</span>
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

        <div className="space-y-2">
          {playableSquadrons.map((sq, index) => {
            const isCurrentActive = sq.id === activeSquadronId;
            const stats = getSquadronQuickStats(sq.id);

            return (
              <motion.div
                key={sq.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all relative overflow-hidden bg-black/50 hover:bg-black/70 shadow-lg group",
                  isCurrentActive 
                    ? "border-blue-500/80 bg-gradient-to-r from-blue-950/40 via-black/60 to-black/60 shadow-blue-500/10 ring-1 ring-blue-400/30" 
                    : "border-white/10 hover:border-white/25"
                )}
              >
                {/* Background glow accent */}
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-10 rounded-full blur-2xl pointer-events-none",
                  sq.badgeColor
                )} />

                <div className="space-y-2.5 relative z-10">
                  {/* Top Bar: Name, Nickname, Base, and Active Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-md",
                        sq.badgeColor,
                        sq.accentBorder
                      )}>
                        <Shield className="w-5 h-5 text-white" />
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

                  {/* Stats Bar: Anggaran, Fleet, Hangar */}
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

                  {/* Motto Quote */}
                  <div className="text-[7.5px] font-mono text-white/50 italic truncate px-0.5">
                    "{language === 'id' ? sq.mottoId : sq.mottoEn}"
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10 gap-2">
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
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
