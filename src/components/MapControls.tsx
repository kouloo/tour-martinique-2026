import { useMap } from 'react-leaflet';
import type { UserLocation } from '../hooks/useGeolocation';

interface MapControlsProps {
  userLocation: UserLocation | null;
}

export function MapControls({ userLocation }: MapControlsProps) {
  const map = useMap();

  const centerOnUser = () => {
    if (!userLocation) {
      return;
    }

    const [longitude, latitude] = userLocation.coordinates;
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 15), {
      duration: 0.8
    });
  };

  return (
    <button
      className="map-location-button glass-button map-icon-button"
      type="button"
      onClick={centerOnUser}
      disabled={!userLocation}
      aria-label="Centrer la carte sur ma position"
      title={userLocation ? 'Centrer sur ma position' : 'Position GPS indisponible'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    </button>
  );
}
