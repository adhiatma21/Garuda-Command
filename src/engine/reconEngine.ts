import { Position, Waypoint, ReconIntelTarget, ReconThreatType, ReconCommandAction, ReconState, ReconFlightData, TacticalReconMission } from '../types';
import { ReconAircraft, RECON_AIRCRAFT_LIST } from '../data/reconAircraft';
import { getDistance, getBearing } from '../lib/utils';
import { MilitaryAirport } from '../airports';

export const TACTICAL_RECON_MISSIONS: TacticalReconMission[] = [
  'Air Superiority',
  'Air Defense / Intercept',
  'Combat Air Patrol (CAP)',
  'Barrier CAP',
  'Escort',
  'VVIP Air Escort',
  'Strike',
  'Close Air Support (CAS)',
  'SEAD',
  'DEAD',
  'Anti-Ship',
  'Maritime Patrol / Interdiction',
  'Reconnaissance',
  'Armed Reconnaissance',
  'Tactical Interdiction',
  'Show of Force',
  'Air Policing',
  'Scramble',
  'Tanker Escort',
  'Recovery Escort',
  'Rescue / CSAR Escort',
  'Training / Exercise',
  'Flight pass'
];

export interface ThreatTemplate {
  name: string;
  type: ReconThreatType;
  environment: 'sea' | 'land';
  actionRequired: ReconCommandAction;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  descriptionId: string;
  descriptionEn: string;
  recommendedWeapons: string[];
  altitudeFt?: number;
  candidateMissions: TacticalReconMission[];
}

