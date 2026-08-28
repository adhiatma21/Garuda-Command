import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { Aircraft, Position, Waypoint } from '../../types';
import { getDistance, cn } from '../../lib/utils';

interface MissionTerminalProps {
  selectedAircraft: Aircraft;
  currentPos: Position | null;
  currentAltitude: number;
  speed: number | null;
  heading: number | null;
  waypoints: Waypoint[];
  fuelRemaining: number;
  points: number;
  flightHours: number;
  missionType: string;
  playerEta: number | null;
  vvipEta: number | null;
  language: 'id' | 'en';
  isPatrolMission?: boolean;
  interceptTarget?: any | null;
}

export const MissionTerminal: React.FC<MissionTerminalProps> = ({
  selectedAircraft,
  currentPos,
  currentAltitude,
  speed,
  heading,
  waypoints,
  fuelRemaining,
  points,
  flightHours,
  missionType,
  playerEta,
  vvipEta,
  language,
  isPatrolMission,
  interceptTarget
}) => {
  const nextWp = waypoints.find(wp => !wp.reached);
  const distanceToNext = currentPos && nextWp ? getDistance(currentPos.lat, currentPos.lng, nextWp.lat, nextWp.lng) : 0;
  const etaNext = speed && speed > 0 ? (distanceToNext / speed) * 3600 : 0;

  return (
    <div className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-3 font-mono text-[7px] text-green-400 w-[260px] shadow-2xl ring-1 ring-green-500/10 pointer-events-auto">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold uppercase tracking-widest text-[8px]">[ {isPatrolMission ? (language === 'id' ? 'PATROLI AKTIF' : 'ACTIVE PATROL') : (language === 'id' ? 'MONITORING MISI' : 'MISSION MONITORING')} ]</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
          <div className="w-1 h-1 bg-green-500 rounded-full" />
        </div>
      </div>
      
      <div className="text-green-500/20 mb-1">----------------------------------------</div>
      
      {interceptTarget && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded flex flex-col gap-1"
        >
          <div className="flex justify-between items-center text-[7px] font-black text-red-500">
             <span>!! CONTACT INTERCEPT !!</span>
             <span className="animate-pulse">TRACKING</span>
          </div>
          <div className="flex justify-between text-[6px] text-white/60">
             <span>TARGET: {interceptTarget.callsign}</span>
             <span>DIST: {getDistance(currentPos?.lat || 0, currentPos?.lng || 0, interceptTarget.lat, interceptTarget.lng).toFixed(1)} NM</span>
          </div>
        </motion.div>
      )}

      {missionType === 'VVIPEscort' && playerEta !== null && vvipEta !== null && (
        <div className="mb-2 p-1.5 bg-blue-500/10 border border-blue-500/20 rounded">
          <div className="flex justify-between items-center text-[6px] uppercase text-blue-300/60 mb-0.5 font-black">
            <span>Coordination Data</span>
            <span>Sync: {Math.round(Math.abs(playerEta - vvipEta))}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40">VVIP ETA RV:</span>
            <span className="text-blue-400 font-bold">{Math.max(0, Math.floor(vvipEta / 60))}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40">SELF ETA RV:</span>
            <span className="text-white font-bold">{Math.max(0, Math.floor(playerEta / 60))}m</span>
          </div>
          <div className="mt-1 text-center py-0.5 bg-black/40 rounded">
            {playerEta < vvipEta - 60 ? (
              <span className="text-orange-400 font-black animate-pulse">[ PATROL RECOMMENDED ]</span>
            ) : playerEta > vvipEta + 60 ? (
              <span className="text-red-400 font-black animate-pulse">[ INCREASE THRUST ]</span>
            ) : (
              <span className="text-green-400 font-black">[ ON STATION ]</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="space-y-0.5">
          <p className="text-green-500/40 uppercase text-[5px] font-black mb-0.5">NAVIGATION DATA</p>
          <div className="flex justify-between">
            <span className="text-white/40">LAT:</span>
            <span>{currentPos?.lat?.toFixed(4)}N</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">LNG:</span>
            <span>{currentPos?.lng?.toFixed(4)}E</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">HDG:</span>
            <span className="text-white font-bold">{Math.round(heading || 0)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">VAR:</span>
            <span>+0.2°</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="text-green-500/40 uppercase text-[5px] font-black mb-0.5">PERFORMANCE</p>
          <div className="flex justify-between">
            <span className="text-white/40">ALT:</span>
            <span className="text-blue-400 font-bold">{Math.round(currentAltitude).toLocaleString()} FT</span>
          </div>
          <div className="flex justify-between">
             <span className="text-white/40">IAS:</span>
             <span className="text-blue-400 font-bold">{Math.round(speed || 0)} KTS</span>
          </div>
          <div className="flex justify-between">
             <span className="text-white/40">GS:</span>
             <span className="text-white">{Math.round((speed || 0) * 1.05)} KTS</span>
          </div>
          <div className="flex justify-between">
             <span className="text-white/40">MACH:</span>
             <span>{((speed || 0) / 661.7).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-0.5 col-span-2 mt-1 pt-1 border-t border-green-500/10">
          <p className="text-green-500/40 uppercase text-[5px] font-black mb-0.5">MISSION SYSTEMS</p>
          <div className="grid grid-cols-2 gap-x-4">
             <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-white/40">FUEL:</span>
                  <span className={cn("font-bold", fuelRemaining < selectedAircraft.maxFuel * 0.2 ? "text-red-500 animate-pulse" : "text-green-400")}>
                    {Math.round(fuelRemaining).toLocaleString()} LB
                  </span>
                </div>
                <div className="flex justify-between">
                   <span className="text-white/40">CONS:</span>
                   <span>{Math.round(selectedAircraft.burnRate * (speed || 0)).toLocaleString()} LB/H</span>
                </div>
             </div>
             <div className="space-y-0.5">
                <div className="flex justify-between">
                   <span className="text-white/40">ETA:</span>
                   <span className="text-blue-400 font-bold">{nextWp ? `${Math.floor(etaNext / 60)}M ${Math.floor(etaNext % 60)}S` : '---'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-white/40">WP:</span>
                   <span className="text-blue-400 truncate max-w-[50px]">{nextWp?.name || 'TERMINAL'}</span>
                </div>
             </div>
          </div>
          <div className="flex justify-between mt-1 text-[6px]">
            <p className="text-white/40">TOTAL FLIGHT TIME: <span className="text-white">{flightHours.toFixed(1)} HRS</span></p>
            <p className="text-white/40">SQUADRON SCORE: <span className="text-blue-400 font-bold">{points}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
