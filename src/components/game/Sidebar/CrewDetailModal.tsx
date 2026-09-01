import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Shield, 
  User, 
  Plane, 
  Wrench, 
  Fuel, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Activity, 
  HeartPulse, 
  Sparkles, 
  X, 
  Star, 
  GraduationCap,
  FileText,
  BadgeAlert,
  Flame
} from 'lucide-react';
import { IndividualPilot, IndividualCrewMember, TrainingCourse } from '../../../types';
import { cn } from '../../../lib/utils';

interface CrewDetailModalProps {
  language: 'id' | 'en';
  pilot: IndividualPilot | null;
  crewMember: IndividualCrewMember | null;
  onClose: () => void;
  onStartTraining?: (targetId: string, isPilot: boolean, courseId: string) => void;
  availableCourses?: TrainingCourse[];
  formatCurrency: (val: number) => string;
}

export const CrewDetailModal: React.FC<CrewDetailModalProps> = ({
  language,
  pilot,
  crewMember,
  onClose,
  onStartTraining,
  availableCourses = [],
  formatCurrency
}) => {
  if (!pilot && !crewMember) return null;

  const isPilot = Boolean(pilot);
  const data = isPilot ? pilot! : crewMember!;

  // Render Stars for rating
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              "w-4 h-4",
              s <= fullStars 
                ? "text-amber-400 fill-amber-400" 
                : s === fullStars + 1 && hasHalf 
                  ? "text-amber-400 fill-amber-400/50" 
                  : "text-white/20"
            )}
          />
        ))}
        <span className="text-xs font-mono font-bold text-amber-300 ml-1.5">
          {rating.toFixed(1)} / 5.0
        </span>
      </div>
    );
  };

  const filteredCourses = availableCourses.filter(c => {
    if (isPilot) return c.targetType === 'pilot';
    if (crewMember?.department === 'groundCrew') return c.targetType === 'ground';
    if (crewMember?.department === 'technicians') return c.targetType === 'technician';
    if (crewMember?.department === 'fuelCrew') return c.targetType === 'fuel' || c.targetType === 'ground';
    if (crewMember?.department === 'electricCrew') return c.targetType === 'electric' || c.targetType === 'technician';
    return true;
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-[#0c121d] to-black border border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden text-white font-mono"
        >
          {/* Top Right Close Button */}
          <div className="absolute top-3 right-3 z-20">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* DOSSIER HEADER */}
          <div className="flex items-start gap-3.5 pr-8">
            <div className={cn(
              "w-14 h-14 rounded-2xl border flex items-center justify-center font-mono font-black text-xl shrink-0 shadow-lg relative",
              isPilot 
                ? "bg-gradient-to-br from-amber-600/30 to-amber-950/60 border-amber-500/50 text-amber-400" 
                : "bg-gradient-to-br from-blue-600/30 to-blue-950/60 border-blue-500/50 text-cyan-300"
            )}>
              {isPilot ? (
                <Award className="w-7 h-7" />
              ) : crewMember?.department === 'technicians' ? (
                <Wrench className="w-7 h-7" />
              ) : crewMember?.department === 'fuelCrew' ? (
                <Fuel className="w-7 h-7" />
              ) : crewMember?.department === 'electricCrew' ? (
                <Zap className="w-7 h-7" />
              ) : (
                <User className="w-7 h-7" />
              )}

              <span className="absolute -bottom-1.5 -right-1.5 text-[7px] font-black px-1.5 py-0.2 rounded bg-black/90 border border-white/20 uppercase text-emerald-400">
                AKTIF
              </span>
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[7.5px] font-bold uppercase tracking-widest text-cyan-400">
                  {isPilot ? 'DOKUMEN PENERBANG TEMPUR (MILITARY PILOT DOSSIER)' : 'DOKUMEN PERSONIL TEKNIS LAPANGAN'}
                </span>
              </div>

              <h3 className="text-base font-black text-white truncate tracking-wide">
                {data.name}
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-[8px] text-white/60">
                <span className="text-amber-300 font-bold">NRP: {data.nrp}</span>
                <span>•</span>
                <span className="text-white/80">{data.rank}</span>
                <span>•</span>
                <span className="text-cyan-300">
                  {isPilot ? (pilot?.callsign || 'VIPER-01') : crewMember?.roleTitle}
                </span>
              </div>
            </div>
          </div>

          {/* RATING & PERFORMANCE SCORE BANNER */}
          <div className="p-3 bg-black/60 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-white/50 uppercase tracking-wider font-bold">
                {language === 'id' ? 'EVALUASI PERFORMANSI & RATING KOMPETENSI' : 'PERFORMANCE & RATING EVALUATION'}
              </span>
              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                GRADE {data.rating >= 4.5 ? 'A (ELITE)' : data.rating >= 4.0 ? 'B (VETERAN)' : 'C (STANDAR)'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                {renderStarRating(data.rating)}
                <span className="text-[7.5px] text-white/40 block mt-0.5">
                  {isPilot 
                    ? `${pilot?.flightHours.toFixed(1)} Jam Terbang • ${pilot?.missionCount} Misi Tempur`
                    : `${crewMember?.tasksCompleted} Servis Berhasil • Efisiensi ${crewMember?.efficiencyScore}%`}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[7.5px] text-white/40 block uppercase">SPESIALISASI UTAMA</span>
                <span className="text-[9px] font-black text-cyan-300 truncate max-w-[170px] block">
                  {isPilot ? pilot?.specialization : crewMember?.specialization}
                </span>
              </div>
            </div>
          </div>

          {/* VITALS / PERFORMANCE METRICS */}
          <div className="grid grid-cols-3 gap-2 text-[8px]">
            {isPilot ? (
              <>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-center space-y-0.5">
                  <span className="text-white/40 text-[7px] uppercase block">STAMINA / KONDISI</span>
                  <span className="text-xs font-bold text-emerald-400">{pilot?.stamina}% FIT</span>
                  <span className="text-[6.5px] text-white/30 block">Siap Terbang</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-center space-y-0.5">
                  <span className="text-white/40 text-[7px] uppercase block">G-TOLERANCE</span>
                  <span className="text-xs font-bold text-cyan-300">+{pilot?.gTolerance}G</span>
                  <span className="text-[6.5px] text-white/30 block">Anti-Blackout</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-center space-y-0.5">
                  <span className="text-white/40 text-[7px] uppercase block">PESAWAT TUGAS</span>
                  <span className="text-xs font-bold text-amber-300">{pilot?.assignedAircraftTail || 'TS-1601'}</span>
                  <span className="text-[6.5px] text-white/30 block">Primary Bay</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-center space-y-0.5">
                  <span className="text-white/40 text-[7px] uppercase block">PENGALAMAN DINAS</span>
                  <span className="text-xs font-bold text-cyan-300">LEVEL {crewMember?.experienceLevel}</span>
                  <span className="text-[6.5px] text-white/30 block">Teknis Senior</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-center space-y-0.5">
                  <span className="text-white/40 text-[7px] uppercase block">SKOR EFISIENSI</span>
                  <span className="text-xs font-bold text-emerald-400">{crewMember?.efficiencyScore}%</span>
                  <span className="text-[6.5px] text-white/30 block">Turnaround Cepat</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-center space-y-0.5">
                  <span className="text-white/40 text-[7px] uppercase block">TASK LOG</span>
                  <span className="text-xs font-bold text-amber-300">{crewMember?.tasksCompleted} Sortie</span>
                  <span className="text-[6.5px] text-white/30 block">Tanpa Insiden</span>
                </div>
              </>
            )}
          </div>

          {/* BADGES & CERTIFICATIONS */}
          <div className="space-y-1.5">
            <span className="text-[8px] text-white/50 uppercase tracking-wider block">
              {isPilot ? 'TANDA JASA & KUALIFIKASI WING:' : 'SERTIFIKASI TEKNIS MILITER:'}
            </span>

            <div className="flex flex-wrap gap-1.5">
              {isPilot ? (
                pilot?.medals.map((m, idx) => (
                  <span key={idx} className="text-[7.5px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg flex items-center gap-1 font-bold">
                    <Award className="w-2.5 h-2.5" />
                    <span>{m}</span>
                  </span>
                ))
              ) : (
                crewMember?.certifications.map((c, idx) => (
                  <span key={idx} className="text-[7.5px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-cyan-300 rounded-lg flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{c}</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* DISPATCH TO TRAINING ACADEMY */}
          {onStartTraining && filteredCourses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-cyan-300 uppercase tracking-wider font-bold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'id' ? 'KIRIM KE WING DIKLAT / PELATIHAN:' : 'DISPATCH TO TRAINING ACADEMY:'}</span>
                </span>
                <span className="text-[7.5px] text-white/40 font-bold">
                  {filteredCourses.length} Program Tersedia
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                {filteredCourses.map((crs) => (
                  <div
                    key={crs.id}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[8.5px] font-bold text-white block truncate">
                        {language === 'id' ? crs.titleId : crs.titleEn}
                      </span>
                      <span className="text-[7px] text-white/50 block">
                        Durasi: {crs.durationSeconds} Detik • Biaya: {formatCurrency(crs.cost)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onStartTraining(data.id, isPilot, crs.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-[7.5px] font-bold uppercase transition-all shadow shrink-0 active:scale-95 flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>{language === 'id' ? 'Mulai Latih' : 'Train'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
