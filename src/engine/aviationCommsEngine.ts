import { Position, Waypoint, Aircraft, EscortStage, TrafficAircraft, ReconState } from '../types';
import { MilitaryAirport } from '../airports';
import { ReconAircraft } from '../data/reconAircraft';
import { getDistance, getBearing } from '../lib/utils';

export interface CommsMessage {
  id: string;
  timestamp: string;
  sender: 'PILOT' | 'ATC' | 'VVIP' | 'AWACS' | 'WINGMAN' | 'RECON' | 'TOWER';
  callsign: string;
  frequency: string;
  textId: string;
  textEn: string;
  type: 'DEPARTURE' | 'ENROUTE' | 'VVIP' | 'INTERCEPT' | 'WEATHER' | 'APPROACH' | 'ALERT' | 'ALTITUDE' | 'HEADING' | 'TERRAIN' | 'CUSTOM' | 'RECON';
}

export interface CommsState {
  lastSpokenTime: number;
  lastReportedWaypointId: string | null;
  hasReportedLevelOff: boolean;
  hasReportedClimb100: boolean;
  lastTrafficAdvisoryTime: number;
  lastVvipDistanceCallTime: number;
  lastVvipDialogueTime: number;
  vvipDialogueIndex: number;
  lastReconDialogueTime: number;
  reconDialogueIndex: number;
  lastReportedTargetId: string | null;
  hasReportedTargetLock: boolean;
  lastTargetLockReportTime: number;
  lastStrikeEnrouteDialogueTime: number;
  strikeEnrouteDialogueIndex: number;
  lastWeatherEventTime: number;
  lastAltitudeChangeTime: number;
  lastHeadingInstructionTime: number;
  lastTerrainWarningTime: number;
  lastMissionCheckTime: number;
  escortJoinedSpoken: boolean;
  vvipHoldingSpoken: boolean;
  playerHoldingSpoken: boolean;
  vvipTouchdownSpoken: boolean;
  playerProceedArrivalSpoken: boolean;
  approachSpoken: boolean;
  squawkCode: string;
  cycleIndex: number;
}

export function createInitialCommsState(): CommsState {
  return {
    lastSpokenTime: Date.now(),
    lastReportedWaypointId: null,
    hasReportedLevelOff: false,
    hasReportedClimb100: false,
    lastTrafficAdvisoryTime: 0,
    lastVvipDistanceCallTime: 0,
    lastVvipDialogueTime: 0,
    vvipDialogueIndex: 0,
    lastReconDialogueTime: 0,
    reconDialogueIndex: 0,
    lastReportedTargetId: null,
    hasReportedTargetLock: false,
    lastTargetLockReportTime: 0,
    lastStrikeEnrouteDialogueTime: 0,
    strikeEnrouteDialogueIndex: 0,
    lastWeatherEventTime: 0,
    lastAltitudeChangeTime: 0,
    lastHeadingInstructionTime: 0,
    lastTerrainWarningTime: 0,
    lastMissionCheckTime: 0,
    escortJoinedSpoken: false,
    vvipHoldingSpoken: false,
    playerHoldingSpoken: false,
    vvipTouchdownSpoken: false,
    playerProceedArrivalSpoken: false,
    approachSpoken: false,
    squawkCode: `${Math.floor(4000 + Math.random() * 3000)}`,
    cycleIndex: 0
  };
}

/**
 * Generates highly realistic, situational, and varied aviation communications
 * covering Mission Type, Terrain, Weather, Heading/Altitude Clearance, Obstacles, Traffic,
 * and high-intensity Pilot <-> VVIP Escort two-way dialogues.
 */
