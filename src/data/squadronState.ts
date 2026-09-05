import { 
  Aircraft, 
  OwnedAircraft, 
  SquadronCrewRoster, 
  FacilityState, 
  PlayerProfile, 
  WeaponItem, 
  AircraftGenerationUpgrade,
  IndividualPilot,
  IndividualCrewMember,
  TrainingCourse,
  PendingDeliveryItem,
  SquadronCommissioningPipeline
} from '../types';
import { AIRCRAFT_PRESETS, SQUADRON_DATA, PLAYABLE_SQUADRONS } from '../constants';

export const INITIAL_SQUADRON_BUDGET = 1500000000; // Rp 1.500.000.000

export const RANK_HIERARCHY: Record<string, { level: number; label: string; insignia: string }> = {
  'Letda': { level: 1, label: 'Letnan Dua (Letda)', insignia: '1 Golden Bar' },
  'Lettu': { level: 2, label: 'Letnan Satu (Lettu)', insignia: '2 Golden Bars' },
  'Kapten': { level: 3, label: 'Kapten Pnb (Kapt)', insignia: '3 Golden Bars' },
  'Mayor': { level: 4, label: 'Mayor Pnb (May)', insignia: '1 Golden Diamond' },
  'Letkol': { level: 5, label: 'Letnan Kolonel (Letkol)', insignia: '2 Golden Diamonds' },
  'Kolonel': { level: 6, label: 'Kolonel Pnb (Kol)', insignia: '3 Golden Diamonds' },
  'Marsma': { level: 7, label: 'Marsekal Pertama (Marsma)', insignia: '1 Golden Star' },
  'Marsda': { level: 8, label: 'Marsekal Muda (Marsda)', insignia: '2 Golden Stars' },
};

export function getRankLevel(rankString: string | undefined): number {
  if (!rankString) return 3; // Default Kapten
  for (const [key, val] of Object.entries(RANK_HIERARCHY)) {
    if (rankString.toLowerCase().includes(key.toLowerCase())) {
      return val.level;
    }
  }
  return 3;
}

