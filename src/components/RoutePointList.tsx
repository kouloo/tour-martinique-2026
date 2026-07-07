import type { RoutePoint } from '../types';
import { RoutePointCard } from './RoutePointCard';

interface RoutePointListProps {
  points: RoutePoint[];
  selectedPointId: string | null;
  onSelectPoint: (pointId: string) => void;
}

export function RoutePointList({ points, selectedPointId, onSelectPoint }: RoutePointListProps) {
  return (
    <section className="route-points-section">
      <h2>Points de passage</h2>
      <div className="route-point-list">
        {points.map((point) => (
          <RoutePointCard
            key={point.id}
            point={point}
            isSelected={point.id === selectedPointId}
            onSelect={() => onSelectPoint(point.id)}
          />
        ))}
      </div>
    </section>
  );
}
