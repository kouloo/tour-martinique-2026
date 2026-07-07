import { CircleMarker, Popup } from 'react-leaflet';
import type { LiveEntity } from '../types';

const colors: Record<LiveEntity['kind'], string> = {
  peloton: '#f9ff6a',
  echappee: '#ff8a5b',
  direction: '#b58cff',
  medical: '#ff4f7b',
  moto: '#72d8ff'
};

interface LiveCyclistMarkerProps {
  entity: LiveEntity;
}

export function LiveCyclistMarker({ entity }: LiveCyclistMarkerProps) {
  return (
    <CircleMarker center={[entity.coordinates[1], entity.coordinates[0]]} radius={10} pathOptions={{ color: '#071016', fillColor: colors[entity.kind], fillOpacity: 1, weight: 3 }}>
      <Popup>
        <strong>{entity.label}</strong><br />
        {entity.speedKmh ? `${entity.speedKmh} km/h` : 'Vitesse n/a'}<br />
        Maj {new Date(entity.updatedAt).toLocaleTimeString('fr-FR')}
      </Popup>
    </CircleMarker>
  );
}
