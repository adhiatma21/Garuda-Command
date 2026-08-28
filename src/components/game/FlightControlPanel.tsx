import React from 'react';
import { Compass, Gauge, ArrowUp, Navigation, Settings2, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FlightControlPanelProps {
  autoPilot: boolean;
  setAutoPilot: (val: boolean) => void;
  targetAltitude: number;
  setTargetAltitude: (val: number) => void;
  targetHeading: number;
  setTargetHeading: (val: number) => void;
  targetSpeed: number;
  setTargetSpeed: (val: number) => void;
  verticalSpeed: number;
  setVerticalSpeed: (val: number) => void;
  combatMode: boolean;
  setCombatMode: (val: boolean) => void;
  language: string;
  onRTB?: () => void;
  isRTB?: boolean;
}

export const FlightControlPanel: React.FC<FlightControlPanelProps> = ({
  autoPilot,
  setAutoPilot,
  targetAltitude,
  setTargetAltitude,
  targetHeading,
  setTargetHeading,
  targetSpeed,
  setTargetSpeed,
  verticalSpeed,
  setVerticalSpeed,
  combatMode,
  setCombatMode,
  language,
  onRTB,
  isRTB
}) => {
  return (
    <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl pointer-events-auto w-[240px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">{language === 'id' ? 'KONTROL PENERBANGAN' : 'FLIGHT CONTROL'}</h3>
        <button 
          onClick={() => setAutoPilot(!autoPilot)}
          className={cn(
            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter transition-all",
            autoPilot ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-white/10 text-white/40"
          )}
        >
          {autoPilot ? 'AP ON' : 'MANUAL'}
        </button>
      </div>

      <div className="space-y-4">
        {/* ALTITUDE */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5 font-bold text-white/50">
              <ArrowUp className="w-3 h-3" />
              <span>ALTITUDE</span>
            </div>
            <span className="font-mono font-bold text-white">{targetAltitude} <span className="text-[7px]">FT</span></span>
          </div>
          <input 
            type="range" min="1000" max="60000" step="500"
            value={targetAltitude}
            onChange={(e) => setTargetAltitude(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none slider-thumb-custom cursor-pointer"
          />
        </div>

        {/* HEADING */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5 font-bold text-white/50">
              <Compass className="w-3 h-3" />
              <span>HEADING</span>
            </div>
            <span className="font-mono font-bold text-white">{targetHeading}°</span>
          </div>
          <input 
            type="range" min="0" max="359" step="1"
            value={targetHeading}
            onChange={(e) => setTargetHeading(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none slider-thumb-custom cursor-pointer"
          />
        </div>

        {/* SPEED */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5 font-bold text-white/50">
              <Gauge className="w-3 h-3" />
              <span>SPEED</span>
            </div>
            <span className="font-mono font-bold text-white">{targetSpeed} <span className="text-[7px]">KTS</span></span>
          </div>
          <input 
            type="range" min="100" max="1800" step="10"
            value={targetSpeed}
            onChange={(e) => setTargetSpeed(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none slider-thumb-custom cursor-pointer"
          />
        </div>

        {/* VERTICAL SPEED */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5 font-bold text-white/50">
              <Navigation className="w-3 h-3" />
              <span>V-SPEED</span>
            </div>
            <span className="font-mono font-bold text-white">{verticalSpeed} <span className="text-[7px]">FPM</span></span>
          </div>
          <input 
            type="range" min="-5000" max="5000" step="100"
            value={verticalSpeed}
            onChange={(e) => setVerticalSpeed(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none slider-thumb-custom cursor-pointer"
          />
        </div>

        {/* ACTIONS */}
        <div className="pt-3 border-t border-white/5 flex gap-2">
           <button 
            onClick={() => setCombatMode(!combatMode)}
            className={cn(
               "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2",
               combatMode ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "bg-white/5 text-white/40 hover:bg-white/10"
            )}
           >
             <ShieldAlert size={12} />
             {language === 'id' ? 'MODE TEMPUR' : 'COMBAT MODE'}
           </button>
           
           {onRTB && (
             <button
               onClick={onRTB}
               disabled={isRTB}
               className={cn(
                 "px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5",
                 isRTB 
                   ? "bg-orange-600/50 text-orange-200 cursor-not-allowed border border-orange-400/30" 
                   : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30 active:scale-95"
               )}
               title={language === 'id' ? 'Kembali ke Pangkalan (RTB)' : 'Return to Base (RTB)'}
             >
               <RotateCcw size={11} className={isRTB ? "animate-spin" : ""} />
               <span>RTB</span>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

const ShieldAlert = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

