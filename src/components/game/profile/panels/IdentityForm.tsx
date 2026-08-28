import React from 'react';
import { User, Terminal, Briefcase, Award, ChevronRight, Plane, MapPin, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { 
  MILITARY_RANKS, 
  MILITARY_BRANCHES, 
  MILITARY_SPECIALIZATIONS, 
  INDONESIAN_AIRBASES, 
  SQUADRON_DATA,
  AIRCRAFT_PRESETS
} from '../../../../constants';
import { PlayerProfile, Aircraft } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { motion } from 'motion/react';

interface Props {
  profile: Partial<PlayerProfile>;
  setProfile: (p: Partial<PlayerProfile>) => void;
  step: number;
  setStep: (s: number | ((prev: number) => number)) => void;
  language: 'id' | 'en';
  errors: Record<string, string>;
  availableAircraft: Aircraft[];
  handleSquadronChange: (id: string) => void;
  isRecognizedAccount?: boolean;
  onEmailChange?: (email: string) => void;
  registeredEmails?: string[];
  onSelectRegisteredEmail?: (email: string) => void;
  onClearRegisteredData?: () => void;
}

export const IdentityForm: React.FC<Props> = ({ 
  profile, 
  setProfile, 
  step, 
  setStep, 
  language, 
  errors, 
  availableAircraft, 
  handleSquadronChange,
  isRecognizedAccount = false,
  onEmailChange,
  registeredEmails = [],
  onSelectRegisteredEmail,
  onClearRegisteredData
}) => {
  return (
    <div className="flex-1 space-y-6">
      {step === 1 && (
        <div className="grid grid-cols-1 gap-5">
          {/* Commander Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/80 font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {language === 'id' ? 'Email Komandan' : 'Commander Email'}
              </label>
              {isRecognizedAccount && (
                <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'id' ? 'TERDAFTAR' : 'REGISTERED'}
                </span>
              )}
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={cn(
                  "w-4 h-4 transition-colors",
                  isRecognizedAccount ? "text-emerald-400" : "text-white/20 group-focus-within:text-blue-400"
                )} />
              </div>
              <input 
                type="email" 
                value={profile.email || ''}
                onChange={e => {
                  const val = e.target.value;
                  if (onEmailChange) {
                    onEmailChange(val);
                  } else {
                    setProfile({ ...profile, email: val });
                  }
                }}
                placeholder={language === 'id' ? 'contoh: adhiatma21@gmail.com' : 'e.g. adhiatma21@gmail.com'}
                className={cn(
                  "w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 transition-all font-mono text-sm",
                  isRecognizedAccount 
                    ? "border-emerald-500/50 focus:ring-emerald-500/30 bg-emerald-950/10" 
                    : errors.email 
                      ? "border-red-500/50 focus:ring-red-500/30" 
                      : "border-white/10 hover:border-white/20 focus:ring-blue-500/30"
                )}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-400 font-mono italic">{errors.email}</p>}

            {/* Quick-select registered email badges */}
            {registeredEmails.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[8px] font-mono text-white/40 uppercase mr-1">
                    {language === 'id' ? 'Akun Tersimpan:' : 'Saved Accounts:'}
                  </span>
                  {registeredEmails.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => onSelectRegisteredEmail && onSelectRegisteredEmail(em)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-mono transition-all border",
                        profile.email?.toLowerCase() === em.toLowerCase()
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                {onClearRegisteredData && (
                  <button
                    type="button"
                    onClick={onClearRegisteredData}
                    className="text-[8px] font-mono text-red-400/80 hover:text-red-300 underline underline-offset-2 transition-colors ml-auto"
                    title={language === 'id' ? 'Hapus semua data tersimpan' : 'Clear all stored data'}
                  >
                    {language === 'id' ? 'Reset Database Akun' : 'Reset Account DB'}
                  </button>
                )}
              </div>
            )}

            {/* Recognized Account Notification Banner */}
            {isRecognizedAccount && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between mt-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      {language === 'id' ? 'DATA KOMANDAN TERDAFTAR DITEMUKAN' : 'REGISTERED COMMANDER DETECTED'}
                    </p>
                    <p className="text-[8px] text-white/70">
                      {language === 'id' 
                        ? 'Penempatan & Armada otomatis dimuat. Klik LANJUT untuk langsung ke Taklimat Misi.' 
                        : 'Assignment & Fleet restored. Press NEXT to proceed directly to Command Briefing.'}
                    </p>
                  </div>
                </div>
                <span className="text-[8px] font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase border border-emerald-500/30 whitespace-nowrap">
                  {language === 'id' ? 'LEWATI STEP 2 & 3' : 'SKIP STEP 2 & 3'}
                </span>
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 ml-1">Commander Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input 
                type="text" 
                value={profile.commanderName || ''}
                onChange={e => setProfile({...profile, commanderName: e.target.value})}
                placeholder={language === 'id' ? 'Masukkan nama lengkap...' : 'Enter full name...'}
                className={cn(
                  "w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium",
                  errors.commanderName ? "border-red-500/50" : "border-white/10 hover:border-white/20"
                )}
              />
            </div>
            {errors.commanderName && <p className="text-[10px] text-red-400 font-mono italic">{errors.commanderName}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 ml-1">Tactical Callsign</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Terminal className="w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input 
                type="text" 
                value={profile.callsign || ''}
                onChange={e => setProfile({...profile, callsign: e.target.value.toUpperCase()})}
                placeholder="E.G. EAGLE-01"
                className={cn(
                  "w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-black",
                  errors.callsign ? "border-red-500/50" : "border-white/10 hover:border-white/20"
                )}
              />
            </div>
            {errors.callsign && <p className="text-[10px] text-red-400 font-mono italic">{errors.callsign}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 ml-1">Current Rank</label>
              <select 
                value={profile.rank || MILITARY_RANKS[0]}
                onChange={e => setProfile({...profile, rank: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer hover:border-white/20 shadow-inner"
              >
                {MILITARY_RANKS.map(rank => <option key={rank} value={rank} className="bg-[#1a1f26]">{rank}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 ml-1">Military Branch</label>
              <select 
                value={profile.branch || MILITARY_BRANCHES[0]}
                onChange={e => setProfile({...profile, branch: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer hover:border-white/20 shadow-inner"
              >
                {MILITARY_BRANCHES.map(branch => <option key={branch} value={branch} className="bg-[#1a1f26]">{branch}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 ml-1">Specialization</label>
            <div className="grid grid-cols-2 gap-3">
              {MILITARY_SPECIALIZATIONS.map(spec => (
                <button
                  key={spec}
                  onClick={() => setProfile({...profile, specialization: spec})}
                  className={cn(
                    "py-3 px-4 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                    profile.specialization === spec 
                      ? "bg-blue-500 border-blue-400 text-white shadow-lg" 
                      : (errors.specialization ? "bg-red-500/5 border-red-500/20 text-white/60 hover:bg-white/10" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20")
                  )}
                >
                  <Award className="w-3.5 h-3.5" />
                  {spec}
                </button>
              ))}
            </div>
            {errors.specialization && <p className="text-[10px] text-red-400 font-mono italic">{errors.specialization}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 ml-1">Home Airbase</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-blue-400 opacity-60" />
              </div>
              <select 
                value={profile.homeAirbase}
                onChange={e => setProfile({...profile, homeAirbase: e.target.value})}
                className={cn(
                  "w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer font-bold italic",
                  errors.homeAirbase ? "border-red-500/50" : "border-white/10 hover:border-white/20"
                )}
              >
                {INDONESIAN_AIRBASES.map(base => <option key={base} value={base} className="bg-[#1a1f26]">{base}</option>)}
              </select>
            </div>
            {errors.homeAirbase && <p className="text-[10px] text-red-400 font-mono italic">{errors.homeAirbase}</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 ml-1">Select Initial Squadron</label>
            <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-blue-500/40">
              {SQUADRON_DATA.map(sq => (
                <button
                  key={sq.id}
                  onClick={() => handleSquadronChange(sq.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left flex items-center justify-between group",
                    profile.squadron === sq.id 
                      ? "bg-blue-500/20 border-blue-500 shadow-xl" 
                      : (errors.squadron ? "border-red-500/40 bg-red-500/5" : "bg-white/5 border-white/10 hover:border-white/30")
                  )}
                >
                  <div>
                    <p className={cn(
                      "text-xs font-black uppercase tracking-widest transition-colors italic",
                      profile.squadron === sq.id ? "text-blue-400" : "text-white/80"
                    )}>
                      {sq.name}
                    </p>
                    <p className="text-[9px] text-white/40 font-mono uppercase mt-1">Location: {sq.location}</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                    profile.squadron === sq.id ? "bg-blue-500 border-blue-400 scale-110" : "border-white/20"
                  )}>
                    {profile.squadron === sq.id && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              ))}
            </div>
            {errors.squadron && <p className="text-[10px] text-red-400 font-mono italic">{errors.squadron}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60 ml-1">Assign Primary Aircraft</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableAircraft.map(ac => (
                <button
                  key={ac.id}
                  onClick={() => setProfile({...profile, primaryAircraftId: ac.id})}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left flex flex-col gap-3 relative overflow-hidden group",
                    profile.primaryAircraftId === ac.id 
                      ? "bg-blue-500/10 border-blue-500 shadow-xl" 
                      : (errors.aircraft ? "border-red-500/40 bg-red-500/5" : "bg-white/2 border-white/5 hover:bg-white/5")
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      profile.primaryAircraftId === ac.id ? "bg-blue-500 text-white" : "bg-white/10 text-white/40 group-hover:bg-white/20"
                    )}>
                      <Plane className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      "text-[11px] font-black uppercase tracking-tight",
                      profile.primaryAircraftId === ac.id ? "text-white" : "text-white/60"
                    )}>{ac.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 opacity-60 relative z-10">
                     <span className="text-[8px] font-mono bg-black/40 px-1.5 py-0.5 rounded text-blue-400/80 uppercase">Cruise: {ac.cruiseSpeed} KTS</span>
                     <span className="text-[8px] font-mono bg-black/40 px-1.5 py-0.5 rounded text-orange-400/80 uppercase">Fuel: {ac.maxFuel} LBS</span>
                  </div>
                  {profile.primaryAircraftId === ac.id && (
                    <motion.div 
                      layoutId="ac-active"
                      className="absolute inset-0 bg-blue-500/5 pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>
            {errors.aircraft && <p className="text-[10px] text-red-400 font-mono italic">{errors.aircraft}</p>}
          </div>

          <div className="pt-4">
             <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-xl flex items-center justify-center gap-3 group transition-all"
             >
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{language === 'id' ? 'SELESAI MEMILIH?' : 'SELECTION COMPLETE?'}</span>
                   <span className="text-sm font-black text-white uppercase tracking-tighter">{language === 'id' ? 'LANJUT KE TAKLIMAT MISI' : 'PROCEED TO MISSION BRIEFING'}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

