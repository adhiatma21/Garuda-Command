import { Aircraft, Crew } from '../types';

export interface AircraftWeightBreakdown {
  emptyWeight: number; // Clean Aircraft Operating Empty Weight without weapons & external tank
  maxTakeoffWeight: number; // MTOW (lbs)
  pilotWeight: number; // 200 lbs (Pilot + Combat Flight Suit/Helmet/G-Suit)
  hasCoPilot: boolean;
  coPilotWeight: number; // 200 lbs if co-pilot entered, else 0 lbs
  additionalCrewCount: number;
  additionalCrewWeight: number; // 180 lbs per extra crew member
  cabinPassengerCount: number;
  cabinPassengerWeight: number; // 170 lbs per passenger
  totalPersonnelWeight: number; // Pilot + Co-Pilot + Extra Crew + Cabin
  useSubTank: boolean;
  externalTankHardwareWeight: number; // Dry weight of drop tank pods (~350 lbs)
  externalFuelWeight: number; // Additional +30% fuel weight
  totalExternalTankWeight: number; // Hardware + Fuel
  combatMode: boolean;
  weaponLoadoutWeight: number; // Standard combat ordinance weight (e.g. 2,400 lbs if fighter & combatMode, else 0)
  customPayload: number; // Custom cargo/ordnance (default 0 for clean aircraft)
  internalFuelWeight: number; // Base fuel weight
  totalFuelWeight: number; // Internal + External fuel
  grossTakeoffWeight: number; // Total Takeoff Weight (TOW)
  weightMargin: number; // MTOW - grossTakeoffWeight
  isOverweight: boolean;
  
  // Fuel Dynamics & Burn Rate Calculations
  baselineWeight: number; // Base reference weight (empty + full internal fuel + 1 pilot)
  weightRatio: number; // grossTakeoffWeight / baselineWeight
  weightBurnPenaltyPercent: number; // e.g. +12.5%
  dragBurnPenaltyPercent: number; // e.g. +4% from external tank & +3% from weapons
  baseBurnRate: number; // LBS per NM
  effectiveBurnRate: number; // Adjusted LBS per NM based on total weight & aero drag
  
  // Calculated Fuel Range
  baselineFuelRange: number; // NM (Standard clean range without sub-tank)
  effectiveFuelRange: number; // NM (Calculated fuel range after factoring in total weight & fuel capacity)
  fuelRangeDifferencePercent: number;
}

export function getDefaultEmptyWeight(aircraft: Aircraft): number {
  if (aircraft.emptyWeight) return aircraft.emptyWeight;
  const id = aircraft.id.toLowerCase();
  if (id.includes('f16-emlu') || id.includes('f16-cd') || id.includes('f16')) return 18900;
  if (id.includes('su27')) return 36100;
  if (id.includes('su30')) return 39000;
  if (id.includes('su57')) return 39680;
  if (id.includes('rafale')) return 22700;
  if (id.includes('super-tucano') || id.includes('tucano')) return 7055;
  if (id.includes('t50') || id.includes('golden-eagle')) return 14285;
  if (id.includes('f22')) return 43340;
  if (id.includes('f35')) return 29300;
  if (id.includes('a10')) return 24959;
  if (id.includes('c130') || id.includes('hercules')) return 75800;
  if (id.includes('c17')) return 282500;
  if (id.includes('c212')) return 8330;
  if (id.includes('cn235')) return 21605;
  if (id.includes('b737') || id.includes('737')) return 91000;
  if (id.includes('falcon-8x') || id.includes('falcon')) return 34000;
  if (id.includes('super-puma') || id.includes('puma') || id.includes('caracal')) return 10200;
  if (id.includes('indonesia-one')) return 94500;
  if (id.includes('air-force-one')) return 455000;
  if (id.includes('japan-vip')) return 370000;
  if (id.includes('germany-vip')) return 313000;
  if (id.includes('france-vip')) return 263000;
  return aircraft.type === 'fighter' ? 20000 : 60000;
}

export function getDefaultMaxTakeoffWeight(aircraft: Aircraft): number {
  if (aircraft.maxTakeoffWeight) return aircraft.maxTakeoffWeight;
  const id = aircraft.id.toLowerCase();
  if (id.includes('f16')) return 42300;
  if (id.includes('su27')) return 67100;
  if (id.includes('su30')) return 76060;
  if (id.includes('su57')) return 77160;
  if (id.includes('rafale')) return 54000;
  if (id.includes('super-tucano') || id.includes('tucano')) return 11464;
  if (id.includes('t50') || id.includes('golden-eagle')) return 27300;
  if (id.includes('f22')) return 83500;
  if (id.includes('f35')) return 70000;
  if (id.includes('a10')) return 50000;
  if (id.includes('c130') || id.includes('hercules')) return 155000;
  if (id.includes('c17')) return 585000;
  if (id.includes('c212')) return 16975;
  if (id.includes('cn235')) return 36376;
  if (id.includes('b737') || id.includes('737')) return 174200;
  if (id.includes('falcon-8x') || id.includes('falcon')) return 73000;
  if (id.includes('super-puma') || id.includes('puma') || id.includes('caracal')) return 19840;
  if (id.includes('indonesia-one')) return 174200;
  if (id.includes('air-force-one')) return 833000;
  if (id.includes('japan-vip')) return 775000;
  if (id.includes('germany-vip')) return 617000;
  if (id.includes('france-vip')) return 533500;
  const empty = getDefaultEmptyWeight(aircraft);
  return Math.round(empty * 2.15);
}

