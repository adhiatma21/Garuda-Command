import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Cpu, Database, Activity } from 'lucide-react';

interface Props {
  onComplete: () => void;
  language: 'id' | 'en';
}

const SEQUENCE_EN = [
  { text: 'INITIALIZING AIR DEFENSE NETWORK...', icon: Cpu, delay: 800 },
  { text: 'CONNECTING TO NATIONAL COMMAND SYSTEM...', icon: Database, delay: 1200 },
  { text: 'DECRYPTING SECURE CHANNELS...', icon: Lock, delay: 1000 },
  { text: 'SYNCHRONIZING RADAR GRID...', icon: Activity, delay: 800 },
  { text: 'AUTHORIZATION VERIFIED: COMMAND LEVEL 4', icon: Shield, delay: 1500 },
];

const SEQUENCE_ID = [
  { text: 'MENGINISIALISASI JARINGAN PERTAHANAN UDARA...', icon: Cpu, delay: 800 },
  { text: 'MENGHUBUNGKAN KE SISTEM KOMANDO NASIONAL...', icon: Database, delay: 1200 },
  { text: 'MENDEKRIPSI SALURAN AMAN...', icon: Lock, delay: 1000 },
  { text: 'SINKRONISASI JARINGAN RADAR...', icon: Activity, delay: 800 },
  { text: 'OTORISASI TERVERIFIKASI: LEVEL KOMANDO 4', icon: Shield, delay: 1500 },
];

export const SecuritySequence: React.FC<Props> = ({ onComplete, language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sequence = language === 'id' ? SEQUENCE_ID : SEQUENCE_EN;

  // Use ref to keep latest onComplete without triggering effect re-runs
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (currentIndex < sequence.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, sequence[currentIndex].delay);
      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        onCompleteRef.current();
      }, 1500);
      return () => clearTimeout(finalTimer);
    }
  }, [currentIndex, sequence]);

  return (
    <div className="fixed inset-0 z-[10000] bg-[#05070a] flex flex-col items-center justify-center font-mono">
      <div className="w-full max-w-md space-y-4 px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
             <Shield className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-white text-lg font-black tracking-widest uppercase italic">CENTRAL COMMAND</h2>
            <p className="text-blue-500/60 text-[10px] tracking-tighter uppercase">Military Grade Authorization</p>
          </div>
        </div>

        <div className="space-y-3 min-h-[160px]">
          <AnimatePresence mode="popLayout">
            {sequence.slice(0, currentIndex + 1).map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <item.icon className="w-3.5 h-3.5 text-blue-400" />
                <span className={idx === currentIndex ? "text-cyan-400" : "text-white/40"}>
                  <Typewriter text={item.text} speed={20} />
                </span>
                {idx === currentIndex && (
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="w-2 h-4 bg-cyan-400"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="flex justify-between items-center text-[9px] text-white/20 uppercase tracking-widest">
            <span>Accessing Terminal: 192.168.100.1</span>
            <span>Port: 8080 (SECURE)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Typewriter = ({ text, speed }: { text: string; speed: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};
