import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Shield, Terminal, Radio, Mail, Plane, MapPin, Award } from 'lucide-react';
import { PlayerProfile } from '../../../../types';
import { SQUADRON_DATA, AIRCRAFT_PRESETS } from '../../../../constants';

interface Props {
  profile: Partial<PlayerProfile>;
  language: 'id' | 'en';
  onConfirm: () => void;
  onBack: () => void;
}

export const CommandBriefing: React.FC<Props> = ({ profile, language, onConfirm, onBack }) => {
  const squadron = SQUADRON_DATA.find(s => s.id === profile.squadron);
  const aircraft = AIRCRAFT_PRESETS.find(a => a.id === profile.primaryAircraftId);

  return (
    <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto space-y-6 py-4">
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
         
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                 <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{language === 'id' ? 'TAKLIMAT KOMANDAN' : 'COMMAND BRIEFING'}</h3>
                 <p className="text-blue-400/60 text-xs font-mono uppercase tracking-widest">Operational Readiness Authorization</p>
              </div>
            </div>
            {profile.email && (
              <div className="hidden sm:flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-right">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-mono text-white/70">{profile.email}</span>
              </div>
            )}
         </div>

         <div className="space-y-3 font-medium text-white/80 leading-relaxed italic text-xs lg:text-sm">
            <p>
              {language === 'id' ? 
                `Selamat datang kembali, ${profile.rank} ${profile.commanderName} (${profile.callsign || 'PILOT'}).` : 
                `Welcome aboard, ${profile.rank} ${profile.commanderName} (${profile.callsign || 'PILOT'}).`}
            </p>
            <p>
              {language === 'id' ? 
                "Profil Anda telah diverifikasi oleh Komando Pertahanan Udara Nasional. Seluruh parameter penugasan dan armada tempur siap dioperasikan." : 
                "Your profile has been verified by National Air Defense Command. All deployment parameters and aircraft assets are ready for operation."}
            </p>
         </div>

         {/* Deployment Dossier Summary Card */}
         <div className="mt-5 p-4 bg-black/50 border border-white/10 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div>
              <span className="text-[8px] font-mono uppercase text-blue-400/70 block">Callsign</span>
              <span className="text-xs font-black text-white uppercase">{profile.callsign || 'PILOT-01'}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono uppercase text-blue-400/70 block">Cabang & Rank</span>
              <span className="text-xs font-bold text-white uppercase truncate block">{profile.rank}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono uppercase text-blue-400/70 block">Pangkalan</span>
              <span className="text-xs font-bold text-white uppercase truncate block">{profile.homeAirbase || 'Lanud'}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono uppercase text-blue-400/70 block">Armada Utama</span>
              <span className="text-xs font-bold text-emerald-400 uppercase truncate block">{aircraft?.name || 'F-16 Falcon'}</span>
            </div>
         </div>

         <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
               <Terminal className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-mono text-white/40 uppercase">System: ENCRYPTED-L4</span>
            </div>
            <div className="flex items-center gap-3">
               <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
               <span className="text-[10px] font-mono text-white/40 uppercase">Comms: ACTIVE</span>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5"
        >
          {language === 'id' ? 'KEMBALI' : 'BACK'}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 group active:scale-95"
        >
          {language === 'id' ? 'MULAI KOMANDO' : 'START COMMAND'}
          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
