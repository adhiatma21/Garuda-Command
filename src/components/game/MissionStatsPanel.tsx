import React from 'react';
import { StatItem } from '../ui/Buttons';

interface MissionStatsPanelProps {
  points: number;
  fuelRemaining: number;
  flightHours: number;
  missionType: string;
}

export const MissionStatsPanel: React.FC<MissionStatsPanelProps> = ({
  points,
  fuelRemaining,
  flightHours,
  missionType
}) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <StatItem label="Mission Points" value={points} unit="PTS" />
      <StatItem label="Fuel Remaining" value={Math.round(fuelRemaining)} unit="LBS" />
      <StatItem label="Flight Hours" value={flightHours.toFixed(1)} unit="HRS" />
      <StatItem label="Mission Type" value={missionType === 'VVIPEscort' ? 'VVIP' : 'TAC'} unit="TYPE" />
    </div>
  );
};
