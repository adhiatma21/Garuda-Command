import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Droplets, 
  ShieldAlert, 
  Target, 
  CheckCircle2, 
  Navigation, 
  Shield, 
  Crosshair, 
  Plane, 
  Radio, 
  Compass, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  Play, 
  RotateCcw,
  Trash2,
  Fuel,
  Wind,
  Scale,
  Users,
  Gauge,
  Zap,
  Info,
  Plus,
  MapPin
} from 'lucide-react';
import { cn, getDistance } from '../../../lib/utils';
import { calculateAircraftWeights } from '../../../lib/weightCalculation';
import { AirportSelector } from '../AirportSelector';
import { Waypoint, Aircraft, Crew, PlayerProfile, ReconState, PlannerWaypoint, ActiveMission } from '../../../types';
import { MilitaryAirport } from '../../../airports';
import { AIRCRAFT_PRESETS } from '../../../constants';
import { GeneralFlightPlanner } from '../GeneralFlightPlanner';
import { ReconAircraft } from '../../../data/reconAircraft';
import { ReconMissionPlanner } from '../recon/ReconMissionPlanner';
import { ReconIntelConsole } from '../recon/ReconIntelConsole';

interface FlightTabProps {
  language: 'id' | 'en';
  crew: Crew;
  setCrew: (crew: Crew) => void;
  missionType: string;
  setMissionType: (type: string) => void;
  vvipTargetAircraft: Aircraft;
  setVvipTargetAircraft: (ac: Aircraft) => void;
  vvipStartPoint: MilitaryAirport | null;
  setVvipStartPoint: (ap: MilitaryAirport | null) => void;
  vvipStartSearch: string;
  setVvipStartSearch: (s: string) => void;
  vvipEndPoint: MilitaryAirport | null;
  setVvipEndPoint: (ap: MilitaryAirport | null) => void;
  vvipEndSearch: string;
  setVvipEndSearch: (s: string) => void;
  rendezvousLat: string;
  setRendezvousLat: (s: string) => void;
  rendezvousLng: string;
  setRendezvousLng: (s: string) => void;
  rendezvousPoint: Waypoint | null;
  setRendezvousPoint: (wp: Waypoint | null) => void;
  waypoints: Waypoint[];
  setWaypoints: (wps: Waypoint[] | ((prev: Waypoint[]) => Waypoint[])) => void;
  selectedAircraft: Aircraft;
  setSelectedAircraft?: (ac: Aircraft) => void;
  departureAirport: MilitaryAirport | null;
  setDepartureAirport: (ap: MilitaryAirport | null) => void;
  departureSearch: string;
  setDepartureSearch: (s: string) => void;
  arrivalAirport: MilitaryAirport | null;
  setArrivalAirport: (ap: MilitaryAirport | null) => void;
  arrivalSearch: string;
  setArrivalSearch: (s: string) => void;
  payload: number;
  setPayload: (p: number) => void;
  useSubTank: boolean;
  setUseSubTank: (b: boolean) => void;
  combatMode: boolean;
  setCombatMode: (b: boolean) => void;
  initialFuel: number;
  calculateFuelPlan: (wps: Waypoint[], initialFuel: number, burnRate: number, cruiseSpeed: number) => Waypoint[];
  playerProfile?: PlayerProfile | null;
  targetAltitude?: number;
  setTargetAltitude?: (alt: number) => void;
  targetSpeed?: number;
  setTargetSpeed?: (spd: number) => void;
  onStartMission?: () => void;
  isTracking?: boolean;
  onRTB?: () => void;
  isRTB?: boolean;
  deleteCurrentRoute?: () => void;
  onOpenRefuelOptions?: () => void;
  // Reconnaissance mission properties
  reconState?: ReconState | null;
  selectedRecon?: ReconAircraft;
  onSelectRecon?: (recon: ReconAircraft) => void;
  reconDeparture?: MilitaryAirport | null;
  onSelectReconDeparture?: (ap: MilitaryAirport) => void;
  reconArrival?: MilitaryAirport | null;
  onSelectReconArrival?: (ap: MilitaryAirport) => void;
  reconSurveyPoints?: Waypoint[];
  onSetReconSurveyPoints?: (wps: Waypoint[] | ((prev: Waypoint[]) => Waypoint[])) => void;
  onStartReconFlight?: () => void;
  isReconAirborne?: boolean;
  targetLatInput?: string;
  onSetTargetLatInput?: (val: string) => void;
  targetLngInput?: string;
  onSetTargetLngInput?: (val: string) => void;
  selectedWeaponId?: string;
  onSelectWeapon?: (id: string) => void;
  strikeLandingBase?: MilitaryAirport | null;
  onSelectStrikeLandingBase?: (ap: MilitaryAirport) => void;
  onScrambleStrike?: () => void;
  onEngageTarget?: () => void;
  isPlayerAirborne?: boolean;
  isTargetLocked?: boolean;
  isStrikeCompleted?: boolean;
  simulationSpeed?: number;
  onSetSimulationSpeed?: (s: number) => void;
  isManualWaypointMode?: boolean;
  setIsManualWaypointMode?: (v: boolean) => void;
  isPickingVvipRV?: boolean;
  setIsPickingVvipRV?: (v: boolean) => void;
  isPickingReconSurvey?: boolean;
  setIsPickingReconSurvey?: (v: boolean) => void;
  plannerWaypoints?: PlannerWaypoint[];
  setPlannerWaypoints?: React.Dispatch<React.SetStateAction<PlannerWaypoint[]>>;
  activeMissions?: ActiveMission[];
  selectedMissionId?: string | null;
  onSelectMission?: (missionId: string | null) => void;
  onAbortMission?: (missionId: string) => void;
  onRTBMission?: (missionId: string) => void;
  maxConcurrentMissions?: number;
  fleetCount?: number;
  crewCapacity?: number;
  onAddNewMissionPlan?: () => void;
}

const MISSION_OPTIONS = [
  {
    id: 'General',
    titleId: 'Umum (Flight Planner)',
    titleEn: 'General Flight Planner',
    badge: 'PLANNER',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Navigation,
    descId: 'Perencanaan rute IFR/VFR lengkap, bandara asal/tujuan & waypoint taktis.',
    descEn: 'Comprehensive IFR/VFR route planning with origin/dest bases & waypoints.'
  },
  {
    id: 'Patrol',
    titleId: 'Patroli Udara (Air Patrol)',
    titleEn: 'Air Patrol Operation',
    badge: 'PATROL',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: ShieldAlert,
    descId: 'Ronda udara perbatasan dan pemantauan intersepsi target radar asing.',
    descEn: 'Border airspace surveillance & airborne interception of radar targets.'
  },
  {
    id: 'VVIPEscort',
    titleId: 'Escort VVIP (Kepresidenan)',
    titleEn: 'VVIP Aircraft Escort',
    badge: 'VVIP',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Shield,
    descId: 'Pengawalan formasi pesawat Indonesia-One dengan titik Rendezvous (RV).',
    descEn: 'Formation escort for presidential Indonesia-One aircraft with RV point.'
  },
  {
    id: 'Combat',
    titleId: 'Tempur (Combat Air Patrol)',
    titleEn: 'Combat Air Patrol',
    badge: 'COMBAT',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: Crosshair,
    descId: 'Operasi pertahanan udara taktis, kesiapan senjata, dan patroli tempur.',
    descEn: 'Air defense tactical operations, weapons readiness & combat air patrol.'
  },
  {
    id: 'Transport',
    titleId: 'Angkut Taktis (Transport)',
    titleEn: 'Tactical Transport',
    badge: 'CARGO',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    icon: Plane,
    descId: 'Mobilisasi logistik militer, angkut personel, dan perbekalan taktis.',
    descEn: 'Military airlift, tactical troop deployment, and cargo logistics.'
  },
  {
    id: 'Recon',
    titleId: 'Pengintaian (Recon)',
    titleEn: 'Reconnaissance',
    badge: 'INTEL',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: Radio,
    descId: 'Pengawasan intelijen udara resolusi tinggi dan pemantauan maritim.',
    descEn: 'Strategic high-altitude intelligence & maritime surveillance.'
  },
  {
    id: 'Refueling',
    titleId: 'Air to Air Refueling (AAR)',
    titleEn: 'Air to Air Refueling',
    badge: 'REFUEL',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    icon: Droplets,
    descId: 'Prosedur pengisian bahan bakar udara bersama pesawat tanker KC-130.',
    descEn: 'Airborne refueling rendezvous & docking procedure with KC-130 tankers.'
  },
  {
    id: 'Training',
    titleId: 'Latihan Tempur (Training)',
    titleEn: 'Combat Training',
    badge: 'TRAINING',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: Target,
    descId: 'Simulasi manuver tempur, formasi taktis, dan latihan penembakan.',
    descEn: 'Fighter dogfight drills, formation maneuvers & gunnery training.'
  },
  {
    id: 'Ferry',
    titleId: 'Ferry Flight (Relokasi)',
    titleEn: 'Ferry Flight',
    badge: 'FERRY',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Compass,
    descId: 'Penerbangan relokasi pesawat jarak jauh antar pangkalan udara.',
    descEn: 'Long-range aircraft repositioning flights between airbases.'
  }
];

