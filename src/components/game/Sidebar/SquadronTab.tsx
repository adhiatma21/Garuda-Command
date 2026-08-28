import React, { useState, useMemo } from 'react';
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
  Wind
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Aircraft, Crew, PlayerProfile } from '../../../types';
import { SQUADRON_DATA, AIRCRAFT_PRESETS } from '../../../constants';
import { MilitaryAirport } from '../../../airports';

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
  // Main Module Tabs
  const [activeModule, setActiveModule] = useState<
    'fleet' | 'flight_data' | 'condition' | 'airworthiness' | 'crew_vitals' | 'fuel' | 'service' | 'weapons'
  >('fleet');

  // Service Management interactive states
  const [serviceInProgress, setServiceInProgress] = useState<string | null>(null);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);
  const [airframeHealth, setAirframeHealth] = useState(100);
  const [engineHealth, setEngineHealth] = useState(100);
  const [hydraulicHealth, setHydraulicHealth] = useState(100);
  const [avionicsHealth, setAvionicsHealth] = useState(100);

  // Weapon preset state
  const [weaponPreset, setWeaponPreset] = useState<'cap' | 'strike' | 'maritime' | 'long_range'>('cap');

  // Fuel Management custom states
  const [fuelPercentage, setFuelPercentage] = useState<number>(100);
  const [useExternalTanks, setUseExternalTanks] = useState<boolean>(false);

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

  // 2. Generate Fleet of Aircraft in this Squadron
  const squadronFleet = useMemo(() => {
    const aircraftTypes = squadronData.aircraftIds
      .map(id => AIRCRAFT_PRESETS.find(a => a.id === id))
      .filter(Boolean) as Aircraft[];
    
    const baseTypes = aircraftTypes.length > 0 ? aircraftTypes : [selectedAircraft];

    const fleet = [];
    const tailPrefixes = currentSquadronName.includes('3') ? 'TS-16' :
                         currentSquadronName.includes('14') ? 'TS-52' :
                         currentSquadronName.includes('11') ? 'TS-30' :
                         currentSquadronName.includes('15') ? 'TT-50' :
                         currentSquadronName.includes('17') ? 'A-00' :
                         currentSquadronName.includes('31') ? 'A-13' :
                         currentSquadronName.includes('21') ? 'TT-31' : 'TS-10';

    const statuses = [
      { statusId: 'SIAP TEMPUR (COMBAT READY)', statusEn: 'COMBAT READY', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
      { statusId: 'SIAGA 1 (ALERT SCRAMBLE)', statusEn: 'ALERT SCRAMBLE', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
      { statusId: 'STANDBY HANGGAR', statusEn: 'STANDBY HANGAR', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
      { statusId: 'SIAP TEMPUR (COMBAT READY)', statusEn: 'COMBAT READY', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
    ];

    let count = 1;
    for (let i = 0; i < 4; i++) {
      const baseType = baseTypes[i % baseTypes.length];
      const tailNumber = `${tailPrefixes}${String(count).padStart(2, '0')}`;
      const isCurrentActive = selectedAircraft.id === baseType.id;

      fleet.push({
        id: `fleet-${tailNumber}`,
        tailNumber,
        aircraft: baseType,
        isCurrentActive,
        flightHours: 340 + (i * 75),
        status: isCurrentActive 
          ? { statusId: 'PESAWAT AKTIF DIPILIH', statusEn: 'CURRENTLY SELECTED', color: 'text-cyan-300 border-cyan-400 bg-cyan-500/20' }
          : statuses[i % statuses.length]
      });
      count++;
    }

    return fleet;
  }, [squadronData, selectedAircraft, currentSquadronName]);

  // Handler: Select & Deploy Aircraft from Fleet
  const handleSelectAircraft = (targetAircraft: Aircraft, tailNumber: string) => {
    setSelectedAircraft(targetAircraft);
    const maxF = targetAircraft.maxFuel;
    if (setInitialFuel) setInitialFuel(maxF);
    if (setFuelRemaining) setFuelRemaining(maxF);
    if (setTargetSpeed) setTargetSpeed(targetAircraft.cruiseSpeed);
    setFuelPercentage(100);

    if (speak) {
      speak(
        language === 'id' 
          ? `Pesawat ${targetAircraft.name} dengan tail number ${tailNumber} dipilih dan siap diinspeksi di hanggar.`
          : `Aircraft ${targetAircraft.name} tail ${tailNumber} selected and positioned in hangar dock.`
      );
    }
  };

  // Handler: Execute Maintenance / Service Action
  const handleExecuteService = (serviceType: 'preflight' | 'engine' | 'avionics' | 'hydraulics' | 'coating', title: string) => {
    setServiceInProgress(serviceType);
    setServiceMessage(null);

    if (speak) {
      speak(
        language === 'id'
          ? `Melaksanakan prosedur ${title} pada pesawat ${selectedAircraft.name}.`
          : `Executing ${title} on aircraft ${selectedAircraft.name}.`
      );
    }

    setTimeout(() => {
      setServiceInProgress(null);
      if (serviceType === 'preflight') {
        setAirframeHealth(100);
        setServiceMessage(language === 'id' ? 'PRE-FLIGHT WALKAROUND LENGKAP: 100% LOLOS UJI KELAIKAN' : 'PRE-FLIGHT WALKAROUND COMPLETE: 100% AIRWORTHY');
      } else if (serviceType === 'engine') {
        setEngineHealth(100);
        setServiceMessage(language === 'id' ? 'UJI DIAGNOSTIK MESIN TURBIN: EFISIENSI DAYA DORONG 100%' : 'ENGINE TURBINE TEST: 100% THRUST EFFICIENCY');
      } else if (serviceType === 'avionics') {
        setAvionicsHealth(100);
        setServiceMessage(language === 'id' ? 'KALIBRASI RADAR & AVIONIK: ENKRIPSI IFF & ECCM VALID' : 'AVIONICS & RADAR CALIBRATED: IFF & ECCM VALID');
      } else if (serviceType === 'hydraulics') {
        setHydraulicHealth(100);
        setServiceMessage(language === 'id' ? 'BLEEDING SISTEM HIDROLIK: TEKANAN STABIL 3,000 PSI' : 'HYDRAULIC BLEED COMPLETE: 3,000 PSI STABLE');
      } else {
        setAirframeHealth(100);
        setServiceMessage(language === 'id' ? 'PERAWATAN COATING RAM / ANTI-KOROSI SELESAI' : 'RAM / ANTI-CORROSION TREATMENT COMPLETE');
      }
    }, 1600);
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
      className="p-4 space-y-4"
    >
      {/* SQUADRON IDENTITY HERO CARD */}
      <div className={cn(
        "p-4 rounded-2xl bg-gradient-to-br border shadow-xl relative overflow-hidden",
        squadronMeta.crestColor,
        squadronMeta.accentBorder
      )}>
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Shield className="w-28 h-28 text-white" />
        </div>

        <div className="relative z-10 space-y-2.5">
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
              <span className="text-[7px] font-mono text-white/50 uppercase block">LANUD BASE</span>
              <span className="text-[9px] font-mono font-bold text-white">
                {squadronData.location}
              </span>
            </div>
          </div>

          {/* Motto */}
          <div className="pt-1 text-[8.5px] font-mono text-white/70 italic border-t border-white/10 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>"{language === 'id' ? squadronMeta.mottoId : squadronMeta.mottoEn}"</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL MODULE NAVIGATOR BUTTONS */}
      <div className="grid grid-cols-4 gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-[8px] font-mono font-bold">
        <button
          type="button"
          onClick={() => setActiveModule('fleet')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'fleet' ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'ARMADA' : 'FLEET'}</span>
        </button>

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

        <button
          type="button"
          onClick={() => setActiveModule('condition')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'condition' ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'KONDISI' : 'HEALTH'}</span>
        </button>

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

        <button
          type="button"
          onClick={() => setActiveModule('crew_vitals')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'crew_vitals' ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'KRU' : 'CREW'}</span>
        </button>

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

        <button
          type="button"
          onClick={() => setActiveModule('service')}
          className={cn(
            "py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
            activeModule === 'service' ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'SERVIS' : 'SERVICE'}</span>
        </button>

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
        
        {/* MODULE 1: FLEET SELECTOR LIST */}
        {activeModule === 'fleet' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'PILIH PESAWAT SKUADRON' : 'SELECT SQUADRON AIRCRAFT'}</span>
              </span>
              <span className="text-[8px] font-mono text-white/40">
                {squadronFleet.length} {language === 'id' ? 'Pesawat Hanggar' : 'Hangar Units'}
              </span>
            </div>

            <div className="space-y-2">
              {squadronFleet.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleSelectAircraft(item.aircraft, item.tailNumber)}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer bg-black/40 flex items-center justify-between gap-3 active:scale-[0.99]",
                    item.aircraft.id === selectedAircraft.id
                      ? "border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-950/30"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center border font-mono font-bold text-xs",
                      item.aircraft.id === selectedAircraft.id 
                        ? "bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                        : "bg-white/5 text-white/70 border-white/10"
                    )}>
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white font-mono">{item.tailNumber}</span>
                        {item.aircraft.id === selectedAircraft.id && (
                          <span className="text-[7px] font-mono font-black bg-blue-500 text-white px-1.5 py-0.2 rounded uppercase">
                            AKTIF DI HANGGAR
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/80 font-bold truncate max-w-[190px]">
                        {item.aircraft.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={cn("text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase block", item.status.color)}>
                      {language === 'id' ? item.status.statusId : item.status.statusEn}
                    </span>
                    <span className="text-[8px] font-mono text-white/40 mt-1 block">
                      {item.flightHours} Jam Terbang
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-mono text-blue-300 flex items-center justify-between">
              <span>{language === 'id' ? 'Siluet hanggar di sebelah kanan mengikuti pesawat terpilih.' : 'Hangar silhouette on right follows active selection.'}</span>
              <button
                type="button"
                onClick={() => setActiveModule('flight_data')}
                className="text-white font-bold underline hover:text-blue-200"
              >
                {language === 'id' ? 'Lihat Spesifikasi →' : 'View Specs →'}
              </button>
            </div>
          </div>
        )}

        {/* MODULE 2: FLIGHT PERFORMANCE DATA */}
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

        {/* MODULE 3: AIRCRAFT CONDITION & HEALTH */}
        {activeModule === 'condition' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'KONDISI KESEHATAN SISTEM PESAWAT' : 'AIRCRAFT SYSTEM HEALTH'}</span>
              </span>
              <span className="text-[9px] font-mono font-black text-emerald-400">100% OPERATIONAL</span>
            </div>

            <div className="space-y-2 text-[9px] font-mono">
              {/* Airframe structure */}
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Integritas Struktur Badan (Airframe)</span>
                  <span className="text-emerald-400 font-bold">{airframeHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${airframeHealth}%` }} />
                </div>
              </div>

              {/* Turbine Engine */}
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Mesin Turbin Jet (Spool & Core Temp 680°C)</span>
                  <span className="text-emerald-400 font-bold">{engineHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${engineHealth}%` }} />
                </div>
              </div>

              {/* Hydraulics */}
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Tekanan Sistem Hidrolik (3,000 PSI)</span>
                  <span className="text-emerald-400 font-bold">{hydraulicHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${hydraulicHealth}%` }} />
                </div>
              </div>

              {/* Avionics Bus */}
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Avionik & Radar AESA / Pulse-Doppler</span>
                  <span className="text-emerald-400 font-bold">{avionicsHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${avionicsHealth}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: AIRWORTHINESS & CERTIFICATION */}
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

        {/* MODULE 5: CREW COUNT & CREW VITALS */}
        {activeModule === 'crew_vitals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'JUMLAH & KONDISI KRU PENERBANG' : 'CREW VITALS & ROSTER'}</span>
              </span>
              <span className="text-[8px] font-mono text-white/40">
                {selectedAircraft.type === 'fighter' ? '1-2 Aircrew' : '4-6 Aircrew'}
              </span>
            </div>

            <div className="space-y-2 text-[9px] font-mono">
              {/* Pilot In Command */}
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {playerProfile?.rank || 'Mayor'} {playerProfile?.commanderName || 'Adhiatma'}
                      </span>
                      <span className="text-[7.5px] text-amber-300/80 uppercase">
                        PILOT IN COMMAND (PIC) • {crew.callSign || 'LEADER-01'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[7.5px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                    FIT TO FLY
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-[8px] text-center border-t border-white/10">
                  <div className="bg-black/40 p-1 rounded">
                    <span className="text-white/40 block">STAMINA</span>
                    <span className="text-emerald-400 font-bold">98%</span>
                  </div>
                  <div className="bg-black/40 p-1 rounded">
                    <span className="text-white/40 block">G-TOLERANCE</span>
                    <span className="text-cyan-400 font-bold">9.0G CERT</span>
                  </div>
                  <div className="bg-black/40 p-1 rounded">
                    <span className="text-white/40 block">FATIGUE</span>
                    <span className="text-blue-300 font-bold">LOW</span>
                  </div>
                </div>
              </div>

              {/* Copilot / WSO */}
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">{crew.coPilot || 'Mayor Pnb Bima Perkasa'}</span>
                      <span className="text-[7.5px] text-white/40 uppercase">COPILOT / WSO RADAR OPERATOR</span>
                    </div>
                  </div>
                  <span className="text-[7.5px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                    READY
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-[8px] text-center border-t border-white/10">
                  <div className="bg-black/40 p-1 rounded">
                    <span className="text-white/40 block">STAMINA</span>
                    <span className="text-emerald-400 font-bold">96%</span>
                  </div>
                  <div className="bg-black/40 p-1 rounded">
                    <span className="text-white/40 block">G-TOLERANCE</span>
                    <span className="text-cyan-400 font-bold">9.0G CERT</span>
                  </div>
                  <div className="bg-black/40 p-1 rounded">
                    <span className="text-white/40 block">FATIGUE</span>
                    <span className="text-blue-300 font-bold">LOW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 6: FUEL MANAGEMENT */}
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

        {/* MODULE 7: SERVICE MANAGEMENT & DIAGNOSTICS */}
        {activeModule === 'service' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'LAYANAN & PEMELIHARAAN HANGGAR' : 'HANGAR MAINTENANCE'}</span>
              </span>
              <span className="text-[8px] font-mono text-white/40">Skatek 042</span>
            </div>

            <div className="space-y-2">
              {/* Service Action 1 */}
              <button
                type="button"
                disabled={Boolean(serviceInProgress)}
                onClick={() => handleExecuteService('preflight', 'Pre-Flight Walkaround')}
                className="w-full p-2.5 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-left transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Pre-Flight Line Walkaround</span>
                    <span className="text-[7.5px] font-mono text-white/40">Inspeksi pitot static, kontrol kemudi, dan landing gear</span>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-blue-400 font-bold uppercase">JALANKAN →</span>
              </button>

              {/* Service Action 2 */}
              <button
                type="button"
                disabled={Boolean(serviceInProgress)}
                onClick={() => handleExecuteService('engine', 'Engine Spool Diagnostic')}
                className="w-full p-2.5 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-left transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Engine Spool & Afterburner Test</span>
                    <span className="text-[7.5px] font-mono text-white/40">Uji kompresi turbin dan sistem injeksi bahan bakar</span>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-amber-400 font-bold uppercase">UJI →</span>
              </button>

              {/* Service Action 3 */}
              <button
                type="button"
                disabled={Boolean(serviceInProgress)}
                onClick={() => handleExecuteService('avionics', 'Avionics & Radar ECCM')}
                className="w-full p-2.5 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-left transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Avionics & Radar ECCM Calibration</span>
                    <span className="text-[7.5px] font-mono text-white/40">Pembaruan firmware radar & transponder IFF kripto</span>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase">UPDATE →</span>
              </button>

              {/* Service Action 4 */}
              <button
                type="button"
                disabled={Boolean(serviceInProgress)}
                onClick={() => handleExecuteService('hydraulics', 'Hydraulics Bleed Service')}
                className="w-full p-2.5 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-left transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Hydraulic Bleed & Pressure Flush</span>
                    <span className="text-[7.5px] font-mono text-white/40">Stabilisasi tekanan 3,000 PSI pada aktuator sayap</span>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase">SERVIS →</span>
              </button>
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

        {/* MODULE 8: WEAPONRY & HARDPOINTS LOADOUT */}
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