export function generatePeriodicFlightComms(
  currentTimeSec: number,
  state: CommsState,
  params: {
    callsign: string;
    language: 'id' | 'en';
    currentPos: Position | null;
    currentAltitude: number;
    speed: number | null;
    heading: number | null;
    fuelRemaining: number;
    missionType: string;
    waypoints: Waypoint[];
    selectedAircraft: Aircraft;
    vvipTargetAircraft: Aircraft;
    vvipPos: Position | null;
    rendezvousPoint: Waypoint | null;
    vvipEndPoint: MilitaryAirport | null;
    arrivalAirport?: MilitaryAirport | null;
    escortStage: EscortStage;
    otherTraffic: TrafficAircraft[];
  }
): { messages: CommsMessage[]; updatedState: CommsState } {
  const messages: CommsMessage[] = [];
  const updatedState = { ...state };
  const {
    callsign,
    currentPos,
    currentAltitude,
    speed,
    heading,
    fuelRemaining,
    missionType,
    waypoints,
    selectedAircraft,
    vvipTargetAircraft,
    vvipPos,
    rendezvousPoint,
    vvipEndPoint,
    arrivalAirport,
    escortStage,
    otherTraffic
  } = params;

  if (!currentPos) return { messages, updatedState };

  const now = Date.now();
  const timeSinceLastSpoken = (now - updatedState.lastSpokenTime) / 1000;
  const timeStr = new Date().toTimeString().substring(0, 5) + 'Z';
  const flStr = `FL${Math.round(currentAltitude / 100).toString().padStart(3, '0')}`;
  const curSpeed = Math.round(speed || 450);
  const curHeading = Math.round(heading || 0);
  const nextWp = waypoints.find(w => !w.reached);

  // =========================================================================
  // 1. HIGH INTENSITY VVIP PILOT <-> PLAYER PILOT EN-ROUTE CONVERSATIONS
  // =========================================================================
  if (missionType === 'VVIPEscort' && escortStage === 'escorting') {
    const timeSinceLastVvipDialogue = (now - updatedState.lastVvipDialogueTime) / 1000;

    // High intensity: trigger lively two-way dialogue every 12-16 seconds while escorting
    if (timeSinceLastVvipDialogue >= 14 && timeSinceLastSpoken >= 6) {
      updatedState.lastVvipDialogueTime = now;
      updatedState.lastSpokenTime = now;
      const vvipCallsign = 'INDONESIA-01';
      const destName = vvipEndPoint?.name || 'Pangkalan Destinasi';
      const destIcao = vvipEndPoint?.icao || 'WIII';
      const distToDest = vvipEndPoint && vvipPos 
        ? Math.round(getDistance(vvipPos.lat, vvipPos.lng, vvipEndPoint.lat, vvipEndPoint.lng))
        : 45;

      const idx = updatedState.vvipDialogueIndex % 7;
      updatedState.vvipDialogueIndex += 1;

      switch (idx) {
        case 0:
          // Formation Lock & Speed Sync
          messages.push({
            id: 'vvip-comm-0a-' + now,
            timestamp: timeStr,
            sender: 'PILOT',
            callsign,
            frequency: '123.45 MHz',
            type: 'VVIP',
            textId: `${vvipCallsign}, ini ${callsign}. Formasi sayap kanan (starboard echelon) terkunci di jarak 0.3 mil laut. Kecepatan jelajah sinkron ${curSpeed} knot, posisi stabil.`,
            textEn: `${vvipCallsign}, this is ${callsign}. Starboard echelon formation locked at 0.3 NM. Cruise speed synchronized at ${curSpeed} knots, holding steady.`
          });
          messages.push({
            id: 'vvip-comm-0b-' + now,
            timestamp: timeStr,
            sender: 'VVIP',
            callsign: vvipCallsign,
            frequency: '123.45 MHz',
            type: 'VVIP',
            textId: `${callsign}, Indonesia-01 membaca loud and clear. Visual pada sayap tempur Anda sangat gagah dan presisi. Terima kasih atas pengawalan ketatnya.`,
            textEn: `${callsign}, Indonesia-01 reads loud and clear. Visual on your fighter wing is sharp and precise. Thank you for the close tactical escort.`
          });
          break;

        case 1:
          // 360-Degree Airspace Scan & Defensive Top-Cover
          messages.push({
            id: 'vvip-comm-1a-' + now,
            timestamp: timeStr,
            sender: 'PILOT',
            callsign,
            frequency: '123.45 MHz',
            type: 'VVIP',
            textId: `${vvipCallsign}, ${callsign}. Membuka sapuan radar AESA 360 derajat. Sektor koridor udara depan dan flank kiri-kanan bersih, tidak ada intrusi lalu lintas.`,
            textEn: `${vvipCallsign}, ${callsign}. Running 360-degree AESA radar sweep. Air corridor ahead and lateral flanks are clear, no unauthorized traffic.`
          });
          messages.push({
            id: 'vvip-comm-1b-' + now,
            timestamp: timeStr,
            sender: 'VVIP',
            callsign: vvipCallsign,
            frequency: '123.45 MHz',
            type: 'VVIP',
            textId: `Roger ${callsign}. Sistem navigasi inertial Indonesia-01 sinkron dengan rute Anda. Melanjutkan jelajah ${flStr} menuju ${destIcao}.`,
            textEn: `Roger ${callsign}. Indonesia-01 inertial navigation is synced with your route. Cruising steady at ${flStr} bound for ${destIcao}.`
          });
          break;

        case 2:
          // Presidential Cabin & Dignitary Status Check
          messages.push({
            id: 'vvip-comm-2a-' + now,
            timestamp: timeStr,
            sender: 'VVIP',
            callsign: vvipCallsign,
            frequency: '123.45 MHz',
            type: 'VVIP',
            textId: `${callsign}, Indonesia-01 mengabarkan kondisi kabin VVIP sangat tenang dan nyaman. Seluruh delegasi kepresidenan dalam kondisi prima.`,
            textEn: `${callsign}, Indonesia-01 reports presidential cabin is smooth and peaceful. All VVIP delegates are in high spirits.`
          });
          messages.push({
            id: 'vvip-comm-2b-' + now,
            timestamp: timeStr,
            sender: 'PILOT',
            callsign,
            frequency: '123.45 MHz',
            type: 'VVIP',
            textId: `${vvipCallsign}, copy luar biasa. ${callsign} menjaga perimeter payung udara 100% aman hingga mendarat di ${destName}.`,
            textEn: `${vvipCallsign}, excellent copy. ${callsign} maintaining 100% secure top-cover umbrella all the way to touchdown at ${destName}.`
          });
          break;

        case 3:
          // ATC Sector Handover to Approach Control for VVIP Formation
          messages.push({
            id: 'vvip-comm-3a-' + now,
            timestamp: timeStr,
            sender: 'ATC',
            callsign: 'GARUDA CONTROL',
            frequency: '128.20 MHz',
            type: 'APPROACH',
            textId: `Formasi INDONESIA-01 dan ${callsign}, Garuda Control. Anda mendekati ${distToDest} mil dari ${destIcao}. Kontak ${destName} Approach pada frekuensi 119.70 MHz.`,
            textEn: `INDONESIA-01 Flight and ${callsign}, Garuda Control. Approaching ${distToDest} miles out from ${destIcao}. Contact ${destName} Approach on 119.70 MHz.`
          });
          messages.push({
            id: 'vvip-comm-3b-' + now,
            timestamp: timeStr,
            sender: 'PILOT',
            callsign,
            frequency: '128.20 MHz',
            type: 'APPROACH',
            textId: `Garuda Control, ${callsign} copy frekuensi 119.70 MHz. Mengawal INDONESIA-01 switch frekuensi bersama. Terima kasih atas asistensi radar.`,
            textEn: `Garuda Control, ${callsign} copies frequency 119.70 MHz. Escorting INDONESIA-01 switching together. Good day.`
          });
          messages.push({
            id: 'vvip-comm-3c-' + now,
            timestamp: timeStr,
            sender: 'VVIP',
            callsign: vvipCallsign,
            frequency: '119.70 MHz',
            type: 'APPROACH',
            textId: `${destName} Approach, ini INDONESIA-01 dengan elemen pengawal tempur ${callsign}. Jelajah ${flStr}, jarak ${distToDest} mil, meminta izin inisiasi desensus.`,
            textEn: `${destName} Approach, this is INDONESIA-01 with fighter escort ${callsign}. Level ${flStr}, ${distToDest} miles out, requesting descent clearance.`
          });
          break;

        case 4:
          // Weather & Runway Status from Approach Control
          messages.push({
            id: 'vvip-comm-4a-' + now,
            timestamp: timeStr,
            sender: 'ATC',
            callsign: 'GARUDA APPROACH',
            frequency: '119.70 MHz',
            type: 'APPROACH',
            textId: `INDONESIA-01 dan ${callsign}, Garuda Approach. Selamat datang di sektor. Cuaca ${destName} CAVOK, angin 210 derajat 8 knot, QNH 1012. Prioritas pendaratan VVIP disiapkan.`,
            textEn: `INDONESIA-01 and ${callsign}, Garuda Approach. Welcome to sector. Weather at ${destName} CAVOK, wind 210 at 8 knots, QNH 1012. VVIP priority landing cleared.`
          });
          messages.push({
            id: 'vvip-comm-4b-' + now,
            timestamp: timeStr,
            sender: 'VVIP',
            callsign: vvipCallsign,
            frequency: '119.70 MHz',
            type: 'VVIP',
            textId: `Garuda Approach, Indonesia-01 copy QNH 1012. ${callsign}, kita mulai desensus bertahap menuju 4000 kaki. Jaga posisi sayap kanan.`,
            textEn: `Garuda Approach, Indonesia-01 copies QNH 1012. ${callsign}, initiating step descent to 4000 feet. Hold your starboard wing station.`
          });
          messages.push({
            id: 'vvip-comm-4c-' + now,
            timestamp: timeStr,
            sender: 'PILOT',
            callsign,
            frequency: '119.70 MHz',
            type: 'VVIP',
            textId: `${vvipCallsign}, ${callsign} mendampingi desensus 1500 kaki per menit. Formasi rapat terkunci aman.`,
            textEn: `${vvipCallsign}, ${callsign} accompanying descent at 1500 FPM. Tight escort lock maintained.`
          });
          break;

        case 5:
          // Mutual Pilot Comms - Fuel & Security Status
          messages.push({
            id: 'vvip-comm-5a-' + now,
            timestamp: timeStr,
            sender: 'PILOT',
            callsign,
            frequency: '123.45 MHz',
            type: 'VVIP',
            textId: `Indonesia-01, ini ${callsign}. Status bahan bakar kami ${Math.round(fuelRemaining)} LBS, persenjataan diset safe. Siap mengawal hingga touchdown.`,
            textEn: `Indonesia-01, this is ${callsign}. Fuel state ${Math.round(fuelRemaining)} LBS, weapons set safe. Ready to escort through final touchdown.`
          });
          messages.push({
            id: 'vvip-comm-5b-' + now,
            timestamp: timeStr,
            sender: 'VVIP',
            callsign: vvipCallsign,
            frequency: '123.45 MHz',
            type: 'VVIP',
            textId: `Copy mantap ${callsign}. Kehadiran elang tempur TNI AU memberi rasa aman penuh bagi kami. Salam hormat dari kokpit Presiden.`,
            textEn: `Solid copy ${callsign}. Having our Air Force fighter on our wing brings ultimate confidence. Sincere salutes from the Presidential cockpit.`
          });
          break;

        case 6:
        default:
          // Final Approach Runway Line-Up
          messages.push({
            id: 'vvip-comm-6a-' + now,
            timestamp: timeStr,
            sender: 'VVIP',
            callsign: vvipCallsign,
            frequency: '119.70 MHz',
            type: 'APPROACH',
            textId: `${callsign}, Indonesia-01 visual pada runway ${destIcao}. Melakukan konfigurasi gear down dan flap landing. Terima kasih atas pengawalan udara sempurna!`,
            textEn: `${callsign}, Indonesia-01 has runway visual at ${destIcao}. Configuring gear down and full flaps. Outstanding escort mission, thank you!`
          });
          messages.push({
            id: 'vvip-comm-6b-' + now,
            timestamp: timeStr,
            sender: 'PILOT',
            callsign,
            frequency: '119.70 MHz',
            type: 'APPROACH',
            textId: `Indonesia-01, ${callsign} copy visual. Memberikan top-cover overhead hingga touchdown mulus. Selamat mendarat di ${destName}!`,
            textEn: `Indonesia-01, ${callsign} copies visual. Providing overhead top-cover until smooth touchdown. Welcome to ${destName}!`
          });
          break;
      }

      return { messages, updatedState };
    }
  }

  // =========================================================================
  // 2. PASSING FL100 CLIMB MILESTONE
  // =========================================================================
  if (!updatedState.hasReportedClimb100 && currentAltitude >= 10000 && currentAltitude < 16000) {
    updatedState.hasReportedClimb100 = true;
    updatedState.lastSpokenTime = now;

    messages.push({
      id: 'climb-100-' + now,
      timestamp: timeStr,
      sender: 'PILOT',
      callsign,
      frequency: '124.50 MHz',
      type: 'ALTITUDE',
      textId: `Garuda Radar, ${callsign} melewati ${flStr}, mendaki ke jelajah ${selectedAircraft.name}. Mengikuti rute terencana.`,
      textEn: `Garuda Radar, ${callsign} passing ${flStr}, climbing to cruise altitude. Following filed flight plan.`
    });

    messages.push({
      id: 'atc-climb-100-' + now,
      timestamp: timeStr,
      sender: 'ATC',
      callsign: 'GARUDA RADAR',
      frequency: '124.50 MHz',
      type: 'ALTITUDE',
      textId: `${callsign}, Garuda Radar. Radar contact 30 mil laut, lanjutkan pendakian tanpa restriksi ke FL300. Squawk ${updatedState.squawkCode} ident.`,
      textEn: `${callsign}, Garuda Radar. Radar contact 30 miles out, continue unrestricted climb to FL300. Squawk ${updatedState.squawkCode} ident.`
    });
    return { messages, updatedState };
  }

  // =========================================================================
  // 3. REACHED LEVEL CRUISE FL280+
  // =========================================================================
  if (!updatedState.hasReportedLevelOff && currentAltitude >= 26000) {
    updatedState.hasReportedLevelOff = true;
    updatedState.lastSpokenTime = now;

    messages.push({
      id: 'level-off-' + now,
      timestamp: timeStr,
      sender: 'PILOT',
      callsign,
      frequency: '128.20 MHz',
      type: 'ALTITUDE',
      textId: `Garuda Control, ${callsign} level pada ${flStr}, kecepatan ${curSpeed} knot IAS. Sisa bahan bakar ${Math.round(fuelRemaining)} LBS, sistem operasi nominal.`,
      textEn: `Garuda Control, ${callsign} level at ${flStr}, airspeed ${curSpeed} knots. Fuel state ${Math.round(fuelRemaining)} LBS, all systems nominal.`
    });

    messages.push({
      id: 'atc-level-off-' + now,
      timestamp: timeStr,
      sender: 'ATC',
      callsign: 'GARUDA CONTROL',
      frequency: '128.20 MHz',
      type: 'ALTITUDE',
      textId: `${callsign}, Garuda Control diterima. Pertahankan ${flStr}, tekanan standar 1013 hPa. Lapor saat melintasi waypoint selanjutnya.`,
      textEn: `${callsign}, Garuda Control roger. Maintain ${flStr}, standard 1013 hPa. Report next waypoint.`
    });
    return { messages, updatedState };
  }

  // =========================================================================
  // 4. VVIP ESCORT INTERCEPT & RENDEZVOUS CALLS (PRE-RENDEZVOUS)
  // =========================================================================
  if (missionType === 'VVIPEscort' && vvipPos && escortStage === 'pre_rendezvous') {
    const distToVvip = getDistance(currentPos.lat, currentPos.lng, vvipPos.lat, vvipPos.lng);
    const brngToVvip = Math.round(getBearing(currentPos.lat, currentPos.lng, vvipPos.lat, vvipPos.lng));
    const distToRV = rendezvousPoint ? getDistance(currentPos.lat, currentPos.lng, rendezvousPoint.lat, rendezvousPoint.lng) : 999;
    const vvipDistToRV = rendezvousPoint ? getDistance(vvipPos.lat, vvipPos.lng, rendezvousPoint.lat, rendezvousPoint.lng) : 999;

    // A. Player arrived at RV first and is in holding orbit waiting for VVIP
    if (distToRV <= 2.0 && vvipDistToRV > 4.0 && !updatedState.playerHoldingSpoken) {
      updatedState.playerHoldingSpoken = true;
      updatedState.lastSpokenTime = now;

      messages.push({
        id: 'player-orbit-rv-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '128.20 MHz',
        type: 'VVIP',
        textId: `Garuda Radar & Matadora, ${callsign} telah tiba di titik RV. Melakukan putaran holding orbit di FL300 menantikan kedatangan INDONESIA-01.`,
        textEn: `Garuda Radar & Matadora, ${callsign} is on-station at RV point. Entering tactical holding orbit at FL300 awaiting INDONESIA-01.`
      });

      messages.push({
        id: 'awacs-orbit-ack-' + now,
        timestamp: timeStr,
        sender: 'AWACS',
        callsign: 'MATADORA AWACS',
        frequency: '243.00 UHF',
        type: 'VVIP',
        textId: `${callsign}, Matadora AWACS copy. INDONESIA-01 berada pada jarak ${vvipDistToRV.toFixed(0)} mil dari RV, kecepatan 440 knot. Pertahankan holding orbit.`,
        textEn: `${callsign}, Matadora AWACS copy. INDONESIA-01 is ${vvipDistToRV.toFixed(0)} NM from RV, speed 440 kts. Maintain holding orbit.`
      });
      return { messages, updatedState };
    }

    // B. VVIP arrived at RV first and is in holding orbit waiting for Player
    if (vvipDistToRV <= 2.0 && distToRV > 4.0 && !updatedState.vvipHoldingSpoken) {
      updatedState.vvipHoldingSpoken = true;
      updatedState.lastSpokenTime = now;

      messages.push({
        id: 'vvip-orbit-rv-' + now,
        timestamp: timeStr,
        sender: 'VVIP',
        callsign: 'INDONESIA-01',
        frequency: '123.45 MHz',
        type: 'VVIP',
        textId: `Garuda Radar, INDONESIA-01 on-station di titik RV. Memasuki holding orbit menantikan kedatangan pesawat pengawal ${callsign}.`,
        textEn: `Garuda Radar, INDONESIA-01 on-station at RV point. Entering holding orbit awaiting escort flight ${callsign}.`
      });

      messages.push({
        id: 'pilot-orbit-reply-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '123.45 MHz',
        type: 'VVIP',
        textId: `INDONESIA-01, ini ${callsign}. Kami sedang inbound ke titik RV jarak ${distToRV.toFixed(0)} mil, kecepatan maksimum. Bersiap bergabung formasi!`,
        textEn: `INDONESIA-01, this is ${callsign}. We are inbound to RV distance ${distToRV.toFixed(0)} NM, max speed. Ready to join formation!`
      });
      return { messages, updatedState };
    }

    if (distToVvip <= 25 && distToVvip > 8 && (now - updatedState.lastVvipDistanceCallTime) > 24000) {
      updatedState.lastVvipDistanceCallTime = now;
      updatedState.lastSpokenTime = now;

      messages.push({
        id: 'vvip-radar-call-' + now,
        timestamp: timeStr,
        sender: 'AWACS',
        callsign: 'MATADORA AWACS',
        frequency: '243.00 UHF',
        type: 'VVIP',
        textId: `${callsign}, Matadora AWACS. Radar lock pada formasi VVIP ${vvipTargetAircraft.name}, BRAA ${brngToVvip.toString().padStart(3, '0')} derajat, ${distToVvip.toFixed(0)} mil, Angels 30. Titik RV bersiap.`,
        textEn: `${callsign}, Matadora AWACS. Radar lock on VVIP ${vvipTargetAircraft.name}, BRAA ${brngToVvip.toString().padStart(3, '0')} degrees, ${distToVvip.toFixed(0)} NM, Angels 30. RV point ready.`
      });

      messages.push({
        id: 'pilot-tally-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '243.00 UHF',
        type: 'VVIP',
        textId: `Matadora, ${callsign} copy. Radar intercept terkunci, merapatkan jarak menuju titik Rendezvous (RV) untuk bergabung formasi.`,
        textEn: `Matadora, ${callsign} copies. Radar intercept locked, closing distance to Rendezvous (RV) vector to join escort.`
      });

      messages.push({
        id: 'vvip-rv-eta-' + now,
        timestamp: timeStr,
        sender: 'VVIP',
        callsign: 'INDONESIA-01',
        frequency: '123.45 MHz',
        type: 'VVIP',
        textId: `${callsign}, Indonesia-01. Kami on-course menuju titik RV, mempertahankan kecepatan jelajah 440 knot. Siap bergabung formasi sayap.`,
        textEn: `${callsign}, Indonesia-01. We are on-course to RV point cruising 440 knots. Ready to join wing formation.`
      });
      return { messages, updatedState };
    }

    if (distToVvip <= 6 && !updatedState.escortJoinedSpoken) {
      updatedState.escortJoinedSpoken = true;
      updatedState.lastSpokenTime = now;

      messages.push({
        id: 'vvip-visual-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '123.45 MHz',
        type: 'VVIP',
        textId: `INDONESIA-01, ini ${callsign}. TALLY-HO VISUAL! Bergabung pada sektor sayap kanan. Formasi pengawalan taktikal dikunci (ESCORT ACTIVE). Bersama menuju destinasi!`,
        textEn: `INDONESIA-01, this is ${callsign}. TALLY VISUAL! Joining starboard wing. Tactical formation locked (ESCORT ACTIVE). Enroute together to destination!`
      });

      messages.push({
        id: 'vvip-reply-' + now,
        timestamp: timeStr,
        sender: 'VVIP',
        callsign: 'INDONESIA-01',
        frequency: '123.45 MHz',
        type: 'VVIP',
        textId: `${callsign}, Indonesia-01 membaca kuat dan jelas. Visual kontak pada sayap pengawal. Formasi ber-iringan dikunci menuju pangkalan tujuan.`,
        textEn: `${callsign}, Indonesia-01 reads loud and clear. Visual contact on escort wing. Joint formation locked towards destination base.`
      });

      messages.push({
        id: 'atc-escort-active-' + now,
        timestamp: timeStr,
        sender: 'ATC',
        callsign: 'GARUDA RADAR',
        frequency: '128.20 MHz',
        type: 'VVIP',
        textId: `Formasi INDONESIA-01 dan ${callsign}, Garuda Radar. Status ESCORT ACTIVE terkonfirmasi pada sistem ATC. Koridor udara aman menuju destinasi.`,
        textEn: `INDONESIA-01 Flight and ${callsign}, Garuda Radar. ESCORT ACTIVE confirmed on ATC radar. Secure air corridor cleared to destination.`
      });
      return { messages, updatedState };
    }
  }

  // =========================================================================
  // 4B. VVIP ESCORT SEPARATION / DESTINATION LANDING CALLS
  // =========================================================================
  if (missionType === 'VVIPEscort' && escortStage === 'vvip_landed' && !updatedState.playerProceedArrivalSpoken) {
    updatedState.playerProceedArrivalSpoken = true;
    updatedState.lastSpokenTime = now;

    const vvipDestName = vvipEndPoint?.name || 'Destinasi';
    const playerArrName = arrivalAirport?.name || 'Homebase';

    messages.push({
      id: 'vvip-landed-thanks-' + now,
      timestamp: timeStr,
      sender: 'VVIP',
      callsign: 'INDONESIA-01',
      frequency: '123.45 MHz',
      type: 'VVIP',
      textId: `Garuda Radar & ${callsign}, INDONESIA-01 telah touchdown dan parkir dengan aman di ${vvipDestName}. Pengawalan udara luar biasa dan sangat profesional! Terima kasih banyak Garuda Escort!`,
      textEn: `Garuda Radar & ${callsign}, INDONESIA-01 has safely touched down and parked at ${vvipDestName}. Outstanding and professional escort! Thank you Garuda Escort!`
    });

    messages.push({
      id: 'atc-proceed-arrival-' + now,
      timestamp: timeStr,
      sender: 'ATC',
      callsign: 'GARUDA RADAR',
      frequency: '128.20 MHz',
      type: 'VVIP',
      textId: `${callsign}, Garuda Radar. Pengawalan VVIP tuntas dengan nilai sempurna. Anda diizinkan melanjutkan rute navigasi mandiri menuju pangkalan kedatangan Anda di ${playerArrName}.`,
      textEn: `${callsign}, Garuda Radar. VVIP escort complete with distinction. Cleared for direct navigation to your destination airbase at ${playerArrName}.`
    });

    messages.push({
      id: 'pilot-ack-proceed-' + now,
      timestamp: timeStr,
      sender: 'PILOT',
      callsign,
      frequency: '128.20 MHz',
      type: 'VVIP',
      textId: `Garuda Radar, ${callsign} copy. Selamat kepada INDONESIA-01. Mengatur waypoint selanjutnya menuju ${playerArrName}, kecepatan dan ketinggian jelajah dipertahankan.`,
      textEn: `Garuda Radar, ${callsign} copies. Congratulations to INDONESIA-01. Routing to next waypoint ${playerArrName}, maintaining cruise altitude and speed.`
    });
    return { messages, updatedState };
  }

  // =========================================================================
  // 5. TRAFFIC PROXIMITY ADVISORY
  // =========================================================================
  if (otherTraffic.length > 0 && (now - updatedState.lastTrafficAdvisoryTime) > 35000) {
    const nearby = otherTraffic.find(t => getDistance(currentPos.lat, currentPos.lng, t.lat, t.lng) < 28);
    if (nearby) {
      const dist = getDistance(currentPos.lat, currentPos.lng, nearby.lat, nearby.lng);
      const brng = Math.round(getBearing(currentPos.lat, currentPos.lng, nearby.lat, nearby.lng));
      let clockOClock = Math.round(((brng - curHeading + 360) % 360) / 30);
      if (clockOClock === 0) clockOClock = 12;

      updatedState.lastTrafficAdvisoryTime = now;
      updatedState.lastSpokenTime = now;

      messages.push({
        id: 'traffic-adv-' + now,
        timestamp: timeStr,
        sender: 'ATC',
        callsign: 'GARUDA RADAR',
        frequency: '124.50 MHz',
        type: 'ALERT',
        textId: `TRAFFIC ADVISORY: ${callsign}, lalu lintas udara arah jam ${clockOClock}, jarak ${dist.toFixed(0)} mil, ${nearby.callsign}, FL${Math.round(nearby.altitude / 100)}. Laporkan jika visual kontak.`,
        textEn: `TRAFFIC ADVISORY: ${callsign}, traffic ${clockOClock} o'clock, ${dist.toFixed(0)} miles, ${nearby.callsign}, FL${Math.round(nearby.altitude / 100)}. Report in sight.`
      });

      messages.push({
        id: 'pilot-traffic-ack-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '124.50 MHz',
        type: 'ALERT',
        textId: `Garuda Radar, ${callsign} memindai TCAS/Radar. Visual dicari, menjaga separasi aman taktikal.`,
        textEn: `Garuda Radar, ${callsign} scanning TCAS/Radar. Looking for traffic, maintaining safe separation.`
      });
      return { messages, updatedState };
    }
  }

  // =========================================================================
  // 6. VARIED DYNAMIC TWO-WAY ATC & TACTICAL FLIGHT COMMS (Every 24-30s)
  // =========================================================================
  if (timeSinceLastSpoken > 24) {
    updatedState.lastSpokenTime = now;
    updatedState.cycleIndex = (updatedState.cycleIndex + 1) % 6;
    const cycle = updatedState.cycleIndex;

    // VARIATION A: Weather & Cumulonimbus (CB) Deviation Request
    if (cycle === 1 && (now - updatedState.lastWeatherEventTime) > 45000) {
      updatedState.lastWeatherEventTime = now;
      messages.push({
        id: 'weather-dev-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '128.20 MHz',
        type: 'WEATHER',
        textId: `Garuda Control, ${callsign}. Radar onboard mendeteksi sel awan Cumulonimbus (CB) pekat 20 mil di depan. Meminta deviasi 15 derajat ke kanan untuk menghindari turbulensi.`,
        textEn: `Garuda Control, ${callsign}. Onboard radar detects active CB cell 20 miles ahead. Requesting 15 degrees right deviation for weather avoidance.`
      });

      messages.push({
        id: 'atc-weather-dev-' + now,
        timestamp: timeStr,
        sender: 'ATC',
        callsign: 'GARUDA CONTROL',
        frequency: '128.20 MHz',
        type: 'WEATHER',
        textId: `${callsign}, Garuda Control. Diijinkan deviasi hingga 20 derajat ke kanan dari rute. Laporkan kembali ketika sudah clear dari sel cuaca buruk.`,
        textEn: `${callsign}, Garuda Control. Right deviation up to 20 degrees approved. Report when clear of weather cell.`
      });
      return { messages, updatedState };
    }

    // VARIATION B: Altitude Clearance & Step Climb Request
    if (cycle === 2 && (now - updatedState.lastAltitudeChangeTime) > 45000) {
      updatedState.lastAltitudeChangeTime = now;
      const targetFl = currentAltitude < 30000 ? 'FL340' : 'FL280';
      messages.push({
        id: 'alt-req-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '128.20 MHz',
        type: 'ALTITUDE',
        textId: `Garuda Control, ${callsign}. Meminta izin perubahan ketinggian ke ${targetFl} untuk efisiensi konsumsi bahan bakar dan menghindari angin sakal (headwind).`,
        textEn: `Garuda Control, ${callsign}. Requesting step change to ${targetFl} for optimal fuel burn and headwind avoidance.`
      });

      messages.push({
        id: 'atc-alt-cleared-' + now,
        timestamp: timeStr,
        sender: 'ATC',
        callsign: 'GARUDA CONTROL',
        frequency: '128.20 MHz',
        type: 'ALTITUDE',
        textId: `${callsign}, Garuda Control. Diijinkan naik dan pertahankan ${targetFl}. Tidak ada konflik lalu lintas udara pada level tersebut.`,
        textEn: `${callsign}, Garuda Control. Cleared to climb and maintain ${targetFl}. Sector clear of conflicting traffic.`
      });
      return { messages, updatedState };
    }

    // VARIATION C: Heading Vectoring & Wind Drift Correction
    if (cycle === 3 && (now - updatedState.lastHeadingInstructionTime) > 45000) {
      updatedState.lastHeadingInstructionTime = now;
      const adjustHeading = ((curHeading + 10) % 360).toString().padStart(3, '0');
      messages.push({
        id: 'hdg-vector-' + now,
        timestamp: timeStr,
        sender: 'ATC',
        callsign: 'GARUDA CONTROL',
        frequency: '128.20 MHz',
        type: 'HEADING',
        textId: `${callsign}, Garuda Control. Untuk optimasi koridor penerbangan, terbang haluan ${adjustHeading} derajat. Angin lapisan atas 240 derajat pada 35 knot.`,
        textEn: `${callsign}, Garuda Control. For flight corridor spacing, fly heading ${adjustHeading} degrees. Upper winds 240 degrees at 35 knots.`
      });

      messages.push({
        id: 'pilot-hdg-ack-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '128.20 MHz',
        type: 'HEADING',
        textId: `Garuda Control, ${callsign} copy haluan ${adjustHeading} derajat. Mengoreksi drift angin lintang, haluan diset.`,
        textEn: `Garuda Control, ${callsign} copies heading ${adjustHeading} degrees. Correcting crosswind drift, heading set.`
      });
      return { messages, updatedState };
    }

    // VARIATION D: Terrain & Obstacle Advisory over Maritime / Mountains
    if (cycle === 4 && (now - updatedState.lastTerrainWarningTime) > 45000) {
      updatedState.lastTerrainWarningTime = now;
      const terrainType = Math.abs(currentPos.lat) > 5 ? 'pegunungan terjal' : 'perairan kepulauan maritim nusantara';
      const terrainTypeEn = Math.abs(currentPos.lat) > 5 ? 'mountainous terrain' : 'archipelagic maritime sector';
      messages.push({
        id: 'terrain-adv-' + now,
        timestamp: timeStr,
        sender: 'ATC',
        callsign: 'GARUDA CONTROL',
        frequency: '128.20 MHz',
        type: 'TERRAIN',
        textId: `TERRAIN CHECK: ${callsign}, melintasi sektor ${terrainType}. Minimum Safe Altitude pada ${flStr}. QNH 1013 nominal.`,
        textEn: `TERRAIN CHECK: ${callsign}, crossing ${terrainTypeEn}. Minimum Safe Altitude cleared at ${flStr}. QNH 1013 nominal.`
      });

      messages.push({
        id: 'pilot-terrain-ack-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '128.20 MHz',
        type: 'TERRAIN',
        textId: `Garuda Control, ${callsign} monitor elevasi medan dan radar altimeter. Navigasi GPS/INS akurat dan aman.`,
        textEn: `Garuda Control, ${callsign} monitoring terrain clearance and radar altimeter. GPS/INS navigation accurate and secure.`
      });
      return { messages, updatedState };
    }

    // VARIATION E: Mission-Specific Tactical Report (Combat / Patrol / General)
    if (cycle === 5 && (now - updatedState.lastMissionCheckTime) > 35000) {
      updatedState.lastMissionCheckTime = now;

      if (missionType === 'Combat' || missionType === 'Patrol') {
        messages.push({
          id: 'combat-patrol-' + now,
          timestamp: timeStr,
          sender: 'PILOT',
          callsign,
          frequency: '243.00 UHF',
          type: 'ENROUTE',
          textId: `Komando Sektor, ${callsign} on-station CAP (Combat Air Patrol). Pemindaian radar AESA 120 NM aktif, IFF Mode 4 aman. Tidak terdeteksi target asing tak teridentifikasi.`,
          textEn: `Sector Command, ${callsign} on-station CAP. AESA radar 120 NM sweep active, IFF Mode 4 secure. No unidentified bogeys detected.`
        });
        messages.push({
          id: 'atc-combat-ack-' + now,
          timestamp: timeStr,
          sender: 'AWACS',
          callsign: 'MATADORA AWACS',
          frequency: '243.00 UHF',
          type: 'ENROUTE',
          textId: `${callsign}, Matadora AWACS terima. Wilayah udara kedaulatan sektor ini aman. Pertahankan pola patroli CAP.`,
          textEn: `${callsign}, Matadora AWACS roger. Sovereign airspace sector clean. Maintain CAP sweep pattern.`
        });
      } else {
        // Standard ICAO Position Report with ETA & Fuel State
        const estMin = nextWp ? Math.max(1, Math.round((getDistance(currentPos.lat, currentPos.lng, nextWp.lat, nextWp.lng) / curSpeed) * 60)) : 5;
        messages.push({
          id: 'pos-report-' + now,
          timestamp: timeStr,
          sender: 'PILOT',
          callsign,
          frequency: '128.20 MHz',
          type: 'ENROUTE',
          textId: `Garuda Control, ${callsign} laporan posisi: Jelajah ${flStr}, kecepatan ${curSpeed} knot, estimasi ${nextWp?.name || 'titik lapor'} dalam ${estMin} menit. Sisa bahan bakar ${Math.round(fuelRemaining)} LBS.`,
          textEn: `Garuda Control, ${callsign} position report: Cruising ${flStr}, speed ${curSpeed} knots, estimating ${nextWp?.name || 'waypoint'} in ${estMin} minutes. Fuel on board ${Math.round(fuelRemaining)} LBS.`
        });
        messages.push({
          id: 'atc-pos-ack-' + now,
          timestamp: timeStr,
          sender: 'ATC',
          callsign: 'GARUDA CONTROL',
          frequency: '128.20 MHz',
          type: 'ENROUTE',
          textId: `${callsign}, Garuda Control menerima laporan. Radar identifikasi aktif, lanjutkan sesuai otorisasi.`,
          textEn: `${callsign}, Garuda Control acknowledges report. Radar identification active, continue as cleared.`
        });
      }
      return { messages, updatedState };
    }
  }

  return { messages, updatedState };
}

