import { Aircraft, OwnedAircraft, SquadronCrewRoster, FacilityState, PlayerProfile } from '../types';
import { AIRCRAFT_PRESETS, SQUADRON_DATA } from '../constants';

export const INITIAL_SQUADRON_BUDGET = 1500000000; // Rp 1.500.000.000

export const HANGAR_LEVELS: FacilityState[] = [
  {
    level: 1,
    capacity: 2,
    maxLevel: 4,
    upgradeCost: 80000000,
    titleId: 'Hanggar Taktis Standar (Level 1)',
    titleEn: 'Standard Tactical Hangar (Level 1)',
    descriptionId: 'Fasilitas 1 bay perawatan tertutup dengan overhead crane manual dan toolset standar.',
    descriptionEn: 'Single enclosed maintenance bay with manual overhead crane and standard toolsets.',
    features: ['Kapasitas 2 Pesawat', '1x Overhead Crane (5 Ton)', 'Panel Diagnostik Standar', 'Climate Control Dasar']
  },
  {
    level: 2,
    capacity: 4,
    maxLevel: 4,
    upgradeCost: 160000000,
    titleId: 'Hanggar Ganda Diperluas (Level 2)',
    titleEn: 'Expanded Dual Hangar Bay (Level 2)',
    descriptionId: 'Fasilitas 2 bay perawatan komprehensif dengan rig diagnostik digital dan paint shop.',
    descriptionEn: 'Dual-bay maintenance facility with digital diagnostic rigs and climate-controlled paint shop.',
    features: ['Kapasitas 4 Pesawat', 'Automated Diagnostic Rigs', 'Climate-Controlled Paint Shop', 'Speed Servis +25%']
  },
  {
    level: 3,
    capacity: 6,
    maxLevel: 4,
    upgradeCost: 300000000,
    titleId: 'Depot Pemeliharaan Berat (Level 3)',
    titleEn: 'Heavy Maintenance Depot (Level 3)',
    descriptionId: 'Depot pemeliharaan tingkat lanjut dengan engine test cell dan bengkel komposit.',
    descriptionEn: 'Advanced maintenance depot with dedicated jet engine test cell and carbon-composite workshop.',
    features: ['Kapasitas 6 Pesawat', 'Jet Engine Test Cell', 'Full Composite Repair Bay', 'Auto Overhaul Support']
  },
  {
    level: 4,
    capacity: 10,
    maxLevel: 4,
    upgradeCost: 0,
    titleId: 'Kompleks Super Hanggar Strategis (Level 4 - MAX)',
    titleEn: 'Strategic Super Hangar Complex (Level 4 - MAX)',
    descriptionId: 'Kompleks hanggar multi-bay terintegrasi dengan inspeksi robotik dan fasilitas kelaikan penuh.',
    descriptionEn: 'Integrated multi-bay master hangar complex with automated robotic gantry inspections.',
    features: ['Kapasitas 10 Pesawat', 'Robotics Laser Inspection', 'Armored Hardened Shelter', 'Zero-Downtime Turnaround']
  }
];

export const APRON_LEVELS: FacilityState[] = [
  {
    level: 1,
    capacity: 2,
    maxLevel: 4,
    upgradeCost: 60000000,
    titleId: 'Apron Parkir Tarmac Dasar (Level 1)',
    titleEn: 'Standard Apron Hardstand (Level 1)',
    descriptionId: 'Dua hardstand parkir pesawat dengan jalur mobil tangki avtur bergerak.',
    descriptionEn: 'Two standard aircraft hardstands with mobile fuel bowser service lines.',
    features: ['Kapasitas 2 Pesawat', '2x Hardstand Beton Tebal', 'Mobile Fuel Bowser Access', 'Penerangan Tarmac Standar']
  },
  {
    level: 2,
    capacity: 4,
    maxLevel: 4,
    upgradeCost: 120000000,
    titleId: 'Apron Taktis Hydrant (Level 2)',
    titleEn: 'Tactical Hydrant Apron (Level 2)',
    descriptionId: 'Empat hardstand tugas berat dengan sistem pipa bahan bakar bawah tanah (hydrant).',
    descriptionEn: 'Four heavy-duty hardstands with underground fuel hydrant pits and blast deflector fences.',
    features: ['Kapasitas 4 Pesawat', 'Underground Hydrant Fueling', 'Blast Deflector Fences', 'Waktu Refuel -40%']
  },
  {
    level: 3,
    capacity: 6,
    maxLevel: 4,
    upgradeCost: 250000000,
    titleId: 'Apron Scramble Siaga 1 (Level 3)',
    titleEn: 'Alert-1 Rapid Scramble Apron (Level 3)',
    descriptionId: 'Enam hardstand dengan menara lampu LED sorot tinggi dan pad siap sergap 5 menit.',
    descriptionEn: 'Six scramble-ready hardstands with high-mast LED towers and dedicated 5-minute alert pad.',
    features: ['Kapasitas 6 Pesawat', 'High-Mast LED Night Towers', 'Dedicated Scramble Pad', 'Line-up Time -50%']
  },
  {
    level: 4,
    capacity: 10,
    maxLevel: 4,
    upgradeCost: 0,
    titleId: 'Master Strategic Tarmac Complex (Level 4 - MAX)',
    titleEn: 'Master Strategic Tarmac Complex (Level 4 - MAX)',
    descriptionId: 'Kompleks apron strategis berdaya tampung tinggi dengan akses langsung high-speed taxiway.',
    descriptionEn: 'Master strategic tarmac with high-speed taxiway direct access and automated dispatching.',
    features: ['Kapasitas 10 Pesawat', 'High-Speed Taxiway Access', 'Central Ground Power Bus', 'Rapid Fleet Deployment']
  }
];