export const WEAPONS_ARSENAL_CATALOG: WeaponItem[] = [
  // --- AIR TO AIR ---
  {
    id: 'aim9x',
    name: 'AIM-9X Block II Sidewinder',
    category: 'air_to_air',
    categoryLabelId: 'Rudal Udara-ke-Udara Jarak Dekat (WVR)',
    categoryLabelEn: 'Short-Range Within-Visual-Range (WVR) IR',
    descriptionId: 'Rudal pencari panas inframerah berkecepatan tinggi dengan kemampuan High Off-Boresight (HOBS) dan JHMCS Helmet Cueing.',
    descriptionEn: 'High-agility infrared heat-seeking dogfight missile with High Off-Boresight (HOBS) and Helmet Cueing capability.',
    price: 15000000,
    isDefault: true,
    weightLbs: 188,
    missionSuitability: ['CAP', 'CAS', 'MARITIME'],
    hardpointStations: ['wingtip', 'outboard'],
    specs: {
      range: '18 NM (33 km)',
      speed: 'Mach 2.8',
      guidance: 'Imaging Infrared (IIR)',
      warhead: '20.8 lb Annular Blast-Frag'
    }
  },
  {
    id: 'aim120c',
    name: 'AIM-120C-7 AMRAAM',
    category: 'air_to_air',
    categoryLabelId: 'Rudal Udara-ke-Udara Jarak Jauh (BVR)',
    categoryLabelEn: 'Beyond-Visual-Range (BVR) Active Radar',
    descriptionId: 'Rudal radar aktif pemusnah target udara jarak jauh dengan panduan radar mandiri Fire-and-Forget dan ECCM tinggi.',
    descriptionEn: 'Active radar homing BVR missile with fire-and-forget autonomous guidance and high ECCM jamming resistance.',
    price: 35000000,
    isDefault: true,
    weightLbs: 335,
    missionSuitability: ['CAP', 'STANDOFF'],
    hardpointStations: ['outboard', 'inboard', 'conformal'],
    specs: {
      range: '57 NM (105 km)',
      speed: 'Mach 4.0',
      guidance: 'Active Radar Terminal + Midcourse Datalink',
      warhead: '44 lb High Explosive Blast'
    }
  },
  {
    id: 'aim120d',
    name: 'AIM-120D AMRAAM (Extended Range)',
    category: 'air_to_air',
    categoryLabelId: 'Rudal BVR Jarak Ekstra Jauh & Two-Way Datalink',
    categoryLabelEn: 'Extended-Range BVR Datalink Missile',
    descriptionId: 'Varian mutakhir AMRAAM dengan jangkauan 160 km, GPS-aided navigation, dan High-Angle Off-Boresight envelope.',
    descriptionEn: 'Advanced AMRAAM variant featuring 160 km range, two-way datalink, GPS navigation, and expanded kill envelope.',
    price: 55000000,
    isDefault: false,
    weightLbs: 350,
    missionSuitability: ['CAP', 'STANDOFF'],
    hardpointStations: ['outboard', 'inboard', 'conformal'],
    specs: {
      range: '86 NM (160 km)',
      speed: 'Mach 4.2',
      guidance: 'Two-Way Datalink + Active Radar',
      warhead: '44 lb Fragmentation Warhead'
    }
  },
  {
    id: 'meteor',
    name: 'MBDA Meteor Ramjet BVR',
    category: 'air_to_air',
    categoryLabelId: 'Rudal Superioritas Udara Ramjet BVR (Rafale / Su-57)',
    categoryLabelEn: 'Solid Fuel Ramjet BVR Air Superiority Missile',
    descriptionId: 'Rudal udara-ke-udara bermesin ramjet dengan No-Escape Zone terbesar di dunia (60+ km) untuk dominasi langit total.',
    descriptionEn: 'Ramjet-powered BVR missile featuring the world’s largest No-Escape Zone (>60 km) for complete air dominance.',
    price: 85000000,
    isDefault: false,
    weightLbs: 420,
    missionSuitability: ['CAP', 'STANDOFF'],
    hardpointStations: ['inboard', 'conformal'],
    specs: {
      range: '108 NM (200 km)',
      speed: 'Mach 4.5+ (Sustained Ramjet)',
      guidance: 'Two-Way Datalink + AESA Seeker',
      warhead: 'Blast-Fragmentation Proximity'
    }
  },
  {
    id: 'r73',
    name: 'Vympel R-73 / Archer',
    category: 'air_to_air',
    categoryLabelId: 'Rudal Manuver Tinggi Jarak Dekat Flanker',
    categoryLabelEn: 'High-Off Boresight Agile IR Missile',
    descriptionId: 'Rudal udara-ke-udara jarak pendek standar pesawat Sukhoi Flanker dengan thrust vectoring gas-vanes.',
    descriptionEn: 'Standard high-agility infrared missile for Sukhoi Flanker series with thrust-vectoring gas vanes.',
    price: 18000000,
    isDefault: true,
    weightLbs: 230,
    missionSuitability: ['CAP', 'CAS'],
    hardpointStations: ['wingtip', 'outboard'],
    specs: {
      range: '16 NM (30 km)',
      speed: 'Mach 2.5',
      guidance: 'Cryogenic Infrared (IR)',
      warhead: '16.3 lb Expanding Rod'
    }
  },
  {
    id: 'r77_1',
    name: 'Vympel R-77-1 (RVV-SD)',
    category: 'air_to_air',
    categoryLabelId: 'Rudal Radar Aktif Grid-Fin BVR Flanker',
    categoryLabelEn: 'Grid-Fin Active Radar BVR Missile',
    descriptionId: 'Rudal BVR Sukhoi dengan kisi ekor (grid fins) unik untuk kelincahan ekstrem saat mengejar target supersonik.',
    descriptionEn: 'Sukhoi BVR missile featuring signature lattice grid fins for supreme agility against supersonic bandits.',
    price: 40000000,
    isDefault: false,
    weightLbs: 385,
    missionSuitability: ['CAP', 'STANDOFF'],
    hardpointStations: ['outboard', 'inboard', 'conformal'],
    specs: {
      range: '60 NM (110 km)',
      speed: 'Mach 4.0',
      guidance: 'Active Radar Homing (ARH)',
      warhead: '49 lb Micro-Shaped Charge'
    }
  },

  // --- AIR TO GROUND & PRECISION STRIKE ---
  {
    id: 'gbu12',
    name: 'GBU-12 Paveway II (500 lb)',
    category: 'air_to_ground',
    categoryLabelId: 'Bom Pintar Pemandu Laser Taktis',
    categoryLabelEn: '500 lb Laser-Guided Precision Bomb',
    descriptionId: 'Bom berpemandu laser presisi tinggi dengan sirip sayap pelipat (folding airfoils) untuk dukungan tembakan darat.',
    descriptionEn: 'High-precision semi-active laser-guided bomb designed for surgical CAS strikes on armored vehicles and bunkers.',
    price: 20000000,
    isDefault: true,
    weightLbs: 610,
    missionSuitability: ['CAS', 'STANDOFF'],
    hardpointStations: ['outboard', 'inboard'],
    specs: {
      range: '8 NM (Glide)',
      speed: 'Subsonic Glide',
      guidance: 'Semi-Active Laser (SAL)',
      warhead: '190 lb Tritonal High Explosive'
    }
  },
  {
    id: 'gbu38_jdam',
    name: 'GBU-38 JDAM (500 lb GPS/INS)',
    category: 'air_to_ground',
    categoryLabelId: 'Bom Pintar GPS/INS Segala Cuaca',
    categoryLabelEn: 'All-Weather GPS/INS Guided Bomb',
    descriptionId: 'Joint Direct Attack Munition berpemandu satelit GPS/INS untuk menyerang target darat dalam cuaca buruk atau asap tebal.',
    descriptionEn: 'All-weather autonomous satellite-guided bomb capable of accurate strikes through clouds, smoke, and sandstorms.',
    price: 25000000,
    isDefault: false,
    weightLbs: 590,
    missionSuitability: ['CAS', 'STANDOFF'],
    hardpointStations: ['outboard', 'inboard'],
    specs: {
      range: '15 NM (High Alt Release)',
      speed: 'Free-fall Guided',
      guidance: 'GPS / INS Inertial Guidance',
      warhead: '192 lb High Explosive Blast'
    }
  },
  {
    id: 'gbu31_jdam',
    name: 'GBU-31 JDAM (2,000 lb Bunker Buster)',
    category: 'air_to_ground',
    categoryLabelId: 'Bom Berat Penembus Bunker (Bunker Buster)',
    categoryLabelEn: '2,000 lb Heavy Penetrator Guided Bomb',
    descriptionId: 'Munisi berat penghancur sasaran keras, pangkalan bawah tanah, jembatan strategis, dan instalasi komando musuh.',
    descriptionEn: 'Heavy hardened penetrator weapon tailored for fortified underground bunkers, reinforced bridges, and command hubs.',
    price: 45000000,
    isDefault: false,
    weightLbs: 2115,
    missionSuitability: ['STANDOFF'],
    hardpointStations: ['inboard', 'centerline'],
    specs: {
      range: '15 NM (GPS Glide)',
      speed: 'Penetration Velocity',
      guidance: 'Military GPS / Ring Laser Gyro INS',
      warhead: '945 lb BLU-109 Hardened Steel Case'
    }
  },
  {
    id: 'agm65_mav',
    name: 'AGM-65 Maverick (Anti-Armor / CAS)',
    category: 'air_to_ground',
    categoryLabelId: 'Rudal Anti-Tank & Struktur Presisi Taktis',
    categoryLabelEn: 'Tactical Precision Anti-Armor / CAS Missile',
    descriptionId: 'Rudal elektro-optik/inframerah untuk penghancuran konvoi tank lapis baja, benteng pertahanan, dan kapal patroli cepat.',
    descriptionEn: 'Electro-optical and infrared missile optimized for anti-armor, reinforced structures, and high-speed gunboats.',
    price: 30000000,
    isDefault: false,
    weightLbs: 670,
    missionSuitability: ['CAS', 'MARITIME'],
    hardpointStations: ['outboard', 'inboard'],
    specs: {
      range: '12 NM (22 km)',
      speed: 'Mach 0.95',
      guidance: 'Scene-Lock Optical / IR Tracker',
      warhead: '125 lb Shaped-Charge Penetrator'
    }
  },
  {
    id: 'hydra70',
    name: 'LAU-131 Hydra 70mm Rocket Pod (APKWS)',
    category: 'air_to_ground',
    categoryLabelId: 'Pod Roket 7-Tabung Bantuan Tembakan Dekat',
    categoryLabelEn: '7-Tube Guided Rocket Pod for CAS / COIN',
    descriptionId: 'Pod roket taktis berisi 7 tabung kaliber 70mm dengan sistem panduan laser presisi APKWS (Super Tucano / T-50i / F-16).',
    descriptionEn: 'Lightweight 7-tube 70mm tactical rocket pod with APKWS laser-guided kits for close air support and counter-insurgency.',
    price: 12000000,
    isDefault: false,
    weightLbs: 240,
    missionSuitability: ['CAS'],
    hardpointStations: ['outboard', 'inboard'],
    specs: {
      range: '5 NM (9 km)',
      speed: 'Mach 2.3',
      guidance: 'Semi-Active Laser Guidance (APKWS)',
      warhead: '7x M151 High Explosive Warheads'
    }
  },
  {
    id: 'mk82_bomb',
    name: 'Mk 82 Snakeye (500 lb General Purpose)',
    category: 'air_to_ground',
    categoryLabelId: 'Bom Konvensional Rendah Retardasi (Iron Bomb)',
    categoryLabelEn: '500 lb Low-Drag Free Fall Bomb',
    descriptionId: 'Bom konvensional dengan parasut rem (ballute) untuk pengeboman rendah berkecepatan tinggi tanpa membahayakan pesawat.',
    descriptionEn: 'High-drag retarding tail-fin bomb designed for ultra-low level high-speed bombing runs without fragmentation self-damage.',
    price: 8000000,
    isDefault: true,
    weightLbs: 500,
    missionSuitability: ['CAS'],
    hardpointStations: ['outboard', 'inboard'],
    specs: {
      range: 'Ballistic Drop Range',
      speed: 'Aircraft Release Velocity',
      guidance: 'Unguided Ballistic Trajectory',
      warhead: '192 lb Tritonal Explosive'
    }
  },

  // --- ANTI-SHIP & MARITIME STRIKE ---
  {
    id: 'agm84_harpoon',
    name: 'AGM-84L Harpoon Block II',
    category: 'anti_ship',
    categoryLabelId: 'Rudal Anti-Kapal Permukaan Jarak Jauh',
    categoryLabelEn: 'Over-the-Horizon Maritime Anti-Ship Missile',
    descriptionId: 'Rudal anti-kapal penjelajah permukaan dengan jalur terbang sea-skimming rendah gelombang dan hulu ledak penetrasi kapal.',
    descriptionEn: 'Long-range sea-skimming anti-ship cruise missile designed to defeat warships and coastal naval facilities beyond the horizon.',
    price: 65000000,
    isDefault: false,
    weightLbs: 1160,
    missionSuitability: ['MARITIME', 'STANDOFF'],
    hardpointStations: ['inboard', 'centerline'],
    specs: {
      range: '67 NM (124 km)',
      speed: 'Mach 0.85 (High Subsonic)',
      guidance: 'GPS/INS + Active Radar Seeker',
      warhead: '488 lb Semi-Armor Piercing'
    }
  },
  {
    id: 'exocet_am39',
    name: 'Exocet AM39 Block 2 Mod 2',
    category: 'anti_ship',
    categoryLabelId: 'Rudal Anti-Kapal Skim Laut Dassault Rafale',
    categoryLabelEn: 'Sea-Skimming Naval Strike Missile for Rafale',
    descriptionId: 'Rudal anti-kapal buatan Prancis untuk Rafale dengan ketinggian terbang hanya 2 meter di atas permukaan ombak laut.',
    descriptionEn: 'French air-launched anti-ship missile optimized for Rafale, skimming at 2 meters above sea level to evade ship air defenses.',
    price: 70000000,
    isDefault: false,
    weightLbs: 1480,
    missionSuitability: ['MARITIME'],
    hardpointStations: ['inboard', 'centerline'],
    specs: {
      range: '40 NM (74 km)',
      speed: 'Mach 0.93',
      guidance: 'Inertial + Active J-Band Radar',
      warhead: '364 lb Insensitive Blast-Fragmentation'
    }
  },
  {
    id: 'kh31ad',
    name: 'Kh-31AD Krypton (Supersonic Anti-Ship)',
    category: 'anti_ship',
    categoryLabelId: 'Rudal Anti-Kapal Supersonik Mach 3.5 Flanker',
    categoryLabelEn: 'Mach 3.5 Supersonic Anti-Ship Missile',
    descriptionId: 'Rudal supersonik tempur Sukhoi dengan kecepatan Mach 3.5 untuk menembus sistem pertahanan Aegis kapal induk musuh.',
    descriptionEn: 'Supersonic ramjet missile for Sukhoi Flankers, flying at Mach 3.5 to penetrate dense shipborne CIWS and Aegis defenses.',
    price: 75000000,
    isDefault: false,
    weightLbs: 1345,
    missionSuitability: ['MARITIME'],
    hardpointStations: ['inboard', 'centerline'],
    specs: {
      range: '86 NM (160 km)',
      speed: 'Mach 3.5 (Ramjet)',
      guidance: 'Active Radar Homing',
      warhead: '243 lb Penetrating Blast'
    }
  },
  {
    id: 'brahmos_a',
    name: 'BrahMos-A Supersonic Cruise Missile',
    category: 'anti_ship',
    categoryLabelId: 'Rudal Jelajah Supersonik Strategis (300 km)',
    categoryLabelEn: 'Strategic Mach 3.0 Air-Launched Cruise Missile',
    descriptionId: 'Rudal jelajah supersonik terberat untuk Sukhoi Su-30 dengan hulu ledak kinetik masif penghancur kapal induk.',
    descriptionEn: 'Heavy supersonic cruise missile delivering devastating kinetic and explosive impact against capital naval warships.',
    price: 110000000,
    isDefault: false,
    weightLbs: 5500,
    missionSuitability: ['MARITIME', 'STANDOFF'],
    hardpointStations: ['centerline'],
    specs: {
      range: '162 NM (300 km)',
      speed: 'Mach 3.0',
      guidance: 'Satellite Navigation + Active Radar',
      warhead: '660 lb Semi-Armor Piercing'
    }
  },

  // --- LONG-RANGE STANDOFF & SEAD ---
  {
    id: 'storm_shadow',
    name: 'Storm Shadow / SCALP-EG',
    category: 'long_range',
    categoryLabelId: 'Rudal Jelajah Siluman Jarak Sangat Jauh',
    categoryLabelEn: 'Long-Range Stealth Standoff Cruise Missile',
    descriptionId: 'Rudal jelajah siluman penembus sasaran bernilai tinggi dengan jangkauan 560 km dan hulu ledak ganda BROACH.',
    descriptionEn: 'Deep-strike low-observable cruise missile with 560 km standoff range and tandem BROACH bunker-penetrating warhead.',
    price: 120000000,
    isDefault: false,
    weightLbs: 2870,
    missionSuitability: ['STANDOFF'],
    hardpointStations: ['inboard'],
    specs: {
      range: '302 NM (560 km)',
      speed: 'Mach 0.8',
      guidance: 'TERPROM Terrain Contour + Imaging IR Terminal',
      warhead: '990 lb BROACH Multi-Stage Penetrator'
    }
  },
  {
    id: 'agm158_jassm',
    name: 'AGM-158 JASSM-ER (Stealth Standoff)',
    category: 'long_range',
    categoryLabelId: 'Rudal Jelajah Siluman Presisi 925 km',
    categoryLabelEn: '925 km Extended-Range Stealth Standoff Cruise',
    descriptionId: 'Rudal jelajah siluman berjarak hampir 1,000 km dengan profil radar ultra-rendah untuk serangan pangkalan musuh.',
    descriptionEn: 'Low-observable standoff cruise missile with nearly 1,000 km range designed to neutralize strategic command bases safely.',
    price: 135000000,
    isDefault: false,
    weightLbs: 2250,
    missionSuitability: ['STANDOFF'],
    hardpointStations: ['inboard'],
    specs: {
      range: '500 NM (925 km)',
      speed: 'Mach 0.85',
      guidance: 'Anti-Jam GPS/INS + IIR Automatic Target Recognition',
      warhead: '1,000 lb WDU-42/B Penetrator'
    }
  },
  {
    id: 'agm88_harm',
    name: 'AGM-88E AARGM / HARM (SEAD)',
    category: 'sead',
    categoryLabelId: 'Rudal Anti-Radar Penghancur Pertahanan SAM',
    categoryLabelEn: 'Advanced Anti-Radiation Guided Missile (SEAD)',
    descriptionId: 'Rudal pemburu emisi radar pertahanan udara lawan (Suppression of Enemy Air Defenses) untuk membuka koridor serangan.',
    descriptionEn: 'High-speed anti-radiation missile designed to destroy enemy radar sites and surface-to-air missile (SAM) batteries.',
    price: 55000000,
    isDefault: false,
    weightLbs: 780,
    missionSuitability: ['SEAD', 'CAP'],
    hardpointStations: ['outboard', 'inboard'],
    specs: {
      range: '80 NM (150 km)',
      speed: 'Mach 2.9+',
      guidance: 'Millimeter-Wave Radar + Multi-Mode Passive Homers',
      warhead: '146 lb High-Explosive Tungsten Fragment'
    }
  },
  {
    id: 'kh31p',
    name: 'Kh-31P Anti-Radar (SEAD Krypton)',
    category: 'sead',
    categoryLabelId: 'Rudal Supersonik Pemburu Radar Musuh Flanker',
    categoryLabelEn: 'Mach 3.0 Supersonic Anti-Radiation Missile',
    descriptionId: 'Rudal SEAD berkecepatan supersonik untuk Sukhoi tempur yang melumpuhkan radar peringatan dini dan baterai Patriot musuh.',
    descriptionEn: 'High-speed supersonic anti-radiation weapon used by Sukhoi fighters to neutralize long-range early-warning radars.',
    price: 50000000,
    isDefault: false,
    weightLbs: 1320,
    missionSuitability: ['SEAD'],
    hardpointStations: ['inboard', 'centerline'],
    specs: {
      range: '59 NM (110 km)',
      speed: 'Mach 3.0',
      guidance: 'Broadband Passive Radar Seeker',
      warhead: '192 lb High Explosive'
    }
  },

  // --- RECONNAISSANCE & TARGETING PODS ---
  {
    id: 'sniper_xr',
    name: 'Sniper Advanced Targeting Pod (ATP)',
    category: 'pod',
    categoryLabelId: 'Pod Sensor Pengintai & Penunjuk Laser Elektro-Optik',
    categoryLabelEn: 'Advanced EO/IR Targeting & Recon Pod',
    descriptionId: 'Pod sensor generasi modern dengan FLIR resolusi tinggi, kamera HD-TV, laser designator, dan pelacakan maritim otomatis.',
    descriptionEn: 'State-of-the-art targeting and recon pod featuring third-generation FLIR, HD-TV, and precision laser tracking.',
    price: 40000000,
    isDefault: true,
    weightLbs: 446,
    missionSuitability: ['CAS', 'MARITIME', 'RECON'],
    hardpointStations: ['centerline', 'inboard'],
    specs: {
      range: '40 NM Optical Tracking',
      guidance: 'Dual-Field 3rd Gen FLIR & CCD-TV',
      speed: 'Mach 2.0 Certified',
      warhead: 'Non-Weapon Sensor Array'
    }
  },
  {
    id: 'talios_pod',
    name: 'Thales TALIOS Optronic Pod (Rafale)',
    category: 'pod',
    categoryLabelId: 'Pod Sensor Optronik Jarak Jauh Dassault Rafale',
    categoryLabelEn: 'Thales Long-Range Target Identification Pod',
    descriptionId: 'Pod pengintai dan penanda sasaran terintegrasi untuk Rafale yang mampu memetakan medan tempur 3D secara realtime.',
    descriptionEn: 'High-resolution optronic targeting pod for Rafale providing real-time 3D tactical terrain rendering and deep BDA.',
    price: 50000000,
    isDefault: false,
    weightLbs: 460,
    missionSuitability: ['CAS', 'MARITIME', 'RECON'],
    hardpointStations: ['centerline', 'inboard'],
    specs: {
      range: '50 NM Detection & ID',
      guidance: 'Mid-Wave Infrared & Color HD Sensor',
      speed: 'Supersonic Capable',
      warhead: 'Non-Weapon Sensor Array'
    }
  },

  // --- EXTERNAL FUEL TANKS (VARIED CAPACITIES) ---
  {
    id: 'tank_150gal',
    name: 'Tangki Taktis Centerline (150 Gallons)',
    category: 'fuel_tank',
    categoryLabelId: 'Tangki Avtur Eksternal Kompak (+1,000 lbs)',
    categoryLabelEn: '150 Gal Tactical Centerline Fuel Tank',
    descriptionId: 'Tangki bahan bakar ramping di stasiun centerline tengah untuk manuver lincah dogfight dengan radius tempur ekstra.',
    descriptionEn: 'Streamlined centerline tank providing lightweight endurance extension with minimal aerodynamic drag.',
    price: 10000000,
    isDefault: false,
    weightLbs: 150,
    fuelCapacityGal: 150,
    fuelCapacityLbs: 1000,
    rangeBonusNm: 180,
    missionSuitability: ['CAP', 'CAS', 'FERRY'],
    hardpointStations: ['centerline'],
    specs: {
      range: '+180 NM Radius',
      speed: 'Mach 1.8 Clearance',
      warhead: '150 Gal (1,000 lbs Avtur Jet-A1)'
    }
  },
  {
    id: 'tank_300gal',
    name: 'Tangki Sayap Bawah Taktis (300 Gallons Drop Tank)',
    category: 'fuel_tank',
    categoryLabelId: 'Tangki Sayap Standar Tempur (+2,000 lbs)',
    categoryLabelEn: '300 Gal Underwing Combat Drop Tank',
    descriptionId: 'Tangki standar sepasang sayap bawah untuk patroli tempur udara dan operasi pengamanan perbatasan ZEE.',
    descriptionEn: 'Standard underwing auxiliary drop tanks extending combat air patrol duration over archipelagic borders.',
    price: 18000000,
    isDefault: true,
    weightLbs: 300,
    fuelCapacityGal: 300,
    fuelCapacityLbs: 2000,
    rangeBonusNm: 360,
    missionSuitability: ['CAP', 'MARITIME', 'FERRY'],
    hardpointStations: ['inboard', 'centerline'],
    specs: {
      range: '+360 NM Radius',
      speed: 'Mach 1.6 Clearance',
      warhead: '300 Gal (2,000 lbs Avtur Jet-A1)'
    }
  },
  {
    id: 'tank_370gal',
    name: 'Tangki Tempur Jarak Jauh (370 Gallons Long-Range)',
    category: 'fuel_tank',
    categoryLabelId: 'Tangki Sayap Kapasitas Tinggi (+2,500 lbs)',
    categoryLabelEn: '370 Gal Long-Range Underwing Drop Tank',
    descriptionId: 'Tangki bahan bakar eksternal kapasitas besar untuk misi penyerangan jarak jauh dan pengawalan VVIP lintas pulau.',
    descriptionEn: 'High-capacity auxiliary fuel tanks built for trans-island escort sorties and deep maritime strike sweeps.',
    price: 28000000,
    isDefault: false,
    weightLbs: 380,
    fuelCapacityGal: 370,
    fuelCapacityLbs: 2500,
    rangeBonusNm: 520,
    missionSuitability: ['MARITIME', 'STANDOFF', 'FERRY'],
    hardpointStations: ['inboard'],
    specs: {
      range: '+520 NM Radius',
      speed: 'Mach 1.5 Clearance',
      warhead: '370 Gal (2,500 lbs Avtur Jet-A1)'
    }
  },
  {
    id: 'tank_600gal',
    name: 'Tangki Heavy Ferry Strategis (600 Gallons Super-Tank)',
    category: 'fuel_tank',
    categoryLabelId: 'Tangki Ekstra Berat Penerbangan Ferry (+4,000 lbs)',
    categoryLabelEn: '600 Gal Strategic Heavy Ferry Fuel Tank',
    descriptionId: 'Tangki ekstra masif 600 galon untuk relokasi pangkalan antar pulau terjauh (Sabang sampai Merauke) tanpa perlu air refuel.',
    descriptionEn: 'Massive 600-gallon ferry drop tank enabling non-stop trans-archipelagic deployment without tanker rendezvous.',
    price: 45000000,
    isDefault: false,
    weightLbs: 550,
    fuelCapacityGal: 600,
    fuelCapacityLbs: 4000,
    rangeBonusNm: 850,
    missionSuitability: ['FERRY', 'STANDOFF'],
    hardpointStations: ['inboard', 'centerline'],
    specs: {
      range: '+850 NM Radius',
      speed: 'Mach 1.2 Subsonic Cruise',
      warhead: '600 Gal (4,000 lbs Avtur Jet-A1)'
    }
  },
  {
    id: 'tank_cft_450',
    name: 'Conformal Fuel Tanks (CFT 450 Gal Fuselage Packs)',
    category: 'fuel_tank',
    categoryLabelId: 'Tangki Konformal Badan Pesawat (Zero Drag Penalty)',
    categoryLabelEn: 'Conformal Fuel Tanks (CFT) Aerodynamic Pack',
    descriptionId: 'Tangki konformal yang menempel menyatu di punggung badan pesawat. Menambah 3,000 lbs bahan bakar tanpa mengurangi slot hardpoint sayap!',
    descriptionEn: 'Fuselage-hugging conformal fuel tanks adding 3,000 lbs of fuel with zero station blockage and negligible drag.',
    price: 60000000,
    isDefault: false,
    weightLbs: 350,
    fuelCapacityGal: 450,
    fuelCapacityLbs: 3000,
    rangeBonusNm: 650,
    missionSuitability: ['CAP', 'CAS', 'MARITIME', 'STANDOFF', 'FERRY'],
    hardpointStations: ['conformal'],
    specs: {
      range: '+650 NM Radius',
      speed: 'Full Envelope Mach 2.0',
      warhead: '450 Gal (3,000 lbs Internal Boost)'
    }
  }
];

