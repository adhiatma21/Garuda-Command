import { LanudFinancialProfile, MilitaryMedalReward, FinanceTransaction, SquadronFinanceDetail } from '../types/finance';

export const INDONESIAN_LANUD_FINANCE_CONFIGS: Record<string, {
  name: string;
  icao: string;
  lanudClass: 'Tipe A' | 'Tipe B' | 'Tipe C';
  location: string;
  baseMonthlyDipa: number; // Base allocation in IDR
  squadronIds: string[];
}> = {
  'Lanud Iswahjudi': {
    name: 'Lanud Iswahjudi',
    icao: 'WARI',
    lanudClass: 'Tipe A',
    location: 'Magetan / Madiun, Jawa Timur',
    baseMonthlyDipa: 45000000000, // 45 Miliar / bulan
    squadronIds: ['sq3', 'sq14', 'sq15']
  },
  'Lanud Roesmin Nurjadin': {
    name: 'Lanud Roesmin Nurjadin',
    icao: 'WIBB',
    lanudClass: 'Tipe A',
    location: 'Pekanbaru, Riau',
    baseMonthlyDipa: 38000000000, // 38 Miliar / bulan
    squadronIds: ['sq12', 'sq16']
  },
  'Lanud Sultan Hasanuddin': {
    name: 'Lanud Sultan Hasanuddin',
    icao: 'WAAA',
    lanudClass: 'Tipe A',
    location: 'Makassar, Sulawesi Selatan',
    baseMonthlyDipa: 40000000000,
    squadronIds: ['sq11', 'sq5']
  },
  'Lanud Halim Perdanakusuma': {
    name: 'Lanud Halim Perdanakusuma',
    icao: 'WIHH',
    lanudClass: 'Tipe A',
    location: 'Jakarta Timur, DKI Jakarta',
    baseMonthlyDipa: 52000000000,
    squadronIds: ['sq17', 'sq31', 'sq2', 'sq45']
  },
  'Lanud Abdulrachman Saleh': {
    name: 'Lanud Abdulrachman Saleh',
    icao: 'WARS',
    lanudClass: 'Tipe A',
    location: 'Malang, Jawa Timur',
    baseMonthlyDipa: 32000000000,
    squadronIds: ['sq21', 'sq32', 'sq4']
  },
  'Lanud Supadio': {
    name: 'Lanud Supadio',
    icao: 'WIOO',
    lanudClass: 'Tipe A',
    location: 'Kubu Raya / Pontianak, Kalimantan Barat',
    baseMonthlyDipa: 28000000000,
    squadronIds: ['sq1']
  },
  'Lanud Atang Sendjaja': {
    name: 'Lanud Atang Sendjaja',
    icao: 'WIAJ',
    lanudClass: 'Tipe A',
    location: 'Bogor, Jawa Barat',
    baseMonthlyDipa: 26000000000,
    squadronIds: ['sq6', 'sq8']
  },
  'Lanud Sam Ratulangi': {
    name: 'Lanud Sam Ratulangi',
    icao: 'WAMM',
    lanudClass: 'Tipe B',
    location: 'Manado, Sulawesi Utara',
    baseMonthlyDipa: 22000000000,
    squadronIds: ['sq11']
  }
};

