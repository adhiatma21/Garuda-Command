import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Menu, Eye, EyeOff } from 'lucide-react';
import { MissionTerminal } from './MissionTerminal';
import { FlightControlPanel } from './FlightControlPanel';
import { RadioCommsFeed } from './RadioCommsFeed';
import { Scenario, Aircraft, Waypoint, Position, TrafficAircraft, EscortStage } from '../../types';
import { CommsMessage } from '../../engine/aviationCommsEngine';

interface MissionOverlaysProps {
  language: 'id' | 'en';
  isSimulating: boolean;
  isReconSimulating?: boolean;
  activeScenario: Scenario | null;
  setActiveScenario: (s: Scenario | null) => void;
  selectedAircraft: Aircraft;
  currentPos: Position | null;
  currentAltitude: number;
  speed: number | null;
  heading: number | null;
  targetAltitude: number;
  setTargetAltitude: (alt: number) => void;
  targetHeading: number;
  setTargetHeading: (h: number) => void;
  targetSpeed: number;
  setTargetSpeed: (s: number) => void;
  verticalSpeed: number;
  setVerticalSpeed: (vs: number) => void;
  autoPilot: boolean;
  setAutoPilot: (ap: boolean) => void;
  combatMode: boolean;
  setCombatMode: (cm: boolean) => void;
  waypoints: Waypoint[];
  fuelRemaining: number;
  points: number;
  flightHours: number;
  missionType: string;
  playerEta: number | null;
  vvipEta: number | null;
  setPoints: (p: number | ((prev: number) => number)) => void;
  setFuelRemaining: (f: number | ((prev: number) => number)) => void;
  isMenuMinimized: boolean;
  setIsMenuMinimized: (min: boolean) => void;
  isPatrolMission?: boolean;
  interceptTarget?: TrafficAircraft | null;
  escortStage?: EscortStage;
  isToolbarVisible?: boolean;
  setIsToolbarVisible?: (visible: boolean | ((prev: boolean) => boolean)) => void;
  commsMessages?: CommsMessage[];
  onReplayAudio?: (text: string, isATC: boolean) => void;
  onTransmitMessage?: (text: string) => void;
  onRTB?: () => void;
  isRTB?: boolean;
  isRadioMuted?: boolean;
  onToggleRadioMute?: () => void;
  isMultiMission?: boolean;
}

