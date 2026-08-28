import React from 'react';
import { Circle } from 'react-leaflet';
import { Position } from '../types';

interface RadarSweepProps {
  active: boolean;
  currentPos: Position | null;
}

export function RadarSweep({ active, currentPos }: RadarSweepProps) {
  if (!active || !currentPos) return null;
  return (
    <Circle 
      center={[currentPos.lat, currentPos.lng]} 
      radius={200000} 
      pathOptions={{ color: '#22c55e', weight: 1, fillOpacity: 0.05, dashArray: '5, 10' }} 
    />
  );
}