// 1. DEDICATED SEA TARGET TEMPLATES (Jika titik survey di laut)
export const SEA_THREAT_TEMPLATES: ThreatTemplate[] = [
  {
    name: 'Kapal Perang Kombatan Musuh (Hostile Surface Warship)',
    type: 'enemy_warship',
    environment: 'sea',
    actionRequired: 'penghancuran',
    threatLevel: 'EXTREME',
    altitudeFt: 0,
    descriptionId: 'Kapal perang kombatan musuh bersenjata rudal jelajah dan artileri laut bermanuver di koordinat ZEE.',
    descriptionEn: 'Hostile combatant warship equipped with cruise missiles and naval guns maneuvering in EEZ waters.',
    recommendedWeapons: ['Kh-31AD Anti-Ship Missile', 'AGM-84 Harpoon', 'Exocet MM40 Block 3', 'GBU-24 Paveway III'],
    candidateMissions: ['Anti-Ship', 'Strike', 'Maritime Patrol / Interdiction', 'Tactical Interdiction', 'Show of Force', 'Armed Reconnaissance']
  },
  {
    name: 'Gugus Tempur Kapal Induk Musuh (Aircraft Carrier Strike Group)',
    type: 'aircraft_carrier',
    environment: 'sea',
    actionRequired: 'penghancuran',
    threatLevel: 'EXTREME',
    altitudeFt: 0,
    descriptionId: 'Formasi armada kapal induk musuh terdeteksi sedang meluncurkan sortie penerbangan di perairan lepas.',
    descriptionEn: 'Hostile aircraft carrier battle group detected conducting flight deck sorties in open sea corridor.',
    recommendedWeapons: ['Kh-31AD Anti-Ship Missile', 'AGM-84 Harpoon', 'GBU-31 JDAM (2,000 lbs)', 'AGM-88 HARM Anti-Radiation'],
    candidateMissions: ['Anti-Ship', 'Strike', 'DEAD', 'Show of Force', 'Air Superiority', 'Tactical Interdiction']
  },
  {
    name: 'Kapal Fregat Peluru Kendali (Guided Missile Frigate)',
    type: 'frigate',
    environment: 'sea',
    actionRequired: 'penghancuran',
    threatLevel: 'HIGH',
    altitudeFt: 0,
    descriptionId: 'Kapal fregat siluman musuh dengan sistem radar 3D dan peluncur torpedo aktif terdeteksi di alur laut.',
    descriptionEn: 'Hostile guided missile stealth frigate with active 3D radar and torpedo array detected in maritime channel.',
    recommendedWeapons: ['AGM-84 Harpoon', 'Kh-31AD Anti-Ship', 'GBU-12 Paveway II', 'Hydra 70 Rockets'],
    candidateMissions: ['Anti-Ship', 'Strike', 'Maritime Patrol / Interdiction', 'Tactical Interdiction', 'Armed Reconnaissance']
  },
  {
    name: 'Kapal Selam Serang di Kedalaman Periskop (Hostile Submarine)',
    type: 'enemy_submarine',
    environment: 'sea',
    actionRequired: 'penghancuran',
    threatLevel: 'HIGH',
    altitudeFt: -30,
    descriptionId: 'Sensor termal dan sonobuoy menangkap jejak termal dan tiang periskop kapal selam serang tanpa tanda pengenal.',
    descriptionEn: 'Thermal and acoustic sensors acquired periscope mast profile of an unidentified attack submarine.',
    recommendedWeapons: ['MK-46 Light Torpedo', 'Kh-31AD Anti-Ship', 'Bom Laut Kedalaman ASW', 'Hydra 70 Rockets'],
    candidateMissions: ['Maritime Patrol / Interdiction', 'Strike', 'Rescue / CSAR Escort', 'Tactical Interdiction', 'Air Policing']
  },
  {
    name: 'Drone Laut Intai & USV Peledak (Hostile Naval Drone / USV)',
    type: 'naval_drone',
    environment: 'sea',
    actionRequired: 'penghancuran',
    threatLevel: 'MEDIUM',
    altitudeFt: 0,
    descriptionId: 'Kawanan drone laut tak berawak (USV) berkecepatan tinggi mendekati instalasi maritim strategis.',
    descriptionEn: 'High-speed hostile unmanned surface vehicles (USV swarm) approaching strategic offshore maritime assets.',
    recommendedWeapons: ['Hydra 70 Rocket Pods', 'GBU-12 Paveway II', '20mm Vulcan Cannon', 'GBU-38 JDAM'],
    candidateMissions: ['Maritime Patrol / Interdiction', 'Anti-Ship', 'Air Policing', 'Flight pass', 'Show of Force', 'Training / Exercise']
  },
  {
    name: 'Pesawat Tempur Musuh di Wilayah Laut (Hostile Maritime Fighter Jet)',
    type: 'enemy_fighter',
    environment: 'sea',
    actionRequired: 'escorting',
    threatLevel: 'HIGH',
    altitudeFt: 24000,
    descriptionId: 'Kontak radar 2x pesawat tempur maritim musuh berkecepatan 540 knot melanggar zona pertahanan udara laut.',
    descriptionEn: 'Radar contact 2x hostile maritime combat jets at 540 kts breaching naval air defense identification zone.',
    recommendedWeapons: ['AIM-120C AMRAAM', 'AIM-9X Sidewinder', 'R-77 Vympel', '20mm Vulcan Cannon'],
    candidateMissions: ['Air Superiority', 'Air Defense / Intercept', 'Combat Air Patrol (CAP)', 'Barrier CAP', 'Scramble', 'Escort']
  }
];

