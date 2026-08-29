import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, Shield, Landmark, CheckCircle2, FileText, Calendar, UserCheck } from 'lucide-react';
import { LanudFinancialProfile, FinanceTransaction } from '../../../types/finance';
import { formatRupiah, formatCompactRupiah } from '../../../data/lanudFinanceData';

interface FinanceReportModalProps {
  show: boolean;
  onClose: () => void;
  language: 'id' | 'en';
  profile: LanudFinancialProfile;
}

export const FinanceReportModal: React.FC<FinanceReportModalProps> = ({
  show,
  onClose,
  language,
  profile
}) => {
  if (!show) return null;

  const totalInflow = profile.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOutflow = profile.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netSurplus = totalInflow - totalOutflow;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[7500] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Action Bar */}
          <div className="p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {language === 'id' ? 'Laporan Pertanggungjawaban Keuangan LANUD' : 'Official Airbase Financial Balance Statement'}
                </h3>
                <p className="text-[10px] text-amber-400/70 font-mono">
                  DOKUMEN RESMI TENTARA NASIONAL INDONESIA ANGKATAN UDARA • RAHASIA & TERBATAS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'Cetak Laporan' : 'Print Statement'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Paper Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-950 text-slate-100 font-sans custom-scrollbar space-y-6">
            {/* Military Letterhead */}
            <div className="text-center border-b-2 border-amber-500/40 pb-6 relative">
              <div className="flex justify-center items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full border-2 border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                MARKAS BESAR TENTARA NASIONAL INDONESIA ANGKATAN UDARA
              </p>
              <p className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                KOMANDO OPERASI UDARA NASIONAL (KOOPSUDNAS)
              </p>
              <h2 className="text-lg font-black uppercase tracking-widest text-amber-300 mt-1">
                PANGKALAN UDARA {profile.lanudName.toUpperCase()} ({profile.lanudIcao})
              </h2>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {profile.location} • STATUS KLASIFIKASI: {profile.lanudClass}
              </p>
              <div className="inline-block mt-2 px-3 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-[9px] font-mono text-amber-300">
                NOMOR DOKUMEN: LPJ-DIPA/{profile.lanudIcao}/2026/VIII-TNI-AU
              </div>
            </div>

            {/* General Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-white/10">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Komandan Lanud</span>
                <span className="text-xs font-bold text-white">{profile.commanderName}</span>
                <span className="text-[10px] text-amber-400 font-mono block">{profile.commanderRank}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Tahun / Periode</span>
                <span className="text-xs font-bold text-white">T.A. {profile.fiscalYear} (Agustus)</span>
                <span className="text-[10px] text-blue-400 font-mono block">Siklus Bulan Ke-{profile.monthlyFiscalCycle}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Jumlah Skuadron</span>
                <span className="text-xs font-bold text-white">{profile.squadrons.length} Skuadron Organik</span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  {profile.squadrons.reduce((a, s) => a + s.aircraftCount, 0)} Alutsista Aktif
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Kesehatan Finansial</span>
                <span className="text-xs font-bold text-emerald-400">{profile.financialHealthGrade}</span>
                <span className="text-[10px] text-slate-400 font-mono block">Skor: {profile.financialHealthScore}/100</span>
              </div>
            </div>

            {/* Financial Summary Figures */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/20 space-y-1">
                <span className="text-[9px] text-blue-400 uppercase font-mono font-bold">Total Pemasukan Kas DIPA</span>
                <p className="text-lg font-mono font-black text-blue-300">{formatRupiah(totalInflow)}</p>
                <p className="text-[10px] text-slate-400">APBN, Misi Tempur, Poin, dan Tanda Jasa</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-red-500/20 space-y-1">
                <span className="text-[9px] text-red-400 uppercase font-mono font-bold">Total Beban Operasional</span>
                <p className="text-lg font-mono font-black text-red-300">{formatRupiah(totalOutflow)}</p>
                <p className="text-[10px] text-slate-400">Pemeliharaan, Gaji, BBM, Munisi & Hanggar</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20 space-y-1">
                <span className="text-[9px] text-emerald-400 uppercase font-mono font-bold">Saldo Kas Aktif LANUD</span>
                <p className="text-lg font-mono font-black text-emerald-300">{formatRupiah(profile.activeCashBalance)}</p>
                <p className="text-[10px] text-emerald-400/80">Surplus Bulanan: {formatCompactRupiah(netSurplus)}</p>
              </div>
            </div>

            {/* Multi-Squadron Administration Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span>Rincian Administrasi Multi-Skuadron di {profile.lanudName}</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Status Kesiapan: PRIMA (92%+)</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-3">Skuadron</th>
                      <th className="p-3">Pesawat Organik</th>
                      <th className="p-3">Personel</th>
                      <th className="p-3">Gaji Pilot & Kru</th>
                      <th className="p-3">Beban Maintenance</th>
                      <th className="p-3">BBM & Munisi</th>
                      <th className="p-3 text-right">Total Beban/Bln</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-950">
                    {profile.squadrons.map((sq) => (
                      <tr key={sq.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-white">
                          <div>{sq.name}</div>
                          <div className="text-[9px] text-amber-400/80 font-sans">"{sq.nickname}"</div>
                        </td>
                        <td className="p-3 text-slate-300">
                          <div>{sq.aircraftCount} Unit</div>
                          <div className="text-[9px] text-slate-400 truncate max-w-[120px]">{sq.aircraftName}</div>
                        </td>
                        <td className="p-3 text-slate-300">
                          <div>{sq.pilotCount} Pilot</div>
                          <div className="text-[9px] text-slate-400">{sq.technicianCount + sq.groundCrewCount} Kru/Teknisi</div>
                        </td>
                        <td className="p-3 text-slate-300">
                          {formatCompactRupiah(sq.monthlyPilotPayroll + sq.monthlyCrewPayroll)}
                        </td>
                        <td className="p-3 text-slate-300">
                          {formatCompactRupiah(sq.monthlyMaintenanceCost)}
                        </td>
                        <td className="p-3 text-slate-300">
                          {formatCompactRupiah(sq.monthlyFuelBurnCost + sq.monthlyMunitionsCost)}
                        </td>
                        <td className="p-3 text-right font-bold text-red-400">
                          {formatCompactRupiah(sq.totalMonthlyExpenses)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Ledger Entries (Top 6) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Buku Kas Transaksi Terakhir yang Diaudit
              </h4>
              <div className="space-y-2">
                {profile.transactions.slice(0, 5).map((trx) => (
                  <div
                    key={trx.id}
                    className="p-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        trx.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {trx.type === 'INCOME' ? '+ PEMASUKAN' : '- PENGELUARAN'}
                      </span>
                      <div>
                        <p className="font-bold text-white">{trx.title}</p>
                        <p className="text-[10px] text-slate-400">{trx.referenceCode} • {trx.date}</p>
                      </div>
                    </div>
                    <span className={`font-black font-mono ${
                      trx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {trx.type === 'INCOME' ? '+' : '-'}{formatRupiah(trx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Signatures Section */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8 text-center text-xs font-mono">
              <div className="space-y-12">
                <div>
                  <p className="text-slate-400">Kepala Keuangan & Logistik LANUD</p>
                  <p className="text-[10px] text-slate-400">Pangkalan Udara {profile.lanudName}</p>
                </div>
                <div>
                  <p className="font-bold text-white underline">LETKOL KEU D. PRAKOSO, S.E.</p>
                  <p className="text-[10px] text-slate-400">NRP 5241088210</p>
                </div>
              </div>
              <div className="space-y-12">
                <div>
                  <p className="text-slate-400">Mengetahui / Mengesahkan:</p>
                  <p className="text-[10px] text-amber-400 font-bold">KOMANDAN PANGKALAN UDARA {profile.lanudName.toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-bold text-white underline">{profile.commanderName.toUpperCase()}</p>
                  <p className="text-[10px] text-slate-400">{profile.commanderRank} • {profile.commanderCallsign}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Sistem Otomasi Manajemen Keuangan Pangkalan (SIMKEU-AU v4.8)</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-bold uppercase"
            >
              {language === 'id' ? 'Tutup Pratinjau' : 'Close Preview'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