export const AIRCRAFT_PROCUREMENT_CATALOG = [
  {
    presetId: 'f16-emlu',
    price: 450000000,
    roleId: 'Pesawat Tempur Sergap Supersonik (Air Superiority)',
    roleEn: 'Supersonic Air Superiority Fighter',
    includedCrewCount: 11,
    recommendedFor: 'Skadron Udara 3'
  },
  {
    presetId: 'f16-cd',
    price: 500000000,
    roleId: 'Pesawat Tempur Multi-Role Block 52ID',
    roleEn: 'Multi-Role Combat Fighter Block 52ID',
    includedCrewCount: 11,
    recommendedFor: 'Skadron Udara 14'
  },
  {
    presetId: 'su27',
    price: 650000000,
    roleId: 'Pesawat Tempur Berat Sukhoi Flanker (Heavy Air Superiority)',
    roleEn: 'Heavy Air Superiority Fighter Su-27',
    includedCrewCount: 12,
    recommendedFor: 'Skadron Udara 11'
  },
  {
    presetId: 'su30',
    price: 750000000,
    roleId: 'Pesawat Tempur Berat Dua Awak (Heavy Strike Flanker)',
    roleEn: 'Twin-Seat Heavy Strike Fighter Su-30',
    includedCrewCount: 12,
    recommendedFor: 'Skadron Udara 11'
  },
  {
    presetId: 'rafale',
    price: 950000000,
    roleId: 'Pesawat Tempur Omnirole Generasi 4.5 Dassault Rafale',
    roleEn: 'Omnirole 4.5 Gen Fighter Dassault Rafale',
    includedCrewCount: 11,
    recommendedFor: 'Skadron Udara 12'
  },
  {
    presetId: 'super-tucano',
    price: 250000000,
    roleId: 'Pesawat Tempur Taktis Ringan & Anti-Gerilya (COIN / CAS)',
    roleEn: 'Light Attack & Counter-Insurgency Turboprop',
    includedCrewCount: 9,
    recommendedFor: 'Skadron Udara 21'
  },
  {
    presetId: 't50i',
    price: 350000000,
    roleId: 'Fighter Lead-In Trainer & Tempur Ringan T-50i',
    roleEn: 'Lead-In Fighter Trainer & Light Attack T-50i',
    includedCrewCount: 10,
    recommendedFor: 'Skadron Udara 15'
  },
  {
    presetId: 'c130',
    price: 800000000,
    roleId: 'Pesawat Angkut Berat Taktis C-130J Super Hercules',
    roleEn: 'Heavy Tactical Airlifter C-130J',
    includedCrewCount: 14,
    recommendedFor: 'Skadron Udara 31 / 32'
  },
  {
    presetId: 'cn235',
    price: 380000000,
    roleId: 'Pesawat Angkut Sedang & Patroli Maritim CN-235',
    roleEn: 'Medium Tactical Transport & MPA',
    includedCrewCount: 11,
    recommendedFor: 'Skadron Udara 2 / 5'
  },
  {
    presetId: 'b737-mpm',
    price: 600000000,
    roleId: 'Pesawat Pengintai Maritim & Pengawasan Radar ZEE',
    roleEn: 'Strategic Maritime Patrol & Radar Surveillance',
    includedCrewCount: 14,
    recommendedFor: 'Skadron Udara 5'
  },
  {
    presetId: 'super-puma',
    price: 320000000,
    roleId: 'Helikopter SAR Tempur & Mobilisasi Pasukan NAS-332',
    roleEn: 'Combat SAR & Tactical Rotary Transport',
    includedCrewCount: 10,
    recommendedFor: 'Skadron Udara 6 / 8'
  },
  {
    presetId: 'f35',
    price: 1300000000,
    roleId: 'Pesawat Tempur Siluman Generasi ke-5 F-35 Lightning II',
    roleEn: '5th Generation Stealth Multirole Fighter',
    includedCrewCount: 12,
    recommendedFor: 'Komando Tempur Utama'
  },
  {
    presetId: 'f22',
    price: 1600000000,
    roleId: 'Pesawat Tempur Superioritas Udara Siluman F-22 Raptor',
    roleEn: '5th Gen Air Dominance Stealth Fighter',
    includedCrewCount: 12,
    recommendedFor: 'Komando Tempur Utama'
  },
  {
    presetId: 'su57',
    price: 1450000000,
    roleId: 'Pesawat Tempur Siluman Superioritas Sukhoi Su-57 Felon',
    roleEn: '5th Gen Heavy Stealth Fighter Su-57',
    includedCrewCount: 12,
    recommendedFor: 'Komando Tempur Utama'
  }
];