// 2. DEDICATED LAND TARGET TEMPLATES (Jika titik survey di darat)
export const LAND_THREAT_TEMPLATES: ThreatTemplate[] = [
  {
    name: 'Markas Gerilyawan Bersenjata (Guerrilla Insurgent Base)',
    type: 'guerrilla_base',
    environment: 'land',
    actionRequired: 'pengeboman',
    threatLevel: 'MEDIUM',
    altitudeFt: 850,
    descriptionId: 'Citra optik FLIR mengidentifikasi kamp markas gerilyawan bersenjata, bunker logistik, dan depo amunisi.',
    descriptionEn: 'FLIR electro-optical sensors identified insurgent guerrilla stronghold, logistic bunkers, and munitions cache.',
    recommendedWeapons: ['GBU-12 Paveway II', 'GBU-38 JDAM (500 lbs)', 'Hydra 70 Rockets', 'Gun Pod 20mm'],
    candidateMissions: ['Close Air Support (CAS)', 'Strike', 'Armed Reconnaissance', 'Tactical Interdiction', 'Show of Force']
  },
  {
    name: 'Senjata Anti Serangan Udara & SAM (Anti-Aircraft SAM Battery)',
    type: 'anti_air_sam',
    environment: 'land',
    actionRequired: 'penghancuran',
    threatLevel: 'EXTREME',
    altitudeFt: 300,
    descriptionId: 'Sistem ELINT mendeteksi emisi radar penjejak dari baterai peluncur rudal pertahanan anti serangan udara musuh.',
    descriptionEn: 'ELINT system intercepted fire-control tracking radar emissions from active surface-to-air missile battery.',
    recommendedWeapons: ['AGM-88 HARM Anti-Radiation', 'Kh-31P Anti-Radar', 'GBU-38 JDAM', 'GBU-12 Laser Guided'],
    candidateMissions: ['SEAD', 'DEAD', 'Strike', 'Armed Reconnaissance', 'Tactical Interdiction']
  },
  {
    name: 'Markas Rudal Jelajah & Taktis (Hostile Missile Base / Silo)',
    type: 'missile_base',
    environment: 'land',
    actionRequired: 'penghancuran',
    threatLevel: 'EXTREME',
    altitudeFt: 450,
    descriptionId: 'Silo peluncur rudal balistik taktis dan kendaraan transporter peluncur rudal musuh teridentifikasi di lereng pegunungan.',
    descriptionEn: 'Tactical ballistic missile launch silo and heavy TEL launcher convoy identified along mountain valley.',
    recommendedWeapons: ['GBU-31 JDAM (2,000 lbs)', 'GBU-24 Paveway III', 'Kh-29T Guided Missile', 'AGM-88 HARM'],
    candidateMissions: ['Strike', 'DEAD', 'Tactical Interdiction', 'SEAD', 'Show of Force']
  },
  {
    name: 'Stasiun Radar Peringatan Dini (Early Warning Radar Station)',
    type: 'radar_station',
    environment: 'land',
    actionRequired: 'pengeboman',
    threatLevel: 'HIGH',
    altitudeFt: 1400,
    descriptionId: 'Kubah stasiun radar intai jarak jauh dan instalasi pemancar pengacak sinyal musuh aktif di puncak bukit.',
    descriptionEn: 'Long-range early warning radar dome facility and electronic jamming array active on hill summit.',
    recommendedWeapons: ['AGM-88 HARM Anti-Radiation', 'GBU-38 JDAM', 'GBU-12 Paveway II', 'Kh-31P Anti-Radar'],
    candidateMissions: ['SEAD', 'DEAD', 'Strike', 'Armed Reconnaissance', 'Show of Force']
  },
  {
    name: 'Pesawat Tempur Musuh di Pangkalan (Hostile Airbase Fighter Jet)',
    type: 'enemy_fighter_land',
    environment: 'land',
    actionRequired: 'escorting',
    threatLevel: 'HIGH',
    altitudeFt: 22000,
    descriptionId: 'Pesawat tempur musuh terdeteksi di runway pangkalan darat siap lepas landas untuk mencegat formasi sekutu.',
    descriptionEn: 'Hostile fighter jets scrambled from forward airstrip climbing rapidly to intercept allied airspace.',
    recommendedWeapons: ['AIM-120C AMRAAM', 'AIM-9X Sidewinder', 'R-77 Vympel', '20mm Vulcan Cannon'],
    candidateMissions: ['Air Superiority', 'Air Defense / Intercept', 'Combat Air Patrol (CAP)', 'Scramble', 'Air Policing', 'Training / Exercise', 'Flight pass']
  }
];

export const ALL_THREAT_TEMPLATES: ThreatTemplate[] = [
  ...SEA_THREAT_TEMPLATES,
  ...LAND_THREAT_TEMPLATES
];

// Backward compatibility alias
export const THREAT_TEMPLATES = ALL_THREAT_TEMPLATES;

export const WEAPON_OPTIONS = [
  { id: 'gbu-38', name: 'GBU-38 JDAM (500 lbs Precision GPS Bomb)', weight: 1100, suitableFor: ['pengeboman', 'penghancuran'] },
  { id: 'gbu-12', name: 'GBU-12 Paveway II (Laser Guided Bomb)', weight: 1250, suitableFor: ['pengeboman', 'penghancuran'] },
  { id: 'kh-31', name: 'Kh-31AD / Harpoon (Supersonic Anti-Ship Missile)', weight: 1600, suitableFor: ['penghancuran'] },
  { id: 'agm-88', name: 'AGM-88 HARM / Kh-31P (Anti-Radiation Missile)', weight: 1400, suitableFor: ['penghancuran', 'pengeboman'] },
  { id: 'aim-120', name: 'AIM-120C AMRAAM (Active Radar Air-to-Air)', weight: 800, suitableFor: ['escorting'] },
  { id: 'aim-9x', name: 'AIM-9X Sidewinder (High-Off-Boresight IR)', weight: 450, suitableFor: ['escorting'] },
  { id: 'hydra-70', name: 'Hydra 70 Rocket Pods (70mm Unguided Rockets)', weight: 900, suitableFor: ['pengeboman', 'surveillance'] },
  { id: 'recon-pod', name: 'Recce-Lite Tactical Sensor Pod (BDA Camera)', weight: 650, suitableFor: ['surveillance'] }
];

