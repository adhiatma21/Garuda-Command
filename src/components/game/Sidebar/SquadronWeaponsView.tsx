import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crosshair, 
  Fuel, 
  ShieldCheck, 
  ShoppingBag, 
  Check, 
  Plus, 
  ArrowUpRight, 
  Zap, 
  Target, 
  Flame, 
  Gauge, 
  Sparkles, 
  Layers, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Aircraft, WeaponItem, WeaponCategory } from '../../../types';
import { WEAPONS_ARSENAL_CATALOG } from '../../../data/squadronState';

interface HardpointState {
  wingtip: string | null;
  outboard: string | null;
  inboard: string | null;
  conformal: string | null;
  centerline: string | null;
}

interface SquadronWeaponsViewProps {
  language: 'id' | 'en';
  selectedAircraft: Aircraft;
  budget: number;
  setBudget: React.Dispatch<React.SetStateAction<number>>;
  unlockedWeaponIds: string[];
  setUnlockedWeaponIds: React.Dispatch<React.SetStateAction<string[]>>;
  hardpoints: HardpointState;
  setHardpoints: React.Dispatch<React.SetStateAction<HardpointState>>;
  setTransactionFeedback: (msg: string | null) => void;
  speak?: (text: string, isATC?: boolean) => void;
  formatCurrency: (val: number) => string;
  onApplyLoadoutToSim?: () => void;
}

