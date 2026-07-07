export type StageStatus = 'upcoming' | 'today' | 'completed';

export type RoutePointCategory =
  | 'depart-fictif'
  | 'depart-reel'
  | 'arrivee'
  | 'pc'
  | 'pm'
  | 'ravitaillement-ouvert'
  | 'ravitaillement-ferme'
  | 'km-5'
  | 'km-3'
  | 'km-1';

export interface PassageTimes {
  averageKmh: number;
  time: string;
}

export interface RoutePoint {
  id: string;
  category: RoutePointCategory;
  label: string;
  municipality?: string;
  kilometer: number;
  coordinates: [number, number];
  passageTimes?: PassageTimes[];
  note?: string;
}

export interface Stage {
  id: string;
  number: number;
  date: string;
  title: string;
  start: string;
  finish: string;
  distanceKm: number;
  gatheringTime?: string;
  callTime?: string;
  neutralStartTime?: string;
  realStartTime?: string;
  passageAverages: number[];
  indications: string[];
  routeGeoJsonUrl: string;
  points: RoutePoint[];
}

export interface LiveEntity {
  id: string;
  label: string;
  kind: 'peloton' | 'echappee' | 'direction' | 'medical' | 'moto';
  coordinates: [number, number];
  speedKmh?: number;
  heading?: number;
  updatedAt: string;
}
