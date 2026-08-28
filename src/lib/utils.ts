import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Waypoint } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the distance between two points in nautical miles.
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the bearing from point 1 to point 2 in degrees.
 */
export function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculates the next position based on current position, speed, heading, and time interval.
 */
export function getNextPosition(
  lat: number,
  lng: number,
  speedKnots: number,
  headingDeg: number,
  intervalSeconds: number,
  driftDeg: number = 0
): { lat: number; lng: number } {
  const R = 3440.065; // Earth's radius in nautical miles
  const distance = (speedKnots * intervalSeconds) / 3600;
  const brng = toRad(headingDeg + driftDeg);
  const lat1 = toRad(lat);
  const lon1 = toRad(lng);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: toDeg(lat2),
    lng: toDeg(lon2),
  };
}

/**
 * Calculates fuel estimation for a route.
 */
export function calculateFuelPlan(waypoints: Waypoint[], initialFuel: number, burnRate: number, cruiseSpeed: number = 450): Waypoint[] {
  let currentFuel = initialFuel;
  return waypoints.map((wp, idx) => {
    if (idx === 0) return { ...wp, estFuelRemaining: currentFuel };
    
    const prev = waypoints[idx - 1];
    const dist = getDistance(prev.lat, prev.lng, wp.lat, wp.lng);
    const fuelUsed = dist * burnRate;
    const speed = wp.planSpeed && wp.planSpeed > 0 ? wp.planSpeed : cruiseSpeed;
    const timeHours = dist / speed;
    
    currentFuel -= fuelUsed;
    return { 
      ...wp, 
      estFuelRemaining: Math.max(0, currentFuel),
      estTimeMinutes: Math.round(timeHours * 60)
    };
  });
}

/**
 * Generates high-resolution great-circle curved coordinates between waypoints
 * for ultra-smooth rendering on Leaflet tactical radar.
 */
export function generateSmoothRoute(points: { lat: number; lng: number }[], segmentsPerLeg: number = 16): [number, number][] {
  if (!points || points.length < 2) return points ? points.map(p => [p.lat, p.lng]) : [];

  const smoothCoords: [number, number][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const lat1 = toRad(p1.lat);
    const lon1 = toRad(p1.lng);
    const lat2 = toRad(p2.lat);
    const lon2 = toRad(p2.lng);

    const d = 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)
    ));

    for (let f = 0; f <= (i === points.length - 2 ? segmentsPerLeg : segmentsPerLeg - 1); f++) {
      const frac = f / segmentsPerLeg;
      if (d === 0) {
        smoothCoords.push([p1.lat, p1.lng]);
        continue;
      }

      const A = Math.sin((1 - frac) * d) / Math.sin(d);
      const B = Math.sin(frac * d) / Math.sin(d);

      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);

      const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
      const lon = Math.atan2(y, x);

      smoothCoords.push([toDeg(lat), toDeg(lon)]);
    }
  }

  return smoothCoords;
}