export const AIRCRAFT_GENERATION_UPGRADE_CATALOG: AircraftGenerationUpgrade[] = [
  {
    id: 'gen_4_5_viper',
    targetGeneration: '4.5',
    generationBadge: 'GEN 4.5 eMLU+ VIPER',
    titleId: 'Modernisasi Generasi 4.5 (eMLU Block 70 Viper Standard)',
    titleEn: 'Generation 4.5 Modernization (Block 70 Viper Standard)',
    targetNameSuffix: 'Block 70 Viper eMLU',
    descriptionId: 'Peningkatan radar AESA APG-83 SABR, kokpit kaca layar sentuh CPD, Link-16 Tactical Network, dan pod ECM mutakhir.',
    descriptionEn: 'Upgrade with APG-83 SABR AESA radar, Center Pedestal Display glass cockpit, Link-16, and integrated ECM suite.',
    cost: 120000000, // Rp 120 Juta
    requiredRank: 'Kapten Pnb',
    requiredRankLevel: 3,
    minFlightHours: 25.0,
    requiredHangarLevel: 2,
    statBoosts: {
      maxSpeed: 'Mach 2.05 (+0.05 Mach)',
      cruiseSpeedBoost: 30, // +30 kts
      rangeBoost: '+450 NM',
      ceiling: '52,000 ft (+2,000 ft)',
      radarType: 'APG-83 SABR AESA Active Electronically Scanned Array',
      stealthRCS: 'Reduced RCS Radar Baffle Treatment',
      gLimits: '+9.0G Sustained'
    },
    keyFeatures: [
      'Radar AESA APG-83 (Deteksi 160 NM)',
      'Center Pedestal Glass Cockpit & Link-16',
      'Auto GCAS (Ground Collision Avoidance)',
      'ALQ-211(V)9 Integrated ECM & Jammer'
    ]
  },
  {
    id: 'gen_4_plus_plus_omnirole',
    targetGeneration: '4++',
    generationBadge: 'GEN 4++ SUPER OMNIROLE',
    titleId: 'Modernisasi Generasi 4++ (Super Omnirole & Thrust Vectoring)',
    titleEn: 'Generation 4++ Super Omnirole Modernization',
    targetNameSuffix: 'Super Omnirole F4+',
    descriptionId: 'Integrasi mesin 3D Thrust Vectoring Turbines untuk kelincahan post-stall, sistem optronik SPECTRA, dan radar RBE2 AESA 3D.',
    descriptionEn: 'Integration of 3D Thrust Vectoring Turbines, SPECTRA optronic defense, and RBE2 3D multi-target AESA radar.',
    cost: 250000000, // Rp 250 Juta
    requiredRank: 'Mayor Pnb',
    requiredRankLevel: 4,
    minFlightHours: 50.0,
    requiredHangarLevel: 3,
    statBoosts: {
      maxSpeed: 'Mach 2.25 (+0.25 Mach)',
      cruiseSpeedBoost: 50,
      rangeBoost: '+650 NM',
      ceiling: '58,000 ft (+6,000 ft)',
      radarType: 'Thales RBE2 / Irbis-E Hybrid Quantum AESA',
      stealthRCS: 'Frontal RCS < 0.1 m² (Semi-Stealth)',
      gLimits: '+10.5G Super-Maneuverable'
    },
    keyFeatures: [
      'Nozel Mesin 3D Thrust Vectoring (Maneuver Cobra)',
      'Sistem Pertahanan Terintegrasi SPECTRA 360°',
      'Integrasi Rudal MBDA Meteor & SCALP-EG',
      'Conformal Fuel Tanks (CFT) Built-in Integration'
    ]
  },
  {
    id: 'gen_5_stealth_dominance',
    targetGeneration: '5.0',
    generationBadge: 'GEN 5.0 STEALTH DOMINANCE',
    titleId: 'Konversi Generasi 5.0 (Stealth VLO Air Dominance)',
    titleEn: 'Generation 5.0 Stealth Air Dominance Conversion',
    targetNameSuffix: 'Stealth Air Dominance (VLO)',
    descriptionId: 'Pelapisan Radar-Absorbing Material (RAM Gen 5), ruang senjata internal bertekanan pneumatik, sensor 360 DAS, dan Supercruise tanpa afterburner.',
    descriptionEn: 'Radar-Absorbing Material (RAM Gen 5), internal weapons bays, 360 Distributed Aperture System (DAS), and dry Supercruise.',
    cost: 500000000, // Rp 500 Juta
    requiredRank: 'Letkol Pnb',
    requiredRankLevel: 5,
    minFlightHours: 100.0,
    requiredHangarLevel: 3,
    statBoosts: {
      maxSpeed: 'Mach 2.25 (Mach 1.6 Dry Supercruise)',
      cruiseSpeedBoost: 80,
      rangeBoost: '+900 NM',
      ceiling: '65,000 ft (+15,000 ft)',
      radarType: 'AN/APG-81 / N036 Byelka Multi-Band Stealth AESA',
      stealthRCS: 'Very Low Observable (RCS < 0.001 m²)',
      gLimits: '+9.5G Fly-by-Light Optical Control'
    },
    keyFeatures: [
      'Radar Absorbing Material (RAM) Generasi 5',
      'Internal Weapons Bay (Siluman Radar Total)',
      '360° Electro-Optical DAS & Helmet Display Gen 3',
      'Dry Supercruise Mach 1.6 (Hemat Bahan Bakar)'
    ]
  },
  {
    id: 'gen_6_ngad_loyal_wingman',
    targetGeneration: '6.0',
    generationBadge: 'GEN 6.0 NGAD & AI WINGMAN',
    titleId: 'Evolusi Generasi 6.0 (Next-Gen Air Dominance & Loyal Wingman AI)',
    titleEn: 'Generation 6.0 NGAD & Autonomous AI Swarm Evolution',
    targetNameSuffix: 'NGAD Cyber-Dominance',
    descriptionId: 'Propulsi Adaptive Cycle Turbofan (ACE), pertahanan laser Direct Energy Weapon (DEW), dan komando swarm drone tempur otonom Loyal Wingman.',
    descriptionEn: 'Adaptive Cycle Turbofan (ACE), Directed Energy Weapon (DEW) laser pod, and autonomous AI Loyal Wingman swarm command.',
    cost: 850000000, // Rp 850 Juta
    requiredRank: 'Kolonel Pnb',
    requiredRankLevel: 6,
    minFlightHours: 180.0,
    requiredHangarLevel: 4,
    statBoosts: {
      maxSpeed: 'Mach 2.80 (Mach 2.0 Dry Supercruise)',
      cruiseSpeedBoost: 120,
      rangeBoost: '+1,400 NM',
      ceiling: '72,000 ft (Near-Space Suborbital)',
      radarType: 'Cognitive Quantum-Resistant Multi-Domain Sensor Array',
      stealthRCS: 'Broadband All-Aspect Stealth (RCS < 0.0001 m²)',
      gLimits: '+12.0G Neural Interface Bio-G'
    },
    keyFeatures: [
      'Mesin Adaptive Cycle Turbofan (Efisiensi +40%)',
      'Loyal Wingman AI Drone Swarm Tactical Link',
      'High-Energy Laser Pod (DEW) Anti-Missile Defense',
      'Quantum-Encrypted Cyber & Multi-Domain Mesh C2'
    ]
  }
];

