import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { mockLiveTrackingService } from '../services/liveTrackingService';
import type { LiveEntity } from '../types';

export function useLiveTracking(route: FeatureCollection | null) {
  const [entities, setEntities] = useState<LiveEntity[]>([]);

  useEffect(() => {
    if (!route) {
      setEntities([]);
      return;
    }

    return mockLiveTrackingService.subscribe(route, setEntities);
  }, [route]);

  return entities;
}