/**
 * Determine if a geographic coordinate is over Sea (Laut) or Land (Darat)
 */
export function isSeaLocation(lat: number, lng: number, name: string = ''): boolean {
  const lowerName = name.toLowerCase();

  // Keyword check first
  if (
    lowerName.includes('laut') ||
    lowerName.includes('selat') ||
    lowerName.includes('sea') ||
    lowerName.includes('strait') ||
    lowerName.includes('ocean') ||
    lowerName.includes('samudera') ||
    lowerName.includes('samudra') ||
    lowerName.includes('zee') ||
    lowerName.includes('alki') ||
    lowerName.includes('maritim') ||
    lowerName.includes('perairan') ||
    lowerName.includes('channel') ||
    lowerName.includes('gulf') ||
    lowerName.includes('bay') ||
    lowerName.includes('karang') ||
    lowerName.includes('natuna') ||
    lowerName.includes('malaka') ||
    lowerName.includes('makassar')
  ) {
    return true;
  }

  if (
    lowerName.includes('gunung') ||
    lowerName.includes('daratan') ||
    lowerName.includes('bukit') ||
    lowerName.includes('ridge') ||
    lowerName.includes('bunker') ||
    lowerName.includes('hutan') ||
    lowerName.includes('base') ||
    lowerName.includes('pangkalan') ||
    lowerName.includes('kota') ||
    lowerName.includes('kamp')
  ) {
    return false;
  }

  // Major Indonesian & Regional Landmass Bounding Boxes:
  const isInsideLandBox = (
    (lat >= -8.8 && lat <= -5.8 && lng >= 105.1 && lng <= 114.6) || // Java Island
    (lat >= -6.0 && lat <= 5.9 && lng >= 95.2 && lng <= 106.1 && !(lat > 3.0 && lng > 103.5)) || // Sumatra Island
    (lat >= -4.3 && lat <= 4.4 && lng >= 108.8 && lng <= 119.1) || // Borneo / Kalimantan
    (lat >= -5.8 && lat <= 1.9 && lng >= 118.8 && lng <= 125.3) || // Sulawesi Island
    (lat >= -9.2 && lat <= 0.0 && lng >= 130.5 && lng <= 141.1) || // Papua Island
    (lat >= 1.2 && lat <= 6.8 && lng >= 99.8 && lng <= 104.5) || // Peninsular Malaysia
    (lat >= 6.0 && lat <= 20.5 && lng >= 97.3 && lng <= 105.7) || // Thailand / Indochina
    (lat >= -9.0 && lat <= -8.0 && lng >= 114.4 && lng <= 115.7) || // Bali Island
    (lat >= -9.2 && lat <= -8.1 && lng >= 115.8 && lng <= 119.4) || // Lombok & Sumbawa
    (lat >= -9.0 && lat <= -8.1 && lng >= 119.5 && lng <= 123.1) || // Flores Island
    (lat >= -10.5 && lat <= -8.3 && lng >= 123.3 && lng <= 127.4) || // Timor Island
    (lat <= -11.0 && lng >= 113.0 && lng <= 140.0) // Australia Landmass
  );

  // If inside any dense landmass bounding box, treat as land, otherwise sea!
  return !isInsideLandBox;
}