export const HANGAR_LEVELS: FacilityState[] = [
  {
    level: 1,
    capacity: 2,
    maxLevel: 4,
    upgradeCost: 80000000,
    titleId: 'Hanggar Taktis Standar (Level 1)',
    titleEn: 'Standard Tactical Hangar (Level 1)',
    descriptionId: 'Fasilitas 1 bay perawatan tertutup dengan overhead crane manual dan toolset standar.',
    descriptionEn: 'Single enclosed maintenance bay with manual overhead crane and standard toolsets.',
    features: ['Kapasitas 2 Pesawat', '1x Overhead Crane (5 Ton)', 'Panel Diagnostik Standar', 'Climate Control Dasar']
  },
  {
    level: 2,
    capacity: 4,
    maxLevel: 4,
    upgradeCost: 160000000,
    titleId: 'Hanggar Ganda Diperluas (Level 2)',
    titleEn: 'Expanded Dual Hangar Bay (Level 2)',
    descriptionId: 'Fasilitas 2 bay perawatan komprehensif dengan rig diagnostik digital dan paint shop.',
    descriptionEn: 'Dual-bay maintenance facility with digital diagnostic rigs and climate-controlled paint shop.',
    features: ['Kapasitas 4 Pesawat', 'Automated Diagnostic Rigs', 'Climate-Controlled Paint Shop', 'Speed Servis +25%']
  },
  {
    level: 3,
    capacity: 6,
    maxLevel: 4,
    upgradeCost: 300000000,
    titleId: 'Depot Pemeliharaan Berat (Level 3)',
    titleEn: 'Heavy Maintenance Depot (Level 3)',
    descriptionId: 'Depot pemeliharaan tingkat lanjut dengan engine test cell dan bengkel komposit.',
    descriptionEn: 'Advanced maintenance depot with dedicated jet engine test cell and carbon-composite workshop.',
    features: ['Kapasitas 6 Pesawat', 'Jet Engine Test Cell', 'Full Composite Repair Bay', 'Auto Overhaul Support']
  },
  {
    level: 4,
    capacity: 10,
    maxLevel: 4,
    upgradeCost: 0,
    titleId: 'Kompleks Super Hanggar Strategis (Level 4 - MAX)',
    titleEn: 'Strategic Super Hangar Complex (Level 4 - MAX)',
    descriptionId: 'Kompleks hanggar multi-bay terintegrasi dengan inspeksi robotik dan fasilitas kelaikan penuh.',
    descriptionEn: 'Integrated multi-bay master hangar complex with automated robotic gantry inspections.',
    features: ['Kapasitas 10 Pesawat', 'Robotics Laser Inspection', 'Armored Hardened Shelter', 'Zero-Downtime Turnaround']
  }
];

