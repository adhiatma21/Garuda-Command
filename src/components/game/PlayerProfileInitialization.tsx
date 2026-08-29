import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Activity,
  User,
  MapPin,
  Plane,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  MILITARY_RANKS, 
  MILITARY_BRANCHES, 
  MILITARY_SPECIALIZATIONS, 
  INDONESIAN_AIRBASES, 
  SQUADRON_DATA,
  AIRCRAFT_PRESETS,
  PLAYABLE_SQUADRONS
} from '../../constants';
import { PlayerProfile } from '../../types';
import { cn } from '../../lib/utils';

// Modular Components
import { TacticalBackground } from './profile/effects/TacticalBackground';
import { SecuritySequence } from './profile/effects/SecuritySequence';
import { MilitaryIDCard } from './profile/panels/MilitaryIDCard';
import { StatusIntelligencePanel } from './profile/panels/StatusIntelligencePanel';
import { AirbaseSquadronPreview } from './profile/panels/AirbaseSquadronPreview';
import { IdentityForm } from './profile/panels/IdentityForm';
import { CommandBriefing } from './profile/panels/CommandBriefing';

interface Props {
  onComplete: (profile: PlayerProfile) => void;
  language: 'id' | 'en';
}

export const PlayerProfileInitialization: React.FC<Props> = ({ onComplete, language }) => {
  const [step, setStep] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Registered Profiles in LocalStorage (Cleared of dummy data, populated exclusively by real user registrations)
  const [registeredProfiles, setRegisteredProfiles] = useState<PlayerProfile[]>(() => {
    try {
      // Clear legacy dummy accounts if any were stored
      localStorage.removeItem('ais_commander_profile');
      localStorage.removeItem('ais_player_profile');
      
      const saved = localStorage.getItem('ais_registered_commanders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out dummy/mock entries if they exist
          const filtered = parsed.filter(p => p.email && p.email !== 'elang01@tni-au.mil.id');
          return filtered;
        }
      }
    } catch (e) {
      console.error('Failed to parse registered commanders', e);
    }
    return [];
  });

  const [isRecognizedAccount, setIsRecognizedAccount] = useState<boolean>(false);

  // Profile State
  const [profile, setProfile] = useState<Partial<PlayerProfile>>({
    email: '',
    commanderName: '',
    callsign: '',
    rank: MILITARY_RANKS[0],
    branch: MILITARY_BRANCHES[0],
    specialization: MILITARY_SPECIALIZATIONS[0],
    homeAirbase: INDONESIAN_AIRBASES[0],
    squadron: SQUADRON_DATA[0].id,
    primaryAircraftId: SQUADRON_DATA[0].aircraftIds[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Function to explicitly wipe all saved commander data so user can re-register from scratch
  const handleClearRegisteredData = useCallback(() => {
    try {
      localStorage.removeItem('ais_registered_commanders');
      localStorage.removeItem('ais_active_profile');
      localStorage.removeItem('ais_commander_profile');
      localStorage.removeItem('ais_player_profile');
      setRegisteredProfiles([]);
      setProfile({
        email: '',
        commanderName: '',
        callsign: '',
        rank: MILITARY_RANKS[0],
        branch: MILITARY_BRANCHES[0],
        specialization: MILITARY_SPECIALIZATIONS[0],
        homeAirbase: INDONESIAN_AIRBASES[0],
        squadron: SQUADRON_DATA[0].id,
        primaryAircraftId: SQUADRON_DATA[0].aircraftIds[0]
      });
      setIsRecognizedAccount(false);
      setErrors({});
    } catch (e) {
      console.error('Failed to clear stored commanders', e);
    }
  }, []);

  // Audio Refs
  const audioAmbienceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('https://www.soundjay.com/ambient/spaceship-ambience-01.mp3');
    audio.loop = true;
    audio.volume = 0.1;
    audioAmbienceRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audioAmbienceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioAmbienceRef.current) {
      audioAmbienceRef.current.muted = isAudioMuted;
    }
  }, [isAudioMuted]);

  // Handle email search and auto-fill profile data
  const handleEmailChange = useCallback((inputEmail: string) => {
    const clean = inputEmail.trim().toLowerCase();
    const found = registeredProfiles.find(p => p.email?.trim().toLowerCase() === clean);
    
    if (found) {
      setProfile({
        ...found,
        email: inputEmail // preserve user casing
      });
      setIsRecognizedAccount(true);
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.email;
        delete updated.commanderName;
        delete updated.callsign;
        return updated;
      });
    } else {
      setProfile(prev => ({
        ...prev,
        email: inputEmail
      }));
      setIsRecognizedAccount(false);
    }
  }, [registeredProfiles]);

  const handleSelectRegisteredEmail = useCallback((email: string) => {
    handleEmailChange(email);
  }, [handleEmailChange]);

  const availableAircraft = useMemo(() => {
    const squadron = SQUADRON_DATA.find(s => s.id === profile.squadron);
    if (!squadron) return [];
    return AIRCRAFT_PRESETS.filter(a => squadron.aircraftIds.includes(a.id));
  }, [profile.squadron]);

  const handleSquadronChange = (sqId: string) => {
    const squadron = SQUADRON_DATA.find(s => s.id === sqId);
    if (squadron) {
      setProfile(prev => ({
        ...prev,
        squadron: sqId,
        primaryAircraftId: squadron.aircraftIds[0]
      }));
    }
  };

  const validate = (targetStep?: number) => {
    const newErrors: Record<string, string> = {};
    
    // Step 1: Identity (Email, Name, Callsign)
    if (!profile.email || profile.email.trim() === '') {
      newErrors.email = language === 'id' ? 'Email Komandan wajib diisi' : 'Commander Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      newErrors.email = language === 'id' ? 'Format email tidak valid (contoh: nama@domain.com)' : 'Invalid email format (e.g. name@domain.com)';
    }

    if (!profile.commanderName || profile.commanderName.trim() === '') {
      newErrors.commanderName = language === 'id' ? 'Nama Komandan wajib diisi' : 'Commander Name is required';
    }
    if (!profile.callsign || profile.callsign.trim() === '') {
      newErrors.callsign = language === 'id' ? 'Callsign wajib diisi' : 'Callsign is required';
    }
    
    // Step 2: Assignment
    if (targetStep === 2 || (targetStep || 0) > 2) {
      if (!profile.specialization) newErrors.specialization = language === 'id' ? 'Pilih spesialisasi' : 'Select specialization';
      if (!profile.homeAirbase) newErrors.homeAirbase = language === 'id' ? 'Pilih pangkalan' : 'Select airbase';
    }

    // Step 3: Fleet
    if (targetStep === 3 || (targetStep || 0) > 3) {
      if (!profile.squadron) newErrors.squadron = language === 'id' ? 'Pilih skadron' : 'Select squadron';
      if (!profile.primaryAircraftId) newErrors.aircraft = language === 'id' ? 'Pilih pesawat' : 'Select aircraft';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleStartCommand = () => {
    if (validate(4)) {
      const fullProfile = profile as PlayerProfile;
      // Persist profile to localStorage
      const updatedProfiles = [
        fullProfile,
        ...registeredProfiles.filter(p => p.email?.trim().toLowerCase() !== fullProfile.email?.trim().toLowerCase())
      ];
      try {
        localStorage.setItem('ais_registered_commanders', JSON.stringify(updatedProfiles));
        localStorage.setItem('ais_active_profile', JSON.stringify(fullProfile));
        
        // Find matching playable squadron id
        const sqMatch = PLAYABLE_SQUADRONS.find(
          s => s.id === fullProfile.squadron || 
               s.name.toLowerCase() === (fullProfile.squadron || '').toLowerCase() ||
               (fullProfile.squadron || '').toLowerCase().includes(s.name.toLowerCase())
        );
        const assignedSqId = sqMatch ? sqMatch.id : 'sq1';
        localStorage.setItem('ais_active_squadron_id', assignedSqId);

        // Ensure this initial squadron is registered as the first unlocked squadron
        const existingUnlocksStr = localStorage.getItem('ais_unlocked_squadron_ids');
        let currentUnlocks: string[] = [assignedSqId];
        if (existingUnlocksStr) {
          try {
            const parsed = JSON.parse(existingUnlocksStr);
            if (Array.isArray(parsed) && !parsed.includes(assignedSqId)) {
              currentUnlocks = [assignedSqId, ...parsed];
            } else if (Array.isArray(parsed)) {
              currentUnlocks = parsed;
            }
          } catch (e) {}
        }
        localStorage.setItem('ais_unlocked_squadron_ids', JSON.stringify(currentUnlocks));
      } catch (e) {
        console.error('Failed to save commander profile', e);
      }
      onComplete(fullProfile);
    }
  };

  const nextStep = () => {
    if (!validate(step)) {
      return;
    }
    
    if (step === 1) {
      // Jika email sudah pernah didaftarkan, lewati halaman military assignment dan fleet selection, langsung ke COMMAND BRIEFING
      if (isRecognizedAccount) {
        setStep(4);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step === 4 && isRecognizedAccount) {
      // Return directly to step 1 if steps 2 and 3 were skipped
      setStep(1);
    } else {
      setStep(prev => Math.max(1, prev - 1));
    }
  };

  const registeredEmailsList = useMemo(() => {
    return registeredProfiles.map(p => p.email).filter(Boolean);
  }, [registeredProfiles]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#05070a] flex items-center justify-center p-4 overflow-hidden">
      <TacticalBackground />
      <motion.div 
        key="main-init-form"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl flex flex-col md:flex-row gap-6 h-full max-h-[850px]"
      >
        {/* Left Section: Info & Previews */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">GARUDA COMMAND</h1>
                <p className="text-[10px] text-blue-400/60 font-mono tracking-widest uppercase">Onboarding System</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { s: 1, title: language === 'id' ? 'Identitas' : 'Identity', desc: language === 'id' ? 'Email & Data Pilot' : 'Email & Pilot Data' },
                { 
                  s: 2, 
                  title: language === 'id' ? 'Penempatan' : 'Assignment', 
                  desc: isRecognizedAccount ? (language === 'id' ? 'Tersimpan Otomatis' : 'Auto Loaded') : (language === 'id' ? 'Pangkalan & Spesialisasi' : 'Airbase & Specialization'),
                  skipped: isRecognizedAccount
                },
                { 
                  s: 3, 
                  title: language === 'id' ? 'Armada' : 'Fleet', 
                  desc: isRecognizedAccount ? (language === 'id' ? 'Tersimpan Otomatis' : 'Auto Loaded') : (language === 'id' ? 'Skadron & Pesawat' : 'Squadron & Aircraft'),
                  skipped: isRecognizedAccount
                },
                { s: 4, title: language === 'id' ? 'Taklimat' : 'Briefing', desc: language === 'id' ? 'Otorisasi Misi' : 'Mission Clearance' }
              ].map(item => (
                <div key={item.s} className={cn(
                  "flex items-center gap-3 transition-all duration-300 p-2 rounded-xl",
                  step === item.s ? "bg-blue-500/10 border border-blue-500/30 translate-x-1" : "opacity-40"
                )}>
                  <div className={cn(
                    "w-6 h-6 rounded border flex items-center justify-center font-mono text-[10px] shrink-0",
                    step === item.s ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-white/20 text-white/40"
                  )}>
                    {item.skipped ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : `0${item.s}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-bold uppercase tracking-wider flex items-center justify-between",
                      step === item.s ? "text-white" : "text-white/60"
                    )}>
                      <span>{item.title}</span>
                      {item.skipped && (
                        <span className="text-[7px] font-mono text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/20">
                          AUTO
                        </span>
                      )}
                    </p>
                    <p className="text-[8px] font-mono text-white/40 truncate">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <StatusIntelligencePanel language={language} />

          <div className="mt-auto">
            <button 
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="flex items-center gap-2 text-[10px] font-mono text-white/40 hover:text-white transition-colors p-2"
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isAudioMuted ? 'AUDIO DISABLED' : 'AUDIO ACTIVE'}
            </button>
          </div>
        </div>

        {/* Center Section: Main Form */}
        <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col relative overflow-hidden h-full">
          {/* Decorative Header Border */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="shrink-0 mb-6">
            <h2 className="text-xl lg:text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-500" />
              {step === 1 ? (language === 'id' ? 'Inisialisasi Identitas Komandan' : 'Commander Identity Initialization') :
               step === 2 ? (language === 'id' ? 'Data Penempatan Militer' : 'Military Assignment Data') :
               step === 3 ? (language === 'id' ? 'Pemilihan Armada Tempur' : 'Fleet & Aircraft Selection') :
               (language === 'id' ? 'Taklimat Kesiapan Operasional' : 'Operational Readiness Briefing')}
            </h2>
          </div>

          <div className="flex-1 flex flex-col relative overflow-hidden h-full">
            <AnimatePresence mode="wait">
              {step < 4 ? (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="pb-24">
                      <IdentityForm 
                        profile={profile}
                        setProfile={setProfile}
                        step={step}
                        setStep={setStep}
                        language={language}
                        errors={errors}
                        availableAircraft={availableAircraft}
                        handleSquadronChange={handleSquadronChange}
                        isRecognizedAccount={isRecognizedAccount}
                        onEmailChange={handleEmailChange}
                        registeredEmails={registeredEmailsList}
                        onSelectRegisteredEmail={handleSelectRegisteredEmail}
                        onClearRegisteredData={handleClearRegisteredData}
                      />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-[#0c111a] via-[#0c111a] to-transparent z-30 flex items-center justify-between -mx-6 px-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={step === 1}
                      className={cn(
                        "px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2",
                        step === 1 ? "opacity-0 pointer-events-none" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                      )}
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      {language === 'id' ? 'KEMBALI' : 'BACK'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={nextStep}
                      className={cn(
                        "px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 group active:scale-95 border",
                        (step === 3 || (step === 1 && isRecognizedAccount))
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] border-blue-400" 
                          : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      )}
                    >
                      {step === 1 && isRecognizedAccount ? (
                        language === 'id' ? 'LANJUT KE TAKLIMAT (STEP 04)' : 'PROCEED TO BRIEFING (STEP 04)'
                      ) : step === 3 ? (
                        language === 'id' ? 'MENU 04: TAKLIMAT' : 'STEP 04: BRIEFING'
                      ) : (
                        language === 'id' ? 'LANJUT' : 'NEXT'
                      )}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="briefing"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <CommandBriefing 
                      profile={profile}
                      language={language}
                      onConfirm={handleStartCommand}
                      onBack={prevStep}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section: Previews */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          {/* Military ID Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 ml-1">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Digital ID Preview</span>
            </div>
            <MilitaryIDCard profile={profile} language={language} />
          </div>

          {/* Airbase / Squadron Details */}
          <AirbaseSquadronPreview 
            airbase={profile.homeAirbase || ''}
            squadronId={profile.squadron || ''}
            language={language}
          />

          {/* Legal/Disclaimer */}
          <div className="mt-auto bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-[8px] font-mono text-white/30 leading-relaxed uppercase">
              TNI-AU Digital Air Command Simulator &copy; 2025. Authorized Personnel Only.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
