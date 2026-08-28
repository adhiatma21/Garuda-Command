import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Tooltip, LayersControl, LayerGroup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Plane, Compass, Navigation, Crosshair } from 'lucide-react';
import { Waypoint, Position, Aircraft, TrafficAircraft, TankerAircraft, EscortStage, ReconState, ReconIntelTarget } from '../../types';
import { MILITARY_AIRPORTS, MilitaryAirport } from '../../airports';
import { INTERNATIONAL_WAYPOINTS } from '../../waypoints';
import { FIR_REGIONS } from '../../constants';
import { RadarRange } from '../RadarRange';
import { MapController } from '../MapController';
import { generateSmoothRoute } from '../../lib/utils';
import { ReconAircraft } from '../../data/reconAircraft';

interface TacticalRadarMapProps {
  language: 'id' | 'en';
  isSimulating: boolean;
  currentPos: Position | null;
  heading: number | null;
  speed: number | null;
  currentAltitude: number;
  waypoints: Waypoint[];
  radarSweepAngle: number;
  otherTraffic: TrafficAircraft[];
  activeTab: string;
  flightDirector: boolean;
  autoPilot: boolean;
  nextWaypoint: Waypoint | null;
  targetHeading: number;
  vvipPos: Position | null;
  vvipHeading: number;
  vvipTargetAircraft: Aircraft;
  escortStage: EscortStage | string;
  tankerAircraft: TankerAircraft[];
  vvipStartPoint: MilitaryAirport | null;
  vvipEndPoint: MilitaryAirport | null;
  rendezvousPoint: Waypoint | null;
  autoTrack: boolean;
  setAutoTrack: (val: boolean) => void;
  onMapClick?: (lat: number, lng: number) => void;
  tankerOrbit?: Position | null;
  setTankerOrbit?: (pos: Position | null) => void;
  isPatrolMission?: boolean;
  interceptTarget?: TrafficAircraft | null;
  selectedAircraft?: Aircraft;
  callSign?: string;
  combatMode?: boolean;
  centerTrigger?: number;
  zoomInTrigger?: number;
  zoomOutTrigger?: number;
  reconState?: ReconState | null;
  selectedRecon?: ReconAircraft | null;
  reconDeparture?: MilitaryAirport | null;
  reconArrival?: MilitaryAirport | null;
}