export function createInitialReconState(defaultReconPlane: ReconAircraft = RECON_AIRCRAFT_LIST[0]): ReconState {
  return {
    phase: 'idle',
    selectedReconId: defaultReconPlane.id,
    departureIcao: defaultReconPlane.defaultDepartureIcao,
    arrivalIcao: defaultReconPlane.defaultArrivalIcao,
    surveyPoints: [],
    reconFlight: {
      aircraftId: defaultReconPlane.id,
      pos: null,
      heading: 0,
      altitude: defaultReconPlane.operatingAlt,
      speed: defaultReconPlane.cruiseSpeed,
      currentWpIndex: 0,
      scanProgress: 0,
      sensorActive: true
    },
    isOutOfScope: false,
    totalDistanceNM: 0,
    maxRangeNM: defaultReconPlane.maxRangeNM,
    detectedTargets: [],
    activeTargetIndex: 0,
    scrambleApproved: false,
    targetCoordsInput: { lat: '', lng: '' },
    selectedWeapon: WEAPON_OPTIONS[0].id,
    strikePayloadWeight: WEAPON_OPTIONS[0].weight,
    strikeTakeoffBaseIcao: 'WIHH',
    strikeLandingBaseIcao: 'WIHH',
    intelReportDispatched: false
  };
}

export function calculateReconTotalDistance(
  departure: { lat: number; lng: number },
  surveyPoints: Waypoint[],
  arrival: { lat: number; lng: number }
): number {
  if (surveyPoints.length === 0) {
    return Math.round(getDistance(departure.lat, departure.lng, arrival.lat, arrival.lng));
  }

  let total = getDistance(departure.lat, departure.lng, surveyPoints[0].lat, surveyPoints[0].lng);
  for (let i = 0; i < surveyPoints.length - 1; i++) {
    total += getDistance(surveyPoints[i].lat, surveyPoints[i].lng, surveyPoints[i + 1].lat, surveyPoints[i + 1].lng);
  }
  const lastWp = surveyPoints[surveyPoints.length - 1];
  total += getDistance(lastWp.lat, lastWp.lng, arrival.lat, arrival.lng);
  return Math.round(total);
}

export function generateReconIntelTargets(
  surveyPoints: Waypoint[],
  reconAircraft: ReconAircraft
): ReconIntelTarget[] {
  if (surveyPoints.length === 0) return [];

  const targets: ReconIntelTarget[] = [];

  surveyPoints.forEach((wp, idx) => {
    // 1. Detect if survey coordinate is over SEA or LAND
    const isSea = isSeaLocation(wp.lat, wp.lng, wp.name);
    const pool = isSea ? SEA_THREAT_TEMPLATES : LAND_THREAT_TEMPLATES;

    // 2. Select corresponding target template from specific sea/land threat pool
    const templateIndex = (idx * 2 + Math.floor(Math.random() * pool.length)) % pool.length;
    const template = pool[templateIndex];

    // 3. Select tactical mission for player's fighter jet from candidate list or full 23-missions list
    const candidateMissions = template.candidateMissions && template.candidateMissions.length > 0
      ? template.candidateMissions
      : TACTICAL_RECON_MISSIONS;
    
    // Pick specific tactical mission from candidate list or occasionally draw from full list
    const chosenMission = Math.random() < 0.8
      ? candidateMissions[Math.floor(Math.random() * candidateMissions.length)]
      : TACTICAL_RECON_MISSIONS[Math.floor(Math.random() * TACTICAL_RECON_MISSIONS.length)];

    // Maintain exact surveyed manual coordinates for precision targeting
    const targetLat = +(wp.lat).toFixed(4);
    const targetLng = +(wp.lng).toFixed(4);

    const locationTag = isSea ? 'SEKTOR MARITIM' : 'SEKTOR DARATAN';

    targets.push({
      id: `intel-target-${idx + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${template.name} - [${wp.name || `${locationTag} ${String.fromCharCode(65 + idx)}`}]`,
      type: template.type,
      environment: isSea ? 'sea' : 'land',
      assignedMission: chosenMission,
      lat: targetLat,
      lng: targetLng,
      altitudeFt: template.altitudeFt || (isSea ? 0 : 500),
      threatLevel: template.threatLevel,
      descriptionId: `${template.descriptionId} [Lokasi: ${isSea ? 'Laut / ZEE' : 'Daratan'} | Misi Tempur: ${chosenMission}] Terpantau sensor ${reconAircraft.name} (${reconAircraft.sensorPayload}) di koordinat ${targetLat}, ${targetLng}.`,
      descriptionEn: `${template.descriptionEn} [Area: ${isSea ? 'Maritime EEZ' : 'Terrestrial Land'} | Combat Mission: ${chosenMission}] Acquired by ${reconAircraft.name} sensors (${reconAircraft.sensorPayload}) at ${targetLat}, ${targetLng}.`,
      actionRequired: template.actionRequired,
      recommendedWeapons: template.recommendedWeapons,
      detectedAtWpIndex: idx,
      isEliminated: false,
      engagementRadiusNM: 4.5
    });
  });

  return targets;
}

