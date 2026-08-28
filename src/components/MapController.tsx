import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Waypoint, Position } from '../types';

interface MapControllerProps {
  currentPos: Position | null;
  waypoints: Waypoint[];
  autoTrack?: boolean;
  setAutoTrack?: (val: boolean) => void;
  centerTrigger?: number;
  zoomInTrigger?: number;
  zoomOutTrigger?: number;
}

export function MapController({
  currentPos,
  waypoints,
  autoTrack = true,
  setAutoTrack,
  centerTrigger = 0,
  zoomInTrigger = 0,
  zoomOutTrigger = 0
}: MapControllerProps) {
  const map = useMap();
  const lastCenterTriggerRef = useRef(centerTrigger);
  const lastZoomInTriggerRef = useRef(zoomInTrigger);
  const lastZoomOutTriggerRef = useRef(zoomOutTrigger);

  // Detect user manual interaction (drag, touch) to smoothly disable auto-tracking
  useEffect(() => {
    const handleUserMapInteraction = () => {
      if (setAutoTrack && autoTrack) {
        setAutoTrack(false);
      }
    };

    map.on('dragstart', handleUserMapInteraction);

    return () => {
      map.off('dragstart', handleUserMapInteraction);
    };
  }, [map, autoTrack, setAutoTrack]);

  // Center on aircraft trigger
  useEffect(() => {
    if (centerTrigger > 0 && centerTrigger !== lastCenterTriggerRef.current) {
      lastCenterTriggerRef.current = centerTrigger;
      if (currentPos) {
        map.flyTo([currentPos.lat, currentPos.lng], Math.max(map.getZoom(), 7), {
          animate: true,
          duration: 0.8
        });
      } else if (waypoints.length > 0) {
        map.flyTo([waypoints[0].lat, waypoints[0].lng], 6, {
          animate: true,
          duration: 0.8
        });
      }
    }
  }, [centerTrigger, currentPos, waypoints, map]);

  // Zoom In trigger
  useEffect(() => {
    if (zoomInTrigger > 0 && zoomInTrigger !== lastZoomInTriggerRef.current) {
      lastZoomInTriggerRef.current = zoomInTrigger;
      map.zoomIn(1, { animate: true });
    }
  }, [zoomInTrigger, map]);

  // Zoom Out trigger
  useEffect(() => {
    if (zoomOutTrigger > 0 && zoomOutTrigger !== lastZoomOutTriggerRef.current) {
      lastZoomOutTriggerRef.current = zoomOutTrigger;
      map.zoomOut(1, { animate: true });
    }
  }, [zoomOutTrigger, map]);

  // When autoTrack is enabled, smoothly follow the aircraft
  useEffect(() => {
    if (autoTrack && currentPos) {
      map.panTo([currentPos.lat, currentPos.lng], { 
        animate: true, 
        duration: 0.7, 
        easeLinearity: 0.25 
      });
    } else if (!currentPos && waypoints.length > 0) {
      map.setView([waypoints[0].lat, waypoints[0].lng], 4, { animate: true });
    }
  }, [currentPos, autoTrack, map, waypoints]);

  return null;
}