export function calculateAircraftWeights(
  aircraft: Aircraft,
  crew: Partial<Crew> = {},
  customPayload: number = 0,
  useSubTank: boolean = false,
  combatMode: boolean = false
): AircraftWeightBreakdown {
  const emptyWeight = aircraft.emptyWeight || getDefaultEmptyWeight(aircraft);
  const maxTakeoffWeight = aircraft.maxTakeoffWeight || getDefaultMaxTakeoffWeight(aircraft);

  // 1. Crew & Personnel Weight
  const pilotWeight = 200; // Standard pilot with flight gear, helmet, survival vest & G-suit
  const hasCoPilot = Boolean(crew.coPilot && crew.coPilot.trim().length > 0);
  const coPilotWeight = hasCoPilot ? 200 : 0;
  
  const declaredCrew = Math.max(1, crew.crewCount || 1);
  const extraCrewCount = Math.max(0, declaredCrew - 1 - (hasCoPilot ? 1 : 0));
  const additionalCrewWeight = extraCrewCount * 180;
  
  const cabinPassengerCount = Math.max(0, crew.cabinCount || 0);
  const cabinPassengerWeight = cabinPassengerCount * 170;
  
  const totalPersonnelWeight = pilotWeight + coPilotWeight + additionalCrewWeight + cabinPassengerWeight;

  // 2. Fuel Weights
  const internalFuelWeight = aircraft.maxFuel;
  const externalFuelWeight = useSubTank ? Math.round(aircraft.maxFuel * 0.30) : 0;
  const totalFuelWeight = internalFuelWeight + externalFuelWeight;
  
  // External Tank Dry Pod Hardware
  const externalTankHardwareWeight = useSubTank 
    ? Math.round(Math.min(600, Math.max(250, aircraft.maxFuel * 0.04 + 150))) 
    : 0;
  const totalExternalTankWeight = externalFuelWeight + externalTankHardwareWeight;

  // 3. Weapons Weight
  const weaponLoadoutWeight = (combatMode && aircraft.type === 'fighter') ? 2400 : 0;

  // 4. Custom Payload (Clean default is 0 lbs)
  const payloadWeight = Math.max(0, customPayload || 0);

  // 5. Total Gross Takeoff Weight (TOW)
  const grossTakeoffWeight = 
    emptyWeight + 
    internalFuelWeight + 
    totalPersonnelWeight + 
    totalExternalTankWeight + 
    weaponLoadoutWeight + 
    payloadWeight;
    
  const weightMargin = maxTakeoffWeight - grossTakeoffWeight;
  const isOverweight = weightMargin < 0;

  // 6. Fuel Burn Rate & Dynamics Calculation based on Total Weight & Parasite Drag
  // Baseline clean reference: clean empty weight + max internal fuel + 1 pilot
  const baselineWeight = emptyWeight + internalFuelWeight + pilotWeight;
  const weightDeltaRatio = (grossTakeoffWeight - baselineWeight) / baselineWeight;
  
  // Physics impact: Induced drag & thrust required scales with weight delta (~40% sensitivity factor)
  const weightFactor = 1.0 + (weightDeltaRatio * 0.40);
  const weightBurnPenaltyPercent = Number((weightDeltaRatio * 40).toFixed(1));

  // Aerodynamic parasite drag penalty from external tank pod and external weapons
  let dragMultiplier = 1.0;
  let dragPenalty = 0;
  if (useSubTank) {
    dragMultiplier *= 1.04; // 4% drag penalty for sub-tanks
    dragPenalty += 4;
  }
  if (combatMode && aircraft.type === 'fighter') {
    dragMultiplier *= 1.03; // 3% drag penalty for external pylons/missiles
    dragPenalty += 3;
  }
  const dragBurnPenaltyPercent = dragPenalty;

  const baseBurnRate = aircraft.burnRate || 15;
  const effectiveBurnRate = Number((baseBurnRate * Math.max(0.75, weightFactor) * dragMultiplier).toFixed(2));

  // 7. Fuel Range calculation
  const baselineFuelRange = Math.round(aircraft.maxFuel / baseBurnRate);
  const effectiveFuelRange = Math.round(totalFuelWeight / effectiveBurnRate);
  const fuelRangeDifferencePercent = Number((((effectiveFuelRange - baselineFuelRange) / baselineFuelRange) * 100).toFixed(1));

  return {
    emptyWeight,
    maxTakeoffWeight,
    pilotWeight,
    hasCoPilot,
    coPilotWeight,
    additionalCrewCount: extraCrewCount,
    additionalCrewWeight,
    cabinPassengerCount,
    cabinPassengerWeight,
    totalPersonnelWeight,
    useSubTank,
    externalTankHardwareWeight,
    externalFuelWeight,
    totalExternalTankWeight,
    combatMode,
    weaponLoadoutWeight,
    customPayload: payloadWeight,
    internalFuelWeight,
    totalFuelWeight,
    grossTakeoffWeight,
    weightMargin,
    isOverweight,
    baselineWeight,
    weightRatio: Number((grossTakeoffWeight / baselineWeight).toFixed(3)),
    weightBurnPenaltyPercent,
    dragBurnPenaltyPercent,
    baseBurnRate,
    effectiveBurnRate,
    baselineFuelRange,
    effectiveFuelRange,
    fuelRangeDifferencePercent
  };
}
