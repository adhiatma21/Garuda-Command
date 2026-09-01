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
  Info,
  Volume2,
  SlidersHorizontal,
  Activity,
  Gauge,
  Cpu,
  Radar
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

// Tactical Aircraft Visuals
import f16Side from '../../../assets/images/f16_side_render_1787665744962.jpg';
import rafaleSide from '../../../assets/images/rafale_side_render_1787665816351.jpg';
import su30Side from '../../../assets/images/su30_side_render_1787665782674.jpg';
import t50Side from '../../../assets/images/t50_side_render_1788011436142.jpg';
import hawkSide from '../../../assets/images/hawk_side_render_1788011377032.jpg';
import tucanoSide from '../../../assets/images/tucano_side_render_1787665889643.jpg';
import c130Side from '../../../assets/images/c130_side_render_1787665919296.jpg';
import militaryEmblem from '../../../assets/images/military_emblem_1779193633060.png';

const AIRCRAFT_RENDER_MAP: Record<string, string> = {
  'f16-emlu': f16Side,
  'f16-cd': f16Side,
  'rafale': rafaleSide,
  'su30-mk2': su30Side,
  't50i': t50Side,
  'hawk209': hawkSide,
  'emb314': tucanoSide,
  'c130j': c130Side,
  'c130h': c130Side
};

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

  // Determine initial Airbase from player profile
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
  const [feedbackNotification, setFeedbackNotification] = useState<{ message: string; type?: 'success' | 'alert' } | null>(null);

  // Metric Details Modal State (Kas Aktif, Pemasukan DIPA, Pengeluaran Airbase, Arus Kas Bersih, Kesehatan Fiskal)
  const [showMetricDetailModal, setShowMetricDetailModal] = useState(false);
  const [selectedDetailMetric, setSelectedDetailMetric] = useState<MetricType>('cash');

  const handleOpenMetricModal = (m: MetricType) => {
    setSelectedDetailMetric(m);
    setShowMetricDetailModal(true);
  };

  // When selected Airbase changes, generate a profile for that Airbase
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
    showNotification(language === 'id' ? `Beralih ke Komando Keuangan Airbase ${lanudName}` : `Switched to ${lanudName} Airbase Financial Command`);
  };

  const showNotification = (msg: string, type: 'success' | 'alert' = 'success') => {
    setFeedbackNotification({ message: msg, type });
    setTimeout(() => {
      setFeedbackNotification(null);
    }, 4500);
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
      title: language === 'id' ? 'Klaim Alokasi DIPA APBN Bulanan' : 'Monthly Government DIPA Defense Grant',
      description: language === 'id' 
        ? `Pencairan dana anggaran rutin pertahanan udara pangkalan ${profile.lanudName} (${activeCount} skuadron organik aktif) siklus ke-${profile.monthlyFiscalCycle + 1}.`
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
        ? `Pencairan subsidi DIPA pemerintah berhasil. Kas pangkalan udara bertambah ${formatCompactRupiah(amount)}.`
        : `Government defense DIPA grant credited. Airbase treasury increased by ${formatCompactRupiah(amount)}.`
    );
    showNotification(language === 'id' ? `Alokasi DIPA Pertahanan dicairkan (+${formatCompactRupiah(amount)})` : `Monthly DIPA Defense Grant credited (+${formatCompactRupiah(amount)})`);
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
      title: language === 'id' ? `Konversi ${pointsToConvert} Poin Prestasi Penerbang` : `Conversion of ${pointsToConvert} Combat Merit Points`,
      description: language === 'id'
        ? `Tunjangan poin prestasi tempur penerbang dikonversikan ke kas likuiditas operasional pangkalan udara.`
        : `Combat merit reward points converted into airbase operating liquidity.`,
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
        ? `Konversi ${pointsToConvert} poin berhasil. Kas pangkalan udara bertambah ${formatCompactRupiah(totalCashGained)}.`
        : `Converted ${pointsToConvert} merit points. Base funds credited with ${formatCompactRupiah(totalCashGained)}.`
    );
    showNotification(language === 'id' ? `Poin tempur dikonversi ke Kas Airbase (+${formatCompactRupiah(totalCashGained)})` : `Points converted into Airbase Treasury (+${formatCompactRupiah(totalCashGained)})`);
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
      title: language === 'id' ? `Tunjangan Tanda Jasa: ${medal.nameId}` : `Honors Grant: ${medal.nameEn}`,
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
        : `State honor grant ${medal.nameEn} claimed. Treasury credited with ${formatCompactRupiah(medal.monetaryReward)}.`
    );
    showNotification(language === 'id' ? `Tanda jasa kehormatan dicairkan (+${formatCompactRupiah(medal.monetaryReward)})` : `Honor grant claimed (+${formatCompactRupiah(medal.monetaryReward)})`);
  };

  // Run Monthly Audit / Tutup Buku
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
      title: language === 'id' ? `Tutup Buku & Pembiayaan Operasional Bulan ke-${profile.monthlyFiscalCycle}` : `Monthly Fiscal Settlement (Cycle #${profile.monthlyFiscalCycle})`,
      description: language === 'id'
        ? `Pembiayaan gaji personel, pemeliharaan alutsista tempur, avtur, dan fasilitas pangkalan ${profile.lanudName} untuk ${activeCount} skuadron organik aktif.`
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
        ? `Proses audit dan tutup buku selesai. Seluruh beban operasional pangkalan dan gaji telah dibukukan.`
        : `Monthly fiscal closing completed. All squadron payroll and base operational expenses settled.`
    );
    showNotification(language === 'id' ? `Tutup buku bulanan selesai dibukukan (-${formatCompactRupiah(totalCycleExpenses)})` : `Monthly cycle audited (-${formatCompactRupiah(totalCycleExpenses)})`);
  };

  // Quick Tactical Procurement
  const handleQuickProcure = (type: 'fuel' | 'munitions' | 'hangar_overhaul') => {
    const now = Date.now();
    let amount = 0;
    let title = '';
    let desc = '';
    let category: ExpenseCategory = 'FUEL_LOGISTICS';

    if (type === 'fuel') {
      amount = 2500000000; // 2.5 Miliar
      title = language === 'id' ? 'Pengadaan Pasokan Avtur Cepat (+50.000 Lbs)' : 'Rapid Jet-A1 JP-8 Fuel Stockpile (+50k Lbs)';
      desc = language === 'id' ? 'Penambahan cadangan bahan bakar taktis depot pangkalan udara.' : 'Refilling strategic airbase fuel storage.';
      category = 'FUEL_LOGISTICS';
    } else if (type === 'munitions') {
      amount = 4000000000; // 4 Miliar
      title = language === 'id' ? 'Restok Rudal AIM-120 AMRAAM & AIM-9X' : 'AIM-120 AMRAAM & AIM-9X Restock';
      desc = language === 'id' ? 'Pengadaan munisi rudal udara-ke-udara pandu radar aktif dan inframerah.' : 'Precision radar and infrared guided air-to-air missiles.';
      category = 'WEAPONS_MUNITIONS';
    } else {
      amount = 1800000000; // 1.8 Miliar
      title = language === 'id' ? 'Inspeksi Kilat & Kalibrasi Fasilitas Hanggar' : 'Rapid Hangar & Runway Calibration';
      desc = language === 'id' ? 'Perawatan rutin runway, kabel arresting gear, dan sistem radar pangkalan.' : 'Runway surface, arresting cable and ATC radar calibration.';
      category = 'HANGAR_FACILITY';
    }

    if (profile.activeCashBalance < amount) {
      showNotification(language === 'id' ? 'Kas Airbase tidak mencukupi untuk pengadaan ini!' : 'Insufficient Airbase treasury for this procurement!', 'alert');
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

    speak(
      language === 'id'
        ? `Pengadaan logistik ${title} dikonfirmasi. Logistik pangkalan telah diperbarui.`
        : `Procurement of ${title} confirmed. Logistics reserves updated.`
    );
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

  const totalActiveAircraft = activeSquadrons.reduce((a, s) => a + s.aircraftCount, 0);

  return (
    <div className="flex-1 h-full bg-[#06090f] text-slate-100 flex flex-col overflow-hidden font-sans relative select-none">
      {/* Subtle Tactical HUD Grid Background Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Floating Tactical Notification Banner */}
      <AnimatePresence>
        {feedbackNotification && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className={cn(
              "absolute top-4 left-1/2 -translate-x-1/2 z-[3000] px-5 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2.5 shadow-2xl border backdrop-blur-xl",
              feedbackNotification.type === 'alert'
                ? "bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-900/30"
                : "bg-[#0b281d]/95 text-emerald-200 border-emerald-400/60 shadow-emerald-950/40"
            )}
          >
            {feedbackNotification.type === 'alert' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="tracking-wide">{feedbackNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP AIRBASE COMMAND HEADER BAR (HIGH-TECH GAME AESTHETICS) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0a0f1d] via-[#101729] to-[#0a0f1d] border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xl relative z-10">
        {/* Tactical Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

        <div className="flex items-center gap-4">
          {/* Military Emblem / Airbase Insignia Badge */}
          <div className="relative group">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-blue-600/10 to-slate-950 border border-amber-500/40 flex items-center justify-center p-1.5 shadow-xl shadow-amber-500/10">
              <img 
                src={militaryEmblem} 
                alt="Air Force Emblem" 
                className="w-full h-full object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0f1d] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-wider text-white uppercase flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
                  AIRBASE FINANCE
                </span>
                <span className="text-slate-500 font-light">|</span>
                <span className="text-slate-100 font-extrabold">{profile.lanudName}</span>
              </h1>
              
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-blue-400/40 font-bold tracking-widest">
                  {profile.lanudIcao}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {profile.lanudClass}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DEFCON 1
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-mono flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1">
              <span>{language === 'id' ? 'Komandan Pangkalan:' : 'Base Commander:'} <strong className="text-slate-200">{profile.commanderRank} {profile.commanderName}</strong> ({profile.commanderCallsign})</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-semibold">
                {activeSquadrons.length} / {profile.squadrons.length} {language === 'id' ? 'Skadron Tempur Aktif' : 'Active Squadrons'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-semibold">
                {totalActiveAircraft} {language === 'id' ? 'Alutsista Siap Terbang' : 'Airframes Ready'}
              </span>
            </p>
          </div>
        </div>

        {/* Airbase Command Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Airbase Selector Tactical Dropdown */}
          <div className="relative">
            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-widest mb-0.5 flex items-center gap-1">
              <Radar className="w-2.5 h-2.5 text-cyan-400" />
              <span>{language === 'id' ? 'PANGKALAN INDUK' : 'SECTOR AIRBASE'}</span>
            </div>
            <select
              value={selectedLanud}
              onChange={(e) => handleSelectLanud(e.target.value)}
              className="bg-[#0b101c] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs rounded-xl px-3 py-1.5 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer shadow-inner"
            >
              {Object.keys(INDONESIAN_LANUD_FINANCE_CONFIGS).map((k) => (
                <option key={k} value={k} className="bg-[#0c121d] text-white">
                  {k} [{INDONESIAN_LANUD_FINANCE_CONFIGS[k].icao}]
                </option>
              ))}
            </select>
          </div>

          {/* Print Military Statement Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2.5 mt-auto bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 hover:shadow-amber-500/10"
            title={language === 'id' ? 'Cetak Laporan Pertanggungjawaban Keuangan Airbase' : 'Print Airbase Financial Statement'}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Cetak LPJ' : 'Print Statement'}</span>
          </button>

          {/* Claim Monthly DIPA Grant Button */}
          <button
            onClick={handleClaimMonthlyDipa}
            className="px-4 py-2.5 mt-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/40 border border-emerald-300/40 transition-all active:scale-95"
            title={language === 'id' ? 'Cairkan Subsidi Anggaran DIPA Bulanan dari Pemerintah' : 'Claim Monthly Defense DIPA Grant'}
          >
            <Coins className="w-4 h-4 text-yellow-200 animate-pulse" />
            <span>{language === 'id' ? 'Klaim DIPA APBN' : 'Claim DIPA Grant'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TACTICAL STATUS TELEMETRY STRIP (GAME TELEMETRY BAR) */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-6 py-2 bg-[#090d18] border-b border-white/5 flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 overflow-x-auto shrink-0 custom-scrollbar">
        <div className="flex items-center gap-4 whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <strong className="text-white">STATUS OPERASI:</strong> NORMAL TACTICAL CLEARANCE
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>TAHUN ANGGARAN {profile.fiscalYear} • SIKLUS KE-{profile.monthlyFiscalCycle}</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Radio className="w-3 h-3" />
            <span>DATALINK KEMHAN RI: TERHUBUNG</span>
          </span>
        </div>

        <div className="flex items-center gap-4 whitespace-nowrap">
          <span className="text-slate-300">
            {language === 'id' ? 'Cadangan Poin Tempur:' : 'Combat Points:'}{' '}
            <strong className="text-amber-400">{points} PTS</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300">
            {language === 'id' ? 'Total Jam Terbang:' : 'Flight Hours:'}{' '}
            <strong className="text-cyan-400">{(flightHours / 60).toFixed(1)} Jam</strong>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 5 KEY TACTICAL METRIC CARDS (INTERACTIVE GAME HUD MODULES) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-5 gap-3.5 shrink-0 bg-[#080c15] border-b border-cyan-500/10">
        {/* CARD 1: KAS AKTIF AIRBASE */}
        <div 
          onClick={() => handleOpenMetricModal('cash')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#09101f] to-[#070b16] border border-emerald-500/40 shadow-xl relative overflow-hidden cursor-pointer hover:border-emerald-400 hover:shadow-emerald-950/40 hover:scale-[1.015] active:scale-95 transition-all group"
        >
          {/* Tactical Corner Bracket */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-emerald-400 font-mono font-black uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {language === 'id' ? 'KAS AKTIF AIRBASE' : 'AIRBASE TREASURY'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500/30 transition-colors">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-emerald-300 truncate tracking-tight">
            {formatRupiah(profile.activeCashBalance)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[9px] font-mono border-t border-emerald-500/20 pt-1.5">
            <div className="flex items-center gap-1 text-emerald-400/90 font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>{language === 'id' ? 'Likuiditas Prima' : 'Prime Liquidity'}</span>
            </div>
            <span className="text-emerald-300 group-hover:underline font-bold">
              {language === 'id' ? 'Rincian ➔' : 'Inspect ➔'}
            </span>
          </div>
        </div>

        {/* CARD 2: PEMASUKAN DIPA APBN */}
        <div 
          onClick={() => handleOpenMetricModal('income')}
          className="p-4 rounded-2xl bg-[#0b101c] border border-blue-500/30 shadow-lg relative overflow-hidden cursor-pointer hover:border-cyan-400 hover:shadow-cyan-950/40 hover:scale-[1.015] active:scale-95 transition-all group"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400" />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-cyan-400 font-mono font-black uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-cyan-400" />
              {language === 'id' ? 'PEMASUKAN DIPA' : 'DIPA REVENUE'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-cyan-300 group-hover:bg-blue-500/30 transition-colors">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-cyan-300 truncate tracking-tight">
            {formatCompactRupiah(totalInflow)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[9px] font-mono border-t border-blue-500/20 pt-1.5 text-slate-400">
            <span className="truncate">{language === 'id' ? 'DIPA + Misi + Medali' : 'Grants & Medals'}</span>
            <span className="text-cyan-300 group-hover:underline font-bold shrink-0">
              {language === 'id' ? 'Rincian ➔' : 'Inspect ➔'}
            </span>
          </div>
        </div>

        {/* CARD 3: PENGELUARAN AIRBASE */}
        <div 
          onClick={() => handleOpenMetricModal('expense')}
          className="p-4 rounded-2xl bg-[#0b101c] border border-rose-500/30 shadow-lg relative overflow-hidden cursor-pointer hover:border-rose-400 hover:shadow-rose-950/40 hover:scale-[1.015] active:scale-95 transition-all group"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-rose-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-rose-400" />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-rose-400 font-mono font-black uppercase tracking-wider flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
              {language === 'id' ? 'BEBAN OPERASIONAL' : 'EXPENDITURES'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300 group-hover:bg-rose-500/30 transition-colors">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-rose-300 truncate tracking-tight">
            {formatCompactRupiah(totalOutflow)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[9px] font-mono border-t border-rose-500/20 pt-1.5 text-slate-400">
            <span className="truncate">{activeSquadrons.length} {language === 'id' ? 'Skadron Aktif' : 'Active Squadrons'}</span>
            <span className="text-rose-300 group-hover:underline font-bold shrink-0">
              {language === 'id' ? 'Rincian ➔' : 'Inspect ➔'}
            </span>
          </div>
        </div>

        {/* CARD 4: ARUS KAS BERSIH (SURPLUS) */}
        <div 
          onClick={() => handleOpenMetricModal('net_cash')}
          className="p-4 rounded-2xl bg-[#0b101c] border border-amber-500/30 shadow-lg relative overflow-hidden cursor-pointer hover:border-amber-400 hover:shadow-amber-950/40 hover:scale-[1.015] active:scale-95 transition-all group"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-400" />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-amber-400 font-mono font-black uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              {language === 'id' ? 'ARUS KAS BERSIH' : 'NET CASHFLOW'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 group-hover:bg-amber-500/30 transition-colors">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={cn(
            "text-base sm:text-lg font-black font-mono truncate tracking-tight",
            monthlySurplus >= 0 ? "text-emerald-400" : "text-rose-400"
          )}>
            {monthlySurplus >= 0 ? '+' : ''}{formatCompactRupiah(monthlySurplus)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[9px] font-mono border-t border-amber-500/20 pt-1.5 text-slate-400">
            <span className="truncate">{monthlySurplus >= 0 ? (language === 'id' ? 'Surplus Operasi' : 'Ops Surplus') : (language === 'id' ? 'Defisit Operasi' : 'Deficit')}</span>
            <span className="text-amber-300 group-hover:underline font-bold shrink-0">
              {language === 'id' ? 'Rincian ➔' : 'Inspect ➔'}
            </span>
          </div>
        </div>

        {/* CARD 5: KESEHATAN FISKAL PANGKALAN */}
        <div 
          onClick={() => handleOpenMetricModal('health')}
          className="p-4 rounded-2xl bg-[#0b101c] border border-cyan-500/30 shadow-lg col-span-2 lg:col-span-1 relative overflow-hidden cursor-pointer hover:border-cyan-400 hover:shadow-cyan-950/40 hover:scale-[1.015] active:scale-95 transition-all group"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-cyan-400 font-mono font-black uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              {language === 'id' ? 'KESEHATAN FISKAL' : 'FISCAL HEALTH'}
            </span>
            <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-400/30">
              {profile.financialHealthScore}/100
            </span>
          </div>
          
          {/* Tactical Progress Meter */}
          <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden my-1 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 rounded-full"
              style={{ width: `${profile.financialHealthScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[9px] font-mono border-t border-cyan-500/20 pt-1.5">
            <span className="text-cyan-300 font-bold">{profile.financialHealthGrade} - {language === 'id' ? 'Sangat Sehat' : 'Optimal'}</span>
            <span className="text-cyan-300 group-hover:underline font-bold">
              {language === 'id' ? 'Rincian ➔' : 'Inspect ➔'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SUB-NAVIGATION TABS (TACTICAL MILITARY COMMAND HUD) */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-5 py-2.5 bg-[#090d16] border-b border-white/10 flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
        {[
          { id: 'overview', labelId: '1. Ikhtisar & Kesiapan Alutsista', labelEn: '1. Fleet Readiness & Overview', icon: Landmark },
          { id: 'squadrons', labelId: '2. Matriks Beban Multi-Skadron', labelEn: '2. Multi-Squadron Matrix', icon: Plane },
          { id: 'expenses', labelId: '3. 8 Pos Beban Logistik', labelEn: '3. 8 Defense Cost Sectors', icon: CreditCard },
          { id: 'ledger', labelId: '4. Buku Kas & Riwayat Audit', labelEn: '4. Tactical Ledger & Log', icon: FileText },
          { id: 'rewards', labelId: '5. Poin Tempur & Medali', labelEn: '5. Combat Merit & Medals', icon: Award },
          { id: 'policy', labelId: '6. Kebijakan Alokasi DIPA', labelEn: '6. DIPA Budget Policy', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFinanceTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFinanceTab(tab.id as any)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap shrink-0 border relative",
                isActive
                  ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-900/50 border-cyan-400"
                  : "bg-[#0b101c]/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border-white/5"
              )}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              )}
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-cyan-300" : "text-slate-400")} />
              <span>{language === 'id' ? tab.labelId : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN TAB CONTENT PANELS */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
        
        {/* ===================================================================== */}
        {/* TAB 1: IKHTISAR & KESIAPAN ALUTSISTA */}
        {/* ===================================================================== */}
        {activeFinanceTab === 'overview' && (
          <div className="space-y-6">
            {/* Tactical Command Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0d1629] via-[#101b33] to-[#0c1426] border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
              {/* Decorative Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/30 text-cyan-300 text-[10px] font-mono font-black border border-cyan-400/40">
                    {language === 'id' ? 'DIPA APBN KEMHAN RI' : 'STATE DEFENSE GRANT'} • T.A. {profile.fiscalYear} (SIKLUS #{profile.monthlyFiscalCycle})
                  </span>
                  <span className="text-[11px] text-amber-300 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>STATUS: OTORISASI PENUH</span>
                  </span>
                </div>

                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  {language === 'id' ? 'Alokasi Pertahanan Udara Pangkalan:' : 'Monthly Base Defense Allocation:'}{' '}
                  <span className="text-emerald-400">{formatRupiah(profile.monthlyGovernmentDipa)}</span>
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {language === 'id'
                    ? `Pemerintah mengalokasikan anggaran rutin DIPA setiap siklus untuk mendanai operasional, gaji perwira penerbang, perawatan mesin turbofan jet, dan logistik bahan bakar ${activeSquadrons.length} skadron organik aktif di ${profile.lanudName}.`
                    : `State defense funding allocated each monthly fiscal cycle to sustain flight operations, pilot payroll, fighter overhaul, and fuel stockpiles for ${activeSquadrons.length} active combat squadron(s) stationed at ${profile.lanudName}.`}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={handleClaimMonthlyDipa}
                  className="flex-1 md:flex-none px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black uppercase font-mono tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 border border-emerald-400/40 transition-all active:scale-95"
                >
                  <Coins className="w-4 h-4 text-yellow-300" />
                  <span>{language === 'id' ? 'Cairkan Subsidi DIPA' : 'Disburse DIPA Grant'}</span>
                </button>
                
                <button
                  onClick={handleRunMonthlyAudit}
                  className="flex-1 md:flex-none px-5 py-3.5 bg-[#0b101c] hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white rounded-2xl text-xs font-black uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'id' ? 'Tutup Buku Bulanan' : 'Monthly Audit'}</span>
                </button>
              </div>
            </div>

            {/* Squadron Management Link / Dynamic Audit Notice */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0b101c] via-[#0e1629] to-[#0b101c] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-300 border border-blue-500/40">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase font-mono flex items-center gap-2">
                    <span>{language === 'id' ? 'SISTEM MULTI-SKADRON TERPADU' : 'INTEGRATED MULTI-SQUADRON MANAGEMENT'}</span>
                    <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] border border-emerald-500/30">
                      {activeSquadrons.length} {language === 'id' ? 'Aktif' : 'Active'} / {profile.squadrons.length} Total
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {language === 'id'
                      ? 'Manajemen keuangan Airbase secara otomatis menghitung beban operasional riil dari skadron yang dibuka di tab Skuadron.'
                      : 'Airbase financial ledger dynamically reconciles operational costs based on active squadrons unlocked in the Squadron tab.'}
                  </p>
                </div>
              </div>

              {onNavigateToSquadron && (
                <button
                  onClick={onNavigateToSquadron}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto shadow-md border border-blue-400/40"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>{language === 'id' ? 'Buka Manajemen Skadron' : 'Manage Squadrons'}</span>
                </button>
              )}
            </div>

            {/* Stationed Squadrons Fleet Grid with Aircraft Renders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Plane className="w-4 h-4 text-cyan-400" />
                  <span>
                    {language === 'id' ? 'Skadron Tempur Organik di Bawah Komando' : 'Stationed Organic Squadrons at'} {profile.lanudName} ({profile.squadrons.length} {language === 'id' ? 'Skadron' : 'Squadrons'})
                  </span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {language === 'id' ? 'Kekuatan Alutsista:' : 'Fleet Count:'}{' '}
                  <strong className="text-white font-bold">{totalActiveAircraft} {language === 'id' ? 'Unit Aktif' : 'Active Units'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {profile.squadrons.map((sq) => {
                  const isActive = sq.isActive;
                  const renderImg = AIRCRAFT_RENDER_MAP[sq.aircraftId] || f16Side;

                  return (
                    <div
                      key={sq.id}
                      className={cn(
                        "p-5 rounded-2xl border transition-all space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between",
                        isActive 
                          ? "bg-gradient-to-b from-[#0e1629] to-[#090f1d] border-cyan-500/30 hover:border-cyan-400" 
                          : "bg-[#080b12]/80 border-white/5 opacity-60"
                      )}
                    >
                      {/* Aircraft Side Silhouette Render Backdrop */}
                      <div className="relative h-24 w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center p-2 group">
                        <img 
                          src={renderImg} 
                          alt={sq.aircraftName} 
                          className="max-h-full max-w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] filter brightness-95 group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          {isActive ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {language === 'id' ? 'AKTIF TEMPUR' : 'COMBAT ACTIVE'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10 text-[9px] font-mono font-bold uppercase">
                              {language === 'id' ? 'CADANGAN (STANDBY)' : 'RESERVE STANDBY'}
                            </span>
                          )}
                        </div>

                        {isActive && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-[9px] font-mono font-bold">
                            {sq.readinessScore}% {language === 'id' ? 'SIAP' : 'READY'}
                          </div>
                        )}
                      </div>

                      {/* Squadron Header Info */}
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-white uppercase tracking-wide">{sq.name}</h4>
                          <span className="text-xs text-amber-400 font-mono font-bold">"{sq.nickname}"</span>
                        </div>
                        <p className="text-[11px] text-cyan-300 font-mono truncate mt-0.5">{sq.aircraftName}</p>
                      </div>

                      {/* Personnel & Fleet Stats Grid */}
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">{language === 'id' ? 'Armada Tempur:' : 'Airframes:'}</span>
                          <span className={isActive ? "text-cyan-300 font-bold" : "text-slate-500"}>
                            {isActive ? `${sq.aircraftCount} Unit` : (language === 'id' ? '0 Unit (Terkunci)' : '0 Units (Locked)')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">{language === 'id' ? 'Perwira Pilot:' : 'Pilots:'}</span>
                          <span className={isActive ? "text-emerald-400 font-bold" : "text-slate-500"}>
                            {isActive ? `${sq.pilotCount} Penerbang` : '0'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">{language === 'id' ? 'Teknisi & Kru:' : 'Tech Crew:'}</span>
                          <span className={isActive ? "text-slate-200 font-bold" : "text-slate-500"}>
                            {isActive ? `${sq.technicianCount + sq.groundCrewCount} Personel` : '0'}
                          </span>
                        </div>
                      </div>

                      {/* Total Monthly Expenses */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">{language === 'id' ? 'Beban Operasional/Bln:' : 'Monthly Cost:'}</span>
                        <span className={cn(
                          "text-sm font-black",
                          isActive ? "text-rose-400" : "text-slate-500 font-normal"
                        )}>
                          {isActive ? formatCompactRupiah(sq.totalMonthlyExpenses) : 'Rp 0 (Standby)'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tactical Quick Restocking & Procurement Depot */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <span>{language === 'id' ? 'Depot Logistik & Pengadaan Kilat Airbase (Quick Procurement)' : 'Rapid Tactical Logistics Procurement Depot'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Avtur Fuel Depot */}
                <div className="p-4 rounded-2xl bg-[#0b101c] border border-orange-500/30 space-y-3 shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                      <Fuel className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase">{language === 'id' ? 'Depot Avtur JP-8 / Jet A-1' : 'Jet-A1 Fuel Stockpile'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">+50.000 Lbs {language === 'id' ? 'Bahan Bakar Taktis' : 'Fuel Reserves'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-400">{language === 'id' ? 'Biaya Anggaran:' : 'Cost:'}</span>
                    <span className="font-bold text-orange-400">{formatCompactRupiah(2500000000)}</span>
                  </div>

                  <button
                    onClick={() => handleQuickProcure('fuel')}
                    className="w-full py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all active:scale-95"
                  >
                    {language === 'id' ? 'Beli Cadangan Avtur' : 'Procure Fuel'}
                  </button>
                </div>

                {/* 2. Armory Munitions Restock */}
                <div className="p-4 rounded-2xl bg-[#0b101c] border border-rose-500/30 space-y-3 shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <Crosshair className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase">{language === 'id' ? 'Gudang Munisi & Rudal Udara' : 'Missile & Ammo Restock'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">AIM-120 AMRAAM & AIM-9X</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-400">{language === 'id' ? 'Biaya Anggaran:' : 'Cost:'}</span>
                    <span className="font-bold text-rose-400">{formatCompactRupiah(4000000000)}</span>
                  </div>

                  <button
                    onClick={() => handleQuickProcure('munitions')}
                    className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all active:scale-95"
                  >
                    {language === 'id' ? 'Restok Rudal Armory' : 'Restock Munitions'}
                  </button>
                </div>

                {/* 3. Facility Overhaul */}
                <div className="p-4 rounded-2xl bg-[#0b101c] border border-cyan-500/30 space-y-3 shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-cyan-400 flex items-center justify-center border border-blue-500/30">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase">{language === 'id' ? 'Kalibrasi Hanggar & Runway' : 'Hangar Facility Overhaul'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Arresting Gear & Radar Tower</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-400">{language === 'id' ? 'Biaya Anggaran:' : 'Cost:'}</span>
                    <span className="font-bold text-cyan-300">{formatCompactRupiah(1800000000)}</span>
                  </div>

                  <button
                    onClick={() => handleQuickProcure('hangar_overhaul')}
                    className="w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all active:scale-95"
                  >
                    {language === 'id' ? 'Inspeksi & Kalibrasi' : 'Inspect Facility'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: MATRIKS BEBAN MULTI-SKADRON */}
        {/* ===================================================================== */}
        {activeFinanceTab === 'squadrons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  {language === 'id' ? 'Matriks Administrasi & Payroll Multi-Skadron Airbase' : 'Airbase Multi-Squadron Administration & Payroll Matrix'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {language === 'id' 
                    ? `Rincian alokasi biaya rutin per skadron di bawah naungan komando ${profile.lanudName}`
                    : `Itemized expenditures per squadron stationed under ${profile.lanudName} command`}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-cyan-500/20 shadow-2xl bg-[#090d16]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0e1629] text-cyan-300 uppercase text-[10px] border-b border-cyan-500/20">
                  <tr>
                    <th className="p-4">{language === 'id' ? 'Skadron' : 'Squadron'}</th>
                    <th className="p-4">{language === 'id' ? 'Status' : 'Status'}</th>
                    <th className="p-4">{language === 'id' ? 'Alutsista' : 'Fleet'}</th>
                    <th className="p-4">{language === 'id' ? 'Personel' : 'Personnel'}</th>
                    <th className="p-4">{language === 'id' ? 'Gaji Pilot' : 'Pilot Salary'}</th>
                    <th className="p-4">{language === 'id' ? 'Gaji Kru/Teknisi' : 'Crew Salary'}</th>
                    <th className="p-4">{language === 'id' ? 'Pemeliharaan Jet' : 'Maintenance'}</th>
                    <th className="p-4">{language === 'id' ? 'Avtur & Munisi' : 'Fuel & Ammo'}</th>
                    <th className="p-4 text-right">{language === 'id' ? 'Total Beban/Bulan' : 'Total Cost/Mo'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#080c14]">
                  {profile.squadrons.map((sq) => {
                    const isActive = sq.isActive;
                    return (
                      <tr key={sq.id} className={cn("transition-colors", isActive ? "hover:bg-slate-800/40" : "opacity-50 bg-black/30")}>
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <Plane className={cn("w-4 h-4", isActive ? "text-cyan-400" : "text-slate-500")} />
                            <span>{sq.name}</span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-sans">"{sq.nickname}"</span>
                        </td>
                        <td className="p-4">
                          {isActive ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
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
                        <td className="p-4 text-teal-300 font-bold">
                          {isActive ? formatCompactRupiah(sq.monthlyCrewPayroll) : 'Rp 0'}
                        </td>
                        <td className="p-4 text-cyan-300 font-bold">
                          {isActive ? formatCompactRupiah(sq.monthlyMaintenanceCost) : 'Rp 0'}
                        </td>
                        <td className="p-4 text-orange-400 font-bold">
                          {isActive ? formatCompactRupiah(sq.monthlyFuelBurnCost + sq.monthlyMunitionsCost) : 'Rp 0'}
                        </td>
                        <td className="p-4 text-right font-black text-sm">
                          <span className={isActive ? "text-rose-400" : "text-slate-500 font-normal"}>
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

        {/* ===================================================================== */}
        {/* TAB 3: 8 POS BEBAN LOGISTIK */}
        {/* ===================================================================== */}
        {activeFinanceTab === 'expenses' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
              {language === 'id' ? '8 Pos Pengeluaran Logistik Operasional Airbase' : '8 Airbase Tactical Defense Cost Sectors'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: language === 'id' ? '1. Pemeliharaan & Overhaul Pesawat' : '1. Aircraft Maintenance & Overhaul',
                  icon: Wrench,
                  color: 'text-cyan-400',
                  bg: 'bg-blue-500/20 border-blue-500/30',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyMaintenanceCost, 0),
                  desc: language === 'id' 
                    ? 'Inspeksi berkala 100-jam terbang, kalibrasi radar AESA, uji hidrolik turbofan, dan peremajaan airframe tempur.'
                    : '100-hour inspection, AESA radar calibration, hydraulics testing and wing structure refurbishment for active jets.'
                },
                {
                  title: language === 'id' ? '2. Perawatan Hanggar, Runway & Fasilitas' : '2. Hangar, Runway & Base Facilities',
                  icon: Building,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/20 border-amber-500/30',
                  amount: activeSquadrons.length > 0 ? 3000000000 + (activeSquadrons.length * 800000000) : 1500000000,
                  desc: language === 'id'
                    ? 'Perawatan fasilitas shelter hanggar, pelapisan aspal runway, kabel arresting gear, sistem pemadam darurat dan radar tower.'
                    : 'Hangar shelter maintenance, runway resurfacing, arresting wire systems and ATC radar tower sustainment.'
                },
                {
                  title: language === 'id' ? '3. Operasional Penerbangan & Sortie' : '3. Flight Operations & Sortie Support',
                  icon: Radio,
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/20 border-cyan-500/30',
                  amount: activeSquadrons.length > 0 ? 2500000000 : 1000000000,
                  desc: language === 'id'
                    ? 'Dukungan navigasi radar datalink Link-16, perijinan flight clearance, ground handling sortie dan briefing cuaca BMKG.'
                    : 'Link-16 datalink radar support, flight clearance handling, ground support and BMKG meteorological briefings.'
                },
                {
                  title: language === 'id' ? '4. Gaji & Tunjangan Ground Crew / Teknisi' : '4. Ground Crew & Technician Payroll',
                  icon: Users,
                  color: 'text-teal-400',
                  bg: 'bg-teal-500/20 border-teal-500/30',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyCrewPayroll, 0),
                  desc: language === 'id'
                    ? 'Payroll bulanan bintara dan tamtama teknisi avionik, mesin jet turbofan, kru persenjataan dan logistik darat aktif.'
                    : 'Monthly payroll for active avionics NCOs, turbofan engine technicians, armory crews, and ground logistics.'
                },
                {
                  title: language === 'id' ? '5. Gaji Pilot & Tunjangan Bahaya Terbang' : '5. Pilot Salaries & Hazard Pay',
                  icon: Shield,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/20 border-emerald-500/30',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyPilotPayroll, 0),
                  desc: language === 'id'
                    ? 'Gaji pokok perwira penerbang tempur, tunjangan resiko bahaya maut terbang, dan insentif jam terbang supersonik.'
                    : 'Base officer pay for fighter pilots, hazard allowances, and supersonic flight incentive pay.'
                },
                {
                  title: language === 'id' ? '6. Logistik Bahan Bakar (Avtur JP-8)' : '6. JP-8 Fuel Logistics & Stockpiles',
                  icon: Fuel,
                  color: 'text-orange-400',
                  bg: 'bg-orange-500/20 border-orange-500/30',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyFuelBurnCost, 0),
                  desc: language === 'id'
                    ? 'Pengadaan bahan bakar Jet A-1 / JP-8 kualitas militer untuk kesiapan scramble alert dan sortie patroli udara.'
                    : 'Procurement of military-grade JP-8 aviation turbine fuel for scramble readiness and routine sorties.'
                },
                {
                  title: language === 'id' ? '7. Persenjataan & Restok Munisi' : '7. Armory & Munitions Quota',
                  icon: Crosshair,
                  color: 'text-rose-400',
                  bg: 'bg-rose-500/20 border-rose-500/30',
                  amount: activeSquadrons.reduce((a, s) => a + s.monthlyMunitionsCost, 0),
                  desc: language === 'id'
                    ? 'Pengadaan rudal udara-ke-udara, bom pintar berpemandu laser, dan peluru kanon 20mm/30mm.'
                    : 'Procurement of air-to-air missiles, laser-guided smart bombs, and 20mm/30mm cannon shells.'
                },
                {
                  title: language === 'id' ? '8. Upgrade & Modernisasi Generasi' : '8. Modernization & Avionics Upgrades',
                  icon: Sparkles,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/20 border-purple-500/30',
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
                    className="p-5 rounded-2xl bg-[#0b101c] border border-white/10 space-y-3 shadow-lg hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center border`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase">{item.title}</h4>
                      </div>
                      <span className="text-sm font-black font-mono text-rose-400">
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

        {/* ===================================================================== */}
        {/* TAB 4: BUKU KAS & RIWAYAT AUDIT */}
        {/* ===================================================================== */}
        {activeFinanceTab === 'ledger' && (
          <div className="space-y-4">
            {/* Tactical Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#0b101c] border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex rounded-xl bg-black/50 p-1 border border-white/10">
                  <button
                    onClick={() => setLedgerFilter('ALL')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all",
                      ledgerFilter === 'ALL' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {language === 'id' ? `Semua (${profile.transactions.length})` : `All (${profile.transactions.length})`}
                  </button>
                  <button
                    onClick={() => setLedgerFilter('INCOME')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all",
                      ledgerFilter === 'INCOME' ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {language === 'id' ? 'Pemasukan' : 'Income'}
                  </button>
                  <button
                    onClick={() => setLedgerFilter('EXPENSE')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all",
                      ledgerFilter === 'EXPENSE' ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {language === 'id' ? 'Pengeluaran' : 'Expense'}
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'id' ? "Cari transaksi / kode referensi..." : "Search transaction or ref code..."}
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full bg-black/50 border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Transactions Ledger Stream */}
            <div className="space-y-2">
              {filteredLedger.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic font-mono bg-[#090d16] rounded-2xl border border-white/5">
                  {language === 'id' ? 'Tidak ada catatan transaksi yang sesuai.' : 'No transaction records found.'}
                </div>
              ) : (
                filteredLedger.map((trx) => (
                  <div
                    key={trx.id}
                    className="p-4 rounded-xl bg-[#0b101c] border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        trx.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {trx.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{trx.title}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/5 text-cyan-300 border border-cyan-500/20">
                            {trx.referenceCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{trx.description}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">{trx.date}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black font-mono ${
                        trx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {trx.type === 'INCOME' ? '+' : '-'}{formatRupiah(trx.amount)}
                      </p>
                      <span className="text-[9px] font-mono text-emerald-400/80 font-bold uppercase">
                        {trx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 5: POIN TEMPUR & MEDALI */}
        {/* ===================================================================== */}
        {activeFinanceTab === 'rewards' && (
          <div className="space-y-6">
            {/* Points Conversion Module */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d162b] via-[#101c36] to-[#0d162b] border border-cyan-500/40 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                      {language === 'id' ? 'Konversi Poin Prestasi Penerbang ke Kas Airbase' : 'Convert Combat Merit Points to Airbase Treasury'}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      {language === 'id' ? 'Poin Akumulasi Penerbang:' : 'Pilot Merit Points:'}{' '}
                      <strong className="text-amber-400 font-bold">{points} PTS</strong> ({language === 'id' ? 'Nilai Tukar: 1 Poin = Rp 5.000.000' : 'Exchange Rate: 1 Pt = Rp 5,000,000'})
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{language === 'id' ? 'Poin yang Ditukar' : 'Points to Exchange'}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={points}
                      value={pointsToConvert}
                      onChange={(e) => setPointsToConvert(Math.min(points, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-24 bg-[#080c14] border border-cyan-500/40 rounded-lg px-2 py-1.5 text-sm font-bold font-mono text-cyan-300 text-center"
                    />
                    <button
                      onClick={() => setPointsToConvert(points)}
                      className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-cyan-400/30 rounded text-[10px] font-mono font-bold"
                    >
                      {language === 'id' ? `Maks (${points})` : `Max (${points})`}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{language === 'id' ? 'Pemasukan Kas Airbase' : 'Resulting Cash Credit'}</span>
                  <p className="text-base font-black font-mono text-emerald-400">
                    +{formatCompactRupiah(pointsToConvert * 5000000)}
                  </p>
                </div>

                <div className="flex items-end">
                  <button
                    disabled={pointsToConvert <= 0 || points < pointsToConvert}
                    onClick={handleConvertPoints}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-blue-900/50 border border-cyan-300/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4 text-yellow-300" />
                    <span>{language === 'id' ? 'Setor ke Kas Airbase' : 'Deposit into Treasury'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Medals & State Honor Grants */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{language === 'id' ? 'Tanda Jasa & Medali Kehormatan Pertahanan' : 'State Honors & Military Medal Grants'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medals.map((medal) => (
                  <div
                    key={medal.id}
                    className={cn(
                      "p-5 rounded-2xl border transition-all space-y-3 shadow-lg",
                      medal.claimed
                        ? "bg-[#090e18]/90 border-emerald-500/30 opacity-80"
                        : medal.unlocked
                        ? "bg-[#0c1426] border-amber-500/40 hover:border-amber-400"
                        : "bg-[#070a10]/80 border-white/5 opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                          medal.claimed
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : medal.unlocked
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800 text-slate-500 border-white/5'
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

        {/* ===================================================================== */}
        {/* TAB 6: KEBIJAKAN ALOKASI DIPA */}
        {/* ===================================================================== */}
        {activeFinanceTab === 'policy' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0b101c] border border-cyan-500/30 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  {language === 'id' ? 'Distribusi Kebijakan Alokasi Anggaran DIPA Airbase' : 'Airbase DIPA Defense Budget Allocation Policy'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {language === 'id'
                    ? 'Atur proporsi pembagian pembiayaan per sektor alutsista untuk memaksimalkan kesiapan tempur pangkalan udara.'
                    : 'Adjust sector expenditure quotas to maximize combat readiness of stationed defense assets.'}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { key: 'maintenancePercent', labelId: 'Pemeliharaan Alutsista & Overhaul Pesawat', labelEn: 'Fleet Maintenance & Aircraft Overhaul', color: 'bg-blue-500' },
                  { key: 'munitionsPercent', labelId: 'Persenjataan, Rudal & Gudang Munisi (Armory)', labelEn: 'Munitions, Missiles & Tactical Armory', color: 'bg-red-500' },
                  { key: 'personnelPercent', labelId: 'Kesejahteraan, Gaji & Asuransi Personel Penerbang', labelEn: 'Pilot Welfare, Payroll & Flight Insurance', color: 'bg-emerald-500' },
                  { key: 'fuelLogisticsPercent', labelId: 'Cadangan Logistik Avtur & BBM Taktis JP-8', labelEn: 'JP-8 Fuel Logistics & Tactical Reserves', color: 'bg-orange-500' },
                  { key: 'facilityUpgradePercent', labelId: 'Modernisasi Avionik & Fasilitas Radar Hanggar', labelEn: 'Avionics Modernization & Radar Facilities', color: 'bg-purple-500' }
                ].map((item) => {
                  const val = (profile.budgetAllocations as any)[item.key] || 20;
                  return (
                    <div key={item.key} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-white">{language === 'id' ? item.labelId : item.labelEn}</span>
                        <span className="font-black text-cyan-300">{val}%</span>
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
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => showNotification(language === 'id' ? 'Kebijakan alokasi DIPA berhasil disimpan!' : 'DIPA budget policy saved!')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase font-mono tracking-wider shadow-lg shadow-blue-900/50 border border-cyan-400/40 transition-all active:scale-95"
                >
                  {language === 'id' ? 'Simpan Kebijakan DIPA' : 'Save Allocation Policy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. MODALS: REPORT STATEMENT & REAL-TIME METRIC DRILLDOWN */}
      {/* ========================================================================= */}
      <FinanceReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        language={language}
        profile={profile}
      />

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
