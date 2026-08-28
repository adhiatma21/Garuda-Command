import { Position, Waypoint, EscortStage, Aircraft } from '../types';
import { getDistance, getBearing } from '../lib/utils';
import { MilitaryAirport } from '../airports';

export interface EscortProximityCheckParams {
  playerPos: Position | null;
  vvipPos: Position | null;
  rendezvousPoint: Waypoint | null;
  vvipEndPoint: MilitaryAirport | null;
  arrivalAirport: MilitaryAirport | null;
  currentEscortStage: EscortStage;
  vvipReachedRV: boolean;
}

export interface EscortProximityResult {
  shouldTransitionToEscorting: boolean;
  shouldTransitionToComplete: boolean;
  shouldTransitionToVvipLanded: boolean;
  newEscortStage: EscortStage;
  vvipReachedRV: boolean;
  playerReachedRV: boolean;
  distancePlayerToVvip: number;
  distancePlayerToRV: number;
  distanceVvipToRV: number;
  distanceVvipToEnd: number;
  distancePlayerToEnd: number;
  distancePlayerToArrival: number;
}

/**
 * Checks proximity between Player Aircraft, Escorted VVIP Aircraft, Rendezvous Point, and Destination/Arrival Airports.
 * - In 'pre_rendezvous': Player and VVIP both fly to RV. If one arrives earlier, they orbit around RV until visual rendezvous (<= 5.0 NM).
 * - In 'escorting': Player and VVIP fly in formation together towards VVIP DESTINATION.
 * - When VVIP arrives at VVIP DESTINATION:
 *    * If Player's ARRIVAL airport is the SAME as VVIP DESTINATION: Player lands and mission is complete.
 *    * If Player's ARRIVAL airport is DIFFERENT: VVIP lands (stage -> 'vvip_landed'), and player continues to selected ARRIVAL airport.
 * - In 'vvip_landed': Player proceeds towards their selected ARRIVAL base; when arrived, game completes.
 */
