import { Aircraft } from './types';

export const REACH_THRESHOLD = 0.5; // 0.5 Nautical Miles

export const AIRCRAFT_PRESETS: Aircraft[] = [
  // Fighters & Combat
  { 
    id: 'hawk-209', 
    name: 'BAE Hawk 109/209', 
    maxFuel: 3200, 
    burnRate: 8, 
    cruiseSpeed: 420, 
    emptyWeight: 9800,
    maxTakeoffWeight: 20060,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1517976384346-3136801d605d?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '1x Rolls-Royce Turbomeca Adour Mk 871',
      maxSpeed: 'Mach 0.88 (644 mph)',
      range: '2,520 km',
      ceiling: '44,000 ft',
      armament: '30mm ADEN Gun Pod, AIM-9 Sidewinder, Mk 82'
    }
  },
  { 
    id: 'f16-emlu', 
    name: 'F-16 Fighting Falcon (F-16AM/BM eMLU)', 
    maxFuel: 7000, 
    burnRate: 15, 
    cruiseSpeed: 450, 
    emptyWeight: 18900,
    maxTakeoffWeight: 42300,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1517976384346-3136801d605d?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '1x Pratt & Whitney F100-PW-229',
      maxSpeed: 'Mach 2.0',
      range: '2,622 miles',
      ceiling: '50,000 ft',
      armament: '20mm M61A1 Vulcan, AIM-9, AIM-120'
    }
  },
  { 
    id: 'f16-cd', 
    name: 'F-16 C/D Block 52ID', 
    maxFuel: 7000, 
    burnRate: 16, 
    cruiseSpeed: 450, 
    emptyWeight: 19200,
    maxTakeoffWeight: 42300,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1517976384346-3136801d605d?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '1x GE F110-GE-129',
      maxSpeed: 'Mach 2.0',
      range: '2,622 miles',
      ceiling: '50,000 ft',
      armament: '20mm Vulcan, AIM-9X, AIM-120C'
    }
  },
  { 
    id: 'su27', 
    name: 'Sukhoi Su-27SKM', 
    maxFuel: 20000, 
    burnRate: 28, 
    cruiseSpeed: 480, 
    emptyWeight: 36100,
    maxTakeoffWeight: 67100,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1583248352195-d3a8e766ede2?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x Saturn AL-31F',
      maxSpeed: 'Mach 2.35',
      range: '3,530 km',
      ceiling: '62,000 ft',
      armament: '30mm GSh-30-1, R-27, R-73, R-77'
    }
  },
  { 
    id: 'su30', 
    name: 'Sukhoi Su-30MK2', 
    maxFuel: 21000, 
    burnRate: 30, 
    cruiseSpeed: 480, 
    emptyWeight: 39000,
    maxTakeoffWeight: 76060,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1583248352195-d3a8e766ede2?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x Saturn AL-31F',
      maxSpeed: 'Mach 2.0',
      range: '3,000 km',
      ceiling: '57,000 ft',
      armament: '30mm GSh-30-1, Kh-31, Kh-59'
    }
  },
  { 
    id: 'rafale', 
    name: 'Dassault Rafale', 
    maxFuel: 10000, 
    burnRate: 18, 
    cruiseSpeed: 470, 
    emptyWeight: 22700,
    maxTakeoffWeight: 54000,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1517976384346-3136801d605d?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x Snecma M88-2',
      maxSpeed: 'Mach 1.8',
      range: '3,700 km',
      ceiling: '50,000 ft',
      armament: '30mm GIAT 30, MICA, METEOR, SCALP'
    }
  },
  { 
    id: 'super-tucano', 
    name: 'EMB-314 Super Tucano', 
    maxFuel: 1500, 
    burnRate: 4, 
    cruiseSpeed: 280, 
    emptyWeight: 7055,
    maxTakeoffWeight: 11464,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '1x Pratt & Whitney PT6A-68C',
      maxSpeed: '367 mph',
      range: '1,330 km',
      ceiling: '35,000 ft',
      armament: '2x 12.7mm M3P, Pods, Bombs'
    }
  },
  { 
    id: 'b737-mpm', 
    name: 'Boeing 737 Maritime Patrol / Surveillance', 
    maxFuel: 45000, 
    burnRate: 15, 
    cruiseSpeed: 440, 
    emptyWeight: 91000,
    maxTakeoffWeight: 174200,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x CFM56-7B',
      maxSpeed: 'Mach 0.82',
      range: '6,100 NM',
      ceiling: '41,000 ft',
      payload: 'Surveillance / MPA Equipment'
    }
  },
  { 
    id: 'c212', 
    name: 'C-212 Aviocar', 
    maxFuel: 4000, 
    burnRate: 3, 
    cruiseSpeed: 190, 
    emptyWeight: 8330,
    maxTakeoffWeight: 16975,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x Garrett TPE331-10',
      maxSpeed: '230 mph',
      range: '1,433 km',
      ceiling: '25,000 ft',
      payload: '6,100 lbs'
    }
  },
  { 
    id: 'super-puma', 
    name: 'NAS-332 Super Puma / H225M Caracal', 
    maxFuel: 5000, 
    burnRate: 5, 
    cruiseSpeed: 140, 
    emptyWeight: 10200,
    maxTakeoffWeight: 19840,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x Turbomeca Makila 1A1',
      maxSpeed: '175 mph',
      range: '857 km',
      ceiling: '20,000 ft',
      payload: 'Troop Transport / SAR'
    }
  },
  { 
    id: 'falcon-8x', 
    name: 'Dassault Falcon 8X (VVIP)', 
    maxFuel: 35000, 
    burnRate: 10, 
    cruiseSpeed: 480, 
    emptyWeight: 34000,
    maxTakeoffWeight: 73000,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '3x P&WC PW307D',
      maxSpeed: 'Mach 0.90',
      range: '6,450 NM',
      ceiling: '51,000 ft',
      payload: 'VVIP Transport'
    }
  },
  { 
    id: 'f35', 
    name: 'F-35 Lightning II', 
    maxFuel: 18000, 
    burnRate: 25, 
    cruiseSpeed: 500, 
    emptyWeight: 29300,
    maxTakeoffWeight: 70000,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1560102765-0676100067f8?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '1x Pratt & Whitney F135-PW-100',
      maxSpeed: 'Mach 1.6 (1,200 mph)',
      range: '1,700 miles',
      ceiling: '50,000 ft',
      armament: '25mm GAU-22/A, Internal Weapons Bay'
    }
  },
  { 
    id: 'f22', 
    name: 'F-22 Raptor', 
    maxFuel: 18000, 
    burnRate: 28, 
    cruiseSpeed: 550, 
    emptyWeight: 43340,
    maxTakeoffWeight: 83500,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x Pratt & Whitney F119-PW-100',
      maxSpeed: 'Mach 2.25 (1,500 mph)',
      range: '1,840 miles',
      ceiling: '65,000 ft',
      armament: '20mm M61A2, AIM-120 AMRAAM, AIM-9 Sidewinder'
    }
  },
  { 
    id: 'su57', 
    name: 'Sukhoi Su-57 Felon', 
    maxFuel: 22000, 
    burnRate: 32, 
    cruiseSpeed: 560, 
    emptyWeight: 39680,
    maxTakeoffWeight: 77160,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1583248352195-d3a8e766ede2?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x Saturn AL-41F1',
      maxSpeed: 'Mach 2.0 (1,320 mph)',
      range: '2,175 miles',
      ceiling: '66,000 ft',
      armament: '30mm GSh-30-1, Internal Weapons Bay'
    }
  },
  { 
    id: 'a10', 
    name: 'A-10 Thunderbolt II', 
    maxFuel: 11000, 
    burnRate: 10, 
    cruiseSpeed: 300, 
    emptyWeight: 24959,
    maxTakeoffWeight: 50000,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1516912403328-e999a465c92d?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x General Electric TF34-GE-100A',
      maxSpeed: '439 mph',
      range: '2,580 miles',
      ceiling: '45,000 ft',
      armament: '30mm GAU-8/A Avenger Gatling Gun'
    }
  },
  { 
    id: 't50i', 
    name: 'T-50i Golden Eagle (TNI AU)', 
    maxFuel: 5000, 
    burnRate: 12, 
    cruiseSpeed: 420, 
    emptyWeight: 14285,
    maxTakeoffWeight: 27300,
    type: 'fighter',
    image: 'https://images.unsplash.com/photo-1559627814-4d0c75748d73?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '1x General Electric F404-GE-102',
      maxSpeed: 'Mach 1.5',
      range: '1,150 miles',
      ceiling: '48,500 ft',
      armament: '20mm M61A1, Hydra 70 Rockets'
    }
  },
  
  // Transports
  { 
    id: 'c130', 
    name: 'C-130J Super Hercules', 
    maxFuel: 60000, 
    burnRate: 10, 
    cruiseSpeed: 350, 
    emptyWeight: 75800,
    maxTakeoffWeight: 155000,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '4x Rolls-Royce AE 2100D3 turboprops',
      maxSpeed: '417 mph',
      range: '2,050 miles',
      ceiling: '28,000 ft',
      payload: '42,000 lbs'
    }
  },
  { 
    id: 'c17', 
    name: 'C-17 Globemaster III', 
    maxFuel: 180000, 
    burnRate: 25, 
    cruiseSpeed: 450, 
    emptyWeight: 282500,
    maxTakeoffWeight: 585000,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1527482937786-6608f6e14c15?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '4x Pratt & Whitney F117-PW-100',
      maxSpeed: '518 mph',
      range: '2,420 miles',
      ceiling: '45,000 ft',
      payload: '170,900 lbs'
    }
  },
  { 
    id: 'cn235', 
    name: 'CASA CN-235 (TNI AU)', 
    maxFuel: 12000, 
    burnRate: 4, 
    cruiseSpeed: 240, 
    emptyWeight: 21605,
    maxTakeoffWeight: 36376,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x General Electric CT7-9C',
      maxSpeed: '282 mph',
      range: '2,700 miles',
      ceiling: '25,000 ft',
      payload: '13,120 lbs'
    }
  },

  // VVIP / Presidential
  { 
    id: 'indonesia-one', 
    name: 'Indonesia One (A-001) - BBJ 2', 
    maxFuel: 45000, 
    burnRate: 14, 
    cruiseSpeed: 440, 
    emptyWeight: 94500,
    maxTakeoffWeight: 174200,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x CFM International CFM56-7B',
      maxSpeed: 'Mach 0.82',
      range: '6,100 NM',
      ceiling: '41,000 ft',
      payload: 'VVIP Configuration'
    }
  },
  { 
    id: 'air-force-one', 
    name: 'Air Force One (VC-25A)', 
    maxFuel: 350000, 
    burnRate: 35, 
    cruiseSpeed: 480, 
    emptyWeight: 455000,
    maxTakeoffWeight: 833000,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1527482937786-6608f6e14c15?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '4x General Electric CF6-80C2B1',
      maxSpeed: '630 mph',
      range: '7,800 NM',
      ceiling: '45,100 ft',
      payload: 'POTUS VVIP'
    }
  },
  { 
    id: 'japan-vip', 
    name: 'Japanese Air Force One (777-300ER)', 
    maxFuel: 300000, 
    burnRate: 30, 
    cruiseSpeed: 490, 
    emptyWeight: 370000,
    maxTakeoffWeight: 775000,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2× General Electric GE90-115B',
      maxSpeed: 'Mach 0.89',
      range: '7,500 NM',
      ceiling: '43,100 ft',
      payload: 'Government of Japan VVIP'
    }
  },
  { 
    id: 'germany-vip', 
    name: 'Konrad Adenauer (A350-941)', 
    maxFuel: 280000, 
    burnRate: 26, 
    cruiseSpeed: 490, 
    emptyWeight: 313000,
    maxTakeoffWeight: 617000,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1559627814-4d0c75748d73?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x Rolls-Royce Trent XWB',
      maxSpeed: 'Mach 0.89',
      range: '9,700 NM',
      ceiling: '43,100 ft',
      payload: 'German Government VVIP'
    }
  },
  { 
    id: 'france-vip', 
    name: 'Cotam 001 (A330-223)', 
    maxFuel: 200000, 
    burnRate: 22, 
    cruiseSpeed: 475, 
    emptyWeight: 263000,
    maxTakeoffWeight: 533500,
    type: 'transport',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=800&q=80',
    specs: {
      engine: '2x General Electric CF6-80E1',
      maxSpeed: 'Mach 0.86',
      range: '7,250 NM',
      ceiling: '41,100 ft',
      payload: 'French Republic VVIP'
    }
  },
];

