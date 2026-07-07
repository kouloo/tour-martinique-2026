import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { RoutePoint, RoutePointCategory } from '../types';

const categoryLabels: Record<RoutePointCategory, string> = {
  'depart-fictif': 'DF',
  'depart-reel': 'DR',
  arrivee: 'A',
  pc: 'PC',
  pm: 'PM',
  'ravitaillement-ouvert': 'RO',
  'ravitaillement-ferme': 'RF',
  'km-5': '5',
  'km-3': '3',
  'km-1': '1'
};

function iconFor(point: RoutePoint, isSelected: boolean) {
  return L.divIcon({
    className: `route-point-marker route-point-marker--${point.category}${isSelected ? ' route-point-marker--selected' : ''}`,
    html: `<span>${categoryLabels[point.category]}</span>`,
    iconSize: isSelected ? [44, 44] : [34, 34],
    iconAnchor: isSelected ? [22, 22] : [17, 17]
  });
}

interface RoutePointMarkersProps {
  points: RoutePoint[];
  selectedPointId: string | null;
}

export function RoutePointMarkers({ points, selectedPointId }: RoutePointMarkersProps) {
  return (
    <>
      {points.map((point) => {
        const isSelected = point.id === selectedPointId;
        return (
        <Marker
          key={point.id}
          position={[point.coordinates[1], point.coordinates[0]]}
          icon={iconFor(point, isSelected)}
          zIndexOffset={isSelected ? 1000 : 0}
        >
          <Popup>
            <strong>{point.label}</strong><br />
            Km {point.kilometer.toFixed(1)} {point.municipality ? `- ${point.municipality}` : ''}
          </Popup>
        </Marker>
        );
      })}
    </>
  );
}
