import { Position, Waypoint, Aircraft } from '../types';
import { getDistance, getBearing } from '../lib/utils';

export interface PlayerStepResult {
  nextPos: Position;
  nextHeading: number;
  fuelBurned: number;
  flightHoursGained: number;
  reachedWaypointId: string | null;
}

/**
 * Calculates step update for player aircraft physics and smooth waypoint tracking.
 * Uses high-rate delta-time physics and game pacing scale for silky smooth and responsive flight.
 */
export function calculatePlayerStep(
  currentPos: Position,
  currentHeading: number | null,
  speed: number,
  targetHeading: number,
  autoPilot: boolean,
  activeWaypoint: Waypoint | null,
  simulationSpeed: number,
  aircraft: Aircraft,
  isVvipOrbiting: boolean,
  dtSeconds: number = 0.1,
  gameTimeScale: number = 8,
  effectiveBurnRate?: number
): PlayerStepResult {
  // Effective flight time in simulated seconds during this tick
  const simulatedSeconds = dtSeconds * simulationSpeed * gameTimeScale;
  const moveDist = (speed / 3600) * simulatedSeconds; // distance in NM
  const reachThreshold = Math.max(0.6, moveDist * 1.5);

  let desiredHeading = targetHeading;
  if (autoPilot && activeWaypoint) {
    desiredHeading = getBearing(currentPos.lat, currentPos.lng, activeWaypoint.lat, activeWaypoint.lng);
  }

  // Smooth heading transition with realistic turn rate (~4-6 deg/sec scaled)
  let currentH = currentHeading !== null ? currentHeading : desiredHeading;
  if (!isVvipOrbiting) {
    let diff = desiredHeading - currentH;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    
    // Smooth angular turn step
    const turnRatePerSec = 4.5; // degrees per simulated second
    const maxTurnStep = turnRatePerSec * simulatedSeconds;
    
    if (Math.abs(diff) <= maxTurnStep) {
      currentH = desiredHeading;
    } else {
      currentH = (currentH + (diff > 0 ? maxTurnStep : -maxTurnStep) + 360) % 360;
    }
  } else {
    // Smooth tactical orbit turning at RV while waiting for rendezvous
    currentH = (currentH + 3.0 * simulatedSeconds) % 360;
  }

  const rate = effectiveBurnRate && effectiveBurnRate > 0 ? effectiveBurnRate : (aircraft.burnRate || 15);
  const fuelBurned = moveDist * rate;
  const flightHoursGained = (moveDist / (aircraft.cruiseSpeed || 450)) * 60; // in minutes

  // Orbiting at RV while waiting for VVIP rendezvous
  if (isVvipOrbiting && activeWaypoint) {
    const orbitTurnRate = 3.5; // degrees per simulated second
    const orbitAngle = (((currentHeading !== null ? currentHeading : targetHeading) + orbitTurnRate * simulatedSeconds) % 360 + 360) % 360;
    const distToRV = getDistance(currentPos.lat, currentPos.lng, activeWaypoint.lat, activeWaypoint.lng);
    const orbitRadius = Math.max(0.6, Math.min(1.5, distToRV));
    const orbitAngleRad = (orbitAngle * Math.PI) / 180;
    const nextLat = activeWaypoint.lat + (orbitRadius / 60) * Math.cos(orbitAngleRad);
    const nextLng = activeWaypoint.lng + (orbitRadius / (60 * Math.cos((activeWaypoint.lat * Math.PI) / 180))) * Math.sin(orbitAngleRad);

    return {
      nextPos: { lat: nextLat, lng: nextLng },
      nextHeading: (orbitAngle + 90) % 360,
      fuelBurned,
      flightHoursGained,
      reachedWaypointId: null // Keep holding at RV until rendezvous occurs
    };
  }

  let reachedWaypointId: string | null = null;
  let nextLat = currentPos.lat;
  let nextLng = currentPos.lng;

  if (activeWaypoint) {
    const distToWp = getDistance(currentPos.lat, currentPos.lng, activeWaypoint.lat, activeWaypoint.lng);
    if (distToWp <= reachThreshold) {
      reachedWaypointId = activeWaypoint.id;
      nextLat = activeWaypoint.lat;
      nextLng = activeWaypoint.lng;
    } else {
      const latMove = (moveDist / 60) * Math.cos((currentH * Math.PI) / 180);
      const lngMove = (moveDist / (60 * Math.cos((currentPos.lat * Math.PI) / 180))) * Math.sin((currentH * Math.PI) / 180);
      nextLat = currentPos.lat + latMove;
      nextLng = currentPos.lng + lngMove;
    }
  } else {
    const latMove = (moveDist / 60) * Math.cos((currentH * Math.PI) / 180);
    const lngMove = (moveDist / (60 * Math.cos((currentPos.lat * Math.PI) / 180))) * Math.sin((currentH * Math.PI) / 180);
    nextLat = currentPos.lat + latMove;
    nextLng = currentPos.lng + lngMove;
  }

  return {
    nextPos: { lat: nextLat, lng: nextLng },
    nextHeading: currentH,
    fuelBurned,
    flightHoursGained,
    reachedWaypointId
  };
}

