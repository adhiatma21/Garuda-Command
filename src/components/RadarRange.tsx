import React from 'react';
import { Circle, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { MilitaryAirport } from '../airports';

interface RadarRangeProps {
  airport: MilitaryAirport;
  rotation: number;
  offset: number;
}

export const RadarRange: React.FC<RadarRangeProps> = ({ airport, rotation, offset }) => {
  const currentRotation = (rotation + offset) % 360;
  return (
    <>
      <Circle 
        center={[airport.lat, airport.lng]} 
        radius={150000} // 150km radius
        pathOptions={{ 
          color: '#4b5563', 
          fillColor: '#4b5563', 
          fillOpacity: 0.03, 
          weight: 0.3,
          dashArray: '3, 5'
        }} 
      />
      <Polyline 
        positions={[
          [airport.lat, airport.lng],
          [
            airport.lat + (1.35 * Math.cos(currentRotation * Math.PI / 180)),
            airport.lng + (1.35 * Math.sin(currentRotation * Math.PI / 180))
          ]
        ]}
        pathOptions={{ 
          color: '#6b7280', 
          weight: 0.5, 
          opacity: 0.3 
        }}
      />
      <CircleMarker 
        center={[airport.lat, airport.lng]} 
        radius={3} 
        pathOptions={{ color: '#6b7280', fillColor: '#6b7280', fillOpacity: 0.8 }}
      >
        <Tooltip direction="top" offset={[0, -5]} opacity={1} permanent={false}>
          <div className="bg-[#0c111a] border border-green-500/30 p-2 rounded text-[10px] font-mono text-green-400">
            <p className="font-bold">RADAR STATION: {airport.icao}</p>
            <p className="text-[8px] opacity-60">RANGE: 150 NM | STATUS: ACTIVE</p>
          </div>
        </Tooltip>
      </CircleMarker>
    </>
  );
};
