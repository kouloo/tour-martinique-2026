import { useEffect, useState } from 'react';

export interface UserLocation {
  coordinates: [number, number];
  accuracy?: number;
  updatedAt: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocalisation indisponible sur cet appareil.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          coordinates: [position.coords.longitude, position.coords.latitude],
          accuracy: position.coords.accuracy,
          updatedAt: new Date(position.timestamp).toISOString()
        });
        setError(null);
      },
      (geoError) => setError(geoError.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
}
