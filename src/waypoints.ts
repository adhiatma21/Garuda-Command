export interface WaypointData {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const INTERNATIONAL_WAYPOINTS: WaypointData[] = [
  // Indonesia
  { id: 'MATAR', name: 'MATAR', lat: -6.12, lng: 106.65 },
  { id: 'DOLTA', name: 'DOLTA', lat: -5.50, lng: 105.50 },
  { id: 'GOSPA', name: 'GOSPA', lat: -6.50, lng: 107.50 },
  { id: 'BUNAS', name: 'BUNAS', lat: -7.50, lng: 110.50 },
  { id: 'SURAB', name: 'SURAB', lat: -7.38, lng: 112.78 },
  { id: 'PANGK', name: 'PANGK', lat: -1.15, lng: 116.85 },
  { id: 'MAKAS', name: 'MAKAS', lat: -5.06, lng: 119.55 },
  { id: 'DENPA', name: 'DENPA', lat: -8.75, lng: 115.17 },
  { id: 'MEDAN', name: 'MEDAN', lat: 3.64, lng: 98.68 },
  { id: 'BATAM', name: 'BATAM', lat: 1.12, lng: 104.12 },

  // Japan
  { id: 'KASMI', name: 'KASMI', lat: 35.50, lng: 140.50 },
  { id: 'URAGA', name: 'URAGA', lat: 35.20, lng: 139.70 },
  { id: 'OSHIMA', name: 'OSHIMA', lat: 34.70, lng: 139.40 },
  { id: 'MIYAKE', name: 'MIYAKE', lat: 34.07, lng: 139.56 },
  { id: 'HACHI', name: 'HACHI', lat: 33.11, lng: 139.78 },
  { id: 'NARIT', name: 'NARIT', lat: 35.76, lng: 140.38 },
  { id: 'HANED', name: 'HANED', lat: 35.55, lng: 139.78 },

  // Korea
  { id: 'ANYANG', name: 'ANYANG', lat: 37.40, lng: 126.90 },
  { id: 'BULLS', name: 'BULLS', lat: 36.50, lng: 127.50 },
  { id: 'OSAN', name: 'OSAN', lat: 37.09, lng: 127.03 },
  { id: 'KUNSAN', name: 'KUNSAN', lat: 35.90, lng: 126.62 },

  // Southeast Asia
  { id: 'CHANGI', name: 'CHANGI', lat: 1.36, lng: 103.99 },
  { id: 'KLIA', name: 'KLIA', lat: 2.74, lng: 101.71 },
  { id: 'BANGK', name: 'BANGK', lat: 13.69, lng: 100.75 },
  { id: 'MANIL', name: 'MANIL', lat: 14.51, lng: 121.02 },
  { id: 'SAIGO', name: 'SAIGO', lat: 10.82, lng: 106.66 },

  // Australia
  { id: 'SYDNE', name: 'SYDNE', lat: -33.94, lng: 151.17 },
  { id: 'MELBO', name: 'MELBO', lat: -37.67, lng: 144.84 },
  { id: 'PERTH', name: 'PERTH', lat: -31.94, lng: 115.97 },
  { id: 'DARWI', name: 'DARWI', lat: -12.41, lng: 130.88 },

  // USA
  { id: 'JFK', name: 'JFK', lat: 40.64, lng: -73.78 },
  { id: 'LAX', name: 'LAX', lat: 33.94, lng: -118.40 },
  { id: 'ORD', name: 'ORD', lat: 41.97, lng: -87.90 },
  { id: 'SFO', name: 'SFO', lat: 37.62, lng: -122.37 },
  { id: 'HNL', name: 'HNL', lat: 21.32, lng: -157.92 },
  { id: 'ANC', name: 'ANC', lat: 61.17, lng: -149.99 },

  // Europe
  { id: 'LHR', name: 'LHR', lat: 51.47, lng: -0.45 },
  { id: 'CDG', name: 'CDG', lat: 49.01, lng: 2.55 },
  { id: 'FRA', name: 'FRA', lat: 50.03, lng: 8.57 },
  { id: 'AMS', name: 'AMS', lat: 52.31, lng: 4.76 },
  { id: 'MAD', name: 'MAD', lat: 40.49, lng: -3.57 },
  { id: 'FCO', name: 'FCO', lat: 41.80, lng: 12.24 },

  // Middle East
  { id: 'DXB', name: 'DXB', lat: 25.25, lng: 55.36 },
  { id: 'DOH', name: 'DOH', lat: 25.27, lng: 51.61 },
  { id: 'AUH', name: 'AUH', lat: 24.43, lng: 54.65 },
  { id: 'RUH', name: 'RUH', lat: 24.96, lng: 46.70 },

  // Africa
  { id: 'JNB', name: 'JNB', lat: -26.13, lng: 28.24 },
  { id: 'CAI', name: 'CAI', lat: 30.12, lng: 31.40 },
  { id: 'LOS', name: 'LOS', lat: 6.57, lng: 3.32 },

  // South America
  { id: 'GRU', name: 'GRU', lat: -23.43, lng: -46.47 },
  { id: 'EZE', name: 'EZE', lat: -34.82, lng: -58.53 },
  { id: 'SCL', name: 'SCL', lat: -33.39, lng: -70.79 },

  // Random Oceanic/Strategic Waypoints
  { id: 'WAY01', name: 'WAY01', lat: 10.0, lng: 100.0 },
  { id: 'WAY02', name: 'WAY02', lat: 20.0, lng: 110.0 },
  { id: 'WAY03', name: 'WAY03', lat: 30.0, lng: 120.0 },
  { id: 'WAY04', name: 'WAY04', lat: 40.0, lng: 130.0 },
  { id: 'WAY05', name: 'WAY05', lat: 50.0, lng: 140.0 },
  { id: 'MIDWA', name: 'MIDWA', lat: 28.21, lng: -177.37 },
  { id: 'WAKE', name: 'WAKE', lat: 19.28, lng: 166.64 },
  { id: 'GUAM', name: 'GUAM', lat: 13.48, lng: 144.80 },
  { id: 'DIEGO', name: 'DIEGO', lat: -7.31, lng: 72.41 },
  { id: 'AZORE', name: 'AZORE', lat: 38.75, lng: -27.08 },
];