export const SQUADRON_FINANCE_METRICS: Record<string, {
  name: string;
  nickname: string;
  aircraftId: string;
  aircraftName: string;
  aircraftCount: number;
  pilotCount: number;
  technicianCount: number;
  groundCrewCount: number;
  avgMaintenancePerJet: number;
  pilotSalaryRate: number;
  crewSalaryRate: number;
  monthlyFuelBurnAverage: number;
  monthlyMunitionsQuota: number;
}> = {
  sq3: {
    name: 'Skadron Udara 3',
    nickname: 'The Dragon',
    aircraftId: 'f16-emlu',
    aircraftName: 'F-16AM/BM Fighting Falcon eMLU',
    aircraftCount: 12,
    pilotCount: 16,
    technicianCount: 42,
    groundCrewCount: 28,
    avgMaintenancePerJet: 350000000,
    pilotSalaryRate: 32000000,
    crewSalaryRate: 14000000,
    monthlyFuelBurnAverage: 1800000000,
    monthlyMunitionsQuota: 1200000000
  },
  sq14: {
    name: 'Skadron Udara 14',
    nickname: 'The Black Eagle',
    aircraftId: 'f16-cd',
    aircraftName: 'F-16C/D Block 52ID',
    aircraftCount: 14,
    pilotCount: 18,
    technicianCount: 46,
    groundCrewCount: 30,
    avgMaintenancePerJet: 360000000,
    pilotSalaryRate: 32000000,
    crewSalaryRate: 14000000,
    monthlyFuelBurnAverage: 2100000000,
    monthlyMunitionsQuota: 1400000000
  },
  sq15: {
    name: 'Skadron Udara 15',
    nickname: 'The Golden Eagle',
    aircraftId: 't50i',
    aircraftName: 'T-50i Golden Eagle Lead-In Fighter',
    aircraftCount: 15,
    pilotCount: 20,
    technicianCount: 38,
    groundCrewCount: 24,
    avgMaintenancePerJet: 240000000,
    pilotSalaryRate: 28000000,
    crewSalaryRate: 13000000,
    monthlyFuelBurnAverage: 1400000000,
    monthlyMunitionsQuota: 850000000
  },
  sq12: {
    name: 'Skadron Udara 12',
    nickname: 'Black Panther',
    aircraftId: 'rafale',
    aircraftName: 'Dassault Rafale F4',
    aircraftCount: 12,
    pilotCount: 15,
    technicianCount: 50,
    groundCrewCount: 32,
    avgMaintenancePerJet: 480000000,
    pilotSalaryRate: 38000000,
    crewSalaryRate: 16000000,
    monthlyFuelBurnAverage: 2400000000,
    monthlyMunitionsQuota: 1800000000
  },
  sq16: {
    name: 'Skadron Udara 16',
    nickname: 'Rydder',
    aircraftId: 'f16-cd',
    aircraftName: 'F-16C/D Fighting Falcon',
    aircraftCount: 12,
    pilotCount: 16,
    technicianCount: 40,
    groundCrewCount: 26,
    avgMaintenancePerJet: 350000000,
    pilotSalaryRate: 32000000,
    crewSalaryRate: 14000000,
    monthlyFuelBurnAverage: 1900000000,
    monthlyMunitionsQuota: 1100000000
  },
  sq11: {
    name: 'Skadron Udara 11',
    nickname: 'Thunder',
    aircraftId: 'su30',
    aircraftName: 'Sukhoi Su-27SKM / Su-30MK2 Flanker',
    aircraftCount: 16,
    pilotCount: 22,
    technicianCount: 65,
    groundCrewCount: 38,
    avgMaintenancePerJet: 550000000,
    pilotSalaryRate: 36000000,
    crewSalaryRate: 15000000,
    monthlyFuelBurnAverage: 3200000000,
    monthlyMunitionsQuota: 2200000000
  },
  sq5: {
    name: 'Skadron Udara 5',
    nickname: 'Camar Emas',
    aircraftId: 'b737-mpm',
    aircraftName: 'Boeing 737-200 / CN-235 Maritime Patrol',
    aircraftCount: 5,
    pilotCount: 12,
    technicianCount: 28,
    groundCrewCount: 18,
    avgMaintenancePerJet: 290000000,
    pilotSalaryRate: 30000000,
    crewSalaryRate: 13500000,
    monthlyFuelBurnAverage: 1200000000,
    monthlyMunitionsQuota: 400000000
  },
  sq17: {
    name: 'Skadron Udara 17',
    nickname: 'Kereta Kencana',
    aircraftId: 'indonesia-one',
    aircraftName: 'Boeing 737 BBJ-2 & Falcon 8X VVIP',
    aircraftCount: 6,
    pilotCount: 14,
    technicianCount: 35,
    groundCrewCount: 25,
    avgMaintenancePerJet: 450000000,
    pilotSalaryRate: 40000000,
    crewSalaryRate: 16000000,
    monthlyFuelBurnAverage: 1600000000,
    monthlyMunitionsQuota: 200000000
  },
  sq31: {
    name: 'Skadron Udara 31',
    nickname: 'Bhumisatya',
    aircraftId: 'c130',
    aircraftName: 'C-130J Super Hercules & Heavy Airlift',
    aircraftCount: 10,
    pilotCount: 20,
    technicianCount: 45,
    groundCrewCount: 35,
    avgMaintenancePerJet: 380000000,
    pilotSalaryRate: 32000000,
    crewSalaryRate: 14000000,
    monthlyFuelBurnAverage: 2200000000,
    monthlyMunitionsQuota: 300000000
  },
  sq2: {
    name: 'Skadron Udara 2',
    nickname: 'Kuda Terbang',
    aircraftId: 'cn235',
    aircraftName: 'CN-235 / C-295 Tactical Transport',
    aircraftCount: 8,
    pilotCount: 16,
    technicianCount: 30,
    groundCrewCount: 20,
    avgMaintenancePerJet: 260000000,
    pilotSalaryRate: 29000000,
    crewSalaryRate: 13000000,
    monthlyFuelBurnAverage: 1100000000,
    monthlyMunitionsQuota: 200000000
  },
  sq45: {
    name: 'Skadron Udara 45',
    nickname: 'VIP Helikopter',
    aircraftId: 'cn235',
    aircraftName: 'VIP Transport & Rotary Wing',
    aircraftCount: 6,
    pilotCount: 12,
    technicianCount: 25,
    groundCrewCount: 18,
    avgMaintenancePerJet: 220000000,
    pilotSalaryRate: 28000000,
    crewSalaryRate: 13000000,
    monthlyFuelBurnAverage: 800000000,
    monthlyMunitionsQuota: 150000000
  },
  sq21: {
    name: 'Skadron Udara 21',
    nickname: 'Tuco',
    aircraftId: 'super-tucano',
    aircraftName: 'EMB-314 Super Tucano COIN/CAS',
    aircraftCount: 15,
    pilotCount: 18,
    technicianCount: 36,
    groundCrewCount: 24,
    avgMaintenancePerJet: 180000000,
    pilotSalaryRate: 28000000,
    crewSalaryRate: 12500000,
    monthlyFuelBurnAverage: 900000000,
    monthlyMunitionsQuota: 950000000
  },
  sq32: {
    name: 'Skadron Udara 32',
    nickname: 'Herky Malang',
    aircraftId: 'c130',
    aircraftName: 'C-130H / KC-130B Hercules Tanker',
    aircraftCount: 8,
    pilotCount: 16,
    technicianCount: 38,
    groundCrewCount: 28,
    avgMaintenancePerJet: 350000000,
    pilotSalaryRate: 32000000,
    crewSalaryRate: 13500000,
    monthlyFuelBurnAverage: 1900000000,
    monthlyMunitionsQuota: 300000000
  },
  sq4: {
    name: 'Skadron Udara 4',
    nickname: 'Walet',
    aircraftId: 'c212',
    aircraftName: 'NC-212 Aviocar Light Transport',
    aircraftCount: 8,
    pilotCount: 14,
    technicianCount: 26,
    groundCrewCount: 18,
    avgMaintenancePerJet: 160000000,
    pilotSalaryRate: 27000000,
    crewSalaryRate: 12000000,
    monthlyFuelBurnAverage: 650000000,
    monthlyMunitionsQuota: 150000000
  },
  sq1: {
    name: 'Skadron Udara 1',
    nickname: 'Elang Khatulistiwa',
    aircraftId: 'hawk-209',
    aircraftName: 'BAE Hawk 109/209 Light Strike',
    aircraftCount: 14,
    pilotCount: 16,
    technicianCount: 36,
    groundCrewCount: 22,
    avgMaintenancePerJet: 210000000,
    pilotSalaryRate: 28000000,
    crewSalaryRate: 13000000,
    monthlyFuelBurnAverage: 1100000000,
    monthlyMunitionsQuota: 850000000
  },
  sq6: {
    name: 'Skadron Udara 6',
    nickname: 'Cocor Merah',
    aircraftId: 'super-puma',
    aircraftName: 'NAS-332 Super Puma & SAR',
    aircraftCount: 10,
    pilotCount: 16,
    technicianCount: 32,
    groundCrewCount: 20,
    avgMaintenancePerJet: 230000000,
    pilotSalaryRate: 28000000,
    crewSalaryRate: 13000000,
    monthlyFuelBurnAverage: 950000000,
    monthlyMunitionsQuota: 200000000
  },
  sq8: {
    name: 'Skadron Udara 8',
    nickname: 'Pelican',
    aircraftId: 'super-puma',
    aircraftName: 'EC-725 Caracal Combat SAR',
    aircraftCount: 10,
    pilotCount: 16,
    technicianCount: 34,
    groundCrewCount: 22,
    avgMaintenancePerJet: 250000000,
    pilotSalaryRate: 29000000,
    crewSalaryRate: 13500000,
    monthlyFuelBurnAverage: 1050000000,
    monthlyMunitionsQuota: 250000000
  }
};