export const APRON_LEVELS: FacilityState[] = [
  {
    level: 1,
    capacity: 2,
    maxLevel: 4,
    upgradeCost: 60000000,
    titleId: 'Apron Parkir Tarmac Dasar (Level 1)',
    titleEn: 'Standard Apron Hardstand (Level 1)',
    descriptionId: 'Dua hardstand parkir pesawat dengan jalur mobil tangki avtur bergerak.',
    descriptionEn: 'Two standard aircraft hardstands with mobile fuel bowser service lines.',
    features: ['Kapasitas 2 Pesawat', '2x Hardstand Beton Tebal', 'Mobile Fuel Bowser Access', 'Penerangan Tarmac Standar']
  },
  {
    level: 2,
    capacity: 4,
    maxLevel: 4,
    upgradeCost: 120000000,
    titleId: 'Apron Taktis Hydrant (Level 2)',
    titleEn: 'Tactical Hydrant Apron (Level 2)',
    descriptionId: 'Empat hardstand tugas berat dengan sistem pipa bahan bakar bawah tanah (hydrant).',
    descriptionEn: 'Four heavy-duty hardstands with underground fuel hydrant pits and blast deflector fences.',
    features: ['Kapasitas 4 Pesawat', 'Underground Hydrant Fueling', 'Blast Deflector Fences', 'Waktu Refuel -40%']
  },
  {
    level: 3,
    capacity: 6,
    maxLevel: 4,
    upgradeCost: 250000000,
    titleId: 'Apron Scramble Siaga 1 (Level 3)',
    titleEn: 'Alert-1 Rapid Scramble Apron (Level 3)',
    descriptionId: 'Enam hardstand dengan menara lampu LED sorot tinggi dan pad siap sergap 5 menit.',
    descriptionEn: 'Six scramble-ready hardstands with high-mast LED towers and dedicated 5-minute alert pad.',
    features: ['Kapasitas 6 Pesawat', 'High-Mast LED Night Towers', 'Dedicated Scramble Pad', 'Line-up Time -50%']
  },
  {
    level: 4,
    capacity: 10,
    maxLevel: 4,
    upgradeCost: 0,
    titleId: 'Master Strategic Tarmac Complex (Level 4 - MAX)',
    titleEn: 'Master Strategic Tarmac Complex (Level 4 - MAX)',
    descriptionId: 'Kompleks apron strategis berdaya tampung tinggi dengan akses langsung high-speed taxiway.',
    descriptionEn: 'Master strategic tarmac with high-speed taxiway direct access and automated dispatching.',
    features: ['Kapasitas 10 Pesawat', 'High-Speed Taxiway Access', 'Central Ground Power Bus', 'Rapid Fleet Deployment']
  }
];

