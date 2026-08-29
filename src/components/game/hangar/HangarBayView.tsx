import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Maximize2, 
  Zap, 
  Flame, 
  Moon, 
  Cpu, 
  Radio, 
  Activity, 
  Crosshair, 
  Thermometer,
  Gauge,
  Sparkles,
  Plane
} from 'lucide-react';
import { Aircraft, PlayerProfile } from '../../../types';
import { FrontAircraftSilhouette } from './FrontAircraftSilhouette';
import { cn } from '../../../lib/utils';
import emptyHangarBg from '../../../assets/images/empty_hangar_bay_1787660134660.jpg';

interface HangarBayViewProps {
  language: 'id' | 'en';
  selectedAircraft: Aircraft;
  tailNumber?: string;
  playerProfile: PlayerProfile | null;
  squadronName?: string;
}

export const HangarBayView: React.FC<HangarBayViewProps> = ({
  language,
  selectedAircraft,
  tailNumber: propTailNumber,
  playerProfile,
  squadronName = 'Skadron Udara 3'
}) => {
  const [lighting, setLighting] = useState<'cinematic' | 'cyber_blue' | 'tactical_red' | 'night'>('cinematic');
  const [showHUDGrid, setShowHUDGrid] = useState(true);
  const [scannerActive, setScannerActive] = useState(true);

  // Compute dynamic Tail Number and Specs based on selectedAircraft
  const { tailNumber, specsData } = useMemo(() => {
    const acId = selectedAircraft.id.toLowerCase();
    let num = propTailNumber;

    if (!num || num === 'TS-1601') {
      if (acId.includes('hawk') || acId.includes('hawk-209') || acId.includes('hawk-109')) {
        num = 'TT-0201';
      } else if (acId.includes('f16-emlu') || acId.includes('f16-cd') || acId.includes('f16')) {
        num = 'TS-1601';
      } else if (acId.includes('su27')) {
        num = 'TS-2701';
      } else if (acId.includes('su30')) {
        num = 'TS-3001';
      } else if (acId.includes('su57')) {
        num = 'TS-5701';
      } else if (acId.includes('rafale')) {
        num = 'TS-4001';
      } else if (acId.includes('super-tucano') || acId.includes('tucano')) {
        num = 'TT-3101';
      } else if (acId.includes('t50') || acId.includes('golden-eagle')) {
        num = 'TT-5001';
      } else if (acId.includes('c130') || acId.includes('hercules')) {
        num = 'A-1301';
      } else if (acId.includes('c212')) {
        num = 'A-2101';
      } else if (acId.includes('b737') || acId.includes('737')) {
        num = 'A-7301';
      } else if (acId.includes('falcon-8x') || acId.includes('falcon')) {
        num = 'A-0801';
      } else if (acId.includes('super-puma') || acId.includes('puma') || acId.includes('caracal')) {
        num = 'H-3201';
      } else if (acId.includes('f22')) {
        num = 'AF-2201';
      } else if (acId.includes('f35')) {
        num = 'AF-3501';
      } else if (acId.includes('a10')) {
        num = 'OA-1001';
      } else {
        num = 'TS-0101';
      }
    }

    // Wingspan (meters), height (meters), length (meters)
    let wingspan = 9.96;
    let height = 5.09;
    let length = 15.06;
    let airframeClass = 'SUPERSONIC MULTIROLE FIGHTER';

    if (acId.includes('hawk') || acId.includes('hawk-209') || acId.includes('hawk-109')) {
      wingspan = 9.94;
      height = 4.00;
      length = 11.38;
      airframeClass = 'LIGHT COMBAT & TACTICAL STRIKE (LIFT)';
    } else if (acId.includes('f16')) {
      wingspan = 9.96;
      height = 5.09;
      length = 15.06;
      airframeClass = 'LIGHT MULTIROLE FIGHTER (4th GEN)';
    } else if (acId.includes('su27') || acId.includes('su30')) {
      wingspan = 14.70;
      height = 5.93;
      length = 21.90;
      airframeClass = 'HEAVY AIR SUPERIORITY FIGHTER (4+ GEN)';
    } else if (acId.includes('su57')) {
      wingspan = 14.10;
      height = 4.60;
      length = 20.10;
      airframeClass = '5th GEN STEALTH AIR SUPERIORITY';
    } else if (acId.includes('rafale')) {
      wingspan = 10.90;
      height = 5.34;
      length = 15.27;
      airframeClass = 'OMNIROLE CANARD-DELTA FIGHTER (4.5 GEN)';
    } else if (acId.includes('t50') || acId.includes('golden-eagle')) {
      wingspan = 9.45;
      height = 4.94;
      length = 13.14;
      airframeClass = 'LEAD-IN FIGHTER TRAINER / LIGHT ATTACK';
    } else if (acId.includes('super-tucano') || acId.includes('tucano')) {
      wingspan = 11.14;
      height = 3.97;
      length = 11.38;
      airframeClass = 'COUNTER-INSURGENCY / LIGHT ATTACK';
    } else if (acId.includes('c130') || acId.includes('hercules')) {
      wingspan = 40.41;
      height = 11.66;
      length = 29.79;
      airframeClass = 'HEAVY TACTICAL AIRLIFTER';
    } else if (acId.includes('c212')) {
      wingspan = 20.28;
      height = 6.30;
      length = 16.15;
      airframeClass = 'LIGHT TACTICAL TRANSPORT';
    } else if (acId.includes('b737') || acId.includes('737')) {
      wingspan = 28.88;
      height = 11.13;
      length = 33.40;
      airframeClass = 'MARITIME PATROL & SURVEILLANCE';
    } else if (acId.includes('falcon-8x') || acId.includes('falcon')) {
      wingspan = 26.29;
      height = 7.94;
      length = 24.46;
      airframeClass = 'VVIP STRATEGIC TRANSPORT';
    } else if (acId.includes('super-puma') || acId.includes('puma') || acId.includes('caracal')) {
      wingspan = 15.60;
      height = 4.97;
      length = 18.70;
      airframeClass = 'TACTICAL TRANSPORT & CSAR HELICOPTER';
    } else if (acId.includes('f22')) {
      wingspan = 13.56;
      height = 5.08;
      length = 18.92;
      airframeClass = '5th GEN STEALTH AIR SUPERIORITY';
    } else if (acId.includes('f35')) {
      wingspan = 10.70;
      height = 4.38;
      length = 15.67;
      airframeClass = '5th GEN STEALTH MULTIROLE';
    } else if (acId.includes('a10')) {
      wingspan = 17.53;
      height = 4.47;
      length = 16.26;
      airframeClass = 'CLOSE AIR SUPPORT (CAS)';
    }

    const bayWidth = 24.00; // Standard 24-meter military hangar maintenance bay width
    const clearance = ((bayWidth - wingspan) / 2);
    const portClearance = Math.max(clearance, 1.2).toFixed(2);
    const stbdClearance = Math.max(clearance, 1.2).toFixed(2);

    return {
      tailNumber: num,
      specsData: {
        wingspan: wingspan.toFixed(2),
        height: height.toFixed(2),
        length: length.toFixed(2),
        portClearance,
        stbdClearance,
        airframeClass
      }
    };
  }, [selectedAircraft, propTailNumber]);

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden select-none flex flex-col justify-between">
      {/* 1. LAYER 1: PURE EMPTY HANGAR BACKGROUND WITHOUT ANY STATIC AIRCRAFT */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Photorealistic Empty Hangar Bay Image */}
        <img 
          src={emptyHangarBg}
          alt="Clean Empty Military Hangar Bay Interior"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center filter contrast-105 brightness-95 transition-all duration-700"
        />

        {/* Cinematic Vignette & Atmospheric Shadows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-[#050811]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050811]/90 via-transparent to-[#050811]/90" />
        
        {/* Overhead Spotlights with Conical Volumetric Lighting */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[400px] h-[700px] bg-gradient-to-b from-amber-100/20 via-amber-300/5 to-transparent blur-3xl transform -rotate-12 pointer-events-none" />
        <div className="absolute top-0 right-1/4 translate-x-1/2 w-[400px] h-[700px] bg-gradient-to-b from-amber-100/20 via-amber-300/5 to-transparent blur-3xl transform rotate-12 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[750px] bg-gradient-to-b from-white/25 via-blue-400/10 to-transparent blur-3xl pointer-events-none" />

        {/* Dynamic Atmosphere Lighting Filters according to Mode */}
        {lighting === 'cinematic' && (
          <div className="absolute inset-0 bg-blue-950/20 mix-blend-overlay" />
        )}
        {lighting === 'cyber_blue' && (
          <div className="absolute inset-0 bg-cyan-950/40 mix-blend-color" />
        )}
        {lighting === 'tactical_red' && (
          <div className="absolute inset-0 bg-red-950/50 mix-blend-hard-light" />
        )}
        {lighting === 'night' && (
          <div className="absolute inset-0 bg-emerald-950/60 mix-blend-hard-light" />
        )}

        {/* Top Warning Hazard Strip */}
        <div 
          className="absolute top-0 left-0 w-full h-1.5 opacity-40 z-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #eab308, #eab308 10px, #000 10px, #000 20px)'
          }}
        />

        {/* GLOSSY CONCRETE FLOOR MARKINGS & TAXIWAY GUIDE LINES */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#050811] via-[#050811]/60 to-transparent">
          {/* Floor Laser Grid Lines */}
          <div className="absolute inset-0 opacity-15 [mask-image:linear-gradient(to_bottom,transparent,black)]">
            <div className="w-full h-full bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:4rem_2rem]" />
          </div>

          {/* Center Taxi Guide Yellow Glowing Line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-3/4 bg-yellow-500/70 shadow-[0_0_20px_rgba(234,179,8,0.6)] flex flex-col items-center justify-around py-3">
            <div className="w-0.5 h-6 bg-black/60 rounded" />
            <div className="w-0.5 h-6 bg-black/60 rounded" />
            <div className="w-0.5 h-6 bg-black/60 rounded" />
          </div>

          {/* Tactical Bay Perimeter Markings */}
          <div className="absolute bottom-6 left-10 text-[26px] font-black text-white/10 font-mono select-none tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400/40 animate-ping" />
            BAY 01 • {tailNumber}
          </div>
          <div className="absolute bottom-6 right-10 text-[26px] font-black text-white/10 font-mono select-none tracking-widest text-right">
            HOLD SHORT LINE
          </div>

          {/* Yellow Safety Staging Perimeter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[950px] h-28 border-2 border-dashed border-yellow-500/25 rounded-3xl pointer-events-none shadow-[0_0_15px_rgba(234,179,8,0.1)]" />
        </div>

        {/* Diagnostic Laser Scan Beam */}
        {scannerActive && (
          <motion.div 
            animate={{ y: ['15%', '85%', '15%'] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] z-10 opacity-75"
          />
        )}
      </div>

      {/* 2. TOP TELEMETRY & CONTROLS BAR */}
      <div className="relative z-20 p-3.5 flex items-center justify-between bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                {squadronName} • HANGAR BAY 01
              </span>
              <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DOCK 01 • {tailNumber}
              </span>
            </div>
            <p className="text-[9px] font-mono text-white/50">
              {selectedAircraft.name} • {specsData.airframeClass}
            </p>
          </div>
        </div>

        {/* Environmental Telemetry */}
        <div className="hidden lg:flex items-center gap-4 text-[9px] font-mono bg-black/70 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-white/70">
            <Thermometer className="w-3.5 h-3.5 text-blue-400" />
            <span>23.8°C CLIMATE CONTROL</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-white/70">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>GPU 115V / 400Hz CONNECTED</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-white/70">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>SYSTEM TEST: 100% NOMINAL</span>
          </div>
        </div>

        {/* Lighting & HUD Control Buttons */}
        <div className="flex items-center gap-1.5 bg-black/70 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLighting('cinematic')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1",
              lighting === 'cinematic' ? "bg-amber-600/90 text-white shadow-md shadow-amber-500/30" : "text-white/40 hover:text-white"
            )}
            title="Cinematic Warm Spotlight Lighting"
          >
            <Sparkles className="w-3 h-3" />
            <span>CINEMATIC</span>
          </button>
          <button
            type="button"
            onClick={() => setLighting('cyber_blue')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1",
              lighting === 'cyber_blue' ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-white/40 hover:text-white"
            )}
            title="Cyber Blue Tactical Lighting"
          >
            <Zap className="w-3 h-3" />
            <span>CYBER</span>
          </button>
          <button
            type="button"
            onClick={() => setLighting('tactical_red')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1",
              lighting === 'tactical_red' ? "bg-red-600 text-white shadow-md shadow-red-500/30" : "text-white/40 hover:text-white"
            )}
            title="Tactical Red Scramble Lighting"
          >
            <Flame className="w-3 h-3" />
            <span>SCRAMBLE</span>
          </button>
          <button
            type="button"
            onClick={() => setLighting('night')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1",
              lighting === 'night' ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" : "text-white/40 hover:text-white"
            )}
            title="Night Vision NVG Mode"
          >
            <Moon className="w-3 h-3" />
            <span>NVG</span>
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Toggle HUD Grid */}
          <button
            type="button"
            onClick={() => setShowHUDGrid(!showHUDGrid)}
            className={cn(
              "p-1.5 rounded-lg text-[9px] font-mono transition-all",
              showHUDGrid ? "bg-white/15 text-cyan-300 border border-cyan-400/30" : "text-white/30 hover:text-white"
            )}
            title="Toggle Dimensions HUD Grid"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Scanner Beam */}
          <button
            type="button"
            onClick={() => setScannerActive(!scannerActive)}
            className={cn(
              "p-1.5 rounded-lg text-[9px] font-mono transition-all",
              scannerActive ? "bg-white/15 text-cyan-300 border border-cyan-400/30" : "text-white/30 hover:text-white"
            )}
            title="Toggle Diagnostics Laser Scan"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. LAYER 2: DYNAMIC AIRCRAFT FRONT SILHOUETTE & DIMENSIONAL HUD OVERLAY */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <FrontAircraftSilhouette 
          aircraft={selectedAircraft}
          tailNumber={tailNumber}
          lighting={lighting === 'cinematic' ? 'day' : lighting}
          showHUDGrid={showHUDGrid}
          wingspan={specsData.wingspan}
          height={specsData.height}
          length={specsData.length}
          portClearance={specsData.portClearance}
          stbdClearance={specsData.stbdClearance}
        />
      </div>

      {/* 4. BOTTOM TACTICAL STATUS BAR */}
      <div className="relative z-20 p-3 bg-black/75 backdrop-blur-xl border-t border-white/10 flex items-center justify-between text-[9px] font-mono shadow-2xl">
        <div className="flex items-center gap-4 text-white/60">
          <span className="flex items-center gap-1.5 text-blue-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>MISSION COMPUTER: ONLINE</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="w-3.5 h-3.5" />
            <span>TACAN / IFF: MODE 4 SECURE</span>
          </span>
          <span className="hidden sm:inline text-white/40">
            TAIL NO: <strong className="text-white font-bold">{tailNumber}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/40">AIRFRAME STATUS:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            100% AIRWORTHY & MISSION READY
          </span>
        </div>
      </div>
    </div>
  );
};