export const MILITARY_MEDALS_REWARDS_DATA: MilitaryMedalReward[] = [
  {
    id: 'medal-wing-tempur',
    nameId: 'Wing Penerbang Tempur Utama',
    nameEn: 'Combat Fighter Pilot Wings',
    descriptionId: 'Diberikan atas kemahiran mengawaki pesawat jet tempur TNI AU dan keberhasilan melaksanakan misi taktis pertahanan udara.',
    descriptionEn: 'Awarded for combat flight mastery and successful execution of tactical air defense sorties.',
    category: 'KORPS_PENERBANG',
    monetaryReward: 750000000, // Rp 750 Juta
    requiredCondition: 'Menyelesaikan minimal 1 misi terbang tempur / escort VVIP',
    iconType: 'ShieldCheck',
    unlocked: true,
    claimed: false
  },
  {
    id: 'medal-bintang-swa-bhuwana',
    nameId: 'Bintang Swa Bhuwana Paksa Nararya',
    nameEn: 'Order of Swa Bhuwana Paksa',
    descriptionId: 'Tanda kehormatan tertinggi atas dedikasi luar biasa dalam menjaga kedaulatan wilayah udara Republik Indonesia.',
    descriptionEn: 'Supreme honor for exceptional dedication to safeguarding Indonesian sovereign airspace.',
    category: 'KEHORMATAN_NEGARA',
    monetaryReward: 2500000000, // Rp 2.5 Miliar
    requiredCondition: 'Akumulasi skor prestasi pangkalan > 500 Poin',
    iconType: 'Award',
    unlocked: true,
    claimed: false
  },
  {
    id: 'medal-satyalancana-kesetiaan',
    nameId: 'Satyalancana Kesetiaan Operasi Dirgantara',
    nameEn: 'Aviation Devotion Medal',
    descriptionId: 'Penghargaan atas loyalitas dan kepemimpinan dalam mengelola komando pangkalan udara dan skuadron tempur.',
    descriptionEn: 'Recognition of loyalty and command leadership of airbase operations.',
    category: 'KESETIAAN',
    monetaryReward: 1200000000, // Rp 1.2 Miliar
    requiredCondition: 'Mencapai pangkat Perwira Pertama/Menengah & aktif komando',
    iconType: 'Medal',
    unlocked: true,
    claimed: false
  },
  {
    id: 'medal-vvip-guardian',
    nameId: 'Lencana Pengawal Udara Presiden (VVIP Guardian)',
    nameEn: 'Presidential Aerial Escort Badge',
    descriptionId: 'Tanda jasa pengamanan penerbangan VVIP Pesawat Kepresidenan Republik Indonesia (Indonesia-01).',
    descriptionEn: 'Commendation for successful aerial escort of Presidential Aircraft Indonesia-01.',
    category: 'OPERASI_TEMPUR',
    monetaryReward: 1800000000, // Rp 1.8 Miliar
    requiredCondition: 'Melaksanakan misi VVIP Escort dengan keberhasilan 100%',
    iconType: 'Crown',
    unlocked: false,
    claimed: false
  },
  {
    id: 'medal-ace-interceptor',
    nameId: 'Lencana Interceptor Elang Dirgantara',
    nameEn: 'Eagle Interceptor Commendation',
    descriptionId: 'Penghargaan atas kesigapan Scramble Alert dan intersepsi pesawat asing tak berizin (Black Flight).',
    descriptionEn: 'Award for rapid scramble response and successful interception of unauthorized airspace breaches.',
    category: 'OPERASI_TEMPUR',
    monetaryReward: 1500000000, // Rp 1.5 Miliar
    requiredCondition: 'Melaksanakan patroli tempur udara / Scramble Alert',
    iconType: 'Zap',
    unlocked: false,
    claimed: false
  },
  {
    id: 'medal-recon-mastery',
    nameId: 'Lencana Survei & Pengintaian Taktis (ISR)',
    nameEn: 'Tactical Reconnaissance & Strike Award',
    descriptionId: 'Diberikan atas keberhasilan pengintaian sasaran strategis musuh dan penindakan presisi.',
    descriptionEn: 'Conferred for strategic ISR target acquisition and precision strike execution.',
    category: 'OPERASI_TEMPUR',
    monetaryReward: 1600000000, // Rp 1.6 Miliar
    requiredCondition: 'Menyelesaikan 1 misi Reconnaissance & Intel Strike',
    iconType: 'Crosshair',
    unlocked: false,
    claimed: false
  }
];

