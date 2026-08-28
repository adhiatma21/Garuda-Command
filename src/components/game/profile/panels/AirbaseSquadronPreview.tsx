import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Plane, Radio, Terminal, Cloud, Activity } from 'lucide-react';
import { SQUADRON_DATA, AIRCRAFT_PRESETS } from '../../../../constants';

interface Props {
  airbase: string;
  squadronId: string;
  language: 'id' | 'en';
}

export const AirbaseSquadronPreview: React.FC<Props> = ({ airbase, squadronId, language }) => {
  const squadron = SQUADRON_DATA.find(s => s.id === squadronId);
  const primaryAircraft = AIRCRAFT_PRESETS.find(a => squadron?.aircraftIds.includes(a.id));

  // Determine role based on aircraft or squadron
  const getRole = () => {
    if (primaryAircraft?.type === 'fighter') return language === 'id' ? 'Superioritas Udara' : 'Air Superiority';
    if (primaryAircraft?.type === 'transport') return language === 'id' ? 'Airlift Strategis' : 'Strategic Airlift';
    return language === 'id' ? 'Patroli Maritim' : 'Maritime Patrol';
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Airbase Preview */}
      <div className="bg-black/40 border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Base Intelligence</span>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-[9px] text-white/40 uppercase">Location</span>
              <span className="text-[10px] text-white font-bold uppercase">{airbase.replace('Lanud ', '')}</span>
           </div>
           <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-[9px] text-white/40 uppercase">Status</span>
              <span className="text-[10px] text-green-400 font-bold uppercase">Operational</span>
           </div>
           <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-[9px] text-white/40 uppercase">Radar Ops</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase">98% Coverage</span>
           </div>
           
           <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-white/5 p-2 rounded flex items-center gap-2">
                 <Cloud className="w-3 h-3 text-cyan-400" />
                 <div className="flex flex-col">
                    <span className="text-[7px] text-white/20 uppercase">Weather</span>
                    <span className="text-[9px] text-white">VFR / 10KM</span>
                 </div>
              </div>
              <div className="bg-white/5 p-2 rounded flex items-center gap-2">
                 <Radio className="w-3 h-3 text-blue-400" />
                 <div className="flex flex-col">
                    <span className="text-[7px] text-white/20 uppercase">Comms</span>
                    <span className="text-[9px] text-white">ACTIVE</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Squadron Preview */}
      <div className="bg-blue-900/5 border border-blue-500/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Squadron Profile</span>
        </div>

        <div className="space-y-2">
           <p className="text-sm font-black text-white italic uppercase tracking-tight">{squadron?.name}</p>
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                 <Plane className="w-3.5 h-3.5 text-blue-400" />
                 <span className="text-[10px] text-white/80">{primaryAircraft?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                 <span className="text-[10px] text-cyan-400/80 font-bold uppercase">{getRole()}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