export const AIRCRAFT_PROCUREMENT_CATALOG = [
  {
    presetId: 'hawk-209',
    price: 280000000,
    roleId: 'Pesawat Tempur Taktis Ringan & Serang Darat (Hawk 109/209)',
    roleEn: 'Light Tactical Fighter & Ground Attack Hawk 109/209',
    includedCrewCount: 9,
    recommendedFor: 'Skadron Udara 1'
  },
  {
    presetId: 'f16-emlu',
    price: 450000000,
    roleId: 'Pesawat Tempur Sergap Supersonik (Air Superiority)',
    roleEn: 'Supersonic Air Superiority Fighter',
    includedCrewCount: 11,
    recommendedFor: 'Skadron Udara 3'
  },
  {
    presetId: 'f16-cd',
    price: 500000000,
    roleId: 'Pesawat Tempur Multi-Role Block 52ID',
    roleEn: 'Multi-Role Combat Fighter Block 52ID',
    includedCrewCount: 11,
    recommendedFor: 'Skadron Udara 14'
  },
  {
    presetId: 'su27',
    price: 650000000,
    roleId: 'Pesawat Tempur Berat Sukhoi Flanker (Heavy Air Superiority)',
    roleEn: 'Heavy Air Superiority Fighter Su-27',
    includedCrewCount: 12,
    recommendedFor: 'Skadron Udara 11'
  },
  {
    presetId: 'su30',
    price: 750000000,
    roleId: 'Pesawat Tempur Berat Dua Awak (Heavy Strike Flanker)',
    roleEn: 'Twin-Seat Heavy Strike Fighter Su-30',
    includedCrewCount: 12,
    recommendedFor: 'Skadron Udara 11'
  },
  {
    presetId: 'rafale',
    price: 950000000,
    roleId: 'Pesawat Tempur Omnirole Generasi 4.5 Dassault Rafale',
    roleEn: 'Omnirole 4.5 Gen Fighter Dassault Rafale',
    includedCrewCount: 11,
    recommendedFor: 'Skadron Udara 12'
  },
  {
    presetId: 'super-tucano',
    price: 250000000,
    roleId: 'Pesawat Tempur Taktis Ringan & Anti-Gerilya (COIN / CAS)',
    roleEn: 'Light Attack & Counter-Insurgency Turboprop',
    includedCrewCount: 9,
    recommendedFor: 'Skadron Udara 21'
  },
  {
    presetId: 't50i',
    price: 350000000,
    roleId: 'Fighter Lead-In Trainer & Tempur Ringan T-50i',
    roleEn: 'Lead-In Fighter Trainer & Light Attack T-50i',
    includedCrewCount: 10,
    recommendedFor: 'Skadron Udara 15'
  },
  {
    presetId: 'c130',
    price: 800000000,
    roleId: 'Pesawat Angkut Berat Taktis C-130J Super Hercules',
    roleEn: 'Heavy Tactical Airlifter C-130J',
    includedCrewCount: 14,
    recommendedFor: 'Skadron Udara 31 / 32'
  },
  {
    presetId: 'cn235',
    price: 380000000,
    roleId: 'Pesawat Angkut Sedang & Patroli Maritim CN-235',
    roleEn: 'Medium Tactical Transport & MPA',
    includedCrewCount: 11,
    recommendedFor: 'Skadron Udara 2 / 5'
  },
  {
    presetId: 'b737-mpm',
    price: 600000000,
    roleId: 'Pesawat Pengintai Maritim & Pengawasan Radar ZEE',
    roleEn: 'Strategic Maritime Patrol & Radar Surveillance',
    includedCrewCount: 14,
    recommendedFor: 'Skadron Udara 5'
  },
  {
    presetId: 'super-puma',
    price: 320000000,
    roleId: 'Helikopter SAR Tempur & Mobilisasi Pasukan NAS-332',
    roleEn: 'Combat SAR & Tactical Rotary Transport',
    includedCrewCount: 10,
    recommendedFor: 'Skadron Udara 6 / 8'
  },
  {
    presetId: 'f35',
    price: 1300000000,
    roleId: 'Pesawat Tempur Siluman Generasi ke-5 F-35 Lightning II',
    roleEn: '5th Generation Stealth Multirole Fighter',
    includedCrewCount: 12,
    recommendedFor: 'Komando Tempur Utama'
  },
  {
    presetId: 'f22',
    price: 1600000000,
    roleId: 'Pesawat Tempur Superioritas Udara Siluman F-22 Raptor',
    roleEn: '5th Gen Air Dominance Stealth Fighter',
    includedCrewCount: 12,
    recommendedFor: 'Komando Tempur Utama'
  },
  {
    presetId: 'su57',
    price: 1450000000,
    roleId: 'Pesawat Tempur Siluman Superioritas Sukhoi Su-57 Felon',
    roleEn: '5th Gen Heavy Stealth Fighter Su-57',
    includedCrewCount: 12,
    recommendedFor: 'Komando Tempur Utama'
  }
];

export function generateTailNumber(aircraft: Aircraft, existingCount: number, squadronName: string): string {
  const acId = aircraft.id.toLowerCase();
  let prefix = 'TS-16';

  if (acId.includes('hawk')) {
    prefix = 'TT-02';
  } else if (acId.includes('f16-emlu') || acId.includes('f16-cd') || acId.includes('f16')) {
    prefix = squadronName.includes('14') ? 'TS-52' : 'TS-16';
  } else if (acId.includes('su27')) {
    prefix = 'TS-27';
  } else if (acId.includes('su30')) {
    prefix = 'TS-30';
  } else if (acId.includes('su57')) {
    prefix = 'TS-57';
  } else if (acId.includes('rafale')) {
    prefix = 'TS-40';
  } else if (acId.includes('super-tucano') || acId.includes('tucano')) {
    prefix = 'TT-31';
  } else if (acId.includes('t50') || acId.includes('golden-eagle')) {
    prefix = 'TT-50';
  } else if (acId.includes('c130') || acId.includes('hercules')) {
    prefix = 'A-13';
  } else if (acId.includes('c212')) {
    prefix = 'A-21';
  } else if (acId.includes('cn235')) {
    prefix = 'A-23';
  } else if (acId.includes('b737') || acId.includes('737')) {
    prefix = 'A-73';
  } else if (acId.includes('falcon-8x') || acId.includes('falcon')) {
    prefix = 'A-08';
  } else if (acId.includes('super-puma') || acId.includes('puma') || acId.includes('caracal')) {
    prefix = 'H-32';
  } else if (acId.includes('f22')) {
    prefix = 'AF-22';
  } else if (acId.includes('f35')) {
    prefix = 'AF-35';
  } else if (acId.includes('a10')) {
    prefix = 'OA-10';
  } else if (acId.includes('indonesia-one')) {
    prefix = 'A-00';
  }

  const serial = String(existingCount + 1).padStart(2, '0');
  return `${prefix}${serial}`;
}

