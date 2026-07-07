import type { PassageTimes, RoutePoint, RoutePointCategory, Stage } from '../types';

type Coord = [number, number];

interface StageSeed {
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
  averages: number[];
  route: Coord[];
  points: PointSeed[];
}

interface PointSeed {
  category: RoutePointCategory;
  label: string;
  kilometer: number;
  route?: string;
  times?: string[];
  note?: string;
}

const commune: Record<string, Coord> = {
  fortDeFrance: [-61.0742, 14.6037],
  riviereSalee: [-60.9775, 14.5271],
  marin: [-60.8692, 14.4726],
  grosMorne: [-61.0065, 14.7007],
  sainteAnne: [-60.8789, 14.4359],
  macouba: [-61.1435, 14.8758],
  lorrain: [-61.0638, 14.8329],
  sainteMarie: [-60.9941, 14.7831],
  francois: [-60.9029, 14.6162],
  saintEsprit: [-60.9359, 14.5581],
  rivierePilote: [-60.9023, 14.4863],
  laRenee: [-60.921, 14.525],
  ducos: [-60.974, 14.576]
};

function passageTimes(averages: number[], times?: string[]): PassageTimes[] | undefined {
  if (!times) return undefined;
  return averages.map((averageKmh, index) => ({ averageKmh, time: times[index] ?? times[times.length - 1] }));
}

