import React from 'react';
import { motion } from 'motion/react';

export const TacticalBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#05070a]">
      {/* Cinematic Medallion Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] grayscale mix-blend-screen pointer-events-none">
        <img 
          src="/src/assets/images/military_emblem_1779193633060.png" 
          alt="Military Emblem" 
          className="w-[120%] max-w-[1400px] h-auto object-contain blur-[1px]"
        />
      </div>

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, #4ade80 1px, transparent 1px), linear-gradient(to bottom, #4ade80 1px, transparent 1px)',
          backgroundSize: '100px 100px' 
        }} 
      />
      
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: 'radial-gradient(#4ade80 1px, transparent 1px)',
          backgroundSize: '20px 20px' 
        }} 
      />

      {/* Scanning Line */}
      <motion.div 
        initial={{ y: '-100%' }}
        animate={{ y: '200%' }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[300px] bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none"
      />

      {/* Animated Circular Radar Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-blue-500/5 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[10%] border border-cyan-500/5 rounded-full border-dashed"
        />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[20%] border border-blue-500/5 rounded-full"
        />
      </div>

      {/* Random Pulse Points */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [0.5, 2, 0.5],
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%'
            }}
            transition={{ 
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-blue-400 rounded-full blur-sm"
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] pointer-events-none" />
    </div>
  );
};