export function createDefaultOwnedAircraft(selectedAircraft: Aircraft, squadronName: string): OwnedAircraft {
  const tail = generateTailNumber(selectedAircraft, 0, squadronName);
  return {
    id: `owned-${selectedAircraft.id}-${tail}`,
    tailNumber: tail,
    aircraft: selectedAircraft,
    flightHours: 342.5,
    health: {
      airframe: 100,
      engine: 100,
      hydraulics: 100,
      avionics: 100,
      fuelSystem: 100
    },
    status: {
      code: 'READY',
      labelId: 'SIAP TEMPUR (COMBAT READY)',
      labelEn: 'COMBAT READY',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    purchasePrice: 0,
    purchasedAt: Date.now()
  };
}

export function createDefaultCrewRoster(pilotName: string, callSign: string): SquadronCrewRoster {
  return {
    flightCrew: {
      count: 2,
      pilot: pilotName || 'Mayor Pnb Adhiatma',
      coPilot: 'Mayor Pnb Bima Perkasa (WSO)',
      callSign: callSign || 'LEADER-01'
    },
    groundCrew: {
      nameId: 'Kru Darat Lapangan (Marshaller & Line)',
      nameEn: 'Ground Marshalling & Line Crew',
      count: 4,
      level: 1,
      costPerUpgrade: 25000000,
      descriptionId: 'Marshaller, Chock & Pin handlers, Towing tractor operator, dan Line safety guard.',
      descriptionEn: 'Marshallers, chock & pin crew, tractor operators, and safety marshals.',
      role: 'Line Handling & Aircraft Dispatch'
    },
    technicians: {
      nameId: 'Kru Teknisi Mesin & Struktur (Skatek)',
      nameEn: 'Aircraft Maintenance Technicians',
      count: 3,
      level: 1,
      costPerUpgrade: 40000000,
      descriptionId: 'Airframe & Powerplant (A&P) specialists, Jet turbine inspectors, dan Hydraulic mechanics.',
      descriptionEn: 'A&P specialists, jet engine inspectors, and hydraulic mechanics.',
      role: 'Engine Diagnostics & Airframe Repair'
    },
    fuelCrew: {
      nameId: 'Kru Pengisian Avtur (Refueling Team)',
      nameEn: 'Aviation Fuel Bowser Crew',
      count: 2,
      level: 1,
      costPerUpgrade: 20000000,
      descriptionId: 'Bowser fuel truck operators, Fuel hydrometer analysts, dan Hot-pit refuelers.',
      descriptionEn: 'Fuel bowser operators, hydrometer analysts, and hot-pit refueling crew.',
      role: 'Fuel Loading & Purity Quality Check'
    },
    electricCrew: {
      nameId: 'Kru Elektrik, GPU & Persenjataan (Armament)',
      nameEn: 'Electric GPU & Ordnance Crew',
      count: 2,
      level: 1,
      costPerUpgrade: 35000000,
      descriptionId: 'Ground Power Unit (115V 400Hz) operators, Radar AESA calibrators, dan Missile ordnance loaders.',
      descriptionEn: 'Ground power technicians, radar calibrators, and weapons ordnance loaders.',
      role: 'Electrical Power, Avionics & Weapons'
    }
  };
}

// REAL-WORLD MILITARY AVIATION STAFF RATIOS PER FIGHTER AIRCRAFT
export const REAL_CREW_REQUIREMENTS_PER_AIRCRAFT = {
  pilots: 2, // 1 PIC + 1 WSO / Wingman rotation
  groundCrew: 3, // Marshaller, Towing, Line Safety
  technicians: 4, // Airframe, Turbofan Engine, Hydraulics, Avionics
  fuelCrew: 2, // Bowser Truck & Quality Hydrometer
  electricCrew: 2, // 115V 400Hz GPU & Munitions Loader
  totalRequiredPerPlane: 13
};

// Calculate Squadron Crew Support Capacity & Workload
export function calculateSquadronCrewCapacity(roster: SquadronCrewRoster, activeFleetCount: number) {
  const pilotCap = Math.floor((roster.flightCrew?.count || 2) / REAL_CREW_REQUIREMENTS_PER_AIRCRAFT.pilots);
  const groundCap = Math.floor((roster.groundCrew?.count || 4) / REAL_CREW_REQUIREMENTS_PER_AIRCRAFT.groundCrew);
  const techCap = Math.floor((roster.technicians?.count || 3) / REAL_CREW_REQUIREMENTS_PER_AIRCRAFT.technicians);
  const fuelCap = Math.floor((roster.fuelCrew?.count || 2) / REAL_CREW_REQUIREMENTS_PER_AIRCRAFT.fuelCrew);
  const electricCap = Math.floor((roster.electricCrew?.count || 2) / REAL_CREW_REQUIREMENTS_PER_AIRCRAFT.electricCrew);

  // Maximum aircraft that can be simultaneously serviced and flight-cleared
  const effectiveMaxHandlingCapacity = Math.max(1, Math.min(pilotCap, groundCap, techCap, fuelCap, electricCap));
  
  // Workload Ratio (100% = balanced, >100% = overburdened)
  const requiredTotalPersonnel = activeFleetCount * REAL_CREW_REQUIREMENTS_PER_AIRCRAFT.totalRequiredPerPlane;
  const currentTotalPersonnel = (roster.flightCrew?.count || 2) + 
    (roster.groundCrew?.count || 0) + 
    (roster.technicians?.count || 0) + 
    (roster.fuelCrew?.count || 0) + 
    (roster.electricCrew?.count || 0);

  const readinessPercent = Math.min(100, Math.round((currentTotalPersonnel / Math.max(1, requiredTotalPersonnel)) * 100));
  const isOverburdened = activeFleetCount > effectiveMaxHandlingCapacity;

  const bottlenecks: string[] = [];
  if (pilotCap < activeFleetCount) bottlenecks.push(`Penerbang (${roster.flightCrew?.count || 2}/${activeFleetCount * 2})`);
  if (groundCap < activeFleetCount) bottlenecks.push(`Kru Darat (${roster.groundCrew?.count || 0}/${activeFleetCount * 3})`);
  if (techCap < activeFleetCount) bottlenecks.push(`Teknisi (${roster.technicians?.count || 0}/${activeFleetCount * 4})`);
  if (fuelCap < activeFleetCount) bottlenecks.push(`Kru Avtur (${roster.fuelCrew?.count || 0}/${activeFleetCount * 2})`);
  if (electricCap < activeFleetCount) bottlenecks.push(`Kru Listrik/Senjata (${roster.electricCrew?.count || 0}/${activeFleetCount * 2})`);

  return {
    effectiveMaxHandlingCapacity,
    readinessPercent,
    isOverburdened,
    bottlenecks,
    pilotCap,
    groundCap,
    techCap,
    fuelCap,
    electricCap,
    currentTotalPersonnel,
    requiredTotalPersonnel
  };
}

// Calculate allowed concurrent missions based on available fleet and crew support capacity
export function getSquadronMissionCapacity(playerProfile?: PlayerProfile | null) {
  try {
    let squadronId = 'sq1';
    if (playerProfile?.squadron) {
      const matchById = PLAYABLE_SQUADRONS.find(s => s.id.toLowerCase() === playerProfile.squadron.toLowerCase());
      if (matchById) {
        squadronId = matchById.id;
      } else {
        const matchByName = PLAYABLE_SQUADRONS.find(
          s => s.name.toLowerCase().includes(playerProfile.squadron.toLowerCase()) || 
               playerProfile.squadron.toLowerCase().includes(s.name.toLowerCase())
        );
        if (matchByName) squadronId = matchByName.id;
      }
    } else {
      const activeSaved = localStorage.getItem('ais_active_squadron_id');
      if (activeSaved) squadronId = activeSaved;
    }

    const storageKey = `ais_sq_state_${squadronId}`;
    let fleetCount = 3;
    const savedFleet = localStorage.getItem(`${storageKey}_owned_fleet`);
    if (savedFleet) {
      const parsed = JSON.parse(savedFleet);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const readyAircraft = parsed.filter(a => (a.readinessStatus === 'ready' || a.readinessStatus === 'maintenance') && (a.operationalReadiness ?? 100) >= 15);
        fleetCount = Math.max(3, readyAircraft.length > 0 ? readyAircraft.length : parsed.length);
      }
    }

    let roster = createDefaultCrewRoster(playerProfile?.commanderName || 'Komandan Skuadron', 'GARUDA-01');
    const savedRoster = localStorage.getItem(`${storageKey}_crew_roster`);
    if (savedRoster) {
      const parsed = JSON.parse(savedRoster);
      if (parsed?.groundCrew) roster = parsed;
    }

    const capacityAnalysis = calculateSquadronCrewCapacity(roster, fleetCount);
    // Allowed concurrent missions: bounded by available ready aircraft and crew support (min 3 for operational wing)
    const maxConcurrentMissions = Math.max(3, Math.min(fleetCount, capacityAnalysis.effectiveMaxHandlingCapacity));

    return {
      maxConcurrentMissions,
      fleetCount,
      crewCapacity: capacityAnalysis.effectiveMaxHandlingCapacity,
      readinessPercent: capacityAnalysis.readinessPercent,
      isOverburdened: capacityAnalysis.isOverburdened,
      bottlenecks: capacityAnalysis.bottlenecks
    };
  } catch (e) {
    return {
      maxConcurrentMissions: 2,
      fleetCount: 2,
      crewCapacity: 2,
      readinessPercent: 100,
      isOverburdened: false,
      bottlenecks: []
    };
  }
}

// TRAINING ACADEMY COURSES (SEKOLAH PENERBANG & WING DIKLAT TEKNIK)
export const MILITARY_TRAINING_COURSES: TrainingCourse[] = [
  // --- PILOT TRAINING COURSES ---
  {
    id: 'pilot_bvr_tactics',
    targetType: 'pilot',
    titleId: 'Taktik Tempur BVR & Link-16 Datalink',
    titleEn: 'BVR Air Combat Tactics & Link-16',
    descriptionId: 'Latihan skenario Beyond Visual Range, peluncuran rudal AMRAAM/Meteor multi-target, dan integrasi situational awareness Link-16.',
    descriptionEn: 'Beyond-Visual-Range tactics, multi-target AMRAAM/Meteor launches, and Link-16 situational awareness integration.',
    durationSeconds: 16,
    cost: 35000000,
    statBoost: {
      ratingGain: 0.5,
      specializationBadge: 'BVR Air Superiority',
      description: 'Meningkatkan akurasi BVR radar lock dan rating pilot +0.5 Bintang.'
    }
  },
  {
    id: 'pilot_night_intercept',
    targetType: 'pilot',
    titleId: 'Intersepsi Malam & NVG All-Weather',
    titleEn: 'Night NVG Intercept & All-Weather Ops',
    descriptionId: 'Kualifikasi terbang malam dengan Night Vision Goggles (NVG) dan manuver sergap dalam cuaca badai tropis monsun.',
    descriptionEn: 'Night Vision Goggle qualification and all-weather tactical intercept in adverse tropical storms.',
    durationSeconds: 18,
    cost: 40000000,
    statBoost: {
      ratingGain: 0.6,
      specializationBadge: 'Night Ops',
      description: 'Kesiapan sortie malam hari 100% dan rating pilot +0.6 Bintang.'
    }
  },
  {
    id: 'pilot_high_g_dogfight',
    targetType: 'pilot',
    titleId: 'Master Dogfight WVR & High-G (+9.0G)',
    titleEn: 'High-G Dogfight Mastery (+9.0G Combat)',
    descriptionId: 'Pelatihan manuver ekstrem High-Yo-Yo, Scissors, dan ketahanan anti-G blackout hingga +9.0G dalam dogfight jarak dekat.',
    descriptionEn: 'High-Yo-Yo, scissors maneuvers, and high-G tolerance conditioning up to +9.0G in WVR dogfights.',
    durationSeconds: 20,
    cost: 48000000,
    statBoost: {
      ratingGain: 0.8,
      specializationBadge: 'Dogfight Ace',
      description: 'Ketahanan G-Force maksimum (+9.5G) dan rating pilot +0.8 Bintang.'
    }
  },
  {
    id: 'pilot_precision_strike_wso',
    targetType: 'pilot',
    titleId: 'Kualifikasi Serangan Presisi CAS & Laser Pod',
    titleEn: 'Precision Strike CAS & Targeting Pod Qualification',
    descriptionId: 'Sertifikasi pengoperasian Sniper XR / Damocles pod, panduan bom pintar JDAM/GBU-12, dan close air support terkoordinasi.',
    descriptionEn: 'Targeting pod operations, laser/GPS guided munitions drop, and close air support coordination.',
    durationSeconds: 15,
    cost: 38000000,
    statBoost: {
      ratingGain: 0.5,
      specializationBadge: 'Precision Strike CAS',
      description: 'Efektivitas serang darat +35% dan rating WSO/Pilot +0.5 Bintang.'
    }
  },

  // --- TECHNICIAN & CREW COURSES ---
  {
    id: 'crew_fast_turnaround',
    targetType: 'ground',
    titleId: 'Hot-Pit Refueling & Fast Turnaround Standar NATO/TNI',
    titleEn: 'Hot-Pit Refueling & Rapid Turnaround',
    descriptionId: 'Pengisian bahan bakar dan persenjataan ulang dengan mesin jet tetap menyala (hot-pit) untuk respon scramble 5 menit.',
    descriptionEn: 'Live engine hot-pit refueling and quick turnaround rearming for 5-minute alert scramble.',
    durationSeconds: 12,
    cost: 25000000,
    statBoost: {
      ratingGain: 0.5,
      efficiencyBonus: 20,
      description: 'Mempercepat waktu servis turnaround pesawat sebesar 25%.'
    }
  },
  {
    id: 'tech_aesa_calibration',
    targetType: 'technician',
    titleId: 'Sertifikasi Kalibrasi Radar AESA & ECM Pods',
    titleEn: 'AESA Radar & Electronic Warfare Calibration',
    descriptionId: 'Diagnostik transmisi modul Gallium Nitride (GaN) radar AESA dan pemrograman frekuensi anti-jamming.',
    descriptionEn: 'GaN AESA TR module diagnostics and electronic counter-countermeasures (ECCM) frequency programming.',
    durationSeconds: 15,
    cost: 32000000,
    statBoost: {
      ratingGain: 0.6,
      efficiencyBonus: 25,
      description: 'Menjamin kelaikan sistem avionik dan radar mencapai 100% lebih cepat.'
    }
  },
  {
    id: 'tech_turbofan_overhaul',
    targetType: 'technician',
    titleId: 'Depot Overhaul Turbofan Engine (Depohar 30)',
    titleEn: 'Heavy Jet Engine Overhaul Specialist',
    descriptionId: 'Borescope inspection, penggantian bilah turbin titanium, dan kalibrasi afterburner turbofan F110 / AL-31F.',
    descriptionEn: 'Borescope inspection, turbine blade replacement, and afterburner calibration for heavy turbofans.',
    durationSeconds: 22,
    cost: 50000000,
    statBoost: {
      ratingGain: 0.8,
      efficiencyBonus: 35,
      description: 'Mereduksi risiko kerusakan mesin saat terbang hingga 0%.'
    }
  },
  {
    id: 'crew_munitions_loading',
    targetType: 'electric',
    titleId: 'Sertifikasi Pemuatan Rudal BVR & Smart Munitions',
    titleEn: 'Smart Munitions & BVR Missile Loading',
    descriptionId: 'Prosedur aman instalasi kawat pneumatik, penguncian rel pylons, dan uji BIT sistem persenjataan 1760 databus.',
    descriptionEn: 'Safe installation, pylon rail locking, and MIL-STD-1760 weapons databus BIT verification.',
    durationSeconds: 14,
    cost: 28000000,
    statBoost: {
      ratingGain: 0.5,
      efficiencyBonus: 20,
      description: 'Kesiapan muatan hardpoint persenjataan instan dan bebas malfungsi.'
    }
  }
];

