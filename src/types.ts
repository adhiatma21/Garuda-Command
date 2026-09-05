export interface Aircraft {
  id: string;
  name: string;
  maxFuel: number; // lbs
  burnRate: number; // lbs per NM
  cruiseSpeed: number; // knots
  maxSpeed?: number;
  maxAltitude?: number;
  maxRange?: number;
  emptyWeight?: number; // lbs (Clean Operating Empty Weight without weapons/tanks)
  maxTakeoffWeight?: number; // lbs (MTOW)
  type: 'fighter' | 'transport' | 'commercial' | 'general';
  image: string;
  specs: {
    engine: string;
    maxSpeed: string;
    range: string;
    ceiling: string;
    armament?: string;
    payload?: string;
  };
}

export interface Position {
  lat: number;
  lng: number;
}

export interface PlannerWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude: number; // in feet
  speed?: number; // in knots
}

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  reached: boolean;
  timestamp?: number;
  planAltitude?: number; // ft
  planSpeed?: number; // kts
  estFuelRemaining?: number; // lbs
  estTimeMinutes?: number;
  type: 'waypoint' | 'airport' | 'tanker';
  isRV?: boolean;
}

export interface PilotHistory {
  aircraftId: string;
  aircraftName: string;
  totalHours: number;
  totalPoints: number;
  missionsCompleted: number;
}

export interface Crew {
  pilot: string;
  coPilot: string;
  callSign: string;
  crewCount: number;
  cabinCount: number;
}

export interface OwnedAircraft {
  id: string;
  tailNumber: string;
  aircraft: Aircraft;
  flightHours: number;
  health: {
    airframe: number; // 0-100
    engine: number; // 0-100
    hydraulics: number; // 0-100
    avionics: number; // 0-100
    fuelSystem: number; // 0-100
  };
  status: {
    code: 'READY' | 'SCRAMBLE' | 'MAINTENANCE' | 'STANDBY';
    labelId: string;
    labelEn: string;
    color: string;
  };
  generationTier?: '4.0' | '4.5' | '4++' | '5.0' | '5.5' | '6.0';
  generationBadge?: string;
  upgradesApplied?: string[];
  purchasePrice?: number;
  purchasedAt?: number;
}

export type WeaponCategory = 
  | 'air_to_air' 
  | 'air_to_ground' 
  | 'anti_ship' 
  | 'long_range' 
  | 'sead' 
  | 'pod' 
  | 'fuel_tank' 
  | 'cannon';

export interface WeaponItem {
  id: string;
  name: string;
  category: WeaponCategory;
  categoryLabelId: string;
  categoryLabelEn: string;
  descriptionId: string;
  descriptionEn: string;
  price: number;
  isDefault: boolean;
  weightLbs: number;
  fuelCapacityGal?: number;
  fuelCapacityLbs?: number;
  rangeBonusNm?: number;
  missionSuitability: ('CAP' | 'CAS' | 'MARITIME' | 'SEAD' | 'STANDOFF' | 'FERRY' | 'RECON')[];
  hardpointStations: ('wingtip' | 'outboard' | 'inboard' | 'centerline' | 'conformal' | 'internal')[];
  iconType?: string;
  specs: {
    range?: string;
    guidance?: string;
    speed?: string;
    warhead?: string;
  };
}

export interface AircraftGenerationUpgrade {
  id: string;
  targetGeneration: '4.5' | '4++' | '5.0' | '5.5' | '6.0';
  generationBadge: string;
  titleId: string;
  titleEn: string;
  targetNameSuffix: string;
  descriptionId: string;
  descriptionEn: string;
  cost: number;
  requiredRank: string;
  requiredRankLevel: number; // 1: Letda, 2: Lettu, 3: Kapten, 4: Mayor, 5: Letkol, 6: Kolonel, 7: Marsma
  minFlightHours: number;
  requiredHangarLevel: number;
  statBoosts: {
    maxSpeed: string;
    cruiseSpeedBoost: number; // knots
    rangeBoost: string;
    ceiling: string;
    radarType: string;
    stealthRCS: string;
    gLimits: string;
  };
  keyFeatures: string[];
}

export interface IndividualPilot {
  id: string;
  name: string;
  callsign: string;
  rank: string;
  nrp: string; // Nomor Registrasi Prajurit
  role: 'PIC' | 'WSO' | 'WINGMAN_1' | 'WINGMAN_2' | 'FLIGHT_LEAD' | string;
  flightHours: number;
  rating: number; // 1 to 5 stars or score 70-100
  specialization: 'BVR Air Superiority' | 'Precision Strike CAS' | 'Tactical Intercept' | 'Electronic Warfare' | 'Night Ops' | 'Dogfight Ace' | string;
  status: 'READY' | 'IN_TRAINING' | 'TRAINING' | 'FATIGUED' | 'RESTING' | 'SORTIE';
  stamina: number; // 0-100
  gTolerance: number; // e.g. 9.0
  missionCount: number;
  medals: string[];
  avatarIcon?: string;
  assignedAircraftTail?: string;
  trainingUntil?: number;
}