export function evaluateEscortProximity(params: EscortProximityCheckParams): EscortProximityResult {
  const {
    playerPos,
    vvipPos,
    rendezvousPoint,
    vvipEndPoint,
    arrivalAirport,
    currentEscortStage,
    vvipReachedRV
  } = params;

  let distancePlayerToVvip = Infinity;
  let distancePlayerToRV = Infinity;
  let distanceVvipToRV = Infinity;
  let distanceVvipToEnd = Infinity;
  let distancePlayerToEnd = Infinity;
  let distancePlayerToArrival = Infinity;

  if (playerPos && vvipPos) {
    distancePlayerToVvip = getDistance(playerPos.lat, playerPos.lng, vvipPos.lat, vvipPos.lng);
  }

  if (rendezvousPoint) {
    if (playerPos) {
      distancePlayerToRV = getDistance(playerPos.lat, playerPos.lng, rendezvousPoint.lat, rendezvousPoint.lng);
    }
    if (vvipPos) {
      distanceVvipToRV = getDistance(vvipPos.lat, vvipPos.lng, rendezvousPoint.lat, rendezvousPoint.lng);
    }
  }

  if (vvipEndPoint) {
    if (vvipPos) {
      distanceVvipToEnd = getDistance(vvipPos.lat, vvipPos.lng, vvipEndPoint.lat, vvipEndPoint.lng);
    }
    if (playerPos) {
      distancePlayerToEnd = getDistance(playerPos.lat, playerPos.lng, vvipEndPoint.lat, vvipEndPoint.lng);
    }
  }

  if (arrivalAirport && playerPos) {
    distancePlayerToArrival = getDistance(playerPos.lat, playerPos.lng, arrivalAirport.lat, arrivalAirport.lng);
  }

  let updatedVvipReachedRV = vvipReachedRV;
  if (distanceVvipToRV <= 1.5) {
    updatedVvipReachedRV = true;
  }
  const playerReachedRV = distancePlayerToRV <= 1.5;

  let shouldTransitionToEscorting = false;
  let shouldTransitionToComplete = false;
  let shouldTransitionToVvipLanded = false;
  let newEscortStage = currentEscortStage;

  const isArrivalSameAsVvipDest = !arrivalAirport || 
    !vvipEndPoint || 
    arrivalAirport.icao === vvipEndPoint.icao ||
    getDistance(arrivalAirport.lat, arrivalAirport.lng, vvipEndPoint.lat, vvipEndPoint.lng) < 1.0;

  if (currentEscortStage === 'pre_rendezvous') {
    // Condition 1: Direct visual meeting between Player and VVIP (within 5.0 NM)
    const isDirectVisualContact = distancePlayerToVvip <= 5.0;

    // Condition 2: Both arrived at/near the Rendezvous Point zone and within intercept distance (within 6.0 NM)
    const isBothAtRendezvousZone = distanceVvipToRV <= 4.0 && distancePlayerToRV <= 4.0 && distancePlayerToVvip <= 6.0;

    // Condition 3: One was orbiting at RV and the other intercepts within 5.0 NM
    const isInterceptAtRV = (updatedVvipReachedRV || playerReachedRV) && distancePlayerToVvip <= 5.0;

    if (isDirectVisualContact || isBothAtRendezvousZone || isInterceptAtRV) {
      shouldTransitionToEscorting = true;
      newEscortStage = 'escorting';
      updatedVvipReachedRV = true;
    }
  } else if (currentEscortStage === 'escorting') {
    // Check if VVIP and escorting player have arrived at VVIP DESTINATION
    const isVvipAtDestination = distanceVvipToEnd <= 2.5;
    const isPlayerInEscortAtDest = distancePlayerToEnd <= 6.0 || distancePlayerToVvip <= 6.0;

    if (isVvipAtDestination && isPlayerInEscortAtDest) {
      if (isArrivalSameAsVvipDest) {
        // Player and VVIP both land at VVIP Destination -> Mission Complete!
        shouldTransitionToComplete = true;
        newEscortStage = 'complete';
      } else {
        // VVIP lands at VVIP Destination, but Player proceeds to Player Arrival Base
        shouldTransitionToVvipLanded = true;
        newEscortStage = 'vvip_landed';
      }
    }
  } else if (currentEscortStage === 'vvip_landed') {
    // Player flying towards selected Arrival base
    if (distancePlayerToArrival <= 2.5 || (isArrivalSameAsVvipDest && distancePlayerToEnd <= 2.5)) {
      shouldTransitionToComplete = true;
      newEscortStage = 'complete';
    }
  }

  return {
    shouldTransitionToEscorting,
    shouldTransitionToComplete,
    shouldTransitionToVvipLanded,
    newEscortStage,
    vvipReachedRV: updatedVvipReachedRV,
    playerReachedRV,
    distancePlayerToVvip,
    distancePlayerToRV,
    distanceVvipToRV,
    distanceVvipToEnd,
    distancePlayerToEnd,
    distancePlayerToArrival
  };
}

/**
 * Calculates next position and heading for VVIP escort aircraft.
 * - In 'pre_rendezvous': Flies towards RV point. If RV point is reached before player arrives, holds/orbits at RV point.
 * - In 'escorting': Flies steadily towards the final destination endpoint.
 * - In 'vvip_landed' or 'complete': Stays safely parked/stationary at destination base.
 */
