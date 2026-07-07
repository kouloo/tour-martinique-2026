import { useMemo } from 'react';
import { distance, lineString, nearestPointOnLine, point } from '@turf/turf';
import type { FeatureCollection, LineString } from 'geojson';
import type { UserLocation } from './useGeolocation';
import type { RoutePoint } from '../types';

function routeLine(route: FeatureCollection | null) {
  const feature = route?.features.find((item) => item.geometry.type === 'LineString');
  return feature?.geometry as LineString | undefined;
}

export function useNearestRoutePoint(points: RoutePoint[], userLocation: UserLocation | null, route: FeatureCollection | null) {
  return useMemo(() => {
    if (!userLocation) return null;

    const userPoint = point(userLocation.coordinates);
    const nearestPoint = points
      .map((routePoint) => ({
        routePoint,
        distanceKm: distance(userPoint, point(routePoint.coordinates), { units: 'kilometers' })
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0] ?? null;

    const line = routeLine(route);
    const routeDistanceKm = line
      ? nearestPointOnLine(lineString(line.coordinates), userPoint, { units: 'kilometers' }).properties.dist
      : undefined;

    return {
      nearestPoint: nearestPoint?.routePoint ?? null,
      pointDistanceKm: nearestPoint?.distanceKm,
      routeDistanceKm
    };
  }, [points, route, userLocation]);
}
