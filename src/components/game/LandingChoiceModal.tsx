import React from 'react';
import { PlaneLanding, MapPin, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MilitaryAirport } from '../../airports';

interface LandingChoiceModalProps {
  show: boolean;
  arrivalAirport: MilitaryAirport | null;
  onConfirm: () => void;
  onCancel: () => void;
  language: string;
}

export const LandingChoiceModal: React.FC<LandingChoiceModalProps> = ({
  show,
  arrivalAirport,
  onConfirm,
  onCancel,
  language
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#0c111a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
              <PlaneLanding size={32} />
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
               {language === 'id' ? 'KONFIRMASI PENDARATAN' : 'LANDING CONFIRMATION'}
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              {language === 'id' 
                ? `Pesawat Anda telah mencapai area pendaratan ${arrivalAirport?.name}. Apakah Anda ingin segera mendarat di base ini?`
                : `Your aircraft has reached the ${arrivalAirport?.name} landing area. Do you wish to proceed with landing at this base?`
              }
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                 <div className="flex items-center gap-2 text-white/20 mb-1">
                   <MapPin size={10} />
                   <span className="text-[8px] font-black uppercase tracking-widest">Base</span>
                 </div>
                 <p className="text-xs font-black text-white">{arrivalAirport?.icao}</p>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                 <div className="flex items-center gap-2 text-white/20 mb-1">
                   <Gauge size={10} />
                   <span className="text-[8px] font-black uppercase tracking-widest">Status</span>
                 </div>
                 <p className="text-xs font-black text-green-400 uppercase tracking-widest">Clear</p>
               </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={onConfirm}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
              >
                {language === 'id' ? 'KONFIRMASI PENDARATAN' : 'CONFIRM LANDING'}
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-4 text-white/30 font-black rounded-2xl transition-all hover:text-white uppercase tracking-widest text-xs"
              >
                {language === 'id' ? 'BATALKAN' : 'CANCEL'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
