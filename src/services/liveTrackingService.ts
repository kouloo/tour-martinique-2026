import { along, length, lineString } from '@turf/turf';
import type { FeatureCollection, LineString } from 'geojson';
import type { LiveEntity } from '../types';

export interface LiveTrackingService {
  subscribe(stageRoute: FeatureCollection, onUpdate: (entities: LiveEntity[]) => void): () => void;
}

function getLine(route: FeatureCollection): LineString | null {
  const feature = route.features.find((item) => item.geometry.type === 'LineString');
  return feature?.geometry as LineString | null;
}

export const mockLiveTrackingService: LiveTrackingService = {
  subscribe(stageRoute, onUpdate) {
    const geometry = getLine(stageRoute);
    if (!geometry) return () => undefined;

    const route = lineString(geometry.coordinates);
    const totalKm = length(route, { units: 'kilometers' });
    const startedAt = Date.now();

    const tick = () => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      const progress = (elapsedSeconds % 900) / 900;
      const pelotonKm = Math.max(0, Math.min(totalKm, progress * totalKm));
      const breakawayKm = Math.min(totalKm, pelotonKm + totalKm * 0.08);
      const directionKm = Math.max(0, pelotonKm - totalKm * 0.04);

      const now = new Date().toISOString();
      const entities: LiveEntity[] = [
        pointEntity('peloton', 'Peloton', 'peloton', route, pelotonKm, 38, now),
        pointEntity('breakaway', 'Echappee', 'echappee', route, breakawayKm, 42, now),
        pointEntity('direction', 'Direction course', 'direction', route, directionKm, 35, now)
      ];

      onUpdate(entities);
    };

    tick();
    const timer = window.setInterval(tick, 3000);
    return () => window.clearInterval(timer);
  }
};

function pointEntity(
  id: string,
  label: string,
  kind: LiveEntity['kind'],
  route: ReturnType<typeof lineString>,
  distanceKm: number,
  speedKmh: number,
  updatedAt: string
): LiveEntity {
  const point = along(route, distanceKm, { units: 'kilometers' });
  return {
    id,
    label,
    kind,
    coordinates: point.geometry.coordinates as [number, number],
    speedKmh,
    updatedAt
  };
}