export const SquadronWeaponsView: React.FC<SquadronWeaponsViewProps> = ({
  language,
  selectedAircraft,
  budget,
  setBudget,
  unlockedWeaponIds,
  setUnlockedWeaponIds,
  hardpoints,
  setHardpoints,
  setTransactionFeedback,
  speak,
  formatCurrency,
  onApplyLoadoutToSim
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'loadout' | 'shop'>('loadout');
  const [selectedCategory, setSelectedCategory] = useState<'all' | WeaponCategory>('all');
  const [selectedStationToMount, setSelectedStationToMount] = useState<keyof HardpointState | null>(null);

  // Map of weapons by ID
  const weaponMap = useMemo(() => {
    const map = new Map<string, WeaponItem>();
    WEAPONS_ARSENAL_CATALOG.forEach(w => map.set(w.id, w));
    return map;
  }, []);

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    if (selectedCategory === 'all') return WEAPONS_ARSENAL_CATALOG;
    return WEAPONS_ARSENAL_CATALOG.filter(w => w.category === selectedCategory);
  }, [selectedCategory]);

  // Calculations for current hardpoint loadout
  const activeWeaponsList = useMemo(() => {
    const list: { station: keyof HardpointState; weapon: WeaponItem; label: string }[] = [];
    if (hardpoints.wingtip) {
      const w = weaponMap.get(hardpoints.wingtip);
      if (w) list.push({ station: 'wingtip', weapon: w, label: 'Station 1 & 9 (Wingtip)' });
    }
    if (hardpoints.outboard) {
      const w = weaponMap.get(hardpoints.outboard);
      if (w) list.push({ station: 'outboard', weapon: w, label: 'Station 2 & 8 (Outboard)' });
    }
    if (hardpoints.inboard) {
      const w = weaponMap.get(hardpoints.inboard);
      if (w) list.push({ station: 'inboard', weapon: w, label: 'Station 3 & 7 (Inboard)' });
    }
    if (hardpoints.conformal) {
      const w = weaponMap.get(hardpoints.conformal);
      if (w) list.push({ station: 'conformal', weapon: w, label: 'Fuselage Conformal Packs' });
    }
    if (hardpoints.centerline) {
      const w = weaponMap.get(hardpoints.centerline);
      if (w) list.push({ station: 'centerline', weapon: w, label: 'Station 5 (Centerline)' });
    }
    return list;
  }, [hardpoints, weaponMap]);

  // Total Weight Calculation (multiplied by 2 for dual symmetrical wing stations)
  const totalOrdnanceWeightLbs = useMemo(() => {
    let wt = 0;
    if (hardpoints.wingtip) {
      const w = weaponMap.get(hardpoints.wingtip);
      if (w) wt += w.weightLbs * 2;
    }
    if (hardpoints.outboard) {
      const w = weaponMap.get(hardpoints.outboard);
      if (w) wt += w.weightLbs * 2;
    }
    if (hardpoints.inboard) {
      const w = weaponMap.get(hardpoints.inboard);
      if (w) wt += w.weightLbs * 2;
    }
    if (hardpoints.conformal) {
      const w = weaponMap.get(hardpoints.conformal);
      if (w) wt += w.weightLbs;
    }
    if (hardpoints.centerline) {
      const w = weaponMap.get(hardpoints.centerline);
      if (w) wt += w.weightLbs;
    }
    return wt;
  }, [hardpoints, weaponMap]);

  // Total External Fuel added
  const totalExternalFuelLbs = useMemo(() => {
    let fuel = 0;
    if (hardpoints.wingtip) {
      const w = weaponMap.get(hardpoints.wingtip);
      if (w?.fuelCapacityLbs) fuel += w.fuelCapacityLbs * 2;
    }
    if (hardpoints.outboard) {
      const w = weaponMap.get(hardpoints.outboard);
      if (w?.fuelCapacityLbs) fuel += w.fuelCapacityLbs * 2;
    }
    if (hardpoints.inboard) {
      const w = weaponMap.get(hardpoints.inboard);
      if (w?.fuelCapacityLbs) fuel += w.fuelCapacityLbs * 2;
    }
    if (hardpoints.conformal) {
      const w = weaponMap.get(hardpoints.conformal);
      if (w?.fuelCapacityLbs) fuel += w.fuelCapacityLbs;
    }
    if (hardpoints.centerline) {
      const w = weaponMap.get(hardpoints.centerline);
      if (w?.fuelCapacityLbs) fuel += w.fuelCapacityLbs;
    }
    return fuel;
  }, [hardpoints, weaponMap]);

  const totalExternalFuelGal = Math.round(totalExternalFuelLbs / 6.7); // 1 gal Jet-A1 ≈ 6.7 lbs

  // Total range bonus
  const totalRangeBonusNm = useMemo(() => {
    let bonus = 0;
    if (hardpoints.wingtip) bonus += (weaponMap.get(hardpoints.wingtip)?.rangeBonusNm || 0);
    if (hardpoints.outboard) bonus += (weaponMap.get(hardpoints.outboard)?.rangeBonusNm || 0);
    if (hardpoints.inboard) bonus += (weaponMap.get(hardpoints.inboard)?.rangeBonusNm || 0);
    if (hardpoints.conformal) bonus += (weaponMap.get(hardpoints.conformal)?.rangeBonusNm || 0);
    if (hardpoints.centerline) bonus += (weaponMap.get(hardpoints.centerline)?.rangeBonusNm || 0);
    return bonus;
  }, [hardpoints, weaponMap]);

  // BUY WEAPON HANDLER
  const handleBuyWeapon = (weapon: WeaponItem) => {
    if (unlockedWeaponIds.includes(weapon.id)) return;
    if (budget < weapon.price) {
      const shortfall = weapon.price - budget;
      const msg = language === 'id'
        ? `Anggaran tidak cukup untuk pengadaan ${weapon.name}. Dibutuhkan ${formatCurrency(weapon.price)} (Kurang ${formatCurrency(shortfall)}).`
        : `Insufficient funds for ${weapon.name}. Required ${formatCurrency(weapon.price)} (Short by ${formatCurrency(shortfall)}).`;
      setTransactionFeedback(msg);
      if (speak) speak(msg);
      return;
    }

    setBudget(prev => prev - weapon.price);
    setUnlockedWeaponIds(prev => [...prev, weapon.id]);

    const msg = language === 'id'
      ? `Pengadaan ${weapon.name} BERHASIL! Senjata telah masuk ke inventaris gudang persenjataan skuadron.`
      : `Procurement of ${weapon.name} SUCCESSFUL! Ordnance registered in squadron armory.`;
    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Pengadaan munisi ${weapon.name} berhasil disetujui. Tersedia untuk dipasang ke hardpoint pesawat tempur.`
          : `Procurement of ordnance ${weapon.name} approved and delivered to armory.`
      );
    }
  };

  // EQUIP WEAPON TO STATION
  const handleEquipWeapon = (station: keyof HardpointState, weaponId: string | null) => {
    setHardpoints(prev => ({
      ...prev,
      [station]: weaponId
    }));
    setSelectedStationToMount(null);

    const wName = weaponId ? weaponMap.get(weaponId)?.name : 'Dikosongkan';
    const msg = language === 'id'
      ? `Hardpoint [${station.toUpperCase()}] diperbarui: ${wName}`
      : `Hardpoint [${station.toUpperCase()}] updated: ${wName}`;
    setTransactionFeedback(msg);

    if (speak && weaponId) {
      speak(
        language === 'id'
          ? `${wName} berhasil dipasang ke stasiun ${station}.`
          : `${wName} mounted to station ${station}.`
      );
    }
  };

  // QUICK PRESET LOADOUTS
  const applyPresetLoadout = (presetType: 'cap' | 'cas' | 'maritime' | 'sead' | 'standoff' | 'ferry') => {
    let newLoadout: HardpointState = {
      wingtip: null,
      outboard: null,
      inboard: null,
      conformal: null,
      centerline: null
    };

    switch (presetType) {
      case 'cap':
        newLoadout = {
          wingtip: 'aim9x',
          outboard: 'aim120c',
          inboard: unlockedWeaponIds.includes('meteor') ? 'meteor' : (unlockedWeaponIds.includes('aim120d') ? 'aim120d' : 'aim120c'),
          conformal: unlockedWeaponIds.includes('tank_cft_450') ? 'tank_cft_450' : null,
          centerline: unlockedWeaponIds.includes('tank_150gal') ? 'tank_150gal' : 'tank_300gal'
        };
        break;
      case 'cas':
        newLoadout = {
          wingtip: 'aim9x',
          outboard: unlockedWeaponIds.includes('agm65_mav') ? 'agm65_mav' : 'gbu12',
          inboard: unlockedWeaponIds.includes('gbu38_jdam') ? 'gbu38_jdam' : 'gbu12',
          conformal: null,
          centerline: 'sniper_xr'
        };
        break;
      case 'maritime':
        newLoadout = {
          wingtip: 'aim9x',
          outboard: 'aim120c',
          inboard: unlockedWeaponIds.includes('agm84_harpoon') ? 'agm84_harpoon' : (unlockedWeaponIds.includes('exocet_am39') ? 'exocet_am39' : 'gbu12'),
          conformal: unlockedWeaponIds.includes('tank_cft_450') ? 'tank_cft_450' : null,
          centerline: 'sniper_xr'
        };
        break;
      case 'sead':
        newLoadout = {
          wingtip: 'aim9x',
          outboard: unlockedWeaponIds.includes('agm88_harm') ? 'agm88_harm' : 'aim120c',
          inboard: unlockedWeaponIds.includes('kh31p') ? 'kh31p' : (unlockedWeaponIds.includes('agm88_harm') ? 'agm88_harm' : 'aim120c'),
          conformal: null,
          centerline: unlockedWeaponIds.includes('tank_300gal') ? 'tank_300gal' : 'tank_150gal'
        };
        break;
      case 'standoff':
        newLoadout = {
          wingtip: 'aim9x',
          outboard: 'aim120c',
          inboard: unlockedWeaponIds.includes('storm_shadow') ? 'storm_shadow' : (unlockedWeaponIds.includes('agm158_jassm') ? 'agm158_jassm' : (unlockedWeaponIds.includes('gbu31_jdam') ? 'gbu31_jdam' : 'gbu12')),
          conformal: unlockedWeaponIds.includes('tank_cft_450') ? 'tank_cft_450' : null,
          centerline: 'sniper_xr'
        };
        break;
      case 'ferry':
        newLoadout = {
          wingtip: 'aim9x',
          outboard: 'aim9x',
          inboard: unlockedWeaponIds.includes('tank_370gal') ? 'tank_370gal' : (unlockedWeaponIds.includes('tank_600gal') ? 'tank_600gal' : 'tank_300gal'),
          conformal: unlockedWeaponIds.includes('tank_cft_450') ? 'tank_cft_450' : null,
          centerline: unlockedWeaponIds.includes('tank_600gal') ? 'tank_600gal' : (unlockedWeaponIds.includes('tank_300gal') ? 'tank_300gal' : 'tank_150gal')
        };
        break;
    }

    setHardpoints(newLoadout);
    const msg = language === 'id'
      ? `Paket Misi [${presetType.toUpperCase()}] berhasil dikonfigurasikan pada seluruh hardpoint!`
      : `Preset Mission Package [${presetType.toUpperCase()}] loaded onto all hardpoints!`;
    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Konfigurasi muatan tempur paket misi ${presetType.toUpperCase()} siap digunakan.`
          : `Combat payload configuration preset ${presetType.toUpperCase()} loaded and verified.`
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
          <Crosshair className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'PERSENJATAAN & TANGKI AVTUR EKSTERNAL' : 'WEAPONS & EXTERNAL FUEL TANKS'}</span>
        </span>

        {/* Sub-tab Switch */}
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[8px] font-mono">
          <button
            type="button"
            onClick={() => setActiveSubTab('loadout')}
            className={cn(
              "px-2 py-1 rounded transition-all font-bold",
              activeSubTab === 'loadout' ? "bg-blue-600 text-white shadow" : "text-white/50 hover:text-white"
            )}
          >
            {language === 'id' ? 'Konfigurasi Hardpoint' : 'Hardpoint Loadout'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('shop')}
            className={cn(
              "px-2 py-1 rounded transition-all font-bold flex items-center gap-1",
              activeSubTab === 'shop' ? "bg-amber-600 text-white shadow" : "text-white/50 hover:text-white"
            )}
          >
            <ShoppingBag className="w-2.5 h-2.5" />
            <span>{language === 'id' ? 'Beli Senjata & Tangki' : 'Arsenal Store'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW A: HARDPOINT LOADOUT CONFIGURATION                         */}
      {/* ============================================================== */}
      {activeSubTab === 'loadout' && (
        <div className="space-y-3">
          {/* Quick Mission Loadout Presets */}
          <div className="space-y-1.5">
            <span className="text-[7.5px] font-mono text-white/40 uppercase tracking-wider block">
              {language === 'id' ? 'PAKET MISI CEPAT (1-CLICK LOADOUT PRESET)' : 'QUICK MISSION LOADOUT PRESETS'}
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetLoadout('cap')}
                className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-left transition-all text-[8px] font-mono"
              >
                <span className="font-bold text-blue-300 block">Air Superiority (CAP)</span>
                <span className="text-[7px] text-white/40 block">AIM-120C + AIM-9X</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetLoadout('cas')}
                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-left transition-all text-[8px] font-mono"
              >
                <span className="font-bold text-emerald-300 block">Close Air Support (CAS)</span>
                <span className="text-[7px] text-white/40 block">GBU-12 + Maverick + Pod</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetLoadout('maritime')}
                className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-left transition-all text-[8px] font-mono"
              >
                <span className="font-bold text-cyan-300 block">Maritime Strike (Anti-Ship)</span>
                <span className="text-[7px] text-white/40 block">Harpoon / Exocet + Pod</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetLoadout('sead')}
                className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-left transition-all text-[8px] font-mono"
              >
                <span className="font-bold text-purple-300 block">SEAD (Anti-Radar)</span>
                <span className="text-[7px] text-white/40 block">AGM-88 HARM / Kh-31P</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetLoadout('standoff')}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-left transition-all text-[8px] font-mono"
              >
                <span className="font-bold text-red-300 block">Standoff Cruise</span>
                <span className="text-[7px] text-white/40 block">Storm Shadow / JASSM</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetLoadout('ferry')}
                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-all text-[8px] font-mono"
              >
                <span className="font-bold text-amber-300 block">Long-Range Ferry</span>
                <span className="text-[7px] text-white/40 block">Multi-Drop Tanks 370G</span>
              </button>
            </div>
          </div>

          {/* Interactive Hardpoint Stations Schematic */}
          <div className="p-3 bg-black/60 border border-white/10 rounded-2xl space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[8.5px]">
              <span className="text-white/70 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>DIAGRAM STATUS HARDPOINT & PYLON</span>
              </span>
              <span className="text-emerald-400 font-bold text-[8px]">
                {activeWeaponsList.length} STASIUN AKTIF
              </span>
            </div>

            {/* Station Row: Wingtips */}
            <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[7.5px] text-cyan-300 font-bold block">STASIUN 1 & 9 (WINGTIP PYLONS)</span>
                <span className="text-[9px] text-white font-bold">
                  {hardpoints.wingtip ? weaponMap.get(hardpoints.wingtip)?.name : '(Kosong)'}
                </span>
                <span className="text-[7px] text-white/40 block">
                  {hardpoints.wingtip ? `Berat: 2x ${weaponMap.get(hardpoints.wingtip)?.weightLbs} LBS` : 'Khusus Rudal Jarak Dekat IR'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {hardpoints.wingtip && (
                  <button
                    type="button"
                    onClick={() => handleEquipWeapon('wingtip', null)}
                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-[7.5px] font-bold"
                  >
                    LEPAS
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStationToMount(selectedStationToMount === 'wingtip' ? null : 'wingtip')}
                  className={cn(
                    "px-2.5 py-1 rounded text-[8px] font-bold border transition-all",
                    selectedStationToMount === 'wingtip' ? "bg-cyan-600 text-white border-cyan-400" : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                  )}
                >
                  {selectedStationToMount === 'wingtip' ? 'BATAL' : 'GANTI'}
                </button>
              </div>
            </div>

            {/* Station Row: Outboard */}
            <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[7.5px] text-blue-300 font-bold block">STASIUN 2 & 8 (OUTBOARD WING)</span>
                <span className="text-[9px] text-white font-bold">
                  {hardpoints.outboard ? weaponMap.get(hardpoints.outboard)?.name : '(Kosong)'}
                </span>
                <span className="text-[7px] text-white/40 block">
                  {hardpoints.outboard ? `Berat: 2x ${weaponMap.get(hardpoints.outboard)?.weightLbs} LBS` : 'Rudal BVR / Bom / Roket'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {hardpoints.outboard && (
                  <button
                    type="button"
                    onClick={() => handleEquipWeapon('outboard', null)}
                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-[7.5px] font-bold"
                  >
                    LEPAS
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStationToMount(selectedStationToMount === 'outboard' ? null : 'outboard')}
                  className={cn(
                    "px-2.5 py-1 rounded text-[8px] font-bold border transition-all",
                    selectedStationToMount === 'outboard' ? "bg-blue-600 text-white border-blue-400" : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                  )}
                >
                  {selectedStationToMount === 'outboard' ? 'BATAL' : 'GANTI'}
                </button>
              </div>
            </div>

            {/* Station Row: Inboard (Drop Tanks / Heavy Ordnance) */}
            <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[7.5px] text-amber-300 font-bold block">STASIUN 3 & 7 (INBOARD HEAVY / DROP TANKS)</span>
                <span className="text-[9px] text-white font-bold">
                  {hardpoints.inboard ? weaponMap.get(hardpoints.inboard)?.name : '(Kosong)'}
                </span>
                <span className="text-[7px] text-white/40 block">
                  {hardpoints.inboard ? `Berat: 2x ${weaponMap.get(hardpoints.inboard)?.weightLbs} LBS` : 'Tangki Eksternal 300/370/600 Gal / Rudal Anti-Kapal'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {hardpoints.inboard && (
                  <button
                    type="button"
                    onClick={() => handleEquipWeapon('inboard', null)}
                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-[7.5px] font-bold"
                  >
                    LEPAS
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStationToMount(selectedStationToMount === 'inboard' ? null : 'inboard')}
                  className={cn(
                    "px-2.5 py-1 rounded text-[8px] font-bold border transition-all",
                    selectedStationToMount === 'inboard' ? "bg-amber-600 text-white border-amber-400" : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                  )}
                >
                  {selectedStationToMount === 'inboard' ? 'BATAL' : 'GANTI'}
                </button>
              </div>
            </div>

            {/* Station Row: Fuselage Conformal Packs */}
            <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[7.5px] text-emerald-300 font-bold block">FUSELAGE PACKS (CONFORMAL FUEL / RECESSED)</span>
                <span className="text-[9px] text-white font-bold">
                  {hardpoints.conformal ? weaponMap.get(hardpoints.conformal)?.name : '(Kosong)'}
                </span>
                <span className="text-[7px] text-white/40 block">
                  {hardpoints.conformal ? `Kapasitas: +3,000 LBS Avtur (Zero Drag)` : 'CFT 450 Gal Fuselage Packs'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {hardpoints.conformal && (
                  <button
                    type="button"
                    onClick={() => handleEquipWeapon('conformal', null)}
                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-[7.5px] font-bold"
                  >
                    LEPAS
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStationToMount(selectedStationToMount === 'conformal' ? null : 'conformal')}
                  className={cn(
                    "px-2.5 py-1 rounded text-[8px] font-bold border transition-all",
                    selectedStationToMount === 'conformal' ? "bg-emerald-600 text-white border-emerald-400" : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                  )}
                >
                  {selectedStationToMount === 'conformal' ? 'BATAL' : 'GANTI'}
                </button>
              </div>
            </div>

            {/* Station Row: Centerline */}
            <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[7.5px] text-purple-300 font-bold block">STASIUN 5 (CENTERLINE FUSELAGE)</span>
                <span className="text-[9px] text-white font-bold">
                  {hardpoints.centerline ? weaponMap.get(hardpoints.centerline)?.name : '(Kosong)'}
                </span>
                <span className="text-[7px] text-white/40 block">
                  {hardpoints.centerline ? `Targeting Pod / Tangki 150/300/600 Gal / Bom Berat` : 'Pod Sensor Pengintai / Tangki Tengah'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {hardpoints.centerline && (
                  <button
                    type="button"
                    onClick={() => handleEquipWeapon('centerline', null)}
                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-[7.5px] font-bold"
                  >
                    LEPAS
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStationToMount(selectedStationToMount === 'centerline' ? null : 'centerline')}
                  className={cn(
                    "px-2.5 py-1 rounded text-[8px] font-bold border transition-all",
                    selectedStationToMount === 'centerline' ? "bg-purple-600 text-white border-purple-400" : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                  )}
                >
                  {selectedStationToMount === 'centerline' ? 'BATAL' : 'GANTI'}
                </button>
              </div>
            </div>
          </div>

          {/* If a station is selected to mount, display compatible available arsenal */}
          {selectedStationToMount && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-2 font-mono"
            >
              <div className="flex items-center justify-between text-[8px]">
                <span className="text-cyan-300 font-bold uppercase">
                  PILIH MUNISI UNTUK STASIUN [{selectedStationToMount.toUpperCase()}]
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStationToMount(null)}
                  className="text-white/40 hover:text-white"
                >
                  TUTUP
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {WEAPONS_ARSENAL_CATALOG
                  .filter(w => w.hardpointStations.includes(selectedStationToMount))
                  .map(weapon => {
                    const isUnlocked = unlockedWeaponIds.includes(weapon.id);
                    const isEquipped = hardpoints[selectedStationToMount] === weapon.id;

                    return (
                      <div
                        key={weapon.id}
                        className={cn(
                          "p-2 rounded-xl border flex items-center justify-between transition-all text-[8px]",
                          isEquipped ? "bg-blue-600/30 border-blue-400" : "bg-black/40 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-[8.5px]">{weapon.name}</span>
                            {weapon.fuelCapacityGal && (
                              <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[7px]">
                                +{weapon.fuelCapacityGal} Gal
                              </span>
                            )}
                          </div>
                          <span className="text-white/50 text-[7px] block">{weapon.categoryLabelId}</span>
                          <span className="text-white/30 text-[6.5px]">Berat: {weapon.weightLbs} LBS | Range: {weapon.specs.range}</span>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => handleEquipWeapon(selectedStationToMount, weapon.id)}
                              className={cn(
                                "px-2.5 py-1 rounded text-[8px] font-bold uppercase border transition-all",
                                isEquipped ? "bg-emerald-600 border-emerald-400 text-white" : "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white"
                              )}
                            >
                              {isEquipped ? 'TERPASANG' : 'PASANG'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBuyWeapon(weapon)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 border border-amber-400 text-white rounded text-[7.5px] font-bold"
                            >
                              BELI {formatCurrency(weapon.price)}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* Ordnance Telemetry Summary Card */}
          <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2 text-[8.5px] font-mono">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <span className="text-white/40 text-[7px] block">TOTAL BERAT MUATAN</span>
                <span className="text-xs font-bold text-cyan-300">+{totalOrdnanceWeightLbs.toLocaleString()} LBS</span>
                <span className="text-[7px] text-white/30 block">Payload & Hardpoints</span>
              </div>

              <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <span className="text-white/40 text-[7px] block">TANGKI AVTUR EKSTERNAL</span>
                <span className="text-xs font-bold text-amber-300">+{totalExternalFuelGal} Gal</span>
                <span className="text-[7px] text-white/30 block">+{totalExternalFuelLbs.toLocaleString()} LBS Avtur</span>
              </div>

              <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <span className="text-white/40 text-[7px] block">EKSTENSI JANGKAUAN</span>
                <span className="text-xs font-bold text-emerald-300">+{totalRangeBonusNm} NM</span>
                <span className="text-[7px] text-white/30 block">Combat Radius Bonus</span>
              </div>
            </div>

            {/* Apply Loadout to Simulation */}
            <button
              type="button"
              onClick={() => {
                if (onApplyLoadoutToSim) onApplyLoadoutToSim();
                const msg = language === 'id' 
                  ? 'Konfigurasi persenjataan dan tangki eksternal berhasil disinkronkan ke komputer kendali penerbangan!' 
                  : 'Weapons and external tanks synced to flight management computer!';
                setTransactionFeedback(msg);
                if (speak) speak(msg);
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-[8.5px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'id' ? 'TERAPKAN MUATAN TEMPUR KE SIMULATOR' : 'APPLY COMBAT LOADOUT TO SIM'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW B: ARSENAL STORE (PROCUREMENT OF WEAPONS & DROP TANKS)   */}
      {/* ============================================================== */}
      {activeSubTab === 'shop' && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[7.5px] font-mono scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-2 py-1 rounded-lg transition-all shrink-0 border",
                selectedCategory === 'all' ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              Semua ({WEAPONS_ARSENAL_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('air_to_air')}
              className={cn(
                "px-2 py-1 rounded-lg transition-all shrink-0 border",
                selectedCategory === 'air_to_air' ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              Udara-ke-Udara (BVR/WVR)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('air_to_ground')}
              className={cn(
                "px-2 py-1 rounded-lg transition-all shrink-0 border",
                selectedCategory === 'air_to_ground' ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              Udara-ke-Darat (Bom/CAS)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('anti_ship')}
              className={cn(
                "px-2 py-1 rounded-lg transition-all shrink-0 border",
                selectedCategory === 'anti_ship' ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              Anti-Kapal (Maritim)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('fuel_tank')}
              className={cn(
                "px-2 py-1 rounded-lg transition-all shrink-0 border",
                selectedCategory === 'fuel_tank' ? "bg-amber-600 border-amber-400 text-white" : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              Tangki Avtur Eksternal
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('long_range')}
              className={cn(
                "px-2 py-1 rounded-lg transition-all shrink-0 border",
                selectedCategory === 'long_range' ? "bg-red-600 border-red-400 text-white" : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              Jelajah Siluman (Standoff)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('sead')}
              className={cn(
                "px-2 py-1 rounded-lg transition-all shrink-0 border",
                selectedCategory === 'sead' ? "bg-purple-600 border-purple-400 text-white" : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              Anti-Radar (SEAD)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('pod')}
              className={cn(
                "px-2 py-1 rounded-lg transition-all shrink-0 border",
                selectedCategory === 'pod' ? "bg-cyan-600 border-cyan-400 text-white" : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              Pod Sensor
            </button>
          </div>

          {/* Weapon Cards Grid */}
          <div className="space-y-2">
            {filteredCatalog.map(weapon => {
              const isUnlocked = unlockedWeaponIds.includes(weapon.id);
              const canAfford = budget >= weapon.price;

              return (
                <div
                  key={weapon.id}
                  className="p-3 bg-black/60 border border-white/10 rounded-2xl space-y-2 font-mono hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white font-mono">{weapon.name}</span>
                        {isUnlocked ? (
                          <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            DIMILIKI (IN ARSENAL)
                          </span>
                        ) : (
                          <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            TERSEDIA UNTUK PENGADAAN
                          </span>
                        )}
                      </div>
                      <span className="text-[7.5px] text-blue-300 block">{weapon.categoryLabelId}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-300 font-mono block">
                        {weapon.price === 0 ? 'GRATIS' : formatCurrency(weapon.price)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[7.5px] text-white/70">
                    {weapon.descriptionId}
                  </p>

                  {/* Specs Pill tags */}
                  <div className="grid grid-cols-2 gap-1.5 text-[7px] bg-white/5 p-2 rounded-xl">
                    <div className="text-white/60">
                      <span>Jangkauan: </span>
                      <span className="text-white font-bold">{weapon.specs.range || 'N/A'}</span>
                    </div>
                    <div className="text-white/60">
                      <span>Kecepatan: </span>
                      <span className="text-cyan-300 font-bold">{weapon.specs.speed || 'N/A'}</span>
                    </div>
                    <div className="text-white/60">
                      <span>Panduan: </span>
                      <span className="text-emerald-300 font-bold truncate">{weapon.specs.guidance || 'Direct'}</span>
                    </div>
                    <div className="text-white/60">
                      <span>Hulu Ledak: </span>
                      <span className="text-amber-300 font-bold truncate">{weapon.specs.warhead || 'HE'}</span>
                    </div>
                  </div>

                  {/* Buy / Owned action */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-[7px] text-white/40">
                      Stasiun Kompatibel: {weapon.hardpointStations.join(', ').toUpperCase()}
                    </span>

                    {isUnlocked ? (
                      <span className="text-[8px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>SIAP DI PASANG DI HARDPOINT</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuyWeapon(weapon)}
                        disabled={!canAfford}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[8px] font-bold uppercase transition-all flex items-center gap-1.5 shadow",
                          canAfford 
                            ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 active:scale-95" 
                            : "bg-white/10 text-white/40 cursor-not-allowed"
                        )}
                      >
                        <Plus className="w-3 h-3" />
                        <span>BELI DENGAN ANGGARAN</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