export interface IndividualCrewMember {
  id: string;
  name: string;
  nrp: string;
  department: 'groundCrew' | 'technicians' | 'fuelCrew' | 'electricCrew' | string;
  division?: string;
  roleTitle: string;
  rank: string;
  rating: number; // 1 to 5 stars
  experienceLevel: number; // 1-5
  specialization: string;
  efficiencyScore: number; // 0-100%
  status: 'ACTIVE' | 'IN_TRAINING' | 'TRAINING' | 'ON_DUTY';
  tasksCompleted: number;
  certifications: string[];
  trainingUntil?: number;
}

export interface TrainingCourse {
  id: string;
  targetType: 'pilot' | 'ground' | 'technician' | 'fuel' | 'electric' | string;
  titleId?: string;
  titleEn?: string;
  nameId?: string;
  nameEn?: string;
  descriptionId: string;
  descriptionEn: string;
  durationSeconds: number;
  cost: number;
  statBoost: {
    ratingGain: number;
    specializationBadge?: string;
    efficiencyBonus?: number;
    description: string;
  };
  requiredRank?: string;
}

export interface PendingDeliveryItem {
  id: string;
  squadronId: string;
  type: 'AIRCRAFT' | 'HANGAR_UPGRADE' | 'APRON_UPGRADE' | 'CREW_RECRUITMENT' | 'TRAINING' | string;
  itemId?: string;
  titleId: string;
  titleEn: string;
  subtitle?: string;
  subtitleId?: string;
  subtitleEn?: string;
  totalDurationSeconds: number;
  startTime: number;
  finishTime: number;
  cost?: number;
  status?: 'PROCESSING' | 'COMPLETED' | string;
  iconType?: 'plane' | 'building' | 'users' | 'graduation' | string;
  data: any;
}

export interface SquadronCommissioningPipeline {
  squadronId: string;
  step: number; // 1: Charter/License, 2: Hangar, 3: Apron, 4: Crew Roster, 5: Pilot Academy, 6: First Aircraft Ferry
  charterPaid: boolean;
  hangarBuilt: boolean;
  apronBuilt: boolean;
  crewRecruited: boolean;
  pilotTrained: boolean;
  aircraftDelivered: boolean;
}

export interface CrewDepartment {
  nameId: string;
  nameEn: string;
  count: number;
  level: number;
  costPerUpgrade: number;
  descriptionId: string;
  descriptionEn: string;
  role: string;
}

export interface SquadronCrewRoster {
  flightCrew: {
    count: number;
    pilot: string;
    coPilot: string;
    callSign: string;
  };
  groundCrew: CrewDepartment;
  technicians: CrewDepartment;
  fuelCrew: CrewDepartment;
  electricCrew: CrewDepartment;
}

export interface FacilityState {
  level: number;
  capacity: number;
  maxLevel: number;
  upgradeCost: number;
  titleId: string;
  titleEn: string;
  descriptionId: string;
  descriptionEn: string;
  features: string[];
}

export interface PlayerProfile {
  email: string;
  commanderName: string;
  callsign: string;
  rank: string;
  branch: string;
  specialization: string;
  homeAirbase: string;
  squadron: string;
  primaryAircraftId: string;
}

export interface FlightManagement {
  crew: Crew;
  payload: number; // lbs
  combatMode: boolean;
  missionType: string;
  useSubTank?: boolean;
}

export type ScenarioType =
  | 'TURBULENCE'
  | 'TRAFFIC'
  | 'WEATHER'
  | 'ENGINE'
  | 'LANDING'
  | 'INTERCEPT'
  | 'SHADOW'
  | 'RTB'
  | 'SYSTEM'
  | 'INFO'
  | 'ESCORT';

export interface Scenario {
  id: string;
  type: ScenarioType | string;
  message?: string;
  title?: string;
  description?: string;
  actionRequired?: string;
  suggestedValue?: number;
  resolved: boolean;
  points?: number;
  fuelCost?: number;
  duration?: number;
}

export interface FlightPlan {
  id?: string;
  name?: string;
  aircraftId: string;
  initialFuel: number;
  waypoints: Waypoint[];
  flightManagement?: FlightManagement;
  timestamp?: number;
}

export interface SavedRoute extends FlightPlan {
  id: string;
  name: string;
  timestamp?: number;
}

export interface TrafficAircraft {
  id: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  altitude: number;
  callsign: string;
  ttl: number;
  isEnemy?: boolean;
}

export interface TankerAircraft {
  id: string;
  lat: number;
  lng: number;
  heading: number;
  state: 'spawning' | 'flying_to_wp' | 'refueling' | 'returning';
  distToBase?: number;
  wp: Waypoint;
  base: { lat: number; lng: number; icao?: string; name?: string };
  callsign: string;
}

export type EscortStage = 'idle' | 'pre_rendezvous' | 'refueling' | 'escorting' | 'vvip_landed' | 'complete';

export type ReconMissionPhase =
  | 'idle'
  | 'recon_planning'
  | 'recon_enroute'
  | 'recon_scanning'
  | 'intel_acquired'
  | 'awaiting_strike_scramble'
  | 'strike_enroute'
  | 'strike_engagement'
  | 'strike_success'
  | 'strike_rtb'
  | 'mission_completed';

