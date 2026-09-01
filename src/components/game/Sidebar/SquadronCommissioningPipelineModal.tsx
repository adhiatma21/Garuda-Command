import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Warehouse, 
  Layers, 
  Users, 
  GraduationCap, 
  Plane, 
  CheckCircle2, 
  Clock, 
  X, 
  ShieldCheck, 
  Sparkles, 
  ShieldAlert,
  Zap,
  ArrowRight
} from 'lucide-react';
import { PendingDeliveryItem } from '../../../types';
import { PlayableSquadron } from '../../../constants';
import { cn } from '../../../lib/utils';

export interface SquadronCommissioningPipelineModalProps {
  isOpen?: boolean;
  language: 'id' | 'en';
  targetSquadron?: PlayableSquadron | null;
  squadronId?: string;
  squadronName?: string;
  baseIcao?: string;
  budget?: number;
  currentBudget?: number;
  playerRankIndex?: number;
  playerRankName?: string;
  onClose: () => void;
  onCommissionStep?: (stepNumber: number, stepCost: number, durationSeconds: number, stepName: string) => void;
  onCompleteCommissioning?: (squadron: PlayableSquadron) => void;
  pendingJobs?: PendingDeliveryItem[];
  pipelineState?: {
    charterPaid: boolean;
    hangarBuilt: boolean;
    apronBuilt: boolean;
    crewRecruited: boolean;
    pilotTrained: boolean;
    aircraftDelivered: boolean;
  };
  formatCurrency: (val: number) => string;
}

export interface PipelineProgressState {
  charterPaid: boolean;
  hangarBuilt: boolean;
  apronBuilt: boolean;
  crewRecruited: boolean;
  pilotTrained: boolean;
  aircraftDelivered: boolean;
}

const DEFAULT_PIPELINE_STATE: PipelineProgressState = {
  charterPaid: false,
  hangarBuilt: false,
  apronBuilt: false,
  crewRecruited: false,
  pilotTrained: false,
  aircraftDelivered: false
};

