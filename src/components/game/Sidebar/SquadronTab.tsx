import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Plane, 
  Users, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Fuel, 
  Crosshair, 
  Radio, 
  ChevronRight, 
  Sparkles, 
  Award, 
  Gauge, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck, 
  Flame, 
  Cpu, 
  Zap, 
  Clock, 
  Compass,
  MapPin,
  Sliders,
  BatteryCharging,
  FileCheck,
  HeartPulse,
  Target,
  Wind,
  Plus,
  ArrowUpRight,
  Warehouse,
  Coins,
  ShoppingCart,
  Layers,
  ChevronDown,
  Building,
  UserPlus,
  GraduationCap,
  Sparkle
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
  Aircraft, 
  Crew, 
  PlayerProfile, 
  OwnedAircraft, 
  SquadronCrewRoster, 
  FacilityState, 
  AircraftGenerationUpgrade,
  IndividualPilot,
  IndividualCrewMember,
  TrainingCourse,
  PendingDeliveryItem,
  SquadronCommissioningPipeline
} from '../../../types';
import { SQUADRON_DATA, AIRCRAFT_PRESETS, PLAYABLE_SQUADRONS, PlayableSquadron, MILITARY_RANKS } from '../../../constants';
import { MilitaryAirport, MILITARY_AIRPORTS } from '../../../airports';
import { 
  INITIAL_SQUADRON_BUDGET, 
  HANGAR_LEVELS, 
  APRON_LEVELS, 
  AIRCRAFT_PROCUREMENT_CATALOG, 
  generateTailNumber, 
  createDefaultOwnedAircraft, 
  createDefaultCrewRoster,
  REAL_CREW_REQUIREMENTS_PER_AIRCRAFT,
  calculateSquadronCrewCapacity,
  MILITARY_TRAINING_COURSES,
  generateDefaultPilotsForSquadron,
  generateDefaultCrewMembersForSquadron,
  getRankLevel
} from '../../../data/squadronState';
import { SquadronWeaponsView } from './SquadronWeaponsView';
import { SquadronGenUpgradeView } from './SquadronGenUpgradeView';
import { SquadronListView } from './SquadronListView';
import { CrewDetailModal } from './CrewDetailModal';
import { SquadronTrainingView } from './SquadronTrainingView';
import { TacticalDeliveryHUD } from './TacticalDeliveryHUD';
import { SquadronCommissioningPipelineModal } from './SquadronCommissioningPipelineModal';

interface SquadronTabProps {
  language: 'id' | 'en';
  playerProfile: PlayerProfile | null;
  selectedAircraft: Aircraft;
  setSelectedAircraft: (ac: Aircraft) => void;
  crew: Crew;
  setCrew: (crew: Crew) => void;
  departureAirport: MilitaryAirport | null;
  setDepartureAirport?: (ap: MilitaryAirport | null) => void;
  speak?: (text: string, isATC?: boolean) => void;
  setInitialFuel?: (fuel: number) => void;
  setFuelRemaining?: (fuel: number) => void;
  setTargetSpeed?: (speed: number) => void;
  onNavigateToFlight?: () => void;
}

// Enhanced Squadron Meta Data with Mottos, Call Signs, and Badges
const SQUADRON_DETAILS: Record<string, {
  nickname: string;
  mottoId: string;
  mottoEn: string;
  callsignPrefix: string;
  established: string;
  specialtyId: string;
  specialtyEn: string;
  crestColor: string;
  accentBorder: string;
  role: string;
}> = {
  'Skadron Udara 1': {
    nickname: 'Elang',
    mottoId: 'Sayap Perkasa Penjaga Khatulistiwa',
    mottoEn: 'Mighty Wings Guarding the Equator',
    callsignPrefix: 'ELANG',
    established: '1950',
    specialtyId: 'Serang Darat Taktis & Pertahanan Udara Ringan Hawk 109/209',
    specialtyEn: 'Tactical Ground Attack & Light Air Defense Hawk 109/209',
    crestColor: 'from-amber-600 to-yellow-950',
    accentBorder: 'border-amber-500/40',
    role: 'Light fighter / attack'
  },
  'Skadron Udara 3': {
    nickname: 'The Dragon',
    mottoId: 'Swa Bhuwana Paksa - Pantang Pulang Sebelum Menang',
    mottoEn: 'Wings of the Nation - Never Return Before Victory',
    callsignPrefix: 'DRAGON',
    established: '1951',
    specialtyId: 'Intersepsi Supersonik & Pertahanan Udara Taktis',
    specialtyEn: 'Supersonic Interception & Tactical Air Defense',
    crestColor: 'from-blue-600 to-indigo-900',
    accentBorder: 'border-blue-500/40',
    role: 'Air Superiority Fighter'
  },
  'Skadron Udara 14': {
    nickname: 'The Tiger',
    mottoId: 'Harimau Mengaum di Langit Nusantara',
    mottoEn: 'Roaring Tigers Guarding the Archipelago',
    callsignPrefix: 'TIGER',
    established: '1962',
    specialtyId: 'Superioritas Udara Tempur Sergap Jarak Jauh',
    specialtyEn: 'Air Superiority & Multi-Role Strike Combat',
    crestColor: 'from-amber-600 to-red-900',
    accentBorder: 'border-amber-500/40',
    role: 'Multi-Role Fighter'
  },
  'Skadron Udara 11': {
    nickname: 'Thunder',
    mottoId: 'Kilat Perkasa Menggetarkan Angkasa',
    mottoEn: 'Mighty Thunder Shaking the Heavens',
    callsignPrefix: 'THUNDER',
    established: '1974',
    specialtyId: 'Operasi Tempur Berat Sukhoi Flanker & Intersepsi Laut',
    specialtyEn: 'Heavy Sukhoi Flanker Combat & Maritime Strike',
    crestColor: 'from-red-600 to-slate-900',
    accentBorder: 'border-red-500/40',
    role: 'Heavy Strike Fighter'
  },
  'Skadron Udara 15': {
    nickname: 'The Golden Eagle',
    mottoId: 'Satya Bhakti Praja Yudha',
    mottoEn: 'Loyalty in Defense and Flight Excellence',
    callsignPrefix: 'EAGLE',
    established: '1980',
    specialtyId: 'Fighter Lead-In & Tempur Ringan Taktis',
    specialtyEn: 'Fighter Lead-In & Light Attack Combat',
    crestColor: 'from-yellow-600 to-slate-900',
    accentBorder: 'border-yellow-500/40',
    role: 'Lead-In Fighter Trainer'
  },
  'Skadron Udara 12': {
    nickname: 'Black Panther',
    mottoId: 'Kekuatan Tersembunyi Penyergap Cepat',
    mottoEn: 'Stealth and Swift Strike Power',
    callsignPrefix: 'PANTHER',
    established: '1982',
    specialtyId: 'Operasi Pertahanan Udara Sektor Barat & Rafale Wing',
    specialtyEn: 'Western Sector Air Defense & Rafale Frontline',
    crestColor: 'from-purple-600 to-slate-900',
    accentBorder: 'border-purple-500/40',
    role: 'Frontline Strike'
  },
  'Skadron Udara 16': {
    nickname: 'Rydder',
    mottoId: 'Tombak Pengawal Batas Negeri',
    mottoEn: 'Spearhead of the Sovereign Skies',
    callsignPrefix: 'RYDDER',
    established: '1985',
    specialtyId: 'Patroli Udara Selat Malaka & Pengamanan Perbatasan',
    specialtyEn: 'Malacca Strait Air Patrol & Border Security',
    crestColor: 'from-cyan-600 to-slate-900',
    accentBorder: 'border-cyan-500/40',
    role: 'Combat Air Patrol'
  },
  'Skadron Udara 21': {
    nickname: 'Tuco',
    mottoId: 'Ketepatan Menghancurkan Ancaman Darat',
    mottoEn: 'Precision Close Air Support and Counter-Insurgency',
    callsignPrefix: 'TUCO',
    established: '2004',
    specialtyId: 'Bantuan Tembakan Udara Dekat (CAS) & Anti Gerilya',
    specialtyEn: 'Close Air Support (CAS) & COIN Operations',
    crestColor: 'from-emerald-600 to-slate-900',
    accentBorder: 'border-emerald-500/40',
    role: 'Close Air Support'
  },
  'Skadron Udara 31': {
    nickname: 'Night Prowler',
    mottoId: 'Di Mana Saja Kapan Saja Siap Mengabdi',
    mottoEn: 'Anywhere Anytime Ready to Deliver',
    callsignPrefix: 'PROWLER',
    established: '1961',
    specialtyId: 'Angkut Berat Strategis Antar Benua & Pasukan Lintas Udara',
    specialtyEn: 'Strategic Heavy Airlift & Airborne Troop Insertion',
    crestColor: 'from-blue-700 to-slate-900',
    accentBorder: 'border-blue-500/40',
    role: 'Strategic Heavy Transport'
  },
  'Skadron Udara 32': {
    nickname: 'Herky',
    mottoId: 'Pengangkut Perkasa Penembus Rintangan',
    mottoEn: 'Mighty Airlifter Penetrating All Horizons',
    callsignPrefix: 'HERKY',
    established: '1963',
    specialtyId: 'Angkut Taktis C-130 Hercules & Misi Kemanusiaan',
    specialtyEn: 'Tactical Airlift & Humanitarian Disaster Relief',
    crestColor: 'from-indigo-600 to-slate-900',
    accentBorder: 'border-indigo-500/40',
    role: 'Tactical Transport'
  },
  'Skadron Udara 2': {
    nickname: 'Kuda Terbang',
    mottoId: 'Kuda Terbang Mengarungi Samudera Langit',
    mottoEn: 'Flying Steed Conquering Oceanic Skies',
    callsignPrefix: 'KUDA',
    established: '1958',
    specialtyId: 'Angkut Sedang CN-235 & Pengintaian Taktis',
    specialtyEn: 'Medium Transport & Tactical Reconnaissance',
    crestColor: 'from-teal-600 to-slate-900',
    accentBorder: 'border-teal-500/40',
    role: 'Medium Transport'
  },
  'Skadron Udara 5': {
    nickname: 'Merpati Perkasa',
    mottoId: 'Mata Elang Pengawas Maritim ZEE',
    mottoEn: 'Eagle Eyes of Maritime EEZ Surveillance',
    callsignPrefix: 'MERPATI',
    established: '1953',
    specialtyId: 'Patroli Maritim Strategis (MPA) & Pengawasan Radar ZEE',
    specialtyEn: 'Strategic Maritime Patrol & EEZ Radar Surveillance',
    crestColor: 'from-sky-600 to-slate-900',
    accentBorder: 'border-sky-500/40',
    role: 'Maritime Patrol (MPA)'
  },
  'Skadron Udara 17': {
    nickname: 'Kencana VVIP',
    mottoId: 'Mengawal Pemimpin Bangsa dengan Kehormatan Tertinggi',
    mottoEn: 'Safeguarding National Leaders with Utmost Honor',
    callsignPrefix: 'KENCANA',
    established: '1963',
    specialtyId: 'Penerbangan VVIP Kepresidenan Indonesia One & Tamu Negara',
    specialtyEn: 'Presidential VVIP Indonesia-One & State Dignitaries Flight',
    crestColor: 'from-amber-500 to-yellow-900',
    accentBorder: 'border-amber-400/50',
    role: 'Presidential VVIP Escort'
  },
  'Skadron Udara 4': {
    nickname: 'Walet',
    mottoId: 'Kecil Lincah Berdaya Guna',
    mottoEn: 'Agile, Swift and Operationally Vital',
    callsignPrefix: 'WALET',
    established: '1976',
    specialtyId: 'Angkut Ringan Logistik C-212 & Modifikasi Cuaca (TMC)',
    specialtyEn: 'Light Utility Cargo & Weather Modification Flights',
    crestColor: 'from-emerald-700 to-slate-900',
    accentBorder: 'border-emerald-500/40',
    role: 'Light Utility'
  },
  'Skadron Udara 6': {
    nickname: 'Cobra Helo',
    mottoId: 'Penyelamat Jiwa di Medan Bahaya',
    mottoEn: 'Life Savers in Hostile Terrain',
    callsignPrefix: 'COBRA',
    established: '1978',
    specialtyId: 'Helikopter SAR Tempur & Mobilisasi Pasukan Khusus',
    specialtyEn: 'Combat SAR & Special Forces Heliborne Infiltration',
    crestColor: 'from-rose-600 to-slate-900',
    accentBorder: 'border-rose-500/40',
    role: 'Combat SAR & Rotary Transport'
  },
  'Skadron Udara 8': {
    nickname: 'Super Puma',
    mottoId: 'Kekuatan Angkat Helikopter Terpadu',
    mottoEn: 'Unified Heavy Rotary Lift Power',
    callsignPrefix: 'PUMA',
    established: '1981',
    specialtyId: 'Evakuasi Medis Udara (MEDEVAC) & SAR Maritim',
    specialtyEn: 'Aeromedical Evacuation & Maritime SAR',
    crestColor: 'from-violet-600 to-slate-900',
    accentBorder: 'border-violet-500/40',
    role: 'Heavy Rotary Transport'
  },
  'Skadron Udara 45': {
    nickname: 'VIP Airlift',
    mottoId: 'Setia Siaga Menjaga Kehormatan',
    mottoEn: 'Faithful and Alert in Duty',
    callsignPrefix: 'PATRIOT',
    established: '2011',
    specialtyId: 'Angkut Khusus Pejabat Kementerian & Panglima TNI',
    specialtyEn: 'VIP Transport for Ministry and Armed Forces Command',
    crestColor: 'from-blue-600 to-indigo-900',
    accentBorder: 'border-blue-500/40',
    role: 'VIP Transport'
  }
};