export const TacticalRadarMap: React.FC<TacticalRadarMapProps> = ({
  language,
  isSimulating,
  currentPos,
  heading,
  speed,
  currentAltitude,
  waypoints,
  radarSweepAngle,
  otherTraffic,
  activeTab,
  flightDirector,
  autoPilot,
  nextWaypoint,
  targetHeading,
  vvipPos,
  vvipHeading,
  vvipTargetAircraft,
  escortStage,
  tankerAircraft,
  vvipStartPoint,
  vvipEndPoint,
  rendezvousPoint,
  autoTrack,
  setAutoTrack,
  onMapClick,
  tankerOrbit,
  setTankerOrbit,
  isPatrolMission,
  interceptTarget,
  selectedAircraft,
  callSign,
  combatMode,
  centerTrigger = 0,
  zoomInTrigger = 0,
  zoomOutTrigger = 0,
  reconState,
  selectedRecon,
  reconDeparture,
  reconArrival
}) => {
  // Ultra-Crisp Precision Military Vector Silhouettes (ViewBox: 0 0 64 64)
  // 1. Fighter Jet (Delta + Swept Wings, Canards, Cockpit, Wingtip Rails, Dual Exhaust)
  const renderFighterJetSvg = (color: string, glowColor: string) => `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_0_12px_${glowColor}]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Afterburner Exhaust Flame -->
      <polygon points="30,52 32,60 34,52" fill="#38bdf8" opacity="0.9" />
      <polygon points="31,52 32,56 33,52" fill="#ffffff" opacity="0.9" />
      <!-- Main Fighter Airframe -->
      <path d="M32 4 L35 16 L40 25 L58 38 L58 43 L40 39 L40 48 L48 55 L48 58 L35 54 L32 55 L29 54 L16 58 L16 55 L24 48 L24 39 L6 43 L6 38 L24 25 L29 16 Z" 
            fill="${color}" stroke="#e0f2fe" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Cockpit Canopy Glass -->
      <path d="M32 14 C33.5 14 34.5 18 34.5 24 C34.5 28 33.5 30 32 30 C30.5 30 29.5 28 29.5 24 C29.5 18 30.5 14 32 14 Z" 
            fill="#0284c7" stroke="#bae6fd" stroke-width="1" />
      <!-- Wingtip Missile Pods -->
      <rect x="5" y="36" width="2" height="9" rx="1" fill="#f8fafc" stroke="#38bdf8" stroke-width="0.8" />
      <rect x="57" y="36" width="2" height="9" rx="1" fill="#f8fafc" stroke="#38bdf8" stroke-width="0.8" />
      <!-- Stealth Panel Accents -->
      <line x1="28" y1="44" x2="24" y2="52" stroke="#bae6fd" stroke-width="0.8" opacity="0.7" />
      <line x1="36" y1="44" x2="40" y2="52" stroke="#bae6fd" stroke-width="0.8" opacity="0.7" />
    </svg>
  `;

  // 2. Heavy Transport / Maritime Patrol / Bomber Airframe
  const renderTransportSvg = (color: string, glowColor: string) => `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_0_12px_${glowColor}]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Fuselage & Swept Wings -->
      <path d="M32 3 C35 3 37 10 37 22 L62 31 L62 36 L37 34 L37 50 L48 55 L48 59 L35 57 L32 58 L29 57 L16 59 L16 55 L27 50 L27 34 L2 36 L2 31 L27 22 C27 10 29 3 32 3 Z" 
            fill="${color}" stroke="#e0f2fe" stroke-width="1.2" stroke-linejoin="round" />
      <!-- 4 Engine Turboprops/Nacelles -->
      <rect x="13" y="28" width="3" height="9" rx="1" fill="#0f172a" stroke="#bae6fd" stroke-width="0.8" />
      <rect x="20" y="28" width="3" height="9" rx="1" fill="#0f172a" stroke="#bae6fd" stroke-width="0.8" />
      <rect x="41" y="28" width="3" height="9" rx="1" fill="#0f172a" stroke="#bae6fd" stroke-width="0.8" />
      <rect x="48" y="28" width="3" height="9" rx="1" fill="#0f172a" stroke="#bae6fd" stroke-width="0.8" />
      <!-- Flight Deck Windshield -->
      <ellipse cx="32" cy="11" rx="2.5" ry="4" fill="#0284c7" stroke="#bae6fd" stroke-width="0.8" />
    </svg>
  `;

  // 3. Helicopter Silhouette (with Spinning Rotor Disc Aura)
  const renderHelicopterSvg = (color: string, glowColor: string) => `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_0_12px_${glowColor}]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Rotor Disc Arc -->
      <circle cx="32" cy="24" r="22" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4, 4" opacity="0.6" />
      <!-- Spinning Rotor Blades -->
      <line x1="10" y1="24" x2="54" y2="24" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
      <line x1="32" y1="2" x2="32" y2="46" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
      <!-- Fuselage -->
      <ellipse cx="32" cy="24" rx="6" ry="14" fill="${color}" stroke="#e0f2fe" stroke-width="1.2" />
      <!-- Cockpit Visor -->
      <path d="M29 14 Q32 10 35 14 Q36 20 32 21 Q28 20 29 14 Z" fill="#0284c7" stroke="#bae6fd" stroke-width="0.8" />
      <!-- Tail Boom & Fenestron / Tail Rotor -->
      <line x1="32" y1="36" x2="32" y2="58" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="28" y1="56" x2="36" y2="56" stroke="#e0f2fe" stroke-width="1.2" />
      <circle cx="36" cy="56" r="3" stroke="#38bdf8" stroke-width="1" fill="#0284c7" />
    </svg>
  `;

  // 4. VVIP Presidential Jet Airframe
  const renderVvipJetSvg = `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_0_16px_rgba(52,211,153,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Elegant Widebody Swept-Wing Airframe -->
      <path d="M32 3 C35 3 37 11 37 24 L62 37 L62 42 L37 36 L37 51 L48 57 L48 61 L35 58 L32 59 L29 58 L16 61 L16 57 L27 51 L27 36 L2 42 L2 37 L27 24 C27 11 29 3 32 3 Z" 
            fill="#065f46" stroke="#34d399" stroke-width="1.3" stroke-linejoin="round" />
      <!-- Presidential Dual High-Bypass Engines -->
      <rect x="20" y="32" width="4" height="11" rx="2" fill="#022c22" stroke="#6ee7b7" stroke-width="1" />
      <rect x="40" y="32" width="4" height="11" rx="2" fill="#022c22" stroke="#6ee7b7" stroke-width="1" />
      <!-- Flight Deck & Presidential Gold Stripe -->
      <ellipse cx="32" cy="12" rx="2.5" ry="4.5" fill="#a7f3d0" stroke="#34d399" stroke-width="0.8" />
      <line x1="32" y1="18" x2="32" y2="48" stroke="#fbbf24" stroke-width="1.2" />
    </svg>
  `;

  // 5. Tanker Refueler Airframe
  const renderTankerSvg = `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_0_14px_rgba(249,115,22,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- High-Wing Tanker Fuselage -->
      <path d="M32 3 C35 3 37 11 37 23 L62 31 L62 36 L37 34 L37 50 L48 55 L48 59 L35 57 L32 58 L29 57 L16 59 L16 55 L27 50 L27 34 L2 36 L2 31 L27 23 C27 11 29 3 32 3 Z" 
            fill="#7c2d12" stroke="#fb923c" stroke-width="1.3" stroke-linejoin="round" />
      <!-- Wing Refueling Drogue Pods -->
      <rect x="8" y="32" width="3" height="7" rx="1.5" fill="#ffedd5" stroke="#f97316" stroke-width="0.8" />
      <rect x="53" y="32" width="3" height="7" rx="1.5" fill="#ffedd5" stroke="#f97316" stroke-width="0.8" />
      <!-- Centerline Flying Refueling Boom -->
      <line x1="32" y1="57" x2="32" y2="63" stroke="#fdba74" stroke-width="2" stroke-linecap="round" />
    </svg>
  `;

  // 6. Stealth Recon Drone / MPA Silhouette
  const renderReconSvg = `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_0_16px_rgba(34,211,238,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Stealth Flying Wing / MALE UAV Airframe -->
      <path d="M32 6 L44 26 L58 32 L58 38 L36 34 L36 50 L42 56 L36 54 L32 56 L28 54 L22 56 L28 50 L28 34 L6 38 L6 32 L20 26 Z" 
            fill="#083344" stroke="#22d3ee" stroke-width="1.3" stroke-linejoin="round" />
      <!-- High-Tech Sensor Ball / FLIR Gimbal Optronics -->
      <circle cx="32" cy="14" r="3.5" fill="#06b6d4" stroke="#cffafe" stroke-width="1" />
      <!-- SAR Radar Wing Pods -->
      <rect x="18" y="29" width="3" height="7" rx="1.5" fill="#155e75" stroke="#22d3ee" stroke-width="0.8" />
      <rect x="43" y="29" width="3" height="7" rx="1.5" fill="#155e75" stroke="#22d3ee" stroke-width="0.8" />
    </svg>
  `;

  // Choose appropriate SVG silhouette based on aircraft configuration
  const getPlayerAircraftSvg = () => {
    const acType = selectedAircraft?.type?.toLowerCase() || 'fighter';
    if (acType.includes('heli')) {
      return renderHelicopterSvg('#0369a1', 'rgba(56,189,248,0.9)');
    }
    if (acType.includes('transport') || acType.includes('cargo') || acType.includes('bomber')) {
      return renderTransportSvg('#1e293b', 'rgba(56,189,248,0.9)');
    }
    // Default Fighter Jet
    return renderFighterJetSvg('#0c4a6e', 'rgba(56,189,248,0.9)');
  };

  // Calculate smooth curves for mission routes
  const smoothPlayerRoute = useMemo(() => {
    if (waypoints.length < 2) return [];
    return generateSmoothRoute(waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng })), 20);
  }, [waypoints]);

  const smoothVvipRoute = useMemo(() => {
    if (!vvipStartPoint || !vvipEndPoint) return [];
    const pts = [
      { lat: vvipStartPoint.lat, lng: vvipStartPoint.lng },
      ...(rendezvousPoint ? [{ lat: rendezvousPoint.lat, lng: rendezvousPoint.lng }] : []),
      { lat: vvipEndPoint.lat, lng: vvipEndPoint.lng }
    ];
    return generateSmoothRoute(pts, 20);
  }, [vvipStartPoint, rendezvousPoint, vvipEndPoint]);

  const smoothReconRoute = useMemo(() => {
    if (!reconState || reconState.surveyPoints.length === 0) return [];
    const depAirport = reconDeparture || MILITARY_AIRPORTS.find(a => a.icao === reconState.departureIcao);
    const arrAirport = reconArrival || MILITARY_AIRPORTS.find(a => a.icao === reconState.arrivalIcao);

    const pts: { lat: number; lng: number }[] = [];
    if (depAirport) pts.push({ lat: depAirport.lat, lng: depAirport.lng });
    pts.push(...reconState.surveyPoints.map(wp => ({ lat: wp.lat, lng: wp.lng })));
    if (arrAirport) pts.push({ lat: arrAirport.lat, lng: arrAirport.lng });

    if (pts.length < 2) return [];
    return generateSmoothRoute(pts, 20);
  }, [reconState, reconDeparture, reconArrival]);

  return (
    <MapContainer 
      center={[0, 118]} 
      zoom={5} 
      className="h-full w-full bg-[#05070a]" 
      zoomControl={false}
      dragging={true}
      touchZoom={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      inertia={true}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name={language === 'id' ? 'Satelit' : 'Satellite'}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name={language === 'id' ? 'Gelap' : 'Dark'}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="CartoDB" />
        </LayersControl.BaseLayer>
        
        {activeTab === 'weather' && (
          <LayersControl.Overlay checked name={language === 'id' ? 'Radar Cuaca' : 'Weather Radar'}>
            <TileLayer 
              url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY" 
              opacity={0.6}
              className="radar-layer"
            />
          </LayersControl.Overlay>
        )}
        <LayersControl.Overlay checked name={language === 'id' ? "Radar Militer" : "Military Radar"}>
          <LayerGroup>
            {MILITARY_AIRPORTS.map((airport, index) => (
              <RadarRange key={airport.icao} airport={airport} rotation={radarSweepAngle} offset={index * 45} />
            ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>

      <MapController 
        currentPos={currentPos} 
        waypoints={waypoints} 
        autoTrack={autoTrack} 
        setAutoTrack={setAutoTrack}
        centerTrigger={centerTrigger}
        zoomInTrigger={zoomInTrigger}
        zoomOutTrigger={zoomOutTrigger}
      />
      
      {onMapClick && (
        <MapEventsHandler onMapClick={onMapClick} />
      )}
      
      {/* Tanker Orbit Circle */}
      {tankerOrbit && (
        <LayerGroup>
          <CircleMarker 
            center={[tankerOrbit.lat, tankerOrbit.lng]} 
            radius={45} 
            pathOptions={{ color: '#f97316', fill: true, fillColor: '#f97316', fillOpacity: 0.05, dashArray: '6, 8', weight: 1.5 }}
          />
          <Marker 
            position={[tankerOrbit.lat, tankerOrbit.lng]}
            icon={L.divIcon({
              className: 'bg-transparent',
              html: `
                <div class="flex flex-col items-center">
                  <div class="w-4 h-4 rounded-full bg-orange-500/30 border border-orange-500 animate-ping" />
                  <p class="text-[7px] font-black text-orange-400 uppercase tracking-tighter bg-black/80 px-1.5 py-0.5 rounded border border-orange-500/30 mt-1">ORBIT RV</p>
                </div>
              `,
              iconAnchor: [8, 8]
            })}
          />
        </LayerGroup>
      )}

      {/* Intercept Target Line */}
      {isSimulating && interceptTarget && currentPos && (
        <Polyline 
          positions={[[currentPos.lat, currentPos.lng], [interceptTarget.lat, interceptTarget.lng]]}
          color="#ef4444"
          weight={2}
          dashArray="4, 8"
          opacity={0.7}
        />
      )}
      
      {/* Auto-Track Follow Button Overlay (bottom-left area) */}
      <div className="absolute bottom-6 left-6 z-[1000] flex items-center gap-2">
        <button 
          onClick={() => setAutoTrack(!autoTrack)}
          className={`px-3 py-2 rounded-xl border transition-all shadow-2xl backdrop-blur-md flex items-center gap-2 font-mono text-[9px] font-bold tracking-wider ${
            autoTrack ? 'bg-blue-600/90 border-blue-400 text-white shadow-blue-500/30 ring-1 ring-blue-400' : 'bg-black/75 border-white/15 text-white/60 hover:text-white hover:bg-black/90'
          }`}
          title={autoTrack ? (language === 'id' ? 'Kamera Mengikuti Pesawat (Klik untuk bebas geser)' : 'Camera Following Aircraft (Click to pan freely)') : (language === 'id' ? 'Kamera Bebas (Klik untuk mengikuti pesawat)' : 'Free Camera (Click to lock on aircraft)')}
        >
          <Crosshair className={`w-4 h-4 ${autoTrack ? 'animate-spin text-blue-300' : ''}`} />
          <span>{autoTrack ? (language === 'id' ? 'KAMERA: MENGIKUTI' : 'CAM: FOLLOW') : (language === 'id' ? 'KAMERA: BEBAS GESER' : 'CAM: FREE')}</span>
        </button>

        {!autoTrack && currentPos && (
          <button
            onClick={() => setAutoTrack(true)}
            className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 font-mono text-[9px] font-bold tracking-wider shadow-lg flex items-center gap-1.5 transition-all"
            title={language === 'id' ? 'Pusatkan ke Posisi Pesawat' : 'Center on Aircraft'}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'PUSATKAN' : 'RE-CENTER'}</span>
          </button>
        )}
      </div>

      {/* FIR Boundaries */}
      {FIR_REGIONS.map(fir => (
        <React.Fragment key={fir.name}>
          <Polyline 
            positions={fir.bounds as [number, number][]} 
            color={fir.color} 
            weight={1.5} 
            opacity={0.35} 
            dashArray="3, 8"
            smoothFactor={2}
          />
          <Marker 
            position={fir.bounds[0] as [number, number]} 
            icon={L.divIcon({
              className: 'bg-transparent',
              html: `<div class="text-[8px] font-bold uppercase tracking-widest" style="color: ${fir.color}; opacity: 0.7; white-space: nowrap;">${fir.name}</div>`,
              iconSize: [100, 20],
              iconAnchor: [0, 0]
            })}
          />
        </React.Fragment>
      ))}
      
      {/* Smooth Tactical Player Route Lines */}
      {smoothPlayerRoute.length > 1 && (
        <React.Fragment>
          {/* Outer Ambient Glow */}
          <Polyline 
            positions={smoothPlayerRoute} 
            color="#3b82f6" 
            weight={7} 
            opacity={0.2}
            lineCap="round"
            lineJoin="round"
          />
          {/* Mid Accent Glow */}
          <Polyline 
            positions={smoothPlayerRoute} 
            color="#60a5fa" 
            weight={3.5} 
            opacity={0.45}
            lineCap="round"
            lineJoin="round"
          />
          {/* Crisp Core Route */}
          <Polyline 
            positions={smoothPlayerRoute} 
            color="#93c5fd" 
            weight={1.8} 
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />
        </React.Fragment>
      )}

      {/* Smooth VVIP Route Line */}
      {smoothVvipRoute.length > 1 && (
        <React.Fragment>
          {/* Outer Crimson Glow */}
          <Polyline 
            positions={smoothVvipRoute} 
            color="#ef4444" 
            weight={6} 
            opacity={0.2}
            lineCap="round"
            lineJoin="round"
          />
          {/* Inner Dashed Corridor */}
          <Polyline 
            positions={smoothVvipRoute} 
            color="#f87171" 
            weight={2.2} 
            opacity={0.8}
            dashArray="6, 8"
            lineCap="round"
            lineJoin="round"
          />
        </React.Fragment>
      )}

      {/* Smooth Reconnaissance Survey Track Line */}
      {smoothReconRoute.length > 1 && (
        <React.Fragment>
          {/* Outer Cyan Glow */}
          <Polyline 
            positions={smoothReconRoute} 
            color="#06b6d4" 
            weight={7} 
            opacity={0.25}
            lineCap="round"
            lineJoin="round"
          />
          {/* Inner Teal Dashed Recon Corridor */}
          <Polyline 
            positions={smoothReconRoute} 
            color="#22d3ee" 
            weight={2.2} 
            opacity={0.85}
            dashArray="5, 8"
            lineCap="round"
            lineJoin="round"
          />
        </React.Fragment>
      )}

      {/* Recon Sensor Footprint Circle & Scanning Arc */}
      {reconState?.reconFlight?.pos && (
        <LayerGroup>
          <CircleMarker
            center={[reconState.reconFlight.pos.lat, reconState.reconFlight.pos.lng]}
            radius={Math.min(60, Math.max(25, (selectedRecon?.radarRadiusNM || 45) * 0.8))}
            pathOptions={{
              color: '#22d3ee',
              fill: true,
              fillColor: '#06b6d4',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 6'
            }}
          />
        </LayerGroup>
      )}

      {/* Reconnaissance Survey Target Coordinates Waypoints on Map */}
      {reconState?.surveyPoints && reconState.surveyPoints.map((wp, idx) => {
        const isReached = reconState.reconFlight ? (reconState.reconFlight.currentWpIndex > idx) : wp.reached;
        const isCurrentTarget = reconState.reconFlight ? (reconState.reconFlight.currentWpIndex === idx && reconState.phase === 'recon_enroute') : false;

        return (
          <LayerGroup key={`recon-survey-wp-${wp.id || idx}-${idx}`}>
            {/* Target Survey Footprint Halo */}
            <CircleMarker
              center={[wp.lat, wp.lng]}
              radius={22}
              pathOptions={{
                color: isReached ? '#10b981' : isCurrentTarget ? '#22d3ee' : '#06b6d4',
                fill: true,
                fillColor: isCurrentTarget ? '#22d3ee' : '#0891b2',
                fillOpacity: isCurrentTarget ? 0.16 : 0.05,
                weight: isCurrentTarget ? 2 : 1.2,
                dashArray: isCurrentTarget ? '4, 4' : '3, 6'
              }}
            />
            <Marker
              position={[wp.lat, wp.lng]}
              icon={L.divIcon({
                className: 'bg-transparent',
                html: `
                  <div class="relative flex flex-col items-center pointer-events-none select-none" style="width: 52px; height: 52px;">
                    <!-- Rotating Targeting Reticle -->
                    <div class="absolute inset-1 rounded-full border ${isCurrentTarget ? 'border-cyan-400 animate-spin' : isReached ? 'border-emerald-400/60' : 'border-cyan-500/40'}" style="animation-duration: 7s;"></div>
                    ${isCurrentTarget ? '<div class="absolute inset-0 rounded-full border border-cyan-300 animate-ping"></div>' : ''}
                    
                    <!-- Center Waypoint Target Pin -->
                    <div class="w-7 h-7 rounded-full ${isReached ? 'bg-emerald-950/90 border-emerald-400' : isCurrentTarget ? 'bg-cyan-950/90 border-cyan-400' : 'bg-[#042f2e]/90 border-cyan-500'} border-2 shadow-2xl flex items-center justify-center text-[9px] font-black ${isReached ? 'text-emerald-300' : 'text-cyan-300'} font-mono">
                      ${idx + 1}
                    </div>

                    <!-- Coordinate & Sector Tag Badge -->
                    <div class="absolute top-9 flex flex-col items-center bg-[#031525]/95 backdrop-blur-md px-1.5 py-0.5 rounded-lg border ${isCurrentTarget ? 'border-cyan-400/80 shadow-cyan-500/30' : isReached ? 'border-emerald-500/50' : 'border-cyan-500/40'} shadow-xl whitespace-nowrap z-10 text-center">
                      <p class="text-[7.5px] font-black ${isReached ? 'text-emerald-300' : 'text-cyan-300'} font-mono uppercase tracking-tighter leading-none">
                        ${wp.name || `SURVEY-${idx + 1}`}
                      </p>
                      <p class="text-[6.5px] font-mono text-cyan-200/80 font-bold leading-none mt-0.5">
                        ${wp.lat.toFixed(3)}, ${wp.lng.toFixed(3)}
                      </p>
                    </div>
                  </div>
                `,
                iconSize: [52, 52],
                iconAnchor: [26, 26]
              })}
            />
          </LayerGroup>
        );
      })}

      {/* Detected Recon Intel Targets on Map */}
      {reconState?.detectedTargets && reconState.detectedTargets.map((target) => {
        const isEliminated = target.isEliminated;
        const iconSymbol = target.type === 'enemy_fighter' ? '✈' :
          target.type === 'enemy_warship' ? '⚓' :
          target.type === 'enemy_submarine' ? '▲' :
          target.type === 'insurgents' ? '☠' :
          target.type === 'anti_air_sam' ? '🚀' : '📡';

        return (
          <LayerGroup key={target.id}>
            {/* Threat Engagement Radius Ring */}
            <CircleMarker
              center={[target.lat, target.lng]}
              radius={20}
              pathOptions={{
                color: isEliminated ? '#10b981' : '#ef4444',
                fill: true,
                fillColor: isEliminated ? '#10b981' : '#ef4444',
                fillOpacity: isEliminated ? 0.05 : 0.12,
                weight: 1.5,
                dashArray: isEliminated ? '2, 4' : '4, 4'
              }}
            />
            <Marker
              position={[target.lat, target.lng]}
              icon={L.divIcon({
                className: 'bg-transparent',
                html: `
                  <div class="relative flex flex-col items-center pointer-events-none select-none" style="width: 50px; height: 50px;">
                    <!-- Threat Reticle Animation -->
                    <div class="absolute inset-1 rounded-full border ${isEliminated ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/80 bg-red-500/20 animate-ping'}"></div>
                    <div class="absolute inset-0 rounded-full border ${isEliminated ? 'border-emerald-400' : 'border-red-400 animate-spin'}" style="animation-duration: 6s;"></div>
                    
                    <!-- Threat Icon Center -->
                    <div class="w-8 h-8 rounded-full ${isEliminated ? 'bg-emerald-950/90 border-emerald-400' : 'bg-red-950/95 border-red-500'} border-2 shadow-2xl flex items-center justify-center text-xs font-black ${isEliminated ? 'text-emerald-300' : 'text-red-300'}">
                      ${iconSymbol}
                    </div>

                    <!-- Threat Tag Badge -->
                    <div class="absolute top-9 flex flex-col items-center ${isEliminated ? 'bg-emerald-950/95 border-emerald-500/50' : 'bg-red-950/95 border-red-500/70 shadow-red-500/40'} backdrop-blur-md px-1.5 py-0.5 rounded-lg border shadow-xl whitespace-nowrap z-10">
                      <p class="text-[7px] font-black ${isEliminated ? 'text-emerald-300' : 'text-red-300'} font-mono uppercase tracking-tighter leading-none">
                        ${isEliminated ? '✓ NEUTRALIZED' : target.name.split(' - ')[0]}
                      </p>
                      <p class="text-[6px] font-mono text-amber-300 font-bold leading-none mt-0.5 uppercase">
                        ${target.actionRequired}
                      </p>
                    </div>
                  </div>
                `,
                iconSize: [50, 50],
                iconAnchor: [25, 25]
              })}
            />
          </LayerGroup>
        );
      })}

      {/* Rendezvous Point Halo Area */}
      {rendezvousPoint && (
        <LayerGroup>
          <CircleMarker 
            center={[rendezvousPoint.lat, rendezvousPoint.lng]} 
            radius={25} 
            pathOptions={{ color: '#f59e0b', fill: true, fillColor: '#f59e0b', fillOpacity: 0.08, weight: 1.5, dashArray: '4, 6' }}
          />
        </LayerGroup>
      )}

      {/* Flight Director (FD) Line */}
      {isSimulating && flightDirector && currentPos && (
        <Polyline 
          positions={[
            [currentPos.lat, currentPos.lng],
            (() => {
              const brng = autoPilot ? (nextWaypoint ? Math.round(Math.atan2(Math.sin((nextWaypoint.lng - currentPos.lng) * Math.PI / 180) * Math.cos(nextWaypoint.lat * Math.PI / 180), Math.cos(currentPos.lat * Math.PI / 180) * Math.sin(nextWaypoint.lat * Math.PI / 180) - Math.sin(currentPos.lat * Math.PI / 180) * Math.cos(nextWaypoint.lat * Math.PI / 180) * Math.cos((nextWaypoint.lng - currentPos.lng) * Math.PI / 180)) * 180 / Math.PI + 360) % 360 : (heading || 0)) : targetHeading;
              const dist = 50; 
              const latMove = (dist / 60) * Math.cos((brng * Math.PI) / 180);
              const lngMove = (dist / (60 * Math.cos((currentPos.lat * Math.PI) / 180))) * Math.sin((brng * Math.PI) / 180);
              return [currentPos.lat + latMove, currentPos.lng + lngMove];
            })()
          ]} 
          color="#fbbf24" 
          weight={2} 
          dashArray="5, 10"
          opacity={0.7}
        />
      )}

      {/* International Waypoints */}
      {INTERNATIONAL_WAYPOINTS.map((wp, idx) => (
        <CircleMarker 
          key={`intl-wp-${wp.id}-${idx}`} 
          center={[wp.lat, wp.lng]} 
          radius={3} 
          pathOptions={{ color: 'rgba(255, 255, 255, 0.4)', fillColor: 'rgba(255, 255, 255, 0.2)', fillOpacity: 0.8, weight: 1 }}
        >
          <Tooltip direction="top" offset={[0, -5]} opacity={0.9} className="bg-black/90 border-white/10 text-[8px] text-white font-mono px-1.5 py-0.5 rounded shadow-xl">
            {wp.name}
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Other Traffic Markers */}
      {otherTraffic.map((t, idx) => {
        const isTarget = isPatrolMission && interceptTarget && interceptTarget.id === t.id;
        return (
          <Marker 
            key={`traffic-${t.id}-${idx}`} 
            position={[t.lat, t.lng]}
            icon={L.divIcon({
              className: 'bg-transparent',
              html: `
                <div class="relative flex flex-col items-center pointer-events-none select-none" style="width: 48px; height: 48px;">
                  <!-- Rotated Airframe & Velocity Vector -->
                  <div class="absolute inset-0 flex items-center justify-center transition-transform duration-300" style="transform: rotate(${t.heading}deg); transform-origin: 24px 24px;">
                    <!-- Velocity Leader Line -->
                    <div class="absolute -top-3 w-0.5 h-3 ${isTarget || t.isEnemy ? 'bg-red-400' : 'bg-amber-400'} opacity-80"></div>
                    <!-- TCAS Chevron / Diamond Airframe -->
                    <div class="w-7 h-7 ${isTarget || t.isEnemy ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse' : 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]'}">
                      <svg viewBox="0 0 64 64" fill="currentColor" stroke="#000000" stroke-width="1.5">
                        <path d="M32 6 L56 36 L44 34 L44 54 L32 50 L20 54 L20 34 L8 36 Z" />
                      </svg>
                    </div>
                  </div>
                  <!-- Tactical TCAS Flight Tag -->
                  <div class="absolute top-10 flex flex-col items-center bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-lg border ${isTarget || t.isEnemy ? 'border-red-500/70 shadow-red-500/30' : 'border-amber-500/40 shadow-amber-500/10'} shadow-lg whitespace-nowrap z-10">
                    <p class="text-[7.5px] font-mono font-black ${isTarget || t.isEnemy ? 'text-red-400' : 'text-amber-300'} tracking-tight leading-tight flex items-center gap-1">
                      ${isTarget ? '<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>TARGET' : t.callsign}
                    </p>
                    <p class="text-[6.5px] font-mono text-white/80 font-bold leading-tight">
                      FL${Math.round(t.altitude / 100).toString().padStart(3, '0')} • ${Math.round(t.speed)}KTS
                    </p>
                  </div>
                </div>
              `,
              iconSize: [48, 48],
              iconAnchor: [24, 24]
            })}
          />
        );
      })}

      {/* VVIP Aircraft Marker */}
      {vvipPos && (
        <Marker 
          position={[vvipPos.lat, vvipPos.lng]}
          icon={L.divIcon({
            className: 'bg-transparent',
            html: `
              <div class="relative flex flex-col items-center pointer-events-none select-none" style="width: 56px; height: 56px;">
                <!-- Escort Bubble Perimeter Ring -->
                <div class="absolute inset-0 rounded-full border border-dashed ${escortStage === 'escorting' ? 'border-emerald-400/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(52,211,153,0.2)] animate-pulse' : 'border-amber-400/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.2)]'}"></div>

                <!-- Rotated Aircraft & Trajectory -->
                <div class="absolute inset-0 flex items-center justify-center transition-transform duration-300" style="transform: rotate(${vvipHeading}deg); transform-origin: 28px 28px;">
                  <!-- Velocity Leader Vector -->
                  <div class="absolute -top-4 w-0.5 h-4 bg-emerald-400 opacity-90"></div>
                  <!-- VVIP Jet SVG -->
                  <div class="w-10 h-10">
                    ${renderVvipJetSvg}
                  </div>
                </div>

                <!-- Presidential Tactical Flight Tag -->
                <div class="absolute top-12 flex flex-col items-center ${escortStage === 'escorting' ? 'bg-emerald-950/95 border-emerald-400/60 shadow-emerald-500/30' : 'bg-amber-950/95 border-amber-500/50 shadow-amber-500/30'} backdrop-blur-md px-2.5 py-1 rounded-xl border shadow-2xl min-w-[100px] text-center z-10">
                  <div class="flex items-center justify-center gap-1 mb-0.5">
                    <span class="w-1.5 h-1.5 rounded-full ${escortStage === 'escorting' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}"></span>
                    <p class="text-[8px] font-black ${escortStage === 'escorting' ? 'text-emerald-300' : 'text-amber-300'} uppercase tracking-widest leading-none">
                      INDONESIA-01
                    </p>
                  </div>
                  <p class="text-[6.5px] text-white/90 font-mono font-bold uppercase leading-none">
                    ${vvipTargetAircraft.name.split(' ')[0]} • ${escortStage === 'escorting' ? '★ ESCORT ACTIVE' : escortStage === 'vvip_landed' ? '★ VVIP LANDED / SAFE' : escortStage.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
            `,
            iconSize: [56, 56],
            iconAnchor: [28, 28]
          })}
        />
      )}

      {/* Tankers */}
      {tankerAircraft.map((t, idx) => (
        <Marker 
          key={`tanker-${t.id}-${idx}`} 
          position={[t.lat, t.lng]}
          icon={L.divIcon({
            className: 'bg-transparent',
            html: `
              <div class="relative flex flex-col items-center pointer-events-none select-none" style="width: 52px; height: 52px;">
                <!-- Orbit RV Ring -->
                <div class="absolute inset-1 rounded-full border border-orange-500/30 bg-orange-500/5 animate-pulse"></div>

                <!-- Rotated Aircraft & Refuel Vector -->
                <div class="absolute inset-0 flex items-center justify-center transition-transform duration-300" style="transform: rotate(${t.heading}deg); transform-origin: 26px 26px;">
                  <!-- Velocity Leader Vector -->
                  <div class="absolute -top-3 w-0.5 h-3 bg-orange-400 opacity-80"></div>
                  <!-- Tanker SVG -->
                  <div class="w-9 h-9">
                    ${renderTankerSvg}
                  </div>
                </div>

                <!-- Tanker Flight Tag -->
                <div class="absolute top-11 flex flex-col items-center bg-orange-950/95 backdrop-blur-md px-2 py-0.5 rounded-lg border border-orange-500/50 shadow-xl shadow-orange-500/20 whitespace-nowrap z-10">
                  <p class="text-[7.5px] font-black text-orange-300 font-mono tracking-wider leading-none">
                    ⛽ ${t.callsign} [TANKER]
                  </p>
                </div>
              </div>
            `,
            iconSize: [52, 52],
            iconAnchor: [26, 26]
          })}
        />
      ))}

      {/* Reconnaissance Aircraft Marker */}
      {reconState?.reconFlight?.pos && (
        <Marker
          position={[reconState.reconFlight.pos.lat, reconState.reconFlight.pos.lng]}
          icon={L.divIcon({
            className: 'bg-transparent',
            html: `
              <div class="relative flex flex-col items-center pointer-events-none select-none" style="width: 56px; height: 56px;">
                <!-- Sensor Scanning Pulse Aura -->
                <div class="absolute inset-0 rounded-full border border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse"></div>

                <!-- Rotated Recon Airframe & Forward Vector -->
                <div class="absolute inset-0 flex items-center justify-center transition-transform duration-300" style="transform: rotate(${reconState.reconFlight.heading}deg); transform-origin: 28px 28px;">
                  <!-- Velocity Leader Vector -->
                  <div class="absolute -top-4 w-0.5 h-4 bg-cyan-400 opacity-90 shadow-[0_0_8px_#22d3ee]"></div>
                  <!-- Recon UAV / MPA SVG -->
                  <div class="w-10 h-10">
                    ${renderReconSvg}
                  </div>
                </div>

                <!-- Recon Tactical Flight Tag -->
                <div class="absolute top-12 flex flex-col items-center bg-[#082f49]/95 backdrop-blur-md px-2 py-0.5 rounded-xl border border-cyan-400/60 shadow-2xl shadow-cyan-500/30 whitespace-nowrap z-10 text-center">
                  <div class="flex items-center justify-center gap-1 mb-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <p class="text-[8px] font-black text-cyan-300 uppercase tracking-wider leading-none">
                      INTEL-01 [RECON]
                    </p>
                  </div>
                  <p class="text-[6.5px] text-white/90 font-mono font-bold uppercase leading-none">
                    ${selectedRecon?.name?.split(' ')[0] || 'RECON'} • FL${Math.round(reconState.reconFlight.altitude / 100).toString().padStart(3, '0')} • ${Math.round(reconState.reconFlight.speed)}KTS
                  </p>
                </div>
              </div>
            `,
            iconSize: [56, 56],
            iconAnchor: [28, 28]
          })}
        />
      )}

      {/* Player Aircraft Marker - Supreme Tactical Aviation Design */}
      {currentPos && (
        <Marker 
          position={[currentPos.lat, currentPos.lng]}
          icon={L.divIcon({
            className: 'bg-transparent',
            html: `
              <div class="relative flex flex-col items-center pointer-events-none select-none" style="width: 60px; height: 60px;">
                <!-- Tactical Target Brackets / Reticle -->
                <div class="absolute inset-1 rounded-full border border-cyan-400/20 ${isSimulating ? 'animate-pulse' : ''}"></div>
                <div class="absolute inset-0 rounded-full border-t-2 border-b-2 border-cyan-400/30 ${isSimulating ? 'animate-spin' : ''}" style="animation-duration: 8s;"></div>

                <!-- Rotated Aircraft Body + Forward Velocity Vector -->
                <div class="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out" style="transform: rotate(${heading || 0}deg); transform-origin: 30px 30px;">
                  <!-- Forward Velocity / Heading Vector Line -->
                  <div class="absolute -top-5 w-0.5 h-5 bg-gradient-to-t from-cyan-400 to-cyan-200 shadow-[0_0_8px_#38bdf8] flex flex-col items-center justify-start">
                    <div class="w-1.5 h-1.5 -top-1 absolute rotate-45 border-t border-l border-cyan-200"></div>
                  </div>
                  
                  <!-- Vector Silhouette Airframe -->
                  <div class="w-10 h-10 flex items-center justify-center">
                    ${getPlayerAircraftSvg()}
                  </div>
                </div>

                <!-- Modern Military Glass-Cockpit HUD Flight Tag -->
                <div class="absolute top-13 flex flex-col items-center bg-slate-950/95 backdrop-blur-md rounded-xl border ${combatMode ? 'border-red-500/70 shadow-red-500/30' : 'border-cyan-400/60 shadow-cyan-500/30'} shadow-2xl min-w-[105px] overflow-hidden z-20 transition-all">
                  <!-- Header: Callsign & Status -->
                  <div class="w-full flex items-center justify-between gap-1.5 px-2 py-0.5 ${combatMode ? 'bg-red-950/80 border-b border-red-500/30' : 'bg-cyan-950/80 border-b border-cyan-400/30'}">
                    <span class="text-[8px] font-black tracking-wider ${combatMode ? 'text-red-300' : 'text-cyan-300'} font-mono flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full ${combatMode ? 'bg-red-400' : 'bg-cyan-400'} animate-ping"></span>
                      ${callSign || 'EAGLE-01'}
                    </span>
                    <span class="text-[7px] font-mono font-bold ${combatMode ? 'text-red-300' : 'text-cyan-200/80'} uppercase">
                      ${selectedAircraft?.name ? selectedAircraft.name.split(' ')[0] : 'VIPER'}
                    </span>
                  </div>

                  <!-- Telemetry: FL | IAS | HDG -->
                  <div class="px-2 py-1 flex items-center justify-center gap-1.5 text-[7.5px] font-mono text-slate-100 font-bold whitespace-nowrap">
                    <span>FL${Math.round(currentAltitude / 100).toString().padStart(3, '0')}</span>
                    <span class="text-cyan-400/50">•</span>
                    <span>${Math.round(speed || 0)}KTS</span>
                    <span class="text-cyan-400/50">•</span>
                    <span class="text-amber-300">${Math.round(heading || 0).toString().padStart(3, '0')}°</span>
                  </div>

                  <!-- Autopilot / Combat Sub-Badge (if active) -->
                  ${autoPilot || combatMode ? `
                    <div class="w-full py-0.5 text-[6.5px] font-black font-mono tracking-widest text-center uppercase ${combatMode ? 'bg-red-600 text-white' : 'bg-amber-500/20 text-amber-300 border-t border-amber-500/30'}">
                      ${combatMode ? '⚡ COMBAT MODE' : '✈ AP ENGAGED'}
                    </div>
                  ` : ''}
                </div>
              </div>
            `,
            iconSize: [60, 60],
            iconAnchor: [30, 30]
          })}
        />
      )}

      {/* Waypoint Markers - Precision Tactical Fix Symbol */}
      {waypoints.map((wp, index) => (
        <Marker 
          key={`wp-${wp.id}-${index}`} 
          position={[wp.lat, wp.lng]}
          icon={L.divIcon({
            className: 'bg-transparent',
            html: `
              <div class="relative flex flex-col items-center pointer-events-none select-none">
                <!-- Outer Pulse Halo for Active / RV Waypoints -->
                <div class="w-5 h-5 rounded-full border-2 ${
                  wp.reached 
                    ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' 
                    : wp.isRV 
                    ? 'bg-amber-500/30 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse' 
                    : 'bg-blue-600/30 border-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]'
                } flex items-center justify-center transition-all">
                  ${
                    wp.reached 
                      ? '<svg class="w-3 h-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7" /></svg>' 
                      : `<span class="text-[7px] font-mono font-black text-white">${String(index + 1).padStart(2, '0')}</span>`
                  }
                </div>
                <!-- Waypoint Label Pill -->
                <div class="absolute top-6 bg-slate-950/90 backdrop-blur px-1.5 py-0.5 rounded-md border border-white/20 shadow-xl whitespace-nowrap">
                  <span class="text-[7.5px] font-mono text-cyan-200 uppercase font-black tracking-wider">${wp.isRV ? '[RV] ' : ''}${wp.name}</span>
                </div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        />
      ))}
    </MapContainer>
  );
};

const MapEventsHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};
