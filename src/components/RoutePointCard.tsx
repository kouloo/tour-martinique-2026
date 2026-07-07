import type { RoutePoint } from '../types';

interface RoutePointCardProps {
  point: RoutePoint;
  isSelected: boolean;
  onSelect: () => void;
}

export function RoutePointCard({ point, isSelected, onSelect }: RoutePointCardProps) {
  return (
    <button
      type="button"
      className={`route-point-card route-point-card--${point.category}${isSelected ? ' route-point-card--selected' : ''}`}
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`Mettre en evidence ${point.label} sur la carte`}
    >
      <div>
        <span className="point-category">{point.category.replaceAll('-', ' ')}</span>
        <strong>{point.label}</strong>
        {point.municipality && <small>{point.municipality}</small>}
      </div>
      <div className="point-km">Km {point.kilometer.toFixed(1)}</div>
      {point.passageTimes && (
        <div className="passage-grid">
          {point.passageTimes.map((passage) => (
            <span key={passage.averageKmh}>{passage.averageKmh} km/h<br /><strong>{passage.time}</strong></span>
          ))}
        </div>
      )}
      {point.note && <p>{point.note}</p>}
    </button>
  );
}
