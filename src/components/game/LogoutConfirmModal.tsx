import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, AlertTriangle, X, Shield, ArrowRight, RotateCcw } from 'lucide-react';

interface LogoutConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirmLogout: (mode: 'restart' | 'switch_profile') => void;
  language: 'id' | 'en';
  commanderName?: string;
  callsign?: string;
  rank?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  show,
  onClose,
  onConfirmLogout,
  language,
  commanderName = 'Penerbang',
  callsign = 'ELANG-01',
  rank = 'Lettu'
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[8000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 text-white shadow-2xl shadow-red-950/60 relative overflow-hidden"
        >
          {/* Top glowing line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  {language === 'id' ? 'Konfirmasi Logout Sistem' : 'Confirm System Logout'}
                </h3>
                <p className="text-[10px] text-red-400 font-mono">
                  TERMINASI SESI KOMANDO UDARA
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Perwira Komando:</span>
              <span className="font-bold text-white">{rank} {commanderName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Callsign:</span>
              <span className="font-bold text-blue-400 font-mono">{callsign}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Status Sistem:</span>
              <span className="text-emerald-400 font-mono font-bold">DATA TERSIMPAN</span>
            </div>
            <p className="text-[11px] text-slate-300 pt-2 border-t border-white/5">
              {language === 'id'
                ? 'Semua data profil penerbang, perizinan skuadron, dan saldo keuangan pangkalan telah disimpan. Pilih tindakan yang ingin Anda lakukan:'
                : 'All pilot profile records, squadron licenses, and airbase finances are preserved. Select desired action:'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onConfirmLogout('switch_profile')}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'id' ? 'Logout & Ganti Profil / Login Ulang' : 'Logout & Switch Profile / Re-login'}</span>
            </button>

            <button
              onClick={() => onConfirmLogout('restart')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span>{language === 'id' ? 'Reset Sesi & Ke Halaman Boot' : 'Reset Session & Return to Boot'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              {language === 'id' ? 'Batalkan (Kembali ke Game)' : 'Cancel (Return to Game)'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
