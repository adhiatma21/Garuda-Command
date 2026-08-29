import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Coins, 
  Shield, 
  Award, 
  FileText, 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plane, 
  Users, 
  Wrench, 
  Fuel, 
  Crosshair, 
  Sliders, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  ChevronRight,
  Zap,
  Building,
  Radio,
  Calendar,
  Sparkles,
  Trophy,
  Crown,
  Layers,
  Info
} from 'lucide-react';
import { 
  LanudFinancialProfile, 
  FinanceTransaction, 
  SquadronFinanceDetail, 
  MilitaryMedalReward,
  IncomeCategory,
  ExpenseCategory
} from '../../../types/finance';
import { 
  INDONESIAN_LANUD_FINANCE_CONFIGS, 
  MILITARY_MEDALS_REWARDS_DATA, 
  formatRupiah, 
  formatCompactRupiah, 
  generateInitialLanudFinanceProfile,
  buildSquadronFinanceDetails
} from '../../../data/lanudFinanceData';
import { PLAYABLE_SQUADRONS } from '../../../constants';
import { FinanceReportModal } from './FinanceReportModal';
import { FinanceMetricDetailModal, MetricType } from './FinanceMetricDetailModal';
import { cn } from '../../../lib/utils';
import { PlayerProfile } from '../../../types';

