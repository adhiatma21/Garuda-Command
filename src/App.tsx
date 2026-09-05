/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { 
  Trash2, 
  Play, 
  CheckCircle2, 
  Settings2,
  Plane,
  Shield,
  Navigation,
  Fuel,
  CloudRain,
  Activity,
  LayoutDashboard,
  Save,
  FolderOpen,
  Menu,
  X,
  User,
  Users,
  Target,
  History,
  Trophy,
  MapPin,
  Wind,
  Eye,
  EyeOff,
  Crosshair,
  Plus,
  Minus,
  Compass,
  FastForward,
  Landmark,
  LogOut,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Waypoint, 
  FlightPlan, 
  SavedRoute,
  Scenario, 
  PilotHistory, 
  Aircraft, 
  Position, 
  PlayerProfile,
  TrafficAircraft,
  TankerAircraft,
  EscortStage,
  ReconState,
  ReconIntelTarget,
  ReconFlightData,
  PlannerWaypoint,
  ActiveMission
} from './types';
import { getSquadronMissionCapacity } from './data/squadronState';
import { getDistance, getBearing, cn, calculateFuelPlan } from './lib/utils';
import { MILITARY_AIRPORTS, MilitaryAirport } from './airports';
import { AIRCRAFT_PRESETS } from './constants';
import { FlightTab } from './components/game/Sidebar/FlightTab';
import { SquadronTab } from './components/game/Sidebar/SquadronTab';
import { FinanceDashboard } from './components/game/finance/FinanceDashboard';
import { LogoutConfirmModal } from './components/game/LogoutConfirmModal';
import { HangarBayView } from './components/game/hangar/HangarBayView';
import { MissionOverlays } from './components/game/MissionOverlays';
import { TacticalRadarMap } from './components/game/TacticalRadarMap';
import { RefuelOptionsModal } from './components/game/RefuelOptionsModal';
import { NavIcon } from './components/ui/Buttons';
import { PlayerProfileInitialization } from './components/game/PlayerProfileInitialization';
import { SecuritySequence } from './components/game/profile/effects/SecuritySequence';
import { TacticalBackground } from './components/game/profile/effects/TacticalBackground';
import { evaluateEscortProximity, calculateVvipNextStep } from './engine/escortEngine';
import { calculatePlayerStep } from './engine/flightEngine';
import { calculateAircraftWeights } from './lib/weightCalculation';
import { stepTrafficSimulation, checkPatrolInterceptTarget } from './engine/trafficEngine';
import { CommsMessage, CommsState, createInitialCommsState, generatePeriodicFlightComms, generatePeriodicReconComms, processPlayerCustomTransmission } from './engine/aviationCommsEngine';
import { ReconAircraft, RECON_AIRCRAFT_LIST, getDefaultAirportsForRecon } from './data/reconAircraft';
import { createInitialReconState, stepReconFlight, generateReconIntelTargets, calculateReconTotalDistance } from './engine/reconEngine';
import { speechManager } from './engine/speechManager';


// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function App() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [currentPos, setCurrentPos] = useState<Position | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRTB, setIsRTB] = useState(false);
  const [currentAltitude, setCurrentAltitude] = useState<number>(0);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [landingScenarioTriggered, setLandingScenarioTriggered] = useState(false);
  const [showLandingChoice, setShowLandingChoice] = useState(false);
  const [showMissionSummary, setShowMissionSummary] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x, 5x, 10x, 50x

  // Multi-Mission Support State
  const [activeMissions, setActiveMissions] = useState<ActiveMission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [isRadioMuted, setIsRadioMuted] = useState<boolean>(false);
  const activeMissionsRef = useRef<ActiveMission[]>([]);
  activeMissionsRef.current = activeMissions;
  const selectedMissionIdRef = useRef<string | null>(null);
  selectedMissionIdRef.current = selectedMissionId;
  
  // Flight Control States
  const [autoPilot, setAutoPilot] = useState(true);
  const [flightDirector, setFlightDirector] = useState(true);
  const [targetHeading, setTargetHeading] = useState<number>(0);
  const [targetAltitude, setTargetAltitude] = useState<number>(25000);
  const [targetSpeed, setTargetSpeed] = useState<number>(450);
  const [verticalSpeed, setVerticalSpeed] = useState<number>(2000);

  // Derived targets for logic and communications
  const activeWp = waypoints.find(wp => !wp.reached);
  const currentAltitudeTarget = autoPilot ? (activeWp?.planAltitude || 25000) : targetAltitude;
  const currentSpeedTarget = autoPilot ? (activeWp?.planSpeed || 450) : targetSpeed;
  
  const [activeTab, setActiveTab] = useState<'flight' | 'squadron' | 'finance'>('flight');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('en');
  const [showWelcome, setShowWelcome] = useState(false);
  const [appPhase, setAppPhase] = useState<'boot' | 'profile' | 'loading' | 'main'>('boot');
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);

  // Toolbar & HUD visibility state
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const [crew, setCrew] = useState({
    pilot: '',
    coPilot: '',
    callSign: '',
    crewCount: 0,
    cabinCount: 0
  });
  const [payload, setPayload] = useState(0);
  const [combatMode, setCombatMode] = useState(false);
  const [missionType, setMissionType] = useState('');
  const [useSubTank, setUseSubTank] = useState(false);

  const [tankerAircraft, setTankerAircraft] = useState<TankerAircraft[]>([]);
  const [radarSweepAngle, setRadarSweepAngle] = useState(0);
  
  const [departureAirport, setDepartureAirport] = useState<MilitaryAirport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<MilitaryAirport | null>(null);
  const [departureSearch, setDepartureSearch] = useState('');
  const [arrivalSearch, setArrivalSearch] = useState('');
  
  const [aircraftFilter, setAircraftFilter] = useState<'all' | 'fighter' | 'transport'>('all');
  
  const [newWpName, setNewWpName] = useState('');
  const [newWpLat, setNewWpLat] = useState('');
  const [newWpLng, setNewWpLng] = useState('');
  const [newWpType, setNewWpType] = useState<Waypoint['type']>('waypoint');
  const [newWpAlt, setNewWpAlt] = useState('25000');
  const [newWpSpeed, setNewWpSpeed] = useState('450');

  const [utcTime, setUtcTime] = useState(new Date().toUTCString());
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [showResumeMenu, setShowResumeMenu] = useState(false);

  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft>(AIRCRAFT_PRESETS[0]);
  const [initialFuel, setInitialFuel] = useState(selectedAircraft.maxFuel);
  const [fuelRemaining, setFuelRemaining] = useState(selectedAircraft.maxFuel);
  const [missionComplete, setMissionComplete] = useState(false);
  const [isMenuMinimized, setIsMenuMinimized] = useState(false);
  const [points, setPoints] = useState(0);
  const [mapFollowAircraft, setMapFollowAircraft] = useState(true);
  const [otherTraffic, setOtherTraffic] = useState<TrafficAircraft[]>([]);
  const [trafficFrequency, setTrafficFrequency] = useState(5);
  const [isPatrolMission, setIsPatrolMission] = useState(false);
  const [interceptTarget, setInterceptTarget] = useState<TrafficAircraft | null>(null);
  const [tankerOrbit, setTankerOrbit] = useState<Position | null>(null);
  const [fuelCapacityMultiplier, setFuelCapacityMultiplier] = useState(1);
  const [isFuelValid, setIsFuelValid] = useState(true);
  const [centerMapTrigger, setCenterMapTrigger] = useState(0);
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const [isPickingTankerRV, setIsPickingTankerRV] = useState(false);
  const [isManualWaypointMode, setIsManualWaypointMode] = useState(false);
  const [isPickingReconSurvey, setIsPickingReconSurvey] = useState(false);
  const [isPickingVvipRV, setIsPickingVvipRV] = useState(false);
  const [plannerWaypoints, setPlannerWaypoints] = useState<PlannerWaypoint[]>([]);
  
  // VVIP Escort States
  const [vvipTargetAircraft, setVvipTargetAircraft] = useState<Aircraft>(AIRCRAFT_PRESETS.find(a => a.id === 'indonesia-one') || AIRCRAFT_PRESETS[0]);
  const [vvipStartPoint, setVvipStartPoint] = useState<MilitaryAirport | null>(null);
  const [vvipEndPoint, setVvipEndPoint] = useState<MilitaryAirport | null>(null);
  const [vvipStartSearch, setVvipStartSearch] = useState('');
  const [vvipEndSearch, setVvipEndSearch] = useState('');
  const [rendezvousPoint, setRendezvousPoint] = useState<Waypoint | null>(null);
  const [rendezvousLat, setRendezvousLat] = useState<string>('');
  const [rendezvousLng, setRendezvousLng] = useState<string>('');
  const [showRefuelOptions, setShowRefuelOptions] = useState(false);
  const [refuelDistance, setRefuelDistance] = useState(0);
  const [escortStage, setEscortStage] = useState<EscortStage>('idle');
  const [vvipPos, setVvipPos] = useState<Position | null>(null);
  const [vvipHeading, setVvipHeading] = useState(0);
  const [vvipReachedRV, setVvipReachedRV] = useState(false);
  const [vvipEta, setVvipEta] = useState<number | null>(null); // in seconds from start
  const [playerEta, setPlayerEta] = useState<number | null>(null);
  const [commsMessages, setCommsMessages] = useState<CommsMessage[]>([]);
  const commsStateRef = useRef<CommsState>(createInitialCommsState());

  const [flightHours, setFlightHours] = useState(0); // in minutes for easier calculation

  const [pilotHistory, setPilotHistory] = useState<PilotHistory[]>([]);

  // RECONNAISSANCE & ISR MISSION STATES
  const [selectedRecon, setSelectedRecon] = useState<ReconAircraft>(RECON_AIRCRAFT_LIST[0]);
  const [reconState, setReconState] = useState<ReconState>(() => createInitialReconState());
  const [reconDeparture, setReconDeparture] = useState<MilitaryAirport>(() => getDefaultAirportsForRecon(RECON_AIRCRAFT_LIST[0]).departure);
  const [reconArrival, setReconArrival] = useState<MilitaryAirport>(() => getDefaultAirportsForRecon(RECON_AIRCRAFT_LIST[0]).arrival);
  const [reconSurveyPoints, setReconSurveyPoints] = useState<Waypoint[]>([
    {
      id: 'survey-init-1',
      name: 'SEKTOR-INTEL 1 (Selat Malaka)',
      lat: 1.2500,
      lng: 104.4500,
      reached: false,
      type: 'waypoint',
      planAltitude: 28000,
      planSpeed: 140
    },
    {
      id: 'survey-init-2',
      name: 'SEKTOR-INTEL 2 (Bengkalis)',
      lat: 1.8500,
      lng: 101.9500,
      reached: false,
      type: 'waypoint',
      planAltitude: 28000,
      planSpeed: 140
    }
  ]);
  const [reconTargetLatInput, setReconTargetLatInput] = useState<string>('');
  const [reconTargetLngInput, setReconTargetLngInput] = useState<string>('');
  const [reconSelectedWeaponId, setReconSelectedWeaponId] = useState<string>('gbu-31');
  const [reconStrikeLandingBase, setReconStrikeLandingBase] = useState<MilitaryAirport>(MILITARY_AIRPORTS[0]);
  const [isReconSimulating, setIsReconSimulating] = useState<boolean>(false);
  const [isTargetLocked, setIsTargetLocked] = useState<boolean>(false);
  const [isStrikeCompleted, setIsStrikeCompleted] = useState<boolean>(false);

  const reconStateRef = useRef<ReconState>(reconState);
  const isReconSimulatingRef = useRef<boolean>(false);
  const selectedReconRef = useRef<ReconAircraft>(selectedRecon);
  const reconDepartureRef = useRef<MilitaryAirport>(reconDeparture);
  const reconArrivalRef = useRef<MilitaryAirport>(reconArrival);
  const reconSurveyPointsRef = useRef<Waypoint[]>(reconSurveyPoints);
  const reconTargetLatInputRef = useRef<string>('');
  const reconTargetLngInputRef = useRef<string>('');
  const isTargetLockedRef = useRef<boolean>(false);
  const isStrikeCompletedRef = useRef<boolean>(false);

  useEffect(() => { reconStateRef.current = reconState; }, [reconState]);
  useEffect(() => { isReconSimulatingRef.current = isReconSimulating; }, [isReconSimulating]);
  useEffect(() => { selectedReconRef.current = selectedRecon; }, [selectedRecon]);
  useEffect(() => { reconDepartureRef.current = reconDeparture; }, [reconDeparture]);
  useEffect(() => { reconArrivalRef.current = reconArrival; }, [reconArrival]);
  useEffect(() => { reconSurveyPointsRef.current = reconSurveyPoints; }, [reconSurveyPoints]);
  useEffect(() => { reconTargetLatInputRef.current = reconTargetLatInput; }, [reconTargetLatInput]);
  useEffect(() => { reconTargetLngInputRef.current = reconTargetLngInput; }, [reconTargetLngInput]);
  useEffect(() => { isTargetLockedRef.current = isTargetLocked; }, [isTargetLocked]);
  useEffect(() => { isStrikeCompletedRef.current = isStrikeCompleted; }, [isStrikeCompleted]);

  const watchId = useRef<number | null>(null);

  useEffect(() => {
    setFuelCapacityMultiplier(useSubTank ? 1.3 : 1.0);
  }, [useSubTank]);

  useEffect(() => {
    // When multi-missions are running, radio comms is text-only
    speechManager.setTextOnly(activeMissions.length > 1);
  }, [activeMissions.length]);

  useEffect(() => {
    speechManager.setMuted(isRadioMuted);
  }, [isRadioMuted]);

  const currentWeightCalculation = useMemo(() => {
    return calculateAircraftWeights(selectedAircraft, crew, payload, useSubTank, combatMode);
  }, [selectedAircraft, crew, payload, useSubTank, combatMode]);

  const effectiveBurnRateRef = useRef(currentWeightCalculation.effectiveBurnRate);
  useEffect(() => {
    effectiveBurnRateRef.current = currentWeightCalculation.effectiveBurnRate;
  }, [currentWeightCalculation.effectiveBurnRate]);

  const speak = useCallback((text: string, isATC = false, priority: 'normal' | 'urgent' = 'normal') => {
    speechManager.speak(text, isATC, language, priority);
  }, [language]);

  const atcRespond = useCallback((text: string) => {
    speechManager.speak(text, true, language);
  }, [language]);

  // Load saved routes and history on mount
  useEffect(() => {
    const saved = localStorage.getItem('ais_saved_routes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const deduped = parsed.map(r => {
            let id = r.id || crypto.randomUUID();
            if (seen.has(id)) {
              id = crypto.randomUUID();
            }
            seen.add(id);
            return { ...r, id };
          });
          setSavedRoutes(deduped);
        }
      } catch (e) {
        console.error('Failed to parse saved routes', e);
      }
    }

    const history = localStorage.getItem('ais_pilot_history');
    if (history) {
      try {
        const parsed = JSON.parse(history);
        if (Array.isArray(parsed)) {
          setPilotHistory(parsed);
        }
      } catch (e) {
        console.error('Failed to parse pilot history', e);
      }
    }
  }, []);

  // Save routes whenever savedRoutes changes
  useEffect(() => {
    localStorage.setItem('ais_saved_routes', JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  // Save history whenever pilotHistory changes
  useEffect(() => {
    localStorage.setItem('ais_pilot_history', JSON.stringify(pilotHistory));
  }, [pilotHistory]);

  const updatePilotHistory = useCallback(() => {
    setPilotHistory(prev => {
      const existing = prev.find(h => h.aircraftId === selectedAircraft.id);
      if (existing) {
        return prev.map(h => h.aircraftId === selectedAircraft.id ? {
          ...h,
          totalHours: h.totalHours + (flightHours / 60),
          totalPoints: h.totalPoints + points,
          missionsCompleted: h.missionsCompleted + 1
        } : h);
      } else {
        return [...prev, {
          aircraftId: selectedAircraft.id,
          aircraftName: selectedAircraft.name,
          totalHours: flightHours / 60,
          totalPoints: points,
          missionsCompleted: 1
        }];
      }
    });
  }, [selectedAircraft, flightHours, points]);

  const saveCurrentRoute = () => {
    if (waypoints.length === 0) return;
    const name = `${departureAirport?.icao || 'DEP'} - ${arrivalAirport?.icao || 'ARR'} (${new Date().toLocaleDateString()})`;
    const newPlan: SavedRoute = {
      id: crypto.randomUUID(),
      name,
      aircraftId: selectedAircraft.id,
      initialFuel,
      waypoints: waypoints,
      timestamp: Date.now(),
      flightManagement: {
        crew,
        payload,
        combatMode,
        missionType
      }
    };
    setSavedRoutes(prev => [...prev, newPlan]);
  };

  const deleteCurrentRoute = useCallback(() => {
    speechManager.clearQueue();
    // 1. Identify Home Base (from player profile, or current departure airport, or default airbase)
    const homeBase = (playerProfile?.homeBase ? {
      id: playerProfile.homeBase.id,
      name: playerProfile.homeBase.name,
      icao: playerProfile.homeBase.icao,
      city: playerProfile.homeBase.city || 'Pangkalan Utama',
      type: 'airbase' as const,
      lat: playerProfile.homeBase.lat,
      lng: playerProfile.homeBase.lng,
      region: 'INDONESIA'
    } : null) || (playerProfile?.homeAirbase ? {
      id: 'home-' + playerProfile.homeAirbase,
      name: playerProfile.homeAirbase,
      icao: MILITARY_AIRPORTS.find(a => a.name.toLowerCase().includes(playerProfile.homeAirbase.toLowerCase()))?.icao || 'WIHH',
      city: 'Home Airbase',
      type: 'airbase' as const,
      lat: MILITARY_AIRPORTS.find(a => a.name.toLowerCase().includes(playerProfile.homeAirbase.toLowerCase()))?.lat || -6.2667,
      lng: MILITARY_AIRPORTS.find(a => a.name.toLowerCase().includes(playerProfile.homeAirbase.toLowerCase()))?.lng || 106.8833,
      region: 'INDONESIA'
    } : null) || departureAirport || MILITARY_AIRPORTS[0];

    const basePos = { lat: homeBase.lat, lng: homeBase.lng };

    // 2. Clear all route waypoints & refs
    setWaypoints([]);
    waypointsRef.current = [];
    setNewWpName('');
    setNewWpLat('');
    setNewWpLng('');

    // 3. Reset Departure to Home Base & Clear Arrival
    setDepartureAirport(homeBase);
    setArrivalAirport(null);
    setDepartureSearch('');
    setArrivalSearch('');

    // 4. Reset All Mission Configurations & Mission Types
    setMissionType('');
    setMissionComplete(false);
    setIsPatrolMission(false);
    setInterceptTarget(null);
    setPayload(0);
    setCombatMode(false);
    setUseSubTank(false);

    // 5. Reset VVIP Escort Mission States
    setVvipStartPoint(null);
    setVvipEndPoint(null);
    setVvipStartSearch('');
    setVvipEndSearch('');
    setRendezvousPoint(null);
    rendezvousPointRef.current = null;
    setRendezvousLat('');
    setRendezvousLng('');
    setVvipPos(null);
    vvipPosRef.current = null;
    setVvipHeading(0);
    vvipHeadingRef.current = 0;
    setVvipReachedRV(false);
    vvipReachedRVRef.current = false;
    setVvipEta(null);
    setPlayerEta(null);
    setEscortStage('idle');
    escortStageRef.current = 'idle';

    // 6. Reset Tanker / Refuel states
    setTankerAircraft([]);
    setTankerOrbit(null);
    setShowRefuelOptions(false);
    setIsPickingTankerRV(false);

    // 6b. Reset Reconnaissance / Intel Strike Mission States
    setReconSurveyPoints([]);
    reconSurveyPointsRef.current = [];
    if (selectedReconRef.current) {
      setReconState(createInitialReconState(selectedReconRef.current));
      reconStateRef.current = createInitialReconState(selectedReconRef.current);
    }
    setIsReconSimulating(false);
    isReconSimulatingRef.current = false;
    setIsTargetLocked(false);
    isTargetLockedRef.current = false;
    setIsStrikeCompleted(false);
    isStrikeCompletedRef.current = false;
    setReconTargetLatInput('');
    reconTargetLatInputRef.current = '';
    setReconTargetLngInput('');
    reconTargetLngInputRef.current = '';

    // 7. Reset Aircraft location & physics directly to Home Base on the ground
    setCurrentPos(basePos);
    currentPosRef.current = basePos;
    setHeading(90);
    headingRef.current = 90;
    setTargetHeading(90);
    targetHeadingRef.current = 90;
    setCurrentAltitude(0);
    targetAltitudeRef.current = selectedAircraft.serviceCeiling || 25000;
    setTargetAltitude(selectedAircraft.serviceCeiling || 25000);
    setSpeed(0);
    speedRef.current = 0;
    targetSpeedRef.current = selectedAircraft.cruiseSpeed || 450;
    setTargetSpeed(selectedAircraft.cruiseSpeed || 450);
    setFuelRemaining(selectedAircraft.maxFuel || initialFuel);
    setInitialFuel(selectedAircraft.maxFuel);

    // 8. Reset Flight / Tracking / RTB / Simulation / Scenario State
    setIsTracking(false);
    setIsSimulating(false);
    setIsRTB(false);
    isRTBRef.current = false;
    setAutoPilot(true);
    autoPilotRef.current = true;
    setLandingScenarioTriggered(false);
    setShowLandingChoice(false);
    setShowMissionSummary(false);
    setActiveMissions([]);
    activeMissionsRef.current = [];
    setSelectedMissionId(null);
    selectedMissionIdRef.current = null;

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    // 9. Reset Radio Comms State
    setCommsMessages([]);
    commsStateRef.current = createInitialCommsState();
    commsAccumulatorRef.current = 0;

    // 10. Show clean scenario / notification confirmation
    setActiveScenario({
      id: 'route-deleted-' + Date.now(),
      title: language === 'id' ? 'RUTE & MISI DIHAPUS - PESAWAT DI BASE' : 'FLIGHT PLAN & MISSION CLEARED',
      message: language === 'id'
        ? `Semua rencana penerbangan dan misi telah berhasil dihapus. Pesawat kini kembali bersiaga di Pangkalan ${homeBase.icao} (${homeBase.name}) dalam status Siap Jalan.`
        : `All flight plans, waypoints, and active missions have been cleared. Aircraft has returned to Home Base ${homeBase.icao} (${homeBase.name}) in ready ground status.`,
      actionRequired: language === 'id' ? 'Rute dan misi kosong. Silakan atur rute baru atau pilih misi.' : 'Route cleared. You may configure a new flight route or select a mission.',
      type: 'TRAFFIC',
      resolved: true
    });

    // 11. Voice response
    speak(
      language === 'id'
        ? `Rencana penerbangan dan misi telah dihapus. Pesawat kembali di pangkalan ${homeBase.name}.`
        : `Flight plan and mission cleared. Aircraft reset to ${homeBase.name}.`
    );
  }, [departureAirport, playerProfile, selectedAircraft, initialFuel, language, speak]);

  const loadRoute = (plan: SavedRoute) => {
    setWaypoints(plan.waypoints);
    const dep = plan.waypoints.find(wp => wp.id.startsWith('dep-'));
    const arr = plan.waypoints.find(wp => wp.id.startsWith('arr-'));
    
    if (dep) {
      const airport = MILITARY_AIRPORTS.find(a => dep.id.includes(a.icao));
      if (airport) setDepartureAirport(airport);
    } else {
      setDepartureAirport(null);
    }

    if (arr) {
      const airport = MILITARY_AIRPORTS.find(a => arr.id.includes(a.icao));
      if (airport) setArrivalAirport(airport);
    } else {
      setArrivalAirport(null);
    }

    const aircraft = AIRCRAFT_PRESETS.find(ac => ac.id === plan.aircraftId);
    if (aircraft) setSelectedAircraft(aircraft);
    setInitialFuel(plan.initialFuel);

    if (plan.flightManagement) {
      setCrew(plan.flightManagement.crew);
      setPayload(plan.flightManagement.payload);
      setCombatMode(plan.flightManagement.combatMode);
      setMissionType(plan.flightManagement.missionType);
    }

    setShowResumeMenu(false);
  };

  const removeSavedRoute = (id: string) => {
    setSavedRoutes(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startTracking = useCallback(() => {
    // Check squadron capacity for concurrent missions
    const capacity = getSquadronMissionCapacity(playerProfile);
    if (activeMissions.length >= capacity.maxConcurrentMissions) {
      setActiveScenario({
        id: 'capacity-limit-' + Date.now(),
        type: 'TRAFFIC',
        message: language === 'id' ? 'BATAS KAPASITAS MISI TERCAPAI!' : 'MISSION CAPACITY LIMIT REACHED!',
        actionRequired: language === 'id' 
          ? `Kapasitas skuadron saat ini maksimal ${capacity.maxConcurrentMissions} misi bersamaan (Armada siap: ${capacity.fleetCount}, Kapasitas kru: ${capacity.crewCapacity}). Buka tab Skuadron untuk menambah armada pesawat atau merekrut kru.`
          : `Squadron maximum capacity is ${capacity.maxConcurrentMissions} concurrent missions (Ready fleet: ${capacity.fleetCount}, Crew capacity: ${capacity.crewCapacity}). Visit Squadron tab to acquire aircraft or recruit crew members.`,
        resolved: false
      });
      return;
    }

    if (!missionType) {
      setActiveScenario({
        id: 'validation-' + Date.now(),
        type: 'TRAFFIC',
        message: language === 'id' ? 'TIPE MISI BELUM DIPILIH!' : 'NO MISSION TYPE SELECTED!',
        actionRequired: language === 'id' ? 'Silakan pilih tipe misi operasional di tab Penerbangan!' : 'Please select an operational mission type in the Flight tab first!',
        resolved: false
      });
      return;
    }

    const callSign = crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01');

    // Check VVIP requirements first if mission is VVIP Escort
    if (missionType === 'VVIPEscort') {
      let startPt = vvipStartPoint || MILITARY_AIRPORTS[0];
      let endPt = vvipEndPoint || MILITARY_AIRPORTS[1];
      let rPoint = rendezvousPoint;

      if (!vvipStartPoint) setVvipStartPoint(startPt);
      if (!vvipEndPoint) setVvipEndPoint(endPt);

      // Auto-set manual rendezvous if coordinates are entered
      if (!rPoint && rendezvousLat && rendezvousLng) {
        const lat = parseFloat(rendezvousLat);
        const lng = parseFloat(rendezvousLng);
        if (!isNaN(lat) && !isNaN(lng)) {
          rPoint = {
            id: 'auto-manual-rv-' + Date.now(),
            name: language === 'id' ? 'Titik RV Manual' : 'Manual RV Point',
            lat,
            lng,
            reached: false,
            type: 'waypoint',
            isRV: true,
            planAltitude: 30000,
            planSpeed: selectedAircraft.cruiseSpeed
          };
          setRendezvousPoint(rPoint);
        }
      }

      // Auto-calculate intelligent midpoint Rendezvous if none specified
      if (!rPoint) {
        const midLat = (startPt.lat + endPt.lat) / 2;
        const midLng = (startPt.lng + endPt.lng) / 2;
        rPoint = {
          id: 'auto-rv-' + Date.now(),
          name: language === 'id' ? 'TITIK RENDEZVOUS (RV)' : 'RV POINT',
          lat: midLat,
          lng: midLng,
          reached: false,
          type: 'waypoint',
          isRV: true,
          planAltitude: 30000,
          planSpeed: selectedAircraft.cruiseSpeed
        };
        setRendezvousPoint(rPoint);
      }

      // Build structured escort route: [Player Departure] -> [Rendezvous Point (RV)] -> [VVIP Destination] -> (if different: [Player Arrival Base])
      const depBase = departureAirport || startPt;
      const vvipDestBase = endPt;
      const playerArrBase = arrivalAirport || null;

      const depWp: Waypoint = {
        id: 'escort-dep-' + Date.now(),
        name: language === 'id' ? `Base: ${depBase.icao}` : `DEP: ${depBase.icao}`,
        lat: depBase.lat,
        lng: depBase.lng,
        reached: false,
        type: 'airport',
        planAltitude: 0,
        planSpeed: 0
      };

      const rPointWp: Waypoint = {
        ...rPoint,
        id: rPoint.id || ('escort-rv-' + Date.now()),
        name: rPoint.name || (language === 'id' ? 'TITIK RENDEZVOUS (RV)' : 'RENDEZVOUS POINT (RV)'),
        isRV: true,
        reached: false
      };

      const vvipDestWp: Waypoint = {
        id: 'escort-vvip-dest-' + Date.now(),
        name: language === 'id' ? `VVIP Dest: ${vvipDestBase.icao}` : `VVIP Dest: ${vvipDestBase.icao}`,
        lat: vvipDestBase.lat,
        lng: vvipDestBase.lng,
        reached: false,
        type: 'airport',
        planAltitude: 26000,
        planSpeed: vvipTargetAircraft.cruiseSpeed || 440
      };

      const finalWps: Waypoint[] = [depWp, rPointWp, vvipDestWp];

      if (playerArrBase && playerArrBase.icao !== vvipDestBase.icao) {
        const playerArrWp: Waypoint = {
          id: 'escort-player-arr-' + Date.now(),
          name: language === 'id' ? `Kedatangan: ${playerArrBase.icao}` : `ARR: ${playerArrBase.icao}`,
          lat: playerArrBase.lat,
          lng: playerArrBase.lng,
          reached: false,
          type: 'airport',
          planAltitude: 0,
          planSpeed: 0
        };
        finalWps.push(playerArrWp);
      }

      setWaypoints(finalWps);
      waypointsRef.current = finalWps;

      // Range check
      const distToRendezvous = getDistance(departureAirport?.lat || startPt.lat, departureAirport?.lng || startPt.lng, rPoint.lat, rPoint.lng);
      const estimatedRange = initialFuel / selectedAircraft.burnRate;

      if (distToRendezvous > estimatedRange) {
        setRefuelDistance(distToRendezvous);
        setShowRefuelOptions(true);
        return;
      }

      // Calculate ETAs
      const vvipDistToRV = getDistance(startPt.lat, startPt.lng, rPoint.lat, rPoint.lng);
      const vvipSpeed = vvipTargetAircraft.cruiseSpeed || 440;
      const vTime = (vvipDistToRV / vvipSpeed) * 3600; 
      
      const pDistToRV = getDistance(departureAirport?.lat || startPt.lat, departureAirport?.lng || startPt.lng, rPoint.lat, rPoint.lng);
      const pSpeed = selectedAircraft.cruiseSpeed || 480;
      const pTime = (pDistToRV / pSpeed) * 3600;

      const vvipStartCoord = { lat: startPt.lat, lng: startPt.lng };
      const vvipHeadingVal = getBearing(startPt.lat, startPt.lng, rPoint.lat, rPoint.lng);

      setVvipEta(vTime);
      setPlayerEta(pTime);
      setVvipPos(vvipStartCoord);
      setVvipHeading(vvipHeadingVal);
      setEscortStage('pre_rendezvous');
      setVvipReachedRV(false);

      // Instantly sync refs
      vvipPosRef.current = vvipStartCoord;
      rendezvousPointRef.current = rPoint;
      vvipEndPointRef.current = endPt;
      escortStageRef.current = 'pre_rendezvous';
      vvipReachedRVRef.current = false;

      // Start player at departure or start point
      const pLat = departureAirport?.lat || startPt.lat;
      const pLng = departureAirport?.lng || startPt.lng;
      const playerStartCoord = { lat: pLat, lng: pLng };
      const playerHeadingVal = getBearing(pLat, pLng, rPoint.lat, rPoint.lng);

      setCurrentPos(playerStartCoord);
      setHeading(playerHeadingVal);
      currentPosRef.current = playerStartCoord;
      headingRef.current = playerHeadingVal;
    } else {
      // General missions
      if (waypoints.length < 2) {
        setActiveScenario({
          id: 'validation-' + Date.now(),
          type: 'TRAFFIC',
          message: language === 'id' ? 'RUTE TIDAK LENGKAP!' : 'INCOMPLETE ROUTE!',
          actionRequired: language === 'id' ? 'Tambahkan setidaknya 2 titik (Asal & Tujuan) di tab Rute!' : 'Add at least 2 points (Origin & Destination) in the Route tab!',
          resolved: false
        });
        return;
      }
      
      const pPos = { lat: waypoints[0].lat, lng: waypoints[0].lng };
      const pHdg = getBearing(waypoints[0].lat, waypoints[0].lng, waypoints[1]?.lat || waypoints[0].lat, waypoints[1]?.lng || waypoints[0].lng);
      setCurrentPos(pPos);
      setHeading(pHdg);
      currentPosRef.current = pPos;
      headingRef.current = pHdg;
    }

    setIsTracking(true);
    setIsSimulating(true);
    setFuelRemaining(initialFuel);
    setLandingScenarioTriggered(false);
    setCurrentAltitude(30000);
    setSpeed(selectedAircraft.cruiseSpeed);

    // Initial Tactical Radio Transmission Dispatch
    const timeStr = new Date().toTimeString().substring(0, 5) + 'Z';
    const initComms: CommsMessage[] = [
      {
        id: 'init-comms-1',
        timestamp: timeStr,
        sender: 'PILOT',
        callsign: callSign,
        frequency: '118.10 MHz',
        type: 'DEPARTURE',
        textId: `Garuda Tower, ${callSign} siap taxi untuk keberangkatan. Mohon otorisasi IFR rute misi ke FL300.`,
        textEn: `Garuda Tower, ${callSign} ready for taxi and departure. Requesting IFR clearance mission route to FL300.`
      },
      {
        id: 'init-comms-2',
        timestamp: timeStr,
        sender: 'ATC',
        callsign: 'GARUDA TOWER',
        frequency: '118.10 MHz',
        type: 'DEPARTURE',
        textId: `${callSign}, Garuda Tower. Otorisasi rute disetujui. Cleared for departure runway 16, angin 150/06 knot. Hubungi Radar pada 124.5 setelah airborne.`,
        textEn: `${callSign}, Garuda Tower. Flight plan cleared. Cleared for departure runway 16, wind 150 at 6 knots. Contact Radar on 124.5 when airborne.`
      }
    ];

    setCommsMessages(initComms);
    commsStateRef.current = createInitialCommsState();

    if (missionType === 'VVIPEscort') {
      speak(language === 'id' ? `Radio Check, Garuda Tower. Ini ${callSign}. Misi VVIP Escort siap dilaksanakan. Ijin start-up dan clearance rute, Flight Level 3-0-0.` : `Radio Check, Garuda Tower. This is ${callSign}. VVIP Escort mission standing by. Requesting engine start-up and flight plan clearance to Flight Level 3-0-0.`);
      atcRespond(language === 'id' ? `${callSign}, Garuda Tower. Loud and clear. Ijin start-up diberikan. Rute disetujui via rencana misi, lapor jika siap taxi. Angin satu-lima-zero derajat lima knot, landas pacu satu enam.` : `${callSign}, Garuda Tower. Loud and clear. Startup approved. Route cleared as filed. Report ready for taxi. Wind 150 at 5 knots, runway 16.`);
    } else {
      speak(language === 'id' ? `Menara, ${callSign} siap taxi untuk lepas landas. Mohon instruksi keberangkatan SID satu-alfa.` : `Tower, ${callSign} ready for taxi and departure. Requesting SID 1-Alpha instructions.`);
      atcRespond(language === 'id' ? `${callSign}, Garuda Tower. Ijin taxi ke holding point runway satu enam via taxiway Delta. Lapor jika siap lepas landas.` : `${callSign}, Garuda Tower. Taxi to holding point runway 16 via taxiway Delta. Report ready for departure.`);
    }

    // Create and register new ActiveMission for multi-mission capability
    const missionNumber = activeMissions.length + 1;
    const missionColors = ['#38bdf8', '#34d399', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4'];
    const assignedColor = missionColors[(missionNumber - 1) % missionColors.length];
    const missionCallSign = callSign;

    const missionStartPos = missionType === 'VVIPEscort'
      ? { lat: departureAirport?.lat || vvipStartPoint?.lat || 0, lng: departureAirport?.lng || vvipStartPoint?.lng || 0 }
      : { lat: waypoints[0]?.lat || 0, lng: waypoints[0]?.lng || 0 };

    const missionStartHdg = missionType === 'VVIPEscort'
      ? getBearing(missionStartPos.lat, missionStartPos.lng, rendezvousPoint?.lat || missionStartPos.lat, rendezvousPoint?.lng || missionStartPos.lng)
      : getBearing(waypoints[0]?.lat || 0, waypoints[0]?.lng || 0, waypoints[1]?.lat || waypoints[0]?.lat || 0, waypoints[1]?.lng || waypoints[0]?.lng || 0);

    const newActiveMission: ActiveMission = {
      id: 'mission-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      missionNumber,
      name: `Misi Running ${missionNumber}`,
      callSign: missionCallSign,
      missionType: missionType || 'General Flight',
      selectedAircraft: { ...selectedAircraft },
      crew: { ...crew, callSign: missionCallSign },
      departureAirport: departureAirport ? { ...departureAirport } : null,
      arrivalAirport: arrivalAirport ? { ...arrivalAirport } : null,
      waypoints: waypoints.map(w => ({ ...w })),
      currentPos: missionStartPos,
      currentAltitude: 30000,
      speed: selectedAircraft.cruiseSpeed || 450,
      heading: missionStartHdg,
      targetAltitude: targetAltitude || 25000,
      targetHeading: missionStartHdg,
      targetSpeed: selectedAircraft.cruiseSpeed || 450,
      verticalSpeed: 2000,
      autoPilot: true,
      combatMode: combatMode,
      flightDirector: true,
      initialFuel: initialFuel,
      fuelRemaining: initialFuel,
      payload: payload,
      useSubTank: useSubTank,
      isRTB: false,
      isSimulating: true,
      isTracking: true,
      flightHours: 0,
      points: 0,
      color: assignedColor,
      createdAt: Date.now(),
      vvipData: missionType === 'VVIPEscort' && vvipStartPoint && vvipEndPoint && rendezvousPoint ? {
        vvipTargetAircraft: { ...vvipTargetAircraft },
        vvipStartPoint: vvipStartPoint,
        vvipEndPoint: vvipEndPoint,
        rendezvousPoint: rendezvousPoint,
        vvipPos: { lat: vvipStartPoint.lat, lng: vvipStartPoint.lng },
        vvipHeading: getBearing(vvipStartPoint.lat, vvipStartPoint.lng, vvipEndPoint.lat, vvipEndPoint.lng),
        escortStage: 'pre_rendezvous',
        vvipReachedRV: false,
        playerEta: 0,
        vvipEta: 0
      } : undefined
    };

    setActiveMissions(prev => [...prev, newActiveMission]);
    setSelectedMissionId(newActiveMission.id);
    selectedMissionIdRef.current = newActiveMission.id;
  }, [waypoints, language, initialFuel, missionType, vvipStartPoint, vvipEndPoint, rendezvousPoint, selectedAircraft, departureAirport, arrivalAirport, rendezvousLat, rendezvousLng, vvipTargetAircraft, crew, targetAltitude, combatMode, payload, useSubTank, activeMissions.length, playerProfile, speak, atcRespond]);

  const handleSelectMission = useCallback((missionId: string | null) => {
    setSelectedMissionId(missionId);
    selectedMissionIdRef.current = missionId;
    if (!missionId) return;

    const targetMission = activeMissionsRef.current.find(m => m.id === missionId);
    if (targetMission) {
      if (targetMission.currentPos) {
        setCurrentPos(targetMission.currentPos);
        currentPosRef.current = targetMission.currentPos;
      }
      if (targetMission.heading !== undefined) {
        setHeading(targetMission.heading);
        headingRef.current = targetMission.heading;
      }
      setWaypoints(targetMission.waypoints);
      waypointsRef.current = targetMission.waypoints;
      setSelectedAircraft(targetMission.selectedAircraft);
      setCurrentAltitude(targetMission.currentAltitude);
      setSpeed(targetMission.speed);
      setAutoPilot(targetMission.autoPilot);
      autoPilotRef.current = targetMission.autoPilot;
      setIsRTB(targetMission.isRTB);
      isRTBRef.current = targetMission.isRTB;
      setCombatMode(targetMission.combatMode);
      setFuelRemaining(targetMission.fuelRemaining);
      setInitialFuel(targetMission.initialFuel);
      setPayload(targetMission.payload);
      setMissionType(targetMission.missionType);
      setCrew(targetMission.crew);
      if (targetMission.departureAirport) setDepartureAirport(targetMission.departureAirport);
      if (targetMission.arrivalAirport) setArrivalAirport(targetMission.arrivalAirport);
    }
  }, []);

  const handleRTBMission = useCallback((missionId: string) => {
    setActiveMissions(prev => prev.map(m => {
      if (m.id !== missionId) return m;
      const homeBase = m.departureAirport || MILITARY_AIRPORTS[0];
      const curPos = m.currentPos || { lat: homeBase.lat, lng: homeBase.lng };
      const rtbHdg = Math.round(getBearing(curPos.lat, curPos.lng, homeBase.lat, homeBase.lng));

      const rtbWps: Waypoint[] = [
        {
          id: 'rtb-start-' + Date.now(),
          name: language === 'id' ? 'TITIK RTB' : 'RTB POINT',
          lat: curPos.lat,
          lng: curPos.lng,
          reached: true,
          type: 'waypoint',
          planAltitude: m.currentAltitude,
          planSpeed: m.speed
        },
        {
          id: 'rtb-dest-' + Date.now(),
          name: `RTB: ${homeBase.name}`,
          lat: homeBase.lat,
          lng: homeBase.lng,
          reached: false,
          type: 'airport',
          planAltitude: 0,
          planSpeed: 160
        }
      ];

      return {
        ...m,
        isRTB: true,
        autoPilot: true,
        targetHeading: rtbHdg,
        waypoints: rtbWps
      };
    }));

    if (selectedMissionIdRef.current === missionId) {
      setIsRTB(true);
      isRTBRef.current = true;
      setAutoPilot(true);
      autoPilotRef.current = true;
    }
  }, [language]);

  const handleAbortMission = useCallback((missionId: string) => {
    setActiveMissions(prev => {
      const remaining = prev.filter(m => m.id !== missionId);
      if (remaining.length === 0) {
        setIsSimulating(false);
        setIsTracking(false);
        setSelectedMissionId(null);
        selectedMissionIdRef.current = null;
      } else if (selectedMissionIdRef.current === missionId) {
        const nextSelected = remaining[0].id;
        setSelectedMissionId(nextSelected);
        selectedMissionIdRef.current = nextSelected;
      }
      return remaining;
    });
  }, []);

  const handleAddNewMissionPlan = useCallback(() => {
    setSelectedMissionId(null);
    selectedMissionIdRef.current = null;

    const nextMissionNum = activeMissionsRef.current.length + 1;
    const nextPreset = AIRCRAFT_PRESETS[(nextMissionNum - 1) % AIRCRAFT_PRESETS.length];
    if (nextPreset) {
      setSelectedAircraft(nextPreset);
      setInitialFuel(nextPreset.maxFuel);
      setFuelRemaining(nextPreset.maxFuel);
      setTargetSpeed(nextPreset.cruiseSpeed || 450);
      setTargetAltitude(25000);
    }

    const newCallsign = `ELANG-0${nextMissionNum}`;
    setCrew(prev => ({ ...prev, callSign: newCallsign }));

    const home = playerProfile?.homeBase || MILITARY_AIRPORTS[0];
    const destination = MILITARY_AIRPORTS[nextMissionNum % MILITARY_AIRPORTS.length];

    setDepartureAirport(home);
    setArrivalAirport(destination);

    const readyWps: Waypoint[] = [
      {
        id: `dep-${Date.now()}`,
        name: home.name,
        lat: home.lat,
        lng: home.lng,
        reached: false,
        type: 'airport',
        planAltitude: 0,
        planSpeed: 0
      },
      {
        id: `dest-${Date.now() + 1}`,
        name: destination.name,
        lat: destination.lat,
        lng: destination.lng,
        reached: false,
        type: 'airport',
        planAltitude: 25000,
        planSpeed: nextPreset?.cruiseSpeed || 450
      }
    ];
    setWaypoints(readyWps);
    waypointsRef.current = readyWps;
    setIsRTB(false);
    isRTBRef.current = false;
  }, [playerProfile]);


  const startTrackingAfterRefuel = () => {
    setIsTracking(true);
    setIsSimulating(true);
    setFuelRemaining(initialFuel);
    setLandingScenarioTriggered(false);

    if (missionType === 'VVIPEscort' && vvipStartPoint && vvipEndPoint && rendezvousPoint) {
      setVvipPos({ lat: vvipStartPoint.lat, lng: vvipStartPoint.lng });
      setVvipHeading(getBearing(vvipStartPoint.lat, vvipStartPoint.lng, vvipEndPoint.lat, vvipEndPoint.lng));
      setEscortStage('pre_rendezvous');
    }

    if (waypoints.length > 0) {
      setCurrentPos({ lat: waypoints[0].lat, lng: waypoints[0].lng });
      setCurrentAltitude(waypoints[0].planAltitude || 30000);
      setSpeed(waypoints[0].planSpeed || selectedAircraft.cruiseSpeed);
    }
  };

  const stopTracking = useCallback(() => {
    speechManager.clearQueue();
    setIsTracking(false);
    setIsSimulating(false);
    setIsRTB(false);
    setActiveScenario(null);
  }, []);

  const handleConfirmLogout = (mode: 'restart' | 'switch_profile') => {
    speechManager.clearQueue();
    setIsTracking(false);
    setIsSimulating(false);
    setIsRTB(false);
    setShowLogoutModal(false);
    setActiveTab('flight');
    if (mode === 'restart') {
      setAppPhase('boot');
    } else {
      setAppPhase('profile');
    }
  };

  const handleRTB = () => {
    const curPos = currentPosRef.current || (waypoints.length > 0 ? { lat: waypoints[0].lat, lng: waypoints[0].lng } : null);
    if (!curPos) return;

    const homeBase = departureAirport || 
      (playerProfile?.homeBase ? {
        id: playerProfile.homeBase.id,
        name: playerProfile.homeBase.name,
        icao: playerProfile.homeBase.icao,
        city: playerProfile.homeBase.city || 'Pangkalan Utama',
        type: 'airbase' as const,
        lat: playerProfile.homeBase.lat,
        lng: playerProfile.homeBase.lng,
        region: 'INDONESIA'
      } : null) || 
      MILITARY_AIRPORTS[0];

    // Instantly execute direct RTB vectoring
    setIsRTB(true);
    isRTBRef.current = true;
    setAutoPilot(true);
    autoPilotRef.current = true;
    setIsSimulating(true);

    const rtbHdg = Math.round(getBearing(curPos.lat, curPos.lng, homeBase.lat, homeBase.lng));
    setTargetHeading(rtbHdg);
    targetHeadingRef.current = rtbHdg;

    const rtbStartWp: Waypoint = {
      id: 'rtb-start-' + Date.now(),
      name: language === 'id' ? 'TITIK RTB' : 'RTB POINT',
      lat: curPos.lat,
      lng: curPos.lng,
      reached: true,
      type: 'waypoint',
      planAltitude: currentAltitude,
      planSpeed: speed || selectedAircraft.cruiseSpeed || 450
    };

    const rtbDestWp: Waypoint = {
      id: 'rtb-base-' + Date.now(),
      name: `RTB: ${homeBase.icao} - ${homeBase.name}`,
      lat: homeBase.lat,
      lng: homeBase.lng,
      reached: false,
      type: 'airport',
      planAltitude: 3000,
      planSpeed: Math.min(320, selectedAircraft.cruiseSpeed || 450)
    };

    setWaypoints([rtbStartWp, rtbDestWp]);
    waypointsRef.current = [rtbStartWp, rtbDestWp];

    // Set RTB active scenario notification
    setActiveScenario({
      id: 'rtb-active',
      title: language === 'id' ? 'RETURN TO BASE (RTB)' : 'RETURN TO BASE (RTB)',
      message: language === 'id' 
        ? `Pesawat membatalkan misi dan bergerak langsung menuju Home Base (${homeBase.name}).` 
        : `Aircraft aborted mission and is vectoring directly to Home Base (${homeBase.name}).`,
      actionRequired: language === 'id' ? 'Pesawat menuju Home Base otomatis' : 'Aircraft navigating to Home Base on autopilot',
      type: 'RTB',
      resolved: false
    });

    const pilotCall = crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01');
    const timeStr = new Date().toTimeString().substring(0, 5) + 'Z';
    
    const rtbComms: CommsMessage[] = [
      {
        id: 'rtb-comms-' + Date.now(),
        timestamp: timeStr,
        sender: 'PILOT',
        callsign: pilotCall,
        frequency: '124.50 MHz',
        type: 'ENROUTE',
        textId: `Garuda Radar, ${pilotCall} membatalkan operasi. Meminta instruksi RTB (Return to Base) langsung ke pangkalan ${homeBase.name}.`,
        textEn: `Garuda Radar, ${pilotCall} aborting mission. Requesting immediate RTB direct to ${homeBase.name}.`
      },
      {
        id: 'rtb-comms-resp-' + Date.now(),
        timestamp: timeStr,
        sender: 'ATC',
        callsign: 'GARUDA RADAR',
        frequency: '124.50 MHz',
        type: 'ENROUTE',
        textId: `${pilotCall}, Garuda Radar diterima. Diijinkan RTB direct ke ${homeBase.icao}. Terbang haluan ${rtbHdg} derajat, turun dan pertahankan FL050. Angin tenang, runway aktif siap menyambut.`,
        textEn: `${pilotCall}, Garuda Radar roger. Cleared direct RTB to ${homeBase.icao}. Fly heading ${rtbHdg} degrees, descend and maintain FL050. Winds calm, active runway ready.`
      }
    ];

    setCommsMessages(prev => [...prev, ...rtbComms]);
    speak(language === 'id' ? `Garuda Radar, ${pilotCall} membatalkan misi. Melakukan RTB langsung ke ${homeBase.name}.` : `Garuda Radar, ${pilotCall} aborting mission. Executing direct RTB to ${homeBase.name}.`);
    setTimeout(() => {
      atcRespond(language === 'id' ? `${pilotCall}, Garuda Radar diterima. Diijinkan RTB ke ${homeBase.icao}. Terbang haluan ${rtbHdg} derajat.` : `${pilotCall}, Garuda Radar roger. Cleared RTB to ${homeBase.icao}. Fly heading ${rtbHdg} degrees.`);
    }, 2000);
  };

  const handleTransmitPlayerMessage = useCallback((customText: string) => {
    if (!customText.trim()) return;

    const result = processPlayerCustomTransmission(customText, {
      callsign: crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01'),
      language,
      currentAltitude: currentAltitudeTarget,
      speed: speedRef.current,
      fuelRemaining,
      missionType,
      escortStage: escortStageRef.current,
      vvipTargetAircraft,
      vvipEndPoint: vvipEndPointRef.current,
      departureAirport,
      activeWaypoint: waypointsRef.current.find(w => !w.reached) || null,
      selectedRecon: selectedReconRef.current,
      reconState: reconStateRef.current
    });

    // 1. Log and speak player transmission immediately
    setCommsMessages(prev => [...prev, result.playerMessage]);
    speak(language === 'id' ? result.playerMessage.textId : result.playerMessage.textEn, false);

    // 2. Add realistic contextual response from VVIP Pilot, ATC, or AWACS
    setTimeout(() => {
      setCommsMessages(prev => [...prev, result.responseMessage]);
      speak(
        language === 'id' ? result.responseMessage.textId : result.responseMessage.textEn,
        result.responseMessage.sender === 'ATC' || result.responseMessage.sender === 'AWACS'
      );
    }, 1400);
  }, [crew.callSign, language, currentAltitudeTarget, fuelRemaining, missionType, vvipTargetAircraft, departureAirport, speak]);

  const addWaypoint = () => {
    if (!newWpLat || !newWpLng) return;
    const wp: Waypoint = {
      id: crypto.randomUUID(),
      name: newWpName || `${newWpType.toUpperCase()} ${waypoints.length + 1}`,
      lat: parseFloat(newWpLat),
      lng: parseFloat(newWpLng),
      reached: false,
      type: newWpType,
      planAltitude: parseInt(newWpAlt),
      planSpeed: parseInt(newWpSpeed)
    };
    
    setWaypoints(prev => {
      const arrIdx = prev.findIndex(w => w.id.startsWith('arr-'));
      let newList;
      if (arrIdx !== -1) {
        newList = [...prev.slice(0, arrIdx), wp, ...prev.slice(arrIdx)];
      } else {
        newList = [...prev, wp];
      }
      return calculateFuelPlan(newList, initialFuel, currentWeightCalculation.effectiveBurnRate, selectedAircraft.cruiseSpeed);
    });

    setNewWpName('');
    setNewWpLat('');
    setNewWpLng('');
  };

  const removeWaypoint = (id: string) => {
    if (id.startsWith('dep-')) setDepartureAirport(null);
    if (id.startsWith('arr-')) setArrivalAirport(null);
    setWaypoints(prev => calculateFuelPlan(prev.filter(wp => wp.id !== id), initialFuel, currentWeightCalculation.effectiveBurnRate, selectedAircraft.cruiseSpeed));
  };

  const nextWaypoint = waypoints.find(wp => !wp.reached);

  // RECONNAISSANCE & STRIKE MISSION HANDLERS
  const handleSelectRecon = useCallback((recon: ReconAircraft) => {
    setSelectedRecon(recon);
    const defaults = getDefaultAirportsForRecon(recon);
    setReconDeparture(defaults.departure);
    setReconArrival(defaults.arrival);

    // Provide tactical survey points suitable for this aircraft / territory
    if (recon.countryOrigin === 'Indonesia' || recon.countryOrigin === 'Turki' || recon.countryOrigin === 'China') {
      setReconSurveyPoints([
        {
          id: 'survey-1-' + Date.now(),
          name: 'SEKTOR-INTEL 1 (Selat Malaka)',
          lat: 1.2500,
          lng: 104.4500,
          reached: false,
          type: 'waypoint',
          planAltitude: 28000,
          planSpeed: 140
        },
        {
          id: 'survey-2-' + Date.now(),
          name: 'SEKTOR-INTEL 2 (Bengkalis)',
          lat: 1.8500,
          lng: 101.9500,
          reached: false,
          type: 'waypoint',
          planAltitude: 28000,
          planSpeed: 140
        }
      ]);
    } else if (recon.countryOrigin === 'Singapura') {
      setReconSurveyPoints([
        {
          id: 'survey-sin-1-' + Date.now(),
          name: 'SEKTOR-INTEL 1 (Pedra Branca Area)',
          lat: 1.3300,
          lng: 104.4000,
          reached: false,
          type: 'waypoint',
          planAltitude: 32000,
          planSpeed: 220
        },
        {
          id: 'survey-sin-2-' + Date.now(),
          name: 'SEKTOR-INTEL 2 (South China Sea Edge)',
          lat: 2.1000,
          lng: 104.8500,
          reached: false,
          type: 'waypoint',
          planAltitude: 32000,
          planSpeed: 220
        }
      ]);
    } else if (recon.countryOrigin === 'Thailand') {
      setReconSurveyPoints([
        {
          id: 'survey-tha-1-' + Date.now(),
          name: 'SEKTOR-INTEL 1 (Gulf of Thailand North)',
          lat: 12.0000,
          lng: 101.0000,
          reached: false,
          type: 'waypoint',
          planAltitude: 26000,
          planSpeed: 130
        },
        {
          id: 'survey-tha-2-' + Date.now(),
          name: 'SEKTOR-INTEL 2 (Chonburi Coastal Sector)',
          lat: 12.8000,
          lng: 100.7000,
          reached: false,
          type: 'waypoint',
          planAltitude: 26000,
          planSpeed: 130
        }
      ]);
    } else if (recon.countryOrigin === 'Australia') {
      setReconSurveyPoints([
        {
          id: 'survey-aus-1-' + Date.now(),
          name: 'SEKTOR-INTEL 1 (Timor Sea Passage)',
          lat: -11.5000,
          lng: 128.0000,
          reached: false,
          type: 'waypoint',
          planAltitude: 38000,
          planSpeed: 280
        },
        {
          id: 'survey-aus-2-' + Date.now(),
          name: 'SEKTOR-INTEL 2 (Arafura Maritime Boundary)',
          lat: -10.2000,
          lng: 131.5000,
          reached: false,
          type: 'waypoint',
          planAltitude: 38000,
          planSpeed: 280
        }
      ]);
    }

    setReconState(createInitialReconState(recon));
    setIsReconSimulating(false);
    setIsTargetLocked(false);
    setIsStrikeCompleted(false);
  }, []);

  const handleSetReconSurveyPoints = useCallback((updater: Waypoint[] | ((prev: Waypoint[]) => Waypoint[])) => {
    setReconSurveyPoints(prev => {
      const nextPoints = typeof updater === 'function' ? updater(prev) : updater;
      reconSurveyPointsRef.current = nextPoints;
      setReconState(cur => {
        if (!cur) return null;
        return {
          ...cur,
          surveyPoints: nextPoints,
          totalDistanceNM: calculateReconTotalDistance(reconDepartureRef.current, nextPoints, reconArrivalRef.current)
        };
      });
      return nextPoints;
    });
  }, []);

  const handleSelectReconDeparture = useCallback((ap: MilitaryAirport) => {
    setReconDeparture(ap);
    reconDepartureRef.current = ap;
    setReconState(cur => {
      if (!cur) return null;
      return {
        ...cur,
        departureIcao: ap.icao,
        totalDistanceNM: calculateReconTotalDistance(ap, reconSurveyPointsRef.current, reconArrivalRef.current)
      };
    });
  }, []);

  const handleSelectReconArrival = useCallback((ap: MilitaryAirport) => {
    setReconArrival(ap);
    reconArrivalRef.current = ap;
    setReconState(cur => {
      if (!cur) return null;
      return {
        ...cur,
        arrivalIcao: ap.icao,
        totalDistanceNM: calculateReconTotalDistance(reconDepartureRef.current, reconSurveyPointsRef.current, ap)
      };
    });
  }, []);

  const handleStartReconFlight = useCallback(() => {
    if (!reconDeparture || !reconArrival) return;
    
    const initialPos: Position = { lat: reconDeparture.lat, lng: reconDeparture.lng };
    const firstTarget = reconSurveyPoints[0] || { lat: reconArrival.lat, lng: reconArrival.lng };
    const initialHdg = getBearing(initialPos.lat, initialPos.lng, firstTarget.lat, firstTarget.lng);

    const newFlightData: ReconFlightData = {
      aircraftId: selectedRecon.id,
      pos: initialPos,
      heading: initialHdg,
      altitude: selectedRecon.operatingAlt,
      speed: selectedRecon.cruiseSpeed,
      currentWpIndex: 0,
      scanProgress: 0,
      sensorActive: true
    };

    const newReconState: ReconState = {
      phase: 'recon_enroute',
      selectedReconId: selectedRecon.id,
      departureIcao: reconDeparture.icao,
      arrivalIcao: reconArrival.icao,
      surveyPoints: reconSurveyPoints,
      reconFlight: newFlightData,
      isOutOfScope: false,
      totalDistanceNM: calculateReconTotalDistance(reconDeparture, reconSurveyPoints, reconArrival),
      maxRangeNM: selectedRecon.maxRangeNM,
      detectedTargets: [],
      activeTargetIndex: 0,
      scrambleApproved: false,
      targetCoordsInput: { lat: '', lng: '' },
      selectedWeapon: reconSelectedWeaponId,
      strikePayloadWeight: 1000,
      strikeTakeoffBaseIcao: departureAirport?.icao || 'WIHH',
      strikeLandingBaseIcao: reconStrikeLandingBase?.icao || 'WIHH',
      intelReportDispatched: false
    };

    setReconState(newReconState);
    reconStateRef.current = newReconState;
    setIsReconSimulating(true);
    isReconSimulatingRef.current = true;
    setIsStrikeCompleted(false);
    setIsTargetLocked(false);

    speak(
      language === 'id'
        ? `Garuda Control, pesawat intai ${selectedRecon.name} (${selectedRecon.countryOrigin}) lepas landas dari ${reconDeparture.name}. Memulai patroli pengintaian ISR.`
        : `Garuda Control, ISR recon aircraft ${selectedRecon.name} (${selectedRecon.countryOrigin}) airborne from ${reconDeparture.name}. Survey mission commenced.`
    );
  }, [reconDeparture, reconArrival, reconSurveyPoints, selectedRecon, reconSelectedWeaponId, departureAirport, reconStrikeLandingBase, language, speak]);

  const handleScrambleStrike = useCallback(() => {
    const targets = reconStateRef.current?.detectedTargets || [];
    let lat = parseFloat(reconTargetLatInputRef.current || reconTargetLatInput);
    let lng = parseFloat(reconTargetLngInputRef.current || reconTargetLngInput);

    if (targets.length > 0) {
      const activeT = targets.find(t => !t.isEliminated) || targets[0];
      lat = activeT.lat;
      lng = activeT.lng;
      setReconTargetLatInput(lat.toFixed(4));
      reconTargetLatInputRef.current = lat.toFixed(4);
      setReconTargetLngInput(lng.toFixed(4));
      reconTargetLngInputRef.current = lng.toFixed(4);
    }

    if (isNaN(lat) || isNaN(lng)) {
      setActiveScenario({
        id: 'recon-err-' + Date.now(),
        title: language === 'id' ? 'KOORDINAT SASARAN KOSONG' : 'TARGET COORDINATES REQUIRED',
        message: language === 'id'
          ? 'Tentukan titik koordinat target (Latitude & Longitude) yang dikirim oleh pesawat intai!'
          : 'Please enter or select target coordinates sent by the ISR reconnaissance aircraft!',
        actionRequired: language === 'id' ? 'Isi koordinat target di Tactical Intel Console' : 'Set target coordinates in Tactical Intel Console',
        type: 'TRAFFIC',
        resolved: false
      });
      return;
    }

    const homeBase = departureAirport || reconDeparture || MILITARY_AIRPORTS[0];
    const landingBase = reconStrikeLandingBase || reconArrival || MILITARY_AIRPORTS[0];

    const strikeDepWp: Waypoint = {
      id: 'strike-dep-' + homeBase.icao,
      name: `DEP: ${homeBase.icao} - ${homeBase.name}`,
      lat: homeBase.lat,
      lng: homeBase.lng,
      reached: true,
      type: 'airport',
      planAltitude: 0,
      planSpeed: 0
    };

    const strikeTargetWps: Waypoint[] = targets.length > 0
      ? targets.map((t, idx) => ({
          id: 'strike-target-' + t.id,
          name: `🎯 [${t.assignedMission || 'STRIKE'}] ${t.name}`,
          lat: t.lat,
          lng: t.lng,
          reached: !!t.isEliminated,
          type: 'waypoint',
          planAltitude: 22000,
          planSpeed: selectedAircraft.cruiseSpeed || 480
        }))
      : [{
          id: 'strike-target-' + Date.now(),
          name: language === 'id' ? `🎯 SASARAN TEMPUR (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)` : `🎯 STRIKE TARGET (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
          lat: lat,
          lng: lng,
          reached: false,
          type: 'waypoint',
          planAltitude: 22000,
          planSpeed: selectedAircraft.cruiseSpeed || 480
        }];

    const strikeArrWp: Waypoint = {
      id: 'strike-arr-' + landingBase.icao,
      name: `RTB: ${landingBase.icao} - ${landingBase.name}`,
      lat: landingBase.lat,
      lng: landingBase.lng,
      reached: false,
      type: 'airport',
      planAltitude: 3000,
      planSpeed: 300
    };

    const newWaypoints = [strikeDepWp, ...strikeTargetWps, strikeArrWp];
    setWaypoints(newWaypoints);
    waypointsRef.current = newWaypoints;

    const startPos = { lat: homeBase.lat, lng: homeBase.lng };
    const initialHdg = getBearing(startPos.lat, startPos.lng, lat, lng);
    setCurrentPos(startPos);
    setHeading(initialHdg);
    currentPosRef.current = startPos;
    headingRef.current = initialHdg;

    setTargetHeading(initialHdg);
    targetHeadingRef.current = initialHdg;
    setCurrentAltitude(22000);
    setSpeed(selectedAircraft.cruiseSpeed || 480);
    setCombatMode(true);
    setIsTracking(true);
    setIsSimulating(true);
    setIsTargetLocked(false);
    isTargetLockedRef.current = false;
    setIsStrikeCompleted(false);
    isStrikeCompletedRef.current = false;

    setReconState(prev => prev ? ({
      ...prev,
      phase: 'strike_enroute',
      scrambleApproved: true,
      activeTargetIndex: 0
    }) : null);

    const call = crew.callSign || 'EAGLE-01';
    const targetCount = targets.length > 0 ? targets.length : 1;
    speak(
      language === 'id'
        ? `Garuda Control, ${call} SCRAMBLE! Tempur bersenjata lengkap meluncur menyelesaikan ${targetCount} sasaran intai. Target awal: ${lat.toFixed(2)}, ${lng.toFixed(2)}. Senjata siap!`
        : `Garuda Control, ${call} SCRAMBLE! Armed strike jet inbound to engage ${targetCount} recon target points. Initial vector: ${lat.toFixed(2)}, ${lng.toFixed(2)}. Weapons hot!`
    );

    atcRespond(
      language === 'id'
        ? `${call}, Garuda Command. Koridor serangan tempur dibuka. Selesaikan seluruh target intai secara berurutan. Otorisasi Weapons Free saat terkunci.`
        : `${call}, Garuda Command. Strike corridor open. Clear all recon targets sequentially. Weapons free authorized once locked on target.`
    );
  }, [reconTargetLatInput, reconTargetLngInput, departureAirport, reconDeparture, reconStrikeLandingBase, reconArrival, selectedAircraft, crew.callSign, language, speak, atcRespond]);

  const handleEngageTarget = useCallback(() => {
    const curTargets = reconStateRef.current?.detectedTargets || [];
    const currentUneliminatedIdx = curTargets.findIndex(t => !t.isEliminated);
    
    const targetToEliminate = currentUneliminatedIdx !== -1 ? curTargets[currentUneliminatedIdx] : null;
    const targetName = targetToEliminate?.name || (language === 'id' ? 'Sasaran Intai' : 'Intel Target');
    const targetMission = targetToEliminate?.assignedMission || 'Strike';

    setPoints(prev => prev + 1500);

    // Update target status in recon state
    const updatedTargets = curTargets.length > 0
      ? curTargets.map((t, idx) => idx === currentUneliminatedIdx ? { ...t, isEliminated: true } : t)
      : [];

    const remainingTargets = updatedTargets.filter(t => !t.isEliminated);
    const nextTarget = remainingTargets[0] || null;

    // Mark current target waypoint as reached
    setWaypoints(prev => {
      const activeWpIdx = prev.findIndex(w => !w.reached && w.type === 'waypoint');
      if (activeWpIdx !== -1) {
        const updated = [...prev];
        updated[activeWpIdx] = { ...updated[activeWpIdx], reached: true };
        return updated;
      }
      return prev;
    });

    const call = crew.callSign || 'EAGLE-01';

    if (nextTarget) {
      // More targets remaining! Vector to next target
      const nextIdx = updatedTargets.findIndex(t => !t.isEliminated);
      setReconState(prev => prev ? ({
        ...prev,
        phase: 'strike_enroute',
        activeTargetIndex: nextIdx,
        detectedTargets: updatedTargets
      }) : null);

      setReconTargetLatInput(nextTarget.lat.toFixed(4));
      reconTargetLatInputRef.current = nextTarget.lat.toFixed(4);
      setReconTargetLngInput(nextTarget.lng.toFixed(4));
      reconTargetLngInputRef.current = nextTarget.lng.toFixed(4);

      setIsTargetLocked(false);
      isTargetLockedRef.current = false;

      // Direct autopilot heading to next target
      if (currentPosRef.current) {
        const nextHdg = Math.round(getBearing(currentPosRef.current.lat, currentPosRef.current.lng, nextTarget.lat, nextTarget.lng));
        setTargetHeading(nextHdg);
        targetHeadingRef.current = nextHdg;
      }

      speak(
        language === 'id'
          ? `FOX THREE! Sasaran ${targetName} TERHANCURKAN! Beralih ke titik sasaran berikutnya: ${nextTarget.name} (${nextTarget.assignedMission || 'Strike'}). Haluan diarahkan!`
          : `FOX THREE! Target ${targetName} DESTROYED! Vectoring to next target: ${nextTarget.name} (${nextTarget.assignedMission || 'Strike'}). Heading updated!`
      );

      atcRespond(
        language === 'id'
          ? `${call}, sasaran terkonfirmasi dinetralisir. Lanjutkan misi ke sasaran intel berikutnya: ${nextTarget.name}. Radar memandu haluan.`
          : `${call}, direct hit confirmed. Proceed to engage next intel target: ${nextTarget.name}. Radar vectoring you in.`
      );
    } else {
      // All targets eliminated!
      setIsStrikeCompleted(true);
      isStrikeCompletedRef.current = true;
      setIsTargetLocked(false);
      isTargetLockedRef.current = false;

      setReconState(prev => prev ? ({
        ...prev,
        phase: 'strike_success',
        detectedTargets: updatedTargets
      }) : null);

      const landingBase = reconStrikeLandingBase || reconArrival || MILITARY_AIRPORTS[0];
      if (currentPosRef.current) {
        const rtbHdg = Math.round(getBearing(currentPosRef.current.lat, currentPosRef.current.lng, landingBase.lat, landingBase.lng));
        setTargetHeading(rtbHdg);
        targetHeadingRef.current = rtbHdg;
      }

      speak(
        language === 'id'
          ? `FOX THREE! SEMUA SASARAN TELAH BERHASIL DIHANCURKAN! Seluruh target intai dinetralisir. ${call} kembali ke pangkalan pendaratan ${landingBase.name}.`
          : `FOX THREE! ALL RECON TARGETS DESTROYED! All intel threats neutralized. ${call} proceeding to recovery base ${landingBase.name}.`
      );

      atcRespond(
        language === 'id'
          ? `Kerja luar biasa ${call}! Seluruh target pengintaian telah dihancurkan dengan sempurna. Diizinkan mendarat di ${landingBase.icao}.`
          : `Outstanding job ${call}! All reconnaissance targets eliminated successfully. Cleared for recovery landing at ${landingBase.icao}.`
      );
    }
  }, [reconStateRef, language, crew.callSign, reconStrikeLandingBase, reconArrival, speak, atcRespond]);

  // Dedicated Recon Simulation Loop (High-Frequency 100ms)
  useEffect(() => {
    if (!isReconSimulating || !reconArrival) return;

    const interval = setInterval(() => {
      const currentSimSpeed = simulationSpeedRef.current;
      const currentSelectedRecon = selectedReconRef.current;
      const arrivalCoord = { lat: reconArrival.lat, lng: reconArrival.lng };

      setReconState(prevState => {
        const result = stepReconFlight(
          prevState.reconFlight,
          prevState.surveyPoints,
          arrivalCoord,
          0.1,
          currentSimSpeed
        );

        let updatedTargets = prevState.detectedTargets;
        let newPhase = prevState.phase;

        // Target detection triggered at survey point
        if (result.justReachedWpIndex !== null && result.justReachedWpIndex < prevState.surveyPoints.length) {
          const reachedWp = prevState.surveyPoints[result.justReachedWpIndex];
          if (reachedWp) {
            const newlyDetected = generateReconIntelTargets([reachedWp], currentSelectedRecon);
            
            // Auto-populate target coordinates for strike pilot
            if (newlyDetected.length > 0) {
              setReconTargetLatInput(newlyDetected[0].lat.toFixed(4));
              setReconTargetLngInput(newlyDetected[0].lng.toFixed(4));
              reconTargetLatInputRef.current = newlyDetected[0].lat.toFixed(4);
              reconTargetLngInputRef.current = newlyDetected[0].lng.toFixed(4);

              speak(
                language === 'id'
                  ? `INTEL DITERIMA! Pesawat intai ${currentSelectedRecon.name} mendeteksi sasaran di koordinat ${newlyDetected[0].lat.toFixed(2)}, ${newlyDetected[0].lng.toFixed(2)}. Data koordinat dikirimkan ke kokpit tempur.`
                  : `INTEL ACQUIRED! Recon ${currentSelectedRecon.name} detected target at ${newlyDetected[0].lat.toFixed(2)}, ${newlyDetected[0].lng.toFixed(2)}. Target coordinates transmitted to strike cockpit.`
              );
            }

            updatedTargets = [...prevState.detectedTargets, ...newlyDetected];
            newPhase = 'intel_acquired';
          }
        }

        if (result.hasCompletedAllSurvey && newPhase !== 'strike_enroute' && newPhase !== 'strike_engagement' && newPhase !== 'strike_success') {
          newPhase = 'mission_completed';
        }

        return {
          ...prevState,
          phase: newPhase,
          reconFlight: result.newFlight,
          detectedTargets: updatedTargets
        };
      });

      // Generate High-Intensity 3-Way Tactical Radio Comms between Recon, Tower, and Player Strike Jet
      const reconCommsResult = generatePeriodicReconComms(
        Date.now() / 1000,
        commsStateRef.current,
        {
          callsign: crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01'),
          language,
          reconState: reconStateRef.current,
          selectedRecon: currentSelectedRecon,
          reconDeparture: reconDepartureRef.current,
          reconArrival: reconArrivalRef.current,
          isTargetLocked: isTargetLockedRef.current,
          isStrikeCompleted: isStrikeCompletedRef.current
        }
      );

      if (reconCommsResult.messages.length > 0) {
        commsStateRef.current = reconCommsResult.updatedState;
        setCommsMessages(prev => [...prev, ...reconCommsResult.messages]);
        reconCommsResult.messages.forEach((msg) => {
          const text = language === 'id' ? msg.textId : msg.textEn;
          speak(text, msg.sender === 'TOWER' || msg.sender === 'ATC' || msg.sender === 'AWACS');
        });
      }

      // Check player proximity to target for Target Lock
      const curPos = currentPosRef.current;
      const tLat = parseFloat(reconTargetLatInputRef.current);
      const tLng = parseFloat(reconTargetLngInputRef.current);

      if (curPos && !isNaN(tLat) && !isNaN(tLng) && !isStrikeCompletedRef.current) {
        const distToTarget = getDistance(curPos.lat, curPos.lng, tLat, tLng);
        if (distToTarget <= 6 && !isTargetLockedRef.current) {
          setIsTargetLocked(true);
          isTargetLockedRef.current = true;
          setReconState(prev => ({
            ...prev,
            phase: 'strike_engagement'
          }));
          speak(
            language === 'id'
              ? 'TARGET LOCK! Sasaran terkunci pada jarak tembak optimal. Tekan Luncurkan Serangan!'
              : 'TARGET LOCKED! Within engagement envelope. Press Engage Target to fire!'
          );
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isReconSimulating, reconArrival, language, speak]);

  const currentPosRef = useRef<Position | null>(null);
  const vvipPosRef = useRef<Position | null>(null);
  const waypointsRef = useRef<Waypoint[]>([]);
  const simulationSpeedRef = useRef<number>(1);
  const autoPilotRef = useRef<boolean>(true);
  const targetHeadingRef = useRef<number>(0);
  const targetAltitudeRef = useRef<number>(25000);
  const targetSpeedRef = useRef<number>(450);
  const verticalSpeedRef = useRef<number>(2000);
  const speedRef = useRef<number | null>(null);
  const headingRef = useRef<number | null>(null);
  const vvipHeadingRef = useRef<number>(0);
  const escortStageRef = useRef<EscortStage>('pre_rendezvous');
  const vvipReachedRVRef = useRef<boolean>(false);
  const rendezvousPointRef = useRef<Waypoint | null>(null);
  const vvipEndPointRef = useRef<MilitaryAirport | null>(null);
  const arrivalAirportRef = useRef<MilitaryAirport | null>(null);
  const isRTBRef = useRef<boolean>(false);
  const commsAccumulatorRef = useRef<number>(0);

  useEffect(() => { currentPosRef.current = currentPos; }, [currentPos]);
  useEffect(() => { vvipPosRef.current = vvipPos; }, [vvipPos]);
  useEffect(() => { waypointsRef.current = waypoints; }, [waypoints]);
  useEffect(() => { simulationSpeedRef.current = simulationSpeed; }, [simulationSpeed]);
  useEffect(() => { autoPilotRef.current = autoPilot; }, [autoPilot]);
  useEffect(() => { targetHeadingRef.current = targetHeading; }, [targetHeading]);
  useEffect(() => { targetAltitudeRef.current = targetAltitude; }, [targetAltitude]);
  useEffect(() => { targetSpeedRef.current = targetSpeed; }, [targetSpeed]);
  useEffect(() => { verticalSpeedRef.current = verticalSpeed; }, [verticalSpeed]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { headingRef.current = heading; }, [heading]);
  useEffect(() => { vvipHeadingRef.current = vvipHeading; }, [vvipHeading]);
  useEffect(() => { escortStageRef.current = escortStage; }, [escortStage]);
  useEffect(() => { vvipReachedRVRef.current = vvipReachedRV; }, [vvipReachedRV]);
  useEffect(() => { rendezvousPointRef.current = rendezvousPoint; }, [rendezvousPoint]);
  useEffect(() => { vvipEndPointRef.current = vvipEndPoint; }, [vvipEndPoint]);
  useEffect(() => { arrivalAirportRef.current = arrivalAirport; }, [arrivalAirport]);
  useEffect(() => { isRTBRef.current = isRTB; }, [isRTB]);

  // Radar Sweep Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarSweepAngle(prev => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Primary Simulation Loop (100ms Smooth High-Frequency Physics)
  useEffect(() => {
    if (!isSimulating) return;

    const dtSeconds = 0.1; // 100ms tick interval
    const gameTimeScale = 8; // Responsive game simulation speed pacing

    const interval = setInterval(() => {
      const simSpeed = simulationSpeedRef.current;
      const ap = autoPilotRef.current;
      const targetH = targetHeadingRef.current;
      const targetA = targetAltitudeRef.current;
      const curSpeed = (speedRef.current || 450);
      const vSpd = verticalSpeedRef.current;

      // 1. Evaluate VVIP Escort Proximity & Automatic Transition
      if (missionType === 'VVIPEscort') {
        const proximityResult = evaluateEscortProximity({
          playerPos: currentPosRef.current,
          vvipPos: vvipPosRef.current,
          rendezvousPoint: rendezvousPointRef.current,
          vvipEndPoint: vvipEndPointRef.current,
          arrivalAirport: arrivalAirportRef.current,
          currentEscortStage: escortStageRef.current,
          vvipReachedRV: vvipReachedRVRef.current
        });

        // 1A. Rendezvous Meeting Transition -> ESCORT ACTIVE
        if (proximityResult.shouldTransitionToEscorting) {
          setEscortStage('escorting');
          escortStageRef.current = 'escorting';
          setVvipReachedRV(true);
          vvipReachedRVRef.current = true;

          // Mark Rendezvous Point as reached for player navigation so autopilot smoothly advances to destination
          setWaypoints(prev => {
            const updated = prev.map(wp => 
              (wp.isRV || (rendezvousPointRef.current && wp.id === rendezvousPointRef.current.id)) 
                ? { ...wp, reached: true, timestamp: Date.now() } 
                : wp
            );

            // Ensure destination waypoint exists for VVIP destination endpoint
            const hasRemaining = updated.some(w => !w.reached && !w.isRV);
            if (!hasRemaining && vvipEndPointRef.current) {
              const endPt = vvipEndPointRef.current;
              const destWp: Waypoint = {
                id: 'vvip-dest-' + endPt.icao + '-' + Date.now(),
                name: language === 'id' ? `DESTINASI VVIP: ${endPt.name} (${endPt.icao})` : `VVIP DESTINATION: ${endPt.name} (${endPt.icao})`,
                lat: endPt.lat,
                lng: endPt.lng,
                reached: false,
                type: 'airport',
                planAltitude: 26000,
                planSpeed: vvipTargetAircraft.cruiseSpeed || 440
              };
              return [...updated, destWp];
            }
            return updated;
          });

          const callSign = crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01');
          speak(
            language === 'id' 
              ? `Tally-ho! Visual pada VVIP. ${callSign} bergabung formasi pengawalan (ESCORT ACTIVE). Beriringan menuju destinasi.` 
              : `Tally! Visual on VVIP. ${callSign} in escort formation (ESCORT ACTIVE). Enroute in formation to destination.`
          );
          atcRespond(
            language === 'id' 
              ? `${callSign}, Garuda Radar. Status ESCORT ACTIVE dikonfirmasi. Koridor penerbangan VVIP terjamin aman hingga destinasi.` 
              : `${callSign}, Garuda Radar. Roger. ESCORT ACTIVE confirmed. Secure air corridor cleared to destination.`
          );
        }

        // 1B. VVIP Reaches Destination & Lands, but Player proceeds to Arrival Base
        if (proximityResult.shouldTransitionToVvipLanded) {
          setEscortStage('vvip_landed');
          escortStageRef.current = 'vvip_landed';
          setPoints(prev => prev + 500); // Award VVIP escort success points!

          // Mark VVIP Destination waypoint as reached so autopilot advances to player's arrival base
          setWaypoints(prev => {
            return prev.map(wp => {
              if (!wp.reached && vvipEndPointRef.current && (
                wp.id.includes('vvip-dest') || 
                (getDistance(wp.lat, wp.lng, vvipEndPointRef.current.lat, vvipEndPointRef.current.lng) < 2.5)
              )) {
                return { ...wp, reached: true, timestamp: Date.now() };
              }
              return wp;
            });
          });

          const callSign = crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01');
          const destName = vvipEndPointRef.current?.name || 'Destinasi';
          const arrName = arrivalAirportRef.current?.name || 'Homebase';

          speak(
            language === 'id'
              ? `INDONESIA-01 mendarat selamat di ${destName}. ${callSign} melanjutkan navigasi ke pangkalan kedatangan ${arrName}.`
              : `INDONESIA-01 safely landed at ${destName}. ${callSign} proceeding navigation to arrival airbase ${arrName}.`
          );
        }

        // 1C. Full Mission Completion (Award points, record history, show summary)
        if (proximityResult.shouldTransitionToComplete) {
          setEscortStage('complete');
          escortStageRef.current = 'complete';
          setPoints(prev => prev + 500);
          setWaypoints(prev => prev.map(wp => ({ ...wp, reached: true })));
          setIsSimulating(false);
          setIsTracking(false);
          setMissionComplete(true);
          updatePilotHistory();
        }
      }

      // 2. Move Player Aircraft smoothly
      setCurrentPos(prevPos => {
        if (!prevPos) return null;
        
        const nextWp = waypointsRef.current.find(w => !w.reached);
        if (!nextWp && ap) {
           return prevPos;
        }

        const isHoldingRV = missionType === 'VVIPEscort' && 
          escortStageRef.current === 'pre_rendezvous' && 
          (
            (!!nextWp?.isRV && getDistance(prevPos.lat, prevPos.lng, nextWp.lat, nextWp.lng) <= 1.5) ||
            (rendezvousPointRef.current && getDistance(prevPos.lat, prevPos.lng, rendezvousPointRef.current.lat, rendezvousPointRef.current.lng) <= 1.5)
          );

        const playerStep = calculatePlayerStep(
          prevPos,
          headingRef.current,
          curSpeed,
          targetH,
          ap,
          nextWp || null,
          simSpeed,
          selectedAircraft,
          isHoldingRV,
          dtSeconds,
          gameTimeScale,
          effectiveBurnRateRef.current
        );

        setHeading(playerStep.nextHeading);
        setFuelRemaining(prevF => Math.max(0, prevF - playerStep.fuelBurned));
        setFlightHours(prevH => prevH + playerStep.flightHoursGained);

        return playerStep.nextPos;
      });

      // 2B. Step All Active Multi-Missions Smoothly
      if (activeMissionsRef.current.length > 0) {
        setActiveMissions(prevMissions => {
          return prevMissions.map(m => {
            if (!m.isSimulating || !m.currentPos) return m;

            const mCurSpeed = m.speed || m.selectedAircraft?.cruiseSpeed || 450;
            const mNextWp = m.waypoints.find(w => !w.reached);

            const mStep = calculatePlayerStep(
              m.currentPos,
              m.heading,
              mCurSpeed,
              m.targetHeading,
              m.autoPilot,
              mNextWp || null,
              simSpeed,
              m.selectedAircraft,
              false,
              dtSeconds,
              gameTimeScale,
              m.selectedAircraft.fuelBurnRate || 1200
            );

            let updatedWps = m.waypoints;
            if (mNextWp) {
              const d = getDistance(mStep.nextPos.lat, mStep.nextPos.lng, mNextWp.lat, mNextWp.lng);
              const thresh = Math.max(0.8, (mCurSpeed / 3600) * simSpeed * gameTimeScale * dtSeconds * 1.5);
              if (d <= thresh) {
                updatedWps = m.waypoints.map(w => w.id === mNextWp.id ? { ...w, reached: true, timestamp: Date.now() } : w);
              }
            }

            return {
              ...m,
              currentPos: mStep.nextPos,
              heading: mStep.nextHeading,
              fuelRemaining: Math.max(0, m.fuelRemaining - mStep.fuelBurned),
              flightHours: (m.flightHours || 0) + mStep.flightHoursGained,
              waypoints: updatedWps
            };
          });
        });

        // Sync currently selected mission to primary telemetry
        if (selectedMissionIdRef.current) {
          const curSelected = activeMissionsRef.current.find(m => m.id === selectedMissionIdRef.current);
          if (curSelected && curSelected.currentPos) {
            setCurrentPos(curSelected.currentPos);
            currentPosRef.current = curSelected.currentPos;
            setHeading(curSelected.heading);
            headingRef.current = curSelected.heading;
            setFuelRemaining(curSelected.fuelRemaining);
            setSpeed(curSelected.speed);
            setCurrentAltitude(curSelected.currentAltitude);
          }
        }
      }

      // 3. Mark Waypoints as Reached for Missions & RTB Handling
      setWaypoints(prev => {
        const nextIdx = prev.findIndex(w => !w.reached);
        if (nextIdx === -1) return prev;
        const nextWp = prev[nextIdx];
        const playerPos = currentPosRef.current;
        if (playerPos) {
          const d = getDistance(playerPos.lat, playerPos.lng, nextWp.lat, nextWp.lng);
          const thresh = Math.max(0.6, (curSpeed / 3600) * simSpeed * gameTimeScale * dtSeconds * 1.5);
          if (d <= thresh) {
            // For VVIP mission at RV point before visual contact, wait in orbit
            if (nextWp.isRV && missionType === 'VVIPEscort' && escortStageRef.current === 'pre_rendezvous') {
              return prev;
            }

            const updated = [...prev];
            updated[nextIdx] = { ...nextWp, reached: true, timestamp: Date.now() };
            
            // Check if last waypoint reached
            if (nextIdx === prev.length - 1) {
              if (isRTBRef.current) {
                // RTB REACHED! Clean up and clear mission as requested
                setIsSimulating(false);
                setIsTracking(false);
                setIsRTB(false);
                isRTBRef.current = false;
                setActiveScenario(null);
                setArrivalAirport(null);

                const baseName = departureAirport?.name || playerProfile?.homeBase?.name || 'Home Base';
                
                speak(
                  language === 'id' 
                    ? `Menara, ${crew.callSign || 'Pesawat'} mendarat di pangkalan ${baseName}. Misi selesai dibatalkan dan dibersihkan.` 
                    : `Tower, ${crew.callSign || 'Aircraft'} touched down safely at ${baseName}. Mission completed and cleared.`
                );

                // Clear waypoints and reset active mission!
                setTimeout(() => {
                  setWaypoints([]);
                  waypointsRef.current = [];
                }, 100);

                return [];
              } else {
                speechManager.clearQueue();
                setIsSimulating(false);
                setIsTracking(false);
                setMissionComplete(true);
                updatePilotHistory();
              }
            }
            return updated;
          }
        }
        return prev;
      });

      // 4. Move VVIP Aircraft
      if (missionType === 'VVIPEscort') {
        setVvipPos(prevVvip => {
          if (!prevVvip) return null;
          const vvipStep = calculateVvipNextStep(
            prevVvip,
            vvipHeadingRef.current || 0,
            escortStageRef.current,
            rendezvousPointRef.current,
            vvipEndPointRef.current,
            vvipTargetAircraft.cruiseSpeed || 440,
            simSpeed,
            vvipReachedRVRef.current,
            dtSeconds,
            gameTimeScale
          );

          if (vvipStep.reachedTarget && rendezvousPointRef.current && escortStageRef.current === 'pre_rendezvous') {
            setVvipReachedRV(true);
          }

          setVvipHeading(vvipStep.nextHeading);
          return vvipStep.nextPos;
        });
      }

      // 5. Move Tankers & Handle Air-to-Air Refueling (AAR)
      setTankerAircraft(prev => prev.map(t => {
        if (t.state === 'returning' && (t.distToBase || 0) < 0.1) return null;
        const target = t.state === 'spawning' || t.state === 'flying_to_wp' ? t.wp : t.base;
        const d = getDistance(t.lat, t.lng, target.lat, target.lng);
        const b = getBearing(t.lat, t.lng, target.lat, target.lng);
        const m = (300 / 3600) * simSpeed * gameTimeScale * dtSeconds;
        let nextState = t.state;
        if (t.state === 'spawning' && d < 0.2) nextState = 'flying_to_wp';
        if (t.state === 'flying_to_wp' && d < 0.2) nextState = 'refueling';
        const playerReachedWp = waypointsRef.current.find(wp => wp.id === t.wp.id)?.reached;
        if (playerReachedWp && t.state !== 'returning') nextState = 'returning';
        const latM = (m / 60) * Math.cos(b * Math.PI / 180);
        const lngM = (m / (60 * Math.cos(t.lat * Math.PI / 180))) * Math.sin(b * Math.PI / 180);
        return { ...t, lat: t.lat + latM, lng: t.lng + lngM, heading: b, state: nextState, distToBase: d };
      }).filter(Boolean) as TankerAircraft[]);

      // Check for Tanker Proximity & Refill Player Fuel
      const activeTankerWp = waypointsRef.current.find(w => !w.reached && w.type === 'tanker');
      if (activeTankerWp && currentPosRef.current) {
        const dToTanker = getDistance(currentPosRef.current.lat, currentPosRef.current.lng, activeTankerWp.lat, activeTankerWp.lng);
        if (dToTanker <= 2.2) {
          const maxCapacity = selectedAircraft.maxFuel * (useSubTank ? 1.3 : 1.0);
          if (fuelRemaining < maxCapacity * 0.95) {
            setFuelRemaining(maxCapacity);
            const callSign = crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01');
            speak(
              language === 'id'
                ? `Kontak Tanker! Pengisian bahan bakar di udara berhasil. Tangki bahan bakar 100% penuh.`
                : `Tanker Contact! Air-to-air refueling complete. Fuel tanks 100% full.`
            );
            atcRespond(
              language === 'id'
                ? `${callSign}, Garuda Radar. Prosedur AAR sukses. Lanjutkan penerbangan ke Rendezvous Point.`
                : `${callSign}, Garuda Radar. AAR complete. Cleared route direct to Rendezvous Point.`
            );
          }
        }
      }

      // 6. Update Altitude smoothly
      setCurrentAltitude(prev => {
        const nextWp = waypointsRef.current.find(w => !w.reached);
        const targetAlti = ap ? (nextWp?.planAltitude || targetA) : targetA;
        if (Math.abs(prev - targetAlti) < 10) return targetAlti;
        const step = (vSpd / 60) * simSpeed * gameTimeScale * dtSeconds;
        return prev + (targetAlti > prev ? step : -step);
      });

      // 7. Update Speed smoothly
      setSpeed(prev => {
        const targetS = ap ? (waypointsRef.current.find(w => !w.reached)?.planSpeed || targetSpeedRef.current) : targetSpeedRef.current;
        if (prev === null) return targetS;
        if (Math.abs(prev - targetS) < 1) return targetS;
        const step = 2.0 * simSpeed * gameTimeScale * dtSeconds;
        return prev + (targetS > prev ? step : -step);
      });

      // 8. Dynamic Intensive Real-Time Tactical Aviation Radio Communications (Batched ~4 sec interval)
      commsAccumulatorRef.current += dtSeconds * simSpeed;
      if (commsAccumulatorRef.current >= 4.0) {
        commsAccumulatorRef.current = 0;
        const periodicComms = generatePeriodicFlightComms(
          0,
          commsStateRef.current,
          {
            callsign: crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01'),
            language,
            currentPos: currentPosRef.current,
            currentAltitude: currentAltitudeTarget,
            speed: speedRef.current,
            heading: headingRef.current,
            fuelRemaining,
            missionType,
            waypoints: waypointsRef.current,
            selectedAircraft,
            vvipTargetAircraft,
            vvipPos: vvipPosRef.current,
            rendezvousPoint: rendezvousPointRef.current,
            vvipEndPoint: vvipEndPointRef.current,
            arrivalAirport: arrivalAirportRef.current,
            escortStage: escortStageRef.current,
            otherTraffic
          }
        );

        if (periodicComms.messages.length > 0) {
          commsStateRef.current = periodicComms.updatedState;
          setCommsMessages(prev => [...prev, ...periodicComms.messages]);
          
          periodicComms.messages.forEach((msg) => {
            const text = language === 'id' ? msg.textId : msg.textEn;
            speak(text, msg.sender === 'ATC' || msg.sender === 'AWACS');
          });
        }
      }

    }, 100);

    return () => clearInterval(interval);
  }, [isSimulating, missionType, updatePilotHistory, selectedAircraft, vvipTargetAircraft, crew.callSign, language, speak, atcRespond, otherTraffic, fuelRemaining, currentAltitudeTarget, departureAirport, playerProfile]);


  const lastSpokenAltitude = useRef<number>(0);
  const lastSpokenSpeed = useRef<number>(0);

  // Communications for Altitude/Speed changes
  useEffect(() => {
    if (!isSimulating || !crew.callSign) return;
    
    const callSign = crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01');
    
    if (Math.abs(currentAltitude - currentAltitudeTarget) > 1000 && Math.abs(currentAltitudeTarget - lastSpokenAltitude.current) > 500) {
      lastSpokenAltitude.current = currentAltitudeTarget;
      const altText = language === 'id' 
        ? `Garuda Tower, ${callSign} merubah ketinggian, climbing ke FL${Math.round(currentAltitudeTarget / 100)}.` 
        : `Garuda Tower, ${callSign} changing level, climbing to FL${Math.round(currentAltitudeTarget / 100)}.`;
      speak(altText);
      atcRespond(language === 'id' 
        ? `${callSign}, diterima. Monitor FL${Math.round(currentAltitudeTarget / 100)}. QNH satu zero satu three.` 
        : `${callSign}, roger. Maintain level FL${Math.round(currentAltitudeTarget / 100)}. QNH 1013.`);
    }
  }, [currentAltitudeTarget, isSimulating, language, crew.callSign, speak, atcRespond, currentAltitude]);

  useEffect(() => {
    if (!isSimulating || !crew.callSign) return;
    const callSign = crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01');
    
    if (Math.abs((speed || 0) - currentSpeedTarget) > 50 && Math.abs(currentSpeedTarget - lastSpokenSpeed.current) > 20) {
      lastSpokenSpeed.current = currentSpeedTarget;
      const speedText = language === 'id' 
        ? `Menara, ${callSign} menyesuaikan kecepatan ke ${Math.round(currentSpeedTarget)} knot IAS.` 
        : `Tower, ${callSign} adjusting speed to ${Math.round(currentSpeedTarget)} knots IAS.`;
      speak(speedText);
      atcRespond(language === 'id' 
        ? `${callSign}, monitor kecepatan sesuai rencana penerbangan.` 
        : `${callSign}, roger. Maintain speed according to flight plan.`);
    }
  }, [currentSpeedTarget, isSimulating, language, crew.callSign, speak, atcRespond, speed]);

  // Air Traffic Simulation
  useEffect(() => {
    if (!isSimulating) {
      setOtherTraffic([]);
      return;
    }

    const interval = setInterval(() => {
      setOtherTraffic(prev => {
        const moved = stepTrafficSimulation(
          prev,
          simulationSpeed,
          trafficFrequency,
          currentPosRef.current
        );

        // Random Interception Event for Patrol Missions
        const interceptCandidate = checkPatrolInterceptTarget(moved, missionType, !!interceptTarget);
        if (interceptCandidate) {
          setInterceptTarget(interceptCandidate);
          setActiveScenario({
            id: 'intercept-' + Date.now(),
            type: 'INTERCEPT',
            message: language === 'id' ? 'KONTAK RADAR TIDAK DIKENAL!' : 'UNKNOWN RADAR CONTACT!',
            actionRequired: language === 'id' ? 'Lakukan Intersepsi atau Lanjutkan Patroli.' : 'Perform Intercept or Continue Patrol.',
            resolved: false
          });
          speak(language === 'id' ? 'Garuda Radar, ini Eagle-Radar. Kami menangkap kontak tidak dikenal di sektor kami. Mohon instruksi.' : 'Garuda Radar, Eagle-Radar. We have an unidentified contact in our sector. Requesting instructions.');
          atcRespond(language === 'id' ? 'Eagle-Radar, Garuda Radar. Anda diijinkan untuk intersepsi. Ubah heading ke target. Identifikasi dan laporkan.' : 'Eagle-Radar, Garuda Radar. You are cleared for intercept. Change heading to target. Identify and report.');
        }

        return moved;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, trafficFrequency, missionType, interceptTarget, language, speak, atcRespond]);

  const handleProfileComplete = useCallback((profile: PlayerProfile) => {
    setPlayerProfile(profile);
    
    setCrew({
      pilot: profile.commanderName,
      coPilot: 'AI Copilot',
      callSign: profile.callsign,
      crewCount: 2,
      cabinCount: 0
    });

    const aircraft = AIRCRAFT_PRESETS.find(a => a.id === profile.primaryAircraftId);
    if (aircraft) {
      setSelectedAircraft(aircraft);
      setInitialFuel(aircraft.maxFuel);
      setFuelRemaining(aircraft.maxFuel);
      setTargetSpeed(aircraft.cruiseSpeed);
    }

    const homeBaseStr = profile.homeAirbase || '';
    const baseName = homeBaseStr.replace('Lanud ', '');
    const homeBase = MILITARY_AIRPORTS.find(a => a.name.toLowerCase().includes(baseName.toLowerCase()));
    if (homeBase) {
      setDepartureAirport(homeBase);
      setDepartureSearch(homeBase.name);
      setArrivalAirport(homeBase);
      setArrivalSearch(homeBase.name);
    }

    setAppPhase('loading');
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // Guard: Only process map clicks when in main phase and in flight tab
    if (appPhase !== 'main' || activeTab !== 'flight') return;

    // 1. Tanker Rendezvous Selection Mode
    if (isPickingTankerRV) {
      const tankerWp: Waypoint = {
        id: 'tanker-rv-' + Date.now(),
        name: language === 'id' ? 'TITIK RENDEZVOUS TANKER (AAR)' : 'TANKER RV ORBIT (AAR)',
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        reached: false,
        type: 'tanker',
        planAltitude: 24000,
        planSpeed: 320,
        isRV: true
      };

      setWaypoints(prev => {
        if (prev.length === 0) {
          return [tankerWp];
        }
        if (prev.length === 1) {
          return [prev[0], tankerWp];
        }
        const dep = prev.find(w => w.id.startsWith('dep-')) || prev[0];
        const arr = prev.find(w => w.id.startsWith('arr-')) || prev[prev.length - 1];
        const otherWps = prev.filter(w => w.id !== dep.id && w.id !== arr.id);
        const updated = [dep, tankerWp, ...otherWps, ...(arr.id !== dep.id ? [arr] : [])];
        return calculateFuelPlan(updated, initialFuel * 1.5, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
      });

      setTankerOrbit({ lat, lng });
      setIsPickingTankerRV(false);
      setShowRefuelOptions(false);
      setIsFuelValid(true);
      speak(
        language === 'id'
          ? `Titik orbit pengisian bahan bakar udara (AAR) ditetapkan pada koordinat ${lat.toFixed(2)}, ${lng.toFixed(2)}.`
          : `Air-to-air refuel orbit point established at ${lat.toFixed(2)}, ${lng.toFixed(2)}.`
      );
      return;
    }

    // 2. VVIP Escort Rendezvous Selection Mode
    if (isPickingVvipRV) {
      const newRV: Waypoint = {
        id: 'vvip-rv-' + Date.now(),
        name: language === 'id' ? `TITIK RV VVIP (${lat.toFixed(2)}, ${lng.toFixed(2)})` : `VVIP RV POINT (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        reached: false,
        type: 'waypoint',
        planAltitude: 30000,
        planSpeed: selectedAircraft.cruiseSpeed
      };
      setRendezvousPoint(newRV);
      setRendezvousLat(lat.toFixed(4));
      setRendezvousLng(lng.toFixed(4));
      setIsPickingVvipRV(false);
      speak(
        language === 'id'
          ? `Titik Rendezvous pengawalan VVIP ditetapkan pada koordinat ${lat.toFixed(2)}, ${lng.toFixed(2)}.`
          : `VVIP Escort rendezvous point established at ${lat.toFixed(2)}, ${lng.toFixed(2)}.`
      );
      return;
    }

    // 3. Recon Survey Sector Selection Mode
    if (isPickingReconSurvey) {
      const surveyWp: Waypoint = {
        id: 'survey-wp-' + Date.now(),
        name: `SEKTOR-INTEL ${reconSurveyPoints.length + 1}`,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        reached: false,
        type: 'waypoint',
        planAltitude: 28000,
        planSpeed: 140
      };
      setReconSurveyPoints(prev => [...prev, surveyWp]);
      speak(
        language === 'id'
          ? `Sektor pengintaian ${reconSurveyPoints.length + 1} ditambahkan pada peta.`
          : `Reconnaissance sector ${reconSurveyPoints.length + 1} added to flight plan.`
      );
      return;
    }

    // 4. Manual Waypoint Mode (explicitly toggled on by player inside mission planner)
    if (isManualWaypointMode) {
      if (missionType === 'General') {
        const newPwp: PlannerWaypoint = {
          id: 'pwp-' + Date.now(),
          name: `WP-${plannerWaypoints.length + 1}`,
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          altitude: targetAltitude || 25000,
          speed: targetSpeed || selectedAircraft.cruiseSpeed
        };
        const updatedPwp = [...plannerWaypoints, newPwp];
        setPlannerWaypoints(updatedPwp);

        // Update full route
        const wps: Waypoint[] = [];
        if (departureAirport) {
          wps.push({
            id: 'dep-' + departureAirport.icao,
            name: `${departureAirport.icao} - ${departureAirport.name}`,
            lat: departureAirport.lat,
            lng: departureAirport.lng,
            reached: false,
            type: 'airport',
            planAltitude: 0,
            planSpeed: 0
          });
        }
        updatedPwp.forEach(wp => {
          wps.push({
            id: wp.id,
            name: wp.name,
            lat: wp.lat,
            lng: wp.lng,
            reached: false,
            type: 'waypoint',
            planAltitude: wp.altitude,
            planSpeed: wp.speed
          });
        });
        if (arrivalAirport && (arrivalAirport.icao !== departureAirport?.icao || updatedPwp.length > 0)) {
          wps.push({
            id: 'arr-' + arrivalAirport.icao,
            name: `${arrivalAirport.icao} - ${arrivalAirport.name}`,
            lat: arrivalAirport.lat,
            lng: arrivalAirport.lng,
            reached: false,
            type: 'airport',
            planAltitude: 0,
            planSpeed: 0
          });
        }
        const planned = calculateFuelPlan(wps, initialFuel, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
        setWaypoints(planned);
        return;
      }

      if (missionType === 'Patrol') {
        const customWp: Waypoint = {
          id: 'patrol-map-' + Date.now(),
          name: `PATROL-WP-0${waypoints.filter(w => !w.id.startsWith('dep-') && !w.id.startsWith('arr-')).length + 1}`,
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          reached: false,
          type: 'waypoint',
          planAltitude: targetAltitude || 25000,
          planSpeed: selectedAircraft.cruiseSpeed
        };

        setWaypoints(prev => {
          const dep = prev.find(w => w.id.startsWith('dep-')) || (departureAirport ? {
            id: 'dep-' + departureAirport.icao,
            name: departureAirport.icao + ' - ' + departureAirport.name,
            lat: departureAirport.lat,
            lng: departureAirport.lng,
            reached: false,
            type: 'airport' as const,
            planAltitude: 0,
            planSpeed: 0
          } : null);

          const midPoints = prev.filter(w => !w.id.startsWith('dep-') && !w.id.startsWith('arr-'));
          const arr = prev.find(w => w.id.startsWith('arr-')) || (departureAirport ? {
            id: 'arr-' + departureAirport.icao,
            name: departureAirport.icao + ' - ' + departureAirport.name,
            lat: departureAirport.lat,
            lng: departureAirport.lng,
            reached: false,
            type: 'airport' as const,
            planAltitude: 0,
            planSpeed: 0
          } : null);

          const combined = [
            ...(dep ? [dep] : []),
            ...midPoints,
            customWp,
            ...(arr ? [arr] : [])
          ];

          return calculateFuelPlan(combined, initialFuel, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
        });
        return;
      }

      // Default fallback when manual mode is explicitly on
      const wp: Waypoint = {
        id: crypto.randomUUID(),
        name: `WP ${waypoints.length + 1}`,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        reached: false,
        type: 'waypoint',
        planAltitude: targetAltitude,
        planSpeed: targetSpeed
      };

      setWaypoints(prev => {
        const arrIdx = prev.findIndex(w => w.id.startsWith('arr-'));
        let newList;
        if (arrIdx !== -1) {
          newList = [...prev.slice(0, arrIdx), wp, ...prev.slice(arrIdx)];
        } else {
          newList = [...prev, wp];
        }
        return calculateFuelPlan(newList, initialFuel * fuelCapacityMultiplier, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
      });
      return;
    }

    // 5. Outside of explicit mission placement modes: DO NOTHING.
    // Accidental clicks on the radar map outside active mission placement mode will NOT add any waypoints.
  }, [
    appPhase,
    activeTab,
    isPickingTankerRV,
    isPickingVvipRV,
    isPickingReconSurvey,
    isManualWaypointMode,
    missionType,
    language,
    speak,
    reconSurveyPoints.length,
    plannerWaypoints,
    departureAirport,
    arrivalAirport,
    targetAltitude,
    targetSpeed,
    selectedAircraft,
    initialFuel,
    fuelCapacityMultiplier,
    waypoints
  ]);

  useEffect(() => {
    if (missionType === 'Patrol') {
      setIsPatrolMission(true);
      if (waypoints.length === 0 && departureAirport) {
        const depWp: Waypoint = {
          id: 'dep-' + departureAirport.icao,
          name: `Base: ${departureAirport.icao}`,
          lat: departureAirport.lat,
          lng: departureAirport.lng,
          reached: false,
          type: 'airport',
          planAltitude: 0,
          planSpeed: 0
        };
        const arrWp: Waypoint = {
          id: 'arr-' + departureAirport.icao,
          name: `Return: ${departureAirport.icao}`,
          lat: departureAirport.lat,
          lng: departureAirport.lng,
          reached: false,
          type: 'airport',
          planAltitude: 0,
          planSpeed: 0
        };
        setWaypoints([depWp, arrWp]);
      }
    } else {
      setIsPatrolMission(false);
    }
  }, [missionType, departureAirport]);

  // Fuel validation effect
  useEffect(() => {
    if (waypoints.length > 1) {
      const totalDist = waypoints.reduce((acc, curr, idx) => {
        if (idx === 0) return 0;
        return acc + getDistance(waypoints[idx-1].lat, waypoints[idx-1].lng, curr.lat, curr.lng);
      }, 0);
      
      const fuelNeeded = totalDist * selectedAircraft.burnRate;
      const currentCap = initialFuel * fuelCapacityMultiplier;
      
      if (fuelNeeded > currentCap * 0.9) {
        setIsFuelValid(false);
      } else {
        setIsFuelValid(true);
      }
    }
  }, [waypoints, selectedAircraft, initialFuel, fuelCapacityMultiplier]);

  useEffect(() => {
    if (appPhase === 'loading') {
      const timer = setTimeout(() => {
        setAppPhase('main');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appPhase]);

  if (appPhase === 'boot') {
    return <SecuritySequence language={language} onComplete={() => setAppPhase('profile')} />;
  }

  if (appPhase === 'profile') {
    return <PlayerProfileInitialization language={language} onComplete={handleProfileComplete} />;
  }

  if (appPhase === 'loading') {
    return (
      <div className="fixed inset-0 z-[10001] bg-[#05070a] flex flex-col items-center justify-center gap-6 font-mono">
        <TacticalBackground />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-y-0 left-0 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
          <div className="text-center space-y-2">
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-blue-400 font-mono text-[10px] tracking-[0.3em] uppercase"
            >
              CONNECTING TO NATIONAL AIR DEFENSE GRID...
            </motion.p>
            <p className="text-white/20 font-mono text-[8px] uppercase">Routing via Sector 7 Datalink</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="h-screen bg-[#05070a] text-slate-200 font-sans flex overflow-hidden">
        {/* Left Sidebar - Icon Rail */}
        <div className="w-16 bg-[#0c111a] border-r border-white/5 flex flex-col items-center py-6 gap-6 z-[2000]">
          <div 
            onClick={() => setShowWelcome(true)}
            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 cursor-pointer hover:bg-blue-500 transition-all active:scale-95 group relative"
          >
            <Plane className="w-6 h-6 text-white" />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black/90 text-[10px] font-bold text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest border border-white/10 z-[3000]">
              {language === 'id' ? 'Resume Perjalanan' : 'Resume Journey'}
            </div>
          </div>
          
          <NavIcon active={activeTab === 'flight'} onClick={() => setActiveTab('flight')} icon={<LayoutDashboard className="w-5 h-5" />} label={language === 'id' ? 'Penerbangan' : 'Flight'} />
          <NavIcon active={activeTab === 'squadron'} onClick={() => setActiveTab('squadron')} icon={<Shield className="w-5 h-5" />} label={language === 'id' ? 'Skuadron' : 'Squadron'} />
          <NavIcon active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Landmark className="w-5 h-5 text-amber-400" />} label="Airbase Finance" />
          
          <div className="mt-auto flex flex-col gap-4">
            <NavIcon active={false} onClick={() => setShowLogoutModal(true)} icon={<LogOut className="w-5 h-5 text-red-400 hover:text-red-300" />} label={language === 'id' ? 'Keluar / Logout' : 'Logout'} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-14 bg-[#0c111a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-[1001] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{language === 'id' ? 'SISTEM OPERASI AKTIF' : 'SYSTEMS ACTIVE'}</span>
                </div>
                <span className="text-[11px] font-mono text-white/40">{utcTime}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">{language === 'id' ? 'Tanda Panggil' : 'Call Sign'}</span>
                  <span className="text-xs font-mono text-blue-400 font-bold">{crew.callSign || 'AIS-PILOT'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Auth</span>
                  <span className="text-xs font-mono text-green-500 font-bold">LEVEL-4</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Quick Finance indicator */}
              <button 
                onClick={() => setActiveTab('finance')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[10px] font-mono font-bold transition-all shadow-sm active:scale-95"
                title={language === 'id' ? 'Buka Manajemen Keuangan Airbase' : 'Open Airbase Financial Management'}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>AIRBASE FINANCE</span>
              </button>

              {/* Language Selector */}
              <div className="flex items-center bg-black/40 rounded-lg border border-white/5 p-1">
                <button 
                  onClick={() => setLanguage('id')}
                  className={cn("px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1", language === 'id' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}
                >
                  <img src="https://flagcdn.com/w20/id.png" alt="ID" className="w-3 h-2" /> ID
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn("px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1", language === 'en' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white")}
                >
                  <img src="https://flagcdn.com/w20/us.png" alt="EN" className="w-3 h-2" /> EN
                </button>
              </div>

              {/* HUD / Toolbar Toggle Button */}
              {activeTab !== 'finance' && (
                <button 
                  onClick={() => setIsToolbarVisible(prev => !prev)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md",
                    isToolbarVisible 
                      ? "bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30" 
                      : "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                  )}
                  title={isToolbarVisible ? (language === 'id' ? 'Sembunyikan HUD / Toolbar' : 'Hide HUD / Toolbar') : (language === 'id' ? 'Tampilkan HUD / Toolbar' : 'Show HUD / Toolbar')}
                >
                  {isToolbarVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>HUD {isToolbarVisible ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Quick Logout Button */}
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                title={language === 'id' ? 'Keluar / Ganti Profil' : 'Logout / Switch Profile'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'id' ? 'LOGOUT' : 'LOGOUT'}</span>
              </button>

              {/* GPS Status */}
              <div className="hidden lg:flex bg-black/40 px-3 py-1 rounded-lg border border-white/5 items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-white/60 uppercase">Terkunci GPS</span>
              </div>

              {/* Sidebar Minimize Toggle */}
              {activeTab !== 'finance' && (
                <button 
                  onClick={() => setIsMenuMinimized(!isMenuMinimized)} 
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
                  title={isMenuMinimized ? (language === 'id' ? 'Tampilkan Panel Kiri' : 'Show Left Panel') : (language === 'id' ? 'Sembunyikan Panel Kiri' : 'Hide Left Panel')}
                >
                  {isMenuMinimized ? <Menu className="w-5 h-5 text-white/70" /> : <X className="w-5 h-5 text-white/70" />}
                </button>
              )}
            </div>
          </header>

          {activeTab === 'finance' ? (
            <div className="flex-1 flex overflow-hidden bg-[#05070a]">
              <FinanceDashboard 
                language={language}
                playerProfile={playerProfile}
                points={points}
                setPoints={setPoints}
                flightHours={flightHours}
                speak={speak}
                onNavigateToFlight={() => setActiveTab('flight')}
                onNavigateToSquadron={() => setActiveTab('squadron')}
              />
            </div>
          ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Details */}
            <motion.div 
              initial={false}
              animate={{ 
                width: isMenuMinimized ? 0 : 420,
                opacity: isMenuMinimized ? 0 : 1,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#0c111a] border-r border-white/5 flex flex-col shadow-2xl z-[1000] overflow-hidden"
            >
              <div className="p-4 bg-[#121826] flex items-center justify-between border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  {activeTab === 'flight' ? (
                    <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Shield className="w-4 h-4 text-amber-400" />
                  )}
                  <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">
                    {activeTab === 'flight' 
                      ? (language === 'id' ? 'Manajemen Penerbangan' : 'Flight Management') 
                      : (language === 'id' ? 'Manajemen Skuadron' : 'Squadron Management')}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsMenuMinimized(true)} className="p-1.5 hover:bg-white/5 rounded bg-white/5 text-white/40 hover:text-white" title={language === 'id' ? 'Sembunyikan Menu' : 'Hide Menu'}><X className="w-3.5 h-3.5" /></button>
                  <button onClick={saveCurrentRoute} className="p-1.5 hover:bg-white/5 rounded bg-white/5 text-blue-400" title={language === 'id' ? 'Simpan Rute' : 'Save Route'}><Save className="w-3.5 h-3.5" /></button>
                  <button onClick={deleteCurrentRoute} className="p-1.5 hover:bg-white/5 rounded bg-white/5 text-red-400" title={language === 'id' ? 'Hapus Rute Saat Ini' : 'Delete Current Route'}><Trash2 className="w-3.5 h-3.5" /></button>
                  <div className="relative">
                    <button onClick={() => setShowResumeMenu(!showResumeMenu)} className="p-1.5 hover:bg-white/5 rounded bg-white/5" title={language === 'id' ? 'Resume Rute' : 'Resume Route'}><FolderOpen className="w-3.5 h-3.5" /></button>
                    {showResumeMenu && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a2233] border border-white/10 rounded-xl shadow-2xl z-[3000] overflow-hidden">
                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{language === 'id' ? 'Rute Tersimpan' : 'Saved Routes'}</span>
                          <X className="w-3 h-3 cursor-pointer text-white/40 hover:text-white" onClick={() => setShowResumeMenu(false)} />
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {savedRoutes.length === 0 ? (
                            <div className="p-4 text-center text-[10px] text-white/20 italic">{language === 'id' ? 'Belum ada rute tersimpan' : 'No saved routes'}</div>
                          ) : (
                            savedRoutes.map((route, rIdx) => (
                              <div key={`${route.id}-${rIdx}`} className="p-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center justify-between group">
                                <div className="min-w-0 cursor-pointer flex-1" onClick={() => loadRoute(route)}>
                                  <p className="text-[10px] font-bold truncate">{route.name}</p>
                                  <p className="text-[8px] text-white/30">{new Date(route.timestamp || Date.now()).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => removeSavedRoute(route.id)} className="p-1.5 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeTab === 'flight' && (
                    <FlightTab 
                      language={language}
                      crew={crew}
                      setCrew={setCrew}
                      missionType={missionType}
                      setMissionType={setMissionType}
                      vvipTargetAircraft={vvipTargetAircraft}
                      setVvipTargetAircraft={setVvipTargetAircraft}
                      vvipStartPoint={vvipStartPoint}
                      setVvipStartPoint={setVvipStartPoint}
                      vvipStartSearch={vvipStartSearch}
                      setVvipStartSearch={setVvipStartSearch}
                      vvipEndPoint={vvipEndPoint}
                      setVvipEndPoint={setVvipEndPoint}
                      vvipEndSearch={vvipEndSearch}
                      setVvipEndSearch={setVvipEndSearch}
                      rendezvousLat={rendezvousLat}
                      setRendezvousLat={setRendezvousLat}
                      rendezvousLng={rendezvousLng}
                      setRendezvousLng={setRendezvousLng}
                      rendezvousPoint={rendezvousPoint}
                      setRendezvousPoint={setRendezvousPoint}
                      waypoints={waypoints}
                      setWaypoints={setWaypoints}
                      selectedAircraft={selectedAircraft}
                      setSelectedAircraft={setSelectedAircraft}
                      departureAirport={departureAirport}
                      setDepartureAirport={setDepartureAirport}
                      departureSearch={departureSearch}
                      setDepartureSearch={setDepartureSearch}
                      arrivalAirport={arrivalAirport}
                      setArrivalAirport={setArrivalAirport}
                      arrivalSearch={arrivalSearch}
                      setArrivalSearch={setArrivalSearch}
                      payload={payload}
                      setPayload={setPayload}
                      useSubTank={useSubTank}
                      setUseSubTank={setUseSubTank}
                      combatMode={combatMode}
                      setCombatMode={setCombatMode}
                      initialFuel={initialFuel}
                      calculateFuelPlan={calculateFuelPlan}
                      playerProfile={playerProfile}
                      targetAltitude={targetAltitude}
                      setTargetAltitude={setTargetAltitude}
                      targetSpeed={targetSpeed}
                      setTargetSpeed={setTargetSpeed}
                      onStartMission={startTracking}
                      isTracking={selectedMissionId !== null && isTracking}
                      onRTB={handleRTB}
                      isRTB={isRTB}
                      deleteCurrentRoute={deleteCurrentRoute}
                      onOpenRefuelOptions={() => setShowRefuelOptions(true)}
                      reconState={reconState}
                      selectedRecon={selectedRecon}
                      onSelectRecon={handleSelectRecon}
                      reconDeparture={reconDeparture}
                      onSelectReconDeparture={handleSelectReconDeparture}
                      reconArrival={reconArrival}
                      onSelectReconArrival={handleSelectReconArrival}
                      reconSurveyPoints={reconSurveyPoints}
                      onSetReconSurveyPoints={handleSetReconSurveyPoints}
                      onStartReconFlight={handleStartReconFlight}
                      isReconAirborne={isReconSimulating}
                      targetLatInput={reconTargetLatInput}
                      onSetTargetLatInput={setReconTargetLatInput}
                      targetLngInput={reconTargetLngInput}
                      onSetTargetLngInput={setReconTargetLngInput}
                      selectedWeaponId={reconSelectedWeaponId}
                      onSelectWeapon={setReconSelectedWeaponId}
                      strikeLandingBase={reconStrikeLandingBase}
                      onSelectStrikeLandingBase={setReconStrikeLandingBase}
                      onScrambleStrike={handleScrambleStrike}
                      onEngageTarget={handleEngageTarget}
                      isPlayerAirborne={isSimulating}
                      isTargetLocked={isTargetLocked}
                      isStrikeCompleted={isStrikeCompleted}
                      simulationSpeed={simulationSpeed}
                      onSetSimulationSpeed={setSimulationSpeed}
                      isManualWaypointMode={isManualWaypointMode}
                      setIsManualWaypointMode={setIsManualWaypointMode}
                      isPickingReconSurvey={isPickingReconSurvey}
                      setIsPickingReconSurvey={setIsPickingReconSurvey}
                      isPickingVvipRV={isPickingVvipRV}
                      setIsPickingVvipRV={setIsPickingVvipRV}
                      plannerWaypoints={plannerWaypoints}
                      setPlannerWaypoints={setPlannerWaypoints}
                      activeMissions={activeMissions}
                      selectedMissionId={selectedMissionId}
                      onSelectMission={handleSelectMission}
                      onAbortMission={handleAbortMission}
                      onRTBMission={handleRTBMission}
                      maxConcurrentMissions={getSquadronMissionCapacity(playerProfile).maxConcurrentMissions}
                      fleetCount={getSquadronMissionCapacity(playerProfile).fleetCount}
                      crewCapacity={getSquadronMissionCapacity(playerProfile).crewCapacity}
                      onAddNewMissionPlan={handleAddNewMissionPlan}
                    />
                  )}
                  {activeTab === 'squadron' && (
                    <SquadronTab 
                      language={language}
                      playerProfile={playerProfile}
                      selectedAircraft={selectedAircraft}
                      setSelectedAircraft={setSelectedAircraft}
                      crew={crew}
                      setCrew={setCrew}
                      departureAirport={departureAirport}
                      setDepartureAirport={setDepartureAirport}
                      speak={speak}
                      setInitialFuel={setInitialFuel}
                      setFuelRemaining={setFuelRemaining}
                      setTargetSpeed={setTargetSpeed}
                      onNavigateToFlight={() => setActiveTab('flight')}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Panel - Route Distance & Fuel Summary (Only on Flight Tab when active route exists) */}
              {activeTab === 'flight' && waypoints.length > 1 && (
                <div className="p-4 bg-[#121826] border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{language === 'id' ? 'Total Jarak' : 'Total Distance'}</p>
                      <p className="text-lg font-mono font-bold text-blue-400">
                        {Math.round(waypoints.reduce((acc, wp, idx) => {
                          if (idx === 0) return acc;
                          const prev = waypoints[idx - 1];
                          return acc + getDistance(prev.lat, prev.lng, wp.lat, wp.lng);
                        }, 0))} <span className="text-xs text-white/40">NM</span>
                      </p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{language === 'id' ? 'Estimasi BBM' : 'Est. Fuel'}</p>
                      <p className="text-lg font-mono font-bold text-orange-400">
                        {Math.round(waypoints.reduce((acc, wp, idx) => {
                          if (idx === 0) return acc;
                          const prev = waypoints[idx - 1];
                          return acc + (getDistance(prev.lat, prev.lng, wp.lat, wp.lng) * selectedAircraft.burnRate);
                        }, 0))} <span className="text-xs text-white/40">LBS</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Panel - Map & Radar OR Hangar Bay View */}
            <div className="flex-1 relative bg-[#05070a] overflow-hidden">
              {activeTab === 'squadron' ? (
                <HangarBayView 
                  language={language}
                  selectedAircraft={selectedAircraft}
                  playerProfile={playerProfile}
                  squadronName={playerProfile?.squadron}
                />
              ) : (
                <>
                  <TacticalRadarMap 
                    language={language}
                    isSimulating={isSimulating}
                    currentPos={currentPos}
                    heading={heading}
                    speed={speed}
                    currentAltitude={currentAltitude}
                    waypoints={waypoints}
                    radarSweepAngle={radarSweepAngle}
                    otherTraffic={otherTraffic}
                    activeTab={activeTab}
                    flightDirector={flightDirector}
                    autoPilot={autoPilot}
                    nextWaypoint={nextWaypoint || null}
                    targetHeading={targetHeading}
                    vvipPos={vvipPos}
                    vvipHeading={vvipHeading}
                    vvipTargetAircraft={vvipTargetAircraft}
                    escortStage={escortStage}
                    tankerAircraft={tankerAircraft}
                    vvipStartPoint={vvipStartPoint}
                    vvipEndPoint={vvipEndPoint}
                    rendezvousPoint={rendezvousPoint}
                    autoTrack={mapFollowAircraft}
                    setAutoTrack={setMapFollowAircraft}
                    onMapClick={handleMapClick}
                    tankerOrbit={tankerOrbit}
                    setTankerOrbit={setTankerOrbit}
                    isPatrolMission={isPatrolMission}
                    interceptTarget={interceptTarget}
                    selectedAircraft={selectedAircraft}
                    callSign={crew.callSign}
                    combatMode={combatMode}
                    centerTrigger={centerMapTrigger}
                    zoomInTrigger={zoomInTrigger}
                    zoomOutTrigger={zoomOutTrigger}
                    reconState={reconState}
                    selectedRecon={selectedRecon}
                    reconDeparture={reconDeparture}
                    reconArrival={reconArrival}
                    activeMissions={activeMissions}
                    selectedMissionId={selectedMissionId}
                    onSelectMission={handleSelectMission}
                  />

                  {/* Fuel Warning Overlay */}
                  {!isFuelValid && !isSimulating && appPhase === 'main' && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[3000] pointer-events-auto">
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-red-600/90 backdrop-blur-xl border border-red-400/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4"
                      >
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Fuel className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">{language === 'id' ? 'BBM TIDAK CUKUP / JARAK MELEBIHI KAPASITAS' : 'INSUFFICIENT FUEL / RANGE EXCEEDED'}</p>
                          <p className="text-[8px] text-white/70 uppercase leading-tight">{language === 'id' ? 'Pilih Tanki Cadangan atau Pengisian BBM di Udara (Tanker RV)' : 'Select External Tank or Air Refueling (Tanker RV)'}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                           <button 
                             onClick={() => {
                               setUseSubTank(true);
                               setIsFuelValid(true);
                             }}
                             className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-bold text-white transition-all uppercase border border-white/20 shadow-md"
                           >
                             {language === 'id' ? '+ Tanki Cadangan' : '+ External Tank'}
                           </button>
                           <button 
                             onClick={() => {
                               setShowRefuelOptions(true);
                             }}
                             className="px-3 py-1.5 bg-orange-500/80 hover:bg-orange-500 rounded-lg text-[8px] font-bold text-white transition-all uppercase border border-orange-300 shadow-md flex items-center gap-1"
                           >
                             <Wind className="w-3 h-3" />
                             {language === 'id' ? 'Air Refueling' : 'Air Refueling'}
                           </button>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Tanker RV Selection Mode Notification */}
                  {isPickingTankerRV && !isSimulating && appPhase === 'main' && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[3000] pointer-events-auto">
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-amber-600/90 backdrop-blur-xl border border-amber-400/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce"
                      >
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">{language === 'id' ? 'MODE PILIH TITIK RENDEZVOUS TANKER' : 'SELECT TANKER RENDEZVOUS WAYPOINT'}</p>
                          <p className="text-[8px] text-white/80 uppercase leading-tight">{language === 'id' ? 'KLIK DI PETA UNTUK MENEMPATKAN TITIK TEMU PESAWAT TANKER' : 'CLICK ON MAP TO PLACE TANKER AIR-REFUELING RENDEZVOUS POINT'}</p>
                        </div>
                        <button 
                          onClick={() => setIsPickingTankerRV(false)}
                          className="px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded-lg text-[8px] font-bold text-white transition-all uppercase ml-2 border border-white/20"
                        >
                          {language === 'id' ? 'Batal' : 'Cancel'}
                        </button>
                      </motion.div>
                    </div>
                  )}

                  {/* Manual Waypoint Mode Notification */}
                  {isManualWaypointMode && !isSimulating && appPhase === 'main' && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[3000] pointer-events-auto">
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-blue-600/90 backdrop-blur-xl border border-cyan-400/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4"
                      >
                        <div className="p-2 bg-cyan-400/20 rounded-lg">
                          <Crosshair className="w-5 h-5 text-cyan-300 animate-spin" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">
                            {language === 'id' ? 'MODE PENEMPATAN WAYPOINT AKTIF' : 'MANUAL WAYPOINT PLACEMENT ACTIVE'}
                          </p>
                          <p className="text-[8px] text-cyan-200 uppercase leading-tight font-mono">
                            {language === 'id' ? 'KLIK PADA PETA UNTUK MENAMBAHKAN TITIK RUTE' : 'CLICK ON RADAR MAP TO ADD WAYPOINT'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setIsManualWaypointMode(false)}
                          className="px-3 py-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-[8.5px] font-bold text-cyan-300 transition-all uppercase ml-2 border border-cyan-400/40"
                        >
                          {language === 'id' ? 'Selesai' : 'Done'}
                        </button>
                      </motion.div>
                    </div>
                  )}

                  {/* VVIP RV Selection Mode Notification */}
                  {isPickingVvipRV && !isSimulating && appPhase === 'main' && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[3000] pointer-events-auto">
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-amber-600/90 backdrop-blur-xl border border-amber-400/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4"
                      >
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Crosshair className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">
                            {language === 'id' ? 'MODE PILIH TITIK RENDEZVOUS VVIP' : 'VVIP RENDEZVOUS SELECTION MODE'}
                          </p>
                          <p className="text-[8px] text-amber-200 uppercase leading-tight font-mono">
                            {language === 'id' ? 'KLIK PADA PETA UNTUK MENETAPKAN TITIK TEMU VVIP' : 'CLICK ON MAP TO SET VVIP INTERCEPT POINT'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setIsPickingVvipRV(false)}
                          className="px-3 py-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-[8.5px] font-bold text-amber-200 transition-all uppercase ml-2 border border-amber-400/40"
                        >
                          {language === 'id' ? 'Batal' : 'Cancel'}
                        </button>
                      </motion.div>
                    </div>
                  )}

                  {/* Recon Survey Point Selection Mode Notification */}
                  {isPickingReconSurvey && !isSimulating && appPhase === 'main' && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[3000] pointer-events-auto">
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-purple-600/90 backdrop-blur-xl border border-purple-400/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4"
                      >
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Crosshair className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">
                            {language === 'id' ? 'MODE PILIH SEKTOR INTAI / ISR' : 'RECON SURVEY SECTOR SELECTION'}
                          </p>
                          <p className="text-[8px] text-purple-200 uppercase leading-tight font-mono">
                            {language === 'id' ? 'KLIK PADA PETA UNTUK MENAMBAH SEKTOR PENGINTAIAN' : 'CLICK ON MAP TO ADD RECON SURVEY SECTOR'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setIsPickingReconSurvey(false)}
                          className="px-3 py-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-[8.5px] font-bold text-purple-200 transition-all uppercase ml-2 border border-purple-400/40"
                        >
                          {language === 'id' ? 'Selesai' : 'Done'}
                        </button>
                      </motion.div>
                    </div>
                  )}

                  {/* HUD / Radar Overlays */}
                  <MissionOverlays 
                    language={language}
                    isSimulating={isSimulating}
                    isReconSimulating={isReconSimulating}
                    activeScenario={activeScenario}
                    setActiveScenario={setActiveScenario}
                    selectedAircraft={selectedAircraft}
                    currentPos={currentPos}
                    currentAltitude={currentAltitude}
                    speed={speed}
                    heading={heading}
                    targetAltitude={targetAltitude}
                    setTargetAltitude={setTargetAltitude}
                    targetHeading={targetHeading}
                    setTargetHeading={setTargetHeading}
                    targetSpeed={targetSpeed}
                    setTargetSpeed={setTargetSpeed}
                    verticalSpeed={verticalSpeed}
                    setVerticalSpeed={setVerticalSpeed}
                    autoPilot={autoPilot}
                    setAutoPilot={setAutoPilot}
                    combatMode={combatMode}
                    setCombatMode={setCombatMode}
                    waypoints={waypoints}
                    fuelRemaining={fuelRemaining}
                    points={points}
                    flightHours={flightHours}
                    missionType={missionType}
                    playerEta={playerEta}
                    vvipEta={vvipEta}
                    setPoints={setPoints}
                    setFuelRemaining={setFuelRemaining}
                    isMenuMinimized={isMenuMinimized}
                    setIsMenuMinimized={setIsMenuMinimized}
                    isPatrolMission={isPatrolMission}
                    interceptTarget={interceptTarget}
                    escortStage={escortStage}
                    isToolbarVisible={isToolbarVisible}
                    setIsToolbarVisible={setIsToolbarVisible}
                    commsMessages={commsMessages}
                    onReplayAudio={speak}
                    onTransmitMessage={handleTransmitPlayerMessage}
                    onRTB={handleRTB}
                    isRTB={isRTB}
                    isRadioMuted={isRadioMuted}
                    onToggleRadioMute={() => setIsRadioMuted(prev => !prev)}
                    isMultiMission={activeMissions.length > 1}
                  />

                  {/* Map & Simulation Control Bar (Simulation speed, Center on Aircraft, Zoom +/-) */}
                  <div className="absolute bottom-6 left-6 z-[1001] flex items-center gap-3 pointer-events-auto">
                    {/* Simulation Speed Control */}
                    {(isSimulating || isReconSimulating) && (
                      <div className="bg-[#0c111a]/90 backdrop-blur-md border border-white/15 rounded-xl p-2.5 shadow-2xl flex flex-col gap-1.5 w-48 font-mono">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[7.5px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                            <FastForward className="w-3 h-3 text-blue-400" />
                            {isReconSimulating && !isSimulating 
                              ? (language === 'id' ? 'INTEL RECON' : 'ISR RECON') 
                              : (language === 'id' ? 'SIMULASI' : 'SIMULATION')}
                          </span>
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.2 rounded border",
                            isReconSimulating && !isSimulating
                              ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                              : "bg-blue-950 text-blue-300 border-blue-500/40"
                          )}>
                            {simulationSpeed}x
                          </span>
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                          {[1, 2, 5, 10, 20, 50].map(s => (
                            <button 
                              key={s}
                              onClick={() => setSimulationSpeed(s)}
                              className={cn(
                                "py-1 rounded text-[8px] font-bold font-mono transition-all border",
                                simulationSpeed === s 
                                  ? (isReconSimulating && !isSimulating
                                      ? "bg-cyan-500 text-black border-cyan-300 shadow-md shadow-cyan-500/30 scale-105"
                                      : "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 scale-105")
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CENTER ON AIRCRAFT & Zoom Buttons */}
                    <div className="flex items-center gap-1.5 bg-[#0c111a]/85 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-2xl">
                      <button
                        onClick={() => {
                          setMapFollowAircraft(true);
                          setCenterMapTrigger(prev => prev + 1);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all shadow-md active:scale-95",
                          mapFollowAircraft
                            ? "bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                        title={language === 'id' ? "Pusatkan Kamera ke Pesawat" : "Center Map on Aircraft"}
                      >
                        <Crosshair className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        <span className="whitespace-nowrap font-mono">{language === 'id' ? 'PUSATKAN PESAWAT' : 'CENTER ON AIRCRAFT'}</span>
                      </button>

                      <div className="h-5 w-px bg-white/10 mx-0.5" />

                      {/* Zoom In Button */}
                      <button
                        onClick={() => setZoomInTrigger(prev => prev + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-white/80 hover:text-white transition-all active:scale-95"
                        title={language === 'id' ? "Perbesar Peta (+)" : "Zoom In (+)"}
                      >
                        <Plus className="w-4 h-4 font-bold" />
                      </button>

                      {/* Zoom Out Button */}
                      <button
                        onClick={() => setZoomOutTrigger(prev => prev + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-white/80 hover:text-white transition-all active:scale-95"
                        title={language === 'id' ? "Perkecil Peta (-)" : "Zoom Out (-)"}
                      >
                        <Minus className="w-4 h-4 font-bold" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Mission Complete Overlay */}
        <AnimatePresence>
          {missionComplete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg bg-[#0c111a] border border-blue-500/30 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 space-y-8">
                  <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20 rotate-12">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {language === 'id' ? 'Misi Selesai!' : 'Mission Complete!'}
                    </h2>
                    <p className="text-white/40 text-sm uppercase tracking-[0.2em] font-mono">
                      {missionType === 'VVIPEscort' 
                        ? (language === 'id' ? 'Pengawalan VVIP Sukses dan Aman' : 'VVIP Escort Completed Successfully')
                        : (language === 'id' ? 'Pesawat Telah Mendarat dengan Selamat' : 'Aircraft Has Landed Safely')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-white/30 uppercase mb-1">{language === 'id' ? 'BBM Tersisa' : 'Fuel Remaining'}</p>
                      <p className="text-lg font-bold text-blue-400 font-mono">{Math.round(fuelRemaining)} LBS</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-white/30 uppercase mb-1">{language === 'id' ? 'Total Poin' : 'Total Points'}</p>
                      <p className="text-lg font-bold text-green-400 font-mono">{points}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-white/30 uppercase mb-1">{language === 'id' ? 'Jam Terbang' : 'Flight Hours'}</p>
                      <p className="text-lg font-bold text-blue-400 font-mono">{(flightHours / 60).toFixed(1)}H</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-white/30 uppercase mb-1">{language === 'id' ? 'Status Misi' : 'Mission Status'}</p>
                      <p className="text-lg font-bold text-emerald-400 font-mono">SUCCESS</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{language === 'id' ? 'Log Penerbangan' : 'Flight Log'}</p>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar space-y-2">
                      {waypoints.map((wp, wpIdx) => (
                        <div key={`${wp.id}-${wpIdx}`} className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-white/60">{wp.name}</span>
                          <span className="text-green-500 font-bold">REACHED</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setMissionComplete(false);
                      deleteCurrentRoute();
                    }}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-xs"
                  >
                    {language === 'id' ? 'Kembali ke Pangkalan & Reset Rute' : 'Return to Base & Reset Route'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome / Resume Page Overlay */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[5000] bg-[#05070a]/95 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-4xl bg-[#0c111a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 bg-gradient-to-r from-blue-600/20 to-transparent border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Plane className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">
                        {language === 'id' ? 'Resume Perjalanan' : 'Resume Journey'}
                      </h1>
                      <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-mono mt-1">
                        {language === 'id' ? 'Status Operasi Aktif' : 'Active Operation Status'} • {utcTime}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowWelcome(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-white/40" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                      <section className="space-y-4">
                        <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          {language === 'id' ? 'Informasi Pesawat' : 'Aircraft Information'}
                        </h2>
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Plane className="w-7 h-7 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{selectedAircraft.name}</h3>
                            <p className="text-xs text-white/40 uppercase font-mono">
                              {selectedAircraft.type} • {language === 'id' ? 'BBM' : 'Fuel'}: {Math.round((fuelRemaining / selectedAircraft.maxFuel) * 100)}%
                            </p>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          {language === 'id' ? 'Telemetri Langsung' : 'Live Telemetry'}
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                            <p className="text-[9px] text-white/30 uppercase mb-1">{language === 'id' ? 'Ketinggian' : 'Altitude'}</p>
                            <p className="text-sm font-bold font-mono text-blue-400">{Math.round(currentAltitude)} FT</p>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                            <p className="text-[9px] text-white/30 uppercase mb-1">{language === 'id' ? 'Kecepatan' : 'Speed'}</p>
                            <p className="text-sm font-bold font-mono text-blue-400">{speed !== null ? Math.round(speed) : 0} KTS</p>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                            <p className="text-[9px] text-white/30 uppercase mb-1">{language === 'id' ? 'Arah' : 'Heading'}</p>
                            <p className="text-sm font-bold font-mono text-blue-400">{heading !== null ? Math.round(heading) : 0}°</p>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          {language === 'id' ? 'Data Awak Pesawat' : 'Crew Data'}
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                            <User className="w-4 h-4 text-white/40" />
                            <div className="flex-1">
                              <p className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Pilot Utama' : 'Commanding Pilot'}</p>
                              <p className="text-sm font-bold">{crew.pilot || '---'}</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                            <User className="w-4 h-4 text-white/40" />
                            <div className="flex-1">
                              <p className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Kopilot' : 'Co-Pilot'}</p>
                              <p className="text-sm font-bold">{crew.coPilot || '---'}</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                            <Target className="w-4 h-4 text-white/40" />
                            <div className="flex-1">
                              <p className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Tanda Panggil' : 'Call Sign'}</p>
                              <p className="text-sm font-bold">{crew.callSign || '---'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                              <Users className="w-4 h-4 text-white/40" />
                              <div className="flex-1">
                                <p className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Kru' : 'Crew'}</p>
                                <p className="text-sm font-bold">{crew.crewCount}</p>
                              </div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                              <Users className="w-4 h-4 text-white/40" />
                              <div className="flex-1">
                                <p className="text-[9px] text-white/30 uppercase">{language === 'id' ? 'Kabin' : 'Cabin'}</p>
                                <p className="text-sm font-bold">{crew.cabinCount}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    <div className="space-y-8">
                      <section className="space-y-4">
                        <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          {language === 'id' ? 'Rencana Rute' : 'Flight Plan'}
                        </h2>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 max-h-80 overflow-y-auto custom-scrollbar space-y-2">
                          {waypoints.map((wp, idx) => (
                            <div key={`${wp.id}-${idx}`} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
                              <div className="flex items-center gap-3">
                                <span className="text-blue-400 font-bold">#{idx + 1}</span>
                                <div>
                                  <p className="font-bold text-white">{wp.name}</p>
                                  <p className="text-[9px] text-white/40">{wp.lat.toFixed(4)}°, {wp.lng.toFixed(4)}°</p>
                                </div>
                              </div>
                              <span className={cn("text-[9px] font-bold uppercase", wp.reached ? "text-emerald-400" : "text-amber-400")}>
                                {wp.reached ? "REACHED" : "PENDING"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refuel Options Modal */}
        <RefuelOptionsModal 
          show={showRefuelOptions}
          language={language}
          onExternalTank={() => {
            setUseSubTank(true);
            setFuelCapacityMultiplier(1.3);
            const newFuel = selectedAircraft.maxFuel * 1.3;
            setInitialFuel(newFuel);
            setFuelRemaining(newFuel);
            setIsFuelValid(true);
            setShowRefuelOptions(false);
          }}
          onConfirmAirRefuel={(refuelPos) => {
            const tankerWp: Waypoint = {
              id: 'tanker-rv-' + Date.now(),
              name: language === 'id' ? 'TITIK RENDEZVOUS TANKER (AAR)' : 'TANKER RV ORBIT (AAR)',
              lat: Number(refuelPos.lat.toFixed(4)),
              lng: Number(refuelPos.lng.toFixed(4)),
              reached: false,
              type: 'tanker',
              planAltitude: 24000,
              planSpeed: 320,
              isRV: true
            };

            setWaypoints(prev => {
              if (prev.length === 0) {
                return [tankerWp];
              }
              if (prev.length === 1) {
                return [prev[0], tankerWp];
              }
              const dep = prev.find(w => w.id.startsWith('dep-')) || prev[0];
              const arr = prev.find(w => w.id.startsWith('arr-')) || prev[prev.length - 1];
              const otherWps = prev.filter(w => w.id !== dep.id && w.id !== arr.id && w.type !== 'tanker');
              const updated = [dep, tankerWp, ...otherWps, ...(arr.id !== dep.id ? [arr] : [])];
              return calculateFuelPlan(updated, initialFuel * 1.5, selectedAircraft.burnRate, selectedAircraft.cruiseSpeed);
            });

            const depBase = departureAirport || MILITARY_AIRPORTS[0];
            const tanker: TankerAircraft = {
              id: 'tanker-' + Date.now(),
              lat: Number(refuelPos.lat.toFixed(4)),
              lng: Number(refuelPos.lng.toFixed(4)),
              heading: 90,
              state: 'flying_to_wp',
              wp: tankerWp,
              base: { lat: depBase.lat, lng: depBase.lng, icao: depBase.icao, name: depBase.name },
              callsign: 'PEGASUS-01'
            };
            setTankerAircraft([tanker]);

            setTankerOrbit(refuelPos);
            setShowRefuelOptions(false);
            setIsFuelValid(true);
          }}
          onPickOnMap={() => {
            setShowRefuelOptions(false);
            setIsPickingTankerRV(true);
          }}
          onAbort={() => setShowRefuelOptions(false)}
          departurePos={departureAirport ? { lat: departureAirport.lat, lng: departureAirport.lng } : (waypoints[0] || null)}
          targetPos={rendezvousPoint ? { lat: rendezvousPoint.lat, lng: rendezvousPoint.lng } : (waypoints[waypoints.length - 1] || null)}
          departureAirport={departureAirport}
          totalDistance={refuelDistance}
          initialFuel={initialFuel}
          burnRate={selectedAircraft.burnRate}
          aircraftName={selectedAircraft.name}
        />

        {/* Mission Summary Modal */}
        <AnimatePresence>
          {showMissionSummary && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#0a0c10] border border-green-500/30 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl shadow-green-500/10 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
                
                <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-green-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-white">
                      {language === 'id' ? 'MISI SELESAI' : 'MISSION ACCOMPLISHED'}
                    </h2>
                    <p className="text-sm text-green-400/60 font-mono uppercase tracking-widest">
                      {language === 'id' ? 'Pendaratan Berhasil di' : 'Successful Landing at'} {arrivalAirport?.icao}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 w-full">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1">
                      <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{language === 'id' ? 'SKOR TOTAL' : 'TOTAL SCORE'}</p>
                      <p className="text-3xl font-mono font-bold text-blue-400">{points}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1">
                      <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{language === 'id' ? 'SISA BBM' : 'FUEL REMAINING'}</p>
                      <p className="text-3xl font-mono font-bold text-orange-400">{Math.round(fuelRemaining)}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1">
                      <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{language === 'id' ? 'WAKTU TERBANG' : 'FLIGHT TIME'}</p>
                      <p className="text-3xl font-mono font-bold text-green-400">{(flightHours / 60).toFixed(1)}h</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setShowMissionSummary(false);
                      deleteCurrentRoute();
                    }}
                    className="w-full py-5 bg-white text-black font-black rounded-2xl transition-all hover:bg-green-400 hover:scale-[1.02] active:scale-95 uppercase tracking-[0.2em] text-sm shadow-xl"
                  >
                    {language === 'id' ? 'KEMBALI KE MENU UTAMA' : 'RETURN TO MAIN MENU'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal 
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirmLogout={handleConfirmLogout}
          language={language}
          pilotName={crew.pilot || playerProfile?.fullName || 'Komandan'}
          callsign={crew.callSign || (language === 'id' ? 'ELANG-01' : 'EAGLE-01')}
          squadron={playerProfile?.squadron || 'Skadron Udara'}
          rank={playerProfile?.militaryRank || 'Letkol Pnb'}
        />
      </div>
    </React.Fragment>
  );
}