export function generateTailNumber(aircraft: Aircraft, existingCount: number, squadronName: string): string {
  const acId = aircraft.id.toLowerCase();
  let prefix = 'TS-16';

  if (acId.includes('f16-emlu') || acId.includes('f16-cd') || acId.includes('f16')) {
    prefix = squadronName.includes('14') ? 'TS-52' : 'TS-16';
  } else if (acId.includes('su27')) {
    prefix = 'TS-27';
  } else if (acId.includes('su30')) {
    prefix = 'TS-30';
  } else if (acId.includes('su57')) {
    prefix = 'TS-57';
  } else if (acId.includes('rafale')) {
    prefix = 'TS-40';
  } else if (acId.includes('super-tucano') || acId.includes('tucano')) {
    prefix = 'TT-31';
  } else if (acId.includes('t50') || acId.includes('golden-eagle')) {
    prefix = 'TT-50';
  } else if (acId.includes('c130') || acId.includes('hercules')) {
    prefix = 'A-13';
  } else if (acId.includes('c212')) {
    prefix = 'A-21';
  } else if (acId.includes('cn235')) {
    prefix = 'A-23';
  } else if (acId.includes('b737') || acId.includes('737')) {
    prefix = 'A-73';
  } else if (acId.includes('falcon-8x') || acId.includes('falcon')) {
    prefix = 'A-08';
  } else if (acId.includes('super-puma') || acId.includes('puma') || acId.includes('caracal')) {
    prefix = 'H-32';
  } else if (acId.includes('f22')) {
    prefix = 'AF-22';
  } else if (acId.includes('f35')) {
    prefix = 'AF-35';
  } else if (acId.includes('a10')) {
    prefix = 'OA-10';
  } else if (acId.includes('indonesia-one')) {
    prefix = 'A-00';
  }

  const serial = String(existingCount + 1).padStart(2, '0');
  return `${prefix}${serial}`;
}

export function createDefaultOwnedAircraft(selectedAircraft: Aircraft, squadronName: string): OwnedAircraft {
  const tail = generateTailNumber(selectedAircraft, 0, squadronName);
  return {
    id: `owned-${selectedAircraft.id}-${tail}`,
    tailNumber: tail,
    aircraft: selectedAircraft,
    flightHours: 342.5,
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
    purchasePrice: 0,
    purchasedAt: Date.now()
  };
}

export function createDefaultCrewRoster(pilotName: string, callSign: string): SquadronCrewRoster {
  return {
    flightCrew: {
      count: 2,
      pilot: pilotName || 'Mayor Pnb Adhiatma',
      coPilot: 'Mayor Pnb Bima Perkasa (WSO)',
      callSign: callSign || 'LEADER-01'
    },
    groundCrew: {
      nameId: 'Kru Darat Lapangan (Marshaller & Line)',
      nameEn: 'Ground Marshalling & Line Crew',
      count: 4,
      level: 1,
      costPerUpgrade: 25000000,
      descriptionId: 'Marshaller, Chock & Pin handlers, Towing tractor operator, dan Line safety guard.',
      descriptionEn: 'Marshallers, chock & pin crew, tractor operators, and safety marshals.',
      role: 'Line Handling & Aircraft Dispatch'
    },
    technicians: {
      nameId: 'Kru Teknisi Mesin & Struktur (Skatek)',
      nameEn: 'Aircraft Maintenance Technicians',
      count: 3,
      level: 1,
      costPerUpgrade: 40000000,
      descriptionId: 'Airframe & Powerplant (A&P) specialists, Jet turbine inspectors, dan Hydraulic mechanics.',
      descriptionEn: 'A&P specialists, jet engine inspectors, and hydraulic mechanics.',
      role: 'Engine Diagnostics & Airframe Repair'
    },
    fuelCrew: {
      nameId: 'Kru Pengisian Avtur (Refueling Team)',
      nameEn: 'Aviation Fuel Bowser Crew',
      count: 2,
      level: 1,
      costPerUpgrade: 20000000,
      descriptionId: 'Bowser fuel truck operators, Fuel hydrometer analysts, dan Hot-pit refuelers.',
      descriptionEn: 'Fuel bowser operators, hydrometer analysts, and hot-pit refueling crew.',
      role: 'Fuel Loading & Purity Quality Check'
    },
    electricCrew: {
      nameId: 'Kru Elektrik, GPU & Persenjataan (Armament)',
      nameEn: 'Electric GPU & Ordnance Crew',
      count: 2,
      level: 1,
      costPerUpgrade: 35000000,
      descriptionId: 'Ground Power Unit (115V 400Hz) operators, Radar AESA calibrators, dan Missile ordnance loaders.',
      descriptionEn: 'Ground power technicians, radar calibrators, and weapons ordnance loaders.',
      role: 'Electrical Power, Avionics & Weapons'
    }
  };
}