interface FinanceDashboardProps {
  language: 'id' | 'en';
  playerProfile: PlayerProfile | null;
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  flightHours: number;
  speak: (text: string, isATC?: boolean) => void;
  onNavigateToFlight?: () => void;
  onNavigateToSquadron?: () => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  language,
  playerProfile,
  points,
  setPoints,
  flightHours,
  speak,
  onNavigateToFlight,
  onNavigateToSquadron
}) => {
  // Read unlocked squadrons from localStorage or player profile
  const getUnlockedSquadronIds = (): string[] => {
    try {
      const saved = localStorage.getItem('ais_unlocked_squadron_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    
    // Default to playerProfile squadron or fallback to 1 squadron
    if (playerProfile?.squadron) {
      const match = PLAYABLE_SQUADRONS.find(
        s => s.name.toLowerCase().includes(playerProfile.squadron.toLowerCase()) || 
             s.id.toLowerCase() === playerProfile.squadron.toLowerCase()
      );
      if (match) return [match.id];
    }
    return ['sq1'];
  };

  const [unlockedSquadronIds, setUnlockedSquadronIds] = useState<string[]>(getUnlockedSquadronIds);

  // Sync unlocked squadrons on window focus/storage
  useEffect(() => {
    const handleSync = () => {
      const ids = getUnlockedSquadronIds();
      setUnlockedSquadronIds(ids);
    };
    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [playerProfile]);

  // Determine initial Lanud from player profile
  const initialLanud = useMemo(() => {
    const homeBase = playerProfile?.homeAirbase || playerProfile?.homeBase?.name || 'Lanud Iswahjudi';
    const matched = Object.keys(INDONESIAN_LANUD_FINANCE_CONFIGS).find(k => 
      homeBase.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(homeBase.toLowerCase())
    );
    return matched || 'Lanud Iswahjudi';
  }, [playerProfile]);

  const [selectedLanud, setSelectedLanud] = useState<string>(initialLanud);
  const [profile, setProfile] = useState<LanudFinancialProfile>(() => {
    const ids = getUnlockedSquadronIds();
    return generateInitialLanudFinanceProfile(
      initialLanud,
      playerProfile?.commanderName || 'Marsekal Pertama Pratama',
      playerProfile?.rank || 'Marsma TNI',
      playerProfile?.callsign || 'GARUDA-01',
      ids
    );
  });

  // Re-generate squadrons when unlockedSquadronIds change
  useEffect(() => {
    setProfile(prev => {
      const config = INDONESIAN_LANUD_FINANCE_CONFIGS[selectedLanud] || INDONESIAN_LANUD_FINANCE_CONFIGS['Lanud Iswahjudi'];
      const updatedSquadrons = buildSquadronFinanceDetails(config.squadronIds, unlockedSquadronIds);
      const activeSquadrons = updatedSquadrons.filter(s => s.isActive);
      const activeCount = activeSquadrons.length;

      const totalSquadronExpenses = activeSquadrons.reduce((acc, s) => acc + s.totalMonthlyExpenses, 0);
      const hangarAndBaseOverhead = activeCount > 0 ? 3000000000 + (activeCount * 800000000) : 1500000000;
      const totalBaseExpenses = totalSquadronExpenses + hangarAndBaseOverhead;
      const baseDipa = config.baseMonthlyDipa * (activeCount > 0 ? (activeCount / config.squadronIds.length) : 0.4);
      const monthlyGovernmentDipa = Math.max(baseDipa, totalBaseExpenses * 1.2);

      return {
        ...prev,
        monthlyGovernmentDipa,
        squadrons: updatedSquadrons
      };
    });
  }, [unlockedSquadronIds, selectedLanud]);

  const [medals, setMedals] = useState<MilitaryMedalReward[]>(() => {
    return MILITARY_MEDALS_REWARDS_DATA.map(m => {
      if (m.id === 'medal-bintang-swa-bhuwana' && points >= 500) {
        return { ...m, unlocked: true };
      }
      if (m.id === 'medal-wing-tempur' && flightHours > 0) {
        return { ...m, unlocked: true };
      }
      return m;
    });
  });

  const [activeFinanceTab, setActiveFinanceTab] = useState<'overview' | 'squadrons' | 'expenses' | 'ledger' | 'rewards' | 'policy'>('overview');
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedSquadronFilter, setSelectedSquadronFilter] = useState<string>('ALL');
  const [showReportModal, setShowReportModal] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState<number>(Math.min(100, points));
  const [feedbackNotification, setFeedbackNotification] = useState<string | null>(null);

  // Metric Details Modal State (Kas Aktif, Pemasukan DIPA, Pengeluaran LANUD, Arus Kas Bersih, Kesehatan Fiskal)
  const [showMetricDetailModal, setShowMetricDetailModal] = useState(false);
  const [selectedDetailMetric, setSelectedDetailMetric] = useState<MetricType>('cash');

  const handleOpenMetricModal = (m: MetricType) => {
    setSelectedDetailMetric(m);
    setShowMetricDetailModal(true);
  };

  // When selected LANUD changes, generate a profile for that LANUD
  const handleSelectLanud = (lanudName: string) => {
    setSelectedLanud(lanudName);
    const newProfile = generateInitialLanudFinanceProfile(
      lanudName,
      playerProfile?.commanderName || profile.commanderName,
      playerProfile?.rank || profile.commanderRank,
      playerProfile?.callsign || profile.commanderCallsign,
      unlockedSquadronIds
    );
    setProfile(newProfile);
    showNotification(language === 'id' ? `Beralih ke Komando Keuangan ${lanudName}` : `Switched to ${lanudName} Financial Command`);
  };

  const showNotification = (msg: string) => {
    setFeedbackNotification(msg);
    setTimeout(() => {
      setFeedbackNotification(null);
    }, 4000);
  };

  // Active vs Inactive Squadrons
  const activeSquadrons = useMemo(() => {
    return profile.squadrons.filter(s => s.isActive);
  }, [profile.squadrons]);

  // Financial aggregates
  const totalInflow = useMemo(() => {
    return profile.transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [profile.transactions]);

  const totalOutflow = useMemo(() => {
    return profile.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [profile.transactions]);

  const monthlySurplus = totalInflow - totalOutflow;

  // Monthly DIPA Government Claim
  const handleClaimMonthlyDipa = () => {
    const amount = profile.monthlyGovernmentDipa;
    const now = Date.now();
    const activeCount = activeSquadrons.length;

    const newTrx: FinanceTransaction = {
      id: 'trx-dipa-' + now,
      date: new Date(now).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
      type: 'INCOME',
      category: 'GOVERNMENT_BUDGET',
      amount,
      title: language === 'id' ? 'Klaim Alokasi DIPA APBN Bulanan' : 'Monthly Government DIPA Allocation Claim',
      description: language === 'id' 
        ? `Pencairan dana anggaran rutin operasional LANUD ${profile.lanudName} (${activeCount} skuadron aktif) untuk siklus ke-${profile.monthlyFiscalCycle + 1}.`
        : `Disbursement of operational defense grant for ${profile.lanudName} (${activeCount} active squadrons) cycle #${profile.monthlyFiscalCycle + 1}.`,
      referenceCode: `DIPA-${profile.lanudIcao}-${profile.fiscalYear}/${String(profile.monthlyFiscalCycle + 1).padStart(2, '0')}`,
      status: 'AUDITED'
    };

    setProfile(prev => ({
      ...prev,
      activeCashBalance: prev.activeCashBalance + amount,
      monthlyFiscalCycle: (prev.monthlyFiscalCycle % 12) + 1,
      lastClaimTimestamp: now,
      transactions: [newTrx, ...prev.transactions]
    }));

    speak(
      language === 'id'
        ? `Pencairan DIPA Pemerintah sukses. Dana kas pangkalan bertambah ${formatCompactRupiah(amount)}.`
        : `Government DIPA claim approved. Base treasury credited by ${formatCompactRupiah(amount)}.`
    );
    showNotification(language === 'id' ? `Alokasi DIPA APBN berhasil dicairkan (+${formatCompactRupiah(amount)})` : `Monthly DIPA credited (+${formatCompactRupiah(amount)})`);
  };

  // Convert Player Points to Base Funds
  const handleConvertPoints = () => {
    if (pointsToConvert <= 0 || points < pointsToConvert) return;
    const cashPerPoint = 5000000; // Rp 5.000.000 per point
    const totalCashGained = pointsToConvert * cashPerPoint;
    const now = Date.now();

    const newTrx: FinanceTransaction = {
      id: 'trx-pts-' + now,
      date: new Date(now).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
      type: 'INCOME',
      category: 'PILOT_POINTS_CONVERSION',
      amount: totalCashGained,
      title: language === 'id' ? `Konversi ${pointsToConvert} Poin Prestasi Penerbang` : `Conversion of ${pointsToConvert} Combat Points`,
      description: language === 'id'
        ? `Penerima dana tunjangan prestasi tempur dirgantara dikonversikan menjadi dana operasional LANUD.`
        : `Combat proficiency reward points converted into Lanud operating liquidity.`,
      referenceCode: `PTS-CONV-${now.toString().slice(-6)}`,
      status: 'AUDITED'
    };

    setPoints(prev => Math.max(0, prev - pointsToConvert));
    setProfile(prev => ({
      ...prev,
      activeCashBalance: prev.activeCashBalance + totalCashGained,
      transactions: [newTrx, ...prev.transactions]
    }));

    speak(
      language === 'id'
        ? `Konversi ${pointsToConvert} poin berhasil. Kas pangkalan bertambah ${formatCompactRupiah(totalCashGained)}.`
        : `Converted ${pointsToConvert} points. Base funds credited ${formatCompactRupiah(totalCashGained)}.`
    );
    showNotification(language === 'id' ? `Poin berhasil dikonversi ke Kas LANUD (+${formatCompactRupiah(totalCashGained)})` : `Points converted (+${formatCompactRupiah(totalCashGained)})`);
  };

  // Claim Military Medal Reward
  const handleClaimMedal = (medalId: string) => {
    const medal = medals.find(m => m.id === medalId);
    if (!medal || !medal.unlocked || medal.claimed) return;

    const now = Date.now();
    const newTrx: FinanceTransaction = {
      id: 'trx-medal-' + now,
      date: new Date(now).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
      type: 'INCOME',
      category: 'MEDAL_AWARD',
      amount: medal.monetaryReward,
      title: language === 'id' ? `Tunjangan Kehormatan: ${medal.nameId}` : `Honors Grant: ${medal.nameEn}`,
      description: language === 'id' ? medal.descriptionId : medal.descriptionEn,
      referenceCode: `MEDAL-GRANT-${medal.id.toUpperCase()}`,
      status: 'AUDITED'
    };

    setMedals(prev => prev.map(m => m.id === medalId ? { ...m, claimed: true } : m));
    setProfile(prev => ({
      ...prev,
      activeCashBalance: prev.activeCashBalance + medal.monetaryReward,
      transactions: [newTrx, ...prev.transactions]
    }));

    speak(
      language === 'id'
        ? `Tanda jasa ${medal.nameId} dicairkan. Kas pangkalan bertambah ${formatCompactRupiah(medal.monetaryReward)}.`
        : `Honor grant ${medal.nameEn} claimed. Credited ${formatCompactRupiah(medal.monetaryReward)}.`
    );
    showNotification(language === 'id' ? `Tanda jasa kehormatan dicairkan (+${formatCompactRupiah(medal.monetaryReward)})` : `Honor grant claimed (+${formatCompactRupiah(medal.monetaryReward)})`);
  };

  // Run Monthly Audit / Tutup Buku (Strictly counts active squadrons)
  const handleRunMonthlyAudit = () => {
    const now = Date.now();
    const activeCount = activeSquadrons.length;
    const totalSquadronExp = activeSquadrons.reduce((a, s) => a + s.totalMonthlyExpenses, 0);
    const hangarMaintenanceFee = activeCount > 0 ? 3000000000 + (activeCount * 800000000) : 1500000000;
    const totalCycleExpenses = totalSquadronExp + hangarMaintenanceFee;

    const auditExpenseTrx: FinanceTransaction = {
      id: 'trx-audit-exp-' + now,
      date: new Date(now).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
      type: 'EXPENSE',
      category: 'FLIGHT_OPERATIONS',
      amount: totalCycleExpenses,
      title: language === 'id' ? `Tutup Buku & Pembiayaan Operasional Bulan ke-${profile.monthlyFiscalCycle}` : `Monthly Balance Settlement (Cycle #${profile.monthlyFiscalCycle})`,
      description: language === 'id'
        ? `Pembiayaan gaji personel, pemeliharaan alutsista, avtur, dan fasilitas pangkalan ${profile.lanudName} untuk ${activeCount} skuadron organik aktif.`
        : `Payment of personnel payroll, aircraft maintenance, fuel, and facility costs for ${activeCount} active squadrons at ${profile.lanudName}.`,
      referenceCode: `AUDIT-CLOSING-${profile.lanudIcao}-${profile.fiscalYear}/${String(profile.monthlyFiscalCycle).padStart(2, '0')}`,
      status: 'AUDITED'
    };

    setProfile(prev => ({
      ...prev,
      activeCashBalance: prev.activeCashBalance - totalCycleExpenses,
      transactions: [auditExpenseTrx, ...prev.transactions]
    }));

    speak(
      language === 'id'
        ? `Proses tutup buku selesai. Seluruh gaji personel dan beban operasional pangkalan telah terbayar.`
        : `Monthly fiscal closing completed. Personnel payroll and base operations successfully settled.`
    );
    showNotification(language === 'id' ? `Tutup buku bulanan selesai dibukukan (-${formatCompactRupiah(totalCycleExpenses)})` : `Monthly cycle audited (-${formatCompactRupiah(totalCycleExpenses)})`);
  };

  // Quick Procurement
  const handleQuickProcure = (type: 'fuel' | 'munitions' | 'hangar_overhaul') => {
    const now = Date.now();
    let amount = 0;
    let title = '';
    let desc = '';
    let category: ExpenseCategory = 'FUEL_LOGISTICS';

    if (type === 'fuel') {
      amount = 2500000000; // 2.5 Miliar
      title = language === 'id' ? 'Pengadaan Pasokan Avtur Cepat (+50.000 Lbs)' : 'Rapid Jet-A1 Fuel Stockpile (+50k Lbs)';
      desc = language === 'id' ? 'Penambahan cadangan bahan bakar taktis depot pangkalan.' : 'Refilling base strategic fuel storage.';
      category = 'FUEL_LOGISTICS';
    } else if (type === 'munitions') {
      amount = 4000000000; // 4 Miliar
      title = language === 'id' ? 'Restok Rudal AIM-120 & AIM-9X Sidewinder' : 'AIM-120 AMRAAM & AIM-9X Restock';
      desc = language === 'id' ? 'Pengadaan munisi udara-ke-udara pandu radar & inframerah.' : 'Precision air-to-air missile restocking.';
      category = 'WEAPONS_MUNITIONS';
    } else {
      amount = 1800000000; // 1.8 Miliar
      title = language === 'id' ? 'Inspeksi Kilat & Kalibrasi Fasilitas Hanggar' : 'Rapid Hangar & Runway Calibration';
      desc = language === 'id' ? 'Perawatan rutin runway, arresting gear, dan sistem radar pangkalan.' : 'Runway surface, arresting cable and radar maintenance.';
      category = 'HANGAR_FACILITY';
    }

    if (profile.activeCashBalance < amount) {
      showNotification(language === 'id' ? 'Kas Lanud tidak mencukupi untuk pengadaan ini!' : 'Insufficient base treasury for this procurement!');
      return;
    }

    const procTrx: FinanceTransaction = {
      id: 'trx-proc-' + now,
      date: new Date(now).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
      type: 'EXPENSE',
      category,
      amount,
      title,
      description: desc,
      referenceCode: `PROC-${now.toString().slice(-6)}`,
      status: 'CONFIRMED'
    };

    setProfile(prev => ({
      ...prev,
      activeCashBalance: prev.activeCashBalance - amount,
      transactions: [procTrx, ...prev.transactions]
    }));

    showNotification(language === 'id' ? `Pengadaan ${title} berhasil (-${formatCompactRupiah(amount)})` : `Procurement confirmed (-${formatCompactRupiah(amount)})`);
  };

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return profile.transactions.filter(t => {
      if (ledgerFilter === 'INCOME' && t.type !== 'INCOME') return false;
      if (ledgerFilter === 'EXPENSE' && t.type !== 'EXPENSE') return false;
      if (selectedSquadronFilter !== 'ALL' && t.squadronId && t.squadronId !== selectedSquadronFilter) return false;
      if (ledgerSearch) {
        const query = ledgerSearch.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.referenceCode.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [profile.transactions, ledgerFilter, selectedSquadronFilter, ledgerSearch]);

  return (
    <div className="flex-1 h-full bg-[#070a0f] text-slate-100 flex flex-col overflow-hidden font-sans relative">
      {/* Toast notification banner */}
      <AnimatePresence>
        {feedbackNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[3000] bg-emerald-500/90 text-white px-5 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-2xl border border-emerald-300 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top LANUD Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0c121d] via-[#101826] to-[#0c121d] border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                <span>{profile.lanudName}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                  {profile.lanudIcao}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {profile.lanudClass}
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>{language === 'id' ? 'Komandan:' : 'Commander:'} <strong className="text-white">{profile.commanderRank} {profile.commanderName}</strong></span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">
                {activeSquadrons.length} {language === 'id' ? 'Skuadron Aktif Dihitung' : 'Active Squadrons Audited'}
              </span>
            </p>
          </div>
        </div>

        {/* Airbase Selector & Report Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Lanud Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedLanud}
              onChange={(e) => handleSelectLanud(e.target.value)}
              className="bg-slate-900 border border-white/15 text-white text-xs rounded-xl px-3 py-2 font-mono font-bold focus:outline-none focus:border-blue-500 hover:border-white/30 transition-all cursor-pointer"
            >
              {Object.keys(INDONESIAN_LANUD_FINANCE_CONFIGS).map((k) => (
                <option key={k} value={k} className="bg-slate-900 text-white">
                  {k} ({INDONESIAN_LANUD_FINANCE_CONFIGS[k].icao})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title={language === 'id' ? 'Cetak Laporan Keuangan LANUD' : 'Print Airbase Financial Report'}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Cetak LPJ' : 'Print Statement'}</span>
          </button>

          <button
            onClick={handleClaimMonthlyDipa}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            title={language === 'id' ? 'Cairkan Subsidi DIPA Bulanan dari Pemerintah' : 'Claim Monthly Government DIPA Defense Grant'}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Klaim DIPA' : 'Claim DIPA'}</span>
          </button>
        </div>
      </div>

      {/* 5 Key Financial Metric Cards (Interactive Live Breakdown) */}
      <div className="p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0 bg-[#0a0e17] border-b border-white/5">
        {/* 1. Kas Aktif */}
        <div 
          onClick={() => handleOpenMetricModal('cash')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg relative overflow-hidden cursor-pointer hover:border-emerald-400 hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
              {language === 'id' ? 'Kas Aktif LANUD' : 'Airbase Treasury'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-emerald-300 truncate">
            {formatRupiah(profile.activeCashBalance)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
            <div className="flex items-center gap-1 text-emerald-400/80">
              <TrendingUp className="w-3 h-3" />
              <span>{language === 'id' ? 'Likuiditas Prima' : 'Prime Liquidity'}</span>
            </div>
            <span className="text-emerald-300 group-hover:underline font-bold text-[8.5px]">
              {language === 'id' ? '🔍 Rincian' : '🔍 Details'}
            </span>
          </div>
        </div>

        {/* 2. Pemasukan Bulanan */}
        <div 
          onClick={() => handleOpenMetricModal('income')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-blue-500/20 shadow-md cursor-pointer hover:border-blue-400 hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">
              {language === 'id' ? 'Pemasukan DIPA' : 'DIPA Revenue'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-blue-300 truncate">
            {formatCompactRupiah(totalInflow)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-400">
            <span className="truncate">{language === 'id' ? 'DIPA, Misi, Medali' : 'Grants, Medals'}</span>
            <span className="text-blue-300 group-hover:underline font-bold text-[8.5px] shrink-0">
              {language === 'id' ? '🔍 Rincian' : '🔍 Details'}
            </span>
          </div>
        </div>

        {/* 3. Pengeluaran Bulanan */}
        <div 
          onClick={() => handleOpenMetricModal('expense')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-red-500/20 shadow-md cursor-pointer hover:border-red-400 hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider">
              {language === 'id' ? 'Pengeluaran LANUD' : 'Expenditures'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500/30 transition-colors">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-red-300 truncate">
            {formatCompactRupiah(totalOutflow)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-400">
            <span className="truncate">{activeSquadrons.length} {language === 'id' ? 'Skuadron Aktif' : 'Active Squadrons'}</span>
            <span className="text-red-300 group-hover:underline font-bold text-[8.5px] shrink-0">
              {language === 'id' ? '🔍 Rincian' : '🔍 Details'}
            </span>
          </div>
        </div>

        {/* 4. Surplus Bersih */}
        <div 
          onClick={() => handleOpenMetricModal('net_cash')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-md cursor-pointer hover:border-amber-400 hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">
              {language === 'id' ? 'Arus Kas Bersih' : 'Net Cashflow'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/30 transition-colors">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={cn(
            "text-base sm:text-lg font-black font-mono truncate",
            monthlySurplus >= 0 ? "text-emerald-400" : "text-rose-400"
          )}>
            {monthlySurplus >= 0 ? '+' : ''}{formatCompactRupiah(monthlySurplus)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-400">
            <span className="truncate">{language === 'id' ? 'Surplus Operasi' : 'Ops Surplus'}</span>
            <span className="text-amber-300 group-hover:underline font-bold text-[8.5px] shrink-0">
              {language === 'id' ? '🔍 Rincian' : '🔍 Details'}
            </span>
          </div>
        </div>

        {/* 5. Skor Kesehatan Keuangan */}
        <div 
          onClick={() => handleOpenMetricModal('health')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 shadow-md col-span-2 lg:col-span-1 cursor-pointer hover:border-cyan-400 hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider">
              {language === 'id' ? 'Kesehatan Fiskal' : 'Fiscal Health'}
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-300">{profile.financialHealthScore}/100</span>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mb-1.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
              style={{ width: `${profile.financialHealthScore}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold font-mono text-cyan-300">
            <span>{profile.financialHealthGrade}</span>
            <span className="group-hover:underline text-[8.5px]">
              {language === 'id' ? '🔍 Rincian' : '🔍 Details'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="px-4 sm:px-5 py-2 bg-[#0c111a] border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
        {[
          { id: 'overview', labelId: 'Ikhtisar & Neraca', labelEn: 'Overview & Balance', icon: Landmark },
          { id: 'squadrons', labelId: 'Beban Skuadron Organik', labelEn: 'Squadron Payroll & Ops', icon: Plane },
          { id: 'expenses', labelId: 'Rincian Pengeluaran Detail', labelEn: 'Detailed Expenditures', icon: CreditCard },
          { id: 'ledger', labelId: 'Buku Kas & Log Transaksi', labelEn: 'Ledger & Audit History', icon: FileText },
          { id: 'rewards', labelId: 'Poin, Medali & Bonus Misi', labelEn: 'Points & Medal Rewards', icon: Award },
          { id: 'policy', labelId: 'Alokasi Kebijakan DIPA', labelEn: 'DIPA Budget Policy', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFinanceTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFinanceTab(tab.id as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap shrink-0",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40"
                  : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{language === 'id' ? tab.labelId : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
        {/* TAB 1: IKHTISAR & NERACA */}
        {activeFinanceTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Action Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-slate-900 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                    {language === 'id' ? 'TAHUN ANGGARAN' : 'FISCAL YEAR'} {profile.fiscalYear} • {language === 'id' ? `BULAN KE-${profile.monthlyFiscalCycle}` : `CYCLE #${profile.monthlyFiscalCycle}`}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">DIPA KEMHAN RI</span>
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  {language === 'id' ? 'Alokasi Rutin Bulanan LANUD:' : 'Monthly Base Defense Allocation:'} {formatRupiah(profile.monthlyGovernmentDipa)}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  {language === 'id'
                    ? `Pemerintah memberikan subsidi tetap DIPA setiap bulan untuk mendukung kesiapan tempur ${activeSquadrons.length} skuadron aktif di pangkalan udara ini.`
                    : `Monthly state defense funding allocated to sustain ${activeSquadrons.length} active combat squadron(s) readiness.`}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleClaimMonthlyDipa}
                  className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold uppercase font-mono tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Coins className="w-4 h-4" />
                  <span>{language === 'id' ? 'Cairkan Alokasi Bulanan' : 'Claim Monthly Grant'}</span>
                </button>
                <button
                  onClick={handleRunMonthlyAudit}
                  className="flex-1 md:flex-none px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-2xl text-xs font-bold uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  <span>{language === 'id' ? 'Tutup Buku Bulanan' : 'Monthly Audit'}</span>
                </button>
              </div>
            </div>

            {/* Active Squadrons vs Standby Alert */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-300 border border-blue-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono">
                    {language === 'id' 
                      ? `Manajemen Multi-Skuadron: ${activeSquadrons.length} Skuadron Aktif / ${profile.squadrons.length} Total`
                      : `Multi-Squadron Management: ${activeSquadrons.length} Active / ${profile.squadrons.length} Total`}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {language === 'id'
                      ? 'Jika hanya 1 skuadron dibuka, manajemen keuangan hanya menghitung skuadron aktif tersebut. Saat membuka skuadron lain, seluruh administrasi alutsista otomatis terhitung.'
                      : 'When only 1 squadron is unlocked, the finance ledger calculates solely for that active squadron. Additional unlocked squadrons dynamically update base overhead.'}
                  </p>
                </div>
              </div>

              {onNavigateToSquadron && (
                <button
                  onClick={onNavigateToSquadron}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto shadow-md"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>{language === 'id' ? 'Buka Skuadron di Manajemen' : 'Squadron Management'}</span>
                </button>
              )}
            </div>

            {/* Stationed Squadrons Overview Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Plane className="w-4 h-4 text-blue-400" />
                  <span>
                    {language === 'id' ? 'Skuadron Organik di Bawah Komando' : 'Stationed Organic Squadrons at'} {profile.lanudName} ({profile.squadrons.length} {language === 'id' ? 'Skuadron' : 'Squadrons'})
                  </span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {language === 'id' ? 'Alutsista Aktif:' : 'Active Aircraft:'}{' '}
                  <strong className="text-white">{activeSquadrons.reduce((a, s) => a + s.aircraftCount, 0)} {language === 'id' ? 'Unit' : 'Units'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {profile.squadrons.map((sq) => {
                  const isActive = sq.isActive;
                  return (
                    <div
                      key={sq.id}
                      className={cn(
                        "p-5 rounded-2xl border transition-all space-y-4 shadow-xl relative overflow-hidden",
                        isActive 
                          ? "bg-slate-900/90 border-blue-500/30 hover:border-blue-400" 
                          : "bg-slate-950/60 border-white/5 opacity-70"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white uppercase">{sq.name}</h4>
                            {isActive ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                                {language === 'id' ? 'AKTIF' : 'ACTIVE'}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10 text-[9px] font-mono font-bold uppercase">
                                {language === 'id' ? 'CADANGAN (STANDBY)' : 'STANDBY (RESERVE)'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amber-400 font-mono">"{sq.nickname}"</p>
                        </div>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                            {sq.readinessScore}% {language === 'id' ? 'Kesiapan' : 'Ready'}
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-2 text-xs font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">{language === 'id' ? 'Tipe Pesawat:' : 'Aircraft:'}</span>
                          <span className="font-bold text-white">{sq.aircraftName}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">{language === 'id' ? 'Kekuatan Armada:' : 'Fleet Count:'}</span>
                          <span className={isActive ? "text-blue-400 font-bold" : "text-slate-500"}>
                            {isActive ? `${sq.aircraftCount} ${language === 'id' ? 'Pesawat Tempur' : 'Fighters'}` : (language === 'id' ? '0 Unit (Terkunci)' : '0 Units (Locked)')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">{language === 'id' ? 'Personel Pilot:' : 'Pilots:'}</span>
                          <span className={isActive ? "text-emerald-400 font-bold" : "text-slate-500"}>
                            {isActive ? `${sq.pilotCount} ${language === 'id' ? 'Penerbang' : 'Pilots'}` : '0'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">{language === 'id' ? 'Teknisi & Kru:' : 'Tech Crew:'}</span>
                          <span className={isActive ? "text-slate-200" : "text-slate-500"}>
                            {isActive ? `${sq.technicianCount + sq.groundCrewCount} ${language === 'id' ? 'Personel' : 'Personnel'}` : '0'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">{language === 'id' ? 'Total Beban/Bulan:' : 'Monthly Cost:'}</span>
                        <span className={cn(
                          "text-sm font-black",
                          isActive ? "text-red-400" : "text-slate-500 font-normal"
                        )}>
                          {isActive ? formatCompactRupiah(sq.totalMonthlyExpenses) : 'Rp 0 (Standby)'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Restocking / Base Procurement Center */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <span>{language === 'id' ? 'Pengadaan Cepat & Restok Logistik Pangkalan (Quick Procurement)' : 'Rapid Base Logistics Procurement'}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{language === 'id' ? 'Pasokan Bahan Bakar Avtur' : 'Jet-A1 Fuel Stock'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">+50.000 Lbs {language === 'id' ? 'Cadangan BBM' : 'Fuel Reserve'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{language === 'id' ? 'Biaya Pengadaan:' : 'Cost:'}</span>
                    <span className="font-bold text-orange-400">{formatCompactRupiah(2500000000)}</span>
                  </div>
                  <button
                    onClick={() => handleQuickProcure('fuel')}
                    className="w-full py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-bold font-mono uppercase transition-all"
                  >
                    {language === 'id' ? 'Beli Pasokan Avtur' : 'Procure Fuel'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{language === 'id' ? 'Restok Rudal & Munisi' : 'Missile & Ammo Restock'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">AIM-120 & 20mm Vulcan</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{language === 'id' ? 'Biaya Pengadaan:' : 'Cost:'}</span>
                    <span className="font-bold text-red-400">{formatCompactRupiah(4000000000)}</span>
                  </div>
                  <button
                    onClick={() => handleQuickProcure('munitions')}
                    className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold font-mono uppercase transition-all"
                  >
                    {language === 'id' ? 'Restok Munisi Armory' : 'Restock Munitions'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{language === 'id' ? 'Perawatan Fasilitas Hanggar' : 'Hangar Facility Overhaul'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Runway & Radar Calibration</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{language === 'id' ? 'Biaya Pengadaan:' : 'Cost:'}</span>
                    <span className="font-bold text-blue-400">{formatCompactRupiah(1800000000)}</span>
                  </div>
                  <button
                    onClick={() => handleQuickProcure('hangar_overhaul')}
                    className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold font-mono uppercase transition-all"
                  >
                    {language === 'id' ? 'Inspeksi Hanggar & Runway' : 'Inspect Facility'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BEBAN & ADMINISTRASI MULTI-SKUADRON */}
        {activeFinanceTab === 'squadrons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {language === 'id' ? 'Matriks Administrasi & Payroll Multi-Skuadron' : 'Multi-Squadron Administration & Payroll Matrix'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {language === 'id' 
                    ? `Rincian pengeluaran per skuadron di bawah naungan ${profile.lanudName}`
                    : `Itemized expenditures per squadron under ${profile.lanudName}`}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-4">{language === 'id' ? 'Skuadron' : 'Squadron'}</th>
                    <th className="p-4">{language === 'id' ? 'Status' : 'Status'}</th>
                    <th className="p-4">{language === 'id' ? 'Alutsista' : 'Fleet'}</th>
                    <th className="p-4">{language === 'id' ? 'Personel' : 'Personnel'}</th>
                    <th className="p-4">{language === 'id' ? 'Gaji Pilot' : 'Pilot Salary'}</th>
                    <th className="p-4">{language === 'id' ? 'Gaji Kru/Teknisi' : 'Crew Salary'}</th>
                    <th className="p-4">{language === 'id' ? 'Pemeliharaan Jet' : 'Maintenance'}</th>
                    <th className="p-4">{language === 'id' ? 'BBM & Munisi' : 'Fuel & Ammo'}</th>
                    <th className="p-4 text-right">{language === 'id' ? 'Total Beban/Bulan' : 'Total Cost/Mo'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-950">
                  {profile.squadrons.map((sq) => {
                    const isActive = sq.isActive;
                    return (
                      <tr key={sq.id} className={cn("transition-colors", isActive ? "hover:bg-slate-900/60" : "opacity-60 bg-black/30")}>
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <Plane className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500")} />
                            <span>{sq.name}</span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-sans">"{sq.nickname}"</span>
                        </td>
                        <td className="p-4">
                          {isActive ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              {language === 'id' ? 'AKTIF' : 'ACTIVE'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10 text-[10px]">
                              {language === 'id' ? 'CADANGAN' : 'STANDBY'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-300">
                          <div className="font-bold text-white">{isActive ? `${sq.aircraftCount} Unit` : '0 Unit'}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{sq.aircraftName}</div>
                        </td>
                        <td className="p-4 text-slate-300">
                          <div>{isActive ? `${sq.pilotCount} Pilot` : '0'}</div>
                          <div className="text-[10px] text-slate-400">{isActive ? `${sq.technicianCount + sq.groundCrewCount} Kru` : '0'}</div>
                        </td>
                        <td className="p-4 text-emerald-400 font-bold">
                          {isActive ? formatCompactRupiah(sq.monthlyPilotPayroll) : 'Rp 0'}
                        </td>
                        <td className="p-4 text-teal-400">
                          {isActive ? formatCompactRupiah(sq.monthlyCrewPayroll) : 'Rp 0'}
                        </td>
                        <td className="p-4 text-blue-400">
                          {isActive ? formatCompactRupiah(sq.monthlyMaintenanceCost) : 'Rp 0'}
                        </td>
                        <td className="p-4 text-orange-400">
                          {isActive ? formatCompactRupiah(sq.monthlyFuelBurnCost + sq.monthlyMunitionsCost) : 'Rp 0'}
                        </td>
                        <td className="p-4 text-right font-bold text-sm">
                          <span className={isActive ? "text-red-400" : "text-slate-500 font-normal"}>
                            {isActive ? formatCompactRupiah(sq.totalMonthlyExpenses) : 'Rp 0'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RINCIAN PENGELUARAN DETAIL */}
        {activeFinanceTab === 'expenses' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              {language === 'id' ? '8 Pos Pengeluaran Operasional Komando LANUD' : '8 Airbase Operating Cost Categories'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: language === 'id' ? '1. Pemeliharaan & Overhaul Pesawat' : '1. Aircraft Maintenance & Overhaul',
                  icon: Wrench,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/20',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyMaintenanceCost, 0),
                  desc: language === 'id' 
                    ? 'Inspeksi 100-jam terbang, kalibrasi radar AESA, uji hidrolik dan peremajaan komponen struktur sayap jet tempur aktif.'
                    : '100-hour inspection, AESA radar calibration, hydraulics testing and wing structure refurbishment for active jets.'
                },
                {
                  title: language === 'id' ? '2. Perawatan Hanggar, Runway & Fasilitas' : '2. Hangar, Runway & Facility Maintenance',
                  icon: Building,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/20',
                  amount: activeSquadrons.length > 0 ? 3000000000 + (activeSquadrons.length * 800000000) : 1500000000,
                  desc: language === 'id'
                    ? 'Perawatan fasilitas shelter hanggar, pelapisan aspal runway, kabel arresting gear, sistem pemadam darurat dan radar tower.'
                    : 'Hangar shelter maintenance, runway resurfacing, arresting wire systems and ATC radar tower sustainment.'
                },
                {
                  title: language === 'id' ? '3. Operasional Penerbangan & Sortie' : '3. Flight Operations & Sortie Support',
                  icon: Radio,
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/20',
                  amount: activeSquadrons.length > 0 ? 2500000000 : 1000000000,
                  desc: language === 'id'
                    ? 'Dukungan navigasi radar datalink Link-16, perijinan flight clearance, ground handling sortie dan briefing cuaca BMKG.'
                    : 'Link-16 datalink radar support, flight clearance handling, ground support and BMKG meteorological briefings.'
                },
                {
                  title: language === 'id' ? '4. Gaji & Tunjangan Ground Crew / Teknisi' : '4. Ground Crew & Technician Payroll',
                  icon: Users,
                  color: 'text-teal-400',
                  bg: 'bg-teal-500/20',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyCrewPayroll, 0),
                  desc: language === 'id'
                    ? 'Payroll bulanan bintara dan tamtama teknisi avionik, mesin jet turbofan, kru persenjataan dan logistik darat aktif.'
                    : 'Monthly payroll for active avionics NCOs, turbofan engine technicians, armory crews, and ground logistics.'
                },
                {
                  title: language === 'id' ? '5. Gaji Pilot & Tunjangan Bahaya Terbang' : '5. Pilot Salaries & Hazard Pay',
                  icon: Shield,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/20',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyPilotPayroll, 0),
                  desc: language === 'id'
                    ? 'Gaji pokok perwira penerbang tempur, tunjangan resiko bahaya maut terbang, dan insentif jam terbang supersonik.'
                    : 'Base officer pay for fighter pilots, hazard allowances, and supersonic flight incentive pay.'
                },
                {
                  title: language === 'id' ? '6. Logistik Bahan Bakar (Avtur)' : '6. Avtur Fuel Logistics',
                  icon: Fuel,
                  color: 'text-orange-400',
                  bg: 'bg-orange-500/20',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyFuelBurnCost, 0),
                  desc: language === 'id'
                    ? 'Pengadaan bahan bakar Jet A-1 / JP-8 kualitas militer untuk kesiapan scramble alert dan sortie patroli udara.'
                    : 'Procurement of military-grade JP-8 aviation turbine fuel for scramble readiness and routine sorties.'
                },
                {
                  title: language === 'id' ? '7. Persenjataan & Restok Munisi' : '7. Armory & Munitions Quota',
                  icon: Crosshair,
                  color: 'text-red-400',
                  bg: 'bg-red-500/20',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyMunitionsCost, 0),
                  desc: language === 'id'
                    ? 'Pengadaan rudal udara-ke-udara, bom pintar berpemandu laser, dan peluru kanon 20mm/30mm.'
                    : 'Procurement of air-to-air missiles, laser-guided smart bombs, and 20mm/30mm cannon shells.'
                },
                {
                  title: language === 'id' ? '8. Upgrade & Modernisasi Generasi' : '8. Modernization & Avionics Upgrades',
                  icon: Sparkles,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/20',
                  amount: 2000000000,
                  desc: language === 'id'
                    ? 'Anggaran riset dan instalasi retrofit avionik generasi lanjutan (Glass Cockpit, EW Pod, Datalink Satelit).'
                    : 'R&D budget and avionics retrofit installations (Glass Cockpit, Electronic Warfare Pods, Satellite Link).'
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase">{item.title}</h4>
                      </div>
                      <span className="text-sm font-black font-mono text-red-400">
                        {formatCompactRupiah(item.amount)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BUKU KAS & RIWAYAT TRANSAKSI */}
        {activeFinanceTab === 'ledger' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
                  <button
                    onClick={() => setLedgerFilter('ALL')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all",
                      ledgerFilter === 'ALL' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {language === 'id' ? `Semua (${profile.transactions.length})` : `All (${profile.transactions.length})`}
                  </button>
                  <button
                    onClick={() => setLedgerFilter('INCOME')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all",
                      ledgerFilter === 'INCOME' ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {language === 'id' ? 'Pemasukan' : 'Income'}
                  </button>
                  <button
                    onClick={() => setLedgerFilter('EXPENSE')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all",
                      ledgerFilter === 'EXPENSE' ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {language === 'id' ? 'Pengeluaran' : 'Expense'}
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'id' ? "Cari transaksi / kode..." : "Search transaction / ref..."}
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
              {filteredLedger.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic font-mono bg-slate-900/50 rounded-2xl border border-white/5">
                  {language === 'id' ? 'Tidak ada transaksi yang cocok dengan kriteria pencarian.' : 'No transactions matched search criteria.'}
                </div>
              ) : (
                filteredLedger.map((trx) => (
                  <div
                    key={trx.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-white/5 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        trx.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {trx.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{trx.title}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/5 text-slate-400 border border-white/10">
                            {trx.referenceCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{trx.description}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">{trx.date}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black font-mono ${
                        trx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {trx.type === 'INCOME' ? '+' : '-'}{formatRupiah(trx.amount)}
                      </p>
                      <span className="text-[9px] font-mono text-emerald-400/70 font-bold uppercase">
                        {trx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: POIN, MEDALI & BONUS MISI */}
        {activeFinanceTab === 'rewards' && (
          <div className="space-y-6">
            {/* Points Conversion Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                      {language === 'id' ? 'Konversi Poin Misi ke Kas Operasional LANUD' : 'Convert Mission Merit Points to Airbase Treasury'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {language === 'id' ? 'Poin Akumulasi Pemain:' : 'Player Accumulated Points:'} <strong className="text-blue-400 font-bold">{points} {language === 'id' ? 'POIN' : 'PTS'}</strong> ({language === 'id' ? 'Kurs: 1 Poin = Rp 5.000.000' : 'Rate: 1 Pt = Rp 5,000,000'})
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{language === 'id' ? 'Poin yang Dikonversi' : 'Points to Convert'}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={points}
                      value={pointsToConvert}
                      onChange={(e) => setPointsToConvert(Math.min(points, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-24 bg-slate-900 border border-white/20 rounded-lg px-2 py-1 text-sm font-bold font-mono text-white text-center"
                    />
                    <button
                      onClick={() => setPointsToConvert(points)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-mono font-bold"
                    >
                      {language === 'id' ? `Maks (${points})` : `Max (${points})`}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{language === 'id' ? 'Hasil Dana Kas Tambahan' : 'Resulting Cash Credit'}</span>
                  <p className="text-base font-black font-mono text-emerald-400">
                    +{formatCompactRupiah(pointsToConvert * 5000000)}
                  </p>
                </div>

                <div className="flex items-end">
                  <button
                    disabled={pointsToConvert <= 0 || points < pointsToConvert}
                    onClick={handleConvertPoints}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    <span>{language === 'id' ? 'Cairkan ke Kas LANUD' : 'Deposit into Base Treasury'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Medals & State Commendations */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{language === 'id' ? 'Tanda Jasa & Medali Kehormatan Negara (State Honorary Stipends)' : 'State Honors & Military Medal Stipends'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medals.map((medal) => (
                  <div
                    key={medal.id}
                    className={cn(
                      "p-5 rounded-2xl border transition-all space-y-3 shadow-lg",
                      medal.claimed
                        ? "bg-slate-900/60 border-emerald-500/30 opacity-80"
                        : medal.unlocked
                        ? "bg-slate-900 border-amber-500/40 hover:border-amber-400"
                        : "bg-slate-950/80 border-white/5 opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          medal.claimed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : medal.unlocked
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase">
                            {language === 'id' ? medal.nameId : medal.nameEn}
                          </h4>
                          <span className="text-[9px] font-mono text-amber-400/80">{medal.category}</span>
                        </div>
                      </div>

                      <span className="text-xs font-black font-mono text-emerald-400">
                        +{formatCompactRupiah(medal.monetaryReward)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans">
                      {language === 'id' ? medal.descriptionId : medal.descriptionEn}
                    </p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-slate-400">{language === 'id' ? `Syarat: ${medal.requiredCondition}` : `Requirement: ${medal.requiredCondition}`}</span>
                      <button
                        disabled={!medal.unlocked || medal.claimed}
                        onClick={() => handleClaimMedal(medal.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all",
                          medal.claimed
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                            : medal.unlocked
                            ? "bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 active:scale-95"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        )}
                      >
                        {medal.claimed 
                          ? (language === 'id' ? 'Sudah Dicairkan' : 'Disbursed') 
                          : medal.unlocked 
                          ? (language === 'id' ? 'Klaim Tunjangan' : 'Claim Grant') 
                          : (language === 'id' ? 'Terkunci' : 'Locked')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ALOKASI KEBIJAKAN DIPA */}
        {activeFinanceTab === 'policy' && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {language === 'id' ? 'Distribusi Alokasi Anggaran DIPA Operasional LANUD' : 'Airbase DIPA Defense Budget Allocation Policy'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {language === 'id'
                    ? 'Atur persentase pembiayaan per sektor untuk meningkatkan kesiapan tempur alutsista pangkalan.'
                    : 'Adjust sector expenditure quotas to maximize combat readiness of active airbase assets.'}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { key: 'maintenancePercent', labelId: 'Pemeliharaan Alutsista & Overhaul Pesawat', labelEn: 'Fleet Maintenance & Aircraft Overhaul', color: 'bg-blue-500' },
                  { key: 'munitionsPercent', labelId: 'Persenjataan, Rudal & Gudang Munisi (Armory)', labelEn: 'Munitions, Missiles & Tactical Armory', color: 'bg-red-500' },
                  { key: 'personnelPercent', labelId: 'Kesejahteraan, Gaji & Asuransi Personel Penerbang', labelEn: 'Pilot Welfare, Payroll & Flight Insurance', color: 'bg-emerald-500' },
                  { key: 'fuelLogisticsPercent', labelId: 'Cadangan Logistik Avtur & BBM Taktis', labelEn: 'Avtur Fuel Logistics & Tactical Reserves', color: 'bg-orange-500' },
                  { key: 'facilityUpgradePercent', labelId: 'Modernisasi Avionik & Fasilitas Radar Hanggar', labelEn: 'Avionics Modernization & Radar Facilities', color: 'bg-purple-500' }
                ].map((item) => {
                  const val = (profile.budgetAllocations as any)[item.key] || 20;
                  return (
                    <div key={item.key} className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-white">{language === 'id' ? item.labelId : item.labelEn}</span>
                        <span className="font-black text-amber-400">{val}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={val}
                        onChange={(e) => {
                          const num = parseInt(e.target.value);
                          setProfile(prev => ({
                            ...prev,
                            budgetAllocations: {
                              ...prev.budgetAllocations,
                              [item.key]: num
                            }
                          }));
                        }}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => showNotification(language === 'id' ? 'Kebijakan alokasi DIPA tersimpan!' : 'DIPA allocation policy saved!')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase font-mono tracking-wider shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  {language === 'id' ? 'Simpan Kebijakan DIPA' : 'Save Allocation Policy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial Statement Print Modal */}
      <FinanceReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        language={language}
        profile={profile}
      />

      {/* Real-time Metric Breakdown Modal */}
      <FinanceMetricDetailModal
        isOpen={showMetricDetailModal}
        onClose={() => setShowMetricDetailModal(false)}
        metric={selectedDetailMetric}
        onSelectMetric={setSelectedDetailMetric}
        profile={profile}
        totalInflow={totalInflow}
        totalOutflow={totalOutflow}
        monthlySurplus={monthlySurplus}
        points={points}
        flightHours={flightHours}
        language={language}
        onClaimDipa={handleClaimMonthlyDipa}
        onConvertPoints={handleConvertPoints}
        onRunAudit={handleRunMonthlyAudit}
        pointsToConvert={pointsToConvert}
        setPointsToConvert={setPointsToConvert}
        onNavigateToSquadron={onNavigateToSquadron}
      />
    </div>
  );
};
