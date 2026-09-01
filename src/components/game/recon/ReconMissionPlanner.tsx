import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Plane, 
  MapPin, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Navigation, 
  Plus, 
  Trash2, 
  Target, 
  Layers, 
  Fuel, 
  Cpu, 
  Sparkles, 
  Eye, 
  Globe, 
  Crosshair,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn, getDistance } from '../../../lib/utils';
import { MilitaryAirport, MILITARY_AIRPORTS } from '../../../airports';
import { ReconAircraft, RECON_AIRCRAFT_LIST, getDefaultAirportsForRecon } from '../../../data/reconAircraft';
import { AirportSelector } from '../AirportSelector';
import { Waypoint } from '../../../types';
import { calculateReconTotalDistance } from '../../../engine/reconEngine';

interface ReconMissionPlannerProps {
  language: 'id' | 'en';
  selectedRecon: ReconAircraft;
  onSelectRecon: (recon: ReconAircraft) => void;
  reconDeparture: MilitaryAirport;
  onSelectDeparture: (ap: MilitaryAirport) => void;
  reconArrival: MilitaryAirport;
  onSelectArrival: (ap: MilitaryAirport) => void;
  surveyPoints: Waypoint[];
  onSetSurveyPoints: (points: Waypoint[] | ((prev: Waypoint[]) => Waypoint[])) => void;
  onStartReconFlight: () => void;
  isReconAirborne: boolean;
  isPickingReconSurvey?: boolean;
  setIsPickingReconSurvey?: (v: boolean) => void;
}

const PRESET_SURVEY_ROUTES = [
  {
    nameId: 'Patroli Maritim Selat Malaka',
    nameEn: 'Malacca Strait Maritime Patrol',
    points: [
      { name: 'SURVEY-ALPHA (Tanjung Pinang)', lat: 1.2500, lng: 104.4500 },
      { name: 'SURVEY-BRAVO (Selat Malaka Tengah)', lat: 2.3000, lng: 102.8000 },
      { name: 'SURVEY-CHARLIE (Bengkalis Corridor)', lat: 1.8500, lng: 101.9500 }
    ]
  },
  {
    nameId: 'Pengintaian ZEE Laut Natuna Utara',
    nameEn: 'North Natuna Sea EEZ Recon',
    points: [
      { name: 'NATUNA-SEKTOR-1 (Ranai Outer)', lat: 4.2500, lng: 108.4000 },
      { name: 'NATUNA-SEKTOR-2 (Garis Batas ZEE)', lat: 5.6000, lng: 109.2000 },
      { name: 'NATUNA-SEKTOR-3 (Karang Terluar)', lat: 4.8000, lng: 107.5000 }
    ]
  },
  {
    nameId: 'Surveillance Perbatasan Udara Kalimantan',
    nameEn: 'Kalimantan Border Air Surveillance',
    points: [
      { name: 'BORNEO-ALPHA (Supadio North)', lat: 0.8500, lng: 109.8000 },
      { name: 'BORNEO-BRAVO (Entikong Radar Ridge)', lat: 1.0500, lng: 110.3500 },
      { name: 'BORNEO-CHARLIE (Jagoi Babang Sector)', lat: 1.3500, lng: 109.7000 }
    ]
  },
  {
    nameId: 'Pengawasan ALKI II (Selat Makassar)',
    nameEn: 'Makassar Strait Archipelagic Sea Lane',
    points: [
      { name: 'ALKI-1 (Hasanuddin North Approach)', lat: -4.1000, lng: 119.2000 },
      { name: 'ALKI-2 (Majene Deep Waters)', lat: -3.2000, lng: 118.6000 },
      { name: 'ALKI-3 (Balikpapan Channel)', lat: -1.7500, lng: 117.8000 }
    ]
  }
];