export const FIR_REGIONS = [
  { name: 'Jakarta FIR', color: '#3b82f6', bounds: [[-11, 94], [-11, 110], [6, 110], [6, 94], [-11, 94]] },
  { name: 'Singapore FIR', color: '#10b981', bounds: [[1, 104], [1, 110], [7, 110], [7, 104], [1, 104]] },
  { name: 'Ujung Pandang FIR', color: '#f59e0b', bounds: [[-11, 110], [-11, 141], [6, 141], [6, 110], [-11, 110]] },
  { name: 'Manila FIR', color: '#ef4444', bounds: [[4, 116], [4, 127], [21, 127], [21, 116], [4, 116]] },
  { name: 'Bangkok FIR', color: '#8b5cf6', bounds: [[5, 97], [5, 106], [21, 106], [21, 97], [5, 97]] },
];

export const MILITARY_RANKS = [
  'Letda', 'Lettu', 'Kapten', 'Mayor', 'Letkol', 'Kolonel'
];

export const MILITARY_BRANCHES = [
  'Fighter Command', 'Airbase Operations', 'Strategic Airlift'
];

export const MILITARY_SPECIALIZATIONS = [
  'Interceptor Specialist', 'Logistics Officer', 'Tactical Commander', 'Recon Pilot'
];