export function buildSquadronFinanceDetails(squadronIds: string[]): SquadronFinanceDetail[] {
  return squadronIds.map(sqId => {
    const metrics = SQUADRON_FINANCE_METRICS[sqId] || {
      name: `Skadron Udara (${sqId})`,
      nickname: 'Garuda',
      aircraftId: 'f16-cd',
      aircraftName: 'F-16C Fighting Falcon',
      aircraftCount: 12,
      pilotCount: 16,
      technicianCount: 40,
      groundCrewCount: 25,
      avgMaintenancePerJet: 300000000,
      pilotSalaryRate: 30000000,
      crewSalaryRate: 13000000,
      monthlyFuelBurnAverage: 1500000000,
      monthlyMunitionsQuota: 1000000000
    };

    const monthlyPilotPayroll = metrics.pilotCount * metrics.pilotSalaryRate;
    const monthlyCrewPayroll = (metrics.technicianCount + metrics.groundCrewCount) * metrics.crewSalaryRate;
    const monthlyMaintenanceCost = metrics.aircraftCount * metrics.avgMaintenancePerJet;
    const monthlyFuelBurnCost = metrics.monthlyFuelBurnAverage;
    const monthlyMunitionsCost = metrics.monthlyMunitionsQuota;
    const totalMonthlyExpenses = monthlyPilotPayroll + monthlyCrewPayroll + monthlyMaintenanceCost + monthlyFuelBurnCost + monthlyMunitionsCost;

    return {
      id: sqId,
      name: metrics.name,
      nickname: metrics.nickname,
      aircraftId: metrics.aircraftId,
      aircraftName: metrics.aircraftName,
      aircraftCount: metrics.aircraftCount,
      operationalRate: 92, // 92% readiness
      pilotCount: metrics.pilotCount,
      technicianCount: metrics.technicianCount,
      groundCrewCount: metrics.groundCrewCount,
      monthlyPilotPayroll,
      monthlyCrewPayroll,
      monthlyMaintenanceCost,
      monthlyFuelBurnCost,
      monthlyMunitionsCost,
      totalMonthlyExpenses,
      monthlyBudgetQuota: totalMonthlyExpenses * 1.15, // Allocated with 15% operational buffer
      readinessScore: 94
    };
  });
}