export type TacticalReconMission =
  | 'Air Superiority'
  | 'Air Defense / Intercept'
  | 'Combat Air Patrol (CAP)'
  | 'Barrier CAP'
  | 'Escort'
  | 'VVIP Air Escort'
  | 'Strike'
  | 'Close Air Support (CAS)'
  | 'SEAD'
  | 'DEAD'
  | 'Anti-Ship'
  | 'Maritime Patrol / Interdiction'
  | 'Reconnaissance'
  | 'Armed Reconnaissance'
  | 'Tactical Interdiction'
  | 'Show of Force'
  | 'Air Policing'
  | 'Scramble'
  | 'Tanker Escort'
  | 'Recovery Escort'
  | 'Rescue / CSAR Escort'
  | 'Training / Exercise'
  | 'Flight pass';

export type ReconThreatType =
  | 'enemy_warship'
  | 'aircraft_carrier'
  | 'frigate'
  | 'enemy_submarine'
  | 'naval_drone'
  | 'enemy_fighter'
  | 'guerrilla_base'
  | 'anti_air_sam'
  | 'missile_base'
  | 'radar_station'
  | 'enemy_fighter_land'
  | 'insurgents'
  | 'radar_installation';

export type ReconCommandAction =
  | 'pengeboman'
  | 'penghancuran'
  | 'surveillance'
  | 'escorting';

export interface ReconIntelTarget {
  id: string;
  name: string;
  type: ReconThreatType;
  environment: 'sea' | 'land';
  assignedMission: TacticalReconMission | string;
  lat: number;
  lng: number;
  altitudeFt?: number;
  heading?: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  descriptionId: string;
  descriptionEn: string;
  actionRequired: ReconCommandAction;
  recommendedWeapons: string[];
  detectedAtWpIndex: number;
  isEliminated: boolean;
  engagementRadiusNM: number;
}

export interface ReconFlightData {
  aircraftId: string;
  pos: Position | null;
  heading: number;
  altitude: number;
  speed: number;
  currentWpIndex: number;
  scanProgress: number; // 0-100%
  sensorActive: boolean;
}

export interface ReconState {
  phase: ReconMissionPhase;
  selectedReconId: string;
  departureIcao: string;
  arrivalIcao: string;
  surveyPoints: Waypoint[];
  reconFlight: ReconFlightData;
  isOutOfScope: boolean;
  totalDistanceNM: number;
  maxRangeNM: number;
  detectedTargets: ReconIntelTarget[];
  activeTargetIndex: number;
  scrambleApproved: boolean;
  targetCoordsInput: { lat: string; lng: string };
  selectedWeapon: string;
  strikePayloadWeight: number;
  strikeTakeoffBaseIcao: string;
  strikeLandingBaseIcao: string;
  intelReportDispatched: boolean;
}

export interface FlightState {
  currentPos: Position | null;
  currentAltitude: number;
  speed: number | null;
  heading: number | null;
  verticalSpeed: number;
  targetAltitude: number;
  targetHeading: number;
  targetSpeed: number;
  autoPilot: boolean;
  flightDirector: boolean;
  combatMode: boolean;
  fuelRemaining: number;
  initialFuel: number;
  flightHours: number;
  points: number;
  isTracking: boolean;
  isSimulating: boolean;
  isRTB: boolean;
  missionType: string;
  escortStage: EscortStage;
}

export interface ActiveMission {
  id: string;
  missionNumber: number;
  name: string;
  callSign: string;
  missionType: string;
  selectedAircraft: Aircraft;
  crew: Crew;
  departureAirport: {
    id: string;
    name: string;
    icao: string;
    city?: string;
    lat: number;
    lng: number;
    region?: string;
    type?: string;
  } | null;
  arrivalAirport: {
    id: string;
    name: string;
    icao: string;
    city?: string;
    lat: number;
    lng: number;
    region?: string;
    type?: string;
  } | null;
  waypoints: Waypoint[];
  currentPos: Position | null;
  currentAltitude: number;
  speed: number;
  heading: number;
  targetAltitude: number;
  targetHeading: number;
  targetSpeed: number;
  verticalSpeed: number;
  autoPilot: boolean;
  combatMode: boolean;
  flightDirector: boolean;
  initialFuel: number;
  fuelRemaining: number;
  payload: number;
  useSubTank: boolean;
  isRTB: boolean;
  isSimulating: boolean;
  isTracking: boolean;
  flightHours: number;
  points: number;
  color: string;
  createdAt: number;
  vvipData?: {
    vvipTargetAircraft: Aircraft;
    vvipStartPoint: any | null;
    vvipEndPoint: any | null;
    rendezvousPoint: Waypoint | null;
    vvipPos: Position | null;
    vvipHeading: number;
    escortStage: EscortStage;
    vvipReachedRV: boolean;
    playerEta: number;
    vvipEta: number;
  };
  reconData?: {
    reconState: ReconState | null;
    selectedRecon: any | null;
    reconDeparture: any | null;
    reconArrival: any | null;
    reconSurveyPoints: Waypoint[];
  };
}