export const INDONESIAN_AIRBASES = [
  'Lanud Iswahjudi', 'Lanud Halim Perdanakusuma', 'Lanud Sultan Hasanuddin',
  'Lanud Roesmin Nurjadin', 'Lanud Abdulrachman Saleh', 'Lanud Atang Sendjaja',
  'Lanud Supadio', 'Lanud Soewondo', 'Lanud Sam Ratulangi', 'Lanud El Tari',
  'Lanud Pattimura', 'Lanud Silas Papare', 'Lanud Adisutjipto', 'Lanud Manuhua',
  'Lanud Suryadarma', 'Lanud Husein Sastranegara'
];

export interface PlayableSquadron {
  id: string;
  name: string;
  fullName: string;
  nickname: string;
  baseName: string;
  baseLocation: string;
  baseIcao: string;
  aircraftId: string;
  aircraftName: string;
  role: string;
  badgeColor: string;
  accentBorder: string;
  mottoId: string;
  mottoEn: string;
  callsignPrefix: string;
  established: string;
  unlockPrice: number;
  minRank: string;
  minRankIndex: number;
}

export const PLAYABLE_SQUADRONS: PlayableSquadron[] = [
  {
    id: 'sq1',
    name: 'Skadron Udara 1',
    fullName: 'Skadron Udara 1 "Elang"',
    nickname: 'Elang',
    baseName: 'Lanud Supadio',
    baseLocation: 'Pontianak, Kalimantan Barat',
    baseIcao: 'WIOO',
    aircraftId: 'hawk-209',
    aircraftName: 'Hawk 109/209',
    role: 'Light fighter / attack',
    badgeColor: 'from-amber-600 to-yellow-950',
    accentBorder: 'border-amber-500/40',
    mottoId: 'Sayap Perkasa Penjaga Khatulistiwa',
    mottoEn: 'Mighty Wings Guarding the Equator',
    callsignPrefix: 'ELANG',
    established: '1950',
    unlockPrice: 250000000,
    minRank: 'Letda',
    minRankIndex: 0
  },
  {
    id: 'sq3',
    name: 'Skadron Udara 3',
    fullName: 'Skadron Udara 3 "Naga"',
    nickname: 'Naga',
    baseName: 'Lanud Iswahjudi',
    baseLocation: 'Madiun, Jawa Timur',
    baseIcao: 'WARI',
    aircraftId: 'f16-emlu',
    aircraftName: 'F-16 AM/BM Fighting Falcon',
    role: 'Multirole fighter',
    badgeColor: 'from-blue-600 to-indigo-950',
    accentBorder: 'border-blue-500/40',
    mottoId: 'Swa Bhuwana Paksa - Pantang Pulang Sebelum Menang',
    mottoEn: 'Wings of the Nation - Never Return Before Victory',
    callsignPrefix: 'DRAGON',
    established: '1951',
    unlockPrice: 750000000,
    minRank: 'Mayor',
    minRankIndex: 3
  },
  {
    id: 'sq11',
    name: 'Skadron Udara 11',
    fullName: 'Skadron Udara 11 "Thunder"',
    nickname: 'Thunder',
    baseName: 'Lanud Sultan Hasanuddin',
    baseLocation: 'Makassar, Sulawesi Selatan',
    baseIcao: 'WAAA',
    aircraftId: 'su30',
    aircraftName: 'Su-27SK / Su-30MK2',
    role: 'Heavy multirole fighter',
    badgeColor: 'from-red-600 to-slate-950',
    accentBorder: 'border-red-500/40',
    mottoId: 'Kilat Perkasa Menggetarkan Angkasa',
    mottoEn: 'Mighty Thunder Shaking the Heavens',
    callsignPrefix: 'THUNDER',
    established: '1974',
    unlockPrice: 1000000000,
    minRank: 'Letkol',
    minRankIndex: 4
  },
  {
    id: 'sq12',
    name: 'Skadron Udara 12',
    fullName: 'Skadron Udara 12 "Black Panther"',
    nickname: 'Black Panther',
    baseName: 'Lanud Roesmin Nurjadin',
    baseLocation: 'Pekanbaru, Riau',
    baseIcao: 'WIBB',
    aircraftId: 'rafale',
    aircraftName: 'Dassault Rafale',
    role: '4.5-generation multirole fighter',
    badgeColor: 'from-purple-600 to-slate-950',
    accentBorder: 'border-purple-500/40',
    mottoId: 'Kekuatan Tersembunyi Penyergap Cepat',
    mottoEn: 'Stealth and Swift Strike Power',
    callsignPrefix: 'PANTHER',
    established: '1982',
    unlockPrice: 1500000000,
    minRank: 'Kolonel',
    minRankIndex: 5
  },
  {
    id: 'sq14',
    name: 'Skadron Udara 14',
    fullName: 'Skadron Udara 14',
    nickname: 'The Tiger',
    baseName: 'Lanud Iswahjudi',
    baseLocation: 'Madiun, Jawa Timur',
    baseIcao: 'WARI',
    aircraftId: 'f16-cd',
    aircraftName: 'F-16 Fighting Falcon',
    role: 'Multirole fighter',
    badgeColor: 'from-orange-600 to-stone-950',
    accentBorder: 'border-orange-500/40',
    mottoId: 'Harimau Mengaum di Langit Nusantara',
    mottoEn: 'Roaring Tigers Guarding the Archipelago',
    callsignPrefix: 'TIGER',
    established: '1962',
    unlockPrice: 600000000,
    minRank: 'Kapten',
    minRankIndex: 2
  },
  {
    id: 'sq15',
    name: 'Skadron Udara 15',
    fullName: 'Skadron Udara 15',
    nickname: 'The Golden Eagle',
    baseName: 'Lanud Iswahjudi',
    baseLocation: 'Madiun, Jawa Timur',
    baseIcao: 'WARI',
    aircraftId: 't50i',
    aircraftName: 'T-50i Golden Eagle',
    role: 'Lead-in fighter trainer / light fighter',
    badgeColor: 'from-yellow-500 to-slate-950',
    accentBorder: 'border-yellow-400/40',
    mottoId: 'Satya Bhakti Praja Yudha',
    mottoEn: 'Loyalty in Defense and Flight Excellence',
    callsignPrefix: 'EAGLE',
    established: '1980',
    unlockPrice: 450000000,
    minRank: 'Lettu',
    minRankIndex: 1
  },
  {
    id: 'sq16',
    name: 'Skadron Udara 16',
    fullName: 'Skadron Udara 16 "Rydder"',
    nickname: 'Rydder',
    baseName: 'Lanud Roesmin Nurjadin',
    baseLocation: 'Pekanbaru, Riau',
    baseIcao: 'WIBB',
    aircraftId: 'f16-cd',
    aircraftName: 'F-16 Fighting Falcon',
    role: 'Multirole fighter',
    badgeColor: 'from-cyan-600 to-slate-950',
    accentBorder: 'border-cyan-500/40',
    mottoId: 'Tombak Pengawal Batas Negeri',
    mottoEn: 'Spearhead of the Sovereign Skies',
    callsignPrefix: 'RYDDER',
    established: '1985',
    unlockPrice: 650000000,
    minRank: 'Kapten',
    minRankIndex: 2
  },
  {
    id: 'sq21',
    name: 'Skadron Udara 21',
    fullName: 'Skadron Udara 21',
    nickname: 'Tuco',
    baseName: 'Lanud Abdulrachman Saleh',
    baseLocation: 'Malang, Jawa Timur',
    baseIcao: 'WARS',
    aircraftId: 'super-tucano',
    aircraftName: 'EMB-314 Super Tucano',
    role: 'Light attack / COIN',
    badgeColor: 'from-emerald-600 to-slate-950',
    accentBorder: 'border-emerald-500/40',
    mottoId: 'Ketepatan Menghancurkan Ancaman Darat',
    mottoEn: 'Precision Close Air Support and Counter-Insurgency',
    callsignPrefix: 'TUCO',
    established: '2004',
    unlockPrice: 300000000,
    minRank: 'Letda',
    minRankIndex: 0
  }
];