export function generateInitialLanudFinanceProfile(
  lanudName: string,
  commanderName = 'Marsekal Pertama TNI Pratama',
  commanderRank = 'Marsma TNI',
  commanderCallsign = 'GARUDA-01'
): LanudFinancialProfile {
  const config = INDONESIAN_LANUD_FINANCE_CONFIGS[lanudName] || INDONESIAN_LANUD_FINANCE_CONFIGS['Lanud Iswahjudi'];
  const squadrons = buildSquadronFinanceDetails(config.squadronIds);

  const totalSquadronExpenses = squadrons.reduce((acc, s) => acc + s.totalMonthlyExpenses, 0);
  const hangarAndBaseOverhead = 4500000000; // 4.5 Miliar overhead LANUD
  const totalBaseExpenses = totalSquadronExpenses + hangarAndBaseOverhead;
  const monthlyGovernmentDipa = Math.max(config.baseMonthlyDipa, totalBaseExpenses * 1.25);

  const initialTransactions: FinanceTransaction[] = [
    {
      id: 'trx-init-dipa-01',
      date: new Date(Date.now() - 86400000 * 5).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now() - 86400000 * 5,
      type: 'INCOME',
      category: 'GOVERNMENT_BUDGET',
      amount: monthlyGovernmentDipa,
      title: 'Pencairan DIPA Induk Kemhan / Mabes TNI AU',
      description: `Alokasi rutin APBN operasional pangkalan udara ${config.name} (${config.lanudClass}) untuk ${squadrons.length} skuadron organik.`,
      referenceCode: `DIPA-KEMHAN-${config.icao}-2026/08`,
      status: 'AUDITED'
    },
    {
      id: 'trx-init-payroll-01',
      date: new Date(Date.now() - 86400000 * 4).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now() - 86400000 * 4,
      type: 'EXPENSE',
      category: 'PILOT_SALARIES',
      amount: squadrons.reduce((acc, s) => acc + s.monthlyPilotPayroll, 0),
      title: 'Gaji Pokok & Tunjangan Bahaya Terbang Pilot',
      description: `Pembayaran gaji resmi dan tunjangan resiko terbang untuk ${squadrons.reduce((acc, s) => acc + s.pilotCount, 0)} penerbang tempur aktif.`,
      referenceCode: `PAY-PLT-${config.icao}-0826`,
      status: 'CONFIRMED'
    },
    {
      id: 'trx-init-crew-01',
      date: new Date(Date.now() - 86400000 * 4).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now() - 86400000 * 4,
      type: 'EXPENSE',
      category: 'CREW_SALARIES',
      amount: squadrons.reduce((acc, s) => acc + s.monthlyCrewPayroll, 0),
      title: 'Gaji Teknisi Avionik & Ground Crew',
      description: `Payroll bulanan teknisi pemeliharaan alutsista dan kru pemeliharaan darat pangkalan.`,
      referenceCode: `PAY-CRW-${config.icao}-0826`,
      status: 'CONFIRMED'
    },
    {
      id: 'trx-init-maint-01',
      date: new Date(Date.now() - 86400000 * 3).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now() - 86400000 * 3,
      type: 'EXPENSE',
      category: 'AIRCRAFT_MAINTENANCE',
      amount: squadrons.reduce((acc, s) => acc + s.monthlyMaintenanceCost, 0),
      title: 'Pemeliharaan Berkala & Kalibrasi Avionik',
      description: `Inspeksi 100-jam terbang, kalibrasi radar AESA, pengecekan sistem hidrolik jet tempur.`,
      referenceCode: `MNT-FLT-${config.icao}-8821`,
      status: 'CONFIRMED'
    },
    {
      id: 'trx-init-fuel-01',
      date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now() - 86400000 * 2,
      type: 'EXPENSE',
      category: 'FUEL_LOGISTICS',
      amount: squadrons.reduce((acc, s) => acc + s.monthlyFuelBurnCost, 0),
      title: 'Pengisian Tangki Depot Avtur Pertamina Aviation',
      description: `Pengadaan pasokan bahan bakar Jet A-1 / JP-8 untuk kesiapan sortie patroli CAP dan latihan tempur.`,
      referenceCode: `LOG-FUEL-${config.icao}-9901`,
      status: 'CONFIRMED'
    },
    {
      id: 'trx-init-munitions-01',
      date: new Date(Date.now() - 86400000 * 1).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now() - 86400000 * 1,
      type: 'EXPENSE',
      category: 'WEAPONS_MUNITIONS',
      amount: squadrons.reduce((acc, s) => acc + s.monthlyMunitionsCost, 0),
      title: 'Restok Munisi Gudang Senjata (Armory Restock)',
      description: `Pengadaan munisi kanon 20mm M61A1 Vulcan dan inspeksi kesiapan rudal AIM-120 AMRAAM & AIM-9X.`,
      referenceCode: `ORD-RESTOK-${config.icao}-4412`,
      status: 'CONFIRMED'
    },
    {
      id: 'trx-init-bonus-mission',
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now(),
      type: 'INCOME',
      category: 'MISSION_BONUS',
      amount: 1500000000,
      title: 'Bonus Keberhasilan Operasi Patroli & Pengamanan Udara',
      description: `Tunjangan operasi taktis khusus yang dikreditkan langsung ke kas Lanud atas kesiapan tempur tinggi.`,
      referenceCode: `BONUS-OPS-LANUD-771`,
      status: 'AUDITED'
    }
  ];

  const totalIncome = initialTransactions.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
  const totalExpense = initialTransactions.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
  const activeCashBalance = 18500000000 + (totalIncome - totalExpense);

  return {
    lanudId: config.icao.toLowerCase(),
    lanudName: config.name,
    lanudIcao: config.icao,
    lanudClass: config.lanudClass,
    location: config.location,
    commanderName,
    commanderRank,
    commanderCallsign,
    activeCashBalance,
    monthlyGovernmentDipa,
    monthlyFiscalCycle: 8, // Bulan Agustus
    fiscalYear: 2026,
    lastClaimTimestamp: Date.now() - 86400000 * 5,
    financialHealthScore: 94,
    financialHealthGrade: 'SANGAT SEHAT',
    budgetAllocations: {
      maintenancePercent: 30,
      munitionsPercent: 20,
      personnelPercent: 25,
      fuelLogisticsPercent: 15,
      facilityUpgradePercent: 10
    },
    squadrons,
    transactions: initialTransactions
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatCompactRupiah(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000_000) {
    return `Rp ${(amount / 1_000_000_000_000).toFixed(2)} T`;
  }
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2)} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  return formatRupiah(amount);
}
