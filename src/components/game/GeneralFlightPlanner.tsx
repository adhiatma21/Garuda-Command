import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plane,
  MapPin,
  Plus,
  Trash2,
  Compass,
  Gauge,
  CloudSun,
  Clock,
  Zap,
  Target,
  Shield,
  Play,
  CheckCircle2,
  ChevronDown,
  Navigation,
  Fuel,
  Timer,
  Ruler,
  AlertCircle
} from 'lucide-react';
import { cn, getDistance, getBearing } from '../../lib/utils';
import { Waypoint, Aircraft, PlayerProfile } from '../../types';
import { MilitaryAirport, MILITARY_AIRPORTS } from '../../airports';
import { INTERNATIONAL_WAYPOINTS, WaypointData } from '../../waypoints';
import { AIRCRAFT_PRESETS } from '../../constants';
import { AirportSelector } from './AirportSelector';

interface GeneralFlightPlannerProps {
  language: 'id' | 'en';
  selectedAircraft: Aircraft;
  setSelectedAircraft: (ac: Aircraft) => void;
  departureAirport: MilitaryAirport | null;
  setDepartureAirport: (ap: MilitaryAirport | null) => void;
  arrivalAirport: MilitaryAirport | null;
  setArrivalAirport: (ap: MilitaryAirport | null) => void;
  waypoints: Waypoint[];
  setWaypoints: (wps: Waypoint[] | ((prev: Waypoint[]) => Waypoint[])) => void;
  initialFuel: number;
  calculateFuelPlan: (wps: Waypoint[], initialFuel: number, burnRate: number, cruiseSpeed: number) => Waypoint[];
  playerProfile?: PlayerProfile | null;
  targetAltitude?: number;
  setTargetAltitude?: (alt: number) => void;
  targetSpeed?: number;
  setTargetSpeed?: (spd: number) => void;
  onStartMission: () => void;
  isTracking: boolean;
  onRTB?: () => void;
  isRTB?: boolean;
  deleteCurrentRoute?: () => void;
}

interface PlannerWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude: number; // in feet
}