const PATROL_PRESETS = [
  {
    nameId: 'Sektor Selat Sunda & Banten',
    nameEn: 'Sunda Strait & Banten Sector',
    points: [
      { name: 'PATROL-1 (Ujung Kulon)', lat: -6.75, lng: 105.35 },
      { name: 'PATROL-2 (Krakatau Outer)', lat: -6.10, lng: 105.42 },
      { name: 'PATROL-3 (Merak Crossing)', lat: -5.90, lng: 105.95 }
    ]
  },
  {
    nameId: 'Sektor ZEE Laut Natuna Utara',
    nameEn: 'North Natuna Sea EEZ Sector',
    points: [
      { name: 'PATROL-1 (Ranai Outer)', lat: 4.25, lng: 108.40 },
      { name: 'PATROL-2 (ZEE Border Line)', lat: 5.60, lng: 109.20 },
      { name: 'PATROL-3 (Terumbu Karang)', lat: 4.80, lng: 107.50 }
    ]
  },
  {
    nameId: 'Sektor Selat Malaka',
    nameEn: 'Malacca Strait Sector',
    points: [
      { name: 'PATROL-1 (Rupat Island)', lat: 2.10, lng: 101.60 },
      { name: 'PATROL-2 (Bengkalis)', lat: 1.50, lng: 102.30 },
      { name: 'PATROL-3 (Karimun Outer)', lat: 1.15, lng: 103.40 }
    ]
  },
  {
    nameId: 'Sektor Blok Ambalat (Kaltara)',
    nameEn: 'Ambalat Block Sector (North Borneo)',
    points: [
      { name: 'PATROL-1 (Tarakan North)', lat: 3.50, lng: 117.80 },
      { name: 'PATROL-2 (Ambalat EEZ Ridge)', lat: 4.10, lng: 118.50 },
      { name: 'PATROL-3 (Nunukan Border)', lat: 4.20, lng: 117.65 }
    ]
  }
];