export const ReconMissionPlanner: React.FC<ReconMissionPlannerProps> = ({
  language,
  selectedRecon,
  onSelectRecon,
  reconDeparture,
  onSelectDeparture,
  reconArrival,
  onSelectArrival,
  surveyPoints,
  onSetSurveyPoints,
  onStartReconFlight,
  isReconAirborne,
  isPickingReconSurvey = false,
  setIsPickingReconSurvey
}) => {
  const [depSearch, setDepSearch] = useState('');
  const [arrSearch, setArrSearch] = useState('');
  const [newWpLat, setNewWpLat] = useState('');
  const [newWpLng, setNewWpLng] = useState('');
  const [newWpName, setNewWpName] = useState('');

  // Total Distance calculation
  const totalDistance = useMemo(() => {
    return calculateReconTotalDistance(reconDeparture, surveyPoints, reconArrival);
  }, [reconDeparture, surveyPoints, reconArrival]);

  const isOutOfScope = totalDistance > selectedRecon.maxRangeNM;

  const handleSelectAircraft = (planeId: string) => {
    const plane = RECON_AIRCRAFT_LIST.find(p => p.id === planeId);
    if (plane) {
      onSelectRecon(plane);
      // Auto-set default country airports
      const defaults = getDefaultAirportsForRecon(plane);
      onSelectDeparture(defaults.departure);
      onSelectArrival(defaults.arrival);
    }
  };

  const handleAddManualPoint = () => {
    const lat = parseFloat(newWpLat);
    const lng = parseFloat(newWpLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const newWp: Waypoint = {
        id: `survey-wp-${Date.now()}`,
        name: newWpName.trim() || `TITIK SURVEY ${surveyPoints.length + 1}`,
        lat,
        lng,
        reached: false,
        type: 'waypoint',
        planAltitude: selectedRecon.operatingAlt,
        planSpeed: selectedRecon.cruiseSpeed
      };
      onSetSurveyPoints(prev => [...prev, newWp]);
      setNewWpLat('');
      setNewWpLng('');
      setNewWpName('');
    }
  };

  const handleApplyPresetRoute = (preset: typeof PRESET_SURVEY_ROUTES[0]) => {
    const formatted: Waypoint[] = preset.points.map((p, idx) => ({
      id: `preset-wp-${idx}-${Date.now()}`,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      reached: false,
      type: 'waypoint',
      planAltitude: selectedRecon.operatingAlt,
      planSpeed: selectedRecon.cruiseSpeed
    }));
    onSetSurveyPoints(formatted);
  };

  const handleRemovePoint = (id: string) => {
    onSetSurveyPoints(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAllPoints = () => {
    onSetSurveyPoints([]);
  };

  return (
    <div className="space-y-5 text-white">
      {/* HEADER BANNER */}
      <div className="p-4 bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-black/80 border border-cyan-500/30 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Radio className="w-36 h-36 text-cyan-400" />
        </div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
            {language === 'id' ? 'SISTEM PENGINTAIAN UDARA & INTELIJEN TAKTIS' : 'AIRBORNE RECONNAISSANCE & INTEL SYSTEM'}
          </span>
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">
          {language === 'id' ? 'Konfigurasi Pesawat Intai (Recon Flight Planning)' : 'Reconnaissance Aircraft Configuration'}
        </h3>
        <p className="text-[10px] text-cyan-200/70 mt-1 leading-relaxed">
          {language === 'id'
            ? 'Pilih pesawat intai/UAV, tentukan bandara asal & tujuan, lalu tentukan titik koordinat target survey. Pesawat intai akan mendeteksi target musuh dan memberi perintah ke pesawat tempur di hangar.'
            : 'Select reconnaissance aircraft/UAV, define bases, and establish survey target coordinates. Recon unit will detect threats and transmit strike directives to the hangar squadron.'}
        </p>
      </div>

      {/* 1. DROPDOWN SELECTION OF RECON AIRCRAFT */}
      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-cyan-400" />
            <label className="text-[11px] font-black text-white uppercase tracking-wider">
              {language === 'id' ? '3. Pilih Jenis Pesawat Intai (Recon Aircraft)' : '3. Select Recon Aircraft'}
            </label>
          </div>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
            {selectedRecon.countryOrigin}
          </span>
        </div>

        <select
          value={selectedRecon.id}
          onChange={(e) => handleSelectAircraft(e.target.value)}
          className="w-full bg-[#0d1626] border border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-cyan-100 font-bold focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
        >
          <optgroup label="── DRONE / UAV & TACTICAL UAS ──">
            <option value="anka-s">ANKA-S (Turki / Multi-Role MALE UAV)</option>
            <option value="ch-4b">CH-4B RAINBOW (TNI AU / Long-Endurance UAV)</option>
            <option value="aerostar">Aerostar TACTICAL UAS (Tactical Border Surveillance)</option>
            <option value="iae-wulung">IAe Wulung (PT DI Indonesia / Indigenous UAV)</option>
            <option value="mq-27b">MQ-27B (Maritime Patrol Drone)</option>
            <option value="schiebel-s100">Schiebel Camcopter S-100 (VTOL Rotary UAS)</option>
          </optgroup>

          <optgroup label="── PESAWAT INTAI MARITIM INDONESIA (MPA) ──">
            <option value="b737-surveiler">Boeing 737-200/Surveiler (TNI AU AI-7301 Camar Emas)</option>
            <option value="cn235-mpa">CN-235 MPA (PT DI Maritime Patrol)</option>
            <option value="cn295-mpa">CN-295 MPA (PT DI Tactical FITS Recon)</option>
          </optgroup>

          <optgroup label="── PESAWAT NEGARA ASAL (AUTO-DEFAULT BASES) ──">
            <option value="g550-caew-singapore">Gulfstream G550 C AEW - SINGAPURA</option>
            <option value="heron1-singapore">HERON 1 - SINGAPURA</option>
            <option value="hermes900-thailand">HERMES 900 - Thailand</option>
            <option value="p8a-australia">P-8A Poseidon - australia</option>
            <option value="mq4c-australia">MQ-4C Triton - Australia</option>
            <option value="e7a-australia">E-7A wedgetail - Australia</option>
          </optgroup>
        </select>

        {/* Selected Aircraft Spec Badge Grid */}
        <div className="grid grid-cols-3 gap-2 text-[9px] font-mono pt-1">
          <div className="p-2 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
            <span className="text-white/40 block uppercase">{language === 'id' ? 'Jangkauan Max:' : 'Max Range:'}</span>
            <span className="font-black text-cyan-400 text-xs">{selectedRecon.maxRangeNM.toLocaleString()} NM</span>
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
            <span className="text-white/40 block uppercase">{language === 'id' ? 'Kecepatan Jelajah:' : 'Cruise Speed:'}</span>
            <span className="font-black text-amber-300 text-xs">{selectedRecon.cruiseSpeed} KTS</span>
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
            <span className="text-white/40 block uppercase">{language === 'id' ? 'Radius Sensor:' : 'Radar Footprint:'}</span>
            <span className="font-black text-emerald-400 text-xs">{selectedRecon.radarRadiusNM} NM Radius</span>
          </div>
        </div>

        <div className="p-2.5 bg-cyan-950/30 border border-cyan-500/20 rounded-xl space-y-1 text-[8.5px] text-cyan-200/90 font-mono">
          <p className="font-bold flex items-center gap-1.5 text-cyan-300">
            <Cpu className="w-3.5 h-3.5" />
            <span>SENSOR PAYLOAD: {selectedRecon.sensorPayload}</span>
          </p>
          <p className="text-white/60">
            {language === 'id' ? selectedRecon.descriptionId : selectedRecon.descriptionEn}
          </p>
        </div>
      </div>

      {/* 2. AIRPORT SELECTION (DEPARTURE & LANDING) */}
      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
              {language === 'id' ? '1 & 2. Bandara Keberangkatan & Landing Pesawat Intai' : '1 & 2. Recon Departure & Landing Airbases'}
            </h4>
          </div>
          {['Singapura', 'Thailand', 'Australia'].includes(selectedRecon.countryOrigin) && (
            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {language === 'id' ? 'Default Negara Asal Terpilih' : 'Country Default Loaded'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AirportSelector
            label={language === 'id' ? '1. Bandara Keberangkatan (Departure)' : '1. Departure Base'}
            value={reconDeparture}
            search={depSearch}
            onSearchChange={setDepSearch}
            onSelect={(ap) => {
              onSelectDeparture(ap);
              setDepSearch('');
            }}
            language={language}
          />
          <AirportSelector
            label={language === 'id' ? '2. Bandara Landing (Arrival)' : '2. Landing / Recovery Base'}
            value={reconArrival}
            search={arrSearch}
            onSearchChange={setArrSearch}
            onSelect={(ap) => {
              onSelectArrival(ap);
              setArrSearch('');
            }}
            language={language}
          />
        </div>
      </div>

      {/* 3. SURVEY TARGET COORDINATES & RANGE SCOPE VERIFICATION */}
      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
              {language === 'id' ? 'Titik Koordinat Survey Pengintaian' : 'Recon Survey Coordinates'}
            </h4>
          </div>
          <span className="text-[9px] font-mono text-white/50">
            {surveyPoints.length} {language === 'id' ? 'Titik Ditentukan' : 'Points Defined'}
          </span>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/40">
            {language === 'id' ? 'Rute Preset Taktis Cepat:' : 'Tactical Preset Routes:'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_SURVEY_ROUTES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPresetRoute(preset)}
                className="p-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 rounded-xl text-left transition-all group"
              >
                <div className="text-[9px] font-black text-cyan-300 group-hover:text-cyan-200 truncate">
                  {language === 'id' ? preset.nameId : preset.nameEn}
                </div>
                <div className="text-[7.5px] text-white/40 font-mono mt-0.5">
                  {preset.points.length} Sektor Target
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Map Click Placement Mode Toggle */}
        {setIsPickingReconSurvey && (
          <button
            type="button"
            onClick={() => setIsPickingReconSurvey(!isPickingReconSurvey)}
            className={cn(
              "w-full py-2.5 px-3 rounded-xl border text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md",
              isPickingReconSurvey
                ? "bg-cyan-500 text-black border-cyan-300 ring-2 ring-cyan-400/50 animate-pulse font-mono"
                : "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/50"
            )}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>
              {isPickingReconSurvey
                ? (language === 'id' ? '📍 MODE KLIK PETA AKTIF (KLIK PETA UNTUK MENAMBAH TITIK)' : '📍 MAP CLICK MODE ACTIVE (CLICK MAP TO ADD)')
                : (language === 'id' ? '📍 Mode Tempatkan Titik di Peta (Klik Peta)' : '📍 Place Points on Map (Map Click Mode)')}
            </span>
          </button>
        )}

        {/* Manual Coordinates Input */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/50 block">
            {language === 'id' ? 'Tambah Koordinat Survey Manual:' : 'Add Manual Coordinate Target:'}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Nama Target (opsional)"
              value={newWpName}
              onChange={(e) => setNewWpName(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              placeholder="Latitude (cth: 1.352)"
              value={newWpLat}
              onChange={(e) => setNewWpLat(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              placeholder="Longitude (cth: 104.25)"
              value={newWpLng}
              onChange={(e) => setNewWpLng(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddManualPoint}
              className="flex-1 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 rounded-xl text-[9px] font-black uppercase tracking-wider text-cyan-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'id' ? 'Tambahkan Titik Koordinat' : 'Add Survey Point'}</span>
            </button>
            {surveyPoints.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllPoints}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[9px] font-bold text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Survey Points List */}
        {surveyPoints.length > 0 && (
          <div className="space-y-1.5">
            {surveyPoints.map((wp, idx) => (
              <div
                key={wp.id}
                className="p-2.5 bg-[#0e1726] border border-cyan-500/20 rounded-xl flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[9px] font-black text-cyan-300">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white text-[10px] block">{wp.name}</span>
                    <span className="text-[8px] text-cyan-300/60">
                      {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePoint(wp.id)}
                  className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 4. RANGE & OUT-OF-SCOPE SCOPE CHECK CARD */}
        <div className={cn(
          "p-3.5 rounded-2xl border space-y-2.5 transition-all text-[9px] font-mono",
          isOutOfScope
            ? "bg-red-950/40 border-red-500/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            : "bg-cyan-950/30 border-cyan-500/30 text-cyan-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Fuel className="w-4 h-4 text-amber-400" />
              <span>{language === 'id' ? 'ANALISIS JANGKAUAN PESAWAT INTAI' : 'RECON RANGE SCOPE ANALYSIS'}</span>
            </div>
            <span className={cn(
              "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
              isOutOfScope
                ? "bg-red-500/30 text-red-300 border-red-500/50 animate-pulse"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            )}>
              {isOutOfScope
                ? (language === 'id' ? 'OUT OF SCOPE / MELEBIHI BATAS' : 'OUT OF SCOPE')
                : (language === 'id' ? 'JANGKAUAN AMAN (IN SCOPE)' : 'IN SCOPE')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[8.5px] bg-black/50 p-2.5 rounded-xl border border-white/5">
            <div>
              <span className="text-white/40 block">{language === 'id' ? 'Total Jarak Rute Survey:' : 'Total Survey Distance:'}</span>
              <p className={cn("text-sm font-black font-mono", isOutOfScope ? "text-red-400" : "text-white")}>
                {totalDistance} NM
              </p>
              <span className="text-white/30 text-[7.5px]">
                ({reconDeparture.icao} → {surveyPoints.length} Sektor → {reconArrival.icao})
              </span>
            </div>
            <div>
              <span className="text-white/40 block">{language === 'id' ? 'Batas Max Pesawat:' : 'Aircraft Max Range:'}</span>
              <p className="text-sm font-black text-cyan-300 font-mono">
                {selectedRecon.maxRangeNM.toLocaleString()} NM
              </p>
              <span className="text-white/30 text-[7.5px]">
                {selectedRecon.name}
              </span>
            </div>
          </div>

          {/* OUT OF SCOPE WARNING PROMPT */}
          {isOutOfScope && (
            <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-red-300 font-black uppercase text-[9px]">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                <span>
                  {language === 'id'
                    ? 'PERINGATAN: PESAWAT OUT OF SCOPE!'
                    : 'WARNING: AIRCRAFT OUT OF SCOPE!'}
                </span>
              </div>
              <p className="text-[8px] text-red-200/90 leading-relaxed font-sans">
                {language === 'id'
                  ? `Jarak penerbangan survey (${totalDistance} NM) melebihi jangkauan maksimum ${selectedRecon.name} (${selectedRecon.maxRangeNM} NM). Silakan pilih jenis pesawat intai yang memiliki jangkauan lebih luas (misal: Boeing 737 Surveiler, P-8A Poseidon, atau MQ-4C Triton) atau sesuaikan titik koordinat agar misi dapat terlaksana.`
                  : `Total survey distance (${totalDistance} NM) exceeds ${selectedRecon.name} maximum range (${selectedRecon.maxRangeNM} NM). Please select a higher-endurance recon aircraft (e.g., Boeing 737 Surveiler, P-8A Poseidon, or MQ-4C Triton) or adjust survey coordinates.`}
              </p>
            </div>
          )}
        </div>

        {/* 5. START RECON FLIGHT BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isOutOfScope || surveyPoints.length === 0 || isReconAirborne}
            onClick={onStartReconFlight}
            className={cn(
              "w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 shadow-2xl border",
              isOutOfScope || surveyPoints.length === 0
                ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
                : isReconAirborne
                ? "bg-cyan-600/50 text-cyan-200 border-cyan-400/30 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400 shadow-cyan-600/30 active:scale-[0.98]"
            )}
          >
            <Radio className={cn("w-4 h-4", isReconAirborne ? "animate-spin" : "")} />
            <span>
              {isReconAirborne
                ? (language === 'id' ? 'PESAWAT INTAI SEDANG DI UDARA...' : 'RECON FLIGHT IN PROGRESS...')
                : surveyPoints.length === 0
                ? (language === 'id' ? 'TENTUKAN TITIK KOORDINAT SURVEY DAHULU' : 'DEFINE SURVEY COORDINATES FIRST')
                : (language === 'id' ? 'LUNCURKAN PESAWAT INTAI (START RECON)' : 'LAUNCH RECON FLIGHT')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
