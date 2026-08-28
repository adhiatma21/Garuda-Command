import { Position, Waypoint, ReconIntelTarget, ReconThreatType, ReconCommandAction, ReconState, ReconFlightData } from '../types';
import { ReconAircraft, RECON_AIRCRAFT_LIST } from '../data/reconAircraft';
import { getDistance, getBearing } from '../lib/utils';
import { MilitaryAirport } from '../airports';

export interface ThreatTemplate {
  name: string;
  type: ReconThreatType;
  actionRequired: ReconCommandAction;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  descriptionId: string;
  descriptionEn: string;
  recommendedWeapons: string[];
  altitudeFt?: number;
}

export const THREAT_TEMPLATES: ThreatTemplate[] = [
  {
    name: 'Jet Tempur Siluman Asing (Hostile Air Intercept)',
    type: 'enemy_fighter',
    actionRequired: 'escorting',
    threatLevel: 'HIGH',
    altitudeFt: 28000,
    descriptionId: 'Kontak radar 2x pesawat tempur asing tak berizin melanggar FIR kedaulatan dengan kecepatan 520 knot.',
    descriptionEn: 'Radar contact 2x unauthorized foreign combat jets violating sovereign FIR at 520 kts.',
    recommendedWeapons: ['AIM-120C AMRAAM', 'AIM-9X Sidewinder', 'R-77 Vympel', '20mm Vulcan Cannon']
  },
  {
    name: 'Kapal Perang Frigate Musuh (Hostile Surface Warship)',
    type: 'enemy_warship',
    actionRequired: 'penghancuran',
    threatLevel: 'EXTREME',
    altitudeFt: 0,
    descriptionId: 'Kapal perang kombatan musuh kelas Fregat berpeluru kendali terdeteksi di koordinat laut ZEE.',
    descriptionEn: 'Hostile guided missile frigate detected maneuvering in exclusive economic sea coordinates.',
    recommendedWeapons: ['Kh-31AD Anti-Ship Missile', 'AGM-84 Harpoon', 'Exocet MM40 Block 3', 'GBU-24 Paveway III']
  },
  {
    name: 'Kapal Selam Serang di Kedalaman Periskop (Submarine Threat)',
    type: 'enemy_submarine',
    actionRequired: 'penghancuran',
    threatLevel: 'HIGH',
    altitudeFt: -50,
    descriptionId: 'Sensor termal dan radar intai menangkap siluet menara periskop kapal selam tanpa tanda pengenal.',
    descriptionEn: 'Thermal and surface search sensor acquired periscope mast profile of an unidentified submarine.',
    recommendedWeapons: ['MK-46 Light Torpedo', 'Kh-31AD Anti-Ship', 'Bom Laut Kedalaman ASW', 'Rocket Pods']
  },
  {
    name: 'Kamp Gerilyawan Bersenjata Berat (Insurgent Stronghold)',
    type: 'insurgents',
    actionRequired: 'pengeboman',
    threatLevel: 'MEDIUM',
    altitudeFt: 850,
    descriptionId: 'Pengintaian optik resolusi tinggi mengidentifikasi bivak militer gerilyawan dan gudang amunisi kamuflase.',
    descriptionEn: 'High-res optical sensor identified insurgent paramilitary camp and camouflaged munitions bunker.',
    recommendedWeapons: ['GBU-12 Paveway II', 'GBU-38 JDAM (500 lbs)', 'Hydra 70 Rockets', 'Gun Pod 20mm']
  },
  {
    name: 'Baterai Peluncur Rudal Anti-Serangan Udara (SAM Battery)',
    type: 'anti_air_sam',
    actionRequired: 'penghancuran',
    threatLevel: 'EXTREME',
    altitudeFt: 250,
    descriptionId: 'Sistem ELINT mendeteksi emisi radar penjejak dari sistem peluncur rudal pertahanan udara musuh (SAM Site).',
    descriptionEn: 'ELINT system detected active fire-control tracking radar emissions from hostile mobile SAM missile battery.',
    recommendedWeapons: ['AGM-88 HARM Anti-Radiation', 'Kh-31P Anti-Radar', 'GBU-38 JDAM', 'GBU-12 Laser Guided']
  },
  {
    name: 'Instalasi Radar & Pusat Komando Musuh (C2 Radar Facility)',
    type: 'radar_installation',
    actionRequired: 'pengeboman',
    threatLevel: 'HIGH',
    altitudeFt: 1200,
    descriptionId: 'Kubah radar peringatan dini dan antena pemancar sinyal jammer taktis terdeteksi di puncak perbukitan.',
    descriptionEn: 'Early warning radar dome and tactical electronic jamming transmitter array acquired on hilltop.',
    recommendedWeapons: ['GBU-31 JDAM (2,000 lbs)', 'GBU-12 Paveway', 'Kh-29T TV Guided Missile', 'Hydra 70 Rockets']
  }
];

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
    // Generate high-priority target directly at the survey coordinates
    const templateIndex = (idx * 2 + Math.floor(Math.random() * 2)) % THREAT_TEMPLATES.length;
    const template = THREAT_TEMPLATES[templateIndex];

    // Maintain exact surveyed manual coordinates for precision targeting
    const targetLat = +(wp.lat).toFixed(4);
    const targetLng = +(wp.lng).toFixed(4);

    targets.push({
      id: `intel-target-${idx + 1}-${Date.now()}`,
      name: `${template.name} - [${wp.name || `SEKTOR ${String.fromCharCode(65 + idx)}`}]`,
      type: template.type,
      lat: targetLat,
      lng: targetLng,
      altitudeFt: template.altitudeFt || 0,
      threatLevel: template.threatLevel,
      descriptionId: `${template.descriptionId} Terpantau sensor ${reconAircraft.name} (${reconAircraft.sensorPayload}) di koordinat ${targetLat}, ${targetLng}.`,
      descriptionEn: `${template.descriptionEn} Captured by ${reconAircraft.name} sensors (${reconAircraft.sensorPayload}) at ${targetLat}, ${targetLng}.`,
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