export function stepReconFlight(
  currentFlight: ReconFlightData,
  waypoints: Waypoint[],
  arrivalBase: { lat: number; lng: number },
  dtSeconds: number,
  timeScale: number
): {
  newFlight: ReconFlightData;
  justReachedWpIndex: number | null;
  hasCompletedAllSurvey: boolean;
} {
  if (!currentFlight.pos) {
    return { newFlight: currentFlight, justReachedWpIndex: null, hasCompletedAllSurvey: false };
  }

  const allDestinations: Waypoint[] = [
    ...waypoints,
    {
      id: 'recon-arr',
      name: 'Arrival Base',
      lat: arrivalBase.lat,
      lng: arrivalBase.lng,
      reached: false,
      type: 'airport'
    }
  ];

  const targetWp = allDestinations[currentFlight.currentWpIndex];
  if (!targetWp) {
    return { newFlight: currentFlight, justReachedWpIndex: null, hasCompletedAllSurvey: true };
  }

  const distToTarget = getDistance(currentFlight.pos.lat, currentFlight.pos.lng, targetWp.lat, targetWp.lng);
  const targetHeading = getBearing(currentFlight.pos.lat, currentFlight.pos.lng, targetWp.lat, targetWp.lng);

  // Responsive heading turn towards target coordinate
  let currentHdg = currentFlight.heading;
  let diff = (targetHeading - currentHdg + 360) % 360;
  if (diff > 180) diff -= 360;
  const turnRate = Math.min(180, 50 * dtSeconds * timeScale);
  const turnStep = Math.abs(diff) <= turnRate ? diff : Math.sign(diff) * turnRate;
  const newHeading = (currentHdg + turnStep + 360) % 360;

  // Move forward at game-scaled speed (using game multiplier 8 for responsive real-time pace)
  const speedKnots = currentFlight.speed || 160;
  const gamePacingMultiplier = 8;
  const speedNMPerSec = (speedKnots / 3600) * gamePacingMultiplier;
  const distanceMoved = speedNMPerSec * dtSeconds * timeScale;

  const headingRad = (newHeading * Math.PI) / 180;
  const latDelta = (distanceMoved * Math.cos(headingRad)) / 60;
  const avgLat = (currentFlight.pos.lat * Math.PI) / 180;
  const lngDelta = (distanceMoved * Math.sin(headingRad)) / (60 * Math.cos(avgLat));

  const newPos: Position = {
    lat: currentFlight.pos.lat + latDelta,
    lng: currentFlight.pos.lng + lngDelta
  };

  let justReachedWpIndex: number | null = null;
  let nextWpIndex = currentFlight.currentWpIndex;
  let scanProgress = currentFlight.scanProgress;

  // If within scanning envelope (< 3.5 NM), progress FLIR / Radar scan
  if (distToTarget <= 3.5) {
    if (currentFlight.currentWpIndex < waypoints.length) {
      // Reached survey waypoint
      scanProgress = Math.min(100, scanProgress + 45 * dtSeconds * timeScale);
      if (scanProgress >= 100 || distToTarget <= 1.0) {
        justReachedWpIndex = currentFlight.currentWpIndex;
        nextWpIndex++;
        scanProgress = 0;
      }
    } else {
      // Reached final arrival airbase
      return {
        newFlight: {
          ...currentFlight,
          pos: newPos,
          heading: newHeading,
          scanProgress: 100
        },
        justReachedWpIndex: null,
        hasCompletedAllSurvey: true
      };
    }
  }

  return {
    newFlight: {
      ...currentFlight,
      pos: newPos,
      heading: newHeading,
      currentWpIndex: nextWpIndex,
      scanProgress
    },
    justReachedWpIndex,
    hasCompletedAllSurvey: nextWpIndex >= allDestinations.length
  };
}

