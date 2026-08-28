import React, { useState, useMemo } from 'react';
import { Fuel, Box, Wind, MapPin, AlertTriangle, CheckCircle2, Target, Sliders, Navigation, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getDistance } from '../../lib/utils';
import { Position } from '../../types';
import { MilitaryAirport } from '../../airports';

interface RefuelOptionsModalProps {
  show: boolean;
  language: string;
  onExternalTank: () => void;
  onConfirmAirRefuel: (refuelPos: Position) => void;
  onPickOnMap: () => void;
  onAbort: () => void;
  departurePos: Position | null;
  targetPos: Position | null;
  departureAirport?: MilitaryAirport | null;
  totalDistance: number;
  initialFuel: number;
  burnRate: number;
  aircraftName: string;
}

export const RefuelOptionsModal: React.FC<RefuelOptionsModalProps> = ({
  show,
  language,
  onExternalTank,
  onConfirmAirRefuel,
  onPickOnMap,
  onAbort,
  departurePos,
  targetPos,
  departureAirport,
  totalDistance,
  initialFuel,
  burnRate,
  aircraftName
}) => {
  const [activeTab, setActiveTab] = useState<'options' | 'aar_config'>('options');
  const [sliderRatio, setSliderRatio] = useState<number>(0.45); // 45% along the leg by default

  const safeDefaultRange = useMemo(() => {
    const raw = initialFuel / (burnRate || 3.8);
    return Math.round(raw * 0.85); // 85% safety buffer
  }, [initialFuel, burnRate]);

  const maxRawRange = useMemo(() => {
    return Math.round(initialFuel / (burnRate || 3.8));
  }, [initialFuel, burnRate]);

  // Calculate coordinates based on slider between departure and target
  const computedRefuelPos = useMemo<Position>(() => {
    const dep = departurePos || { lat: -6.2667, lng: 106.8833 };
    const tar = targetPos || { lat: -7.7881, lng: 110.4317 };

    const lat = Number((dep.lat + (tar.lat - dep.lat) * sliderRatio).toFixed(4));
    const lng = Number((dep.lng + (tar.lng - dep.lng) * sliderRatio).toFixed(4));

    return { lat, lng };
  }, [departurePos, targetPos, sliderRatio]);

  const [customLat, setCustomLat] = useState<string>('');
  const [customLng, setCustomLng] = useState<string>('');
  const [useCustomCoord, setUseCustomCoord] = useState<boolean>(false);

  const activeRefuelPos = useMemo<Position>(() => {
    if (useCustomCoord) {
      const lat = parseFloat(customLat);
      const lng = parseFloat(customLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return computedRefuelPos;
  }, [useCustomCoord, customLat, customLng, computedRefuelPos]);

  // Calculate distance from departure to chosen refueling point
  const distFromDepToRefuel = useMemo(() => {
    const dep = departurePos || { lat: -6.2667, lng: 106.8833 };
    return Math.round(getDistance(dep.lat, dep.lng, activeRefuelPos.lat, activeRefuelPos.lng));
  }, [departurePos, activeRefuelPos]);

  // Validation: Refueling point MUST be within safe fuel reach
  const isRefuelPointValid = distFromDepToRefuel <= safeDefaultRange;

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[7500] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6"
      >
        <motion.div 
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 30 }}
          className="bg-[#0b101b] border border-orange-500/40 rounded-[2.5rem] p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden text-white"
        >
          {/* Top glowing banner */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/40 shadow-lg shadow-orange-500/10">
                <Fuel className="w-8 h-8 text-orange-400 animate-pulse" />
              </div>
              
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-white">
                  {language === 'id' ? 'JARAK MELEBIHI KAPASITAS BBM DEFAULT' : 'RANGE EXCEEDS DEFAULT FUEL CAPACITY'}
                </h2>
                <p className="text-[11px] text-white/50 font-mono uppercase tracking-wider mt-1">
                  {aircraftName} • {language === 'id' ? 'Kapasitas Tangki Bawaan:' : 'Default Tank Range:'} <span className="text-amber-400 font-bold">{maxRawRange} NM</span> (Aman: {safeDefaultRange} NM)
                </p>
              </div>

              {/* Status Pill */}
              <div className="bg-red-500/10 border border-red-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] font-mono font-bold text-red-300 uppercase">
                  {language === 'id' ? 'Total Jarak Rute:' : 'Total Route Distance:'} {Math.round(totalDistance)} NM (Defisit: -{Math.max(0, Math.round(totalDistance - maxRawRange))} NM)
                </span>
              </div>
            </div>

            {/* TAB SELECTION */}
            {activeTab === 'options' ? (
              <div className="space-y-4">
                <p className="text-[10px] text-center text-white/60 uppercase tracking-widest font-mono">
                  {language === 'id' ? 'Silakan pilih solusi pengisian atau perluasan jangkauan penerbangan:' : 'Please choose fuel extension or refueling solution:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* OPTION 1: EXTERNAL TANK */}
                  <button 
                    type="button"
                    onClick={onExternalTank}
                    className="p-5 rounded-2xl bg-white/5 hover:bg-blue-600/15 border border-white/10 hover:border-blue-500/50 transition-all text-left group flex flex-col justify-between space-y-3 relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all">
                        <Box className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[8px] font-bold border border-blue-500/30">
                        +30% RANGE
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono">
                        {language === 'id' ? 'OPSI 1: TANGKI EKSTERNAL' : 'OPTION 1: EXTERNAL TANK'}
                      </p>
                      <h4 className="text-xs font-bold text-white uppercase">
                        {language === 'id' ? 'Pasang Tangki Cadangan (Drop Tank)' : 'Equip External Drop Tank'}
                      </h4>
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        {language === 'id' 
                          ? `Menambah kapasitas bahan bakar menjadi ${Math.round(maxRawRange * 1.3)} NM tanpa perlu melakukan pengisian di udara.`
                          : `Expands fuel capacity to ${Math.round(maxRawRange * 1.3)} NM for direct flight without mid-air docking.`}
                      </p>
                    </div>
                  </button>

                  {/* OPTION 2: AIR TO AIR REFUELING */}
                  <button 
                    type="button"
                    onClick={() => setActiveTab('aar_config')}
                    className="p-5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-400 transition-all text-left group flex flex-col justify-between space-y-3 relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 group-hover:bg-orange-500/30 transition-all">
                        <Wind className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded bg-orange-500/30 text-orange-300 font-mono text-[8px] font-bold border border-orange-500/40">
                        AAR TANKER
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest font-mono">
                        {language === 'id' ? 'OPSI 2: AIR REFUELING' : 'OPTION 2: AIR REFUELING'}
                      </p>
                      <h4 className="text-xs font-bold text-white uppercase">
                        {language === 'id' ? 'Pengisian BBM di Udara (AAR Orbit)' : 'In-Flight Air Refueling (AAR)'}
                      </h4>
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        {language === 'id' 
                          ? 'Tentukan titik pertemuan dengan pesawat tanker (KC-130) di sepanjang rute untuk mengisi BBM hingga 100% penuh.'
                          : 'Set custom tanker rendezvous point along the route to replenish tanks to 100% in-flight.'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* AAR CONFIGURATION VIEW */
              <div className="space-y-4 bg-black/40 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-orange-400" />
                    <h3 className="text-xs font-black uppercase text-white tracking-widest">
                      {language === 'id' ? 'KONFIGURASI TITIK TEMU TANKER (AAR)' : 'TANKER RENDEZVOUS CONFIGURATION'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('options')}
                    className="text-[9px] font-mono text-white/40 hover:text-white transition-colors"
                  >
                    ← {language === 'id' ? 'Kembali' : 'Back'}
                  </button>
                </div>

                {/* Slider for Point Placement */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-white/60 uppercase">{language === 'id' ? 'Posisi di Jalur Rute:' : 'Route Progress Position:'}</span>
                    <span className="text-orange-400 font-bold">{Math.round(sliderRatio * 100)}% dari Titik Berangkat</span>
                  </div>

                  <input 
                    type="range"
                    min="0.15"
                    max="0.80"
                    step="0.05"
                    value={sliderRatio}
                    onChange={(e) => {
                      setUseCustomCoord(false);
                      setSliderRatio(parseFloat(e.target.value));
                    }}
                    className="w-full accent-orange-500 h-2 bg-white/10 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[8px] font-mono text-white/30">
                    <span>Dekat Pangkalan ({departureAirport?.icao || 'DEP'})</span>
                    <span>Tengah Rute</span>
                    <span>Mendekati RV</span>
                  </div>
                </div>

                {/* Coordinates Display & Validation Status */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider">{language === 'id' ? 'KOORDINAT TITIK AAR' : 'AAR COORDINATES'}</span>
                    <p className="font-bold text-blue-300">
                      {activeRefuelPos.lat.toFixed(4)}°, {activeRefuelPos.lng.toFixed(4)}°
                    </p>
                  </div>

                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider">{language === 'id' ? 'JARAK DARI BASE' : 'DIST FROM BASE'}</span>
                    <p className={cn("font-bold", isRefuelPointValid ? "text-green-400" : "text-red-400")}>
                      {distFromDepToRefuel} NM / <span className="text-[9px] text-white/40">Batas: {safeDefaultRange} NM</span>
                    </p>
                  </div>
                </div>

                {/* Validation Banner (Rule constraint: titik harus sesuai jarak kecukupan tangki) */}
                <div className={cn(
                  "p-3 rounded-xl border flex items-start gap-2.5 transition-all text-[9px] font-mono",
                  isRefuelPointValid
                    ? "bg-green-500/10 border-green-500/30 text-green-300"
                    : "bg-red-500/10 border-red-500/40 text-red-300"
                )}>
                  {isRefuelPointValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold uppercase">
                      {isRefuelPointValid
                        ? (language === 'id' ? 'TITIK REFUELING VALID & AMAN' : 'REFUELING POINT VALID & IN RANGE')
                        : (language === 'id' ? 'PERINGATAN: TITIK TERLALU JAUH!' : 'WARNING: POINT OUT OF RANGE!')}
                    </p>
                    <p className="text-[8px] opacity-80 leading-relaxed mt-0.5">
                      {isRefuelPointValid
                        ? (language === 'id'
                          ? `Pesawat memiliki kecukupan bahan bakar cadangan (${maxRawRange - distFromDepToRefuel} NM tersisa) saat tiba di titik pertemuan tanker.`
                          : `Aircraft will reach the tanker safely with ${maxRawRange - distFromDepToRefuel} NM of reserve fuel remaining.`)
                        : (language === 'id'
                          ? `Jarak ke titik refueling (${distFromDepToRefuel} NM) melebihi batas kecukupan tangki (${safeDefaultRange} NM). Geser slider ke kiri agar lebih dekat dengan pangkalan keberangkatan!`
                          : `Distance (${distFromDepToRefuel} NM) exceeds safe fuel tank range (${safeDefaultRange} NM). Move slider closer to departure airbase!`)}
                    </p>
                  </div>
                </div>

                {/* Choice buttons for AAR */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onPickOnMap}
                    className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-[9px] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Target className="w-3.5 h-3.5 text-orange-400" />
                    <span>{language === 'id' ? 'Pilih di Peta' : 'Pick on Map'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isRefuelPointValid}
                    onClick={() => onConfirmAirRefuel(activeRefuelPos)}
                    className={cn(
                      "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg",
                      isRefuelPointValid
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-500/20 active:scale-95 cursor-pointer"
                        : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'id' ? 'Konfirmasi Titik AAR' : 'Confirm AAR Point'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Abort Button */}
            <div className="flex justify-center pt-2">
              <button 
                type="button"
                onClick={onAbort}
                className="text-white/30 hover:text-white transition-colors text-[9px] font-mono font-bold uppercase tracking-widest"
              >
                {language === 'id' ? 'BATALKAN & KEMBALI' : 'ABORT & RETURN'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
