export type TransactionType = 'INCOME' | 'EXPENSE';

export type IncomeCategory =
  | 'GOVERNMENT_BUDGET'       // Alokasi Rutin APBN / DIPA Kemhan
  | 'MISSION_BONUS'           // Bonus Penyelesaian Misi Tempur & Operasi
  | 'PILOT_POINTS_CONVERSION' // Konversi Poin Prestasi Penerbang
  | 'MEDAL_AWARD'             // Tunjangan Kehormatan Tanda Jasa & Medali
  | 'READINESS_GRANT'         // Insentif Tingkat Kesiapan Armada Skuadron
  | 'VVIP_ESCORT_FEE'         // Dana Operasional Khusus Pengawalan VVIP
  | 'SPECIAL_LOGISTICS_SUBSIDY'; // Subsidi Logistik & Munisi Strategis

export type ExpenseCategory =
  | 'AIRCRAFT_MAINTENANCE'    // Pemeliharaan Pesawat & Overhaul Berkala
  | 'HANGAR_FACILITY'         // Perawatan Hanggar, Runway, Apron & Fasilitas
  | 'FLIGHT_OPERATIONS'       // Biaya Operasional Sortie Penerbangan & ATC
  | 'CREW_SALARIES'           // Gaji & Tunjangan Teknisi / Ground Crew
  | 'PILOT_SALARIES'          // Gaji Pokok & Tunjangan Bahaya Terbang Pilot
  | 'FUEL_LOGISTICS'          // Pengadaan Avtur & Logistik Bahan Bakar
  | 'WEAPONS_MUNITIONS'       // Restok Munisi, Rudal & Bom Pandu
  | 'UPGRADE_MODERNIZATION'   // Biaya Modernisasi & Upgrade Generasi Pesawat
  | 'BASE_ADMINISTRATION';    // Administrasi Markas, Listrik, Satcom Datalink

export interface FinanceTransaction {
  id: string;
  date: string;
  timestamp: number;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number; // in IDR (Rupiah)
  squadronId?: string;
  squadronName?: string;
  title: string;
  description: string;
  referenceCode: string;
  status: 'CONFIRMED' | 'AUDITED' | 'PENDING';
}

export interface SquadronFinanceDetail {
  id: string;
  name: string;
  nickname: string;
  aircraftId: string;
  aircraftName: string;
  aircraftCount: number;
  operationalRate: number; // percentage 0-100%
  pilotCount: number;
  technicianCount: number;
  groundCrewCount: number;
  monthlyPilotPayroll: number;
  monthlyCrewPayroll: number;
  monthlyMaintenanceCost: number;
  monthlyFuelBurnCost: number;
  monthlyMunitionsCost: number;
  totalMonthlyExpenses: number;
  monthlyBudgetQuota: number;
  readinessScore: number; // 0-100
}

export interface LanudFinancialProfile {
  lanudId: string;
  lanudName: string;
  lanudIcao: string;
  lanudClass: 'Tipe A' | 'Tipe B' | 'Tipe C';
  location: string;
  commanderName: string;
  commanderRank: string;
  commanderCallsign: string;
  activeCashBalance: number;
  monthlyGovernmentDipa: number;
  monthlyFiscalCycle: number; // Current month number in fiscal year (1-12)
  fiscalYear: number;
  lastClaimTimestamp: number;
  financialHealthScore: number; // 0-100
  financialHealthGrade: 'SANGAT SEHAT' | 'SEHAT' | 'WASPADA' | 'KRITIS';
  budgetAllocations: {
    maintenancePercent: number;    // e.g. 30%
    munitionsPercent: number;      // e.g. 20%
    personnelPercent: number;      // e.g. 25%
    fuelLogisticsPercent: number;  // e.g. 15%
    facilityUpgradePercent: number;// e.g. 10%
  };
  squadrons: SquadronFinanceDetail[];
  transactions: FinanceTransaction[];
}

export interface MilitaryMedalReward {
  id: string;
  nameId: string;
  nameEn: string;
  descriptionId: string;
  descriptionEn: string;
  category: 'KORPS_PENERBANG' | 'KEHORMATAN_NEGARA' | 'OPERASI_TEMPUR' | 'KESETIAAN';
  monetaryReward: number; // IDR bonus to base treasury
  requiredCondition: string;
  iconType: string;
  unlocked: boolean;
  claimed: boolean;
}