function interpolate(route: Coord[], progress: number): Coord {
  if (route.length === 1) return route[0];
  const clamped = Math.max(0, Math.min(1, progress));
  const scaled = clamped * (route.length - 1);
  const index = Math.min(route.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const [lonA, latA] = route[index];
  const [lonB, latB] = route[index + 1];
  const bend = Math.sin(clamped * Math.PI * 2) * 0.012;
  return [lonA + (lonB - lonA) * local + bend, latA + (latB - latA) * local - bend * 0.35];
}

function makeStage(seed: StageSeed): Stage {
  return {
    id: seed.id,
    number: seed.number,
    date: seed.date,
    title: seed.title,
    start: seed.start,
    finish: seed.finish,
    distanceKm: seed.distanceKm,
    gatheringTime: seed.gatheringTime,
    callTime: seed.callTime,
    neutralStartTime: seed.neutralStartTime,
    realStartTime: seed.realStartTime,
    passageAverages: seed.averages,
    routeGeoJsonUrl: `/routes/${seed.id}.geojson`,
    indications: [],
    points: seed.points.map((point, index): RoutePoint => ({
      id: `${seed.id}-p${index + 1}`,
      category: point.category,
      label: point.label,
      kilometer: point.kilometer,
      coordinates: interpolate(seed.route, seed.distanceKm === 0 ? 0 : point.kilometer / seed.distanceKm),
      passageTimes: passageTimes(seed.averages, point.times),
      note: point.note,
      municipality: point.label
    }))
  };
}

const seeds: StageSeed[] = [
  {
    id: 'prologue',
    number: 0,
    date: '2026-07-03',
    title: 'Prologue - Fort-de-France / Fort-de-France',
    start: 'Fort-de-France',
    finish: 'Fort-de-France',
    distanceKm: 4.2,
    gatheringTime: '12:00',
    callTime: '14:45',
    realStartTime: '15:00',
    averages: [39, 41],
    route: [commune.fortDeFrance, [-61.062, 14.615], commune.fortDeFrance],
    points: [
      { category: 'depart-reel', label: 'Depart reel - RD42', kilometer: 0, times: ['15:00', '15:00'] },
      { category: 'arrivee', label: 'Arrivee face Direction de la Mer', kilometer: 4.2, times: ['15:06', '15:06'] }
    ]
  },
  {
    id: 'stage-01',
    number: 1,
    date: '2026-07-04',
    title: 'Etape 1 - Riviere-Salee / Marin',
    start: 'Riviere-Salee',
    finish: 'Marin',
    distanceKm: 128.8,
    gatheringTime: '08:00',
    callTime: '09:40',
    neutralStartTime: '09:50',
    realStartTime: '10:00',
    averages: [37, 39],
    route: [commune.riviereSalee, commune.ducos, commune.francois, commune.riviereSalee, commune.sainteAnne, commune.marin],
    points: [
      { category: 'depart-fictif', label: 'Depart fictif', kilometer: 0, times: ['09:50', '09:50'] },
      { category: 'depart-reel', label: 'Depart reel - RN5', kilometer: 0, times: ['10:00', '10:00'] },
      { category: 'pc', label: 'PC1', kilometer: 6.4, times: ['10:10', '10:09'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 33.9, times: ['10:54', '10:52'] },
      { category: 'pc', label: 'PC2 Station Total', kilometer: 48.3, times: ['11:18', '11:14'] },
      { category: 'pm', label: 'PM3', kilometer: 51.3, times: ['11:23', '11:18'] },
      { category: 'pm', label: 'PM3', kilometer: 84.9, times: ['12:17', '12:10'] },
      { category: 'pc', label: 'PC3', kilometer: 94.3, times: ['12:32', '12:25'] },
      { category: 'ravitaillement-ferme', label: 'Ravito ferme', kilometer: 112.4, times: ['13:02', '12:52'] },
      { category: 'km-5', label: '5 km', kilometer: 123.8, times: ['13:20', '13:10'] },
      { category: 'km-3', label: '3 km', kilometer: 124.9, times: ['13:22', '13:12'] },
      { category: 'km-1', label: '1 km', kilometer: 127.8, times: ['13:27', '13:16'] },
      { category: 'arrivee', label: 'Arrivee face ex-ecole mixte A', kilometer: 128.8, times: ['13:28', '13:18'] }
    ]
  },
  {
    id: 'stage-02',
    number: 2,
    date: '2026-07-05',
    title: 'Etape 2 - Marin / Gros-Morne',
    start: 'Marin',
    finish: 'Gros-Morne',
    distanceKm: 122,
    gatheringTime: '08:30',
    callTime: '09:40',
    neutralStartTime: '09:50',
    realStartTime: '10:00',
    averages: [37, 39],
    route: [commune.marin, commune.sainteAnne, commune.ducos, commune.francois, commune.grosMorne],
    points: [
      { category: 'depart-fictif', label: 'Depart fictif', kilometer: 0, times: ['09:50', '09:50'] },
      { category: 'depart-reel', label: 'Depart reel - RD9', kilometer: 0, times: ['10:00', '10:00'] },
      { category: 'pc', label: 'PC1 Station Esso', kilometer: 6, times: ['10:09', '10:09'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 34.5, times: ['10:55', '10:53'] },
      { category: 'pc', label: 'PC2', kilometer: 50.7, times: ['11:22', '11:18'] },
      { category: 'pm', label: 'PM3', kilometer: 59.4, times: ['11:36', '11:31'] },
      { category: 'pm', label: 'PM3', kilometer: 68.3, times: ['11:50', '11:45'] },
      { category: 'pc', label: 'PC3', kilometer: 93.6, times: ['12:31', '12:24'] },
      { category: 'pm', label: 'PM3', kilometer: 94.8, times: ['12:33', '12:25'] },
      { category: 'ravitaillement-ferme', label: 'Ravito ferme', kilometer: 104.7, times: ['12:49', '12:41'] },
      { category: 'km-5', label: '5 km', kilometer: 117, times: ['13:09', '13:00'] },
      { category: 'pm', label: 'PM3', kilometer: 117.8, times: ['13:11', '13:01'] },
      { category: 'km-3', label: '3 km', kilometer: 119, times: ['13:12', '13:03'] },
      { category: 'km-1', label: '1 km', kilometer: 121, times: ['13:16', '13:06'] },
      { category: 'arrivee', label: 'Arrivee face Carrefour Market', kilometer: 122, times: ['13:17', '13:07'] }
    ]
  },
  {
    id: 'stage-03',
    number: 3,
    date: '2026-07-06',
    title: 'Etape 3 - Sainte-Anne / Macouba',
    start: 'Sainte-Anne',
    finish: 'Macouba',
    distanceKm: 115.2,
    gatheringTime: '08:30',
    callTime: '09:40',
    neutralStartTime: '09:50',
    realStartTime: '10:00',
    averages: [37, 39],
    route: [commune.sainteAnne, commune.riviereSalee, commune.fortDeFrance, [-61.17, 14.75], commune.macouba],
    points: [
      { category: 'depart-fictif', label: 'Depart fictif', kilometer: 0, times: ['09:50', '09:50'] },
      { category: 'depart-reel', label: 'Depart reel - RD9A', kilometer: 0, times: ['10:00', '10:00'] },
      { category: 'pc', label: 'PC1 Station Total', kilometer: 7.2, times: ['10:11', '10:11'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 32.7, times: ['10:53', '10:50'] },
      { category: 'pc', label: 'PC2', kilometer: 39.3, times: ['11:03', '11:00'] },
      { category: 'pc', label: 'PC3 Stade', kilometer: 56.3, times: ['11:31', '11:26'] },
      { category: 'pm', label: 'PM2', kilometer: 66.6, times: ['11:48', '11:42'] },
      { category: 'pm', label: 'PM2', kilometer: 75.9, times: ['12:03', '11:56'] },
      { category: 'pm', label: 'PM2', kilometer: 94.1, times: ['12:32', '12:24'] },
      { category: 'km-5', label: '5 km', kilometer: 110.2, times: ['12:58', '12:49'] },
      { category: 'km-3', label: '3 km', kilometer: 112.2, times: ['13:01', '12:52'] },
      { category: 'km-1', label: '1 km', kilometer: 114.2, times: ['13:05', '12:55'] },
      { category: 'arrivee', label: 'Arrivee 50 pas', kilometer: 115.2, times: ['13:06', '12:57'] }
    ]
  },
  {
    id: 'stage-04',
    number: 4,
    date: '2026-07-07',
    title: 'Etape 4 - Fort-de-France / Lorrain',
    start: 'Fort-de-France',
    finish: 'Lorrain',
    distanceKm: 108.5,
    gatheringTime: '08:30',
    callTime: '09:40',
    neutralStartTime: '09:50',
    realStartTime: '10:00',
    averages: [37, 39],
    route: [commune.fortDeFrance, [-61.04, 14.67], commune.grosMorne, [-60.96, 14.74], commune.lorrain],
    points: [
      { category: 'depart-fictif', label: 'Depart fictif', kilometer: 0, times: ['09:50', '09:50'] },
      { category: 'depart-reel', label: 'Depart reel - RD13', kilometer: 0, times: ['10:00', '10:00'] },
      { category: 'pc', label: 'PC1', kilometer: 9.3, times: ['10:15', '10:14'] },
      { category: 'pc', label: 'PC2', kilometer: 25.8, times: ['10:41', '10:39'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 31, times: ['10:50', '10:47'] },
      { category: 'pm', label: 'PM2', kilometer: 34.2, times: ['10:55', '10:52'] },
      { category: 'pm', label: 'PM3', kilometer: 41.7, times: ['11:07', '11:04'] },
      { category: 'pm', label: 'PM2', kilometer: 51.2, times: ['11:23', '11:18'] },
      { category: 'pc', label: 'PC3', kilometer: 66.1, times: ['11:47', '11:41'] },
      { category: 'pm', label: 'PM3', kilometer: 82.6, times: ['12:13', '12:07'] },
      { category: 'ravitaillement-ferme', label: 'Ravito ferme', kilometer: 90, times: ['12:25', '12:18'] },
      { category: 'pm', label: 'PM3', kilometer: 91.4, times: ['12:28', '12:20'] },
      { category: 'km-3', label: '3 km', kilometer: 104, times: ['12:48', '12:40'] },
      { category: 'km-1', label: '1 km', kilometer: 107.5, times: ['12:54', '12:45'] },
      { category: 'arrivee', label: 'Arrivee mairie du Lorrain', kilometer: 108.5, times: ['12:55', '12:46'] }
    ]
  },
  {
    id: 'stage-05',
    number: 5,
    date: '2026-07-08',
    title: 'Etape 5 - Lorrain / Sainte-Marie',
    start: 'Lorrain',
    finish: 'Sainte-Marie',
    distanceKm: 120.1,
    gatheringTime: '08:30',
    callTime: '09:40',
    neutralStartTime: '09:50',
    realStartTime: '10:00',
    averages: [37, 39],
    route: [commune.lorrain, commune.grosMorne, commune.francois, commune.saintEsprit, commune.sainteMarie],
    points: [
      { category: 'depart-fictif', label: 'Depart fictif', kilometer: 0, times: ['09:50', '09:50'] },
      { category: 'depart-reel', label: 'Depart reel - RN1', kilometer: 0, times: ['10:00', '10:00'] },
      { category: 'pm', label: 'PM2', kilometer: 7.7, times: ['10:12', '10:11'] },
      { category: 'pc', label: 'PC1', kilometer: 11.8, times: ['10:19', '10:18'] },
      { category: 'pm', label: 'PM3', kilometer: 18.1, times: ['10:29', '10:27'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 30.2, times: ['10:48', '10:46'] },
      { category: 'pc', label: 'PC2 Station Total', kilometer: 46, times: ['11:14', '11:10'] },
      { category: 'pm', label: 'PM3', kilometer: 51.9, times: ['11:24', '11:19'] },
      { category: 'pm', label: 'PM3', kilometer: 78.5, times: ['12:07', '12:00'] },
      { category: 'pc', label: 'PC3', kilometer: 91, times: ['12:27', '12:20'] },
      { category: 'ravitaillement-ferme', label: 'Ravito ferme', kilometer: 103.1, times: ['12:47', '12:38'] },
      { category: 'pm', label: 'PM2', kilometer: 106.3, times: ['12:52', '12:43'] },
      { category: 'km-5', label: '5 km', kilometer: 115.3, times: ['13:06', '12:57'] },
      { category: 'km-3', label: '3 km', kilometer: 117.1, times: ['13:09', '13:00'] },
      { category: 'km-1', label: '1 km', kilometer: 119.2, times: ['13:13', '13:03'] },
      { category: 'arrivee', label: 'Arrivee rue E. Desproges', kilometer: 120.1, times: ['13:14', '13:04'] }
    ]
  },
  {
    id: 'stage-06',
    number: 6,
    date: '2026-07-09',
    title: 'Etape 6 - Sainte-Marie / Francois',
    start: 'Sainte-Marie',
    finish: 'Francois',
    distanceKm: 117.7,
    gatheringTime: '08:30',
    callTime: '09:45',
    realStartTime: '10:00',
    averages: [37, 39],
    route: [commune.sainteMarie, commune.ducos, commune.marin, commune.francois],
    points: [
      { category: 'depart-reel', label: 'Depart reel - RN1', kilometer: 0, times: ['10:00', '10:00'] },
      { category: 'pm', label: 'PM3', kilometer: 6.9, times: ['10:11', '10:10'] },
      { category: 'pc', label: 'PC1', kilometer: 10.2, times: ['10:16', '10:15'] },
      { category: 'pm', label: 'PM2', kilometer: 14.5, times: ['10:23', '10:22'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 31.5, times: ['10:51', '10:48'] },
      { category: 'pm', label: 'PM3', kilometer: 36.1, times: ['10:58', '10:55'] },
      { category: 'pc', label: 'PC2 Station Total', kilometer: 43.3, times: ['11:10', '11:06'] },
      { category: 'pm', label: 'PM3', kilometer: 45.2, times: ['11:13', '11:09'] },
      { category: 'pm', label: 'PM3', kilometer: 64.5, times: ['11:44', '11:39'] },
      { category: 'pc', label: 'PC3 Station Total', kilometer: 78.2, times: ['12:06', '12:00'] },
      { category: 'ravitaillement-ferme', label: 'Ravito ferme', kilometer: 100.7, times: ['12:43', '12:34'] },
      { category: 'km-5', label: '5 km', kilometer: 112.5, times: ['13:02', '12:53'] },
      { category: 'km-3', label: '3 km', kilometer: 114.7, times: ['13:06', '12:56'] },
      { category: 'km-1', label: '1 km', kilometer: 116.7, times: ['13:09', '12:59'] },
      { category: 'arrivee', label: 'Arrivee place des Fetes', kilometer: 117.7, times: ['13:10', '13:01'] }
    ]
  },
  {
    id: 'stage-07',
    number: 7,
    date: '2026-07-10',
    title: 'Etape 7 - Francois / Saint-Esprit',
    start: 'Francois',
    finish: 'Saint-Esprit',
    distanceKm: 135.7,
    gatheringTime: '08:30',
    callTime: '09:40',
    realStartTime: '10:00',
    averages: [37, 39],
    route: [commune.francois, commune.riviereSalee, [-61.08, 14.5], commune.saintEsprit, commune.francois, commune.saintEsprit],
    points: [
      { category: 'depart-reel', label: 'Depart reel - RD6', kilometer: 0, times: ['10:00', '10:00'] },
      { category: 'pc', label: 'PC1', kilometer: 8.2, times: ['10:13', '10:12'] },
      { category: 'pm', label: 'PM2', kilometer: 29.6, times: ['10:48', '10:45'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 33.8, times: ['10:54', '10:52'] },
      { category: 'pm', label: 'PM3', kilometer: 37.1, times: ['11:00', '10:57'] },
      { category: 'pc', label: 'PC2', kilometer: 48.9, times: ['11:19', '11:15'] },
      { category: 'pm', label: 'PM3', kilometer: 66.6, times: ['11:48', '11:42'] },
      { category: 'pc', label: 'PC3', kilometer: 97.4, times: ['12:37', '12:29'] },
      { category: 'pm', label: 'PM3', kilometer: 104.8, times: ['12:49', '12:41'] },
      { category: 'ravitaillement-ferme', label: 'Ravito ferme', kilometer: 120.9, times: ['13:16', '13:06'] },
      { category: 'km-5', label: '5 km', kilometer: 130.7, times: ['13:31', '13:21'] },
      { category: 'km-3', label: '3 km', kilometer: 132.7, times: ['13:35', '13:24'] },
      { category: 'km-1', label: '1 km', kilometer: 134.7, times: ['13:38', '13:27'] },
      { category: 'arrivee', label: 'Arrivee place des Fetes', kilometer: 135.7, times: ['13:40', '13:28'] }
    ]
  },
  {
    id: 'stage-08-1',
    number: 8,
    date: '2026-07-11',
    title: 'Etape 8.1 - Saint-Esprit / Riviere-Pilote',
    start: 'Saint-Esprit',
    finish: 'Riviere-Pilote',
    distanceKm: 90.8,
    gatheringTime: '07:30',
    callTime: '08:40',
    realStartTime: '09:00',
    averages: [37, 39],
    route: [commune.saintEsprit, commune.francois, commune.marin, commune.rivierePilote],
    points: [
      { category: 'depart-reel', label: 'Depart reel - RD6', kilometer: 0, times: ['09:00', '09:00'] },
      { category: 'pm', label: 'PM3', kilometer: 11.6, times: ['09:18', '09:17'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 24.3, times: ['09:39', '09:37'] },
      { category: 'pm', label: 'PM3', kilometer: 28.1, times: ['09:45', '09:43'] },
      { category: 'pc', label: 'PC1', kilometer: 36.9, times: ['09:59', '09:56'] },
      { category: 'pm', label: 'PM2', kilometer: 44, times: ['10:11', '10:07'] },
      { category: 'pm', label: 'PM3', kilometer: 61.1, times: ['10:39', '10:34'] },
      { category: 'ravitaillement-ferme', label: 'Ravito ferme', kilometer: 77.3, times: ['11:05', '10:58'] },
      { category: 'km-5', label: '5 km', kilometer: 85.8, times: ['11:19', '11:12'] },
      { category: 'km-3', label: '3 km', kilometer: 87.8, times: ['11:22', '11:15'] },
      { category: 'km-1', label: '1 km', kilometer: 89.8, times: ['11:25', '11:18'] },
      { category: 'arrivee', label: 'Arrivee mairie de Riviere-Pilote', kilometer: 90.8, times: ['11:27', '11:19'] }
    ]
  },
  {
    id: 'stage-08-2',
    number: 9,
    date: '2026-07-11',
    title: 'Etape 8.2 CLM - Riviere-Pilote / La Renee',
    start: 'Riviere-Pilote',
    finish: 'La Renee',
    distanceKm: 9.8,
    gatheringTime: '14:30',
    callTime: '15:15',
    realStartTime: '15:30',
    averages: [35, 37],
    route: [commune.rivierePilote, commune.laRenee],
    points: [
      { category: 'depart-reel', label: 'Depart reel - RN8', kilometer: 0, times: ['15:30', '15:30'] },
      { category: 'arrivee', label: 'Arrivee ecole La Renee', kilometer: 9.8, times: ['15:46', '15:45'] }
    ]
  },
  {
    id: 'stage-09',
    number: 10,
    date: '2026-07-12',
    title: 'Etape 9 - Riviere-Pilote / Ducos',
    start: 'Riviere-Pilote',
    finish: 'Ducos',
    distanceKm: 139,
    gatheringTime: '11:30',
    callTime: '12:45',
    realStartTime: '13:00',
    averages: [37, 39],
    route: [commune.rivierePilote, commune.saintEsprit, commune.francois, commune.ducos, commune.saintEsprit, commune.ducos],
    points: [
      { category: 'depart-fictif', label: 'Depart fictif', kilometer: 0 },
      { category: 'depart-reel', label: 'Depart reel - RN5', kilometer: 0, times: ['13:00', '13:00'] },
      { category: 'pc', label: 'PC1', kilometer: 12.4, times: ['13:20', '13:19'] },
      { category: 'pm', label: 'PM3', kilometer: 20.5, times: ['13:33', '13:31'] },
      { category: 'ravitaillement-ouvert', label: 'Ravito ouvert', kilometer: 29.3, times: ['13:47', '13:45'] },
      { category: 'pc', label: 'PC2', kilometer: 33, times: ['13:53', '13:50'] },
      { category: 'pm', label: 'PM3', kilometer: 39.9, times: ['14:04', '14:01'] },
      { category: 'pm', label: 'PM3', kilometer: 55.7, times: ['14:30', '14:25'] },
      { category: 'pc', label: 'PC3', kilometer: 68.3, times: ['14:50', '14:45'] },
      { category: 'pm', label: 'PM3', kilometer: 75.2, times: ['15:01', '14:55'] },
      { category: 'pm', label: 'PM3', kilometer: 91, times: ['15:27', '15:20'] },
      { category: 'ravitaillement-ferme', label: 'Ravito ferme', kilometer: 113.6, times: ['16:04', '15:54'] },
      { category: 'km-5', label: '5 km', kilometer: 134, times: ['16:37', '16:26'] },
      { category: 'km-3', label: '3 km', kilometer: 136.2, times: ['16:40', '16:29'] },
      { category: 'km-1', label: '1 km', kilometer: 137.7, times: ['16:43', '16:31'] },
      { category: 'arrivee', label: 'Arrivee place des Fetes', kilometer: 139, times: ['16:45', '16:33'] }
    ]
  }
];

export const stages: Stage[] = seeds.map(makeStage);
