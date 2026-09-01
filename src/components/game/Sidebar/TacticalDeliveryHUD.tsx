import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Plane, 
  Warehouse, 
  Layers, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  Flame,
  Radio,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PendingDeliveryItem } from '../../../types';
import { cn } from '../../../lib/utils';

interface TacticalDeliveryHUDProps {
  language: 'id' | 'en';
  pendingJobs: PendingDeliveryItem[];
  onExpediteJob?: (jobId: string) => void;
  formatCurrency: (val: number) => string;
}

export const TacticalDeliveryHUD: React.FC<TacticalDeliveryHUDProps> = ({
  language,
  pendingJobs,
  onExpediteJob,
  formatCurrency
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (pendingJobs.length === 0) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(interval);
  }, [pendingJobs.length]);

  if (pendingJobs.length === 0) return null;

  const getJobIcon = (type: PendingDeliveryItem['type']) => {
    switch (type) {
      case 'AIRCRAFT': return Plane;
      case 'HANGAR_UPGRADE': return Warehouse;
      case 'APRON_UPGRADE': return Layers;
      case 'CREW_RECRUITMENT': return Users;
      case 'TRAINING': return GraduationCap;
      default: return Clock;
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0e1626] to-black border border-cyan-500/40 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2 font-mono text-white">
      {/* HEADER */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg animate-pulse">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[8.5px] font-black text-white tracking-wider flex items-center gap-1.5 uppercase">
              <span>{language === 'id' ? 'LOGISTIK & PROGRES WAKTU NYATA' : 'REAL-TIME LOGISTICS & QUEUE'}</span>
              <span className="text-[7px] bg-cyan-500/30 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
                {pendingJobs.length} AKTIF
              </span>
            </span>
            <span className="text-[7px] text-white/50 block">
              Pengiriman pesawat, konstruksi pangkalan & diklat
            </span>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded bg-white/5 text-white/60 hover:text-white"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* JOBS LIST */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1.5 overflow-hidden pt-1"
          >
            {pendingJobs.map((job) => {
              const Icon = getJobIcon(job.type);
              const remainingSec = Math.max(0, Math.ceil((job.finishTime - now) / 1000));
              const elapsedMs = now - job.startTime;
              const totalMs = job.totalDurationSeconds * 1000;
              const progress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

              return (
                <div
                  key={job.id}
                  className="p-2 bg-black/60 border border-white/10 rounded-xl space-y-1.5 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="p-1.5 bg-cyan-950 text-cyan-300 border border-cyan-700/40 rounded-lg shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-bold text-white block truncate">
                          {language === 'id' ? job.titleId : job.titleEn}
                        </span>
                        <span className="text-[6.5px] text-cyan-300/80 block truncate">
                          {job.subtitle || (job.type === 'AIRCRAFT' ? 'Ferry flight en-route dari Depohar...' : 'Dalam pengerjaan tim teknis...')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[8.5px] font-black text-amber-300 font-mono flex items-center justify-end gap-1">
                        <Clock className="w-2.5 h-2.5 animate-spin" />
                        <span>{remainingSec}s</span>
                      </span>
                      <span className="text-[6.5px] text-white/40 block">
                        {progress}% Selesai
                      </span>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* EXPEDITE OPTION */}
                  {onExpediteJob && remainingSec > 2 && (
                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => onExpediteJob(job.id)}
                        className="text-[6.5px] font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1 transition-all"
                      >
                        <Sparkles className="w-2 h-2 text-amber-300" />
                        <span>Percepat (Poin Tempur Komandan)</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
