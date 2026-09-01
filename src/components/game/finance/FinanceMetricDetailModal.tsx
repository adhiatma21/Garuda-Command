import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  ShieldCheck, 
  Landmark, 
  Coins, 
  Plane, 
  Users, 
  Wrench, 
  Fuel, 
  Crosshair, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Clock, 
  Calendar, 
  Shield, 
  Sparkles,
  Zap,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { LanudFinancialProfile, FinanceTransaction, SquadronFinanceDetail } from '../../../types/finance';
import { formatRupiah, formatCompactRupiah } from '../../../data/lanudFinanceData';

export type MetricType = 'cash' | 'income' | 'expense' | 'net_cash' | 'health';

interface FinanceMetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MetricType;
  onSelectMetric: (m: MetricType) => void;
  profile: LanudFinancialProfile;
  totalInflow: number;
  totalOutflow: number;
  monthlySurplus: number;
  points: number;
  flightHours: number;
  language: 'id' | 'en';
  onClaimDipa: () => void;
  onConvertPoints: () => void;
  onRunAudit: () => void;
  pointsToConvert: number;
  setPointsToConvert: (val: number) => void;
  onNavigateToSquadron?: () => void;
}

export const FinanceMetricDetailModal: React.FC<FinanceMetricDetailModalProps> = ({
  isOpen,
  onClose,
  metric,
  onSelectMetric,
  profile,
  totalInflow,
  totalOutflow,
  monthlySurplus,
  points,
  flightHours,
  language,
  onClaimDipa,
  onConvertPoints,
  onRunAudit,
  pointsToConvert,
  setPointsToConvert,
  onNavigateToSquadron
}) => {
  if (!isOpen) return null;

  const activeSquadrons = profile.squadrons.filter(s => s.isActive);
  const inactiveSquadrons = profile.squadrons.filter(s => !s.isActive);

  // Financial Runway (Months of reserve)
  const runwayMonths = totalOutflow > 0 ? (profile.activeCashBalance / totalOutflow).toFixed(1) : '∞';
  
  // Total Active Aircraft
  const totalActiveAircraft = activeSquadrons.reduce((acc, s) => acc + s.aircraftCount, 0);
  const totalActivePilots = activeSquadrons.reduce((acc, s) => acc + s.pilotCount, 0);
  const totalActiveCrew = activeSquadrons.reduce((acc, s) => acc + s.technicianCount + s.groundCrewCount, 0);

  // Total Squadron Budget
  const totalSquadronExpenses = activeSquadrons.reduce((acc, s) => acc + s.totalMonthlyExpenses, 0);
  const baseOverhead = totalOutflow > totalSquadronExpenses ? totalOutflow - totalSquadronExpenses : 3000000000;

  const METRIC_TABS: { id: MetricType; labelId: string; labelEn: string; icon: any; color: string }[] = [
    { id: 'cash', labelId: 'Kas Aktif Airbase', labelEn: 'Active Treasury', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'income', labelId: 'Pemasukan DIPA', labelEn: 'DIPA Revenue', icon: ArrowUpRight, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { id: 'expense', labelId: 'Pengeluaran Airbase', labelEn: 'Expenditures', icon: ArrowDownRight, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    { id: 'net_cash', labelId: 'Arus Kas Bersih', labelEn: 'Net Cashflow', icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'health', labelId: 'Kesehatan Fiskal', labelEn: 'Fiscal Health', icon: ShieldCheck, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
  ];

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-4xl max-h-[92vh] bg-[#090d16] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0d1424] via-[#111c33] to-[#0d1424] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-400/30 text-blue-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  {language === 'id' ? 'AUDIT & TRANSPARANSI AIRBASE FINANCE' : 'AIRBASE FISCAL AUDIT & LEDGER'}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-400/30">
                  {profile.lanudIcao}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                {language === 'id' ? 'Rincian Riil Permainan:' : 'Live In-Game Breakdown:'}{' '}
                <span className="text-amber-400">
                  {METRIC_TABS.find(t => t.id === metric)?.[language === 'id' ? 'labelId' : 'labelEn']}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRIC SELECTION PILLS */}
        <div className="p-3 bg-[#060a12] border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
          {METRIC_TABS.map((t) => {
            const Icon = t.icon;
            const isSelected = metric === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectMetric(t.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 border",
                  isSelected
                    ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'id' ? t.labelId : t.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          {/* Active Squadron Synchronization Info Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-900/40 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {language === 'id' ? 'Status Sinkronisasi Skuadron Aktif' : 'Active Squadron Synchronization'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {language === 'id' 
                    ? `Perhitungan keuangan hanya memproses ${activeSquadrons.length} skuadron aktif yang dibuka di Squadron Management.`
                    : `Financial ledger only processes the ${activeSquadrons.length} active squadron(s) unlocked in Squadron Management.`}
                </p>
              </div>
            </div>

            {onNavigateToSquadron && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToSquadron();
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-blue-400/40 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'Buka Skuadron Lain' : 'Manage Squadrons'}</span>
              </button>
            )}
          </div>

          {/* ======================================================== */}
          {/* TAB 1: KAS AKTIF LANUD                                   */}
          {/* ======================================================== */}
          {metric === 'cash' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Primary Value Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                    {language === 'id' ? 'Total Kas Likuid Pangkalan Udara' : 'Total Airbase Liquid Treasury'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300 tracking-tight">
                    {formatRupiah(profile.activeCashBalance)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                    <span>{profile.lanudName} ({profile.lanudClass})</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{language === 'id' ? 'Status: Likuid & Siaga Tempur' : 'Status: Liquid & Combat Ready'}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={onClaimDipa}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <Coins className="w-4 h-4" />
                    <span>{language === 'id' ? 'Cairkan DIPA' : 'Claim DIPA'}</span>
                  </button>
                </div>
              </div>

              {/* Breakdown by Reserve Category */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'id' ? 'Komposisi Alokasi Kas Lancar' : 'Liquid Cash Allocation Distribution'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'id' ? 'Cadangan Avtur Siaga' : 'Avtur Fuel Reserve'}</span>
                    <p className="text-sm font-black font-mono text-white">{formatCompactRupiah(profile.activeCashBalance * 0.35)}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">35% dari Kas Pangkalan</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'id' ? 'Suku Cadang & Overhaul' : 'Fleet Overhaul Reserve'}</span>
                    <p className="text-sm font-black font-mono text-white">{formatCompactRupiah(profile.activeCashBalance * 0.30)}</p>
                    <p className="text-[10px] text-blue-400 font-mono">30% dari Kas Pangkalan</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'id' ? 'Escrow Gaji Personel' : 'Personnel Escrow'}</span>
                    <p className="text-sm font-black font-mono text-white">{formatCompactRupiah(profile.activeCashBalance * 0.20)}</p>
                    <p className="text-[10px] text-amber-400 font-mono">20% dari Kas Pangkalan</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'id' ? 'Dana Taktis Darurat' : 'Tactical War Chest'}</span>
                    <p className="text-sm font-black font-mono text-white">{formatCompactRupiah(profile.activeCashBalance * 0.15)}</p>
                    <p className="text-[10px] text-cyan-400 font-mono">15% dari Kas Pangkalan</p>
                  </div>
                </div>
              </div>

              {/* Real In-Game Conversion Widget */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold font-mono text-white">
                      {language === 'id' ? 'Suntikan Dana: Konversi Poin Komando' : 'Command Points Liquidity Injection'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {points} {language === 'id' ? 'Poin Tersedia' : 'Points Available'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, points)}
                      value={pointsToConvert}
                      onChange={(e) => setPointsToConvert(Math.min(points, Math.max(0, Number(e.target.value))))}
                      className="w-24 bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-mono text-slate-400">
                      = <strong className="text-emerald-400">{formatCompactRupiah(pointsToConvert * 5000000)}</strong>
                    </span>
                  </div>

                  <button
                    onClick={onConvertPoints}
                    disabled={points <= 0 || pointsToConvert <= 0}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'id' ? 'Konversi ke Kas LANUD' : 'Convert to Base Funds'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PEMASUKAN DIPA                                    */}
          {/* ======================================================== */}
          {metric === 'income' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/50 via-slate-900 to-slate-950 border border-blue-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest block mb-1">
                    {language === 'id' ? 'Total Pemasukan Operasional DIPA' : 'Total Monthly Inflow & Defense Grant'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-blue-300 tracking-tight">
                    {formatRupiah(totalInflow)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {language === 'id' 
                      ? `Alokasi DIPA APBN disesuaikan untuk ${activeSquadrons.length} skuadron tempur aktif.`
                      : `DIPA budget dynamically tailored for ${activeSquadrons.length} active squadron(s).`}
                  </p>
                </div>

                <button
                  onClick={onClaimDipa}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                >
                  <Coins className="w-4 h-4" />
                  <span>{language === 'id' ? 'Klaim Alokasi Sekarang' : 'Disburse Grant Now'}</span>
                </button>
              </div>

              {/* Breakdown Streams */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                  {language === 'id' ? 'Komponen Sumber Pendapatan Riil' : 'Live Revenue Streams Breakdown'}
                </h3>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'DIPA Induk Mabes TNI AU & Kemhan' : 'Primary TNI AU DIPA Grant'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{language === 'id' ? 'Alokasi rutin pertahanan negara' : 'State defense operational budget'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black font-mono text-blue-300">{formatRupiah(profile.monthlyGovernmentDipa)}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'Bonus Jam Terbang & Rekor Operasi' : 'Flight Hours & Sortie Bonuses'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{flightHours} {language === 'id' ? 'Menit Jam Terbang Tercatat' : 'Flight Minutes Recorded'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black font-mono text-amber-300">+{formatCompactRupiah(flightHours * 15000000)}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'Pencairan Tanda Jasa Medali' : 'Medal Honors Subsidies'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{language === 'id' ? 'Klaim tanda kehormatan negara' : 'State honors & merit allowances'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black font-mono text-emerald-300">+{formatCompactRupiah(3000000000)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PENGELUARAN LANUD                                 */}
          {/* ======================================================== */}
          {metric === 'expense' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/50 via-slate-900 to-slate-950 border border-red-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block mb-1">
                    {language === 'id' ? 'Total Beban Pengeluaran Bulanan' : 'Total Monthly Airbase Expenditures'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-red-300 tracking-tight">
                    {formatRupiah(totalOutflow)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {language === 'id'
                      ? `Hanya menghitung biaya dari ${activeSquadrons.length} skuadron organik aktif.`
                      : `Strictly calculates costs from ${activeSquadrons.length} active squadron(s).`}
                  </p>
                </div>

                <button
                  onClick={onRunAudit}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{language === 'id' ? 'Tutup Buku & Bayar' : 'Settle Operating Ledger'}</span>
                </button>
              </div>

              {/* Itemized Cost Matrix */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                  {language === 'id' ? 'Matriks Rincian Biaya Riil (Skuadron Aktif)' : 'Itemized Cost Breakdown (Active Squadrons)'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'Gaji Pilot Tempur' : 'Fighter Pilot Payroll'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{totalActivePilots} {language === 'id' ? 'Perwira Penerbang' : 'Active Pilots'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-red-400">
                      {formatCompactRupiah(activeSquadrons.reduce((a, s) => a + s.monthlyPilotPayroll, 0))}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'Gaji Teknisi & Ground Crew' : 'Crew & Tech Payroll'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{totalActiveCrew} {language === 'id' ? 'Personel Teknisi' : 'Maintenance Personnel'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-red-400">
                      {formatCompactRupiah(activeSquadrons.reduce((a, s) => a + s.monthlyCrewPayroll, 0))}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'Pemeliharaan Armada' : 'Aircraft Maintenance'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{totalActiveAircraft} {language === 'id' ? 'Pesawat Tempur Siap Operasi' : 'Active Aircraft'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-red-400">
                      {formatCompactRupiah(activeSquadrons.reduce((a, s) => a + s.monthlyMaintenanceCost, 0))}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                        <Fuel className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'Logistik Bahan Bakar Avtur' : 'Avtur Fuel Logistics'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{language === 'id' ? 'Konsumsi Sortie Rutin' : 'Flight Sortie Consumption'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-red-400">
                      {formatCompactRupiah(activeSquadrons.reduce((a, s) => a + s.monthlyFuelBurnCost, 0))}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-red-500/20 text-red-300">
                        <Crosshair className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'Kuota Munisi & Rudal' : 'Munitions & Weapons Quota'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">AIM-9X, AIM-120C, Bom GBU</p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-red-400">
                      {formatCompactRupiah(activeSquadrons.reduce((a, s) => a + s.monthlyMunitionsCost, 0))}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{language === 'id' ? 'Overhead Hanggar & Markas' : 'Base Facilities Overhead'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Radar, ATC, Runway, Listrik</p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-red-400">
                      {formatCompactRupiah(baseOverhead)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inactive Squadrons Note */}
              {inactiveSquadrons.length > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {language === 'id'
                      ? `${inactiveSquadrons.length} skuadron di pangkalan ini berstatus Cadangan (Beban Pengeluaran = Rp 0). Beban otomatis aktif saat dibuka di Squadron Management.`
                      : `${inactiveSquadrons.length} squadron(s) at this base are in Reserve (Cost = Rp 0). They activate once unlocked in Squadron Management.`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ARUS KAS BERSIH                                   */}
          {/* ======================================================== */}
          {metric === 'net_cash' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    {language === 'id' ? 'Arus Kas Bersih Bulanan (Surplus Operasional)' : 'Net Monthly Cashflow (Operational Surplus)'}
                  </span>
                  <div className={cn(
                    "text-2xl sm:text-3xl font-black font-mono tracking-tight",
                    monthlySurplus >= 0 ? "text-emerald-300" : "text-rose-400"
                  )}>
                    {monthlySurplus >= 0 ? '+' : ''}{formatRupiah(monthlySurplus)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {language === 'id' ? 'Selisih Pemasukan DIPA dikurangi Total Pengeluaran Riil.' : 'Net difference between Monthly Inflow and Expenditures.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">{language === 'id' ? 'Margin Operasional' : 'Operating Margin'}</span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    {totalInflow > 0 ? ((monthlySurplus / totalInflow) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-400 font-bold uppercase">{language === 'id' ? 'Total Pemasukan' : 'Total Inflow'}</span>
                    <ArrowUpRight className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-lg font-black font-mono text-white">{formatRupiah(totalInflow)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">DIPA, Bonus Misi, Medali</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-red-400 font-bold uppercase">{language === 'id' ? 'Total Pengeluaran' : 'Total Outflow'}</span>
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  </div>
                  <p className="text-lg font-black font-mono text-white">{formatRupiah(totalOutflow)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Gaji, Pemeliharaan, Avtur</p>
                </div>
              </div>

              {/* Projections */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase">
                  {language === 'id' ? 'Proyeksi Saldo Kas Masa Depan' : 'Treasury Growth Projections'}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-mono text-slate-400 block">{language === 'id' ? '+3 Bulan' : '+3 Months'}</span>
                    <span className="text-xs font-black font-mono text-emerald-400">
                      {formatCompactRupiah(profile.activeCashBalance + monthlySurplus * 3)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-mono text-slate-400 block">{language === 'id' ? '+6 Bulan' : '+6 Months'}</span>
                    <span className="text-xs font-black font-mono text-emerald-400">
                      {formatCompactRupiah(profile.activeCashBalance + monthlySurplus * 6)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] font-mono text-slate-400 block">{language === 'id' ? '+1 Tahun' : '+1 Year'}</span>
                    <span className="text-xs font-black font-mono text-emerald-400">
                      {formatCompactRupiah(profile.activeCashBalance + monthlySurplus * 12)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: KESEHATAN FISKAL                                  */}
          {/* ======================================================== */}
          {metric === 'health' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-950 border border-cyan-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                    {language === 'id' ? 'Indeks Kesehatan Fiskal & Kesiapan Tempur' : 'Fiscal Health & Combat Readiness Index'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono text-cyan-300">{profile.financialHealthScore}/100</span>
                    <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-bold">
                      {profile.financialHealthGrade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {language === 'id'
                      ? 'Pangkalan beroperasi dengan cadangan kas prima dan beban alutsista terkelola optimal.'
                      : 'Airbase operates with supreme cash reserves and optimally audited aircraft load.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center md:text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">{language === 'id' ? 'Runway Keuangan' : 'Financial Runway'}</span>
                  <span className="text-xl font-black font-mono text-cyan-300">{runwayMonths} {language === 'id' ? 'Bulan' : 'Months'}</span>
                  <p className="text-[9px] text-emerald-400 font-mono">{language === 'id' ? 'Tahan Tanpa Injeksi DIPA' : 'Sustained Without New Grants'}</p>
                </div>
              </div>

              {/* Vital Health Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'id' ? 'Tingkat Kesiapan Armada' : 'Fleet Readiness Rate'}</span>
                  <p className="text-base font-black font-mono text-emerald-400">94.2%</p>
                  <p className="text-[10px] text-slate-400 font-mono">{totalActiveAircraft} {language === 'id' ? 'Pesawat Siaga 24/7' : 'Alert Aircraft'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'id' ? 'Rasio Cadangan Darurat' : 'Emergency Reserve Ratio'}</span>
                  <p className="text-base font-black font-mono text-cyan-400">4.8x</p>
                  <p className="text-[10px] text-slate-400 font-mono">{language === 'id' ? 'Di Atas Standar Mabes TNI' : 'Above TNI HQ Standard'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'id' ? 'Beban Utang / Defisit' : 'Debt / Deficit Load'}</span>
                  <p className="text-base font-black font-mono text-emerald-400">Rp 0 (0%)</p>
                  <p className="text-[10px] text-slate-400 font-mono">{language === 'id' ? 'Bebas Defisit Anggaran' : 'Zero Deficit Defensible'}</p>
                </div>
              </div>

              {/* Directives */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-blue-500/20 space-y-2">
                <h4 className="text-xs font-bold font-mono text-blue-400 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'id' ? 'Arahan Pangkoopsudnas & Komandan Pangkalan' : 'Command Directives & Advisory'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Pertahankan saldo likuiditas di atas 3 bulan pengeluaran rutin.' : 'Maintain liquidity reserves above 3 months of baseline operating costs.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Lakukan konversi poin prestasi misi ke kas LANUD secara berkala.' : 'Periodically convert sortie mission merit points into base operating funds.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Buka skuadron baru di Squadron Management setelah kas pangkalan mencapai Rp 1.5 Miliar.' : 'Unlock additional squadrons once base treasury exceeds Rp 1.5 Billion.'}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-[#080c14] border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            {language === 'id' ? 'Data keuangan disinkronkan secara real-time dengan status game.' : 'Financial data synchronized in real-time with live gameplay.'}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all"
          >
            {language === 'id' ? 'Tutup Rincian' : 'Close Details'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