export const SquadronTab: React.FC<SquadronTabProps> = ({
  language,
  playerProfile,
  selectedAircraft,
  setSelectedAircraft,
  crew,
  setCrew,
  departureAirport,
  setDepartureAirport,
  speak,
  setInitialFuel,
  setFuelRemaining,
  setTargetSpeed,
  onNavigateToFlight
}) => {
  // Main Module Tabs (Primary requested 4 modules + operational sub-tools)
  const [activeModule, setActiveModule] = useState<
    'fleet' | 'crew_vitals' | 'condition' | 'service' | 'flight_data' | 'airworthiness' | 'fuel' | 'weapons'
  >('fleet');

  // Sub-view inside Fleet: 'my_fleet' | 'buy_aircraft'
  const [fleetSubTab, setFleetSubTab] = useState<'my_fleet' | 'buy_aircraft'>('my_fleet');

  // View Mode: 'list' (Daftar 8 Skuadron Pemain) | 'detail' (Detail Manajemen Skuadron)
  const [viewMode, setViewMode] = useState<'detail' | 'list'>('detail');

  // 0. Primary Assignment Squadron from Profile Initialization
  const initialAssignmentSquadronId = useMemo(() => {
    if (playerProfile?.squadron) {
      const matchById = PLAYABLE_SQUADRONS.find(s => s.id.toLowerCase() === playerProfile.squadron.toLowerCase());
      if (matchById) return matchById.id;
      const matchByName = PLAYABLE_SQUADRONS.find(
        s => s.name.toLowerCase().includes(playerProfile.squadron.toLowerCase()) || 
             playerProfile.squadron.toLowerCase().includes(s.name.toLowerCase())
      );
      if (matchByName) return matchByName.id;
    }
    return 'sq1';
  }, [playerProfile]);

  // Unlocked Squadron IDs List (Default has the user's initial selected squadron)
  const [unlockedSquadronIds, setUnlockedSquadronIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ais_unlocked_squadron_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes(initialAssignmentSquadronId)) {
            return [initialAssignmentSquadronId, ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {}
    return [initialAssignmentSquadronId];
  });

  // Selected Squadron ID
  const [selectedSquadronId, setSelectedSquadronId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ais_active_squadron_id');
      if (saved && PLAYABLE_SQUADRONS.some(s => s.id === saved)) return saved;
    } catch (e) {}
    return initialAssignmentSquadronId;
  });

  const currentPlayableSquadron = useMemo(() => {
    return PLAYABLE_SQUADRONS.find(s => s.id === selectedSquadronId) || PLAYABLE_SQUADRONS[1];
  }, [selectedSquadronId]);

  const currentSquadronName = currentPlayableSquadron.name;

  const squadronDesignatedAircraft = useMemo(() => {
    return AIRCRAFT_PRESETS.find(p => p.id === currentPlayableSquadron.aircraftId) || selectedAircraft;
  }, [currentPlayableSquadron, selectedAircraft]);

  const squadronData = useMemo(() => {
    return SQUADRON_DATA.find(sq => sq.name === currentSquadronName) || SQUADRON_DATA[0];
  }, [currentSquadronName]);

  const squadronMeta = useMemo(() => {
    return SQUADRON_DETAILS[currentSquadronName] || {
      nickname: currentPlayableSquadron.nickname || 'Garuda Fighter',
      mottoId: currentPlayableSquadron.mottoId || 'Swa Bhuwana Paksa',
      mottoEn: currentPlayableSquadron.mottoEn || 'Wings of the Nation',
      callsignPrefix: currentPlayableSquadron.callsignPrefix || 'GARUDA',
      established: currentPlayableSquadron.established || '1951',
      specialtyId: currentPlayableSquadron.role,
      specialtyEn: currentPlayableSquadron.role,
      crestColor: currentPlayableSquadron.badgeColor || 'from-blue-600 to-slate-900',
      accentBorder: currentPlayableSquadron.accentBorder || 'border-blue-500/40',
      role: currentPlayableSquadron.role
    };
  }, [currentSquadronName, currentPlayableSquadron]);

  // ==========================================
  // PERSISTENT SQUADRON STATE (LocalStorage)
  // ==========================================
  const storageKey = useMemo(() => `ais_sq_state_${currentPlayableSquadron.id}`, [currentPlayableSquadron.id]);

  // 1. Budget / Dana Skuadron
  const [budget, setBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_budget`);
      if (saved) return Number(saved);
    } catch (e) {}
    return INITIAL_SQUADRON_BUDGET;
  });

  // 2. Owned Aircraft List (Default starts with 1 aircraft of squadron designated type)
  const [ownedFleet, setOwnedFleet] = useState<OwnedAircraft[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_owned_fleet`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [createDefaultOwnedAircraft(squadronDesignatedAircraft, currentSquadronName)];
  });

  // 3. Crew Roster (Ground, Tech, Fuel, Electric, Flight)
  const [crewRoster, setCrewRoster] = useState<SquadronCrewRoster>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_crew_roster`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.groundCrew) return parsed;
      }
    } catch (e) {}
    return createDefaultCrewRoster(playerProfile?.commanderName || 'Mayor Adhiatma', `${currentPlayableSquadron.callsignPrefix}-01`);
  });

  // 4. Hangar & Apron Facility Levels (Default Level 1 = 2 aircraft capacity each)
  const [hangarLevelIndex, setHangarLevelIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_hangar_level`);
      if (saved !== null) return Number(saved);
    } catch (e) {}
    return 0; // Level 1 (index 0) = 2 aircraft capacity
  });

  const [apronLevelIndex, setApronLevelIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_apron_level`);
      if (saved !== null) return Number(saved);
    } catch (e) {}
    return 0; // Level 1 (index 0) = 2 aircraft capacity
  });

  // 5. Selected Tail Number for Aircraft Health Monitoring
  const [activeHealthTail, setActiveHealthTail] = useState<string>(() => {
    return ownedFleet[0]?.tailNumber || 'TS-1601';
  });

  // 6. Unlocked Weapons & External Fuel Tanks Catalog
  const [unlockedWeaponIds, setUnlockedWeaponIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_unlocked_weapons`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ['aim9x', 'aim120c', 'gbu12', 'mk82_bomb', 'sniper_xr', 'tank_300gal', 'r73'];
  });

  // 7. Active Hardpoint Stations Loadout
  const [hardpoints, setHardpoints] = useState<{
    wingtip: string | null;
    outboard: string | null;
    inboard: string | null;
    conformal: string | null;
    centerline: string | null;
  }>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_hardpoints`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch (e) {}
    return {
      wingtip: 'aim9x',
      outboard: 'aim120c',
      inboard: 'tank_300gal',
      conformal: null,
      centerline: 'sniper_xr'
    };
  });

  // 8. Service Facility Sub-tabs: 'facilities' | 'gen_upgrade' | 'diagnostics'
  const [serviceSubTab, setServiceSubTab] = useState<'facilities' | 'gen_upgrade' | 'diagnostics'>('facilities');

  // 9. Crew Sub-tabs: 'roster' | 'academy' | 'capacity'
  const [crewSubTab, setCrewSubTab] = useState<'roster' | 'academy' | 'capacity'>('roster');

  // 10. Selected Dossier Personnel Modal
  const [selectedDossierPilot, setSelectedDossierPilot] = useState<IndividualPilot | null>(null);
  const [selectedDossierCrew, setSelectedDossierCrew] = useState<IndividualCrewMember | null>(null);

  // 11. Squadron Commissioning Pipeline Modal for locked squadrons
  const [commissioningModalSquadron, setCommissioningModalSquadron] = useState<PlayableSquadron | null>(null);

  // 12. Individual Pilots Roster with Star Ratings & Specialty
  const [individualPilots, setIndividualPilots] = useState<IndividualPilot[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_pilots`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return generateDefaultPilotsForSquadron(
      squadronData.name,
      squadronMeta.callsignPrefix,
      playerProfile?.commanderName || 'Mayor Adhiatma'
    );
  });

  // 13. Individual Crew Members Roster with Star Ratings & Specialization
  const [individualCrewMembers, setIndividualCrewMembers] = useState<IndividualCrewMember[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_crew_members`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return generateDefaultCrewMembersForSquadron(squadronData.name);
  });

  // 14. Pending Deliveries, Construction, Training Queue
  const [pendingJobs, setPendingJobs] = useState<PendingDeliveryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_pending_jobs`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Load squadron state helper
  const handleSelectSquadron = (sq: PlayableSquadron) => {
    setSelectedSquadronId(sq.id);
    try {
      localStorage.setItem('ais_active_squadron_id', sq.id);
    } catch (e) {}

    const key = `ais_sq_state_${sq.id}`;
    const acPreset = AIRCRAFT_PRESETS.find(p => p.id === sq.aircraftId) || selectedAircraft;
    const sqMeta = SQUADRON_DETAILS[sq.name] || SQUADRON_DETAILS['Skadron Udara 3'];

    let b = INITIAL_SQUADRON_BUDGET;
    let fleet: OwnedAircraft[] = [createDefaultOwnedAircraft(acPreset, sq.name)];
    let roster = createDefaultCrewRoster(playerProfile?.commanderName || 'Mayor Adhiatma', `${sq.callsignPrefix}-01`);
    let hLvl = 0;
    let aLvl = 0;
    let weaps = ['aim9x', 'aim120c', 'gbu12', 'mk82_bomb', 'sniper_xr', 'tank_300gal', 'r73'];
    let hp = {
      wingtip: 'aim9x',
      outboard: 'aim120c',
      inboard: 'tank_300gal',
      conformal: null,
      centerline: 'sniper_xr'
    };
    let pilots = generateDefaultPilotsForSquadron(
      sq.name,
      sqMeta.callsignPrefix,
      playerProfile?.commanderName || 'Mayor Adhiatma'
    );
    let crewMems = generateDefaultCrewMembersForSquadron(sq.name);
    let jobs: PendingDeliveryItem[] = [];

    try {
      const sBudget = localStorage.getItem(`${key}_budget`);
      if (sBudget) b = Number(sBudget);

      const sFleet = localStorage.getItem(`${key}_owned_fleet`);
      if (sFleet) {
        const p = JSON.parse(sFleet);
        if (Array.isArray(p) && p.length > 0) fleet = p;
      }

      const sRoster = localStorage.getItem(`${key}_crew_roster`);
      if (sRoster) {
        const p = JSON.parse(sRoster);
        if (p?.groundCrew) roster = p;
      }

      const sHangar = localStorage.getItem(`${key}_hangar_level`);
      if (sHangar !== null) hLvl = Number(sHangar);

      const sApron = localStorage.getItem(`${key}_apron_level`);
      if (sApron !== null) aLvl = Number(sApron);

      const sWeaps = localStorage.getItem(`${key}_unlocked_weapons`);
      if (sWeaps) {
        const p = JSON.parse(sWeaps);
        if (Array.isArray(p) && p.length > 0) weaps = p;
      }

      const sHp = localStorage.getItem(`${key}_hardpoints`);
      if (sHp) {
        const p = JSON.parse(sHp);
        if (p) hp = p;
      }

      const sPilots = localStorage.getItem(`${key}_pilots`);
      if (sPilots) {
        const p = JSON.parse(sPilots);
        if (Array.isArray(p) && p.length > 0) pilots = p;
      }

      const sCrewMems = localStorage.getItem(`${key}_crew_members`);
      if (sCrewMems) {
        const p = JSON.parse(sCrewMems);
        if (Array.isArray(p) && p.length > 0) crewMems = p;
      }

      const sJobs = localStorage.getItem(`${key}_pending_jobs`);
      if (sJobs) {
        const p = JSON.parse(sJobs);
        if (Array.isArray(p)) jobs = p;
      }
    } catch (e) {}

    setBudget(b);
    setOwnedFleet(fleet);
    setCrewRoster(roster);
    setHangarLevelIndex(hLvl);
    setApronLevelIndex(aLvl);
    setUnlockedWeaponIds(weaps);
    setHardpoints(hp);
    setIndividualPilots(pilots);
    setIndividualCrewMembers(crewMems);
    setPendingJobs(jobs);
    setActiveHealthTail(fleet[0]?.tailNumber || 'TS-1601');
    setViewMode('detail');

    // Synchronize global aircraft model with squadron's designated aircraft
    const targetPreset = AIRCRAFT_PRESETS.find(p => p.id === sq.aircraftId);
    if (targetPreset) {
      setSelectedAircraft(targetPreset);
    }

    if (speak) {
      speak(
        language === 'id'
          ? `Beralih ke ${sq.fullName} di ${sq.baseName}. Pesawat tugas: ${sq.aircraftName}.`
          : `Switched command to ${sq.fullName} at ${sq.baseName}. Aircraft: ${sq.aircraftName}.`
      );
    }
  };

  // Handle purchasing / unlocking a squadron
  const handleUnlockSquadron = (sq: PlayableSquadron) => {
    if (unlockedSquadronIds.includes(sq.id)) {
      handleSelectSquadron(sq);
      return;
    }

    const playerRank = playerProfile?.rank || 'Letda';
    const playerRankIndex = Math.max(0, MILITARY_RANKS.indexOf(playerRank));

    if (playerRankIndex < sq.minRankIndex) {
      const errMsg = language === 'id'
        ? `Gagal Buka Skuadron: Pangkat tidak memenuhi syarat minimal (${sq.minRank}). Pangkat Anda: ${playerRank}.`
        : `Unlock Failed: Insufficient rank (Requires: ${sq.minRank}). Your Rank: ${playerRank}.`;
      setTransactionFeedback(errMsg);
      if (speak) speak(errMsg);
      return;
    }

    if (budget < sq.unlockPrice) {
      const errMsg = language === 'id'
        ? `Gagal Buka Skuadron: Anggaran tidak mencukupi (${formatCurrency(sq.unlockPrice)}). Saldo Anda: ${formatCurrency(budget)}.`
        : `Unlock Failed: Insufficient budget (${formatCurrency(sq.unlockPrice)}). Available: ${formatCurrency(budget)}.`;
      setTransactionFeedback(errMsg);
      if (speak) speak(errMsg);
      return;
    }

    // Deduct cost from treasury
    setBudget(prev => prev - sq.unlockPrice);
    
    // Add to unlocked list
    const newUnlocks = Array.from(new Set([...unlockedSquadronIds, sq.id]));
    setUnlockedSquadronIds(newUnlocks);
    try {
      localStorage.setItem('ais_unlocked_squadron_ids', JSON.stringify(newUnlocks));
    } catch (e) {}

    // Initialize the new squadron's fleet & budget in localStorage if not already initialized
    const sqKey = `ais_sq_state_${sq.id}`;
    const preset = AIRCRAFT_PRESETS.find(p => p.id === sq.aircraftId) || selectedAircraft;
    try {
      if (!localStorage.getItem(`${sqKey}_owned_fleet`)) {
        localStorage.setItem(`${sqKey}_owned_fleet`, JSON.stringify([createDefaultOwnedAircraft(preset, sq.name)]));
      }
      if (!localStorage.getItem(`${sqKey}_budget`)) {
        localStorage.setItem(`${sqKey}_budget`, String(INITIAL_SQUADRON_BUDGET));
      }
    } catch (e) {}

    const successMsg = language === 'id'
      ? `OTORISASI RESMI BERHASIL! Lisensi ${sq.fullName} di ${sq.baseName} resmi dibuka untuk penugasan tempur!`
      : `COMMISSIONING SUCCESSFUL! ${sq.fullName} at ${sq.baseName} officially unlocked for combat operations!`;
    setTransactionFeedback(successMsg);

    if (speak) {
      speak(
        language === 'id'
          ? `Mabes TNI Angkatan Udara telah mengesahkan pengaktifan ${sq.fullName}.`
          : `TNI AU Headquarters authorized the commissioning of ${sq.fullName}.`
      );
    }

    // Switch to newly unlocked squadron
    handleSelectSquadron(sq);
  };

  // Activate squadron for flight simulator
  const handleActivateSquadronForFlight = (sq: PlayableSquadron) => {
    handleSelectSquadron(sq);
    const ac = AIRCRAFT_PRESETS.find(p => p.id === sq.aircraftId) || selectedAircraft;
    setSelectedAircraft(ac);

    const matchedAirport = MILITARY_AIRPORTS.find(
      ap => ap.icao === sq.baseIcao || ap.name.toLowerCase().includes(sq.baseName.toLowerCase())
    );
    if (matchedAirport && setDepartureAirport) {
      setDepartureAirport(matchedAirport);
    }

    if (setInitialFuel) setInitialFuel(ac.maxFuel);
    if (setFuelRemaining) setFuelRemaining(ac.maxFuel);
    if (setTargetSpeed) setTargetSpeed(ac.cruiseSpeed);

    setCrew({
      ...crew,
      callSign: `${sq.callsignPrefix}-01`
    });

    const msg = language === 'id'
      ? `${sq.fullName} (${sq.aircraftName}) di ${sq.baseName} siap siaga untuk operasi penerbangan simulator!`
      : `${sq.fullName} (${sq.aircraftName}) at ${sq.baseName} deployed for simulator flight!`;
    setTransactionFeedback(msg);

    if (onNavigateToFlight) {
      onNavigateToFlight();
    }
  };

  // Sync state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_budget`, String(budget));
      localStorage.setItem(`${storageKey}_owned_fleet`, JSON.stringify(ownedFleet));
      localStorage.setItem(`${storageKey}_crew_roster`, JSON.stringify(crewRoster));
      localStorage.setItem(`${storageKey}_hangar_level`, String(hangarLevelIndex));
      localStorage.setItem(`${storageKey}_apron_level`, String(apronLevelIndex));
      localStorage.setItem(`${storageKey}_unlocked_weapons`, JSON.stringify(unlockedWeaponIds));
      localStorage.setItem(`${storageKey}_hardpoints`, JSON.stringify(hardpoints));
      localStorage.setItem(`${storageKey}_pilots`, JSON.stringify(individualPilots));
      localStorage.setItem(`${storageKey}_crew_members`, JSON.stringify(individualCrewMembers));
      localStorage.setItem(`${storageKey}_pending_jobs`, JSON.stringify(pendingJobs));
    } catch (e) {}
  }, [storageKey, budget, ownedFleet, crewRoster, hangarLevelIndex, apronLevelIndex, unlockedWeaponIds, hardpoints, individualPilots, individualCrewMembers, pendingJobs]);

  // Background processor for Pending Deliveries, Facility Construction, and Personnel Training
  useEffect(() => {
    if (pendingJobs.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const completed = pendingJobs.filter(job => now >= job.finishTime);

      if (completed.length > 0) {
        completed.forEach(job => {
          if (job.type === 'AIRCRAFT' && job.data?.newUnit) {
            const unit = job.data.newUnit as OwnedAircraft;
            setOwnedFleet(prev => {
              if (prev.some(u => u.id === unit.id || u.tailNumber === unit.tailNumber)) return prev;
              return [...prev, unit];
            });
            setActiveHealthTail(unit.tailNumber);

            const notif = language === 'id'
              ? `PESAWAT TIBA! ${unit.aircraft.name} (${unit.tailNumber}) mendarat di pangkalan dan resmi bergabung dengan skuadron!`
              : `AIRCRAFT DELIVERED! ${unit.aircraft.name} (${unit.tailNumber}) touched down and joined the squadron!`;
            setTransactionFeedback(notif);

            if (speak) {
              speak(
                language === 'id'
                  ? `Pemberitahuan Menara ATC: Pesawat tempur ${unit.aircraft.name} nomor ekor ${unit.tailNumber} telah mendarat dengan selamat di pangkalan dan resmi diserahkan ke komandan skadron.`
                  : `Airbase Notice: Aircraft ${unit.aircraft.name} tail ${unit.tailNumber} ferry flight complete and commissioned.`
              );
            }
          } else if (job.type === 'HANGAR_UPGRADE') {
            setHangarLevelIndex(prev => prev + 1);
            const targetLvl = (job.data?.targetLevel || 2);
            const notif = language === 'id'
              ? `KONSTRUKSI SELESAI! Hanggar Perawatan Level ${targetLvl} siap digunakan.`
              : `CONSTRUCTION COMPLETE! Hangar Bay Level ${targetLvl} operational.`;
            setTransactionFeedback(notif);

            if (speak) {
              speak(
                language === 'id'
                  ? `Pemberitahuan Pangkalan: Pembangunan fasilitas hanggar perawatan skuadron telah selesai dikerjakan.`
                  : `Airbase Notice: Hangar bay facility expansion completed.`
              );
            }
          } else if (job.type === 'APRON_UPGRADE') {
            setApronLevelIndex(prev => prev + 1);
            const targetLvl = (job.data?.targetLevel || 2);
            const notif = language === 'id'
              ? `PERLUASAN SELESAI! Apron Hardstand Level ${targetLvl} siap menampung armada.`
              : `EXPANSION COMPLETE! Apron Hardstand Level ${targetLvl} operational.`;
            setTransactionFeedback(notif);

            if (speak) {
              speak(
                language === 'id'
                  ? `Pemberitahuan Pangkalan: Pekerjaan pengaspalan dan perluasan apron tarmac pesawat tempur selesai.`
                  : `Airbase Notice: Apron tarmac hardstand expansion completed.`
              );
            }
          } else if (job.type === 'CREW_RECRUITMENT' && job.data?.departmentKey) {
            const deptKey = job.data.departmentKey as 'groundCrew' | 'technicians' | 'fuelCrew' | 'electricCrew';
            setCrewRoster(prev => ({
              ...prev,
              [deptKey]: {
                ...prev[deptKey],
                count: prev[deptKey].count + 2,
                level: Math.min(prev[deptKey].level + 1, 5)
              }
            }));
            const notif = language === 'id'
              ? `REKRUTMEN SELESAI! Personil baru telah tiba dan ditugaskan ke skuadron.`
              : `RECRUITMENT COMPLETE! Support personnel deployed to squadron.`;
            setTransactionFeedback(notif);
          } else if (job.type === 'TRAINING' && job.data) {
            const { targetId, isPilot, statBoost } = job.data;
            if (isPilot) {
              setIndividualPilots(prev => prev.map(p => {
                if (p.id !== targetId) return p;
                return {
                  ...p,
                  rating: Math.min(5.0, Number((p.rating + (statBoost?.ratingGain || 0.4)).toFixed(1))),
                  specialization: statBoost?.specializationBadge || p.specialization,
                  status: 'READY'
                };
              }));
            } else {
              setIndividualCrewMembers(prev => prev.map(c => {
                if (c.id !== targetId) return c;
                return {
                  ...c,
                  rating: Math.min(5.0, Number((c.rating + (statBoost?.ratingGain || 0.4)).toFixed(1))),
                  efficiencyScore: Math.min(100, c.efficiencyScore + (statBoost?.efficiencyBonus || 15)),
                  status: 'ACTIVE'
                };
              }));
            }

            const notif = language === 'id'
              ? `PELATIHAN DIKLAT SELESAI! Personil berhasil lulus dengan peningkatan rating kemahiran!`
              : `TRAINING COMPLETE! Personnel graduated with enhanced performance ratings!`;
            setTransactionFeedback(notif);

            if (speak) {
              speak(
                language === 'id'
                  ? `Personil skuadron telah menyelesaikan program pelatihan militer dan kembali ke pangkalan dengan kualifikasi baru.`
                  : `Personnel successfully graduated from advanced military training.`
              );
            }
          }
        });

        // Remove finished jobs from list
        setPendingJobs(prev => prev.filter(j => now < j.finishTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingJobs, language, speak]);

  // Synchronize activeHealthTail if fleet changes
  useEffect(() => {
    if (!ownedFleet.some(ac => ac.tailNumber === activeHealthTail)) {
      if (ownedFleet[0]) setActiveHealthTail(ownedFleet[0].tailNumber);
    }
  }, [ownedFleet, activeHealthTail]);

  // Current Facilities Data
  const currentHangar = HANGAR_LEVELS[hangarLevelIndex] || HANGAR_LEVELS[0];
  const nextHangar = HANGAR_LEVELS[hangarLevelIndex + 1] || null;

  const currentApron = APRON_LEVELS[apronLevelIndex] || APRON_LEVELS[0];
  const nextApron = APRON_LEVELS[apronLevelIndex + 1] || null;

  // Total Crew Calculation
  const totalSquadronCrew = useMemo(() => {
    return (
      (crewRoster.flightCrew.count || 2) +
      crewRoster.groundCrew.count +
      crewRoster.technicians.count +
      crewRoster.fuelCrew.count +
      crewRoster.electricCrew.count
    );
  }, [crewRoster]);

  // Format IDR Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Operational Subsystems interactive states
  const [serviceInProgress, setServiceInProgress] = useState<string | null>(null);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);
  const [transactionFeedback, setTransactionFeedback] = useState<string | null>(null);

  // Weapon & Fuel states
  const [weaponPreset, setWeaponPreset] = useState<'cap' | 'strike' | 'maritime' | 'long_range'>('cap');
  const [fuelPercentage, setFuelPercentage] = useState<number>(100);
  const [useExternalTanks, setUseExternalTanks] = useState<boolean>(false);

  // Selected aircraft for condition health tab
  const activeConditionAircraft = useMemo(() => {
    return ownedFleet.find(a => a.tailNumber === activeHealthTail) || ownedFleet[0] || null;
  }, [ownedFleet, activeHealthTail]);

  // ==========================================
  // HANDLERS & BUSINESS LOGIC
  // ==========================================

  // Select Aircraft for active flight operations
  const handleSelectAircraft = (targetOwned: OwnedAircraft) => {
    setSelectedAircraft(targetOwned.aircraft);
    setActiveHealthTail(targetOwned.tailNumber);
    const maxF = targetOwned.aircraft.maxFuel;
    if (setInitialFuel) setInitialFuel(maxF);
    if (setFuelRemaining) setFuelRemaining(maxF);
    if (setTargetSpeed) setTargetSpeed(targetOwned.aircraft.cruiseSpeed);
    setFuelPercentage(100);

    // Update crew callsign if appropriate
    setCrew({
      ...crew,
      callSign: `${squadronMeta.callsignPrefix}-${targetOwned.tailNumber.slice(-2)}`,
      crewCount: totalSquadronCrew
    });

    if (speak) {
      speak(
        language === 'id' 
          ? `Pesawat ${targetOwned.aircraft.name} nomor ekor ${targetOwned.tailNumber} diaktifkan sebagai pesawat tempur utama di hanggar bay.`
          : `Aircraft ${targetOwned.aircraft.name} tail ${targetOwned.tailNumber} deployed to active hangar bay.`
      );
    }
  };

  // 1. BUY AIRCRAFT (Includes strict facility capacity enforcement & delivery ferry time)
  const handleBuyAircraft = (catalogItem: typeof AIRCRAFT_PROCUREMENT_CATALOG[0]) => {
    const preset = AIRCRAFT_PRESETS.find(p => p.id === catalogItem.presetId);
    if (!preset) return;

    // Check capacity: MUST NOT exceed the lower of Hangar or Apron capacity
    const minFacilityCapacity = Math.min(currentHangar.capacity, currentApron.capacity);
    if (ownedFleet.length >= minFacilityCapacity) {
      const needsHangar = currentHangar.capacity <= ownedFleet.length;
      const needsApron = currentApron.capacity <= ownedFleet.length;
      const bottleneck = needsHangar && needsApron 
        ? 'Hanggar dan Apron' 
        : needsHangar ? 'Hanggar Perawatan' : 'Apron Hardstand';

      const msg = language === 'id'
        ? `KAPASITAS PANGKALAN PENUH (${ownedFleet.length}/${minFacilityCapacity} Pesawat)! Kapasitas saat ini: Hanggar (${currentHangar.capacity}) | Apron (${currentApron.capacity}). Anda WAJIB melakukan upgrade fasilitas ${bottleneck} terlebih dahulu sebelum membeli pesawat baru!`
        : `AIRBASE CAPACITY FULL (${ownedFleet.length}/${minFacilityCapacity} Aircraft)! Current: Hangar (${currentHangar.capacity}) | Apron (${currentApron.capacity}). You MUST upgrade ${bottleneck} facilities before procuring new aircraft!`;
      
      setTransactionFeedback(msg);
      if (speak) speak(msg);
      return;
    }

    // Check budget
    if (budget < catalogItem.price) {
      const shortfall = catalogItem.price - budget;
      const msg = language === 'id'
        ? `Anggaran tidak mencukupi. Dibutuhkan ${formatCurrency(catalogItem.price)} (Kurang ${formatCurrency(shortfall)}).`
        : `Insufficient funds. Required ${formatCurrency(catalogItem.price)} (Short by ${formatCurrency(shortfall)}).`;
      setTransactionFeedback(msg);
      if (speak) speak(msg);
      return;
    }

    // Deduct cost immediately from treasury
    setBudget(prev => prev - catalogItem.price);

    const newTailNumber = generateTailNumber(preset, ownedFleet.length + pendingJobs.filter(j => j.type === 'AIRCRAFT').length, currentSquadronName);
    const newOwnedUnit: OwnedAircraft = {
      id: `owned-${preset.id}-${newTailNumber}-${Date.now()}`,
      tailNumber: newTailNumber,
      aircraft: preset,
      flightHours: 0.0,
      health: {
        airframe: 100,
        engine: 100,
        hydraulics: 100,
        avionics: 100,
        fuelSystem: 100
      },
      status: {
        code: 'READY',
        labelId: 'SIAP TEMPUR (COMBAT READY)',
        labelEn: 'COMBAT READY',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      },
      purchasePrice: catalogItem.price,
      purchasedAt: Date.now()
    };

    // Queue in delivery job with ferry flight time (20s)
    const deliverySeconds = 20;
    const newJob: PendingDeliveryItem = {
      id: `job-aircraft-${preset.id}-${Date.now()}`,
      squadronId: selectedSquadronId,
      type: 'AIRCRAFT',
      titleId: `Pengadaan Pesawat ${preset.name}`,
      titleEn: `Aircraft Delivery ${preset.name}`,
      subtitleId: `Ferry Flight Menuju ${squadronData.location} (${newTailNumber})`,
      subtitleEn: `Ferry Flight En-Route to ${squadronData.location} (${newTailNumber})`,
      startTime: Date.now(),
      finishTime: Date.now() + deliverySeconds * 1000,
      totalDurationSeconds: deliverySeconds,
      cost: catalogItem.price,
      status: 'PROCESSING',
      iconType: 'plane',
      data: {
        newUnit: newOwnedUnit,
        catalogItem
      }
    };

    setPendingJobs(prev => [...prev, newJob]);

    // Automatically expand crew allocation by included package count
    const extraGround = 2;
    const extraTech = 2;
    const extraFuel = 1;
    const extraElectric = 1;

    setCrewRoster(prev => ({
      ...prev,
      flightCrew: {
        ...prev.flightCrew,
        count: prev.flightCrew.count + 2
      },
      groundCrew: {
        ...prev.groundCrew,
        count: prev.groundCrew.count + extraGround
      },
      technicians: {
        ...prev.technicians,
        count: prev.technicians.count + extraTech
      },
      fuelCrew: {
        ...prev.fuelCrew,
        count: prev.fuelCrew.count + extraFuel
      },
      electricCrew: {
        ...prev.electricCrew,
        count: prev.electricCrew.count + extraElectric
      }
    }));

    const successMsg = language === 'id'
      ? `PESANAN PENGADAAN DISETUJUI! Pesawat ${preset.name} (${newTailNumber}) sedang dalam penerbangan penyerahan (Ferry Flight) menuju pangkalan (~${deliverySeconds} detik).`
      : `PROCUREMENT ORDER APPROVED! Aircraft ${preset.name} (${newTailNumber}) ferry flight en-route (~${deliverySeconds}s).`;

    setTransactionFeedback(successMsg);

    if (speak) {
      speak(
        language === 'id'
          ? `Otorisasi pengadaan pesawat tempur ${preset.name} disetujui. Pesawat sedang dalam proses penerbangan ferry flight menuju pangkalan.`
          : `Procurement order for ${preset.name} approved. Ferry flight initiated en-route to base.`
      );
    }
  };

  // 2. UPGRADE CREW DEPARTMENT (With training/recruitment processing time)
  const handleUpgradeCrew = (departmentKey: 'groundCrew' | 'technicians' | 'fuelCrew' | 'electricCrew') => {
    const dept = crewRoster[departmentKey];
    if (budget < dept.costPerUpgrade) {
      const msg = language === 'id'
        ? `Anggaran tidak cukup untuk merekrut personil ${dept.nameId}. Dibutuhkan ${formatCurrency(dept.costPerUpgrade)}.`
        : `Insufficient funds to upgrade ${dept.nameEn}. Required ${formatCurrency(dept.costPerUpgrade)}.`;
      setTransactionFeedback(msg);
      return;
    }

    setBudget(prev => prev - dept.costPerUpgrade);

    const recruitSeconds = 10;
    const newJob: PendingDeliveryItem = {
      id: `job-crew-${departmentKey}-${Date.now()}`,
      squadronId: selectedSquadronId,
      type: 'CREW_RECRUITMENT',
      titleId: `Rekrutmen ${dept.nameId}`,
      titleEn: `Recruitment ${dept.nameEn}`,
      subtitleId: `Penugasan +2 Personil & Kualifikasi Baru`,
      subtitleEn: `Deployment of +2 Personnel & New Qualifications`,
      startTime: Date.now(),
      finishTime: Date.now() + recruitSeconds * 1000,
      totalDurationSeconds: recruitSeconds,
      cost: dept.costPerUpgrade,
      status: 'PROCESSING',
      iconType: 'user',
      data: {
        departmentKey
      }
    };

    setPendingJobs(prev => [...prev, newJob]);

    const msg = language === 'id'
      ? `PROSES REKRUTMEN DIMULAI: +2 Personil ${dept.nameId} sedang dalam proses mobilisasi (~${recruitSeconds} detik).`
      : `RECRUITMENT INITIATED: +2 Personnel for ${dept.nameEn} en-route (~${recruitSeconds}s).`;

    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Permintaan penambahan personil ${dept.nameId} disetujui. Tim sedang dalam proses administrasi dan penempatan ke pangkalan.`
          : `Crew reinforcement for ${dept.nameEn} approved and processing.`
      );
    }
  };

  // 3. UPGRADE HANGAR FACILITY (With Construction Time)
  const handleUpgradeHangar = () => {
    if (!nextHangar) return;
    if (budget < currentHangar.upgradeCost) {
      const msg = language === 'id'
        ? `Anggaran tidak mencukupi untuk upgrade hanggar. Dibutuhkan ${formatCurrency(currentHangar.upgradeCost)}.`
        : `Insufficient funds for hangar upgrade. Required ${formatCurrency(currentHangar.upgradeCost)}.`;
      setTransactionFeedback(msg);
      return;
    }

    setBudget(prev => prev - currentHangar.upgradeCost);

    const constructionSeconds = 15;
    const newJob: PendingDeliveryItem = {
      id: `job-hangar-${nextHangar.level}-${Date.now()}`,
      squadronId: selectedSquadronId,
      type: 'HANGAR_UPGRADE',
      titleId: `Pembangunan ${nextHangar.titleId}`,
      titleEn: `Construction of ${nextHangar.titleEn}`,
      subtitleId: `Peningkatan Kapasitas Menjadi ${nextHangar.capacity} Pesawat Tempur`,
      subtitleEn: `Expanding Capacity to ${nextHangar.capacity} Combat Aircraft`,
      startTime: Date.now(),
      finishTime: Date.now() + constructionSeconds * 1000,
      totalDurationSeconds: constructionSeconds,
      cost: currentHangar.upgradeCost,
      status: 'PROCESSING',
      iconType: 'building',
      data: {
        targetLevel: nextHangar.level,
        capacity: nextHangar.capacity
      }
    };

    setPendingJobs(prev => [...prev, newJob]);

    const msg = language === 'id'
      ? `PROSES KONSTRUKSI DIMULAI! Pembangunan Hanggar Level ${nextHangar.level} sedang berjalan (~${constructionSeconds} detik).`
      : `CONSTRUCTION STARTED! Hangar Level ${nextHangar.level} upgrade in progress (~${constructionSeconds}s).`;

    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Pekerjaan konstruksi perluasan hanggar perawatan skuadron telah dimulai.`
          : `Construction for squadron hangar bay expansion has begun.`
      );
    }
  };

  // 4. UPGRADE APRON FACILITY (With Tarmac Construction Time)
  const handleUpgradeApron = () => {
    if (!nextApron) return;
    if (budget < currentApron.upgradeCost) {
      const msg = language === 'id'
        ? `Anggaran tidak mencukupi untuk perluasan apron tarmac. Dibutuhkan ${formatCurrency(currentApron.upgradeCost)}.`
        : `Insufficient funds for apron expansion. Required ${formatCurrency(currentApron.upgradeCost)}.`;
      setTransactionFeedback(msg);
      return;
    }

    setBudget(prev => prev - currentApron.upgradeCost);

    const constructionSeconds = 12;
    const newJob: PendingDeliveryItem = {
      id: `job-apron-${nextApron.level}-${Date.now()}`,
      squadronId: selectedSquadronId,
      type: 'APRON_UPGRADE',
      titleId: `Perluasan ${nextApron.titleId}`,
      titleEn: `Expansion of ${nextApron.titleEn}`,
      subtitleId: `Peningkatan Daya Tampung Hardstand Menjadi ${nextApron.capacity} Pesawat`,
      subtitleEn: `Expanding Hardstand Capacity to ${nextApron.capacity} Aircraft`,
      startTime: Date.now(),
      finishTime: Date.now() + constructionSeconds * 1000,
      totalDurationSeconds: constructionSeconds,
      cost: currentApron.upgradeCost,
      status: 'PROCESSING',
      iconType: 'building',
      data: {
        targetLevel: nextApron.level,
        capacity: nextApron.capacity
      }
    };

    setPendingJobs(prev => [...prev, newJob]);

    const msg = language === 'id'
      ? `PROSES PENGASPALAN APRON DIMULAI! Perluasan Apron Level ${nextApron.level} sedang berlangsung (~${constructionSeconds} detik).`
      : `TARMAC EXPANSION STARTED! Apron Level ${nextApron.level} upgrade in progress (~${constructionSeconds}s).`;

    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Pekerjaan perkerasan dan perluasan apron tarmac pangkalan telah dimulai.`
          : `Apron tarmac expansion construction has commenced.`
      );
    }
  };

  // 5. START ADVANCED MILITARY TRAINING
  const handleStartTraining = (candidateId: string, isPilot: boolean, courseId: string) => {
    const course = MILITARY_TRAINING_COURSES.find(c => c.id === courseId);
    if (!course) return;

    if (budget < course.cost) {
      const msg = language === 'id'
        ? `Anggaran tidak mencukupi untuk kursus ${course.nameId}. Dibutuhkan ${formatCurrency(course.cost)}.`
        : `Insufficient budget for ${course.nameEn}. Required ${formatCurrency(course.cost)}.`;
      setTransactionFeedback(msg);
      return;
    }

    let candidateName = '';
    let candidateRank = '';

    if (isPilot) {
      const pilot = individualPilots.find(p => p.id === candidateId);
      if (!pilot || pilot.status === 'TRAINING') return;
      candidateName = pilot.name;
      candidateRank = pilot.rank;
      setIndividualPilots(prev => prev.map(p => p.id === candidateId ? { ...p, status: 'TRAINING' } : p));
    } else {
      const crewMem = individualCrewMembers.find(c => c.id === candidateId);
      if (!crewMem || crewMem.status === 'TRAINING') return;
      candidateName = crewMem.name;
      candidateRank = crewMem.rank;
      setIndividualCrewMembers(prev => prev.map(c => c.id === candidateId ? { ...c, status: 'TRAINING' } : c));
    }

    // Deduct course tuition from budget
    setBudget(prev => prev - course.cost);

    const newJob: PendingDeliveryItem = {
      id: `job-train-${course.id}-${candidateId}-${Date.now()}`,
      squadronId: selectedSquadronId,
      type: 'TRAINING',
      titleId: `Diklat: ${course.nameId}`,
      titleEn: `Training: ${course.nameEn}`,
      subtitleId: `${candidateRank} ${candidateName} • Wing Pendidikan TNI AU`,
      subtitleEn: `${candidateRank} ${candidateName} • TNI AU Training Wing`,
      startTime: Date.now(),
      finishTime: Date.now() + course.durationSeconds * 1000,
      totalDurationSeconds: course.durationSeconds,
      cost: course.cost,
      status: 'PROCESSING',
      iconType: 'graduation',
      data: {
        targetId: candidateId,
        isPilot,
        courseId: course.id,
        statBoost: course.statBoost
      }
    };

    setPendingJobs(prev => [...prev, newJob]);

    const msg = language === 'id'
      ? `${candidateRank} ${candidateName} resmi diberangkatkan ke Wing Diklat untuk program "${course.nameId}" (~${course.durationSeconds} detik).`
      : `${candidateRank} ${candidateName} dispatched for "${course.nameEn}" training (~${course.durationSeconds}s).`;

    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Personil ${candidateName} telah diberangkatkan ke Wing Pendidikan untuk menjalani kursus pelatihan lanjutan.`
          : `Personnel ${candidateName} dispatched to training academy.`
      );
    }
  };

  // 6. EXPEDITE / RUSH PENDING JOB
  const handleExpediteJob = (jobId: string) => {
    setPendingJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        finishTime: Date.now() - 100 // Mark as finished immediately
      };
    }));
  };

  // 7. GRANT EXTRA BUDGET (For test and sandbox enjoyment)
  const handleRequestBudgetGrant = () => {
    const grantAmount = 500000000; // Rp 500.000.000
    setBudget(prev => prev + grantAmount);
    const msg = language === 'id'
      ? `Alokasi Anggaran Operasional Mabes TNI-AU Sebesar ${formatCurrency(grantAmount)} Berhasil Dicairkan!`
      : `Operational Budget Grant of ${formatCurrency(grantAmount)} Successfully Disbursed!`;
    setTransactionFeedback(msg);
    if (speak) {
      speak(
        language === 'id'
          ? `Tambahan dana logistik skuadron sebesar lima ratus juta rupiah telah masuk ke rekening bendahara pangkalan.`
          : `Additional five hundred million rupiah operational grant disbursed to squadron treasury.`
      );
    }
  };

  // 6. EXECUTE SERVICE ON SPECIFIC AIRCRAFT
  const handleServiceAircraft = (tailNumber: string, subsystem: 'all' | 'airframe' | 'engine' | 'hydraulics' | 'avionics') => {
    setServiceInProgress(`${tailNumber}-${subsystem}`);
    setServiceMessage(null);

    const cost = subsystem === 'all' ? 15000000 : 0;
    if (cost > 0 && budget < cost) {
      setTransactionFeedback(language === 'id' ? 'Anggaran tidak cukup untuk servis menyeluruh.' : 'Insufficient budget for full overhaul.');
      setServiceInProgress(null);
      return;
    }

    if (cost > 0) setBudget(prev => prev - cost);

    setTimeout(() => {
      setOwnedFleet(prev => prev.map(item => {
        if (item.tailNumber !== tailNumber) return item;
        return {
          ...item,
          health: {
            airframe: subsystem === 'airframe' || subsystem === 'all' ? 100 : item.health.airframe,
            engine: subsystem === 'engine' || subsystem === 'all' ? 100 : item.health.engine,
            hydraulics: subsystem === 'hydraulics' || subsystem === 'all' ? 100 : item.health.hydraulics,
            avionics: subsystem === 'avionics' || subsystem === 'all' ? 100 : item.health.avionics,
            fuelSystem: 100
          }
        };
      }));

      setServiceInProgress(null);
      const note = language === 'id'
        ? `PEMELIHARAAN SELESAI PADA PESAWAT [${tailNumber}]: SISTEM 100% AIRWORTHY NOMINAL!`
        : `MAINTENANCE COMPLETE ON [${tailNumber}]: 100% AIRWORTHY NOMINAL!`;
      setServiceMessage(note);

      if (speak) {
        speak(
          language === 'id'
            ? `Prosedur pemeliharaan teknis pada pesawat nomor ekor ${tailNumber} selesai dengan hasil sempurna seratus persen laik udara.`
            : `Maintenance complete on tail ${tailNumber}. All systems green and ready for sortie.`
        );
      }
    }, 1400);
  };

  // 7. UPGRADE AIRCRAFT GENERATION TIER
  const handleUpgradeAircraftGeneration = (targetAircraftTail: string, upgrade: AircraftGenerationUpgrade) => {
    setOwnedFleet(prev => prev.map(item => {
      if (item.tailNumber !== targetAircraftTail) return item;

      const upgradedModelName = `${item.aircraft.name} (${upgrade.targetNameSuffix})`;
      const updatedUpgrades = Array.from(new Set([...(item.upgradesApplied || []), upgrade.id]));

      const updatedAircraft: Aircraft = {
        ...item.aircraft,
        name: upgradedModelName,
        cruiseSpeed: item.aircraft.cruiseSpeed + (upgrade.statBoosts.cruiseSpeedBoost || 30),
        specs: {
          ...item.aircraft.specs,
          maxSpeed: upgrade.statBoosts.maxSpeed,
          range: `${item.aircraft.specs.range} (${upgrade.statBoosts.rangeBoost})`,
          ceiling: upgrade.statBoosts.ceiling,
          avionics: upgrade.statBoosts.radarType,
          hardpoints: `${item.aircraft.specs.hardpoints} (Conformal & Gen ${upgrade.targetGeneration} Certified)`
        }
      };

      // If active flight simulator aircraft is this one, update it
      if (selectedAircraft.id === item.aircraft.id || selectedAircraft.name.includes(item.aircraft.name)) {
        setSelectedAircraft(updatedAircraft);
      }

      return {
        ...item,
        customName: upgradedModelName,
        generationTier: upgrade.targetGeneration,
        generationBadge: upgrade.generationBadge,
        upgradesApplied: updatedUpgrades,
        aircraft: updatedAircraft,
        health: {
          airframe: 100,
          engine: 100,
          hydraulics: 100,
          avionics: 100,
          fuelSystem: 100
        }
      };
    }));
  };

  // Fuel change handler
  const handleApplyFuel = (pct: number) => {
    setFuelPercentage(pct);
    const calcFuel = Math.round((selectedAircraft.maxFuel * pct) / 100);
    if (setInitialFuel) setInitialFuel(calcFuel);
    if (setFuelRemaining) setFuelRemaining(calcFuel);
    if (speak) {
      speak(
        language === 'id'
          ? `Bahan bakar diatur ke ${pct} persen (${calcFuel} LBS).`
          : `Fuel adjusted to ${pct} percent (${calcFuel} LBS).`
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -10 }} 
      className="p-3.5 space-y-3.5 text-white"
    >
      {viewMode === 'list' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/10">
            <span className="text-[8.5px] font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'id' ? 'PILIH SKUADRON TEMPUR UNTUK DIKELOLA' : 'SELECT COMBAT SQUADRON TO MANAGE'}</span>
            </span>
            <button
              type="button"
              onClick={() => setViewMode('detail')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[8px] font-mono font-bold uppercase transition-all shadow"
            >
              {language === 'id' ? 'Buka Skuadron Aktif →' : 'Open Active Squadron →'}
            </button>
          </div>

          <SquadronListView
            language={language}
            playableSquadrons={PLAYABLE_SQUADRONS}
            activeSquadronId={selectedSquadronId}
            unlockedSquadronIds={unlockedSquadronIds}
            onSelectSquadron={handleSelectSquadron}
            onActivateForFlight={handleActivateSquadronForFlight}
            onUnlockSquadron={handleUnlockSquadron}
            onOpenCommissioningPipeline={(sq) => setCommissioningModalSquadron(sq)}
            formatCurrency={formatCurrency}
            playerProfile={playerProfile}
            currentBudget={budget}
          />
        </div>
      ) : (
        <>
          {/* SQUADRON COMMAND SWITCHER & HUB BAR */}
          <div className="p-2 bg-black/60 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/40 rounded-xl text-[8.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'id' ? '← Daftar Semua Skuadron (8)' : '← All Squadrons List (8)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleActivateSquadronForFlight(currentPlayableSquadron)}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[8.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                title="Deploy Pesawat & Lanud Skuadron ke Simulator"
              >
                <Plane className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'Aktifkan Terbang' : 'Deploy Flight'}</span>
              </button>
            </div>

            {/* Horizontal Quick-Select Pills for 8 Squadrons */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
              {PLAYABLE_SQUADRONS.map((sq) => {
                const isSelected = sq.id === selectedSquadronId;
                const isUnlocked = unlockedSquadronIds.includes(sq.id);
                return (
                  <button
                    key={sq.id}
                    type="button"
                    onClick={() => {
                      if (isUnlocked) {
                        handleSelectSquadron(sq);
                      } else {
                        setViewMode('list');
                      }
                    }}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[7.5px] font-mono font-bold shrink-0 flex items-center gap-1 transition-all border",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 scale-105"
                        : !isUnlocked
                          ? "bg-amber-950/20 text-amber-300/60 border-amber-500/20 hover:border-amber-500/40 hover:text-amber-300"
                          : "bg-white/5 text-white/60 border-white/10 hover:border-white/25 hover:text-white"
                    )}
                    title={!isUnlocked ? `Terkunci - Klik untuk Buka Lisensi (${sq.minRank})` : sq.fullName}
                  >
                    <Shield className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[85px]">{sq.name.replace('Skadron Udara ', 'Skadron ')}</span>
                    {!isUnlocked && (
                      <span className="text-[6.5px] text-amber-400 font-black">🔒</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SQUADRON IDENTITY & MILITARY BUDGET TOP HEADER */}
          <div className={cn(
            "p-4 rounded-2xl bg-gradient-to-br border shadow-xl relative overflow-hidden",
            squadronMeta.crestColor,
            squadronMeta.accentBorder
          )}>
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Shield className="w-32 h-32 text-white" />
        </div>

        <div className="relative z-10 space-y-3">
          {/* Squadron Title & Base */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-black/40 border border-white/20 rounded-xl shadow-inner text-blue-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-mono font-bold tracking-widest text-white/60 uppercase">
                  TNI AU • SQUADRON MANAGEMENT
                </span>
                <h1 className="text-sm font-black text-white uppercase tracking-wider">
                  {currentSquadronName}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-amber-300">
                    "{squadronMeta.nickname}"
                  </span>
                  <span className="text-[8px] font-mono bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-white/70">
                    CALLSIGN: {squadronMeta.callsignPrefix}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[7.5px] font-mono text-white/50 uppercase block">LANUD BASE</span>
              <span className="text-[9.5px] font-mono font-bold text-white">
                {squadronData.location}
              </span>
            </div>
          </div>

          {/* SQUADRON STATS BANNER: SALDO ANGGARAN & KAPASITAS */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-[8.5px] font-mono">
            {/* Saldo Anggaran */}
            <div className="bg-black/50 p-2 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/50">
                <span className="text-[7.5px] uppercase">ANGGARAN SKUADRON</span>
                <Coins className="w-3 h-3 text-amber-400" />
              </div>
              <span className="text-[11px] font-black text-amber-300 font-mono mt-1 truncate">
                {formatCurrency(budget)}
              </span>
            </div>

            {/* Total Pesawat & Slot */}
            <div className="bg-black/50 p-2 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/50">
                <span className="text-[7.5px] uppercase">ARMADA DIMILIKI</span>
                <Plane className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-black text-cyan-300">{ownedFleet.length} Unit</span>
                <span className="text-[7.5px] text-white/40">/ {currentHangar.capacity} Slot Hanggar</span>
              </div>
            </div>

            {/* Total Kru Personil */}
            <div className="bg-black/50 p-2 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/50">
                <span className="text-[7.5px] uppercase">TOTAL KRU SKUADRON</span>
                <Users className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-black text-emerald-300">{totalSquadronCrew} Personil</span>
                <span className="text-[7.5px] text-emerald-400 font-bold">100% SIAP</span>
              </div>
            </div>
          </div>

          {/* Quick Grant Button & Motto */}
          <div className="flex items-center justify-between pt-1 text-[8px] font-mono text-white/70">
            <div className="flex items-center gap-1.5 italic truncate max-w-[210px]">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">"{language === 'id' ? squadronMeta.mottoId : squadronMeta.mottoEn}"</span>
            </div>

            <button
              type="button"
              onClick={handleRequestBudgetGrant}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1 transition-all active:scale-95 shadow"
              title="Ajukan Tambahan Anggaran Mabes TNI AU"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>+ Rp 500 Juta</span>
            </button>
          </div>
        </div>
      </div>

      {/* TRANSACTION / ACTION NOTIFICATION */}
      <AnimatePresence>
        {transactionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-[8.5px] font-mono text-blue-200 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{transactionFeedback}</span>
            </div>
            <button 
              onClick={() => setTransactionFeedback(null)}
              className="text-white/40 hover:text-white ml-2 text-[10px] font-bold"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE TIME-BASED PROCESSES & DELIVERIES HUD */}
      <TacticalDeliveryHUD
        language={language}
        pendingJobs={pendingJobs}
        onExpediteJob={handleExpediteJob}
        formatCurrency={formatCurrency}
      />

      {/* HORIZONTAL 8-MODULE NAVIGATOR TABS */}
      <div className="grid grid-cols-4 gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-[8px] font-mono font-bold">
        {/* TAB 1: FLEET & PROCUREMENT */}
        <button
          type="button"
          onClick={() => setActiveModule('fleet')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 relative",
            activeModule === 'fleet' ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'ARMADA' : 'FLEET'}</span>
          <span className="absolute top-1 right-1 text-[6.5px] bg-cyan-400/30 px-1 rounded text-cyan-200">
            {ownedFleet.length}
          </span>
        </button>

        {/* TAB 2: CREW (KRU DARAT & PENERBANG) */}
        <button
          type="button"
          onClick={() => setActiveModule('crew_vitals')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 relative",
            activeModule === 'crew_vitals' ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'KRU' : 'CREW'}</span>
          <span className="absolute top-1 right-1 text-[6.5px] bg-emerald-400/30 px-1 rounded text-emerald-200">
            {totalSquadronCrew}
          </span>
        </button>

        {/* TAB 3: AIRCRAFT SYSTEM HEALTH */}
        <button
          type="button"
          onClick={() => setActiveModule('condition')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'condition' ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'KESEHATAN' : 'HEALTH'}</span>
        </button>

        {/* TAB 4: HANGAR & APRON MAINTENANCE FACILITIES */}
        <button
          type="button"
          onClick={() => setActiveModule('service')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'service' ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Building className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'FASILITAS' : 'FACILITIES'}</span>
        </button>

        {/* TAB 5: FLIGHT SPECS DATA */}
        <button
          type="button"
          onClick={() => setActiveModule('flight_data')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'flight_data' ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'DATA FLT' : 'FLT DATA'}</span>
        </button>

        {/* TAB 6: AIRWORTHINESS */}
        <button
          type="button"
          onClick={() => setActiveModule('airworthiness')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'airworthiness' ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'KELAIKAN' : 'AIRWORTHY'}</span>
        </button>

        {/* TAB 7: FUEL */}
        <button
          type="button"
          onClick={() => setActiveModule('fuel')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'fuel' ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'AVTUR' : 'FUEL'}</span>
        </button>

        {/* TAB 8: WEAPONS */}
        <button
          type="button"
          onClick={() => setActiveModule('weapons')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'weapons' ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'SENJATA' : 'WEAPONS'}</span>
        </button>
      </div>

      {/* ACTIVE MODULE CONTAINER */}
      <div className="bg-[#0b1019] rounded-2xl border border-white/10 p-3.5 space-y-3">
        
        {/* ============================================================== */}
        {/* MODULE 1: SELECT SQUADRON AIRCRAFT & PROCUREMENT CATALOG       */}
        {/* ============================================================== */}
        {activeModule === 'fleet' && (
          <div className="space-y-3">
            {/* Header & Sub Tabs Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'PILIH PESAWAT SKUADRON' : 'SELECT SQUADRON AIRCRAFT'}</span>
              </span>

              <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10 text-[8px] font-mono">
                <button
                  type="button"
                  onClick={() => setFleetSubTab('my_fleet')}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-bold transition-all",
                    fleetSubTab === 'my_fleet' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  {language === 'id' ? `Armada (${ownedFleet.length})` : `Owned (${ownedFleet.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setFleetSubTab('buy_aircraft')}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1",
                    fleetSubTab === 'buy_aircraft' ? "bg-amber-600 text-white" : "text-amber-400/70 hover:text-amber-300"
                  )}
                >
                  <ShoppingCart className="w-2.5 h-2.5" />
                  <span>{language === 'id' ? 'Beli Pesawat' : 'Buy Aircraft'}</span>
                </button>
              </div>
            </div>

            {/* SUB-VIEW 1: OWNED FLEET LIST */}
            {fleetSubTab === 'my_fleet' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-white/50 px-1">
                  <span>{ownedFleet.length} {language === 'id' ? 'Pesawat Terdaftar di Hanggar' : 'Aircraft Registered in Hangar'}</span>
                  <span>Kapasitas: {ownedFleet.length} / {currentHangar.capacity} Slot</span>
                </div>

                <div className="space-y-2">
                  {ownedFleet.map((item) => {
                    const isSelected = item.aircraft.id === selectedAircraft.id && item.tailNumber === activeHealthTail;
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleSelectAircraft(item)}
                        className={cn(
                          "p-3 rounded-xl border transition-all cursor-pointer bg-black/40 flex items-center justify-between gap-3 active:scale-[0.99]",
                          isSelected
                            ? "border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-950/30"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center border font-mono font-bold text-xs shrink-0",
                            isSelected 
                              ? "bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                              : "bg-white/5 text-white/70 border-white/10"
                          )}>
                            <Plane className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white font-mono">{item.tailNumber}</span>
                              {isSelected ? (
                                <span className="text-[7px] font-mono font-black bg-blue-500 text-white px-1.5 py-0.2 rounded uppercase">
                                  AKTIF DI HANGGAR
                                </span>
                              ) : (
                                <span className="text-[7px] font-mono text-white/40 bg-white/5 px-1.5 py-0.2 rounded uppercase">
                                  STANDBY
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-white/90 font-bold truncate max-w-[180px]">
                              {item.aircraft.name}
                            </p>
                            <span className="text-[7.5px] font-mono text-white/40">
                              {item.aircraft.specs.maxSpeed} • {item.flightHours.toFixed(1)} Jam Terbang
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={cn("text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase block", item.status.color)}>
                            {language === 'id' ? item.status.labelId : item.status.labelEn}
                          </span>
                          <span className="text-[8px] font-mono text-emerald-400 font-bold mt-1 block">
                            Health: {Math.round((item.health.airframe + item.health.engine + item.health.hydraulics + item.health.avionics) / 4)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add new aircraft prompt banner */}
                <div className="p-3 bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-[8.5px] font-mono">
                  <div className="space-y-0.5">
                    <span className="text-amber-300 font-bold block">
                      {language === 'id' ? 'Ingin menambah armada pesawat tempur?' : 'Need more combat aircraft in fleet?'}
                    </span>
                    <span className="text-white/60 text-[7.5px] block">
                      {language === 'id' ? 'Setiap unit include pilot & 11 kru darat pendukung.' : 'Each unit purchase includes pilot & full ground crew.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFleetSubTab('buy_aircraft')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg uppercase tracking-wider text-[8px] transition-all shadow-md active:scale-95 flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{language === 'id' ? 'Beli Pesawat +' : 'Buy Aircraft +'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: PROCUREMENT / STORE CATALOG */}
            {fleetSubTab === 'buy_aircraft' && (
              <div className="space-y-2.5">
                {/* Information Highlight: Include Crew */}
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-[9px] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>NILAI PEMBELIAN SUDAH INCLUDE CREW & DOKUMEN</span>
                  </div>
                  <p className="text-[7.5px] font-mono text-white/70 leading-relaxed">
                    Setiap pembelian 1 unit pesawat tempur sudah mencakup: <strong>1 Pesawat Baru + 2 Penerbang (Pilot & WSO) + 9 Kru Darat (Teknisi, Avtur, GPU Listrik) + Sertifikasi DISLAMBAU</strong>.
                  </p>
                </div>

                {/* Aircraft Catalog Grid */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                  {AIRCRAFT_PROCUREMENT_CATALOG.map((catItem) => {
                    const preset = AIRCRAFT_PRESETS.find(p => p.id === catItem.presetId);
                    if (!preset) return null;
                    const canAfford = budget >= catItem.price;

                    return (
                      <div 
                        key={catItem.presetId}
                        className="p-3 bg-black/60 border border-white/10 hover:border-amber-500/40 rounded-xl space-y-2 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                              <Plane className="w-5 h-5" />
                            </div>
                            <div>
                              <h2 className="text-xs font-black text-white font-mono">{preset.name}</h2>
                              <span className="text-[7.5px] font-mono text-amber-300/90 block">
                                {language === 'id' ? catItem.roleId : catItem.roleEn}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-black text-amber-300 font-mono block">
                              {formatCurrency(catItem.price)}
                            </span>
                            <span className="text-[7px] font-mono text-emerald-400">
                              Include +{catItem.includedCrewCount} Crew
                            </span>
                          </div>
                        </div>

                        {/* Specs row */}
                        <div className="grid grid-cols-3 gap-1 text-[7.5px] font-mono bg-white/5 p-1.5 rounded-lg text-white/70">
                          <div>
                            <span className="text-white/40 block">TOP SPEED</span>
                            <span className="text-cyan-300 font-bold">{preset.specs.maxSpeed}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block">CEILING</span>
                            <span className="text-amber-300 font-bold">{preset.specs.ceiling}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block">RANGE</span>
                            <span className="text-emerald-300 font-bold">{preset.specs.range}</span>
                          </div>
                        </div>

                        {/* Buy Button */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[7.5px] font-mono text-white/40">
                            {catItem.recommendedFor}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleBuyAircraft(catItem)}
                            disabled={!canAfford}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow",
                              canAfford 
                                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30" 
                                : "bg-white/10 text-white/30 cursor-not-allowed border border-white/10"
                            )}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>{canAfford ? (language === 'id' ? 'BELI PESAWAT (BUY)' : 'PURCHASE') : (language === 'id' ? 'DANA KURANG' : 'LACK FUNDS')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODULE 2: SQUADRON CREW ROSTER, TRAINING & CAPACITY            */}
        {/* ============================================================== */}
        {activeModule === 'crew_vitals' && (
          <div className="space-y-3">
            {/* Top Crew Header */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'MANAJEMEN PERSONIL & PUSAT DIKLAT' : 'PERSONNEL ROSTER & TRAINING WING'}</span>
              </span>
              <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                TOTAL: {totalSquadronCrew} PERSONIL
              </span>
            </div>

            {/* Crew Sub-tab Switcher (3 Tabs) */}
            <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-[8.5px] font-mono font-bold">
              <button
                type="button"
                onClick={() => setCrewSubTab('roster')}
                className={cn(
                  "py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
                  crewSubTab === 'roster'
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <Users className="w-3 h-3" />
                <span>{language === 'id' ? 'Daftar Personil' : 'Personnel Roster'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCrewSubTab('academy')}
                className={cn(
                  "py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 relative",
                  crewSubTab === 'academy'
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'id' ? 'Wing Diklat' : 'Training Wing'}</span>
                {pendingJobs.some(j => j.type === 'TRAINING') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setCrewSubTab('capacity')}
                className={cn(
                  "py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
                  crewSubTab === 'capacity'
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <Shield className="w-3 h-3 text-emerald-300" />
                <span>{language === 'id' ? 'Kapasitas Riil' : 'Real Ratio'}</span>
              </button>
            </div>

            {/* SUB-TAB 1: ROSTER & RECRUITMENT */}
            {crewSubTab === 'roster' && (
              <div className="space-y-3">
                {/* PILOT SECTION: INDIVIDUAL PROFILES (Click to view dossier & rating) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>{language === 'id' ? 'KORPS PENERBANG TEMPUR (KLIK UNTUK DETAIL & RATING)' : 'COMBAT PILOT CORPS (CLICK FOR DOSSIER)'}</span>
                    </span>
                    <span className="text-[7.5px] font-mono text-white/50">{individualPilots.length} Penerbang Aktif</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {individualPilots.map((pilot) => (
                      <div
                        key={pilot.id}
                        onClick={() => setSelectedDossierPilot(pilot)}
                        className="p-2.5 bg-black/60 hover:bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 rounded-xl cursor-pointer transition-all space-y-2 group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[7.5px] font-mono text-amber-400 font-bold block">
                              {pilot.rank} {pilot.name}
                            </span>
                            <span className="text-[6.5px] font-mono text-white/50">
                              "{pilot.callsign}" • {pilot.flightHours} Jam Terbang
                            </span>
                          </div>

                          <div className="text-right flex flex-col items-end">
                            <span className={cn(
                              "text-[6.5px] font-mono px-1.5 py-0.5 rounded font-bold uppercase",
                              pilot.status === 'READY' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                              pilot.status === 'TRAINING' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse" :
                              "bg-cyan-500/20 text-cyan-300"
                            )}>
                              {pilot.status}
                            </span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <span className="text-[7.5px] text-amber-300 font-bold font-mono">★ {pilot.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[7px] font-mono text-white/60 border-t border-white/10 pt-1">
                          <span className="truncate max-w-[140px] text-cyan-300">{pilot.specialization}</span>
                          <span className="text-amber-400/80 group-hover:text-amber-300 flex items-center gap-0.5">
                            Lihat Dossier →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CREW MEMBERS SECTION: INDIVIDUAL PROFILES (Click to view dossier) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>{language === 'id' ? 'PERSONIL KRU DARAT & TEKNISI (KLIK UNTUK DETAIL)' : 'GROUND CREW & TECHNICIANS'}</span>
                    </span>
                    <span className="text-[7.5px] font-mono text-white/50">{individualCrewMembers.length} Personil Terdata</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {individualCrewMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedDossierCrew(member)}
                        className="p-2.5 bg-black/60 hover:bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 rounded-xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[7.5px] font-mono text-white font-bold block">
                              {member.rank} {member.name}
                            </span>
                            <span className="text-[6.5px] font-mono text-white/50">
                              {member.division} • {member.specialization}
                            </span>
                          </div>

                          <div className="text-right flex flex-col items-end">
                            <span className="text-[7.5px] text-amber-300 font-bold font-mono">
                              ★ {member.rating.toFixed(1)}
                            </span>
                            <span className="text-[6.5px] text-emerald-400 font-mono">
                              Efisiensi {member.efficiencyScore}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[7px] font-mono text-white/40 border-t border-white/10 pt-1">
                          <span className="truncate max-w-[140px] text-white/60">{member.certifications.length} Sertifikasi Militer</span>
                          <span className="text-cyan-400/80 group-hover:text-cyan-300">
                            Buka Detail →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DEPARTMENT BATCH RECRUITMENT CARDS */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[8px] font-mono font-bold text-white/60 uppercase tracking-wider block">
                    {language === 'id' ? 'REKRUTMEN & PENAMBAHAN PERSONIL DIVISI' : 'DEPARTMENT SQUADRON REINFORCEMENT'}
                  </span>

                  <div className="space-y-2">
                    {/* DIVISION 2: GROUND CREW */}
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl space-y-1.5 text-[9px] font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                            <UserCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {crewRoster.groundCrew.nameId}
                            </span>
                            <span className="text-[7px] text-white/50 uppercase">
                              Level {crewRoster.groundCrew.level} • {crewRoster.groundCrew.role}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black text-cyan-300 font-mono">
                          {crewRoster.groundCrew.count} Personil
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <span className="text-[7.5px] text-amber-300 font-bold">
                          Biaya: {formatCurrency(crewRoster.groundCrew.costPerUpgrade)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpgradeCrew('groundCrew')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[8px] font-bold uppercase transition-all flex items-center gap-1 active:scale-95 shadow"
                        >
                          <UserPlus className="w-2.5 h-2.5" />
                          <span>+2 Personil</span>
                        </button>
                      </div>
                    </div>

                    {/* DIVISION 3: TECHNICIANS */}
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl space-y-1.5 text-[9px] font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                            <Wrench className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {crewRoster.technicians.nameId}
                            </span>
                            <span className="text-[7px] text-white/50 uppercase">
                              Level {crewRoster.technicians.level} • {crewRoster.technicians.role}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black text-amber-300 font-mono">
                          {crewRoster.technicians.count} Teknisi
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <span className="text-[7.5px] text-amber-300 font-bold">
                          Biaya: {formatCurrency(crewRoster.technicians.costPerUpgrade)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpgradeCrew('technicians')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[8px] font-bold uppercase transition-all flex items-center gap-1 active:scale-95 shadow"
                        >
                          <UserPlus className="w-2.5 h-2.5" />
                          <span>+2 Teknisi</span>
                        </button>
                      </div>
                    </div>

                    {/* DIVISION 4: FUEL CREW */}
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl space-y-1.5 text-[9px] font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                            <Fuel className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {crewRoster.fuelCrew.nameId}
                            </span>
                            <span className="text-[7px] text-white/50 uppercase">
                              Level {crewRoster.fuelCrew.level} • {crewRoster.fuelCrew.role}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black text-emerald-300 font-mono">
                          {crewRoster.fuelCrew.count} Kru Avtur
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <span className="text-[7.5px] text-amber-300 font-bold">
                          Biaya: {formatCurrency(crewRoster.fuelCrew.costPerUpgrade)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpgradeCrew('fuelCrew')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[8px] font-bold uppercase transition-all flex items-center gap-1 active:scale-95 shadow"
                        >
                          <UserPlus className="w-2.5 h-2.5" />
                          <span>+2 Kru Avtur</span>
                        </button>
                      </div>
                    </div>

                    {/* DIVISION 5: ELECTRIC & ARMAMENT CREW */}
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl space-y-1.5 text-[9px] font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {crewRoster.electricCrew.nameId}
                            </span>
                            <span className="text-[7px] text-white/50 uppercase">
                              Level {crewRoster.electricCrew.level} • {crewRoster.electricCrew.role}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black text-purple-300 font-mono">
                          {crewRoster.electricCrew.count} Spesialis
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <span className="text-[7.5px] text-amber-300 font-bold">
                          Biaya: {formatCurrency(crewRoster.electricCrew.costPerUpgrade)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpgradeCrew('electricCrew')}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[8px] font-bold uppercase transition-all flex items-center gap-1 active:scale-95 shadow"
                        >
                          <UserPlus className="w-2.5 h-2.5" />
                          <span>+2 Spesialis</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: ACADEMY & ADVANCED TRAINING */}
            {crewSubTab === 'academy' && (
              <SquadronTrainingView
                language={language}
                pilots={individualPilots}
                crewMembers={individualCrewMembers}
                budget={budget}
                pendingJobs={pendingJobs}
                onStartTraining={handleStartTraining}
                formatCurrency={formatCurrency}
              />
            )}

            {/* SUB-TAB 3: REAL CAPACITY & HANDLING RATIO */}
            {crewSubTab === 'capacity' && (() => {
              const capAnalysis = calculateSquadronCrewCapacity(crewRoster, ownedFleet.length);
              return (
                <div className="space-y-3 font-mono text-[9px]">
                  {/* Analysis Banner */}
                  <div className="p-3 bg-gradient-to-r from-slate-900 to-black rounded-xl border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {language === 'id' ? 'ANALISIS RASIO KEBUTUHAN RIIL PERSONIL' : 'REAL SQUADRON CREW RATIO ANALYSIS'}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded font-bold text-[8px]",
                        !capAnalysis.isOverburdened && capAnalysis.readinessPercent >= 100
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      )}>
                        {!capAnalysis.isOverburdened && capAnalysis.readinessPercent >= 100 
                          ? (language === 'id' ? 'STATUS: IDEAL' : 'STATUS: OPTIMAL') 
                          : (language === 'id' ? 'STATUS: DEFISIT' : 'STATUS: DEFICIT')}
                      </span>
                    </div>

                    <p className="text-[7.5px] text-white/60 leading-relaxed">
                      {language === 'id'
                        ? `Setiap pesawat tempur modern di pangkalan TNI AU membutuhkan rasio minimum: 2 Penerbang, 4 Kru Darat, 4 Teknisi Pemeliharaan, 2 Kru Bahan Bakar, dan 1 Spesialis Listrik/Avionik agar dapat beroperasi penuh.`
                        : `Every modern combat aircraft requires dedicated ratio: 2 Pilots, 4 Ground crew, 4 Technicians, 2 Fuel crew, 1 Avionics/Electric specialist for 100% sortie turnaround.`}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[8px]">
                      <div className="bg-black/50 p-2 rounded-lg">
                        <span className="text-white/50 block">SKOR KESIAPAN OPERASIONAL</span>
                        <span className="text-sm font-black text-emerald-400">{capAnalysis.readinessPercent}%</span>
                      </div>
                      <div className="bg-black/50 p-2 rounded-lg">
                        <span className="text-white/50 block">TOTAL PERSONIL TERPENUHI</span>
                        <span className="text-sm font-black text-cyan-300">{capAnalysis.currentTotalPersonnel} / {capAnalysis.requiredTotalPersonnel} Kru</span>
                      </div>
                    </div>
                  </div>

                  {/* Ratio Breakdown Table */}
                  <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2">
                    <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider block">
                      {language === 'id' ? 'RINCIAN KEBUTUHAN PER DIVISI' : 'DEPARTMENT RATIO BREAKDOWN'}
                    </span>

                    <div className="space-y-1.5 text-[8px]">
                      <div className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/5">
                        <span>Korps Penerbang (Flight Crew)</span>
                        <span className="font-bold text-amber-300">{crewRoster.flightCrew.count} / {ownedFleet.length * 2} Pilot</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/5">
                        <span>Kru Darat (Ground Crew)</span>
                        <span className={crewRoster.groundCrew.count >= ownedFleet.length * 4 ? "text-emerald-300 font-bold" : "text-red-300 font-bold"}>
                          {crewRoster.groundCrew.count} / {ownedFleet.length * 4} Kru
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/5">
                        <span>Teknisi Pemeliharaan (Skatek)</span>
                        <span className={crewRoster.technicians.count >= ownedFleet.length * 4 ? "text-emerald-300 font-bold" : "text-red-300 font-bold"}>
                          {crewRoster.technicians.count} / {ownedFleet.length * 4} Teknisi
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/5">
                        <span>Kru Pengisian Avtur (Fuel Crew)</span>
                        <span className={crewRoster.fuelCrew.count >= ownedFleet.length * 2 ? "text-emerald-300 font-bold" : "text-red-300 font-bold"}>
                          {crewRoster.fuelCrew.count} / {ownedFleet.length * 2} Kru
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/5">
                        <span>Spesialis Listrik & Avionik</span>
                        <span className={crewRoster.electricCrew.count >= ownedFleet.length * 1 ? "text-emerald-300 font-bold" : "text-red-300 font-bold"}>
                          {crewRoster.electricCrew.count} / {ownedFleet.length * 1} Spesialis
                        </span>
                      </div>
                    </div>

                    {capAnalysis.bottlenecks.length > 0 && (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[7.5px] text-amber-200">
                        <span className="font-bold block mb-0.5">⚠️ Divisi yang Membutuhkan Rekrutmen Tambahan:</span>
                        <span>{capAnalysis.bottlenecks.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODULE 3: AIRCRAFT SYSTEM HEALTH (PER TAIL NUMBER STATUS)      */}
        {/* ============================================================== */}
        {activeModule === 'condition' && (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'KONDISI KESEHATAN SISTEM PESAWAT' : 'AIRCRAFT SYSTEM HEALTH'}</span>
              </span>
              <span className="text-[8px] font-mono text-white/50">
                {ownedFleet.length} {language === 'id' ? 'Pesawat Terpantau' : 'Units Monitored'}
              </span>
            </div>

            {/* TAIL NUMBER SELECTOR TABS */}
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              {ownedFleet.map((ac) => (
                <button
                  key={ac.id}
                  type="button"
                  onClick={() => setActiveHealthTail(ac.tailNumber)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-[9px] font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                    ac.tailNumber === activeHealthTail
                      ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30"
                      : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                  )}
                >
                  <Plane className="w-3 h-3" />
                  <span>{ac.tailNumber}</span>
                  <span className="text-[7.5px] opacity-75">({ac.aircraft.name.split(' ')[0]})</span>
                </button>
              ))}
            </div>

            {/* SELECTED AIRCRAFT HEALTH DASHBOARD */}
            {activeConditionAircraft && (
              <div className="space-y-2.5 text-[9px] font-mono">
                {/* Aircraft Summary Header */}
                <div className="p-2.5 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white font-mono">{activeConditionAircraft.tailNumber}</span>
                    <span className="text-[9px] text-white/70 font-bold block">{activeConditionAircraft.aircraft.name}</span>
                    <span className="text-[7.5px] text-white/40">Total Jam Terbang: {activeConditionAircraft.flightHours.toFixed(1)} Hours</span>
                  </div>

                  <div className="text-right">
                    <span className={cn("text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase inline-block", activeConditionAircraft.status.color)}>
                      {language === 'id' ? activeConditionAircraft.status.labelId : activeConditionAircraft.status.labelEn}
                    </span>
                    <span className="text-[8px] font-bold text-emerald-400 block mt-1">
                      Kelaikan: 100% OPERATIONAL
                    </span>
                  </div>
                </div>

                {/* Subsystem Health Progress Bars */}
                <div className="space-y-2">
                  {/* Airframe */}
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Integritas Struktur Badan (Airframe Stress)</span>
                      <span className="text-emerald-400 font-bold">{activeConditionAircraft.health.airframe}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${activeConditionAircraft.health.airframe}%` }} />
                    </div>
                  </div>

                  {/* Engine Turbines */}
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Mesin Turbin Jet (Core Temp 680°C & Afterburner)</span>
                      <span className="text-cyan-400 font-bold">{activeConditionAircraft.health.engine}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${activeConditionAircraft.health.engine}%` }} />
                    </div>
                  </div>

                  {/* Hydraulics */}
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Tekanan Sistem Hidrolik (3,000 PSI Stabil)</span>
                      <span className="text-blue-400 font-bold">{activeConditionAircraft.health.hydraulics}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${activeConditionAircraft.health.hydraulics}%` }} />
                    </div>
                  </div>

                  {/* Avionics & Radar */}
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Avionik Bus & Radar AESA / Pulse-Doppler ECCM</span>
                      <span className="text-indigo-400 font-bold">{activeConditionAircraft.health.avionics}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${activeConditionAircraft.health.avionics}%` }} />
                    </div>
                  </div>
                </div>

                {/* Individual Aircraft Maintenance Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={Boolean(serviceInProgress)}
                    onClick={() => handleServiceAircraft(activeConditionAircraft.tailNumber, 'airframe')}
                    className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-left transition-all text-[8px]"
                  >
                    <span className="font-bold text-white block">Quick Pre-Flight Check</span>
                    <span className="text-white/40 block">Walkaround sensor & ban</span>
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(serviceInProgress)}
                    onClick={() => handleServiceAircraft(activeConditionAircraft.tailNumber, 'all')}
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-left transition-all text-[8px]"
                  >
                    <span className="font-bold text-amber-300 block">Full Overhaul Servis (Rp 15 Jt)</span>
                    <span className="text-amber-200/50 block">Pulihkan 100% semua sistem</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODULE 4: HANGAR MAINTENANCE & APRON UPGRADE FACILITIES        */}
        {/* ============================================================== */}
        {activeModule === 'service' && (
          <div className="space-y-3">
            {/* Header & Sub-Tab Switcher */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Building className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'FASILITAS HANGGAR & APRON SKADRON' : 'HANGAR & APRON FACILITIES'}</span>
              </span>

              {/* Sub-tab Navigation */}
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[8px] font-mono">
                <button
                  type="button"
                  onClick={() => setServiceSubTab('facilities')}
                  className={cn(
                    "px-2 py-1 rounded transition-all font-bold",
                    serviceSubTab === 'facilities' ? "bg-blue-600 text-white shadow" : "text-white/50 hover:text-white"
                  )}
                >
                  {language === 'id' ? 'Fasilitas Pangkalan' : 'Facilities'}
                </button>

                <button
                  type="button"
                  onClick={() => setServiceSubTab('gen_upgrade')}
                  className={cn(
                    "px-2 py-1 rounded transition-all font-bold flex items-center gap-1",
                    serviceSubTab === 'gen_upgrade' ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow" : "text-amber-300/80 hover:text-amber-200"
                  )}
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                  <span>{language === 'id' ? 'Upgrade Generasi' : 'Gen Upgrades'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceSubTab('diagnostics')}
                  className={cn(
                    "px-2 py-1 rounded transition-all font-bold",
                    serviceSubTab === 'diagnostics' ? "bg-blue-600 text-white shadow" : "text-white/50 hover:text-white"
                  )}
                >
                  {language === 'id' ? 'Diagnostik' : 'Diagnostics'}
                </button>
              </div>
            </div>

            {/* SUBTAB 1: HANGAR & APRON LEVEL UPGRADES */}
            {serviceSubTab === 'facilities' && (
              <div className="space-y-3">
                {/* FACILITY 1: FASILITAS HANGGAR PERAWATAN */}
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white font-mono block">
                          {currentHangar.titleId}
                        </span>
                        <span className="text-[7.5px] font-mono text-blue-300">
                          Kapasitas Hanggar: {ownedFleet.length} / {currentHangar.capacity} Pesawat Tempur
                        </span>
                      </div>
                    </div>

                    <span className="text-[8px] font-mono bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40 font-bold">
                      LEVEL {currentHangar.level}
                    </span>
                  </div>

                  <p className="text-[8px] font-mono text-white/70">
                    {currentHangar.descriptionId}
                  </p>

                  {/* Features list */}
                  <div className="grid grid-cols-2 gap-1.5 text-[7.5px] font-mono bg-white/5 p-2 rounded-xl">
                    {currentHangar.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-white/80">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Upgrade Button */}
                  {nextHangar ? (
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <div>
                        <span className="text-[7.5px] font-mono text-white/40 block">UPGRADE KE LEVEL {nextHangar.level} ({nextHangar.capacity} PESAWAT)</span>
                        <span className="text-xs font-black text-amber-300 font-mono">
                          {formatCurrency(currentHangar.upgradeCost)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleUpgradeHangar}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[8.5px] font-mono font-bold uppercase transition-all shadow-lg shadow-blue-600/30 active:scale-95 flex items-center gap-1.5"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>UPGRADE HANGGAR</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-[8px] font-mono text-emerald-300 font-bold">
                      HANGGAR TELAH MENCAPAI LEVEL MAKSIMUM (MAX LEVEL 4)
                    </div>
                  )}
                </div>

                {/* FACILITY 2: FASILITAS AIRCRAFT APRON / TARMAC */}
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-xl">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white font-mono block">
                          {currentApron.titleId}
                        </span>
                        <span className="text-[7.5px] font-mono text-amber-300">
                          Kapasitas Hardstand: {ownedFleet.length} / {currentApron.capacity} Pesawat Tempur
                        </span>
                      </div>
                    </div>

                    <span className="text-[8px] font-mono bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                      LEVEL {currentApron.level}
                    </span>
                  </div>

                  <p className="text-[8px] font-mono text-white/70">
                    {currentApron.descriptionId}
                  </p>

                  {/* Features list */}
                  <div className="grid grid-cols-2 gap-1.5 text-[7.5px] font-mono bg-white/5 p-2 rounded-xl">
                    {currentApron.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-white/80">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Upgrade Button */}
                  {nextApron ? (
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <div>
                        <span className="text-[7.5px] font-mono text-white/40 block">UPGRADE KE LEVEL {nextApron.level} ({nextApron.capacity} PESAWAT)</span>
                        <span className="text-xs font-black text-amber-300 font-mono">
                          {formatCurrency(currentApron.upgradeCost)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleUpgradeApron}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[8.5px] font-mono font-bold uppercase transition-all shadow-lg shadow-amber-600/30 active:scale-95 flex items-center gap-1.5"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>UPGRADE APRON</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-[8px] font-mono text-emerald-300 font-bold">
                      APRON TELAH MENCAPAI LEVEL MAKSIMUM (MAX LEVEL 4)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 2: AIRCRAFT GENERATION MODERNIZATION UPGRADE */}
            {serviceSubTab === 'gen_upgrade' && (
              <SquadronGenUpgradeView
                language={language}
                playerProfile={playerProfile}
                activeAircraft={activeConditionAircraft}
                currentHangar={currentHangar}
                budget={budget}
                setBudget={setBudget}
                onUpgradeAircraft={handleUpgradeAircraftGeneration}
                formatCurrency={formatCurrency}
                setTransactionFeedback={setTransactionFeedback}
                speak={speak}
              />
            )}

            {/* SUBTAB 3: DIAGNOSTIC WORKSHOP */}
            {serviceSubTab === 'diagnostics' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider block">
                    DIAGNOSTIK WORKSHOP CEPAT
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={Boolean(serviceInProgress)}
                      onClick={() => handleServiceAircraft(activeHealthTail, 'engine')}
                      className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 rounded-xl text-left transition-all text-[8px] font-mono"
                    >
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-0.5">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Engine Spool Test</span>
                      </div>
                      <span className="text-white/40 text-[7px]">Uji kompresi turbin 680°C</span>
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(serviceInProgress)}
                      onClick={() => handleServiceAircraft(activeHealthTail, 'avionics')}
                      className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 rounded-xl text-left transition-all text-[8px] font-mono"
                    >
                      <div className="flex items-center gap-1.5 text-indigo-300 font-bold mb-0.5">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Radar & IFF Crypto</span>
                      </div>
                      <span className="text-white/40 text-[7px]">Kalibrasi ECCM & Jammer</span>
                    </button>
                  </div>
                </div>

                {/* Service result notification */}
                {serviceMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-[8.5px] font-mono text-emerald-300 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{serviceMessage}</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODULE 5: FLIGHT PERFORMANCE DATA                              */}
        {/* ============================================================== */}
        {activeModule === 'flight_data' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'DATA PERFORMA PENERBANGAN' : 'FLIGHT PERFORMANCE SPECS'}</span>
              </span>
              <span className="text-[8px] font-mono font-bold text-white bg-blue-600/30 px-2 py-0.5 rounded border border-blue-500/40">
                {selectedAircraft.type.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[7.5px] uppercase">KECEPATAN MAKSIMUM</span>
                <p className="text-xs font-bold text-cyan-300">{selectedAircraft.specs.maxSpeed || 'Mach 2.0'}</p>
                <span className="text-[7.5px] text-white/30">Supercruise / Afterburner</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[7.5px] uppercase">KECEPATAN JELAJAH</span>
                <p className="text-xs font-bold text-emerald-300">{selectedAircraft.cruiseSpeed} KTS</p>
                <span className="text-[7.5px] text-white/30">Optimal Cruise Altitude</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[7.5px] uppercase">SERVICE CEILING</span>
                <p className="text-xs font-bold text-amber-300">{selectedAircraft.specs.ceiling || '50,000 FT'}</p>
                <span className="text-[7.5px] text-white/30">Maximum Altitude Limit</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[7.5px] uppercase">JANGKAUAN / RANGE</span>
                <p className="text-xs font-bold text-blue-300">{selectedAircraft.specs.range || '2,620 NM'}</p>
                <span className="text-[7.5px] text-white/30">Ferry Range Capability</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[7.5px] uppercase">PROPULSI & MESIN</span>
                <p className="text-[9px] font-bold text-white truncate">{selectedAircraft.specs.engine || 'Turbofan Engine'}</p>
                <span className="text-[7.5px] text-white/30">High Bypass Afterburning</span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[7.5px] uppercase">G-LIMITS TOLERANSI</span>
                <p className="text-xs font-bold text-purple-300">+9.0G / -3.0G</p>
                <span className="text-[7.5px] text-white/30">Fly-by-Wire Flight Control</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODULE 6: AIRWORTHINESS & CERTIFICATION                        */}
        {/* ============================================================== */}
        {activeModule === 'airworthiness' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'KELAYAKAN & SERTIFIKASI MILITER' : 'AIRWORTHINESS & LOG'}</span>
              </span>
              <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                LAIK UDARA
              </span>
            </div>

            <div className="space-y-2 text-[9px] font-mono">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>SERTIFIKAT KELAIKAN UDARA MILITER TNI-AU AKTIF</span>
                </div>
                <p className="text-[8px] text-white/60">
                  Diverifikasi oleh Dinas Kelaikan Udara dan Materiel TNI Angkatan Udara (DISLAMBAU).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-white/40 text-[7.5px] uppercase block">SIKLUS INSPEKSI 100 JAM</span>
                  <span className="text-xs font-bold text-white">48.5 Jam Tersisa</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-white/40 text-[7.5px] uppercase block">MTBF ESTIMATION</span>
                  <span className="text-xs font-bold text-blue-400">120 Flight Hours</span>
                </div>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-white/40 text-[7.5px] uppercase block">STATUS IFF & TRANSPONDER</span>
                <div className="flex items-center justify-between">
                  <span className="text-white">IFF Mode 4/5 Crypto Key</span>
                  <span className="text-emerald-400 font-bold">VALID & LOADED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODULE 7: FUEL MANAGEMENT (AVTUR)                             */}
        {/* ============================================================== */}
        {activeModule === 'fuel' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'MANAJEMEN BAHAN BAKAR (AVTUR)' : 'FUEL MANAGEMENT'}</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {Math.round((selectedAircraft.maxFuel * fuelPercentage) / 100)} LBS
              </span>
            </div>

            <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-white/60">Tingkat Pengisian Tangki Internal</span>
                  <span className="text-amber-300 font-bold">{fuelPercentage}%</span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="100"
                  value={fuelPercentage}
                  onChange={(e) => handleApplyFuel(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Quick Fuel Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyFuel(100)}
                  className="py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-[8.5px] font-bold uppercase transition-all"
                >
                  FULL (100%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFuel(80)}
                  className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-[8.5px] font-bold uppercase transition-all"
                >
                  SORTIE (80%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFuel(50)}
                  className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-[8.5px] font-bold uppercase transition-all"
                >
                  LIGHT (50%)
                </button>
              </div>

              {/* External Fuel Tanks toggle */}
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between text-[9px] font-mono">
                <div>
                  <span className="text-white font-bold block">Tangki Eksternal (Drop Tanks)</span>
                  <span className="text-[7.5px] text-white/40">+300 Galon Bahan Bakar Tambahan</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseExternalTanks(!useExternalTanks)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[8px] font-bold uppercase transition-all border",
                    useExternalTanks ? "bg-emerald-600 border-emerald-400 text-white" : "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  {useExternalTanks ? 'TERPASANG' : 'OFF'}
                </button>
              </div>

              {/* Endurance */}
              <div className="flex items-center justify-between text-[8.5px] font-mono text-white/50 pt-1">
                <span>ESTIMASI ENDURANCE:</span>
                <span className="text-white font-bold">~ 2 Jam 45 Menit (Cruise)</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODULE 8: WEAPONRY & HARDPOINTS LOADOUT                        */}
        {/* ============================================================== */}
        {activeModule === 'weapons' && (
          <SquadronWeaponsView
            language={language}
            selectedAircraft={selectedAircraft}
            budget={budget}
            setBudget={setBudget}
            unlockedWeaponIds={unlockedWeaponIds}
            setUnlockedWeaponIds={setUnlockedWeaponIds}
            hardpoints={hardpoints}
            setHardpoints={setHardpoints}
            setTransactionFeedback={setTransactionFeedback}
            speak={speak}
            formatCurrency={formatCurrency}
            onApplyLoadoutToSim={() => {
              if (setInitialFuel) {
                let bonus = 0;
                if (hardpoints.inboard === 'tank_300gal') bonus += 2000;
                if (hardpoints.inboard === 'tank_370gal') bonus += 2500;
                if (hardpoints.inboard === 'tank_600gal') bonus += 4000;
                if (hardpoints.conformal === 'tank_cft_450') bonus += 3000;
                setInitialFuel(selectedAircraft.maxFuel + bonus);
              }
            }}
          />
        )}
      </div>
      </>
      )}

      {/* INDIVIDUAL CREW & PILOT DOSSIER MODAL */}
      <CrewDetailModal
        isOpen={Boolean(selectedDossierPilot || selectedDossierCrew)}
        onClose={() => {
          setSelectedDossierPilot(null);
          setSelectedDossierCrew(null);
        }}
        language={language}
        pilot={selectedDossierPilot}
        crewMember={selectedDossierCrew}
        formatCurrency={formatCurrency}
        onStartTrainingCourse={(candidateId, isPilot, courseId) => {
          handleStartTraining(candidateId, isPilot, courseId);
          setSelectedDossierPilot(null);
          setSelectedDossierCrew(null);
        }}
      />

      {/* 6-STEP SQUADRON COMMISSIONING PIPELINE MODAL */}
      <SquadronCommissioningPipelineModal
        isOpen={commissioningModalSquadron !== null}
        onClose={() => setCommissioningModalSquadron(null)}
        language={language}
        targetSquadron={commissioningModalSquadron}
        currentBudget={budget}
        playerRankIndex={getRankLevel(playerProfile?.rank)}
        playerRankName={playerProfile?.rank || 'Mayor Pnb'}
        formatCurrency={formatCurrency}
        onCommissionStep={(stepNumber, stepCost, durationSeconds, stepName) => {
          setBudget(prev => Math.max(0, prev - stepCost));
          if (speak) {
            speak(
              language === 'id'
                ? `Tahap ${stepNumber}: ${stepName} mulai dikerjakan.`
                : `Stage ${stepNumber}: ${stepName} in execution.`
            );
          }
        }}
        onCompleteCommissioning={(squadron) => {
          if (!unlockedSquadronIds.includes(squadron.id)) {
            setUnlockedSquadronIds(prev => [...prev, squadron.id]);
          }
          handleSelectSquadron(squadron);
          setCommissioningModalSquadron(null);
          const successMsg = language === 'id'
            ? `Selamat! Pipeline Pembangunan & Otorisasi ${squadron.name} Berhasil Diselesaikan Secara Paripurna!`
            : `Congratulations! Commissioning pipeline for ${squadron.name} successfully finalized!`;
          setTransactionFeedback(successMsg);
          if (speak) {
            speak(
              language === 'id'
                ? `Pangkalan skuadron ${squadron.name} resmi diresmikan dan siap bertugas mempertahankan kedaulatan dirgantara.`
                : `Squadron base successfully commissioned and ready for active air defense.`
            );
          }
        }}
      />
    </motion.div>
  );
};
