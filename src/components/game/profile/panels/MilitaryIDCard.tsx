import React from 'react';
import { motion } from 'motion/react';
import { Shield, User, MapPin, Award, Activity, Plane } from 'lucide-react';
import { PlayerProfile } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { SQUADRON_DATA } from '../../../../constants';

interface Props {
  profile: Partial<PlayerProfile>;
  language: 'id' | 'en';
}

export const MilitaryIDCard: React.FC<Props> = ({ profile, language }) => {
  const squadron = SQUADRON_DATA.find(s => s.id === profile.squadron);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-sm aspect-[1.6/1] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/20 rounded-xl overflow-hidden shadow-2xl relative group"
    >
      {/* Card Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 2px)', backgroundSize: '100% 2px' }} />
      
      {/* Holographic Flash */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/5 to-transparent -translate-x-[100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

      {/* Header */}
      <div className="bg-blue-600/20 border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-black tracking-widest text-white italic uppercase">MIL-SPEC ID</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
        </div>
      </div>

      <div className="p-4 flex gap-4 h-full relative">
        {/* Photo Slot */}
        <div className="w-24 h-full bg-black/40 border border-white/5 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
          <User className="w-12 h-12 text-white/10" />
          <div className="absolute bottom-0 w-full h-8 bg-blue-600/20 backdrop-blur-md border-t border-white/10 flex items-center justify-center">
            <span className="text-[8px] font-mono text-blue-400 font-bold uppercase">{profile.rank || 'RANK'}</span>
          </div>
          {/* Scanline Effect on Photo */}
          <motion.div 
            animate={{ y: [0, 96, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-0.5 bg-cyan-400/30 shadow-[0_0_5px_rgba(34,211,238,0.5)] z-10"
          />
        </div>

        {/* Data Fields */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-2">
            <div>
              <p className="text-[8px] font-mono text-blue-400/60 uppercase tracking-tighter">Full Name / Callsign</p>
              <h3 className="text-sm font-bold text-white truncate uppercase italic">{profile.commanderName || 'UNDEFINED'}</h3>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-blue-400 italic">{profile.callsign || 'NO CALLSIGN'}</p>
                {profile.email && <p className="text-[7px] font-mono text-white/40 truncate max-w-[110px]">{profile.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] font-mono text-blue-400/60 uppercase tracking-tighter">Branch</p>
                <p className="text-[9px] font-bold text-white uppercase">{profile.branch || 'TNI-AU'}</p>
              </div>
              <div>
                <p className="text-[8px] font-mono text-blue-400/60 uppercase tracking-tighter">Specialization</p>
                <p className="text-[9px] font-bold text-white uppercase">{profile.specialization || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-[8px] font-mono text-blue-400/60 uppercase tracking-tighter">Assignment</p>
              <p className="text-[9px] font-bold text-white uppercase truncate">{squadron?.name || 'SQUADRON'}</p>
              <p className="text-[8px] text-white/40 font-mono -mt-0.5">{profile.homeAirbase || 'LOCATION'}</p>
            </div>
          </div>

          {/* Footer Details */}
          <div className="flex items-end justify-between">
            <div className="flex gap-1">
               <div className="w-6 h-1.5 bg-blue-500/20 rounded-full" />
               <div className="w-10 h-1.5 bg-blue-500/40 rounded-full" />
            </div>
            <div className="text-right">
              <p className="text-[7px] font-mono text-white/20 uppercase">Auth: IND-HQ-P-02</p>
              <p className="text-[7px] font-mono text-blue-500 font-bold uppercase tracking-widest">VALIDATED</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Corner */}
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rotate-45 opacity-20" />
    </motion.div>
  );
};
