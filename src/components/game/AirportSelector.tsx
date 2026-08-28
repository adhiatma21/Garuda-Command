import React from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MilitaryAirport, MILITARY_AIRPORTS } from '../../airports';

interface AirportSelectorProps {
  label: string;
  value: MilitaryAirport | null;
  search: string;
  onSearchChange: (val: string) => void;
  onSelect: (ap: MilitaryAirport) => void;
  language: string;
  placeholder?: string;
  className?: string;
}

export const AirportSelector: React.FC<AirportSelectorProps> = ({ 
  label, 
  value, 
  search, 
  onSearchChange, 
  onSelect, 
  language, 
  placeholder,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-[9px] text-white/30 uppercase font-black tracking-widest leading-none block mb-1">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
        <input 
          type="text" 
          placeholder={placeholder || (language === 'id' ? 'Cari ICAO atau Kota...' : 'Search ICAO or City...')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[11px] focus:outline-none focus:border-blue-500/50 transition-all font-mono placeholder:text-white/15"
        />
      </div>
      {(search.length > 0 || (value && search.length === 0)) && (
        <div className="space-y-1 mt-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-1 bg-black/20 rounded-xl border border-white/5 p-1">
          {value && search.length === 0 && (
            <div className="p-2.5 rounded-lg border bg-blue-600/20 border-blue-500/50 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-blue-400 truncate">{value.icao}</p>
                <p className="text-[9px] text-white/60 truncate leading-tight">{value.name}</p>
              </div>
              <div className="bg-blue-500 rounded-full p-0.5">
                 <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          )}
          {search.length > 0 && MILITARY_AIRPORTS.filter(ap => 
            ap.icao.toLowerCase().includes(search.toLowerCase()) || 
            ap.name.toLowerCase().includes(search.toLowerCase()) ||
            ap.country.toLowerCase().includes(search.toLowerCase())
          ).slice(0, 8).map(ap => (
            <div 
              key={ap.icao}
              onClick={() => onSelect(ap)}
              className="p-2.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 cursor-pointer transition-all flex justify-between items-center group"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-bold group-hover:text-blue-400 transition-colors">{ap.icao}</p>
                <p className="text-[9px] text-white/30 truncate group-hover:text-white/50 transition-colors">{ap.name}</p>
              </div>
              <span className="text-[8px] text-white/10 uppercase font-black transition-colors group-hover:text-white/20">{ap.country}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
