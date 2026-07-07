import { useEffect, useState } from 'react';
import type { Stage } from '../types';
import { getCurrentRoutePointId } from '../utils/stageSchedule';

export function useCurrentRoutePoint(stage: Stage) {
  const [currentPointId, setCurrentPointId] = useState<string | null>(() => getCurrentRoutePointId(stage));

  useEffect(() => {
    const update = () => setCurrentPointId(getCurrentRoutePointId(stage));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [stage]);

  return currentPointId;
}
