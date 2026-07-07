import { useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { bbox } from '@turf/turf';
import type { FeatureCollection } from 'geojson';
import type { Stage } from '../types';
import type { MapHeightMode } from '../hooks/useMapHeightMode';

interface RoutePolylineProps {
  stage: Stage;
  sheetMode: MapHeightMode;
  onRouteLoaded: (route: FeatureCollection | null) => void;
}

function getBottomSheetPadding(mode: MapHeightMode) {
  const height = window.innerHeight || 800;
  if (mode === 'peek') return Math.min(height * 0.24, 210) + 96;
  if (mode === 'expanded') return Math.min(height * 0.72, height - 150);
  return height * 0.48 + 112;
}

function fitRouteIntoVisibleMap(map: ReturnType<typeof useMap>, route: FeatureCollection, mode: MapHeightMode) {
  const [west, south, east, north] = bbox(route);
  const bottomPadding = getBottomSheetPadding(mode);
  map.invalidateSize();
  map.fitBounds(
    [[south, west], [north, east]],
    {
      paddingTopLeft: [34, 96],
      paddingBottomRight: [34, bottomPadding],
      maxZoom: 13
    }
  );
}

export function RoutePolyline({ stage, sheetMode, onRouteLoaded }: RoutePolylineProps) {
  const map = useMap();
  const [route, setRoute] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    let ignore = false;
    setRoute(null);
    onRouteLoaded(null);

    fetch(stage.routeGeoJsonUrl)
      .then((response) => response.json())
      .then((data: FeatureCollection) => {
        if (ignore) return;
        setRoute(data);
        onRouteLoaded(data);
        fitRouteIntoVisibleMap(map, data, sheetMode);
      })
      .catch(() => onRouteLoaded(null));

    return () => {
      ignore = true;
    };
  }, [map, onRouteLoaded, stage.routeGeoJsonUrl]);

  useEffect(() => {
    if (!route) return;
    window.setTimeout(() => fitRouteIntoVisibleMap(map, route, sheetMode), 280);
  }, [map, route, sheetMode]);

  if (!route) return null;
  return <GeoJSON key={stage.id} data={route} style={{ color: '#62fbd7', weight: 6, opacity: 0.9 }} />;
}
