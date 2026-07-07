import type { Stage } from '../types';
import type { useNearestRoutePoint } from '../hooks/useNearestRoutePoint';

interface StageSummaryCardProps {
  stage: Stage;
  nearest: ReturnType<typeof useNearestRoutePoint>;
  geolocationError: string | null;
}

export function StageSummaryCard({ stage, nearest, geolocationError }: StageSummaryCardProps) {
  return (
    <article className="glass-card summary-card">
      <div>
        <span>Depart</span>
        <strong>{stage.start}</strong>
      </div>
      <div>
        <span>Arrivee</span>
        <strong>{stage.finish}</strong>
      </div>
      <div>
        <span>Distance</span>
        <strong>{stage.distanceKm.toFixed(1)} km</strong>
      </div>
      <div>
        <span>GPS</span>
        <strong>{geolocationError ? 'Indisponible' : nearest?.routeDistanceKm !== undefined ? `${nearest.routeDistanceKm.toFixed(2)} km du parcours` : 'Recherche...'}</strong>
      </div>
      {nearest?.nearestPoint && <p>Point le plus proche: {nearest.nearestPoint.label} ({nearest.pointDistanceKm?.toFixed(2)} km)</p>}
    </article>
  );
}
