import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Sparkles, 
  Clock, 
  Award, 
  Zap, 
  CheckCircle2, 
  Star, 
  User, 
  Wrench, 
  Shield, 
  ChevronRight, 
  AlertCircle,
  Flame,
  Plane
} from 'lucide-react';
import { 
  IndividualPilot, 
  IndividualCrewMember, 
  TrainingCourse, 
  PendingDeliveryItem 
} from '../../../types';
import { MILITARY_TRAINING_COURSES } from '../../../data/squadronState';
import { cn } from '../../../lib/utils';

interface SquadronTrainingViewProps {
  language: 'id' | 'en';
  budget: number;
  pilots: IndividualPilot[];
  crewMembers: IndividualCrewMember[];
  pendingJobs: PendingDeliveryItem[];
  onStartTraining: (targetId: string, isPilot: boolean, courseId: string) => void;
  formatCurrency: (val: number) => string;
  onOpenDossier: (pilot: IndividualPilot | null, crew: IndividualCrewMember | null) => void;
}

export const SquadronTrainingView: React.FC<SquadronTrainingViewProps> = ({
  language,
  budget,
  pilots,
  crewMembers,
  pendingJobs,
  onStartTraining,
  formatCurrency,
  onOpenDossier
}) => {
  const [trainingCategory, setTrainingCategory] = useState<'pilots' | 'crew'>('pilots');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(pilots[0]?.id || '');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('pilot_bvr_tactics');

  const activeTrainingJobs = pendingJobs.filter(j => j.type === 'TRAINING');

  const currentCourses = MILITARY_TRAINING_COURSES.filter(c => 
    trainingCategory === 'pilots' ? c.targetType === 'pilot' : c.targetType !== 'pilot'
  );

  const selectedPilot = pilots.find(p => p.id === selectedCandidateId);
  const selectedCrew = crewMembers.find(c => c.id === selectedCandidateId);
  const selectedCourse = MILITARY_TRAINING_COURSES.find(c => c.id === selectedCourseId) || currentCourses[0];

  const handleLaunchTraining = () => {
    if (!selectedCourse) return;
    const isPilot = trainingCategory === 'pilots';
    const targetId = isPilot ? (selectedPilot?.id || pilots[0]?.id) : (selectedCrew?.id || crewMembers[0]?.id);
    if (!targetId) return;
    onStartTraining(targetId, isPilot, selectedCourse.id);
  };

  const isCandidateInTraining = (id: string) => {
    return activeTrainingJobs.some(j => j.data?.targetId === id);
  };

  return (
    <div className="space-y-3 font-mono">
      {/* HEADER & CATEGORY SELECTOR */}
      <div className="p-3 bg-gradient-to-r from-blue-950/60 via-slate-900 to-black border border-cyan-500/30 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-xl">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9.5px] font-black text-white uppercase tracking-wider block">
                {language === 'id' ? 'WING DIKLAT & AKADEMI TEMPUR SKADRON' : 'SQUADRON COMBAT TRAINING ACADEMY'}
              </span>
              <span className="text-[7.5px] text-cyan-300/70">
                Peningkatan Rating, Spesialisasi & Sertifikasi Standar Mabes TNI AU
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/10 text-[7.5px]">
            <button
              type="button"
              onClick={() => {
                setTrainingCategory('pilots');
                setSelectedCandidateId(pilots[0]?.id || '');
                setSelectedCourseId('pilot_bvr_tactics');
              }}
              className={cn(
                "px-2 py-1 rounded transition-all font-bold",
                trainingCategory === 'pilots' 
                  ? "bg-cyan-600 text-white shadow" 
                  : "text-white/50 hover:text-white"
              )}
            >
              {language === 'id' ? 'Sekolah Penerbang' : 'Pilots'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTrainingCategory('crew');
                setSelectedCandidateId(crewMembers[0]?.id || '');
                setSelectedCourseId('crew_fast_turnaround');
              }}
              className={cn(
                "px-2 py-1 rounded transition-all font-bold",
                trainingCategory === 'crew' 
                  ? "bg-cyan-600 text-white shadow" 
                  : "text-white/50 hover:text-white"
              )}
            >
              {language === 'id' ? 'Diklat Teknisi & Kru' : 'Crew & Tech'}
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE TRAINING QUEUE BANNER IF ANY */}
      {activeTrainingJobs.length > 0 && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[8px] font-bold text-amber-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 animate-spin" />
              <span>PELATIHAN SEDANG BERLANGSUNG ({activeTrainingJobs.length})</span>
            </span>
            <span className="text-white/50">Waktu Nyata</span>
          </div>

          <div className="space-y-1">
            {activeTrainingJobs.map((job) => {
              const remainingSec = Math.max(0, Math.ceil((job.finishTime - Date.now()) / 1000));
              const progress = Math.min(100, Math.round(((Date.now() - job.startTime) / (job.totalDurationSeconds * 1000)) * 100));
              return (
                <div key={job.id} className="p-1.5 bg-black/50 rounded-lg border border-amber-500/20 text-[7.5px] space-y-1">
                  <div className="flex justify-between items-center text-white/90">
                    <span className="font-bold truncate">{language === 'id' ? job.titleId : job.titleEn}</span>
                    <span className="text-amber-400 font-mono font-bold">{remainingSec}s Tersisa</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: SELECT CANDIDATE ROSTER */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[8px] text-white/50 uppercase tracking-wider">
          <span>{language === 'id' ? '1. PILIH PERSONIL UNTUK DILATIH:' : '1. SELECT CANDIDATE TO TRAIN:'}</span>
          <span className="text-cyan-400 font-bold">
            {trainingCategory === 'pilots' ? `${pilots.length} Penerbang` : `${crewMembers.length} Personil Skatek`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {trainingCategory === 'pilots' ? (
            pilots.map((p) => {
              const isSelected = p.id === selectedCandidateId;
              const inTraining = isCandidateInTraining(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => !inTraining && setSelectedCandidateId(p.id)}
                  className={cn(
                    "p-2 rounded-xl border text-left transition-all cursor-pointer relative",
                    isSelected 
                      ? "bg-cyan-600/20 border-cyan-500/60 shadow-md shadow-cyan-600/10" 
                      : "bg-black/50 hover:bg-white/5 border-white/10",
                    inTraining && "opacity-50 cursor-not-allowed border-amber-500/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-[8.5px] font-bold text-white block truncate">{p.name}</span>
                      <span className="text-[7px] text-cyan-300/80 block">{p.callsign}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDossier(p, null);
                      }}
                      className="text-[6.5px] bg-white/10 hover:bg-white/20 text-white/70 px-1.5 py-0.5 rounded border border-white/20 ml-1"
                    >
                      Dossier
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/5 text-[7px]">
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      <span>{p.rating.toFixed(1)}</span>
                    </div>
                    <span className={cn("text-[6.5px] font-bold", inTraining ? "text-amber-400" : "text-emerald-400")}>
                      {inTraining ? 'DIKLAT' : 'SIAP'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            crewMembers.map((c) => {
              const isSelected = c.id === selectedCandidateId;
              const inTraining = isCandidateInTraining(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => !inTraining && setSelectedCandidateId(c.id)}
                  className={cn(
                    "p-2 rounded-xl border text-left transition-all cursor-pointer relative",
                    isSelected 
                      ? "bg-cyan-600/20 border-cyan-500/60 shadow-md shadow-cyan-600/10" 
                      : "bg-black/50 hover:bg-white/5 border-white/10",
                    inTraining && "opacity-50 cursor-not-allowed border-amber-500/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-[8.5px] font-bold text-white block truncate">{c.name}</span>
                      <span className="text-[7px] text-cyan-300/80 block truncate">{c.roleTitle}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDossier(null, c);
                      }}
                      className="text-[6.5px] bg-white/10 hover:bg-white/20 text-white/70 px-1.5 py-0.5 rounded border border-white/20 ml-1"
                    >
                      Dossier
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/5 text-[7px]">
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      <span>{c.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-cyan-300">{c.efficiencyScore}% Efisiensi</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STEP 2: SELECT TRAINING COURSE */}
      <div className="space-y-1.5">
        <span className="text-[8px] text-white/50 uppercase tracking-wider block">
          {language === 'id' ? '2. PILIH MATERI PELATIHAN / KURIKULUM:' : '2. SELECT TRAINING CURRICULUM:'}
        </span>

        <div className="space-y-1.5">
          {currentCourses.map((course) => {
            const isSelected = course.id === selectedCourseId;
            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1",
                  isSelected 
                    ? "bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-black border-cyan-500/60 shadow-lg" 
                    : "bg-black/60 hover:bg-white/5 border-white/10"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-white">
                        {language === 'id' ? course.titleId : course.titleEn}
                      </span>
                      {isSelected && (
                        <span className="text-[7px] font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                          TERPILIH
                        </span>
                      )}
                    </div>
                    <p className="text-[7px] text-white/60 line-clamp-2 mt-0.5">
                      {language === 'id' ? course.descriptionId : course.descriptionEn}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-black text-amber-300 block">
                      {formatCurrency(course.cost)}
                    </span>
                    <span className="text-[7px] text-cyan-400 flex items-center justify-end gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{course.durationSeconds} Detik</span>
                    </span>
                  </div>
                </div>

                {/* BOOST BENEFIT */}
                <div className="flex items-center gap-1 text-[7px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5 shrink-0 text-amber-300" />
                  <span className="truncate">{course.statBoost.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LAUNCH TRAINING ACTION */}
      {selectedCourse && (
        <div className="p-3 bg-gradient-to-r from-blue-950/80 to-black border border-cyan-500/40 rounded-xl flex items-center justify-between gap-2">
          <div>
            <span className="text-[7.5px] text-white/50 block">ESTIMASI BIAYA & JEDA WAKTU</span>
            <span className="text-xs font-black text-amber-300 font-mono">
              {formatCurrency(selectedCourse.cost)}
            </span>
            <span className="text-[7px] text-cyan-300 block">
              Durasi Latihan: {selectedCourse.durationSeconds} Detik
            </span>
          </div>

          <button
            type="button"
            disabled={budget < selectedCourse.cost || (trainingCategory === 'pilots' ? isCandidateInTraining(selectedPilot?.id || '') : isCandidateInTraining(selectedCrew?.id || ''))}
            onClick={handleLaunchTraining}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[8.5px] font-bold uppercase transition-all shadow-lg shadow-cyan-600/30 active:scale-95 flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'MULAI PELATIHAN' : 'START TRAINING'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
