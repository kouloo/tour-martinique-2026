import { CircleMarker, Popup } from 'react-leaflet';
import type { UserLocation } from '../hooks/useGeolocation';

interface UserLocationMarkerProps {
  location: UserLocation;
}

export function UserLocationMarker({ location }: UserLocationMarkerProps) {
  return (
    <CircleMarker center={[location.coordinates[1], location.coordinates[0]]} radius={8} pathOptions={{ color: '#ffffff', fillColor: '#39a7ff', fillOpacity: 0.95, weight: 3 }}>
      <Popup>
        Votre position<br />
        Precision: {location.accuracy ? `${Math.round(location.accuracy)} m` : 'n/a'}
      </Popup>
    </CircleMarker>
  );
}