/**
 * Generates rich, high-intensity periodic radio chatter during Reconnaissance ISR missions
 * between the Recon aircraft, Control Tower, and Player strike aircraft.
 */
export function generatePeriodicReconComms(
  currentTimeSec: number,
  state: CommsState,
  params: {
    callsign: string;
    language: 'id' | 'en';
    reconState: ReconState | null;
    selectedRecon: ReconAircraft | null;
    reconDeparture: MilitaryAirport | null;
    reconArrival: MilitaryAirport | null;
    isTargetLocked?: boolean;
    isStrikeCompleted?: boolean;
  }
): { messages: CommsMessage[]; updatedState: CommsState } {
  const messages: CommsMessage[] = [];
  const updatedState = { ...state };
  const {
    callsign,
    language,
    reconState,
    selectedRecon,
    reconDeparture,
    reconArrival,
    isTargetLocked,
    isStrikeCompleted
  } = params;

  if (!reconState || !selectedRecon) return { messages, updatedState };

  const now = Date.now();
  const timeSinceLastSpoken = (now - updatedState.lastSpokenTime) / 1000;
  const timeSinceLastReconDialogue = (now - updatedState.lastReconDialogueTime) / 1000;

  const timeStr = new Date().toTimeString().substring(0, 5) + 'Z';
  const reconCallsign = selectedRecon.name.toUpperCase().includes('ANKA')
    ? 'ANKA-ISR 01'
    : selectedRecon.name.toUpperCase().includes('CH-4B')
    ? 'RAINBOW 51'
    : selectedRecon.name.toUpperCase().includes('POSEIDON')
    ? 'POSEIDON 08'
    : selectedRecon.name.toUpperCase().includes('SURVEILLER') || selectedRecon.name.toUpperCase().includes('CN-235')
    ? 'SURVEILLER 02'
    : selectedRecon.name.toUpperCase().includes('TRITON')
    ? 'TRITON GLOBAL'
    : `${selectedRecon.name.toUpperCase()} INTEL`;

  const depName = reconDeparture?.name || 'Pangkalan Utama';
  const depIcao = reconDeparture?.icao || 'WIHH';
  const arrName = reconArrival?.name || depName;
  const arrIcao = reconArrival?.icao || depIcao;

  const currentAlt = reconState.reconFlight?.altitude || selectedRecon.operatingAlt;
  const flStr = `FL${Math.round(currentAlt / 100).toString().padStart(3, '0')}`;
  const curPos = reconState.reconFlight?.pos;
  const posLatStr = curPos ? curPos.lat.toFixed(3) : '0.000';
  const posLngStr = curPos ? curPos.lng.toFixed(3) : '0.000';

  // 1. TARGET DETECTED / INTEL ACQUIRED (Trigger ONLY ONCE per newly acquired target)
  const activeTargets = reconState.detectedTargets || [];
  const latestTarget = activeTargets[activeTargets.length - 1];

  if (latestTarget && updatedState.lastReportedTargetId !== latestTarget.id && timeSinceLastSpoken >= 2) {
    updatedState.lastReportedTargetId = latestTarget.id;
    updatedState.lastSpokenTime = now;
    updatedState.lastReconDialogueTime = now;

    messages.push({
      id: 'recon-intel-1-' + now,
      timestamp: timeStr,
      sender: 'RECON',
      callsign: reconCallsign,
      frequency: '123.45 MHz',
      type: 'RECON',
      textId: `TACTICAL ALERT! ${reconCallsign} mendeteksi sasaran baru: [${latestTarget.name}] di koordinat ${latestTarget.lat.toFixed(3)}°, ${latestTarget.lng.toFixed(3)}°. Mengirimkan telemetri Link-16 ke ${callsign}!`,
      textEn: `TACTICAL ALERT! ${reconCallsign} acquired new contact: [${latestTarget.name}] at coords ${latestTarget.lat.toFixed(3)}°, ${latestTarget.lng.toFixed(3)}°. Broadcasting Link-16 telemetry to ${callsign}!`
    });
    messages.push({
      id: 'recon-intel-2-' + now,
      timestamp: timeStr,
      sender: 'TOWER',
      callsign: `GARUDA SEKTOR`,
      frequency: '128.20 MHz',
      type: 'RECON',
      textId: `${reconCallsign} dan ${callsign}, Garuda Sektor menerima data intel sasaran. Status SIAGA-1 diaktifkan. Otorisasi scramble tempur diberikan.`,
      textEn: `${reconCallsign} and ${callsign}, Garuda Sector received target intel packet. DEFCON-1 activated. Strike scramble authorized.`
    });
    return { messages, updatedState };
  }

  // 2. STRIKE ENGAGEMENT / TARGET LOCKED ACTIVE (Trigger ONLY ONCE per lock event)
  if (isTargetLocked && !isStrikeCompleted) {
    if (!updatedState.hasReportedTargetLock && (now - updatedState.lastTargetLockReportTime) > 20000) {
      updatedState.hasReportedTargetLock = true;
      updatedState.lastTargetLockReportTime = now;
      updatedState.lastSpokenTime = now;
      updatedState.lastReconDialogueTime = now;

      messages.push({
        id: 'recon-lock-1-' + now,
        timestamp: timeStr,
        sender: 'RECON',
        callsign: reconCallsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `${callsign}, ${reconCallsign}! Laser designation spot 1688 terkunci stabil di koordinat sasaran. Sektor aman, otorisasi penembakan penuh (Weapons Free)!`,
        textEn: `${callsign}, ${reconCallsign}! Laser designation code 1688 locked on target. Corridor clean, weapons free authorized!`
      });
      messages.push({
        id: 'recon-lock-2-' + now,
        timestamp: timeStr,
        sender: 'TOWER',
        callsign: `${depIcao} TOWER`,
        frequency: '128.20 MHz',
        type: 'RECON',
        textId: `Semua stasiun, ${depIcao} Tower. Koridor tembak tempur steril di FL${Math.round(currentAlt / 100)}. ${callsign} diizinkan melepaskan munisi presisi.`,
        textEn: `All stations, ${depIcao} Tower. Strike box sanitized at FL${Math.round(currentAlt / 100)}. ${callsign} cleared to release precision ordnance.`
      });
      return { messages, updatedState };
    }
  } else if (!isTargetLocked) {
    updatedState.hasReportedTargetLock = false;
  }

  // Pacing for remaining periodic chatter: spaced by at least 18-24 seconds
  if (timeSinceLastReconDialogue < 18 || timeSinceLastSpoken < 8) {
    return { messages, updatedState };
  }

  // 3. STRIKE IN PROGRESS / ENROUTE TO TARGET (Varied dynamic callouts)
  if (reconState.phase === 'strike_enroute') {
    const uneliminatedTarget = activeTargets.find(t => !t.isEliminated) || activeTargets[0];
    const tLat = uneliminatedTarget ? uneliminatedTarget.lat.toFixed(3) : posLatStr;
    const tLng = uneliminatedTarget ? uneliminatedTarget.lng.toFixed(3) : posLngStr;
    const tName = uneliminatedTarget ? uneliminatedTarget.name : 'SASARAN INTEL';

    const strikeIdx = updatedState.strikeEnrouteDialogueIndex % 3;
    updatedState.strikeEnrouteDialogueIndex += 1;
    updatedState.lastStrikeEnrouteDialogueTime = now;
    updatedState.lastReconDialogueTime = now;
    updatedState.lastSpokenTime = now;

    switch (strikeIdx) {
      case 0:
        messages.push({
          id: 'recon-strike-1-' + now,
          timestamp: timeStr,
          sender: 'RECON',
          callsign: reconCallsign,
          frequency: '123.45 MHz',
          type: 'RECON',
          textId: `${callsign}, ${reconCallsign}. Pod elektro-optik mengunci sasaran [${tName}] di ${tLat}°, ${tLng}°. Pertahankan penetrasi koridor serangan.`,
          textEn: `${callsign}, ${reconCallsign}. Electro-optical pod slaved to [${tName}] at ${tLat}°, ${tLng}°. Maintain ingress vector.`
        });
        messages.push({
          id: 'recon-strike-2-' + now,
          timestamp: timeStr,
          sender: 'PILOT',
          callsign,
          frequency: '123.45 MHz',
          type: 'RECON',
          textId: `${reconCallsign}, ${callsign} copy! Kecepatan tempur stabil, komputer balistik senjata online dan memindai sasaran.`,
          textEn: `${reconCallsign}, ${callsign} copies! Combat speed steady, weapons fire-control online and acquiring target.`
        });
        break;

      case 1:
        messages.push({
          id: 'recon-strike-3-' + now,
          timestamp: timeStr,
          sender: 'RECON',
          callsign: reconCallsign,
          frequency: '123.45 MHz',
          type: 'RECON',
          textId: `Garuda Sektor, ${reconCallsign}. Laser rangefinder mengonfirmasi jarak elevasi sasaran optimal. Angin permukaan 090/08kt, kondisi balistik prima.`,
          textEn: `Garuda Sector, ${reconCallsign}. Laser rangefinder confirms optimal target altitude slant. Surface winds 090/08kt, ballistic profile pristine.`
        });
        messages.push({
          id: 'recon-strike-4-' + now,
          timestamp: timeStr,
          sender: 'TOWER',
          callsign: `GARUDA COMMAND`,
          frequency: '128.20 MHz',
          type: 'RECON',
          textId: `${callsign}, Garuda Command. Koridor serangan bebas hambatan. Selesaikan sasaran dengan presisi tinggi.`,
          textEn: `${callsign}, Garuda Command. Strike corridor cleared. Neutralize target with surgical precision.`
        });
        break;

      case 2:
      default:
        messages.push({
          id: 'recon-strike-5-' + now,
          timestamp: timeStr,
          sender: 'PILOT',
          callsign,
          frequency: '123.45 MHz',
          type: 'RECON',
          textId: `${reconCallsign}, ${callsign} mendekati zona tembak efektif. Master Arm ON, sensor rudal siap melakukan lock-on otomatis!`,
          textEn: `${reconCallsign}, ${callsign} inbound to terminal engagement zone. Master Arm ON, seeker slaved for lock-on!`
        });
        messages.push({
          id: 'recon-strike-6-' + now,
          timestamp: timeStr,
          sender: 'RECON',
          callsign: reconCallsign,
          frequency: '123.45 MHz',
          type: 'RECON',
          textId: `${callsign}, ${reconCallsign} memandu laser paint. Siap konfirmasi dampak kehancuran (BDA) pasca tembakan!`,
          textEn: `${callsign}, ${reconCallsign} painting laser spot. Standing by for immediate Bomb Damage Assessment (BDA)!`
        });
        break;
    }

    return { messages, updatedState };
  }

  // 4. ROUTINE ENROUTE ISR SURVEY CHATTER (Smooth rotation across 6 scenarios)
  const idx = updatedState.reconDialogueIndex % 6;
  updatedState.reconDialogueIndex += 1;
  updatedState.lastReconDialogueTime = now;
  updatedState.lastSpokenTime = now;

  switch (idx) {
    case 0:
      // FLIR & Multispectral Sensor Sweep
      messages.push({
        id: 'recon-dial-0a-' + now,
        timestamp: timeStr,
        sender: 'RECON',
        callsign: reconCallsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `Garuda Sektor dan ${callsign}, ${reconCallsign}. Membuka sapuan sensor FLIR optik termal dan radar aperture sintetis (SAR) di ${flStr}. Pemindaian sektor berjalan 100% nominal.`,
        textEn: `Garuda Sector and ${callsign}, ${reconCallsign}. Active sweep with optical FLIR thermal sensor and Synthetic Aperture Radar (SAR) at ${flStr}. Sector scan proceeding 100% nominal.`
      });
      messages.push({
        id: 'recon-dial-0b-' + now,
        timestamp: timeStr,
        sender: 'TOWER',
        callsign: `${depIcao} CONTROL`,
        frequency: '128.20 MHz',
        type: 'RECON',
        textId: `${reconCallsign}, ${depIcao} Control copy. Transponder ${updatedState.squawkCode} terbaca kuat. Koridor survei perbatasan bersih dari lalu lintas sipil.`,
        textEn: `${reconCallsign}, ${depIcao} Control copies. Squawk ${updatedState.squawkCode} loud and clear. Border reconnaissance corridor clear of civilian traffic.`
      });
      break;

    case 1:
      // Real-time Coordinate Telemetry & Datalink Handshake
      messages.push({
        id: 'recon-dial-1a-' + now,
        timestamp: timeStr,
        sender: 'RECON',
        callsign: reconCallsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `${callsign}, ini ${reconCallsign}. Tautan datalink taktis terhubung pada frekuensi aman. Posisi intai saat ini ${posLatStr} Lintang, ${posLngStr} Bujur, ketinggian ${flStr}.`,
        textEn: `${callsign}, this is ${reconCallsign}. Tactical datalink handshake verified on secure frequency. Current recon position ${posLatStr} Lat, ${posLngStr} Lng, level ${flStr}.`
      });
      messages.push({
        id: 'recon-dial-1b-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `${reconCallsign}, ${callsign} membaca 5 per 5. Telemetri taktis masuk di MFD kokpit. Paket jet tempur siap siaga di runway.`,
        textEn: `${reconCallsign}, ${callsign} reads 5 by 5. Telemetry feed streaming to cockpit MFD. Fighter strike package holding ready alert.`
      });
      break;

    case 2:
      // Weather, Thermal Signature & Wind Gradient
      messages.push({
        id: 'recon-dial-2a-' + now,
        timestamp: timeStr,
        sender: 'RECON',
        callsign: reconCallsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `Garuda Tower, ${reconCallsign}. Evaluasi cuaca sektor: Visibilitas lebih dari 20 mil laut, angin tenang 090/12kt di ${flStr}. Kondisi sangat ideal untuk identifikasi target optik.`,
        textEn: `Garuda Tower, ${reconCallsign}. Sector meteorological assessment: Visibility 20+ NM, wind 090/12kt at ${flStr}. Ideal conditions for electro-optical target identification.`
      });
      messages.push({
        id: 'recon-dial-2b-' + now,
        timestamp: timeStr,
        sender: 'TOWER',
        callsign: `MATARAM RADAR`,
        frequency: '128.20 MHz',
        type: 'RECON',
        textId: `${reconCallsign}, Mataram Radar menerima. Laporan cuaca diteruskan ke Skadron Tempur. Lanjutkan lintasan survei berikutnya.`,
        textEn: `${reconCallsign}, Mataram Radar copies. Weather report relayed to Fighter Squadron. Continue next survey track.`
      });
      break;

    case 3:
      // Electronic Intelligence & Frequency Scan
      messages.push({
        id: 'recon-dial-3a-' + now,
        timestamp: timeStr,
        sender: 'RECON',
        callsign: reconCallsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `${callsign} dan Garuda Command, ${reconCallsign}. Spektrum ELINT memindai frekuensi radio dan radar darat. Menyaring anomali emisi elektromagnetik di sektor sasaran.`,
        textEn: `${callsign} and Garuda Command, ${reconCallsign}. ELINT suite sweeping radio frequencies and ground radar. Filtering electromagnetic emission anomalies in target sector.`
      });
      messages.push({
        id: 'recon-dial-3b-' + now,
        timestamp: timeStr,
        sender: 'TOWER',
        callsign: `GARUDA SEKTOR`,
        frequency: '128.20 MHz',
        type: 'RECON',
        textId: `${reconCallsign}, Garuda Sektor mencatat. Tetap berada di dalam batas koridor kedaulatan NKRI. Beri tanda darurat jika terdeteksi emisi rudal permukaan (SAM).`,
        textEn: `${reconCallsign}, Garuda Sector notes. Remain inside sovereign territorial boundary. Alert immediately if SAM surface-to-air emissions detected.`
      });
      break;

    case 4:
      // Survey Point Turn & Endurance Status
      messages.push({
        id: 'recon-dial-4a-' + now,
        timestamp: timeStr,
        sender: 'RECON',
        callsign: reconCallsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `Garuda Tower, ${reconCallsign}. Berbelok menuju titik survei intelijen berikutnya. Bahan bakar internal sisa 82%, daya tahan terbang (endurance) aman untuk 4 jam patroli.`,
        textEn: `Garuda Tower, ${reconCallsign}. Turning onto next intelligence survey waypoint. Internal fuel 82%, flight endurance green for 4 more hours on station.`
      });
      messages.push({
        id: 'recon-dial-4b-' + now,
        timestamp: timeStr,
        sender: 'TOWER',
        callsign: `${arrIcao} TOWER`,
        frequency: '128.20 MHz',
        type: 'RECON',
        textId: `${reconCallsign}, ${arrIcao} Tower. Parameter penerbangan terpantau prima. Landasan pacu ${arrIcao} siap sebagai pangkalan pendaratan alternatif.`,
        textEn: `${reconCallsign}, ${arrIcao} Tower. Flight parameters look pristine. Runway ${arrIcao} designated as primary arrival recovery strip.`
      });
      break;

    default:
      // High-resolution Gimbal Zoom & Ready for Strike Call
      messages.push({
        id: 'recon-dial-5a-' + now,
        timestamp: timeStr,
        sender: 'RECON',
        callsign: reconCallsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `${callsign}, ${reconCallsign}. Kamera pembesar optik 60x siap mengunci koordinat. Begitu kontak target terdeteksi, koordinat langsung masuk ke komputer pengeboman Anda.`,
        textEn: `${callsign}, ${reconCallsign}. 60x optical zoom gimbal standing by to designate coordinates. The moment target contact is confirmed, coordinates upload straight to your strike computer.`
      });
      messages.push({
        id: 'recon-dial-5b-' + now,
        timestamp: timeStr,
        sender: 'PILOT',
        callsign,
        frequency: '123.45 MHz',
        type: 'RECON',
        textId: `${reconCallsign}, ${callsign} siap! Menunggu konfirmasi sasaran untuk aksi penyerangan presisi!`,
        textEn: `${reconCallsign}, ${callsign} standing by! Awaiting target confirmation for precision surgical strike!`
      });
      break;
  }

  return { messages, updatedState };
}