export const MissionOverlays: React.FC<MissionOverlaysProps> = ({
  language,
  isSimulating,
  isReconSimulating = false,
  activeScenario,
  setActiveScenario,
  selectedAircraft,
  currentPos,
  currentAltitude,
  speed,
  heading,
  targetAltitude,
  setTargetAltitude,
  targetHeading,
  setTargetHeading,
  targetSpeed,
  setTargetSpeed,
  verticalSpeed,
  setVerticalSpeed,
  autoPilot,
  setAutoPilot,
  combatMode,
  setCombatMode,
  waypoints,
  fuelRemaining,
  points,
  flightHours,
  missionType,
  playerEta,
  vvipEta,
  setPoints,
  setFuelRemaining,
  isMenuMinimized,
  setIsMenuMinimized,
  isPatrolMission,
  interceptTarget,
  escortStage = 'idle',
  isToolbarVisible = true,
  setIsToolbarVisible,
  commsMessages = [],
  onReplayAudio,
  onTransmitMessage,
  onRTB,
  isRTB,
  isRadioMuted,
  onToggleRadioMute,
  isMultiMission
}) => {
  if (!isSimulating && !isReconSimulating && !activeScenario && commsMessages.length === 0) return null;

  const toggleToolbar = () => {
    if (setIsToolbarVisible) {
      setIsToolbarVisible(prev => !prev);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[1001]">
      {/* Buka Menu Button Overlay (when left sidebar is minimized) */}
      <AnimatePresence>
        {isMenuMinimized && (
          <motion.button 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuMinimized(false);
            }}
            className="absolute left-6 top-6 z-[5000] p-3 bg-blue-600 border border-blue-400/30 rounded-xl text-white hover:bg-blue-500 transition-all shadow-2xl flex items-center justify-center group pointer-events-auto"
            title={language === 'id' ? 'Buka Menu Manajemen' : 'Open Management Menu'}
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Escort Active / Formation Badge Overlay */}
      <AnimatePresence>
        {missionType === 'VVIPEscort' && escortStage === 'escorting' && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[3000] pointer-events-auto"
          >
            <div className="bg-emerald-950/90 backdrop-blur-xl border border-emerald-400/50 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 ring-1 ring-emerald-400/30">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest leading-none">
                  {language === 'id' ? 'FORMASI AKTIF (ESCORT ACTIVE)' : 'FORMATION ACTIVE (ESCORT ACTIVE)'}
                </span>
                <span className="text-[8px] font-mono text-emerald-200/80 mt-1">
                  {language === 'id' ? 'Mengawal pesawat Presiden/VVIP menuju pangkalan tujuan' : 'Escorting VVIP aircraft towards destination airbase'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {missionType === 'VVIPEscort' && escortStage === 'vvip_landed' && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[3000] pointer-events-auto"
          >
            <div className="bg-cyan-950/90 backdrop-blur-xl border border-cyan-400/50 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 ring-1 ring-cyan-400/30">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest leading-none">
                  {language === 'id' ? 'VVIP MENDARAT AMAN (+500 PTS)' : 'VVIP SAFELY LANDED (+500 PTS)'}
                </span>
                <span className="text-[8px] font-mono text-cyan-200/80 mt-1">
                  {language === 'id' ? 'Lanjutkan navigasi menuju pangkalan kedatangan Anda' : 'Proceed navigation towards your selected arrival airbase'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Intensive Tactical Radio Comms Feed (Top Left) */}
      {(isSimulating || isReconSimulating || commsMessages.length > 0) && (
        <RadioCommsFeed 
          language={language}
          messages={commsMessages}
          onReplayAudio={onReplayAudio}
          onTransmitMessage={onTransmitMessage}
          isMuted={isRadioMuted}
          onToggleMute={onToggleRadioMute}
          isMultiMission={isMultiMission}
        />
      )}

      {/* Left Side Comms / Scenario Alerts */}
      <div className={`absolute ${commsMessages.length > 0 ? 'top-36' : 'top-24'} left-6 pointer-events-none flex flex-col gap-4`}>
        <AnimatePresence>
          {activeScenario && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="bg-black/85 backdrop-blur-xl border border-green-500/40 rounded-xl p-4 font-mono text-[10px] text-green-400 w-[320px] shadow-2xl ring-1 ring-green-500/20 pointer-events-auto"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0 border border-green-500/30">
                  <ShieldAlert className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-green-300 font-bold text-[11px] uppercase tracking-wider truncate">
                    [!] {activeScenario.title || 'COMMS'}: {(activeScenario.message || activeScenario.description || '').toUpperCase()}
                  </p>
                  <p className="text-green-400/80 text-[9px] mt-1 italic">
                    {activeScenario.actionRequired || activeScenario.description || 'Instruksi Diterima'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-3 mt-1 border-t border-green-500/20">
                <button 
                  onClick={() => {
                    if (activeScenario.suggestedValue) {
                      if (activeScenario.type === 'INTERCEPT' && interceptTarget) {
                        const lat1 = currentPos?.lat || 0;
                        const lon1 = currentPos?.lng || 0;
                        const lat2 = interceptTarget.lat;
                        const lon2 = interceptTarget.lng;
                        const φ1 = (lat1 * Math.PI) / 180;
                        const φ2 = (lat2 * Math.PI) / 180;
                        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
                        const y = Math.sin(Δλ) * Math.cos(φ2);
                        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
                        const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
                        setTargetHeading(brng);
                        setAutoPilot(false);
                      }
                      
                      if (activeScenario.type === 'TURBULENCE' || activeScenario.type === 'LANDING' || activeScenario.type === 'WEATHER') {
                        setTargetAltitude(activeScenario.suggestedValue);
                        setAutoPilot(false);
                      }
                      if (activeScenario.type === 'TRAFFIC') {
                        setTargetSpeed(activeScenario.suggestedValue);
                        setAutoPilot(false);
                      }
                      if (activeScenario.type === 'INTERCEPT') {
                        setPoints(prev => prev + (activeScenario.points || 0));
                        setFuelRemaining(prev => prev - (activeScenario.fuelCost || 0));
                      } else {
                        setPoints(prev => prev + 20);
                      }
                    }
                    setActiveScenario(null);
                  }}
                  className="flex-1 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/50 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  {language === 'id' ? 'Laksanakan' : 'Execute'}
                </button>
                <button 
                  onClick={() => setActiveScenario(null)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  {language === 'id' ? 'Abaikan' : 'Ignore'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side Radar Info Terminal (Toolbar) */}
      <AnimatePresence>
        {isToolbarVisible && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-6 right-6 pointer-events-none"
          >
            <MissionTerminal 
              selectedAircraft={selectedAircraft}
              currentPos={currentPos}
              currentAltitude={currentAltitude}
              speed={speed}
              heading={heading}
              waypoints={waypoints}
              fuelRemaining={fuelRemaining}
              points={points}
              flightHours={flightHours}
              missionType={missionType}
              playerEta={playerEta}
              vvipEta={vvipEta}
              language={language}
              isPatrolMission={isPatrolMission}
              interceptTarget={interceptTarget}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flight Control Panel Overlay (Bottom Right) */}
      <AnimatePresence>
        {isToolbarVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-24 right-6 pointer-events-none"
          >
            <FlightControlPanel 
              autoPilot={autoPilot}
              setAutoPilot={setAutoPilot}
              targetAltitude={targetAltitude}
              setTargetAltitude={setTargetAltitude}
              targetHeading={targetHeading}
              setTargetHeading={setTargetHeading}
              targetSpeed={targetSpeed}
              setTargetSpeed={setTargetSpeed}
              verticalSpeed={verticalSpeed}
              setVerticalSpeed={setVerticalSpeed}
              combatMode={combatMode}
              setCombatMode={setCombatMode}
              language={language}
              onRTB={onRTB}
              isRTB={isRTB}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Control Buttons (Includes Toolbar Toggle) */}
      <div className="absolute bottom-6 right-6 z-[1000] flex items-end justify-end pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto items-end">
          <button 
            onClick={toggleToolbar}
            className={`px-3 py-2 rounded-xl border flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all font-mono text-[9px] font-bold tracking-wider uppercase ${
              isToolbarVisible 
                ? 'bg-black/75 border-white/15 text-white/80 hover:text-white hover:bg-black/90' 
                : 'bg-blue-600/90 border-blue-400 text-white shadow-blue-500/30 animate-pulse'
            }`}
            title={isToolbarVisible 
              ? (language === 'id' ? 'Sembunyikan Toolbar & Panel (HUD)' : 'Hide Toolbar & Panels (HUD)') 
              : (language === 'id' ? 'Tampilkan Toolbar & Panel (HUD)' : 'Unhide Toolbar & Panels (HUD)')}
          >
            {isToolbarVisible ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4 text-white" />}
            <span>{isToolbarVisible ? (language === 'id' ? 'HIDE HUD' : 'HIDE HUD') : (language === 'id' ? 'SHOW HUD' : 'SHOW HUD')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