export const SquadronCommissioningPipelineModal: React.FC<SquadronCommissioningPipelineModalProps> = ({
  isOpen = true,
  language,
  targetSquadron,
  squadronId: propSquadronId,
  squadronName: propSquadronName,
  baseIcao: propBaseIcao,
  budget: propBudget,
  currentBudget,
  playerRankIndex = 2,
  playerRankName = 'Mayor Pnb',
  onClose,
  onCommissionStep,
  onCompleteCommissioning,
  pendingJobs = [],
  pipelineState: propPipelineState,
  formatCurrency
}) => {
  if (!isOpen || (!targetSquadron && !propSquadronId)) return null;

  const sqId = targetSquadron?.id || propSquadronId || 'sq-unknown';
  const sqName = targetSquadron?.fullName || targetSquadron?.name || propSquadronName || 'Skadron Udara';
  const icao = targetSquadron?.baseIcao || propBaseIcao || 'WIOO';
  const effectiveBudget = currentBudget ?? propBudget ?? 1000000000;

  // Local state for pipeline progression if not externally managed
  const [internalState, setInternalState] = useState<PipelineProgressState>(() => {
    if (propPipelineState) return propPipelineState;
    try {
      const saved = localStorage.getItem(`lanud_sq_pipeline_${sqId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PIPELINE_STATE, ...parsed };
      }
    } catch (e) {}
    return DEFAULT_PIPELINE_STATE;
  });

  // Active executing step with timer
  const [activeStepRunning, setActiveStepRunning] = useState<{
    stepNum: number;
    secondsLeft: number;
    totalSeconds: number;
    stepTitle: string;
  } | null>(null);

  // Sync state if prop changes
  useEffect(() => {
    if (propPipelineState) {
      setInternalState(propPipelineState);
    } else {
      try {
        const saved = localStorage.getItem(`lanud_sq_pipeline_${sqId}`);
        if (saved) {
          setInternalState({ ...DEFAULT_PIPELINE_STATE, ...JSON.parse(saved) });
        } else {
          setInternalState(DEFAULT_PIPELINE_STATE);
        }
      } catch (e) {}
    }
  }, [sqId, propPipelineState]);

  // Timer countdown for active step
  useEffect(() => {
    if (!activeStepRunning) return;
    const interval = setInterval(() => {
      setActiveStepRunning(prev => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) {
          // Complete step
          completeStepLocally(prev.stepNum);
          return null;
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeStepRunning, sqId]);

  const completeStepLocally = (stepNum: number) => {
    setInternalState(prev => {
      const updated: PipelineProgressState = { ...prev };
      if (stepNum === 1) updated.charterPaid = true;
      if (stepNum === 2) updated.hangarBuilt = true;
      if (stepNum === 3) updated.apronBuilt = true;
      if (stepNum === 4) updated.crewRecruited = true;
      if (stepNum === 5) updated.pilotTrained = true;
      if (stepNum === 6) updated.aircraftDelivered = true;

      try {
        localStorage.setItem(`lanud_sq_pipeline_${sqId}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const currentState = propPipelineState || internalState || DEFAULT_PIPELINE_STATE;

  const minRankRequired = targetSquadron?.minRankIndex ?? 0;
  const isRankSufficient = playerRankIndex >= minRankRequired;

  // Calculate step costs scaled to unlockPrice
  const totalBaseCost = targetSquadron?.unlockPrice || 1000000000;
  const step1Cost = Math.round(totalBaseCost * 0.15);
  const step2Cost = Math.round(totalBaseCost * 0.20);
  const step3Cost = Math.round(totalBaseCost * 0.15);
  const step4Cost = Math.round(totalBaseCost * 0.15);
  const step5Cost = Math.round(totalBaseCost * 0.15);
  const step6Cost = Math.round(totalBaseCost * 0.20);

  const steps = [
    {
      num: 1,
      id: 'charter',
      titleId: '1. Otorisasi Piagam & Lisensi Skadron Mabes TNI AU',
      titleEn: '1. Squadron Air Wing Charter & Commissioning License',
      descId: 'Pengesahan surat keputusan pembentukan skadron tempur dari Mabesau dan alokasi kode panggil radar (callsign).',
      descEn: 'Formal authorization of air combat wing charter and tactical datalink allocation.',
      cost: step1Cost,
      duration: 6,
      icon: ShieldCheck,
      isDone: Boolean(currentState?.charterPaid),
      canDo: isRankSufficient
    },
    {
      num: 2,
      id: 'hangar',
      titleId: '2. Pembangunan Hanggar Perawatan Level 1 (Kapasitas 2 Pesawat)',
      titleEn: '2. Level 1 Maintenance Hangar Construction (2 Jets)',
      descId: 'Pembangunan hanggar tertutup lengkap dengan overhead crane, power line 400Hz, dan bengkel avionik dasar.',
      descEn: 'Closed maintenance hangar construction with crane and 400Hz ground power line.',
      cost: step2Cost,
      duration: 8,
      icon: Warehouse,
      isDone: Boolean(currentState?.hangarBuilt),
      canDo: Boolean(currentState?.charterPaid)
    },
    {
      num: 3,
      id: 'apron',
      titleId: '3. Pembangunan Hardstand Apron Tarmac Level 1 (Kapasitas 2 Pesawat)',
      titleEn: '3. Level 1 Tarmac Apron Hardstand (2 Jets)',
      descId: 'Pengecoran beton tebal K-500 tahan semburan afterburner jet, jalur taxiway terhubung ke runway utama pangkalan.',
      descEn: 'Reinforced concrete apron hardstand with direct taxiway clearance.',
      cost: step3Cost,
      duration: 7,
      icon: Layers,
      isDone: Boolean(currentState?.apronBuilt),
      canDo: Boolean(currentState?.hangarBuilt)
    },
    {
      num: 4,
      id: 'crew',
      titleId: '4. Perekrutan & Alokasi Kru Darat, Teknisi Skatek & Fuel Bowser',
      titleEn: '4. Ground Marshallers & Skatek Maintenance Technicians',
      descId: 'Mobilisasi 13 personil terlatih: 3 marshaller, 4 teknisi mesin/avionik, 2 kru avtur, 2 spesialis elektrik GPU & persenjataan.',
      descEn: 'Mobilize ground crew, maintenance engineers, bowser fuelers, and armament specialists.',
      cost: step4Cost,
      duration: 6,
      icon: Users,
      isDone: Boolean(currentState?.crewRecruited),
      canDo: Boolean(currentState?.apronBuilt)
    },
    {
      num: 5,
      id: 'pilot',
      titleId: '5. Pelatihan & Sertifikasi Standardisasi Penerbang Tempur Inti',
      titleEn: '5. Combat Pilot Conversion & Flight Qualification Training',
      descId: 'Kursus konversi tipe pesawat tempur di Wing Diklat dan uji kualifikasi tempur taktis BVR.',
      descEn: 'Type conversion training and tactical combat formation validation.',
      cost: step5Cost,
      duration: 8,
      icon: GraduationCap,
      isDone: Boolean(currentState?.pilotTrained),
      canDo: Boolean(currentState?.crewRecruited)
    },
    {
      num: 6,
      id: 'aircraft',
      titleId: '6. Pengadaan & Ferry Flight Pesawat Tempur Perdana',
      titleEn: '6. First Combat Aircraft Procurement & Ferry Delivery',
      descId: 'Penerbangan penyerahan pesawat tempur perdana ke pangkalan induk dengan status SIAP TEMPUR.',
      descEn: 'Official acceptance flight and delivery of the squadron first combat jet.',
      cost: step6Cost,
      duration: 10,
      icon: Plane,
      isDone: Boolean(currentState?.aircraftDelivered),
      canDo: Boolean(currentState?.pilotTrained)
    }
  ];

  const activeJob = pendingJobs.find(j => j.squadronId === sqId);

  const completedCount = steps.filter(s => s.isDone).length;
  const isAllDone = completedCount === steps.length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const handleExecuteStep = (st: typeof steps[0]) => {
    if (!st.canDo || effectiveBudget < st.cost || activeStepRunning || Boolean(activeJob)) return;

    if (onCommissionStep) {
      onCommissionStep(st.num, st.cost, st.duration, language === 'id' ? st.titleId : st.titleEn);
    }

    // Run active step countdown locally
    setActiveStepRunning({
      stepNum: st.num,
      secondsLeft: st.duration,
      totalSeconds: st.duration,
      stepTitle: language === 'id' ? st.titleId : st.titleEn
    });
  };

  const handleFinalCommissioning = () => {
    if (!isAllDone || !targetSquadron) return;
    if (onCompleteCommissioning) {
      onCompleteCommissioning(targetSquadron);
    }
  };

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
          className="w-full max-w-xl bg-gradient-to-b from-slate-900 via-[#0a101d] to-black border border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl relative text-white font-mono"
        >
          {/* Top Close */}
          <div className="absolute top-3 right-3 z-20">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* HEADER */}
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600/20 text-cyan-400 border border-blue-500/30 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest block">
                  {language === 'id' ? 'PIPELINE PEMBENTUKAN & INTEGRASI SKADRON' : 'SQUADRON COMMISSIONING PIPELINE'}
                </span>
                <h3 className="text-base font-black text-white">
                  {sqName} ({icao})
                </h3>
              </div>
            </div>
            <p className="text-[7.5px] text-white/60">
              {language === 'id'
                ? 'Sesuai doktrin TNI AU, pembentukan satuan baru mewajibkan izin pangkalan, pembangunan hanggar, apron, rekrutmen kru teknisi, diklat penerbang, hingga pengiriman armada.'
                : 'Following air doctrine, squadron activation requires base charter, hangar construction, tarmac apron, technician staffing, pilot conversion, and first jet delivery.'}
            </p>
          </div>

          {/* RANK RESTRICTION NOTICE IF NOT QUALIFIED */}
          {!isRankSufficient && targetSquadron?.minRank && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-[8px] text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <span className="font-bold block">
                  {language === 'id' ? 'PERSYARATAN PANGKAT BELUM TERPENUHI' : 'RANK REQUIREMENT NOT MET'}
                </span>
                <span className="text-white/60 text-[7px]">
                  {language === 'id' 
                    ? `Dibutuhkan Pangkat Minimum ${targetSquadron.minRank} (Pangkat Anda: ${playerRankName})`
                    : `Minimum Rank Required: ${targetSquadron.minRank} (Current: ${playerRankName})`}
                </span>
              </div>
            </div>
          )}

          {/* PROGRESS BAR */}
          <div className="p-3 bg-black/60 border border-white/10 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-white/60 font-bold">
                {language === 'id' ? 'KEMAJUAN INTEGRASI SKADRON:' : 'COMMISSIONING PROGRESS:'}
              </span>
              <span className="text-cyan-400 font-bold">
                {completedCount} / {steps.length} {language === 'id' ? 'Tahap Selesai' : 'Steps Done'} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* ACTIVE RUNNING STEP / JOB */}
          {(activeStepRunning || activeJob) && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-[8px] text-amber-300 animate-pulse">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <div>
                  <span className="font-bold block">
                    {activeStepRunning?.stepTitle || (language === 'id' ? activeJob?.titleId : activeJob?.titleEn)}
                  </span>
                  <span className="text-white/60 text-[7px]">
                    {language === 'id' ? 'Proses eksekusi & verifikasi militer sedang berlangsung...' : 'Military verification & execution in progress...'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-amber-300 shrink-0">
                {activeStepRunning ? `${activeStepRunning.secondsLeft}s` : `${Math.max(0, Math.ceil(((activeJob?.finishTime || 0) - Date.now()) / 1000))}s`}
              </span>
            </div>
          )}

          {/* STEPS LIST */}
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {steps.map((st) => {
              const Icon = st.icon;
              const isCurrentlyExecuting = activeStepRunning?.stepNum === st.num;

              return (
                <div
                  key={st.num}
                  className={cn(
                    "p-3 rounded-xl border transition-all space-y-1.5 relative",
                    st.isDone 
                      ? "bg-emerald-950/20 border-emerald-500/30" 
                      : isCurrentlyExecuting
                        ? "bg-amber-950/20 border-amber-500/40"
                        : st.canDo 
                          ? "bg-black/60 border-cyan-500/40 hover:border-cyan-400/70" 
                          : "bg-black/30 border-white/5 opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className={cn(
                        "p-2 rounded-xl border shrink-0",
                        st.isDone 
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                          : isCurrentlyExecuting
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                            : st.canDo 
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" 
                              : "bg-white/5 text-white/30 border-white/10"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={cn(
                          "text-[9px] font-black block",
                          st.isDone ? "text-emerald-300" : st.canDo ? "text-white" : "text-white/40"
                        )}>
                          {language === 'id' ? st.titleId : st.titleEn}
                        </span>
                        <p className="text-[7.5px] text-white/60 mt-0.5">
                          {language === 'id' ? st.descId : st.descEn}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {st.isDone ? (
                        <span className="text-[7.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{language === 'id' ? 'SELESAI' : 'DONE'}</span>
                        </span>
                      ) : isCurrentlyExecuting ? (
                        <span className="text-[7.5px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>{activeStepRunning.secondsLeft}s</span>
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-[8.5px] font-black text-amber-300 block font-mono">
                            {formatCurrency(st.cost)}
                          </span>
                          <button
                            type="button"
                            disabled={!st.canDo || effectiveBudget < st.cost || Boolean(activeStepRunning) || Boolean(activeJob)}
                            onClick={() => handleExecuteStep(st)}
                            className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[7.5px] font-bold uppercase transition-all shadow active:scale-95 flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            <span>{language === 'id' ? 'Laksanakan' : 'Execute'} ({st.duration}s)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[8px]">
            <span className="text-white/40">
              {language === 'id' ? 'Kas Anggaran:' : 'Available Budget:'}{' '}
              <strong className="text-amber-300 font-mono">{formatCurrency(effectiveBudget)}</strong>
            </span>

            {isAllDone ? (
              <button
                type="button"
                onClick={handleFinalCommissioning}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 animate-pulse transition-all active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'RESMIKAN SKADRON SEKARANG' : 'COMMISSION SQUADRON NOW'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-cyan-400 font-bold">
                {language === 'id' 
                  ? 'Selesaikan 6 tahap untuk mengesahkan skadron' 
                  : 'Complete all 6 steps to commission squadron'}
              </span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
