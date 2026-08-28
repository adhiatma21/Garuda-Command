import { MilitaryAirport, MILITARY_AIRPORTS } from '../airports';

export interface ReconAircraft {
  id: string;
  name: string;
  category: 'UAV / UAS' | 'MPA (Patroli Maritim)' | 'AEW&C / Intel Strategis';
  countryOrigin: 'Indonesia' | 'Singapura' | 'Thailand' | 'Australia' | 'Turki' | 'China' | 'Austria';
  defaultDepartureIcao: string;
  defaultArrivalIcao: string;
  maxRangeNM: number;
  cruiseSpeed: number; // knots
  operatingAlt: number; // ft
  sensorPayload: string;
  radarRadiusNM: number;
  descriptionId: string;
  descriptionEn: string;
  image?: string;
}

export const RECON_AIRCRAFT_LIST: ReconAircraft[] = [
  // 1. TACTICAL & MALE UAVs
  {
    id: 'anka-s',
    name: 'ANKA-S',
    category: 'UAV / UAS',
    countryOrigin: 'Turki',
    defaultDepartureIcao: 'WIHH',
    defaultArrivalIcao: 'WIHH',
    maxRangeNM: 850,
    cruiseSpeed: 110,
    operatingAlt: 25000,
    sensorPayload: 'EO/IR High-Res Camera, SAR Radar, SATCOM Link',
    radarRadiusNM: 45,
    descriptionId: 'MALE UAS multi-peran dengan radar apertur sintetis & tautan satelit real-time.',
    descriptionEn: 'MALE multi-role UAS with synthetic aperture radar & real-time satellite link.'
  },
  {
    id: 'ch-4b',
    name: 'CH-4B RAINBOW',
    category: 'UAV / UAS',
    countryOrigin: 'China',
    defaultDepartureIcao: 'WIOO',
    defaultArrivalIcao: 'WIOO',
    maxRangeNM: 1850,
    cruiseSpeed: 140,
    operatingAlt: 28000,
    sensorPayload: 'Thermal Imaging Pod, Laser Designator, SAR Ground Recon',
    radarRadiusNM: 65,
    descriptionId: 'Drone intai serang jarak jauh TNI AU Skadron 51 Supadio dengan daya jelajah tinggi.',
    descriptionEn: 'Long-endurance reconnaissance drone operated by TNI AU SQ 51 Supadio.'
  },
  {
    id: 'aerostar',
    name: 'Aerostar TACTICAL UAS',
    category: 'UAV / UAS',
    countryOrigin: 'Indonesia',
    defaultDepartureIcao: 'WIDN',
    defaultArrivalIcao: 'WIDN',
    maxRangeNM: 140,
    cruiseSpeed: 90,
    operatingAlt: 15000,
    sensorPayload: 'Daylight/IR Gyro-stabilized Gimbal',
    radarRadiusNM: 25,
    descriptionId: 'UAS taktis perbatasan untuk pengawasan selat, garis pantai, dan pangkalan terdepan.',
    descriptionEn: 'Tactical border UAS for strait surveillance, coastline, and forward bases.'
  },
  {
    id: 'iae-wulung',
    name: 'IAe Wulung',
    category: 'UAV / UAS',
    countryOrigin: 'Indonesia',
    defaultDepartureIcao: 'WIAH',
    defaultArrivalIcao: 'WIAH',
    maxRangeNM: 120,
    cruiseSpeed: 75,
    operatingAlt: 12000,
    sensorPayload: 'High-Res Optical Cam & Thermal Sensor',
    radarRadiusNM: 20,
    descriptionId: 'Drone buatan PT Dirgantara Indonesia (PT DI) untuk pengintaian taktis teritorial.',
    descriptionEn: 'Indonesian indigenous tactical reconnaissance UAV made by PT DI.'
  },
  {
    id: 'mq-27b',
    name: 'MQ-27B',
    category: 'UAV / UAS',
    countryOrigin: 'Indonesia',
    defaultDepartureIcao: 'WIDD',
    defaultArrivalIcao: 'WIDD',
    maxRangeNM: 650,
    cruiseSpeed: 135,
    operatingAlt: 22000,
    sensorPayload: 'Maritime Search Radar & Multi-Spectral Optical Pod',
    radarRadiusNM: 40,
    descriptionId: 'Pesawat tanpa awak intai maritim patroli ZEE dan perairan kepulauan.',
    descriptionEn: 'Maritime reconnaissance UAV for EEZ patrol and archipelagic waters.'
  },
  {
    id: 'schiebel-s100',
    name: 'Schiebel Camcopter S-100',
    category: 'UAV / UAS',
    countryOrigin: 'Austria',
    defaultDepartureIcao: 'WARR',
    defaultArrivalIcao: 'WARR',
    maxRangeNM: 110,
    cruiseSpeed: 95,
    operatingAlt: 12000,
    sensorPayload: 'VTOL Maritime Sensor Pod, AIS Receiver, EO/IR',
    radarRadiusNM: 20,
    descriptionId: 'Rotary-wing VTOL UAS pengintai kapal perang dan pelabuhan strategis.',
    descriptionEn: 'Rotary-wing VTOL UAS for warship and strategic naval harbor reconnaissance.'
  },

  // 2. HEAVY MARITIME PATROL & RECON AIRCRAFT
  {
    id: 'b737-surveiler',
    name: 'Boeing 737-200/Surveiler',
    category: 'MPA (Patroli Maritim)',
    countryOrigin: 'Indonesia',
    defaultDepartureIcao: 'WAAA', // Hasanuddin Makassar (Skadron 5)
    defaultArrivalIcao: 'WAAA',
    maxRangeNM: 2450,
    cruiseSpeed: 430,
    operatingAlt: 35000,
    sensorPayload: 'SLAMMER Side-Looking Airborne Radar, Search Radar, Search Optronics',
    radarRadiusNM: 120,
    descriptionId: 'Pesawat intai maritim strategis Skadron Udara 5 TNI AU (Camar Emas / Slammer).',
    descriptionEn: 'Strategic maritime surveillance aircraft of TNI AU Squadron 5 Camar Emas.'
  },
  {
    id: 'cn235-mpa',
    name: 'CN-235 MPA',
    category: 'MPA (Patroli Maritim)',
    countryOrigin: 'Indonesia',
    defaultDepartureIcao: 'WIHH',
    defaultArrivalIcao: 'WIHH',
    maxRangeNM: 2150,
    cruiseSpeed: 240,
    operatingAlt: 25000,
    sensorPayload: 'Ocean Master 100 Search Radar, FLIR Star SAFIRE, ESM/ELINT',
    radarRadiusNM: 85,
    descriptionId: 'Pesawat patroli maritim PT DI dilengkapi radar intai permukaan dan sensor FLIR.',
    descriptionEn: 'PT DI Maritime Patrol Aircraft with surface search radar and FLIR sensor.'
  },
  {
    id: 'cn295-mpa',
    name: 'CN-295 MPA',
    category: 'MPA (Patroli Maritim)',
    countryOrigin: 'Indonesia',
    defaultDepartureIcao: 'WARS',
    defaultArrivalIcao: 'WARS',
    maxRangeNM: 2700,
    cruiseSpeed: 260,
    operatingAlt: 26000,
    sensorPayload: 'FITS Tactical Mission System, Surface Radar, MAD Sub-Hunter, EO/IR',
    radarRadiusNM: 95,
    descriptionId: 'Sistem misi FITS generasi terbaru untuk intai maritim dan deteksi kapal selam.',
    descriptionEn: 'Modern FITS tactical mission system for maritime recon and ASW detection.'
  },

  // 3. REGIONAL & FOREIGN AIRBORNE EARLY WARNING & INTEL (SINGAPORE, THAILAND, AUSTRALIA)
  {
    id: 'g550-caew-singapore',
    name: 'Gulfstream G550 C AEW - SINGAPURA',
    category: 'AEW&C / Intel Strategis',
    countryOrigin: 'Singapura',
    defaultDepartureIcao: 'WSAP', // Paya Lebar Air Base, Singapore
    defaultArrivalIcao: 'WSAP',
    maxRangeNM: 3750,
    cruiseSpeed: 460,
    operatingAlt: 41000,
    sensorPayload: 'EL/W-2085 Active Phased Array Dual-Band AEW Radar (360°), ELINT/SIGINT',
    radarRadiusNM: 220,
    descriptionId: 'Pesawat peringatan dini & pengintai radar canggih Angkatan Udara Singapura (RSAF).',
    descriptionEn: 'Advanced Early Warning & Control airborne radar operated by the RSAF (Singapore).'
  },
  {
    id: 'heron1-singapore',
    name: 'HERON 1 - SINGAPURA',
    category: 'UAV / UAS',
    countryOrigin: 'Singapura',
    defaultDepartureIcao: 'WSAT', // Tengah Air Base, Singapore
    defaultArrivalIcao: 'WSAT',
    maxRangeNM: 550,
    cruiseSpeed: 115,
    operatingAlt: 26000,
    sensorPayload: 'MOSP EO/IR/Laser Payload, SAR Radar & Maritime Vessel Tracker',
    radarRadiusNM: 50,
    descriptionId: 'UAV MALE pengintai canggih RSAF Singapura untuk intelijen maritim & selat.',
    descriptionEn: 'RSAF MALE surveillance UAV for maritime intelligence and strait monitoring.'
  },
  {
    id: 'hermes900-thailand',
    name: 'HERMES 900 - Thailand',
    category: 'UAV / UAS',
    countryOrigin: 'Thailand',
    defaultDepartureIcao: 'VTBD', // Don Mueang (Military), Thailand
    defaultArrivalIcao: 'VTBD',
    maxRangeNM: 1450,
    cruiseSpeed: 125,
    operatingAlt: 30000,
    sensorPayload: 'Maritime Radar, SkyFix COMINT, High-Altitude Multispectral Camera',
    radarRadiusNM: 70,
    descriptionId: 'Drone intai jarak jauh Angkatan Laut Kerajaan Thailand untuk Teluk Thailand & Andaman.',
    descriptionEn: 'Royal Thai Navy long-range reconnaissance drone for Gulf of Thailand & Andaman Sea.'
  },
  {
    id: 'p8a-australia',
    name: 'P-8A Poseidon - australia',
    category: 'MPA (Patroli Maritim)',
    countryOrigin: 'Australia',
    defaultDepartureIcao: 'YPED', // RAAF Edinburgh, Australia
    defaultArrivalIcao: 'YPED',
    maxRangeNM: 4100,
    cruiseSpeed: 490,
    operatingAlt: 41000,
    sensorPayload: 'APY-10 Multi-Mission Surface Radar, MX-20HD EO/IR, Acoustic Sonobuoys',
    radarRadiusNM: 180,
    descriptionId: 'Pesawat intai maritim & anti-kapal selam tercanggih RAAF Australia.',
    descriptionEn: 'Premier maritime patrol and anti-submarine warfare aircraft of the RAAF (Australia).'
  },
  {
    id: 'mq4c-australia',
    name: 'MQ-4C Triton - Australia',
    category: 'UAV / UAS',
    countryOrigin: 'Australia',
    defaultDepartureIcao: 'YPED', // RAAF Edinburgh / Tindal
    defaultArrivalIcao: 'YPED',
    maxRangeNM: 8200,
    cruiseSpeed: 330,
    operatingAlt: 55000,
    sensorPayload: 'MFAS 360° AESA Maritime Radar, EO/IR Full Motion Video, AIS, SIGINT',
    radarRadiusNM: 260,
    descriptionId: 'HALE UAV intai maritim stratosfer jarak ultra-jauh RAAF dengan jangkauan 8,200 NM.',
    descriptionEn: 'RAAF High-Altitude Long-Endurance (HALE) maritime recon UAS with 8,200 NM range.'
  },
  {
    id: 'e7a-australia',
    name: 'E-7A wedgetail - Australia',
    category: 'AEW&C / Intel Strategis',
    countryOrigin: 'Australia',
    defaultDepartureIcao: 'YAMB', // RAAF Amberley, Australia
    defaultArrivalIcao: 'YAMB',
    maxRangeNM: 3500,
    cruiseSpeed: 460,
    operatingAlt: 39000,
    sensorPayload: 'MESA (Multi-role Electronically Scanned Array) Active L-Band Radar',
    radarRadiusNM: 210,
    descriptionId: 'Pesawat AEW&C radar udara canggih RAAF untuk memandu pertempuran udara & laut.',
    descriptionEn: 'RAAF Airborne Early Warning & Control aircraft providing 360° battle management.'
  }
];

export function getDefaultAirportsForRecon(recon: ReconAircraft): { departure: MilitaryAirport; arrival: MilitaryAirport } {
  const dep = MILITARY_AIRPORTS.find(a => a.icao === recon.defaultDepartureIcao) || MILITARY_AIRPORTS[0];
  const arr = MILITARY_AIRPORTS.find(a => a.icao === recon.defaultArrivalIcao) || dep;
  return { departure: dep, arrival: arr };
}