export function calculateVvipNextStep(
  currentPos: Position,
  currentHeading: number,
  escortStage: EscortStage,
  rendezvousPoint: Waypoint | null,
  vvipEndPoint: MilitaryAirport | null,
  cruiseSpeed: number,
  simulationSpeed: number,
  vvipReachedRV: boolean,
  dtSeconds: number = 0.1,
  gameTimeScale: number = 8
): { nextPos: Position; nextHeading: number; reachedTarget: boolean } {
  // If VVIP has already landed at destination
  if (escortStage === 'vvip_landed' || escortStage === 'complete') {
    const endCoord = vvipEndPoint ? { lat: vvipEndPoint.lat, lng: vvipEndPoint.lng } : currentPos;
    return {
      nextPos: endCoord,
      nextHeading: currentHeading,
      reachedTarget: true
    };
  }

  const simulatedSeconds = dtSeconds * simulationSpeed * gameTimeScale;
  const speedToUse = cruiseSpeed > 0 ? cruiseSpeed : 440;
  const moveDist = (speedToUse / 3600) * simulatedSeconds; // NM

  // In pre_rendezvous: target MUST be the rendezvous point
  if (escortStage === 'pre_rendezvous') {
    if (!rendezvousPoint) {
      // Fallback: maintain heading
      const latMove = (moveDist / 60) * Math.cos((currentHeading * Math.PI) / 180);
      const lngMove = (moveDist / (60 * Math.cos((currentPos.lat * Math.PI) / 180))) * Math.sin((currentHeading * Math.PI) / 180);
      return {
        nextPos: { lat: currentPos.lat + latMove, lng: currentPos.lng + lngMove },
        nextHeading: currentHeading,
        reachedTarget: false
      };
    }

    const distToRV = getDistance(currentPos.lat, currentPos.lng, rendezvousPoint.lat, rendezvousPoint.lng);
    const reachThreshold = Math.max(0.8, moveDist * 1.5);

    // If VVIP has reached RV point but escort stage is STILL pre_rendezvous (player hasn't rendezvoused yet),
    // VVIP enters a tactical holding orbit around the RV point waiting for player!
    if (distToRV <= reachThreshold || vvipReachedRV) {
      const orbitTurnRate = 4.0; // deg/sec
      const newHeading = (currentHeading + orbitTurnRate * simulatedSeconds) % 360;
      // Orbit around RV point
      const orbitDist = Math.max(0.5, distToRV);
      const orbitAngleRad = (newHeading * Math.PI) / 180;
      const nextLat = rendezvousPoint.lat + (orbitDist / 60) * Math.cos(orbitAngleRad);
      const nextLng = rendezvousPoint.lng + (orbitDist / (60 * Math.cos((rendezvousPoint.lat * Math.PI) / 180))) * Math.sin(orbitAngleRad);

      return {
        nextPos: { lat: nextLat, lng: nextLng },
        nextHeading: (newHeading + 90) % 360,
        reachedTarget: true
      };
    }

    // Flying directly towards RV
    const bearingToRV = getBearing(currentPos.lat, currentPos.lng, rendezvousPoint.lat, rendezvousPoint.lng);
    const latMove = (moveDist / 60) * Math.cos((bearingToRV * Math.PI) / 180);
    const lngMove = (moveDist / (60 * Math.cos((currentPos.lat * Math.PI) / 180))) * Math.sin((bearingToRV * Math.PI) / 180);

    return {
      nextPos: { lat: currentPos.lat + latMove, lng: currentPos.lng + lngMove },
      nextHeading: bearingToRV,
      reachedTarget: false
    };
  }

  // In escorting: target is destination endpoint
  const target = vvipEndPoint || rendezvousPoint;
  if (!target) {
    return {
      nextPos: currentPos,
      nextHeading: currentHeading,
      reachedTarget: false
    };
  }

  const distToTarget = getDistance(currentPos.lat, currentPos.lng, target.lat, target.lng);
  const bearingToTarget = getBearing(currentPos.lat, currentPos.lng, target.lat, target.lng);
  const reachThreshold = Math.max(0.6, moveDist * 1.5);

  if (distToTarget <= reachThreshold) {
    return {
      nextPos: { lat: target.lat, lng: target.lng },
      nextHeading: bearingToTarget,
      reachedTarget: true
    };
  }

  const latMove = (moveDist / 60) * Math.cos((bearingToTarget * Math.PI) / 180);
  const lngMove = (moveDist / (60 * Math.cos((currentPos.lat * Math.PI) / 180))) * Math.sin((bearingToTarget * Math.PI) / 180);

  return {
    nextPos: {
      lat: currentPos.lat + latMove,
      lng: currentPos.lng + lngMove
    },
    nextHeading: bearingToTarget,
    reachedTarget: false
  };
}