export const SQUADRON_DATA = [
  { id: 'sq1', name: 'Skadron Udara 1', aircraftIds: ['hawk-209'], location: 'Lanud Supadio' },
  { id: 'sq3', name: 'Skadron Udara 3', aircraftIds: ['f16-emlu'], location: 'Lanud Iswahjudi' },
  { id: 'sq11', name: 'Skadron Udara 11', aircraftIds: ['su27', 'su30'], location: 'Lanud Sultan Hasanuddin' },
  { id: 'sq12', name: 'Skadron Udara 12', aircraftIds: ['rafale'], location: 'Lanud Roesmin Nurjadin' },
  { id: 'sq14', name: 'Skadron Udara 14', aircraftIds: ['f16-cd'], location: 'Lanud Iswahjudi' },
  { id: 'sq15', name: 'Skadron Udara 15', aircraftIds: ['t50i'], location: 'Lanud Iswahjudi' },
  { id: 'sq16', name: 'Skadron Udara 16', aircraftIds: ['f16-cd'], location: 'Lanud Roesmin Nurjadin' },
  { id: 'sq21', name: 'Skadron Udara 21', aircraftIds: ['super-tucano'], location: 'Lanud Abdulrachman Saleh' },
  { id: 'sq31', name: 'Skadron Udara 31', aircraftIds: ['c130', 'c17'], location: 'Lanud Halim Perdanakusuma' },
  { id: 'sq32', name: 'Skadron Udara 32', aircraftIds: ['c130'], location: 'Lanud Abdulrachman Saleh' },
  { id: 'sq2', name: 'Skadron Udara 2', aircraftIds: ['cn235', 'b737-mpm'], location: 'Lanud Halim Perdanakusuma' },
  { id: 'sq5', name: 'Skadron Udara 5', aircraftIds: ['b737-mpm', 'cn235'], location: 'Lanud Sultan Hasanuddin' },
  { id: 'sq17', name: 'Skadron Udara 17', aircraftIds: ['indonesia-one', 'falcon-8x'], location: 'Lanud Halim Perdanakusuma' },
  { id: 'sq4', name: 'Skadron Udara 4', aircraftIds: ['c212'], location: 'Lanud Abdulrachman Saleh' },
  { id: 'sq6', name: 'Skadron Udara 6', aircraftIds: ['super-puma'], location: 'Lanud Atang Sendjaja' },
  { id: 'sq8', name: 'Skadron Udara 8', aircraftIds: ['super-puma'], location: 'Lanud Atang Sendjaja' },
  { id: 'sq45', name: 'Skadron Udara 45', aircraftIds: ['cn235'], location: 'Lanud Halim Perdanakusuma' },
];
