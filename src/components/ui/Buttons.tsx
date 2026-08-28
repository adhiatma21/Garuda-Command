import React from 'react';
import { cn } from '../../lib/utils';

interface NavIconProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const NavIcon: React.FC<NavIconProps> = ({ active, onClick, icon, label }) => {
  return (
    <div className="relative group">
      <button 
        onClick={onClick}
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 relative",
          active ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 ring-2 ring-blue-400/30" : "text-white/30 hover:bg-white/5 hover:text-white/80"
        )}
      >
        <div className={cn(
          "absolute -left-1 w-1 h-4 bg-blue-500 rounded-full transition-all duration-300",
          active ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )} />
        {icon}
      </button>
      <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#0c111a] border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl z-[3000] translate-x-2 group-hover:translate-x-0">
        <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{label}</div>
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0c111a] border-l border-b border-white/10 rotate-45" />
      </div>
    </div>
  );
};

interface TypeBtnProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const TypeBtn: React.FC<TypeBtnProps> = ({ active, onClick, children }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all border",
        active ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
};

interface StatItemProps {
  label: string;
  value: string | number;
  unit: string;
}

export const StatItem: React.FC<StatItemProps> = ({ label, value, unit }) => {
  return (
    <div className="flex flex-col bg-white/5 px-4 py-3 rounded-2xl border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/5 rounded-bl-3xl translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black mb-1 leading-none">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-mono font-black text-white tracking-tighter tabular-nums leading-none">
          {value}
        </span>
        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest opacity-60">{unit}</span>
      </div>
    </div>
  );
};
