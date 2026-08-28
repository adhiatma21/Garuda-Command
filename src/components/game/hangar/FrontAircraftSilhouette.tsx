import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  RotateCw, 
  Play, 
  Pause, 
  Eye, 
  Info, 
  ShieldCheck, 
  Target, 
  Compass,
  Layers
} from 'lucide-react';
import { Aircraft } from '../../../types';
import { cn } from '../../../lib/utils';

// Photorealistic Front Renders
import f16FrontImg from '../../../assets/images/f16_front_render_1787660882007.jpg';
import su30FrontImg from '../../../assets/images/su30_front_render_1787660913685.jpg';
import rafaleFrontImg from '../../../assets/images/rafale_front_render_1787660928232.jpg';
import tucanoFrontImg from '../../../assets/images/tucano_front_render_1787660951887.jpg';
import c130FrontImg from '../../../assets/images/c130_front_render_1787660971492.jpg';

// Photorealistic Side Renders (Port Side)
import f16SideImg from '../../../assets/images/f16_side_render_1787665744962.jpg';
import su30SideImg from '../../../assets/images/su30_side_render_1787665782674.jpg';
import rafaleSideImg from '../../../assets/images/rafale_side_render_1787665816351.jpg';
import tucanoSideImg from '../../../assets/images/tucano_side_render_1787665889643.jpg';
import c130SideImg from '../../../assets/images/c130_side_render_1787665919296.jpg';

// Photorealistic Rear Renders (Exhaust / Afterburner)
import f16RearImg from '../../../assets/images/f16_rear_render_1787665762596.jpg';
import su30RearImg from '../../../assets/images/su30_rear_render_1787665801763.jpg';
import rafaleRearImg from '../../../assets/images/rafale_rear_render_1787665855516.jpg';
import tucanoRearImg from '../../../assets/images/tucano_rear_render_1787665904965.jpg';
import c130RearImg from '../../../assets/images/c130_rear_render_1787665938432.jpg';

// In-memory cache for keyed transparent PNG Data URLs
const transparentImageCache = new Map<string, string>();

/**
 * Custom hook to dynamically remove pure black / near-black backgrounds from the 3D render
 * ensuring zero black box boundary or container artifacts.
 */