/**
 * Processes custom player typed radio transmissions and dynamically generates
 * an authentic, contextual two-way response from Recon Pilot, Tower, VVIP Pilot, or ATC.
 */
export function processPlayerCustomTransmission(
  userInput: string,
  context: {
    callsign: string;
    language: 'id' | 'en';
    currentAltitude: number;
    speed: number | null;
    fuelRemaining: number;
    missionType: string;
    escortStage: EscortStage;
    vvipTargetAircraft: Aircraft;
    vvipEndPoint: MilitaryAirport | null;
    departureAirport: MilitaryAirport | null;
    activeWaypoint: Waypoint | null;
    selectedRecon?: ReconAircraft | null;
    reconState?: ReconState | null;
  }
): { playerMessage: CommsMessage; responseMessage: CommsMessage } {
  const now = Date.now();
  const timeStr = new Date().toTimeString().substring(0, 5) + 'Z';
  const cleanText = userInput.trim();
  const lowerText = cleanText.toLowerCase();

  const flStr = `FL${Math.round(context.currentAltitude / 100).toString().padStart(3, '0')}`;
  const curSpeed = Math.round(context.speed || 450);
  const vvipCallsign = 'INDONESIA-01';
  const isVvipMission = context.missionType === 'VVIPEscort';
  const destName = context.vvipEndPoint?.name || context.departureAirport?.name || 'Pangkalan Udara Utama';
  const destIcao = context.vvipEndPoint?.icao || 'WIII';

  // Recon Call
  const reconCallsign = context.selectedRecon?.name.toUpperCase().includes('ANKA')
    ? 'ANKA-ISR 01'
    : context.selectedRecon?.name.toUpperCase().includes('CH-4B')
    ? 'RAINBOW 51'
    : context.selectedRecon?.name.toUpperCase().includes('POSEIDON')
    ? 'POSEIDON 08'
    : context.selectedRecon?.name.toUpperCase().includes('SURVEILLER') || context.selectedRecon?.name.toUpperCase().includes('CN-235')
    ? 'SURVEILLER 02'
    : context.selectedRecon?.name ? `${context.selectedRecon.name.toUpperCase()} RECON` : 'RECON-01';

  // 1. Create the Player's Transmission Message
  const playerMessage: CommsMessage = {
    id: 'player-custom-' + now,
    timestamp: timeStr,
    sender: 'PILOT',
    callsign: context.callsign,
    frequency: context.selectedRecon ? '123.45 MHz' : isVvipMission ? '123.45 MHz' : '128.20 MHz',
    type: 'CUSTOM',
    textId: cleanText,
    textEn: cleanText
  };

  // 2. Determine Recipient and Response based on Player Text Content & Mission Context
  let respSender: 'VVIP' | 'ATC' | 'AWACS' | 'RECON' | 'TOWER' = 'ATC';
  let respCallsign = 'GARUDA CONTROL';
  let respFreq = '128.20 MHz';
  let respType: CommsMessage['type'] = 'ENROUTE';
  let respTextId = '';
  let respTextEn = '';

  const mentionsRecon = lowerText.includes('recon') || lowerText.includes('intai') || lowerText.includes('drone') || lowerText.includes('flir') || lowerText.includes('sensor') || lowerText.includes('koordinat') || lowerText.includes('sasaran') || lowerText.includes('target') || lowerText.includes('scramble') || lowerText.includes('laser') || lowerText.includes('bda') || lowerText.includes('serang') || lowerText.includes('anka') || lowerText.includes('rainbow') || lowerText.includes('ch-4') || lowerText.includes('poseidon') || lowerText.includes('surveiller');
  const mentionsTower = lowerText.includes('tower') || lowerText.includes('menara') || lowerText.includes('atc') || lowerText.includes('control') || lowerText.includes('ijin') || lowerText.includes('izin') || lowerText.includes('clearance') || lowerText.includes('runway') || lowerText.includes('lepas landas') || lowerText.includes('takeoff');
  const mentionsVvip = lowerText.includes('vvip') || lowerText.includes('vip') || lowerText.includes('indonesia-01') || lowerText.includes('presiden') || lowerText.includes('sayap') || lowerText.includes('formasi') || lowerText.includes('escort') || lowerText.includes('wing') || lowerText.includes('merapat');
  const mentionsLanding = lowerText.includes('landing') || lowerText.includes('mendarat') || lowerText.includes('approach') || lowerText.includes('runway') || lowerText.includes('landas') || lowerText.includes('ils') || lowerText.includes('touchdown');
  const mentionsWeather = lowerText.includes('cuaca') || lowerText.includes('weather') || lowerText.includes('awan') || lowerText.includes('badai') || lowerText.includes('turbulensi') || lowerText.includes('cb') || lowerText.includes('hujan') || lowerText.includes('angin');
  const mentionsFuel = lowerText.includes('fuel') || lowerText.includes('bahan bakar') || lowerText.includes('minyak') || lowerText.includes('status') || lowerText.includes('mesin') || lowerText.includes('engine') || lowerText.includes('bingo') || lowerText.includes('sistem');
  const mentionsRadar = lowerText.includes('radar') || lowerText.includes('bogey') || lowerText.includes('bandit') || lowerText.includes('awacs') || lowerText.includes('aman') || lowerText.includes('clear') || lowerText.includes('scan') || lowerText.includes('kontak');
  const mentionsAltitude = lowerText.includes('altitude') || lowerText.includes('ketinggian') || lowerText.includes('fl') || lowerText.includes('climb') || lowerText.includes('naik') || lowerText.includes('turun') || lowerText.includes('descend');
  const mentionsHeading = lowerText.includes('heading') || lowerText.includes('haluan') || lowerText.includes('vektor') || lowerText.includes('derajat') || lowerText.includes('turn') || lowerText.includes('belok');

  if (mentionsRecon || (context.selectedRecon && !mentionsVvip && !mentionsLanding)) {
    // RECON Transmission Response
    respSender = 'RECON';
    respCallsign = reconCallsign;
    respFreq = '123.45 MHz';
    respType = 'RECON';

    const curTarget = context.reconState?.detectedTargets[0];
    if (curTarget) {
      respTextId = `${context.callsign}, ${reconCallsign} menerima: "${cleanText}". Sasaran aktif [${curTarget.name}] berada di koordinat ${curTarget.lat.toFixed(3)}°, ${curTarget.lng.toFixed(3)}°. Laser designation aktif, bersiap untuk serangan!`;
      respTextEn = `${context.callsign}, ${reconCallsign} acknowledges: "${cleanText}". Active target [${curTarget.name}] tracked at ${curTarget.lat.toFixed(3)}°, ${curTarget.lng.toFixed(3)}°. Laser designator paint locked, prepare strike!`;
    } else {
      const curPos = context.reconState?.reconFlight?.pos;
      const latStr = curPos ? curPos.lat.toFixed(3) : '0.000';
      const lngStr = curPos ? curPos.lng.toFixed(3) : '0.000';
      respTextId = `${context.callsign}, ${reconCallsign} copy: "${cleanText}". Sensor FLIR optik dan SAR menyapu sektor di ${latStr}°, ${lngStr}°. Telemetri intelijen terhubung ke kokpit Anda!`;
      respTextEn = `${context.callsign}, ${reconCallsign} copies: "${cleanText}". Optical FLIR and SAR scanning sector at ${latStr}°, ${lngStr}°. Real-time telemetry feed active to your cockpit!`;
    }
  } else if (mentionsTower) {
    // Tower Response
    respSender = 'TOWER';
    respCallsign = 'GARUDA TOWER';
    respFreq = '128.20 MHz';
    respType = 'ENROUTE';
    respTextId = `${context.callsign}, Garuda Tower menerima: "${cleanText}". Otorisasi misi disetujui, pertahankan frekuensi taktis dan pantau lalu lintas sekitar.`;
    respTextEn = `${context.callsign}, Garuda Tower acknowledges: "${cleanText}". Mission clearance approved, maintain tactical frequency and monitor local traffic.`;
  } else if (mentionsVvip || (isVvipMission && !mentionsLanding && !mentionsRadar && Math.random() > 0.3)) {
    // VVIP Pilot Response
    respSender = 'VVIP';
    respCallsign = vvipCallsign;
    respFreq = '123.45 MHz';
    respType = 'VVIP';

    if (context.escortStage === 'escorting') {
      respTextId = `${context.callsign}, Indonesia-01 menyambut transmisi Anda: "${cleanText}". Formasi pengawalan sayap terpantau sangat solid. Kecepatan ${curSpeed} knot sinkron, kabin VVIP aman dan tenang. Melanjutkan bersama menuju ${destIcao}.`;
      respTextEn = `${context.callsign}, Indonesia-01 acknowledges your transmission: "${cleanText}". Starboard escort formation is rock-solid. Speed ${curSpeed} knots matched, VVIP cabin is smooth. Continuing together to ${destIcao}.`;
    } else {
      respTextId = `${context.callsign}, Indonesia-01 copy: "${cleanText}". Kami on-track menuju titik Rendezvous (RV). Bersiap bergabung formasi sayap pengawal.`;
      respTextEn = `${context.callsign}, Indonesia-01 copies: "${cleanText}". We are on-track to the Rendezvous (RV) point. Standing by to join escort formation.`;
    }
  } else if (mentionsLanding) {
    // ATC Landing / Approach Response
    respSender = 'ATC';
    respCallsign = 'GARUDA APPROACH';
    respFreq = '119.70 MHz';
    respType = 'APPROACH';
    respTextId = `${context.callsign}, Garuda Approach menerima: "${cleanText}". Diijinkan desensus bertahap. Runway ${destIcao} aktif, angin tenang 210/08kt, QNH 1012. Prioritas pendaratan diberikan.`;
    respTextEn = `${context.callsign}, Garuda Approach roger: "${cleanText}". Cleared for step descent. Runway at ${destIcao} active, wind 210/08kt, QNH 1012. Landing priority authorized.`;
  } else if (mentionsWeather) {
    // ATC Weather Response
    respSender = 'ATC';
    respCallsign = 'GARUDA CONTROL';
    respFreq = '128.20 MHz';
    respType = 'WEATHER';
    respTextId = `${context.callsign}, Garuda Control. Laporan cuaca: Kondisi rute CAVOK, sel awan aktif berada 35 mil laut barat koridor. Deviasi rute hingga 15 derajat disetujui jika diperlukan.`;
    respTextEn = `${context.callsign}, Garuda Control. Weather update: Route is CAVOK, active CB cells 35 NM west of corridor. Deviation up to 15 degrees approved if required.`;
  } else if (mentionsFuel) {
    // Systems & Fuel acknowledgement
    respSender = 'ATC';
    respCallsign = 'GARUDA RADAR';
    respFreq = '128.20 MHz';
    respType = 'ENROUTE';
    respTextId = `${context.callsign}, Garuda Radar menerima pembaruan sistem dan bahan bakar (${Math.round(context.fuelRemaining)} LBS). Status penerbangan dicatat nominal.`;
    respTextEn = `${context.callsign}, Garuda Radar acknowledges systems and fuel state (${Math.round(context.fuelRemaining)} LBS). Flight status logged nominal.`;
  } else if (mentionsRadar) {
    // AWACS Sector Airspace Response
    respSender = 'AWACS';
    respCallsign = 'MATADORA AWACS';
    respFreq = '243.00 UHF';
    respType = 'ALERT';
    respTextId = `${context.callsign}, Matadora AWACS. Picture clean. Radar sapuan 120 mil laut mengonfirmasi tidak ada kontak udara mencurigakan. Sektor Anda aman penuh.`;
    respTextEn = `${context.callsign}, Matadora AWACS. Picture clean. 120 NM radar sweep confirms sovereign airspace is clear of unauthorized bogeys. Sector secure.`;
  } else if (mentionsAltitude || mentionsHeading) {
    // ATC Altitude/Vector Response
    respSender = 'ATC';
    respCallsign = 'GARUDA CONTROL';
    respFreq = '128.20 MHz';
    respType = 'ALTITUDE';
    respTextId = `${context.callsign}, Garuda Control mengonfirmasi permintaan: "${cleanText}". Terpantau jelas pada radar sekunder. Pertahankan parameter penerbangan aman.`;
    respTextEn = `${context.callsign}, Garuda Control confirms transmission: "${cleanText}". Radar contact verified. Maintain safe flight parameters.`;
  } else {
    // General Pilot Radio Check / Friendly Tactical Response
    respSender = 'TOWER';
    respCallsign = 'GARUDA CONTROL';
    respFreq = '128.20 MHz';
    respType = 'ENROUTE';
    respTextId = `${context.callsign}, Garuda Control menerima transmisi: "${cleanText}". Bacaan 5 per 5 kuat dan jelas, radar identifikasi aktif. Lanjutkan misi operasional.`;
    respTextEn = `${context.callsign}, Garuda Control acknowledges: "${cleanText}". Readback 5 by 5 loud and clear, radar tracking active. Continue operational mission.`;
  }

  const responseMessage: CommsMessage = {
    id: 'response-auto-' + (now + 1),
    timestamp: timeStr,
    sender: respSender,
    callsign: respCallsign,
    frequency: respFreq,
    type: respType,
    textId: respTextId,
    textEn: respTextEn
  };

  return { playerMessage, responseMessage };
}

