import { TrafficAircraft, Position } from '../types';
import { MILITARY_AIRPORTS } from '../airports';

/**
 * Calculates step update for ambient air traffic movement and lifecycle spawning
 */
export function stepTrafficSimulation(
  currentTraffic: TrafficAircraft[],
  simulationSpeed: number,
  trafficFrequency: number,
  spawnCenter: Position | null
): TrafficAircraft[] {
  const filtered = currentTraffic.filter(t => t.ttl > 0);

  const moved = filtered.map(t => {
    const moveDist = (t.speed / 3600) * simulationSpeed;
    const latMove = (moveDist / 60) * Math.cos((t.heading * Math.PI) / 180);
    const lngMove = (moveDist / (60 * Math.cos((t.lat * Math.PI) / 180))) * Math.sin((t.heading * Math.PI) / 180);
    return {
      ...t,
      lat: t.lat + latMove,
      lng: t.lng + lngMove,
      ttl: t.ttl - 1
    };
  });

  if (moved.length < trafficFrequency && Math.random() < 0.6) {
    const spawnBase = spawnCenter || MILITARY_AIRPORTS[Math.floor(Math.random() * MILITARY_AIRPORTS.length)];
    const heading = Math.random() * 360;
    const speed = 300 + Math.random() * 300;
    const altitude = 20000 + Math.random() * 20000;
    const callsign = `AF-${Math.floor(100 + Math.random() * 900)}`;

    moved.push({
      id: crypto.randomUUID(),
      lat: spawnBase.lat + (Math.random() - 0.5) * 6,
      lng: spawnBase.lng + (Math.random() - 0.5) * 6,
      heading,
      speed,
      altitude,
      callsign,
      ttl: 600,
      isEnemy: Math.random() < 0.1
    });
  }

  return moved;
}

/**
 * Checks if a random interception event is triggered during a Patrol mission
 */
export function checkPatrolInterceptTarget(
  traffic: TrafficAircraft[],
  missionType: string,
  hasExistingTarget: boolean
): TrafficAircraft | null {
  if (missionType !== 'Patrol' || hasExistingTarget) {
    return null;
  }

  if (Math.random() < 0.005) {
    const threats = traffic.filter(t => t.isEnemy);
    if (threats.length > 0) {
      return threats[0];
    }
  }

  return null;
}