function useTransparentAircraftImage(src: string): string {
  const [processedSrc, setProcessedSrc] = useState<string>(() => transparentImageCache.get(src) || src);

  useEffect(() => {
    if (!src) return;
    if (transparentImageCache.has(src)) {
      setProcessedSrc(transparentImageCache.get(src)!);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Auto key out black/near-black background to pure transparency (RGBA alpha = 0)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = Math.max(r, g, b);

          if (brightness < 18) {
            data[i + 3] = 0;
          } else if (brightness < 50) {
            const alphaFactor = (brightness - 18) / 32;
            data[i + 3] = Math.round(data[i + 3] * alphaFactor);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL('image/png');
        transparentImageCache.set(src, transparentDataUrl);

        if (isMounted) {
          setProcessedSrc(transparentDataUrl);
        }
      } catch (e) {
        console.warn('Transparent aircraft conversion fallback', e);
        if (isMounted) {
          setProcessedSrc(src);
        }
      }
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  return processedSrc;
}

export type InspectionViewAngle = 'front' | 'side' | 'rear';

interface FrontAircraftSilhouetteProps {
  aircraft: Aircraft;
  tailNumber?: string;
  lighting?: 'day' | 'night' | 'tactical_red' | 'cyber_blue';
  showHUDGrid?: boolean;
  activeHardpoint?: string | null;
  selectedLoadoutPreset?: string;
  wingspan?: string;
  height?: string;
  length?: string;
  portClearance?: string;
  stbdClearance?: string;
}

interface DetailCallout {
  id: string;
  title: string;
  subtitle: string;
  top: string;
  left: string;
  align?: 'left' | 'right';
}

export const FrontAircraftSilhouette: React.FC<FrontAircraftSilhouetteProps> = ({
  aircraft,
  tailNumber = 'TS-1601',
  lighting = 'cyber_blue',
  showHUDGrid = true,
  wingspan = '9.96',
  height = '5.09',
  length = '15.06'
}) => {
  const acType = aircraft.id.toLowerCase();

  // Turntable View Angle State: 'front' (0°), 'side' (90° Port Flank), 'rear' (180° Exhaust)
  const [currentAngle, setCurrentAngle] = useState<InspectionViewAngle>('front');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [showCallouts, setShowCallouts] = useState<boolean>(true);
  const [activeCallout, setActiveCallout] = useState<string | null>(null);

  // Determine angle asset sets and tactical specifications
  const aircraftData = useMemo(() => {
    let front = f16FrontImg;
    let side = f16SideImg;
    let rear = f16RearImg;
    let label = 'F-16C/D BLOCK 52+ FIGHTING FALCON';
    let engineType = 'Pratt & Whitney F100-PW-229 (29,100 lbf)';
    let radarType = 'AN/APG-83 Scalable Agile Beam AESA Radar';
    let cannonType = 'M61A1 Vulcan 20mm 6-Barrel Rotary Cannon';

    let callouts: Record<InspectionViewAngle, DetailCallout[]> = {
      front: [
        { id: 'f-radome', title: 'APG-83 SABR AESA', subtitle: 'Solid-state active electronically scanned array', top: '48%', left: '50%', align: 'left' },
        { id: 'f-canopy', title: 'BUBBLE CANOPY', subtitle: 'Single-piece frameless 360° visibility', top: '24%', left: '46%', align: 'right' },
        { id: 'f-intake', title: 'MODULAR CHIN INTAKE', subtitle: 'Direct airflow for high-AoA maneuvers', top: '68%', left: '50%', align: 'left' },
        { id: 'f-gear', title: 'NOSE GEAR & TAXI LIGHT', subtitle: 'Retractable heavy shock oleo-pneumatic strut', top: '82%', left: '54%', align: 'left' }
      ],
      side: [
        { id: 's-radome', title: 'RADOME & PITOT TUBE', subtitle: 'Streamlined supersonic low-drag nose', top: '56%', left: '12%', align: 'left' },
        { id: 's-cockpit', title: 'ACES II ZERO-ZERO SEAT', subtitle: 'Advanced pilot ejection system', top: '38%', left: '26%', align: 'right' },
        { id: 's-cannon', title: 'M61A1 VULCAN 20MM', subtitle: '6,000 rounds/min close air combat cannon', top: '46%', left: '33%', align: 'left' },
        { id: 's-gear', title: 'MAIN LANDING GEAR', subtitle: 'Hydraulic gear bay with reinforced wheels', top: '74%', left: '58%', align: 'left' },
        { id: 's-tail', title: 'ALL-MOVING VERTICAL FIN', subtitle: 'Fly-by-wire composite rudder & RWR', top: '22%', left: '84%', align: 'right' }
      ],
      rear: [
        { id: 'r-engine', title: 'F100-PW-229 AFTERBURNER', subtitle: 'Variable convergent-divergent titanium nozzle', top: '54%', left: '50%', align: 'left' },
        { id: 'r-tail', title: 'VERTICAL STABILIZER & RWR', subtitle: 'Integrated radar warning receiver cap', top: '20%', left: '48%', align: 'right' },
        { id: 'r-stabs', title: 'HORIZONTAL STABILATORS', subtitle: 'Differential pitch & roll control surfaces', top: '58%', left: '24%', align: 'right' },
        { id: 'r-dispenser', title: 'ALE-47 CHAFF/FLARE', subtitle: 'Countermeasures dispenser housing', top: '44%', left: '72%', align: 'left' }
      ]
    };

    if (acType.includes('su27') || acType.includes('su30') || acType.includes('su57') || acType.includes('sukhoi')) {
      front = su30FrontImg;
      side = su30SideImg;
      rear = su30RearImg;
      label = 'SUKHOI SU-30MK2 FLANKER-G';
      engineType = 'Twin Saturn AL-31FP Turbofans with 3D TVC';
      radarType = 'N001VEP Myech Phased Array Radar & OLS-30 IRST';
      cannonType = 'GSh-30-1 30mm Autocannon (150 rounds)';

      callouts = {
        front: [
          { id: 'su-radome', title: 'N001VEP RADAR & PITOT', subtitle: 'Long-range air-to-air tracking radome', top: '48%', left: '50%', align: 'left' },
          { id: 'su-irst', title: 'OLS-30 IRST SPHERE', subtitle: 'Electro-optical infrared target tracker', top: '35%', left: '54%', align: 'left' },
          { id: 'su-inlets', title: 'TWIN 2D AIR INTAKES', subtitle: 'Variable geometry supersonic ramps', top: '64%', left: '40%', align: 'right' },
          { id: 'su-tails', title: 'TWIN CANTED VERTICAL TAILS', subtitle: 'High directional stability at high AoA', top: '22%', left: '38%', align: 'right' }
        ],
        side: [
          { id: 'su-nose', title: 'DROOPED RADOME & IRST', subtitle: 'Downswept supersonic nose geometry', top: '54%', left: '10%', align: 'left' },
          { id: 'su-tandem', title: 'TANDEM TWO-SEAT COCKPIT', subtitle: 'K-36D-3.5M Zero-Zero Ejection Seats', top: '34%', left: '25%', align: 'right' },
          { id: 'su-gun', title: 'GSh-30-1 30MM CANNON', subtitle: 'Right wing root high-velocity autocannon', top: '48%', left: '34%', align: 'left' },
          { id: 'su-spine', title: 'LARGE DORSAL AIR BRAKE', subtitle: 'Hydraulic fuselage speedbrake panel', top: '28%', left: '52%', align: 'right' },
          { id: 'su-stinger', title: 'TAIL CONE / STINGER', subtitle: 'Rear brake parachute & auxiliary avionics', top: '44%', left: '88%', align: 'right' }
        ],
        rear: [
          { id: 'su-nozzles', title: 'TWIN AL-31FP NOZZLES', subtitle: 'Thrust vectoring variable exhaust nozzles', top: '55%', left: '50%', align: 'left' },
          { id: 'su-stinger-r', title: 'CENTRAL TAIL BOOM', subtitle: 'Drag chute compartment & rear RWR', top: '48%', left: '50%', align: 'right' },
          { id: 'su-tails-r', title: 'TWIN VERTICAL FINS', subtitle: 'Dual rudders for extreme yaw authority', top: '24%', left: '38%', align: 'right' },
          { id: 'su-wings-r', title: 'FLAPERONS & SLATS', subtitle: 'High-lift trailing edge control surfaces', top: '60%', left: '22%', align: 'right' }
        ]
      };
    } else if (acType.includes('rafale')) {
      front = rafaleFrontImg;
      side = rafaleSideImg;
      rear = rafaleRearImg;
      label = 'DASSAULT RAFALE F4 OMNIROLE';
      engineType = 'Twin Snecma M88-4E Turbofans (17,000 lbf each)';
      radarType = 'Thales RBE2 Active Electronically Scanned Array';
      cannonType = 'GIAT 30/M791 30mm Cannon (2,500 rpm)';

      callouts = {
        front: [
          { id: 'raf-rbe2', title: 'THALES RBE2 AESA RADAR', subtitle: 'Multi-target electronic scanning radar', top: '48%', left: '50%', align: 'left' },
          { id: 'raf-probe', title: 'FIXED IFR NOSE PROBE', subtitle: 'In-flight refueling probe installation', top: '30%', left: '55%', align: 'left' },
          { id: 'raf-canard', title: 'CLOSE-COUPLED CANARDS', subtitle: 'Active foreplanes for extreme pitch authority', top: '42%', left: '34%', align: 'right' },
          { id: 'raf-intakes', title: 'SEMI-CONFORMAL INLETS', subtitle: 'Kidney-shaped stealth-optimized intakes', top: '62%', left: '42%', align: 'right' }
        ],
        side: [
          { id: 'raf-nose', title: 'RBE2 NOSE CONE & OSF', subtitle: 'Optronique Secteur Frontal infrared sensor', top: '55%', left: '12%', align: 'left' },
          { id: 'raf-cockpit', title: 'SINGLE-PIECE BUBBLE CANOPY', subtitle: 'Martin-Baker Mk16 Zero-Zero Seat', top: '36%', left: '26%', align: 'right' },
          { id: 'raf-canard-s', title: 'ACTIVE FOREPLANE CANARD', subtitle: 'Variable angle vortex generation', top: '40%', left: '36%', align: 'left' },
          { id: 'raf-delta', title: 'SWEPT DELTA WING BODY', subtitle: 'Composite carbon-fiber wing structure', top: '56%', left: '60%', align: 'left' },
          { id: 'raf-tail', title: 'FIN WITH SPECTRA EW POD', subtitle: 'Integrated electronic warfare sensor suite', top: '22%', left: '80%', align: 'right' }
        ],
        rear: [
          { id: 'raf-m88', title: 'TWIN SNECMA M88 NOZZLES', subtitle: 'Low-bypass dry/afterburning turbofan exhausts', top: '56%', left: '50%', align: 'left' },
          { id: 'raf-fin-r', title: 'SPECTRA REAR DETECTOR', subtitle: '360° missile warning & laser receiver', top: '22%', left: '50%', align: 'right' },
          { id: 'raf-elevons', title: 'TWO-PIECE ELEVONS', subtitle: 'Combined elevator and aileron flight controls', top: '60%', left: '26%', align: 'right' },
          { id: 'raf-gear-r', title: 'MAIN UNDERCARRIAGE', subtitle: 'Wide-track shock absorbing main gear', top: '76%', left: '42%', align: 'right' }
        ]
      };
    } else if (acType.includes('tucano') || acType.includes('super-tucano')) {
      front = tucanoFrontImg;
      side = tucanoSideImg;
      rear = tucanoRearImg;
      label = 'EMB-314 SUPER TUCANO COIN';
      engineType = 'Pratt & Whitney PT6A-68C Turboprop (1,600 shp)';
      radarType = 'FLIR Systems Star SAFIRE III Electro-Optical / IR';
      cannonType = 'Twin 12.7mm (.50 cal) FN Herstal M3P Machine Guns';

      callouts = {
        front: [
          { id: 'tuc-prop', title: 'HARTZELL 5-BLADE PROPELLER', subtitle: 'Constant-speed reversible composite blades', top: '48%', left: '50%', align: 'left' },
          { id: 'tuc-canopy', title: 'STEPPED TANDEM CANOPY', subtitle: 'Armored glass bubble canopy with HUD', top: '30%', left: '50%', align: 'right' },
          { id: 'tuc-guns', title: 'TWIN .50 CAL M3P GUNS', subtitle: 'Internal wing-mounted heavy machine guns', top: '56%', left: '28%', align: 'right' },
          { id: 'tuc-gear', title: 'REINFORCED ROUGH-FIELD GEAR', subtitle: 'Heavy-duty suspension for unpaved runways', top: '78%', left: '50%', align: 'left' }
        ],
        side: [
          { id: 'tuc-spinner', title: 'SPINNER & SHARK NOSE ART', subtitle: 'Pratt & Whitney PT6A-68C Turboprop', top: '56%', left: '10%', align: 'left' },
          { id: 'tuc-tandem-s', title: 'MARTIN-BAKER MK10L SEATS', subtitle: 'Zero-zero tandem ejection capability', top: '36%', left: '30%', align: 'right' },
          { id: 'tuc-wing-s', title: 'LOW STRAIGHT MONOPLANE WING', subtitle: '5 external weapons hardpoints', top: '58%', left: '54%', align: 'left' },
          { id: 'tuc-tail-s', title: 'CONVENTIONAL TAIL FIN', subtitle: 'Trim tabs and high authority rudder', top: '24%', left: '85%', align: 'right' }
        ],
        rear: [
          { id: 'tuc-tail-r', title: 'VERTICAL TAIL & RUDDER', subtitle: 'High aerodynamic control authority', top: '24%', left: '50%', align: 'right' },
          { id: 'tuc-elev-r', title: 'HORIZONTAL ELEVATORS', subtitle: 'Aerodynamically balanced pitch controls', top: '52%', left: '30%', align: 'right' },
          { id: 'tuc-flaps-r', title: 'SLOTTED WING FLAPS', subtitle: 'High-lift short takeoff (STOL) capability', top: '62%', left: '70%', align: 'left' }
        ]
      };
    } else if (acType.includes('c130') || acType.includes('hercules') || acType.includes('a400m') || acType.includes('c212')) {
      front = c130FrontImg;
      side = c130SideImg;
      rear = c130RearImg;
      label = 'LOCKHEED C-130H/J HERCULES';
      engineType = '4x Rolls-Royce AE 2100D3 Turboprops (4,637 shp each)';
      radarType = 'AN/APN-241 Weather & Tactical Navigation Radar';
      cannonType = 'Tactical Heavy Cargo Ramp & Paratroop Doors';

      callouts = {
        front: [
          { id: 'c-radome', title: 'APN-241 WEATHER RADAR', subtitle: 'Bulbous forward navigation radome', top: '52%', left: '50%', align: 'left' },
          { id: 'c-deck', title: 'MULTI-PANE FLIGHT DECK', subtitle: 'Wide panoramic tactical windscreen', top: '34%', left: '50%', align: 'right' },
          { id: 'c-engines', title: '4X TURBOPROP ENGINES', subtitle: '6-blade composite propeller nacelles', top: '48%', left: '25%', align: 'right' },
          { id: 'c-sponsons', title: 'LANDING GEAR SPONSONS', subtitle: 'Fuselage sponsons for tandem main wheels', top: '72%', left: '38%', align: 'right' }
        ],
        side: [
          { id: 'c-nose-s', title: 'COCKPIT & NOSE GEAR', subtitle: 'Reinforced dual-wheel steerable nose gear', top: '60%', left: '12%', align: 'left' },
          { id: 'c-fuse-s', title: 'HEAVY CARGO CABIN', subtitle: 'Pressurized fuselage for up to 92 troops', top: '50%', left: '44%', align: 'right' },
          { id: 'c-wing-s', title: 'HIGH-MOUNTED CANTILEVER WING', subtitle: '40.41m heavy tactical wingspan', top: '38%', left: '52%', align: 'left' },
          { id: 'c-tail-s', title: 'TALL SINGLE VERTICAL EMPENNAGE', subtitle: '11.66m vertical height fin with de-icing', top: '20%', left: '85%', align: 'right' }
        ],
        rear: [
          { id: 'c-ramp', title: 'REAR CARGO RAMP & DOOR', subtitle: 'Airdrop & roll-on/roll-off loading ramp', top: '58%', left: '50%', align: 'left' },
          { id: 'c-tail-r', title: 'MASSIVE HIGH VERTICAL TAIL', subtitle: 'Elevated empennage for rear loading clearance', top: '20%', left: '50%', align: 'right' },
          { id: 'c-stabs-r', title: 'HORIZONTAL STABILIZER', subtitle: 'Elevator flight control surfaces', top: '40%', left: '26%', align: 'right' }
        ]
      };
    }

    return {
      images: {
        front,
        side,
        rear
      },
      label,
      engineType,
      radarType,
      cannonType,
      callouts
    };
  }, [acType]);

  // Key out background to transparent PNGs for all 3 angles
  const transparentFront = useTransparentAircraftImage(aircraftData.images.front);
  const transparentSide = useTransparentAircraftImage(aircraftData.images.side);
  const transparentRear = useTransparentAircraftImage(aircraftData.images.rear);

  // Active transparent image according to current angle
  const activeImage = useMemo(() => {
    switch (currentAngle) {
      case 'side':
        return transparentSide;
      case 'rear':
        return transparentRear;
      case 'front':
      default:
        return transparentFront;
    }
  }, [currentAngle, transparentFront, transparentSide, transparentRear]);

  // When aircraft changes (SELECT SQUADRON AIRCRAFT), auto animate rotating to the left!
  useEffect(() => {
    // Reset to front, then start turntable rotation to the left (Front -> Side -> Rear)
    setCurrentAngle('front');

    const t1 = setTimeout(() => {
      // Rotate left to Port Side profile (90°)
      setCurrentAngle('side');
    }, 1400);

    const t2 = setTimeout(() => {
      // Rotate further left to Rear Exhaust profile (180°)
      setCurrentAngle('rear');
    }, 3400);

    const t3 = setTimeout(() => {
      // Complete loop back to Front profile
      setCurrentAngle('front');
    }, 5400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [aircraft.id]);

  // Auto-turntable timer
  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setCurrentAngle((prev) => {
        if (prev === 'front') return 'side';
        if (prev === 'side') return 'rear';
        return 'front';
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Turn Left function
  const handleRotateLeft = () => {
    setIsAutoRotating(false);
    setCurrentAngle((prev) => {
      if (prev === 'front') return 'side'; // 0° -> 90° (turn left)
      if (prev === 'side') return 'rear';  // 90° -> 180° (turn left)
      return 'front';                      // 180° -> 0°
    });
  };

  // Turn Right function
  const handleRotateRight = () => {
    setIsAutoRotating(false);
    setCurrentAngle((prev) => {
      if (prev === 'front') return 'rear';
      if (prev === 'rear') return 'side';
      return 'front';
    });
  };

  // Dynamic tactical HUD colors based on lighting mode
  const theme = useMemo(() => {
    switch (lighting) {
      case 'tactical_red':
        return {
          glow: 'rgba(239, 68, 68, 0.4)',
          accent: '#ef4444',
          accentLight: '#fca5a5',
          border: 'rgba(239, 68, 68, 0.4)',
          bgBadge: 'rgba(127, 29, 29, 0.85)',
          reticle: 'rgba(239, 68, 68, 0.35)',
          scanner: '#f87171'
        };
      case 'night':
        return {
          glow: 'rgba(16, 185, 129, 0.4)',
          accent: '#10b981',
          accentLight: '#6ee7b7',
          border: 'rgba(16, 185, 129, 0.4)',
          bgBadge: 'rgba(6, 78, 59, 0.85)',
          reticle: 'rgba(16, 185, 129, 0.35)',
          scanner: '#34d399'
        };
      case 'day':
        return {
          glow: 'rgba(245, 158, 11, 0.4)',
          accent: '#f59e0b',
          accentLight: '#fde68a',
          border: 'rgba(245, 158, 11, 0.4)',
          bgBadge: 'rgba(120, 53, 15, 0.85)',
          reticle: 'rgba(245, 158, 11, 0.35)',
          scanner: '#fbbf24'
        };
      case 'cyber_blue':
      default:
        return {
          glow: 'rgba(6, 182, 212, 0.4)',
          accent: '#06b6d4',
          accentLight: '#a5f3fc',
          border: 'rgba(6, 182, 212, 0.4)',
          bgBadge: 'rgba(12, 74, 96, 0.85)',
          reticle: 'rgba(6, 182, 212, 0.35)',
          scanner: '#22d3ee'
        };
    }
  }, [lighting]);

  const currentCallouts = aircraftData.callouts[currentAngle] || [];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden bg-transparent">
      {/* 1. TOP 360° INSPECTION CONTROLS TOOLBAR */}
      <div className="absolute top-3 z-30 flex items-center gap-2 bg-black/80 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-2xl">
        {/* Rotate Left Button */}
        <button
          type="button"
          onClick={handleRotateLeft}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-cyan-300 hover:text-white transition-all flex items-center gap-1 text-[10px] font-mono font-bold"
          title="Putar Pesawat ke Kiri (Rotate Left)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PUTAR KIRI</span>
        </button>

        {/* Angle Presets */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => { setIsAutoRotating(false); setCurrentAngle('front'); }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1",
              currentAngle === 'front' 
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30" 
                : "text-white/60 hover:text-white"
            )}
          >
            <Compass className="w-3 h-3" />
            <span>0° DEPAN</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsAutoRotating(false); setCurrentAngle('side'); }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1",
              currentAngle === 'side' 
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30" 
                : "text-white/60 hover:text-white"
            )}
          >
            <Layers className="w-3 h-3" />
            <span>90° PROFIL KIRI</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsAutoRotating(false); setCurrentAngle('rear'); }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1",
              currentAngle === 'rear' 
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30" 
                : "text-white/60 hover:text-white"
            )}
          >
            <Eye className="w-3 h-3" />
            <span>180° BELAKANG</span>
          </button>
        </div>

        {/* Rotate Right Button */}
        <button
          type="button"
          onClick={handleRotateRight}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-cyan-300 hover:text-white transition-all flex items-center gap-1 text-[10px] font-mono font-bold"
          title="Putar Pesawat ke Kanan (Rotate Right)"
        >
          <span className="hidden sm:inline">PUTAR KANAN</span>
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-white/15 mx-0.5" />

        {/* 360° Auto Play / Pause */}
        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={cn(
            "px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold transition-all flex items-center gap-1.5",
            isAutoRotating 
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 animate-pulse" 
              : "bg-white/10 text-white/70 hover:text-white"
          )}
          title="Toggle 360° Turntable Auto Rotation"
        >
          {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>360° {isAutoRotating ? 'AUTO ACTIVE' : 'INSPECT'}</span>
        </button>

        {/* Toggle Callout Pins */}
        <button
          type="button"
          onClick={() => setShowCallouts(!showCallouts)}
          className={cn(
            "p-1.5 rounded-xl text-[9px] font-mono transition-all",
            showCallouts ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-white/40 hover:text-white"
          )}
          title="Toggle Technical Detail Callout Pins"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. REALISTIC AIRCRAFT RENDER WITH TURNTABLE ROTATION ANIMATION */}
      <div className="relative z-10 w-full max-w-[840px] h-[340px] flex items-center justify-center pointer-events-none bg-transparent">
        {/* Soft under-fuselage ambient glow */}
        <div 
          className="absolute bottom-2 w-[70%] h-8 rounded-full blur-2xl pointer-events-none opacity-30 transition-all duration-700"
          style={{ backgroundColor: theme.glow }}
        />

        {/* Animated Turntable Stage Base */}
        <div className="absolute bottom-1 w-[75%] max-w-[620px] h-6 rounded-full border border-dashed border-cyan-400/20 flex items-center justify-center opacity-40">
          <div className="w-[85%] h-3 rounded-full border border-cyan-400/30" />
        </div>

        {/* Photorealistic Aircraft Multi-Angle Image with Smooth 3D Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${aircraft.id}-${currentAngle}`}
            initial={{ 
              opacity: 0, 
              scale: 0.92, 
              rotateY: currentAngle === 'side' ? -35 : currentAngle === 'rear' ? -50 : 35 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateY: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.94, 
              rotateY: currentAngle === 'front' ? -35 : 35 
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex items-center justify-center"
          >
            <img 
              src={activeImage}
              alt={`${aircraft.name} ${currentAngle} view`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain pointer-events-none select-none bg-transparent"
              style={{
                mixBlendMode: 'screen',
                opacity: 0.96,
                filter: 'drop-shadow(0 0 15px rgba(0, 229, 255, 0.2))'
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* 3. INTERACTIVE TECHNICAL DETAIL CALLOUT PINS */}
        {showCallouts && (
          <AnimatePresence>
            {currentCallouts.map((callout) => {
              const isHovered = activeCallout === callout.id;
              return (
                <motion.div
                  key={callout.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="absolute pointer-events-auto z-30"
                  style={{ top: callout.top, left: callout.left }}
                  onMouseEnter={() => setActiveCallout(callout.id)}
                  onMouseLeave={() => setActiveCallout(null)}
                >
                  {/* Glowing Radar Target Pin */}
                  <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                    <span 
                      className="absolute w-6 h-6 rounded-full animate-ping opacity-60"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <span 
                      className="w-3.5 h-3.5 rounded-full border-2 bg-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-125"
                      style={{ borderColor: theme.accent }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                    </span>

                    {/* Detail Information Tag */}
                    <div 
                      className={cn(
                        "absolute z-40 whitespace-nowrap bg-black/90 backdrop-blur-md border px-2.5 py-1 rounded-lg shadow-2xl transition-all duration-300 pointer-events-none",
                        callout.align === 'right' ? 'right-5 top-1/2 -translate-y-1/2' : 'left-5 top-1/2 -translate-y-1/2',
                        isHovered ? 'scale-105 border-cyan-400 opacity-100' : 'opacity-85 border-white/10'
                      )}
                      style={{ borderColor: isHovered ? theme.accent : 'rgba(255,255,255,0.15)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-black tracking-wide" style={{ color: theme.accentLight }}>
                          {callout.title}
                        </span>
                      </div>
                      <p className="text-[8px] font-mono text-white/60">
                        {callout.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* 4. MILITARY SCANNER HUD OVERLAY (CLEAN RETICLES & CALLOUTS - NO WINGSPAN LINE) */}
      {showHUDGrid && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          {/* Circular Radome & Radar Reticles */}
          <div 
            className="w-[440px] h-[440px] rounded-full border animate-[spin_90s_linear_infinite]"
            style={{ borderColor: theme.reticle }}
          />
          <div 
            className="w-[620px] h-[620px] rounded-full border border-dashed opacity-40"
            style={{ borderColor: theme.reticle }}
          />

          {/* Perspective Angle Compass Indicator Badge */}
          <div className="absolute top-[16%] right-[10%] flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <Target className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <div className="text-right">
              <span className="text-[8px] font-mono text-white/50 block">TURNTABLE PERSPECTIVE</span>
              <span className="text-[10px] font-mono font-black text-cyan-300 tracking-wider">
                {currentAngle === 'front' && '0° BOW (FRONTAL BORESIGHT)'}
                {currentAngle === 'side' && '90° PORT FLANK (PROFILE)'}
                {currentAngle === 'rear' && '180° STERN (AFTERBURNER)'}
              </span>
            </div>
          </div>

          {/* Bottom Left Scanner Airframe Data Card */}
          <div className="absolute bottom-5 left-8 z-30 flex items-center gap-3.5 bg-black/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl border shadow-2xl" style={{ borderColor: theme.border }}>
            <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: theme.accent, color: theme.accent }} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-black text-white tracking-wide">{tailNumber}</span>
                <span 
                  className="text-[8px] font-mono font-black px-2 py-0.5 rounded border uppercase"
                  style={{ backgroundColor: theme.bgBadge, borderColor: theme.accent, color: theme.accentLight }}
                >
                  DOCK 01 • {currentAngle.toUpperCase()} INSPECT
                </span>
              </div>
              <p className="text-[9px] font-mono text-white/60 font-semibold mt-0.5">
                {aircraftData.label}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[8px] font-mono text-white/40">
                <span>L: {length}M</span>
                <span>•</span>
                <span>H: {height}M</span>
                <span>•</span>
                <span>W: {wingspan}M</span>
              </div>
            </div>
          </div>

          {/* Bottom Right System Avionics Badge */}
          <div className="hidden md:flex absolute bottom-5 right-8 z-30 flex-col items-end gap-1 bg-black/85 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-white/10 text-[8px] font-mono">
            <span className="text-white/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              PROPULSION / RADAR
            </span>
            <span className="text-white/80 font-bold">{aircraftData.engineType}</span>
            <span className="text-cyan-300/80">{aircraftData.radarType}</span>
          </div>
        </div>
      )}
    </div>
  );
};
