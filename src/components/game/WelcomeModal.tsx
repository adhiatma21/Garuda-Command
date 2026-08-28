import React from 'react';
import { ShieldCheck, Radar, Plane, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeModalProps {
  show: boolean;
  onStart: () => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  show,
  onStart,
  language,
  setLanguage
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[8000] flex items-center justify-center bg-[#05070a] p-6 overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-blue-500/20 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1500px] h-[1500px] border border-blue-500/10 rounded-full animate-spin-slow" />
          </div>

          {/* New Background Emblem */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] grayscale mix-blend-screen pointer-events-none overflow-hidden">
            <img 
              src="/src/assets/images/military_emblem_1779193633060.png" 
              alt="Military Emblem Background" 
              className="w-[120%] h-auto max-w-[1200px] object-contain blur-[3px]"
            />
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="max-w-4xl w-full grid md:grid-cols-2 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
          >
            {/* Left Column: Visual/Title */}
            <div className="p-12 flex flex-col justify-between bg-gradient-to-br from-blue-600/10 to-transparent border-r border-white/5">
              <div className="space-y-6">
                 <div className="w-16 h-1 bg-blue-600 rounded-full" />
                 <h1 className="text-6xl font-black text-white leading-[0.8] tracking-tighter uppercase">
                   Dirgantara<br/>
                   <span className="text-blue-500 tracking-[-0.05em]">Command</span>
                 </h1>
                 <p className="text-white/40 text-sm font-medium tracking-tight max-w-[280px] leading-relaxed uppercase">
                   {language === 'id' 
                     ? 'Simulator Komando Operasi Udara Tentara Nasional Indonesia.'
                     : 'Indonesian National Air Force Operations Command Simulator.'
                   }
                 </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLanguage('id')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === 'id' ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                  >
                    Bahasa
                  </button>
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === 'en' ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                  >
                    English
                  </button>
                </div>
                <div className="flex items-center gap-4 text-white/10">
                   <ShieldCheck size={20} />
                   <Radar size={20} />
                   <Plane size={20} />
                   <Globe size={20} />
                </div>
              </div>
            </div>

            {/* Right Column: Content/CTA */}
            <div className="p-12 flex flex-col justify-center gap-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">
                  {language === 'id' ? 'SISTEM OPERASI TERPADU' : 'INTEGRATED OPERATING SYSTEM'}
                </h3>
                <div className="space-y-6 text-white/60">
                   <div className="flex gap-4">
                     <span className="text-white font-black text-xs">01</span>
                     <p className="text-xs leading-relaxed uppercase font-bold tracking-tight">
                       {language === 'id' ? 'Pantau wilayah udara dengan sistem radar real-time' : 'Monitor airspace with real-time radar systems'}
                     </p>
                   </div>
                   <div className="flex gap-4">
                     <span className="text-white font-black text-xs">02</span>
                     <p className="text-xs leading-relaxed uppercase font-bold tracking-tight">
                       {language === 'id' ? 'Koordinasi misi pengawalan VVIP dan pengisian bahan bakar' : 'Coordinate VVIP escort missions and air refueling'}
                     </p>
                   </div>
                   <div className="flex gap-4">
                     <span className="text-white font-black text-xs">03</span>
                     <p className="text-xs leading-relaxed uppercase font-bold tracking-tight">
                       {language === 'id' ? 'Manajemen logistik pangkalan udara militer strategis' : 'Strategic military airbase logistics management'}
                     </p>
                   </div>
                </div>
              </div>

              <button 
                onClick={onStart}
                className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-95 uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-600/30 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <span>{language === 'id' ? 'MEMULAI OPERASI' : 'START OPERATIONS'}</span>
                  <div className="w-6 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>
              </button>

              <p className="text-[9px] text-center text-white/20 uppercase font-black tracking-widest">
                v2.0 Beta Protocol | Secure Connection Established
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