export const FlightTab: React.FC<FlightTabProps> = ({
  language,
  crew,
  setCrew,
  missionType,
  setMissionType,
  vvipTargetAircraft,
  setVvipTargetAircraft,
  vvipStartPoint,
  setVvipStartPoint,
  vvipStartSearch,
  setVvipStartSearch,
  vvipEndPoint,
  setVvipEndPoint,
  vvipEndSearch,
  setVvipEndSearch,
  rendezvousLat,
  setRendezvousLat,
  rendezvousLng,
  setRendezvousLng,
  rendezvousPoint,
  setRendezvousPoint,
  waypoints,
  setWaypoints,
  selectedAircraft,
  setSelectedAircraft,
  departureAirport,
  setDepartureAirport,
  departureSearch,
  setDepartureSearch,
  arrivalAirport,
  setArrivalAirport,
  arrivalSearch,
  setArrivalSearch,
  payload,
  setPayload,
  useSubTank,
  setUseSubTank,
  combatMode,
  setCombatMode,
  initialFuel,
  calculateFuelPlan,
  playerProfile,
  targetAltitude,
  setTargetAltitude,
  targetSpeed,
  setTargetSpeed,
  onStartMission,
  isTracking = false,
  onRTB,
  isRTB,
  deleteCurrentRoute,
  onOpenRefuelOptions,
  reconState,
  selectedRecon,
  onSelectRecon,
  reconDeparture,
  onSelectReconDeparture,
  reconArrival,
  onSelectReconArrival,
  reconSurveyPoints = [],
  onSetReconSurveyPoints,
  onStartReconFlight,
  isReconAirborne = false,
  targetLatInput = '',
  onSetTargetLatInput,
  targetLngInput = '',
  onSetTargetLngInput,
  selectedWeaponId = '',
  onSelectWeapon,
  strikeLandingBase,
  onSelectStrikeLandingBase,
  onScrambleStrike,
  onEngageTarget,
  isPlayerAirborne = false,
  isTargetLocked = false,
  isStrikeCompleted = false,
  simulationSpeed = 1,
  onSetSimulationSpeed,
  isManualWaypointMode = false,
  setIsManualWaypointMode,
  isPickingVvipRV = false,
  setIsPickingVvipRV,
  isPickingReconSurvey = false,
  setIsPickingReconSurvey,
  plannerWaypoints = [],
  setPlannerWaypoints,
  activeMissions = [],
  selectedMissionId = null,
  onSelectMission,
  onAbortMission,
  onRTBMission,
  maxConcurrentMissions = 1,
  fleetCount = 1,
  crewCapacity = 1,
  onAddNewMissionPlan
}) => {
  const [patrolLat, setPatrolLat] = useState('');
  const [patrolLng, setPatrolLng] = useState('');
  const [patrolName, setPatrolName] = useState('');
  const [showPatrolForm, setShowPatrolForm] = useState(false);

  const weightBreakdown = useMemo(() => {
    return calculateAircraftWeights(selectedAircraft, crew, payload, useSubTank, combatMode);
  }, [selectedAircraft, crew, payload, useSubTank, combatMode]);

  const currentSelectedMission = useMemo(() => {
    if (!selectedMissionId) return null;
    return activeMissions.find(m => m.id === selectedMissionId) || null;
  }, [activeMissions, selectedMissionId]);

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="p-4 space-y-6">
      {/* MULTI-MISSION COMMAND CENTER & SWITCHER */}
      {activeMissions.length > 0 && (
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {language === 'id' ? 'Pusat Kendali Multi-Misi' : 'Multi-Mission Command'}
                </h3>
                <p className="text-[9px] font-mono text-slate-400">
                  {language === 'id' 
                    ? `Armada: ${fleetCount} Pesawat • Kru: ${crewCapacity} Personel`
                    : `Fleet: ${fleetCount} Ready • Crew: ${crewCapacity} Available`}
                </p>
              </div>
            </div>

            {/* Capacity Badge */}
            <div className="text-right">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black font-mono uppercase border",
                activeMissions.length >= maxConcurrentMissions
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  activeMissions.length >= maxConcurrentMissions ? "bg-amber-400" : "bg-emerald-400"
                )} />
                {activeMissions.length} / {maxConcurrentMissions} {language === 'id' ? 'Misi Aktif' : 'Active'}
              </span>
            </div>
          </div>

          {/* Mission Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {activeMissions.map((m) => {
              const isSelected = m.id === selectedMissionId;
              const mColor = m.color || '#38bdf8';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMission?.(m.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold font-mono transition-all shrink-0 border",
                    isSelected
                      ? "bg-sky-950/80 text-white border-sky-400 shadow-lg shadow-sky-500/20 ring-1 ring-sky-400"
                      : "bg-slate-950/50 text-slate-300 hover:text-white border-white/10 hover:border-white/20"
                  )}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: mColor, boxShadow: `0 0 8px ${mColor}` }} 
                  />
                  <span>Misi Running {m.missionNumber}</span>
                  <span className="text-[8.5px] opacity-60">({m.callSign})</span>
                </button>
              );
            })}

            {/* Add New Mission Button (if capacity permits) */}
            {activeMissions.length < maxConcurrentMissions ? (
              <button
                type="button"
                onClick={() => {
                  if (onAddNewMissionPlan) {
                    onAddNewMissionPlan();
                  } else {
                    onSelectMission?.(null);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold font-mono transition-all shrink-0 border border-dashed",
                  selectedMissionId === null
                    ? "bg-emerald-950/70 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400"
                    : "bg-slate-950/30 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40"
                )}
              >
                <Plus className="w-3 h-3" />
                <span>{language === 'id' ? '+ Tambah Misi Baru' : '+ New Mission'}</span>
              </button>
            ) : (
              <div className="px-2.5 py-1.5 text-[8.5px] font-mono text-slate-500 italic shrink-0">
                {language === 'id' ? '(Kapasitas Penuh)' : '(Capacity Max)'}
              </div>
            )}
          </div>

          {/* ACTIVE MISSION DETAIL VIEW */}
          {currentSelectedMission && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950/90 border border-white/10 rounded-xl p-3.5 space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: currentSelectedMission.color || '#38bdf8' }} 
                  />
                  <div>
                    <h4 className="text-[11px] font-black text-white font-mono uppercase">
                      Misi Running {currentSelectedMission.missionNumber} ({currentSelectedMission.callSign})
                    </h4>
                    <p className="text-[8.5px] font-mono text-sky-400 uppercase">
                      {currentSelectedMission.missionType} • {currentSelectedMission.selectedAircraft?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase",
                    currentSelectedMission.isRTB 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : currentSelectedMission.combatMode
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  )}>
                    {currentSelectedMission.isRTB 
                      ? 'RTB KE BASE' 
                      : currentSelectedMission.combatMode 
                      ? 'COMBAT MODE' 
                      : 'AIRBORNE'}
                  </span>
                </div>
              </div>

              {/* Telemetry Display Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[7.5px] font-mono text-slate-400 uppercase block">Ketinggian (Alt)</span>
                  <span className="text-xs font-black font-mono text-white">
                    FL{Math.round(currentSelectedMission.currentAltitude / 100).toString().padStart(3, '0')}
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[7.5px] font-mono text-slate-400 uppercase block">Kecepatan (IAS)</span>
                  <span className="text-xs font-black font-mono text-sky-400">
                    {Math.round(currentSelectedMission.speed || 0)} KTS
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[7.5px] font-mono text-slate-400 uppercase block">Heading (Arah)</span>
                  <span className="text-xs font-black font-mono text-amber-300">
                    {Math.round(currentSelectedMission.heading || 0)}°
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-[7.5px] font-mono text-slate-400 uppercase block">Sisa Bahan Bakar</span>
                  <span className="text-xs font-black font-mono text-emerald-400">
                    {Math.round(currentSelectedMission.fuelRemaining).toLocaleString()} LBS
                  </span>
                </div>
              </div>

              {/* Route & Waypoint Status */}
              <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 uppercase">
                  <span>Rencana Rute & Waypoint</span>
                  <span className="text-white font-bold">
                    {currentSelectedMission.waypoints.filter(w => w.reached).length} / {currentSelectedMission.waypoints.length} Dicapai
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-300">
                  <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">
                    {currentSelectedMission.departureAirport?.name || 'Home Base'}
                  </span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  <span className="truncate text-white font-bold">
                    {currentSelectedMission.arrivalAirport?.name || 'Destinasi Misi'}
                  </span>
                </div>
              </div>

              {/* Mission Controls: RTB / Abort */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onRTBMission?.(currentSelectedMission.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[9px] font-black font-mono uppercase tracking-wider transition-all border",
                    currentSelectedMission.isRTB
                      ? "bg-amber-600/30 text-amber-300 border-amber-500/50 cursor-default"
                      : "bg-amber-600 hover:bg-amber-500 text-white border-amber-400/50 shadow-md shadow-amber-900/30"
                  )}
                  disabled={currentSelectedMission.isRTB}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{currentSelectedMission.isRTB ? 'RTB Sedang Berjalan' : 'RTB Misi Ini'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAbortMission?.(currentSelectedMission.id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[9px] font-black font-mono uppercase tracking-wider transition-all bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{language === 'id' ? 'Batalkan Misi' : 'Abort Mission'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* If In New Mission Planning Mode */}
          {selectedMissionId === null && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/70 to-slate-900/90 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 shrink-0">
                  <Play className="w-4 h-4 fill-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-300 uppercase font-mono">
                    {language === 'id' 
                      ? `Menyusun & Siap Luncurkan Misi Running ${activeMissions.length + 1}` 
                      : `Planning & Ready to Launch Mission Running ${activeMissions.length + 1}`}
                  </p>
                  <p className="text-[8px] text-emerald-200/70 font-mono">
                    {language === 'id' 
                      ? 'Lengkapi rute & konfigurasi di bawah, lalu klik Luncurkan Misi.' 
                      : 'Configure route & aircraft below, then click Launch Mission.'}
                  </p>
                </div>
              </div>

              {onStartMission && (
                <button
                  type="button"
                  onClick={onStartMission}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black font-mono text-[10px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-95 border border-emerald-400 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>
                    {language === 'id' 
                      ? `LUNCURKAN MISI ${activeMissions.length + 1}` 
                      : `LAUNCH MISSION ${activeMissions.length + 1}`}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mission Type Selection Header */}
      <div className="space-y-2 bg-[#0d1422] p-3.5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'id' ? 'Tipe Misi Utama' : 'Primary Mission Type'}</span>
          </label>
          {missionType && (
            <button
              type="button"
              onClick={() => setMissionType('')}
              className="text-[8px] font-mono text-blue-400/80 hover:text-blue-300 flex items-center gap-1 transition-colors"
              title={language === 'id' ? 'Kembali ke direktori misi' : 'Reset to mission directory'}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{language === 'id' ? 'Ganti Misi' : 'Change Mission'}</span>
            </button>
          )}
        </div>
        <select 
          value={missionType}
          onChange={(e) => setMissionType(e.target.value)}
          className={cn(
            "w-full bg-black/50 border rounded-lg px-3 py-2.5 text-xs font-bold transition-all focus:outline-none",
            missionType ? "border-blue-500/40 text-white" : "border-amber-500/60 text-amber-300 bg-amber-950/20"
          )}
        >
          <option value="">
            {language === 'id' ? '-- PILIH TIPE MISI OPERASIONAL --' : '-- SELECT OPERATIONAL MISSION TYPE --'}
          </option>
          <option value="General">{language === 'id' ? 'Umum (General Flight Planner)' : 'General Flight Planner'}</option>
          <option value="Patrol">{language === 'id' ? 'Patroli Udara (Air Patrol Scramble)' : 'Air Patrol Operation'}</option>
          <option value="VVIPEscort">{language === 'id' ? 'Escort Pesawat VVIP (Kepresidenan)' : 'VVIP Aircraft Escort'}</option>
          <option value="Combat">{language === 'id' ? 'Tempur (Combat Air Patrol)' : 'Combat Air Patrol'}</option>
          <option value="Transport">{language === 'id' ? 'Angkut Taktis (Tactical Transport)' : 'Tactical Transport'}</option>
          <option value="Recon">{language === 'id' ? 'Pengintaian (Reconnaissance)' : 'Reconnaissance'}</option>
          <option value="Refueling">{language === 'id' ? 'Air to Air Refueling (AAR)' : 'Air to Air Refueling'}</option>
          <option value="Training">{language === 'id' ? 'Latihan Tempur (Combat Training)' : 'Combat Training'}</option>
          <option value="Ferry">{language === 'id' ? 'Ferry Flight' : 'Ferry Flight'}</option>
        </select>
      </div>

      {/* When NO mission is selected yet, render the Mission Directory Hub */}
      {!missionType && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <span>{language === 'id' ? 'DIREKTORI OPERASI PENERBANGAN' : 'FLIGHT OPERATIONS DIRECTORY'}</span>
                </h3>
                <p className="text-[10px] text-white/70 leading-relaxed">
                  {language === 'id'
                    ? 'Pilihan misi saat ini belum ditentukan. Silakan pilih salah satu kategori operasi pertahanan udara di bawah ini untuk memulai konfigurasi penerbangan.'
                    : 'No mission is currently selected. Please choose a tactical air defense category below to begin configuring your flight.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
              {language === 'id' ? 'Kategori Misi Tersedia' : 'Available Mission Categories'}
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {MISSION_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMissionType(opt.id)}
                    className="p-3 bg-black/40 hover:bg-blue-600/15 border border-white/10 hover:border-blue-500/50 rounded-xl flex items-start gap-3 text-left transition-all group active:scale-[0.99]"
                  >
                    <div className="p-2.5 bg-white/5 group-hover:bg-blue-500/20 rounded-lg text-blue-400 shrink-0 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {language === 'id' ? opt.titleId : opt.titleEn}
                        </span>
                        <span className={cn("text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0", opt.badgeColor)}>
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[9px] text-white/50 leading-relaxed line-clamp-2">
                        {language === 'id' ? opt.descId : opt.descEn}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 shrink-0 self-center" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* When mission is GENERAL, render the complete FLIGHT PLANNER */}
      {missionType === 'General' && (
        <GeneralFlightPlanner
          language={language}
          selectedAircraft={selectedAircraft}
          setSelectedAircraft={setSelectedAircraft || (() => {})}
          departureAirport={departureAirport}
          setDepartureAirport={setDepartureAirport}
          arrivalAirport={arrivalAirport}
          setArrivalAirport={setArrivalAirport}
          waypoints={waypoints}
          setWaypoints={setWaypoints}
          initialFuel={initialFuel}
          calculateFuelPlan={calculateFuelPlan}
          playerProfile={playerProfile}
          targetAltitude={targetAltitude}
          setTargetAltitude={setTargetAltitude}
          targetSpeed={targetSpeed}
          setTargetSpeed={setTargetSpeed}
          onStartMission={onStartMission || (() => {})}
          isTracking={selectedMissionId !== null && isTracking}
          onRTB={onRTB}
          isRTB={isRTB}
          deleteCurrentRoute={deleteCurrentRoute}
          plannerWaypoints={plannerWaypoints}
          setPlannerWaypoints={setPlannerWaypoints}
          isManualWaypointMode={isManualWaypointMode}
          setIsManualWaypointMode={setIsManualWaypointMode}
        />
      )}

      {/* When mission is NOT General, NOT Recon, and NOT empty, render specialized config, crew & payload */}
      {missionType && missionType !== 'General' && missionType !== 'Recon' && missionType !== 'Reconnaissance' && (
        <>
          {/* Crew Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'id' ? 'Data Awak Pesawat' : 'Crew Data'}</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Pilot Utama' : 'Commanding Pilot'}</label>
                <input 
                  type="text" 
                  value={crew.pilot}
                  onChange={(e) => setCrew({...crew, pilot: e.target.value})}
                  placeholder="CAPT. ADHIATMA"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Kopilot' : 'Co-Pilot'}</label>
                <input 
                  type="text" 
                  value={crew.coPilot}
                  onChange={(e) => setCrew({...crew, coPilot: e.target.value})}
                  placeholder="F/O. DOE"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Tanda Panggil' : 'Call Sign'}</label>
                <input 
                  type="text" 
                  value={crew.callSign}
                  onChange={(e) => setCrew({...crew, callSign: e.target.value})}
                  placeholder="AF-101"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Jumlah Kru' : 'Crew Count'}</label>
                  <input 
                    type="number" 
                    value={crew.crewCount}
                    onChange={(e) => setCrew({...crew, crewCount: parseInt(e.target.value) || 0})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Kabin' : 'Cabin'}</label>
                  <input 
                    type="number" 
                    value={crew.cabinCount}
                    onChange={(e) => setCrew({...crew, cabinCount: parseInt(e.target.value) || 0})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mission Specific Operation and Dynamic Configuration */}
      {missionType && missionType !== 'General' && (
        <>
          {/* Mission & Payload Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'id' ? 'Muatan & Operasi' : 'Payload & Operation'}</h3>
            <div className="space-y-3">
              {missionType === 'Patrol' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{language === 'id' ? 'MISI PATROLI UDARA' : 'AIR PATROL MISSION'}</h4>
                    </div>
                    <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-bold">
                      {departureAirport?.icao || 'WIHH'}
                    </span>
                  </div>

                  <p className="text-[8.5px] text-white/60 leading-relaxed">
                    {language === 'id' 
                      ? 'Tentukan sektor patroli menggunakan tombol mode klik peta di bawah, pilih preset sektor taktis TNI-AU, atau masukkan koordinat manual.' 
                      : 'Define patrol route using map-click toggle below, select tactical TNI-AU presets, or enter manual coordinates.'}
                  </p>

                  {/* Quick Map-Click Mode Toggle Button for Patrol */}
                  {setIsManualWaypointMode && (
                    <button
                      type="button"
                      onClick={() => setIsManualWaypointMode(!isManualWaypointMode)}
                      className={cn(
                        "w-full py-2.5 px-3 rounded-xl border text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md",
                        isManualWaypointMode
                          ? "bg-emerald-500 text-black border-emerald-300 ring-2 ring-emerald-400/50 animate-pulse font-mono"
                          : "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50"
                      )}
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>
                        {isManualWaypointMode
                          ? (language === 'id' ? '📍 MODE KLIK PETA AKTIF (KLIK PETA UNTUK WAYPOINT)' : '📍 MAP CLICK MODE ACTIVE (CLICK MAP TO ADD)')
                          : (language === 'id' ? '📍 Mode Tempatkan Waypoint di Peta (Klik Peta)' : '📍 Place Waypoints on Map (Map Click Mode)')}
                      </span>
                    </button>
                  )}

                  {/* Preset Patrol Sectors */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/50 block">
                      {language === 'id' ? 'Rute Preset Patroli Taktis:' : 'Tactical Patrol Sector Presets:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {PATROL_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const dep = departureAirport || {
                              icao: 'WIHH',
                              name: 'Halim Perdanakusuma AFB (Jakarta)',
                              lat: -6.2667,
                              lng: 106.8833,
                              country: 'Indonesia'
                            };

                            const wps: Waypoint[] = [
                              {
                                id: 'dep-' + dep.icao,
                                name: dep.icao + ' - ' + dep.name,
                                lat: dep.lat,
                                lng: dep.lng,
                                reached: false,
                                type: 'airport',
                                planAltitude: 0,
                                planSpeed: 0
                              },
                              ...preset.points.map((p, pIdx) => ({
                                id: 'patrol-preset-' + pIdx + '-' + Date.now(),
                                name: p.name,
                                lat: p.lat,
                                lng: p.lng,
                                reached: false,
                                type: 'waypoint' as const,
                                planAltitude: targetAltitude || 25000,
                                planSpeed: selectedAircraft.cruiseSpeed
                              })),
                              {
                                id: 'arr-' + dep.icao,
                                name: dep.icao + ' - ' + dep.name,
                                lat: dep.lat,
                                lng: dep.lng,
                                reached: false,
                                type: 'airport',
                                planAltitude: 0,
                                planSpeed: 0
                              }
                            ];

                            const planned = calculateFuelPlan(wps, initialFuel, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
                            setWaypoints(planned);
                          }}
                          className="p-2 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-xl text-left transition-all group"
                        >
                          <div className="text-[9px] font-black text-emerald-300 group-hover:text-emerald-200 truncate">
                            {language === 'id' ? preset.nameId : preset.nameEn}
                          </div>
                          <div className="text-[7.5px] text-white/40 font-mono mt-0.5">
                            {preset.points.length} Sektor Waypoint
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Coordinates Input Option */}
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/50">
                        {language === 'id' ? 'Input Koordinat Patroli Manual:' : 'Manual Patrol Coordinate Input:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPatrolForm(!showPatrolForm)}
                        className="text-[8px] font-mono text-emerald-400 hover:underline"
                      >
                        {showPatrolForm ? (language === 'id' ? 'Tutup Form' : 'Close') : (language === 'id' ? '+ Buka Form Input' : '+ Open Input')}
                      </button>
                    </div>

                    {showPatrolForm && (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Nama Sektor"
                            value={patrolName}
                            onChange={(e) => setPatrolName(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-[9.5px] text-white font-mono focus:outline-none focus:border-emerald-400"
                          />
                          <input
                            type="text"
                            placeholder="Lat (-6.25)"
                            value={patrolLat}
                            onChange={(e) => setPatrolLat(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-[9.5px] text-white font-mono focus:outline-none focus:border-emerald-400"
                          />
                          <input
                            type="text"
                            placeholder="Lng (106.85)"
                            value={patrolLng}
                            onChange={(e) => setPatrolLng(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-[9.5px] text-white font-mono focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const lat = parseFloat(patrolLat);
                            const lng = parseFloat(patrolLng);
                            if (isNaN(lat) || isNaN(lng)) return;

                            const customWp: Waypoint = {
                              id: 'patrol-custom-' + Date.now(),
                              name: patrolName.trim() || `PATROL-WP-0${waypoints.filter(w => !w.id.startsWith('dep-') && !w.id.startsWith('arr-')).length + 1}`,
                              lat: Number(lat.toFixed(4)),
                              lng: Number(lng.toFixed(4)),
                              reached: false,
                              type: 'waypoint',
                              planAltitude: targetAltitude || 25000,
                              planSpeed: selectedAircraft.cruiseSpeed
                            };

                            setWaypoints(prev => {
                              const dep = prev.find(w => w.id.startsWith('dep-')) || (departureAirport ? {
                                id: 'dep-' + departureAirport.icao,
                                name: departureAirport.icao + ' - ' + departureAirport.name,
                                lat: departureAirport.lat,
                                lng: departureAirport.lng,
                                reached: false,
                                type: 'airport' as const,
                                planAltitude: 0,
                                planSpeed: 0
                              } : null);

                              const midPoints = prev.filter(w => !w.id.startsWith('dep-') && !w.id.startsWith('arr-'));
                              const arr = prev.find(w => w.id.startsWith('arr-')) || (departureAirport ? {
                                id: 'arr-' + departureAirport.icao,
                                name: departureAirport.icao + ' - ' + departureAirport.name,
                                lat: departureAirport.lat,
                                lng: departureAirport.lng,
                                reached: false,
                                type: 'airport' as const,
                                planAltitude: 0,
                                planSpeed: 0
                              } : null);

                              const combined = [
                                ...(dep ? [dep] : []),
                                ...midPoints,
                                customWp,
                                ...(arr ? [arr] : [])
                              ];

                              return calculateFuelPlan(combined, initialFuel, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
                            });

                            setPatrolLat('');
                            setPatrolLng('');
                            setPatrolName('');
                          }}
                          className="w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 rounded-lg text-[9px] font-black uppercase text-emerald-200 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'id' ? 'Tambahkan Waypoint Patroli' : 'Add Patrol Waypoint'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Active Patrol Waypoints List */}
                  {waypoints.filter(w => !w.id.startsWith('dep-') && !w.id.startsWith('arr-')).length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[8.5px] font-mono text-white/40 uppercase">
                        <span>{language === 'id' ? 'Waypoint Rute Patroli Aktif' : 'Active Patrol Waypoints'}</span>
                        <span>{waypoints.filter(w => !w.id.startsWith('dep-') && !w.id.startsWith('arr-')).length} Poin</span>
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {waypoints.filter(w => !w.id.startsWith('dep-') && !w.id.startsWith('arr-')).map((wp, idx) => (
                          <div key={wp.id} className="flex items-center justify-between p-2 bg-white/5 border border-white/5 rounded-lg text-[9px] font-mono">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[8px]">
                                {idx + 1}
                              </span>
                              <span className="text-white font-bold truncate">{wp.name}</span>
                              <span className="text-white/40 text-[7.5px]">{wp.lat.toFixed(3)}, {wp.lng.toFixed(3)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setWaypoints(prev => {
                                  const filtered = prev.filter(item => item.id !== wp.id);
                                  return calculateFuelPlan(filtered, initialFuel, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
                                });
                              }}
                              className="p-1 text-white/30 hover:text-red-400 transition-colors"
                              title="Hapus Waypoint"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {missionType === 'VVIPEscort' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-6 pt-2 pb-4"
                >
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-3 bg-blue-500 rounded-full" />
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{language === 'id' ? 'DATA PESAWAT VVIP' : 'VVIP AIRCRAFT DATA'}</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{language === 'id' ? 'Pesawat VVIP' : 'VVIP Aircraft'}</label>
                      <select 
                        value={vvipTargetAircraft.id}
                        onChange={(e) => {
                          const ac = AIRCRAFT_PRESETS.find(a => a.id === e.target.value);
                          if (ac) setVvipTargetAircraft(ac);
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                      >
                        {AIRCRAFT_PRESETS.filter(a => ['indonesia-one', 'air-force-one', 'japan-vip', 'germany-vip', 'france-vip'].includes(a.id)).map(ac => (
                          <option key={ac.id} value={ac.id}>{ac.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <AirportSelector 
                        label={language === 'id' ? 'Titik Berangkat VVIP' : 'VVIP Start Point'}
                        value={vvipStartPoint}
                        search={vvipStartSearch}
                        onSearchChange={setVvipStartSearch}
                        onSelect={(ap) => {
                          setVvipStartPoint(ap);
                          setVvipStartSearch('');
                        }}
                        language={language}
                      />
                      <AirportSelector 
                        label={language === 'id' ? 'Titik Tujuan VVIP' : 'VVIP Destination'}
                        value={vvipEndPoint}
                        search={vvipEndSearch}
                        onSearchChange={setVvipEndSearch}
                        onSelect={(ap) => {
                          setVvipEndPoint(ap);
                          setVvipEndSearch('');
                        }}
                        language={language}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{language === 'id' ? 'Titik Rendezvous (Pertemuan)' : 'Rendezvous Point'}</label>
                      
                      {/* Interactive Map Click Mode Toggle for VVIP RV */}
                      {setIsPickingVvipRV && (
                        <button
                          type="button"
                          onClick={() => setIsPickingVvipRV(!isPickingVvipRV)}
                          className={cn(
                            "w-full py-2.5 px-3 rounded-xl border text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md",
                            isPickingVvipRV
                              ? "bg-amber-500 text-black border-amber-300 ring-2 ring-amber-400/50 animate-pulse font-mono"
                              : "bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/50"
                          )}
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>
                            {isPickingVvipRV
                              ? (language === 'id' ? '📍 MODE PILIH TITIK RV AKTIF (KLIK PETA)' : '📍 PICK RV MODE ACTIVE (CLICK MAP)')
                              : (language === 'id' ? '📍 Mode Pilih Titik RV di Peta (Klik Peta)' : '📍 Pick RV Point on Map (Map Click Mode)')}
                          </span>
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/20 uppercase">{language === 'id' ? 'Latitude' : 'Latitude'}</label>
                          <input 
                            type="text" 
                            value={rendezvousLat}
                            onChange={(e) => setRendezvousLat(e.target.value)}
                            placeholder="-6.1234"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/20 uppercase">{language === 'id' ? 'Longitude' : 'Longitude'}</label>
                          <input 
                            type="text" 
                            value={rendezvousLng}
                            onChange={(e) => setRendezvousLng(e.target.value)}
                            placeholder="106.1234"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            const lat = parseFloat(rendezvousLat);
                            const lng = parseFloat(rendezvousLng);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              setRendezvousPoint({
                                id: 'manual-rv-' + Date.now(),
                                name: language === 'id' ? 'Titik RV Manual' : 'Manual RV Point',
                                lat,
                                lng,
                                reached: false,
                                type: 'waypoint',
                                planAltitude: 30000,
                                planSpeed: selectedAircraft.cruiseSpeed
                              });
                            }
                          }}
                          className="flex-1 py-2 bg-amber-600/30 border border-amber-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600/50 transition-all text-amber-200"
                        >
                          {language === 'id' ? 'Set Koordinat Manual' : 'Set Manual Coordinates'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                              if (waypoints.length > 0) {
                                  const lastWp = [...waypoints].reverse().find(w => !w.id.startsWith('arr-'));
                                  if (lastWp) {
                                    setRendezvousPoint(lastWp);
                                    setRendezvousLat(lastWp.lat.toFixed(4));
                                    setRendezvousLng(lastWp.lng.toFixed(4));
                                  }
                              }
                          }}
                          title={language === 'id' ? 'Gunakan Waypoint Terakhir' : 'Use Last Waypoint'}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:bg-white/10 transition-all"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                      </div>

                      {rendezvousPoint && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-green-400 uppercase">{rendezvousPoint.name}</p>
                            <p className="text-[8px] text-white/40 font-mono">{rendezvousPoint.lat.toFixed(4)}, {rendezvousPoint.lng.toFixed(4)}</p>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      
                      <p className="text-[8px] text-amber-400/50 italic font-medium px-1">
                        {language === 'id' 
                          ? '*Pilot harus menemui pesawat VVIP di titik ini sebelum pengawalan aktif.' 
                          : '*Pilot must intercept VVIP aircraft at this rendezvous point.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-3 bg-white/40 rounded-full" />
                      <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">{language === 'id' ? 'DATA PENGAWAL (PEMAIN)' : 'ESCORT DATA (PLAYER)'}</h4>
                    </div>

                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1.5 text-[8.5px] leading-relaxed text-blue-200/90 font-mono">
                      <p className="font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-blue-400" />
                        {language === 'id' ? 'SOP MISI PENGAWALAN VVIP:' : 'VVIP ESCORT MISSION SOP:'}
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-white/70">
                        <li>{language === 'id' ? 'Pesawat Pemain & VVIP terbang menuju titik Rendezvous (RV).' : 'Player & VVIP fly towards Rendezvous Point (RV).'}</li>
                        <li>{language === 'id' ? 'Jika salah satu tiba duluan di RV, pesawat akan melakukan holding orbit hingga bertemu.' : 'If either arrives early at RV, that aircraft holds orbit until meeting.'}</li>
                        <li>{language === 'id' ? 'Setelah bertemu di RV, terbang beriringan (ESCORT ACTIVE) menuju Destinasi VVIP.' : 'Once rendezvoused at RV, fly in formation towards VVIP Destination.'}</li>
                        <li>{language === 'id' ? 'Jika Kedatangan = Destinasi VVIP, mendarat bersama & misi selesai.' : 'If Arrival = VVIP Destination, land together & complete mission.'}</li>
                        <li>{language === 'id' ? 'Jika Kedatangan berbeda, setelah VVIP mendarat, Pemain lanjut ke bandara Kedatangan pilihan.' : 'If Arrival differs, after VVIP lands, Player continues to chosen Arrival base.'}</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <AirportSelector 
                        label={language === 'id' ? 'Keberangkatan' : 'Departure'}
                        value={departureAirport}
                        search={departureSearch}
                        onSearchChange={setDepartureSearch}
                        onSelect={(ap) => {
                          setDepartureAirport(ap);
                          setDepartureSearch('');
                          setWaypoints(prev => {
                            const newWp: Waypoint = {
                              id: 'dep-' + ap.icao,
                              name: `${ap.icao} - ${ap.name}`,
                              lat: ap.lat,
                              lng: ap.lng,
                              reached: false,
                              type: 'airport',
                              planAltitude: 0,
                              planSpeed: 0
                            };
                            const filtered = prev.filter(wp => !wp.id.startsWith('dep-'));
                            return calculateFuelPlan([newWp, ...filtered], initialFuel, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
                          });
                        }}
                        language={language}
                      />
                      <AirportSelector 
                        label={language === 'id' ? 'Kedatangan' : 'Arrival'}
                        value={arrivalAirport}
                        search={arrivalSearch}
                        onSearchChange={setArrivalSearch}
                        onSelect={(ap) => {
                          setArrivalAirport(ap);
                          setArrivalSearch('');
                          setWaypoints(prev => {
                            const newWp: Waypoint = {
                              id: 'arr-' + ap.icao,
                              name: `${ap.icao} - ${ap.name}`,
                              lat: ap.lat,
                              lng: ap.lng,
                              reached: false,
                              type: 'airport',
                              planAltitude: 0,
                              planSpeed: 0
                            };
                            const filtered = prev.filter(wp => !wp.id.startsWith('arr-'));
                            return calculateFuelPlan([...filtered, newWp], initialFuel, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
                          });
                        }}
                        language={language}
                      />
                    </div>

                    {/* VVIP Escort Fuel Range Analysis & Refuel Options */}
                    {(() => {
                      const dep = departureAirport || vvipStartPoint;
                      const arr = arrivalAirport || vvipEndPoint;
                      const rv = rendezvousPoint;
                      if (!dep || !arr || !rv) return null;

                      const distToRV = Math.round(getDistance(dep.lat, dep.lng, rv.lat, rv.lng));
                      const distRVToArr = Math.round(getDistance(rv.lat, rv.lng, arr.lat, arr.lng));
                      const totalDist = distToRV + distRVToArr;
                      const defaultMaxRange = Math.round(selectedAircraft.maxFuel / (selectedAircraft.burnRate || 3.8));
                      const extendedMaxRange = Math.round(defaultMaxRange * 1.3);
                      const isRangeExceeded = totalDist > defaultMaxRange && !useSubTank;
                      const hasTankerWp = waypoints.some(w => w.type === 'tanker');

                      return (
                        <div className={cn(
                          "p-3.5 rounded-xl border space-y-2.5 transition-all text-[9px] font-mono",
                          isRangeExceeded && !hasTankerWp
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-200"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-200"
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                              <Fuel className="w-3.5 h-3.5 text-amber-400" />
                              <span>{language === 'id' ? 'ANALISIS DAYA JANGKAU BBM' : 'FUEL RANGE ANALYSIS'}</span>
                            </div>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                              isRangeExceeded && !hasTankerWp
                                ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse"
                                : "bg-green-500/20 text-green-300 border border-green-500/30"
                            )}>
                              {isRangeExceeded && !hasTankerWp
                                ? (language === 'id' ? 'MELEBIHI TANGKI' : 'RANGE EXCEEDED')
                                : (language === 'id' ? 'KAPASITAS CUKUP' : 'RANGE IN SPEC')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[8px] bg-black/40 p-2 rounded-lg border border-white/5">
                            <div>
                              <span className="text-white/40">{language === 'id' ? 'Total Rute Escort:' : 'Total Escort Route:'}</span>
                              <p className="text-xs font-bold text-white font-mono">{totalDist} NM</p>
                              <span className="text-white/30">(Base→RV: {distToRV} NM + RV→Dest: {distRVToArr} NM)</span>
                            </div>
                            <div>
                              <span className="text-white/40">{language === 'id' ? 'Kapasitas Tangki:' : 'Tank Capacity:'}</span>
                              <p className="text-xs font-bold text-amber-300 font-mono">
                                {useSubTank ? `${extendedMaxRange} NM (+30%)` : `${defaultMaxRange} NM (Bawaan)`}
                              </p>
                              {hasTankerWp && <span className="text-cyan-300 font-bold block">+ Tanker AAR Orbit Aktif</span>}
                            </div>
                          </div>

                          {isRangeExceeded && !hasTankerWp && onOpenRefuelOptions && (
                            <div className="pt-1 flex gap-2">
                              <button
                                type="button"
                                onClick={() => setUseSubTank(true)}
                                className="flex-1 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 rounded-lg text-white font-bold uppercase text-[8px] tracking-wider transition-all"
                              >
                                + {language === 'id' ? 'Tangki Eksternal (+30%)' : 'External Tank (+30%)'}
                              </button>
                              <button
                                type="button"
                                onClick={onOpenRefuelOptions}
                                className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg text-white font-black uppercase text-[8px] tracking-wider transition-all shadow-md flex items-center justify-center gap-1"
                              >
                                <Wind className="w-3 h-3" />
                                <span>{language === 'id' ? 'Atur Titik AAR' : 'Set AAR Point'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}

              {/* RECONNAISSANCE & STRIKE MISSION CONTROLS */}
              {(missionType === 'Reconnaissance' || missionType === 'Recon') && selectedRecon && reconDeparture && reconArrival && onSelectRecon && onSelectReconDeparture && onSelectReconArrival && onSetReconSurveyPoints && onStartReconFlight && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-4 pt-2 pb-2"
                >
                  {/* Part 1: Reconnaissance Flight Planning (Aircraft, Origin/Landing base, Coordinates) */}
                  <ReconMissionPlanner
                    language={language}
                    selectedRecon={selectedRecon}
                    onSelectRecon={onSelectRecon}
                    reconDeparture={reconDeparture}
                    onSelectDeparture={onSelectReconDeparture}
                    reconArrival={reconArrival}
                    onSelectArrival={onSelectReconArrival}
                    surveyPoints={reconSurveyPoints}
                    onSetSurveyPoints={onSetReconSurveyPoints}
                    onStartReconFlight={onStartReconFlight}
                    isReconAirborne={isReconAirborne}
                    isPickingReconSurvey={isPickingReconSurvey}
                    setIsPickingReconSurvey={setIsPickingReconSurvey}
                  />

                  {/* Part 2: Tactical Recon Intel Console & Fighter Strike Scramble */}
                  {reconState && strikeLandingBase && onSelectStrikeLandingBase && onSetTargetLatInput && onSetTargetLngInput && onSelectWeapon && onScrambleStrike && onEngageTarget && (
                    <ReconIntelConsole
                      language={language}
                      reconState={reconState}
                      selectedRecon={selectedRecon}
                      playerAircraft={selectedAircraft}
                      playerCrew={crew}
                      onSetPlayerCrew={setCrew}
                      homeAirbase={departureAirport || reconDeparture}
                      strikeLandingBase={strikeLandingBase}
                      onSelectStrikeLandingBase={onSelectStrikeLandingBase}
                      targetLatInput={targetLatInput}
                      onSetTargetLatInput={onSetTargetLatInput}
                      targetLngInput={targetLngInput}
                      onSetTargetLngInput={onSetTargetLngInput}
                      selectedWeaponId={selectedWeaponId}
                      onSelectWeapon={onSelectWeapon}
                      useSubTank={useSubTank}
                      onSetUseSubTank={setUseSubTank}
                      onScrambleStrike={onScrambleStrike}
                      onEngageTarget={onEngageTarget}
                      isPlayerAirborne={isPlayerAirborne}
                      isTargetLocked={isTargetLocked}
                      isStrikeCompleted={isStrikeCompleted}
                      simulationSpeed={simulationSpeed}
                      onSetSimulationSpeed={onSetSimulationSpeed}
                    />
                  )}
                </motion.div>
              )}

              {/* PAYLOAD, CREW WEIGHT & FUEL RANGE DYNAMICS */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">
                      {language === 'id' ? 'KONFIGURASI BOBOT & DAYA JANGKAU (WEIGHT & RANGE)' : 'WEIGHT & FUEL RANGE DYNAMICS'}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase",
                    weightBreakdown.isOverweight
                      ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  )}>
                    {weightBreakdown.isOverweight
                      ? (language === 'id' ? 'OVERWEIGHT (LEWAT MTOW)' : 'OVERWEIGHT')
                      : (language === 'id' ? 'BOBOT AMAN' : 'WITHIN LIMITS')}
                  </span>
                </div>

                {/* Weight Breakdown Summary Grid */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  {/* Clean Empty Weight */}
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-white/40 block">{language === 'id' ? 'Berat Bersih (OEW Clean):' : 'Operating Empty (OEW):'}</span>
                    <span className="font-bold text-white text-xs">{weightBreakdown.emptyWeight.toLocaleString()} <span className="text-[8px] text-white/40">LBS</span></span>
                    <span className="text-[7.5px] text-white/30 block">{language === 'id' ? 'Tanpa senjata & tangki luar' : 'Clean config without weapons/tanks'}</span>
                  </div>

                  {/* Personnel / Crew Weight */}
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">{language === 'id' ? 'Bobot Kru & Kabin:' : 'Personnel Weight:'}</span>
                      <Users className="w-3 h-3 text-cyan-400" />
                    </div>
                    <span className="font-bold text-cyan-300 text-xs">+{weightBreakdown.totalPersonnelWeight.toLocaleString()} <span className="text-[8px] text-white/40">LBS</span></span>
                    <span className="text-[7.5px] text-white/30 block">
                      Pilot: 200 lbs {weightBreakdown.hasCoPilot ? '+ Co-Pilot: 200 lbs' : ''}
                    </span>
                  </div>

                  {/* Fuel Weight */}
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-white/40 block">{language === 'id' ? 'Total Bahan Bakar:' : 'Total Fuel Weight:'}</span>
                    <span className="font-bold text-amber-300 text-xs">{weightBreakdown.totalFuelWeight.toLocaleString()} <span className="text-[8px] text-white/40">LBS</span></span>
                    <span className="text-[7.5px] text-white/30 block">
                      {useSubTank ? `${weightBreakdown.internalFuelWeight.toLocaleString()} + ${weightBreakdown.externalFuelWeight.toLocaleString()} (Ext +30%)` : `${weightBreakdown.internalFuelWeight.toLocaleString()} lbs (Internal)`}
                    </span>
                  </div>

                  {/* External Hardware / Weapons / Cargo */}
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-white/40 block">{language === 'id' ? 'Tangki Eksternal / Muatan:' : 'Ext Hardware / Payload:'}</span>
                    <span className="font-bold text-purple-300 text-xs">
                      +{(weightBreakdown.externalTankHardwareWeight + weightBreakdown.weaponLoadoutWeight + weightBreakdown.customPayload).toLocaleString()} <span className="text-[8px] text-white/40">LBS</span>
                    </span>
                    <span className="text-[7.5px] text-white/30 block">
                      {useSubTank ? `Pod: +${weightBreakdown.externalTankHardwareWeight} lbs ` : ''}
                      {combatMode ? `Senjata: +${weightBreakdown.weaponLoadoutWeight} lbs` : ''}
                    </span>
                  </div>
                </div>

                {/* Total Gross TOW & MTOW Margin Bar */}
                <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-white/60">{language === 'id' ? 'Total Berat Lepas Landas (TOW):' : 'Gross Takeoff Weight (TOW):'}</span>
                    <span className={cn("font-black text-xs", weightBreakdown.isOverweight ? "text-red-400" : "text-emerald-400")}>
                      {weightBreakdown.grossTakeoffWeight.toLocaleString()} / {weightBreakdown.maxTakeoffWeight.toLocaleString()} LBS
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        weightBreakdown.isOverweight 
                          ? "bg-red-500" 
                          : (weightBreakdown.grossTakeoffWeight / weightBreakdown.maxTakeoffWeight > 0.85 ? "bg-amber-500" : "bg-emerald-500")
                      )}
                      style={{ width: `${Math.min(100, (weightBreakdown.grossTakeoffWeight / weightBreakdown.maxTakeoffWeight) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-mono text-white/40">
                    <span>{language === 'id' ? 'Sisa Margin MTOW:' : 'MTOW Margin:'} {weightBreakdown.weightMargin.toLocaleString()} LBS</span>
                    <span>{((weightBreakdown.grossTakeoffWeight / weightBreakdown.maxTakeoffWeight) * 100).toFixed(1)}% MTOW</span>
                  </div>
                </div>

                {/* Custom Payload Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] text-white/40 uppercase font-mono">
                      {language === 'id' ? 'Muatan Tambahan Kargo / Amunisi Kustom (LBS)' : 'Custom Cargo / Ordnance Payload (LBS)'}
                    </label>
                    <span className="text-[8px] font-mono text-white/40">Default: 0 LBS (Clean)</span>
                  </div>
                  <input 
                    type="number" 
                    min="0"
                    step="100"
                    value={payload}
                    onChange={(e) => setPayload(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
                    placeholder="0"
                  />
                </div>

                {/* Sub Tank Toggle */}
                <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Droplets className={cn("w-4 h-4", useSubTank ? "text-blue-400" : "text-white/20")} />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-white">{language === 'id' ? 'Tangki BBM Eksternal (Sub-Tank)' : 'External Fuel Sub-Tank'}</p>
                      <p className="text-[8px] text-white/40">
                        {language === 'id' ? '+30% Kapasitas BBM & Pod Hardware (+bobot & drag)' : '+30% Fuel capacity & hardware pod (+weight & drag)'}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setUseSubTank(!useSubTank)}
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
                
                {/* Combat Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={cn("w-4 h-4", combatMode ? "text-red-400" : "text-white/20")} />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-white">{language === 'id' ? 'Mode Operasi Tempur (Combat Loadout)' : 'Combat Operation Mode'}</p>
                      <p className="text-[8px] text-white/40">
                        {language === 'id' ? 'Persenjataan Pylon & Rudal Tempur (+2,400 LBS)' : 'Pylon weapons & missile loadout (+2,400 LBS)'}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setCombatMode(!combatMode)}
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-all",
                      combatMode ? "bg-red-600" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      combatMode ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                {/* DYNAMIC FUEL RANGE & BURN RATE DISPLAY CARD */}
                <div className="p-3.5 bg-gradient-to-br from-[#0c1a2e] to-[#0a121f] border border-cyan-500/30 rounded-xl space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <Fuel className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {language === 'id' ? 'HASIL PERHITUNGAN DAYA JANGKAU (FUEL RANGE)' : 'CALCULATED FUEL RANGE & BURN RATE'}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {selectedAircraft.cruiseSpeed} KTS CRUISE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                      <span className="text-[8px] text-white/40 uppercase block">{language === 'id' ? 'Kalkulasi Jarak Tempuh (Fuel Range):' : 'Effective Fuel Range:'}</span>
                      <p className="text-base font-black text-cyan-400">
                        {weightBreakdown.effectiveFuelRange.toLocaleString()} <span className="text-[10px] text-white/40">NM</span>
                      </p>
                      <span className="text-[7.5px] text-white/30 block">
                        {language === 'id' ? 'Standar Clean:' : 'Clean baseline:'} {weightBreakdown.baselineFuelRange.toLocaleString()} NM 
                        ({weightBreakdown.fuelRangeDifferencePercent >= 0 ? `+${weightBreakdown.fuelRangeDifferencePercent}%` : `${weightBreakdown.fuelRangeDifferencePercent}%`})
                      </span>
                    </div>

                    <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                      <span className="text-[8px] text-white/40 uppercase block">{language === 'id' ? 'Konsumsi BBM Efektif:' : 'Effective Burn Rate:'}</span>
                      <p className="text-base font-black text-amber-400">
                        {weightBreakdown.effectiveBurnRate} <span className="text-[10px] text-white/40">LBS/NM</span>
                      </p>
                      <span className="text-[7.5px] text-white/30 block">
                        {language === 'id' ? 'Base:' : 'Base:'} {weightBreakdown.baseBurnRate} LBS/NM (+{weightBreakdown.weightBurnPenaltyPercent}% bobot, +{weightBreakdown.dragBurnPenaltyPercent}% drag)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[8px] text-white/40 font-mono pt-0.5">
                    <Info className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>
                      {language === 'id'
                        ? '*Konsumsi BBM dihitung akurat dari bobot total (OEW + Pilot/Co-Pilot + BBM + Tangki Eksternal + Muatan) dan hambatan aerodinamis.'
                        : '*Fuel burn rate dynamically factors in gross weight (OEW + Pilot/Co-Pilot + Fuel + Sub-Tank + Ordnance) and aerodynamic drag.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mission Action Buttons for non-General missions */}
              <div className="pt-2 space-y-2">
                {(!isTracking || selectedMissionId === null) && onStartMission && (
                  <button
                    type="button"
                    onClick={onStartMission}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 active:scale-95 border border-blue-400"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {selectedMissionId === null && activeMissions.length > 0
                        ? (language === 'id' ? `EKSEKUSI MISI RUNNING ${activeMissions.length + 1}` : `EXECUTE MISSION RUNNING ${activeMissions.length + 1}`)
                        : (language === 'id' ? 'EKSEKUSI MISI PENERBANGAN' : 'EXECUTE FLIGHT MISSION')}
                    </span>
                  </button>
                )}

                {/* If viewing a running mission and capacity permits, show quick button to prepare next mission */}
                {selectedMissionId !== null && activeMissions.length < maxConcurrentMissions && onAddNewMissionPlan && (
                  <button
                    type="button"
                    onClick={onAddNewMissionPlan}
                    className="w-full py-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {language === 'id' 
                        ? `+ JALANKAN MISI BARU (MISI ${activeMissions.length + 1})` 
                        : `+ LAUNCH NEW MISSION (MISSION ${activeMissions.length + 1})`}
                    </span>
                  </button>
                )}

                {isTracking && selectedMissionId !== null && onRTB && (
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

                {deleteCurrentRoute && (
                  <button
                    type="button"
                    onClick={deleteCurrentRoute}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-600/20 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>{language === 'id' ? 'DELETE CURRENT ROUTE (RESET KE BASE)' : 'DELETE CURRENT ROUTE (RETURN TO BASE)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