export const GeneralFlightPlanner: React.FC<GeneralFlightPlannerProps> = ({
  language,
  selectedAircraft,
  setSelectedAircraft,
  departureAirport,
  setDepartureAirport,
  arrivalAirport,
  setArrivalAirport,
  waypoints,
  setWaypoints,
  initialFuel,
  calculateFuelPlan,
  playerProfile,
  targetAltitude,
  setTargetAltitude,
  targetSpeed,
  setTargetSpeed,
  onStartMission,
  isTracking,
  onRTB,
  isRTB,
  deleteCurrentRoute
}) => {
  // 1. MISSION NAME
  const [missionName, setMissionName] = useState<string>(
    language === 'id' ? 'OPERASI ELANG NUSANTARA - PATROLI WILAYAH' : 'OPERATION EAGLE SHIELD - ROUTINE PATROL'
  );

  // 9. CRUISE ALTITUDE
  const [cruiseAltitude, setCruiseAltitude] = useState<number>(targetAltitude || 25000);

  // 10. WEATHER
  const [weather, setWeather] = useState<'RANDOM' | 'CLEAR' | 'CLOUDY' | 'RAIN' | 'THUNDERSTORM' | 'TURBULENCE'>('RANDOM');

  // 11. TIME OF DAY
  const [timeOfDay, setTimeOfDay] = useState<'RANDOM' | 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT'>('RANDOM');

  // 12. IN-FLIGHT EVENTS
  const [inFlightEvents, setInFlightEvents] = useState<'NONE' | 'NORMAL' | 'FREQUENT' | 'INTENSE'>('NORMAL');

  // 13. OBJECTIVE
  const [objective, setObjective] = useState<'ROUTINE_FLIGHT' | 'AREA_RECON' | 'NAV_TRAINING' | 'ENDURANCE_TEST' | 'BORDER_PATROL'>('ROUTINE_FLIGHT');

  // 14. DIFFICULTY
  const [difficulty, setDifficulty] = useState<'RECRUIT' | 'REGULAR' | 'VETERAN' | 'ACE'>('REGULAR');

  // Airport search states
  const [depSearch, setDepSearch] = useState('');
  const [arrSearch, setArrSearch] = useState('');

  // Find Home Base
  const homeBase = useMemo<MilitaryAirport>(() => {
    if (departureAirport) return departureAirport;
    if (playerProfile?.homeAirbase) {
      const baseName = playerProfile.homeAirbase.replace('Lanud ', '').toLowerCase();
      const found = MILITARY_AIRPORTS.find(a => a.name.toLowerCase().includes(baseName) || a.icao.toLowerCase().includes(baseName));
      if (found) return found;
    }
    return MILITARY_AIRPORTS[0] || {
      icao: 'WIHH',
      name: 'Halim Perdanakusuma AFB (Jakarta)',
      lat: -6.2667,
      lng: 106.8833,
      country: 'Indonesia'
    };
  }, [departureAirport, playerProfile]);

  // Intermediate Planner Waypoints state
  const [plannerWaypoints, setPlannerWaypoints] = useState<PlannerWaypoint[]>(() => {
    // Generate 3 intelligent default waypoints based on Home Base coordinates
    const baseLat = homeBase.lat;
    const baseLng = homeBase.lng;
    return [
      {
        id: 'wp-1',
        name: 'WAYPOINT 01 (SECTOR ALPHA)',
        lat: Number((baseLat + 0.45).toFixed(4)),
        lng: Number((baseLng + 0.65).toFixed(4)),
        altitude: 24000
      },
      {
        id: 'wp-2',
        name: 'WAYPOINT 02 (SECTOR BRAVO)',
        lat: Number((baseLat + 0.20).toFixed(4)),
        lng: Number((baseLng + 1.20).toFixed(4)),
        altitude: 28000
      },
      {
        id: 'wp-3',
        name: 'WAYPOINT 03 (SECTOR CHARLIE)',
        lat: Number((baseLat - 0.35).toFixed(4)),
        lng: Number((baseLng + 0.55).toFixed(4)),
        altitude: 25000
      }
    ];
  });

  // Ensure default Takeoff & Landing are set to Home Base if null
  useEffect(() => {
    if (!departureAirport && homeBase) {
      setDepartureAirport(homeBase);
    }
    if (!arrivalAirport && homeBase) {
      setArrivalAirport(homeBase);
    }
  }, [homeBase, departureAirport, arrivalAirport, setDepartureAirport, setArrivalAirport]);

  // Sync with global waypoints state so map renders full route preview immediately
  const syncToGlobalWaypoints = useCallback((
    dep: MilitaryAirport | null,
    arr: MilitaryAirport | null,
    wps: PlannerWaypoint[],
    aircraft: Aircraft,
    cruiseAlt: number
  ) => {
    if (wps.length === 0) {
      setWaypoints([]);
      return;
    }

    const currentDep = dep || homeBase;
    const currentArr = arr || dep || homeBase;

    const fullWaypoints: Waypoint[] = [
      {
        id: 'dep-' + currentDep.icao,
        name: `${currentDep.icao} - ${currentDep.name}`,
        lat: currentDep.lat,
        lng: currentDep.lng,
        reached: false,
        type: 'airport',
        planAltitude: 0,
        planSpeed: 0
      },
      ...wps.map((wp, idx) => ({
        id: wp.id || `wp-${idx + 1}`,
        name: wp.name || `WP ${idx + 1}`,
        lat: wp.lat,
        lng: wp.lng,
        reached: false,
        type: 'waypoint' as const,
        planAltitude: wp.altitude || cruiseAlt,
        planSpeed: aircraft.cruiseSpeed
      })),
      {
        id: 'arr-' + currentArr.icao,
        name: `${currentArr.icao} - ${currentArr.name}`,
        lat: currentArr.lat,
        lng: currentArr.lng,
        reached: false,
        type: 'airport',
        planAltitude: 0,
        planSpeed: 0
      }
    ];

    const planned = calculateFuelPlan(
      fullWaypoints,
      initialFuel,
      aircraft.burnRate,
      aircraft.cruiseSpeed
    );
    setWaypoints(planned);
  }, [homeBase, calculateFuelPlan, initialFuel, setWaypoints]);

  // Update global waypoints on changes
  useEffect(() => {
    syncToGlobalWaypoints(departureAirport, arrivalAirport, plannerWaypoints, selectedAircraft, cruiseAltitude);
  }, [departureAirport, arrivalAirport, plannerWaypoints, selectedAircraft, cruiseAltitude, syncToGlobalWaypoints]);

  // Handlers for Waypoints
  const handleUpdateWaypoint = (index: number, field: keyof PlannerWaypoint, value: any) => {
    setPlannerWaypoints(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSelectPresetLocation = (index: number, location: { name: string; lat: number; lng: number }) => {
    setPlannerWaypoints(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        name: location.name,
        lat: location.lat,
        lng: location.lng
      };
      return copy;
    });
  };

  // 7. ADD WAYPOINT
  const handleAddWaypoint = () => {
    const nextIdx = plannerWaypoints.length + 1;
    const lastWp = plannerWaypoints[plannerWaypoints.length - 1];
    const newLat = lastWp ? Number((lastWp.lat + 0.25).toFixed(4)) : (departureAirport?.lat || homeBase.lat) + 0.3;
    const newLng = lastWp ? Number((lastWp.lng + 0.35).toFixed(4)) : (departureAirport?.lng || homeBase.lng) + 0.3;

    setPlannerWaypoints(prev => [
      ...prev,
      {
        id: 'wp-' + Date.now(),
        name: `WAYPOINT 0${nextIdx}`,
        lat: newLat,
        lng: newLng,
        altitude: cruiseAltitude
      }
    ]);
  };

  const handleGenerateDefaultRoute = () => {
    const baseLat = homeBase.lat;
    const baseLng = homeBase.lng;
    setPlannerWaypoints([
      {
        id: 'wp-1',
        name: 'WAYPOINT 01 (SECTOR ALPHA)',
        lat: Number((baseLat + 0.45).toFixed(4)),
        lng: Number((baseLng + 0.65).toFixed(4)),
        altitude: 24000
      },
      {
        id: 'wp-2',
        name: 'WAYPOINT 02 (SECTOR BRAVO)',
        lat: Number((baseLat + 0.20).toFixed(4)),
        lng: Number((baseLng + 1.20).toFixed(4)),
        altitude: 28000
      },
      {
        id: 'wp-3',
        name: 'WAYPOINT 03 (SECTOR CHARLIE)',
        lat: Number((baseLat - 0.35).toFixed(4)),
        lng: Number((baseLng + 0.55).toFixed(4)),
        altitude: 25000
      }
    ]);
  };

  const handleRemoveWaypoint = (index: number) => {
    setPlannerWaypoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteRoute = () => {
    setPlannerWaypoints([]);
    setMissionName(language === 'id' ? 'OPERASI ELANG NUSANTARA - PATROLI WILAYAH' : 'OPERATION EAGLE SHIELD - ROUTINE PATROL');
    setDepSearch('');
    setArrSearch('');
    if (deleteCurrentRoute) {
      deleteCurrentRoute();
    } else {
      setWaypoints([]);
      setArrivalAirport(null);
    }
  };

  // Calculations for Summary
  const routeCalculation = useMemo(() => {
    if (!waypoints || waypoints.length < 2) {
      return { totalDistance: 0, totalTimeMin: 0, totalFuel: 0 };
    }

    let totalDist = 0;
    for (let i = 1; i < waypoints.length; i++) {
      totalDist += getDistance(waypoints[i - 1].lat, waypoints[i - 1].lng, waypoints[i].lat, waypoints[i].lng);
    }

    const speed = selectedAircraft.cruiseSpeed || 450;
    const totalTimeHours = totalDist / speed;
    const totalTimeMin = Math.round(totalTimeHours * 60);
    const totalFuel = Math.round(totalDist * selectedAircraft.burnRate);

    return {
      totalDistance: Math.round(totalDist),
      totalTimeMin,
      totalFuel
    };
  }, [waypoints, selectedAircraft]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-6"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-blue-800/20 to-transparent p-4 rounded-2xl border border-blue-500/30 backdrop-blur-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Navigation className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span>FLIGHT PLANNER</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-[8px] text-blue-300 font-mono">GENERAL</span>
              </h3>
              <p className="text-[9px] text-white/50 uppercase tracking-wider mt-0.5">
                {language === 'id' ? 'Konfigurasi Rute & Parameter Penerbangan' : 'Flight Route & Operational Parameters'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. MISSION NAME */}
      <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
        <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-blue-400" />
          <span>1. {language === 'id' ? 'NAMA MISI (MISSION NAME)' : 'MISSION NAME'}</span>
        </label>
        <input
          type="text"
          value={missionName}
          onChange={(e) => setMissionName(e.target.value)}
          placeholder="OPERATION EAGLE SHIELD"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500/50 uppercase tracking-wider"
        />
      </div>

      {/* 2. AIRCRAFT SELECTOR */}
      <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-blue-400" />
            <span>2. {language === 'id' ? 'PESAWAT (AIRCRAFT)' : 'AIRCRAFT'}</span>
          </label>
          <span className="text-[8px] font-mono text-white/40 uppercase">
            {selectedAircraft.type} • {selectedAircraft.cruiseSpeed} KTS
          </span>
        </div>
        <select
          value={selectedAircraft.id}
          onChange={(e) => {
            const ac = AIRCRAFT_PRESETS.find(a => a.id === e.target.value);
            if (ac) {
              setSelectedAircraft(ac);
              if (setTargetSpeed) setTargetSpeed(ac.cruiseSpeed);
            }
          }}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500/50"
        >
          {AIRCRAFT_PRESETS.map(ac => (
            <option key={ac.id} value={ac.id} className="bg-[#0c111a] text-white">
              {ac.name} [{ac.type.toUpperCase()}] - Cruise {ac.cruiseSpeed} kts - Max {ac.maxFuel.toLocaleString()} lbs
            </option>
          ))}
        </select>
      </div>

      {/* 3. TAKEOFF FROM (Home Base default) */}
      <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-green-400" />
            <span>3. {language === 'id' ? 'BERANGKAT DARI (TAKEOFF FROM)' : 'TAKEOFF FROM'}</span>
          </label>
          <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-[8px] font-mono text-green-400">
            {language === 'id' ? 'HOME BASE' : 'HOME BASE'}
          </span>
        </div>
        <AirportSelector
          label={language === 'id' ? 'Pangkalan Keberangkatan' : 'Departure Airbase'}
          value={departureAirport || homeBase}
          search={depSearch}
          onSearchChange={setDepSearch}
          onSelect={(ap) => {
            setDepartureAirport(ap);
            setDepSearch('');
          }}
          language={language}
        />
      </div>

      {/* 4, 5, 6, 7. DYNAMIC WAYPOINTS LIST */}
      <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'id' ? 'TITIK NAVIGASI (WAYPOINTS)' : 'MISSION WAYPOINTS'} ({plannerWaypoints.length})</span>
          </label>
          <button
            onClick={handleAddWaypoint}
            className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 rounded-lg text-[9px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>{language === 'id' ? 'TAMBAH TITIK' : 'ADD WAYPOINT'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {plannerWaypoints.length === 0 ? (
            <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-center space-y-2.5">
              <p className="text-[11px] text-white/40 font-mono">
                {language === 'id' ? 'Titik rute kosong (Belum ada titik waypoint aktif)' : 'No waypoints (Route is currently empty)'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleAddWaypoint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600/40 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'id' ? 'Tambah Titik Baru' : 'Add New Waypoint'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateDefaultRoute}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{language === 'id' ? 'Buat Rute Patroli Standar' : 'Generate Standard Patrol'}</span>
                </button>
              </div>
            </div>
          ) : (
            plannerWaypoints.map((wp, idx) => (
              <motion.div
                key={`planner-wp-${wp.id || 'idx'}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2.5 relative group hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-400/40 text-[9px] font-mono font-bold text-blue-300 flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={wp.name}
                      onChange={(e) => handleUpdateWaypoint(idx, 'name', e.target.value)}
                      placeholder={`WAYPOINT 0${idx + 1}`}
                      className="bg-transparent text-xs font-bold text-white focus:outline-none focus:border-b border-blue-500 uppercase tracking-wider"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveWaypoint(idx)}
                    className="p-1 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                    title={language === 'id' ? 'Hapus Waypoint' : 'Remove Waypoint'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] text-white/40 uppercase font-mono">LATITUDE</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={wp.lat}
                    onChange={(e) => handleUpdateWaypoint(idx, 'lat', parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-white/40 uppercase font-mono">LONGITUDE</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={wp.lng}
                    onChange={(e) => handleUpdateWaypoint(idx, 'lng', parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              {/* Altitude setting */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[8px] text-white/40 uppercase font-mono flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-blue-400" />
                    <span>ALTITUDE (FT)</span>
                  </label>
                  <span className="text-[9px] font-mono font-bold text-blue-400">
                    FL{Math.round((wp.altitude || 25000) / 100)} ({wp.altitude.toLocaleString()} FT)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[15000, 20000, 25000, 30000, 35000].map(alt => (
                    <button
                      key={alt}
                      type="button"
                      onClick={() => handleUpdateWaypoint(idx, 'altitude', alt)}
                      className={cn(
                        "flex-1 py-1 rounded text-[8px] font-mono font-bold transition-all border",
                        wp.altitude === alt
                          ? "bg-blue-600 text-white border-blue-400"
                          : "bg-black/30 text-white/50 border-white/10 hover:bg-white/10"
                      )}
                    >
                      FL{alt / 100}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preset Selector for this Waypoint */}
              <div className="pt-1">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [type, id] = val.split(':');
                    if (type === 'wp') {
                      const found = INTERNATIONAL_WAYPOINTS.find(w => w.id === id);
                      if (found) handleSelectPresetLocation(idx, found);
                    } else if (type === 'ap') {
                      const found = MILITARY_AIRPORTS.find(a => a.icao === id);
                      if (found) handleSelectPresetLocation(idx, { name: `${found.icao} - ${found.name}`, lat: found.lat, lng: found.lng });
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] text-white/70 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {language === 'id' ? '⚡ Pilih Titik Acuan dari Database...' : '⚡ Pick Reference Fix from Database...'}
                  </option>
                  <optgroup label="ICAO International Fixes">
                    {INTERNATIONAL_WAYPOINTS.slice(0, 15).map((w, wIdx) => (
                      <option key={`intl-fix-${w.id}-${wIdx}`} value={`wp:${w.id}`}>
                        FIX: {w.name} ({w.lat.toFixed(2)}, {w.lng.toFixed(2)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Airbase & Airports">
                    {MILITARY_AIRPORTS.slice(0, 15).map((a, aIdx) => (
                      <option key={`mil-ap-${a.icao}-${aIdx}`} value={`ap:${a.icao}`}>
                        AIRBASE: {a.icao} - {a.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </motion.div>
          )))}
        </div>

        {/* 7. ADD WAYPOINT & DELETE ROUTE BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddWaypoint}
            className="py-2.5 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-blue-500/40 rounded-xl text-[10px] font-bold text-white/70 hover:text-white uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>7. {language === 'id' ? 'TAMBAH WAYPOINT' : 'ADD WAYPOINT'}</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteRoute}
            className="py-2.5 bg-red-500/10 hover:bg-red-600/20 border border-red-500/30 hover:border-red-500/60 rounded-xl text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
            title={language === 'id' ? 'Hapus semua titik rute dan reset pesawat ke base' : 'Delete all route waypoints and return aircraft to base'}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>{language === 'id' ? 'DELETE CURRENT ROUTE' : 'DELETE CURRENT ROUTE'}</span>
          </button>
        </div>
      </div>

      {/* 8. LANDING AT (Home Base default) */}
      <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span>8. {language === 'id' ? 'MENDARAT DI (LANDING AT)' : 'LANDING AT'}</span>
          </label>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-[8px] font-mono text-purple-400">
            {language === 'id' ? 'KEMBALI KE BASE' : 'RETURN TO BASE'}
          </span>
        </div>
        <AirportSelector
          label={language === 'id' ? 'Pangkalan Pendaratan' : 'Arrival Airbase'}
          value={arrivalAirport || departureAirport || homeBase}
          search={arrSearch}
          onSearchChange={setArrSearch}
          onSelect={(ap) => {
            setArrivalAirport(ap);
            setArrSearch('');
          }}
          language={language}
        />
      </div>

      {/* 9. CRUISE ALTITUDE */}
      <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>9. {language === 'id' ? 'KETINGGIAN JELAJAH (CRUISE ALTITUDE)' : 'CRUISE ALTITUDE'}</span>
          </label>
          <span className="text-xs font-mono font-bold text-blue-400">
            FL{Math.round(cruiseAltitude / 100)} ({cruiseAltitude.toLocaleString()} FT)
          </span>
        </div>
        <input
          type="range"
          min="10000"
          max="45000"
          step="1000"
          value={cruiseAltitude}
          onChange={(e) => {
            const alt = parseInt(e.target.value);
            setCruiseAltitude(alt);
            if (setTargetAltitude) setTargetAltitude(alt);
          }}
          className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[8px] font-mono text-white/30">
          <span>FL100 (10K FT)</span>
          <span>FL250 (25K FT)</span>
          <span>FL350 (35K FT)</span>
          <span>FL450 (45K FT)</span>
        </div>
      </div>

      {/* 10. WEATHER & 11. TIME OF DAY */}
      <div className="grid grid-cols-2 gap-3">
        {/* 10. WEATHER */}
        <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
          <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
            <span>10. {language === 'id' ? 'CUACA' : 'WEATHER'}</span>
          </label>
          <select
            value={weather}
            onChange={(e) => setWeather(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-[11px] font-bold text-white focus:outline-none"
          >
            <option value="RANDOM" className="bg-[#0c111a]">{language === 'id' ? '⚡ RANDOM (ACAK)' : '⚡ RANDOM'}</option>
            <option value="CLEAR" className="bg-[#0c111a]">{language === 'id' ? 'CERAH (CLEAR)' : 'CLEAR SKIES'}</option>
            <option value="CLOUDY" className="bg-[#0c111a]">{language === 'id' ? 'BERAWAN (CLOUDY)' : 'SCATTERED CLOUDS'}</option>
            <option value="RAIN" className="bg-[#0c111a]">{language === 'id' ? 'HUJAN (RAIN)' : 'HEAVY RAIN'}</option>
            <option value="THUNDERSTORM" className="bg-[#0c111a]">{language === 'id' ? 'BADAI (THUNDERSTORM)' : 'THUNDERSTORM'}</option>
            <option value="TURBULENCE" className="bg-[#0c111a]">{language === 'id' ? 'TURBULENSI (TURBULENCE)' : 'TURBULENCE'}</option>
          </select>
        </div>

        {/* 11. TIME OF DAY */}
        <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
          <label className="text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>11. {language === 'id' ? 'WAKTU' : 'TIME OF DAY'}</span>
          </label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-[11px] font-bold text-white focus:outline-none"
          >
            <option value="RANDOM" className="bg-[#0c111a]">{language === 'id' ? '⚡ RANDOM (ACAK)' : '⚡ RANDOM'}</option>
            <option value="DAWN" className="bg-[#0c111a]">{language === 'id' ? 'FAJAR (DAWN / 05:30Z)' : 'DAWN (05:30Z)'}</option>
            <option value="DAY" className="bg-[#0c111a]">{language === 'id' ? 'SIANG (DAY / 12:00Z)' : 'DAY (12:00Z)'}</option>
            <option value="DUSK" className="bg-[#0c111a]">{language === 'id' ? 'SENJA (DUSK / 17:45Z)' : 'DUSK (17:45Z)'}</option>
            <option value="NIGHT" className="bg-[#0c111a]">{language === 'id' ? 'MALAM (NIGHT / 22:00Z)' : 'NIGHT (22:00Z)'}</option>
          </select>
        </div>
      </div>

      {/* 12. IN-FLIGHT EVENTS, 13. OBJECTIVE, 14. DIFFICULTY */}
      <div className="space-y-3">
        {/* 12. IN-FLIGHT EVENTS */}
        <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
          <label className="text-[9px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>12. {language === 'id' ? 'INSIDEN DALAM PENERBANGAN (IN-FLIGHT EVENTS)' : 'IN-FLIGHT EVENTS'}</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['NONE', 'NORMAL', 'FREQUENT', 'INTENSE'] as const).map(ev => (
              <button
                key={ev}
                type="button"
                onClick={() => setInFlightEvents(ev)}
                className={cn(
                  "py-1.5 rounded-lg text-[9px] font-bold transition-all border",
                  inFlightEvents === ev
                    ? "bg-red-600/30 text-red-300 border-red-500/50 shadow-lg shadow-red-500/10"
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                )}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>

        {/* 13. OBJECTIVE */}
        <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
          <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>13. {language === 'id' ? 'OBJEKTIF UTAMA (OBJECTIVE)' : 'OBJECTIVE'}</span>
          </label>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-[11px] font-bold text-white focus:outline-none"
          >
            <option value="ROUTINE_FLIGHT" className="bg-[#0c111a]">
              {language === 'id' ? 'ROUTINE FLIGHT (Penerbangan Patroli Rutin)' : 'ROUTINE FLIGHT'}
            </option>
            <option value="AREA_RECON" className="bg-[#0c111a]">
              {language === 'id' ? 'AREA RECONNAISSANCE (Pengintaian Sektor)' : 'AREA RECONNAISSANCE'}
            </option>
            <option value="NAV_TRAINING" className="bg-[#0c111a]">
              {language === 'id' ? 'NAVIGATION TRAINING (Latihan Navigasi IFR)' : 'NAVIGATION TRAINING'}
            </option>
            <option value="ENDURANCE_TEST" className="bg-[#0c111a]">
              {language === 'id' ? 'ENDURANCE TEST (Uji Ketahanan Bahan Bakar)' : 'ENDURANCE TEST'}
            </option>
            <option value="BORDER_PATROL" className="bg-[#0c111a]">
              {language === 'id' ? 'BORDER PATROL (Patroli Garis Batas Wilayah)' : 'BORDER PATROL'}
            </option>
          </select>
        </div>

        {/* 14. DIFFICULTY */}
        <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
          <label className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>14. {language === 'id' ? 'TINGKAT KESULITAN (DIFFICULTY)' : 'DIFFICULTY'}</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['RECRUIT', 'REGULAR', 'VETERAN', 'ACE'] as const).map(dif => (
              <button
                key={dif}
                type="button"
                onClick={() => setDifficulty(dif)}
                className={cn(
                  "py-1.5 rounded-lg text-[9px] font-bold transition-all border",
                  difficulty === dif
                    ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                )}
              >
                {dif}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ROUTE SUMMARY SECTION ================= */}
      <div className="p-4 bg-[#101726] border border-blue-500/30 rounded-2xl space-y-4 shadow-xl shadow-blue-950/20">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              {language === 'id' ? 'RINGKASAN RUTE MISI' : 'ROUTE SUMMARY'}
            </h4>
          </div>
          <span className="text-[8px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {waypoints.length} POINTS
          </span>
        </div>

        {/* Route Visual Path Flow */}
        <div className="space-y-2 text-xs font-mono">
          {/* TAKEOFF */}
          <div className="flex items-center gap-2.5 p-2 bg-black/40 rounded-lg border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span className="text-[9px] font-black text-green-400 uppercase tracking-widest w-16">TAKEOFF</span>
            <span className="text-white/80 font-bold truncate">
              {departureAirport?.icao || homeBase.icao} - {departureAirport?.name || homeBase.name}
            </span>
          </div>

          {/* INTERMEDIATE WAYPOINTS */}
          {plannerWaypoints.map((wp, idx) => (
            <div key={`summary-wp-${wp.id || 'idx'}-${idx}`} className="flex items-center gap-2.5 p-2 bg-black/30 rounded-lg border border-white/5 pl-4">
              <span className="text-blue-400 font-bold text-xs">→</span>
              <span className="text-[9px] font-mono text-blue-300 font-bold w-16">WP 0{idx + 1}</span>
              <span className="text-white/70 font-semibold truncate flex-1">{wp.name}</span>
              <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                FL{Math.round(wp.altitude / 100)}
              </span>
            </div>
          ))}

          {/* LANDING */}
          <div className="flex items-center gap-2.5 p-2 bg-black/40 rounded-lg border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest w-16">LANDING</span>
            <span className="text-white/80 font-bold truncate">
              {arrivalAirport?.icao || departureAirport?.icao || homeBase.icao} - {arrivalAirport?.name || departureAirport?.name || homeBase.name}
            </span>
          </div>
        </div>

        {/* METRICS: ESTIMATED FLIGHT TIME, ESTIMATED FUEL, DISTANCE */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 space-y-0.5">
            <div className="flex items-center gap-1 text-[8px] text-white/40 uppercase tracking-widest">
              <Ruler className="w-3 h-3 text-blue-400" />
              <span>{language === 'id' ? 'JARAK' : 'DISTANCE'}</span>
            </div>
            <p className="text-sm font-mono font-black text-blue-400">
              {routeCalculation.totalDistance} <span className="text-[9px] text-white/40">NM</span>
            </p>
          </div>

          <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 space-y-0.5">
            <div className="flex items-center gap-1 text-[8px] text-white/40 uppercase tracking-widest">
              <Timer className="w-3 h-3 text-amber-400" />
              <span>{language === 'id' ? 'EST. WAKTU' : 'EST. TIME'}</span>
            </div>
            <p className="text-sm font-mono font-black text-amber-400">
              {routeCalculation.totalTimeMin >= 60
                ? `${Math.floor(routeCalculation.totalTimeMin / 60)}H ${routeCalculation.totalTimeMin % 60}M`
                : `${routeCalculation.totalTimeMin} MIN`}
            </p>
          </div>

          <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 space-y-0.5">
            <div className="flex items-center gap-1 text-[8px] text-white/40 uppercase tracking-widest">
              <Fuel className="w-3 h-3 text-orange-400" />
              <span>{language === 'id' ? 'EST. BBM' : 'EST. FUEL'}</span>
            </div>
            <p className="text-sm font-mono font-black text-orange-400">
              {routeCalculation.totalFuel.toLocaleString()} <span className="text-[9px] text-white/40">LBS</span>
            </p>
          </div>
        </div>

        {/* START / ABORT / RTB / DELETE ROUTE ACTION BUTTONS */}
        <div className={cn("grid gap-2", isTracking ? "grid-cols-2" : "grid-cols-1")}>
          <button
            type="button"
            onClick={onStartMission}
            className={cn(
              "w-full py-3.5 rounded-xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl text-xs",
              isTracking
                ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 active:scale-[0.98]"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-600/30 active:scale-[0.98]"
            )}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isTracking ? (language === 'id' ? 'HENTIKAN MISI' : 'ABORT MISSION') : (language === 'id' ? 'START MISSION' : 'START MISSION')}</span>
          </button>

          {isTracking && onRTB && (
            <button
              type="button"
              onClick={onRTB}
              disabled={isRTB}
              className={cn(
                "w-full py-3.5 rounded-xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl text-xs",
                isRTB
                  ? "bg-orange-600/50 text-orange-200 cursor-not-allowed border border-orange-400/30"
                  : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/30 active:scale-[0.98]"
              )}
            >
              <Navigation className={cn("w-4 h-4", isRTB ? "animate-spin" : "")} />
              <span>{isRTB ? (language === 'id' ? 'MENUJU BASE...' : 'RTB IN PROGRESS...') : (language === 'id' ? 'RTB (HOME BASE)' : 'RTB (HOME BASE)')}</span>
            </button>
          )}
        </div>

        {/* DELETE CURRENT ROUTE BUTTON IN SUMMARY */}
        <button
          type="button"
          onClick={handleDeleteRoute}
          className="w-full py-2.5 bg-red-500/10 hover:bg-red-600/20 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>{language === 'id' ? 'DELETE CURRENT ROUTE (RESET KE BASE)' : 'DELETE CURRENT ROUTE (RETURN TO BASE)'}</span>
        </button>
      </div>
    </motion.div>
  );
};
