import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Radio, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface Props {
  language: 'id' | 'en';
}

const INTEL_ID = [
  'Peningkatan aktivitas terdeteksi di sektor utara.',
  'Gangguan cuaca terpantau di wilayah udara timur.',
  'Pemeliharaan radar sedang berlangsung di Lanud Supadio.',
  'Latihan gabungan terjadwal di Laut Natuna.',
  'Status kesiapan tempur: OPTIMAL.',
  'Sistem peringatan dini beroperasi normal.'
];

const INTEL_EN = [
  'Increased activity detected in northern sector.',
  'Weather disturbance monitored in eastern airspace.',
  'Radar maintenance ongoing at Supadio Airbase.',
  'Scheduled joint exercises in Natuna Sea.',
  'Combat readiness status: OPTIMAL.',
  'Early warning systems operating normally.'
];

export const StatusIntelligencePanel: React.FC<Props> = ({ language }) => {
  const [intelIndex, setIntelIndex] = useState(0);
  const [status, setStatus] = useState<'NORMAL' | 'ELEVATED' | 'HIGH ALERT'>('NORMAL');
  
  const intelList = language === 'id' ? INTEL_ID : INTEL_EN;

  useEffect(() => {
    const intelInterval = setInterval(() => {
      setIntelIndex(prev => (prev + 1) % intelList.length);
    }, 6000);

    const statusInterval = setInterval(() => {
      const rolls = Math.random();
      if (rolls > 0.8) setStatus('ELEVATED');
      else if (rolls > 0.95) setStatus('HIGH ALERT');
      else setStatus('NORMAL');
    }, 30000);

    return () => {
      clearInterval(intelInterval);
      clearInterval(statusInterval);
    };
  }, [intelList.length]);

  return (
    <div className="space-y-4">
      {/* National Status */}
      <div className="bg-black/40 border border-white/5 rounded-xl p-4">
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">National Airspace Status</span>
            </div>
            <div className={cn(
              "px-2 py-0.5 rounded text-[10px] font-black tracking-widest",
              status === 'NORMAL' ? "bg-green-500/20 text-green-500" :
              status === 'ELEVATED' ? "bg-orange-500/20 text-orange-500" :
              "bg-red-500/20 text-red-500 animate-pulse"
            )}>
               {status}
            </div>
         </div>
         
         <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'RADAR', val: '98%', status: 'active' },
              { label: 'SATELLITE', val: 'OK', status: 'active' },
              { label: 'GRID', val: 'SECURE', status: 'active' }
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center">
                 <span className="text-[8px] text-white/40 font-mono uppercase">{item.label}</span>
                 <span className="text-[10px] font-bold text-blue-400">{item.val}</span>
              </div>
            ))}
         </div>
      </div>

      {/* Intelligence Intel */}
      <div className="bg-blue-900/10 border border-blue-500/10 rounded-xl p-4 overflow-hidden h-24 relative">
         <div className="absolute top-2 left-4 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest">Tactical Intelligence</span>
         </div>

         <div className="mt-5 h-12 flex items-center">
            <motion.p 
              key={intelIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[11px] text-white/80 font-medium leading-tight italic"
            >
              "{intelList[intelIndex]}"
            </motion.p>
         </div>

         <div className="absolute bottom-2 right-4 text-[8px] font-mono text-white/10 uppercase italic">
            Last Update: {new Date().toLocaleTimeString()}
         </div>
      </div>
    </div>
  );
};
