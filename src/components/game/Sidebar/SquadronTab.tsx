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
  UserPlus
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Aircraft, Crew, PlayerProfile, OwnedAircraft, SquadronCrewRoster, FacilityState } from '../../../types';
import { SQUADRON_DATA, AIRCRAFT_PRESETS } from '../../../constants';
import { MilitaryAirport } from '../../../airports';
import { 
  INITIAL_SQUADRON_BUDGET, 
  HANGAR_LEVELS, 
  APRON_LEVELS, 
  AIRCRAFT_PROCUREMENT_CATALOG, 
  generateTailNumber, 
  createDefaultOwnedAircraft, 
  createDefaultCrewRoster 
} from '../../../data/squadronState';

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

  // 1. Resolve User's Squadron from Profile
  const currentSquadronName = useMemo(() => {
    if (playerProfile?.squadron) return playerProfile.squadron;
    const matchedSq = SQUADRON_DATA.find(sq => sq.aircraftIds.includes(selectedAircraft.id));
    return matchedSq?.name || 'Skadron Udara 3';
  }, [playerProfile, selectedAircraft]);

  const squadronData = useMemo(() => {
    return SQUADRON_DATA.find(sq => sq.name === currentSquadronName) || SQUADRON_DATA[0];
  }, [currentSquadronName]);

  const squadronMeta = useMemo(() => {
    return SQUADRON_DETAILS[currentSquadronName] || {
      nickname: 'Garuda Fighter',
      mottoId: 'Swa Bhuwana Paksa',
      mottoEn: 'Wings of the Nation',
      callsignPrefix: 'GARUDA',
      established: '1951',
      specialtyId: 'Operasi Pertahanan Udara Taktis',
      specialtyEn: 'Tactical Air Defense Operations',
      crestColor: 'from-blue-600 to-slate-900',
      accentBorder: 'border-blue-500/40',
      role: 'Tactical Squadron'
    };
  }, [currentSquadronName]);

  // ==========================================
  // PERSISTENT SQUADRON STATE (LocalStorage)
  // ==========================================
  const storageKey = useMemo(() => `ais_sq_state_${currentSquadronName}`, [currentSquadronName]);

  // 1. Budget / Dana Skuadron
  const [budget, setBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_budget`);
      if (saved) return Number(saved);
    } catch (e) {}
    return INITIAL_SQUADRON_BUDGET;
  });

  // 2. Owned Aircraft List (Default starts with 1 aircraft)
  const [ownedFleet, setOwnedFleet] = useState<OwnedAircraft[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_owned_fleet`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    // Default 1 aircraft
    return [createDefaultOwnedAircraft(selectedAircraft, currentSquadronName)];
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
    return createDefaultCrewRoster(playerProfile?.commanderName || 'Mayor Adhiatma', crew.callSign || 'LEADER-01');
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

  // Sync state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_budget`, String(budget));
      localStorage.setItem(`${storageKey}_owned_fleet`, JSON.stringify(ownedFleet));
      localStorage.setItem(`${storageKey}_crew_roster`, JSON.stringify(crewRoster));
      localStorage.setItem(`${storageKey}_hangar_level`, String(hangarLevelIndex));
      localStorage.setItem(`${storageKey}_apron_level`, String(apronLevelIndex));
    } catch (e) {}
  }, [storageKey, budget, ownedFleet, crewRoster, hangarLevelIndex, apronLevelIndex]);

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

  // 1. BUY AIRCRAFT (Includes full crew and tail number registration)
  const handleBuyAircraft = (catalogItem: typeof AIRCRAFT_PROCUREMENT_CATALOG[0]) => {
    const preset = AIRCRAFT_PRESETS.find(p => p.id === catalogItem.presetId);
    if (!preset) return;

    // Check capacity: Hangar or Apron limit
    const maxCapacity = Math.max(currentHangar.capacity, currentApron.capacity);
    if (ownedFleet.length >= maxCapacity) {
      const msg = language === 'id'
        ? `Kapasitas Hanggar & Apron Penuh (${ownedFleet.length}/${maxCapacity} Pesawat). Silakan upgrade fasilitas Hanggar / Apron terlebih dahulu!`
        : `Hangar & Apron Capacity Full (${ownedFleet.length}/${maxCapacity} Aircraft). Please upgrade Hangar / Apron facilities first!`;
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

    // Process purchase
    setBudget(prev => prev - catalogItem.price);

    const newTailNumber = generateTailNumber(preset, ownedFleet.length, currentSquadronName);
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

    setOwnedFleet(prev => [...prev, newOwnedUnit]);

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
      ? `Pembelian ${preset.name} (${newTailNumber}) BERHASIL! Paket lengkap +${catalogItem.includedCrewCount} Personil Kru telah ditugaskan ke skuadron.`
      : `Procurement of ${preset.name} (${newTailNumber}) SUCCESSFUL! Package with +${catalogItem.includedCrewCount} Crew onboarded to squadron.`;

    setTransactionFeedback(successMsg);
    setFleetSubTab('my_fleet');
    setActiveHealthTail(newTailNumber);

    if (speak) {
      speak(
        language === 'id'
          ? `Pembelian pesawat tempur ${preset.name} nomor ekor ${newTailNumber} berhasil. Seluruh personil kru darat pendukung telah tiba di pangkalan.`
          : `Procurement of aircraft ${preset.name} tail ${newTailNumber} completed with dedicated support aircrews and ground teams.`
      );
    }
  };

  // 2. UPGRADE CREW DEPARTMENT
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

    setCrewRoster(prev => ({
      ...prev,
      [departmentKey]: {
        ...prev[departmentKey],
        count: prev[departmentKey].count + 2,
        level: Math.min(prev[departmentKey].level + 1, 5)
      }
    }));

    const msg = language === 'id'
      ? `Penambahan +2 Personil & Upgrade Sertifikasi ${dept.nameId} BERHASIL!`
      : `Addition of +2 Personnel & Certification Upgrade for ${dept.nameEn} SUCCESSFUL!`;

    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Kru ${dept.nameId} berhasil ditambah dua personil. Kapabilitas dukungan pangkalan meningkat.`
          : `Crew ${dept.nameEn} upgraded with additional personnel and enhanced qualifications.`
      );
    }
  };

  // 3. UPGRADE HANGAR FACILITY
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
    setHangarLevelIndex(prev => prev + 1);

    const msg = language === 'id'
      ? `UPGRADE HANGGAR BERHASIL! Kapasitas bertambah menjadi ${nextHangar.capacity} Pesawat Tempur.`
      : `HANGAR UPGRADE COMPLETE! Capacity expanded to ${nextHangar.capacity} Combat Aircraft.`;

    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Fasilitas hanggar skuadron berhasil diperluas. Kapasitas kini mampu menampung ${nextHangar.capacity} pesawat tempur.`
          : `Squadron hangar bay successfully expanded to accommodate ${nextHangar.capacity} combat aircraft.`
      );
    }
  };

  // 4. UPGRADE APRON FACILITY
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
    setApronLevelIndex(prev => prev + 1);

    const msg = language === 'id'
      ? `PERLUASAN APRON BERHASIL! Kapasitas hardstand bertambah menjadi ${nextApron.capacity} Pesawat Tempur.`
      : `APRON EXPANSION COMPLETE! Tarmac hardstand capacity expanded to ${nextApron.capacity} Combat Aircraft.`;

    setTransactionFeedback(msg);

    if (speak) {
      speak(
        language === 'id'
          ? `Perluasan apron tarmac berhasil diselesaikan. Daya tampung kini mencapai ${nextApron.capacity} pesawat siap siaga.`
          : `Apron tarmac facility expansion completed with capacity for ${nextApron.capacity} alert aircraft.`
      );
    }
  };

  // 5. GRANT EXTRA BUDGET (For test and sandbox enjoyment)
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
        {/* MODULE 2: SQUADRON CREW ROSTER & GROUND SUPPORT UPGRADES       */}
        {/* ============================================================== */}
        {activeModule === 'crew_vitals' && (
          <div className="space-y-3">
            {/* Top Crew Header */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'MANAJEMEN KRU & TIM DARAT SKUADRON' : 'SQUADRON CREW & GROUND SUPPORT'}</span>
              </span>
              <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                TOTAL: {totalSquadronCrew} PERSONIL
              </span>
            </div>

            {/* Explanation Note */}
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[7.5px] font-mono text-blue-200 leading-relaxed">
              {language === 'id' 
                ? 'Total personil kru disesuaikan dengan jumlah pesawat aktif (default 1 unit = 13 kru pendukung). Anda dapat merekrut dan meng-upgrade personil kru per divisi dengan membayar sejumlah dana anggaran.'
                : 'Total squadron crew is calibrated to fleet size (default 1 unit = 13 crew personnel). You can recruit and upgrade department personnel using squadron budget.'}
            </div>

            <div className="space-y-2.5 text-[9px] font-mono">
              
              {/* DIVISION 1: PILOT & FLIGHT CREW */}
              <div className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {playerProfile?.rank || 'Mayor'} {playerProfile?.commanderName || 'Adhiatma'}
                      </span>
                      <span className="text-[7.5px] text-amber-300 uppercase">
                        PILOT IN COMMAND (PIC) • {crew.callSign || 'DRAGON-01'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[7.5px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    FIT TO FLY (100%)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[7.5px] text-center">
                  <div className="bg-black/50 p-1.5 rounded">
                    <span className="text-white/40 block">STAMINA</span>
                    <span className="text-emerald-400 font-bold">98%</span>
                  </div>
                  <div className="bg-black/50 p-1.5 rounded">
                    <span className="text-white/40 block">G-TOLERANCE</span>
                    <span className="text-cyan-400 font-bold">9.0G CERT</span>
                  </div>
                  <div className="bg-black/50 p-1.5 rounded">
                    <span className="text-white/40 block">FLIGHT CREW</span>
                    <span className="text-blue-300 font-bold">{crewRoster.flightCrew.count} Penerbang</span>
                  </div>
                </div>
              </div>

              {/* DIVISION 2: GROUND CREW (MARSHALLER & LINE HANDLING) */}
              <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {crewRoster.groundCrew.nameId}
                      </span>
                      <span className="text-[7.5px] text-white/50 uppercase">
                        LEVEL {crewRoster.groundCrew.level} • {crewRoster.groundCrew.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-cyan-300 font-mono">
                      {crewRoster.groundCrew.count} Personil
                    </span>
                  </div>
                </div>

                <p className="text-[7.5px] text-white/60 leading-tight">
                  {crewRoster.groundCrew.descriptionId}
                </p>

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
                    <span>+2 Kru Darat</span>
                  </button>
                </div>
              </div>

              {/* DIVISION 3: TECHNICIAN CREW (SKATEK MESIN & STRUKTUR) */}
              <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {crewRoster.technicians.nameId}
                      </span>
                      <span className="text-[7.5px] text-white/50 uppercase">
                        LEVEL {crewRoster.technicians.level} • {crewRoster.technicians.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-amber-300 font-mono">
                      {crewRoster.technicians.count} Teknisi
                    </span>
                  </div>
                </div>

                <p className="text-[7.5px] text-white/60 leading-tight">
                  {crewRoster.technicians.descriptionId}
                </p>

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

              {/* DIVISION 4: FUEL CREW (PENGISIAN AVTUR) */}
              <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {crewRoster.fuelCrew.nameId}
                      </span>
                      <span className="text-[7.5px] text-white/50 uppercase">
                        LEVEL {crewRoster.fuelCrew.level} • {crewRoster.fuelCrew.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-300 font-mono">
                      {crewRoster.fuelCrew.count} Kru Avtur
                    </span>
                  </div>
                </div>

                <p className="text-[7.5px] text-white/60 leading-tight">
                  {crewRoster.fuelCrew.descriptionId}
                </p>

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

              {/* DIVISION 5: ELECTRIC & ARMAMENT CREW (GPU & SENJATA) */}
              <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {crewRoster.electricCrew.nameId}
                      </span>
                      <span className="text-[7.5px] text-white/50 uppercase">
                        LEVEL {crewRoster.electricCrew.level} • {crewRoster.electricCrew.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-purple-300 font-mono">
                      {crewRoster.electricCrew.count} Spesialis
                    </span>
                  </div>
                </div>

                <p className="text-[7.5px] text-white/60 leading-tight">
                  {crewRoster.electricCrew.descriptionId}
                </p>

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
                    <span>+2 Kru Listrik</span>
                  </button>
                </div>
              </div>
            </div>
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'FASILITAS HANGGAR & AIRCRAFT APRON' : 'HANGAR & APRON FACILITIES'}</span>
              </span>
              <span className="text-[8px] font-mono text-white/40">Skatek 042 / Lanud</span>
            </div>

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

            {/* DIAGNOSTIC WORKSHOP ACTIONS */}
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'PILIHAN SENJATA & HARDPOINTS' : 'WEAPONS & HARDPOINT LOADOUT'}</span>
              </span>
              <span className="text-[8px] font-mono text-white/40">ARMAMENT</span>
            </div>

            {/* Preset Selector */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setWeaponPreset('cap')}
                className={cn(
                  "p-2 rounded-xl border text-left transition-all",
                  weaponPreset === 'cap' ? "bg-blue-600/30 border-blue-500 text-white" : "bg-white/5 border-white/10 text-white/50"
                )}
              >
                <span className="text-[9px] font-bold block">Air Superiority (CAP)</span>
                <span className="text-[7.5px] font-mono text-white/40">4x AIM-120C, 2x AIM-9X</span>
              </button>

              <button
                type="button"
                onClick={() => setWeaponPreset('strike')}
                className={cn(
                  "p-2 rounded-xl border text-left transition-all",
                  weaponPreset === 'strike' ? "bg-blue-600/30 border-blue-500 text-white" : "bg-white/5 border-white/10 text-white/50"
                )}
              >
                <span className="text-[9px] font-bold block">Precision Strike (CAS)</span>
                <span className="text-[7.5px] font-mono text-white/40">2x GBU-12, 2x Maverick</span>
              </button>

              <button
                type="button"
                onClick={() => setWeaponPreset('maritime')}
                className={cn(
                  "p-2 rounded-xl border text-left transition-all",
                  weaponPreset === 'maritime' ? "bg-blue-600/30 border-blue-500 text-white" : "bg-white/5 border-white/10 text-white/50"
                )}
              >
                <span className="text-[9px] font-bold block">Maritime Patrol (MPA)</span>
                <span className="text-[7.5px] font-mono text-white/40">Targeting Pod & Radar</span>
              </button>

              <button
                type="button"
                onClick={() => setWeaponPreset('long_range')}
                className={cn(
                  "p-2 rounded-xl border text-left transition-all",
                  weaponPreset === 'long_range' ? "bg-blue-600/30 border-blue-500 text-white" : "bg-white/5 border-white/10 text-white/50"
                )}
              >
                <span className="text-[9px] font-bold block">Ferry / Long-Range</span>
                <span className="text-[7.5px] font-mono text-white/40">3x External Drop Tanks</span>
              </button>
            </div>

            {/* Hardpoint slots list */}
            <div className="space-y-1.5 text-[9px] font-mono bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-lg">
                <span className="text-white/60">Wingtip Stations (1 & 9):</span>
                <span className="text-cyan-300 font-bold">AIM-9X Sidewinder / R-73</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-lg">
                <span className="text-white/60">Underwing Stations (2, 3, 7, 8):</span>
                <span className="text-emerald-400 font-bold">AIM-120C AMRAAM / R-77</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-lg">
                <span className="text-white/60">Centerline Station (5):</span>
                <span className="text-amber-300 font-bold">Sniper XR Targeting Pod</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-lg">
                <span className="text-white/60">Internal Gun Cannon:</span>
                <span className="text-white font-bold">20mm M61A1 Vulcan (511 Rnds)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
