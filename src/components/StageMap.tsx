import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import type { Stage } from '../types';
import type { UserLocation } from '../hooks/useGeolocation';
import type { MapHeightMode } from '../hooks/useMapHeightMode';
import { RoutePolyline } from './RoutePolyline';
import { UserLocationMarker } from './UserLocationMarker';
import { RoutePointMarkers } from './RoutePointMarkers';
import { MapControls } from './MapControls';

interface StageMapProps {
  stage: Stage;
  userLocation: UserLocation | null;
  selectedRoutePointId: string | null;
  sheetMode: MapHeightMode;
  onRouteLoaded: (route: FeatureCollection | null) => void;
}

export function StageMap({ stage, userLocation, selectedRoutePointId, sheetMode, onRouteLoaded }: StageMapProps) {
  const center = useMemo<[number, number]>(() => {
    const first = stage.points[0]?.coordinates;
    return first ? [first[1], first[0]] : [14.6415, -61.0242];
  }, [stage]);

  return (
    <MapContainer key={stage.id} center={center} zoom={12} minZoom={10} className="stage-map" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <RoutePolyline stage={stage} sheetMode={sheetMode} onRouteLoaded={onRouteLoaded} />
      <RoutePointMarkers points={stage.points} selectedPointId={selectedRoutePointId} />
      {userLocation && <UserLocationMarker location={userLocation} />}
      <MapControls userLocation={userLocation} />
    </MapContainer>
  );
}
