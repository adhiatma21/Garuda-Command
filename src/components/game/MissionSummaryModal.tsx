import React from 'react';
import { Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Waypoint } from '../../types';
import { MilitaryAirport } from '../../airports';

interface MissionSummaryModalProps {
  show: boolean;
  onClose: () => void;
  language: string;
  points: number;
  fuelRemaining: number;
  flightHours: number;
  waypoints: Waypoint[];
  arrivalAirport: MilitaryAirport | null;
}

export const MissionSummaryModal: React.FC<MissionSummaryModalProps> = ({
  show,
  onClose,
  language,
  points,
  fuelRemaining,
  flightHours,
  waypoints,
  arrivalAirport
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#0a0c10] border border-green-500/30 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl shadow-green-500/10 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
            
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center">
                <Trophy className="w-10 h-10 text-green-400" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-white">
                  {language === 'id' ? 'MISI SELESAI' : 'MISSION ACCOMPLISHED'}
                </h2>
                <p className="text-sm text-green-400/60 font-mono uppercase tracking-widest">
                  {language === 'id' ? 'Pendaratan Berhasil di' : 'Successful Landing at'} {arrivalAirport?.icao}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 w-full">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{language === 'id' ? 'SKOR TOTAL' : 'TOTAL SCORE'}</p>
                  <p className="text-3xl font-mono font-bold text-blue-400">{points}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{language === 'id' ? 'SISA BBM' : 'FUEL REMAINING'}</p>
                  <p className="text-3xl font-mono font-bold text-orange-400">{Math.round(fuelRemaining)}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{language === 'id' ? 'WAKTU TERBANG' : 'FLIGHT TIME'}</p>
                  <p className="text-3xl font-mono font-bold text-green-400">{flightHours.toFixed(1)}h</p>
                </div>
              </div>

              <div className="w-full bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-left">{language === 'id' ? 'LOG PENERBANGAN' : 'FLIGHT LOG'}</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {waypoints.filter(w => w.reached).map((wp, i) => (
                    <div key={`reached-wp-${wp.id}-${i}`} className="flex items-center justify-between text-[11px] font-mono py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-white/20">0{i + 1}</span>
                        <span className="text-white/80">{wp.name}</span>
                      </div>
                      <span className="text-green-500/60">REACHED</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-5 bg-white text-black font-black rounded-2xl transition-all hover:bg-green-400 hover:scale-[1.02] active:scale-95 uppercase tracking-[0.2em] text-sm shadow-xl"
              >
                {language === 'id' ? 'KEMBALI KE MENU UTAMA' : 'RETURN TO MAIN MENU'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