// GENERATE INITIAL INDIVIDUAL PILOTS FOR SQUADRON
export function generateDefaultPilotsForSquadron(squadronName: string, callsignPrefix: string, commanderName?: string): IndividualPilot[] {
  const cName = commanderName || 'Mayor Pnb Adhiatma';
  return [
    {
      id: `pilot-${squadronName}-1`,
      name: cName,
      callsign: `${callsignPrefix}-01 (LEADER)`,
      rank: 'Mayor Pnb',
      nrp: '528194',
      role: 'PIC',
      flightHours: 1240.5,
      rating: 4.8,
      specialization: 'BVR Air Superiority',
      status: 'READY',
      stamina: 100,
      gTolerance: 9.0,
      missionCount: 84,
      medals: ['Satya Lencana Kesetiaan VIII', 'Bintang Swa Bhuwana Paksa Nararya', 'Lencana Dogfight Ace'],
      assignedAircraftTail: 'TS-1601'
    },
    {
      id: `pilot-${squadronName}-2`,
      name: 'Kapten Pnb Bima Perkasa',
      callsign: `${callsignPrefix}-02 (VIPER-2)`,
      rank: 'Kapten Pnb',
      nrp: '534812',
      role: 'WSO',
      flightHours: 850.0,
      rating: 4.5,
      specialization: 'Precision Strike CAS',
      status: 'READY',
      stamina: 96,
      gTolerance: 9.0,
      missionCount: 52,
      medals: ['Satya Lencana Dharma Nusa', 'Lencana Kualifikasi WSO'],
      assignedAircraftTail: 'TS-1601'
    },
    {
      id: `pilot-${squadronName}-3`,
      name: 'Lettu Pnb Arya Yudha',
      callsign: `${callsignPrefix}-03 (WINGMAN)`,
      rank: 'Lettu Pnb',
      nrp: '541290',
      role: 'WINGMAN_1',
      flightHours: 520.0,
      rating: 4.2,
      specialization: 'Tactical Intercept',
      status: 'READY',
      stamina: 94,
      gTolerance: 8.5,
      missionCount: 28,
      medals: ['Satya Lencana Wira Dharma'],
      assignedAircraftTail: 'TS-1602'
    },
    {
      id: `pilot-${squadronName}-4`,
      name: 'Letda Pnb Dimas Prasetya',
      callsign: `${callsignPrefix}-04 (TRAINEE)`,
      rank: 'Letda Pnb',
      nrp: '547833',
      role: 'WINGMAN_2',
      flightHours: 280.0,
      rating: 3.8,
      specialization: 'Dogfight Ace',
      status: 'READY',
      stamina: 98,
      gTolerance: 8.0,
      missionCount: 12,
      medals: ['Lencana Penerbang Sekbang TNI AU'],
      assignedAircraftTail: 'TS-1602'
    }
  ];
}

// GENERATE INITIAL INDIVIDUAL CREW MEMBERS
export function generateDefaultCrewMembersForSquadron(squadronName: string): IndividualCrewMember[] {
  return [
    {
      id: `crew-${squadronName}-g1`,
      name: 'Serka Bambang Hartono',
      nrp: '512941',
      department: 'groundCrew',
      roleTitle: 'Chief Marshaller & Line Safety',
      rank: 'Serka',
      rating: 4.7,
      experienceLevel: 4,
      specialization: 'Aircraft Marshalling & Towing Lead',
      efficiencyScore: 95,
      status: 'ACTIVE',
      tasksCompleted: 420,
      certifications: ['Marshaller Master Class', 'Towing Heavy Cert']
    },
    {
      id: `crew-${squadronName}-t1`,
      name: 'Pelda Joko Sudibyo',
      nrp: '508219',
      department: 'technicians',
      roleTitle: 'Kepala Teknisi Mesin & Powerplant (Skatek)',
      rank: 'Pelda',
      rating: 4.9,
      experienceLevel: 5,
      specialization: 'Turbofan Diagnostics & Heavy Maintenance',
      efficiencyScore: 98,
      status: 'ACTIVE',
      tasksCompleted: 680,
      certifications: ['Turbofan F110/AL31 Master Tech', 'NDI Inspector Lvl 3']
    },
    {
      id: `crew-${squadronName}-t2`,
      name: 'Sertu Eko Wahyudi',
      nrp: '523091',
      department: 'technicians',
      roleTitle: 'Spesialis Avionik & Radar AESA',
      rank: 'Sertu',
      rating: 4.5,
      experienceLevel: 3,
      specialization: 'AESA Radar Calibration & Link-16 Bus',
      efficiencyScore: 92,
      status: 'ACTIVE',
      tasksCompleted: 310,
      certifications: ['Avionics Mil-STD-1553B Cert', 'ECCM Analyzer']
    },
    {
      id: `crew-${squadronName}-f1`,
      name: 'Serma Agus Riyadi',
      nrp: '515820',
      department: 'fuelCrew',
      roleTitle: 'Chief Bowser Fuel Operations',
      rank: 'Serma',
      rating: 4.6,
      experienceLevel: 4,
      specialization: 'Aviation Jet-A1 Purity & Hot-Pit Refueling',
      efficiencyScore: 94,
      status: 'ACTIVE',
      tasksCompleted: 530,
      certifications: ['Hot-Pit Safety Officer', 'Hydrometer Lab Tech']
    },
    {
      id: `crew-${squadronName}-e1`,
      name: 'Serka Hendra Gunawan',
      nrp: '518472',
      department: 'electricCrew',
      roleTitle: 'Spesialis Senjata & Ground Power Unit (GPU)',
      rank: 'Serka',
      rating: 4.8,
      experienceLevel: 4,
      specialization: 'Ordnance Loading (AMRAAM/GBU) & 115V 400Hz GPU',
      efficiencyScore: 96,
      status: 'ACTIVE',
      tasksCompleted: 490,
      certifications: ['Weapons Munitions Master', 'High Voltage GPU Tech']
    }
  ];
}
