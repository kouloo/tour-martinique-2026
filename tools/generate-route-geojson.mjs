import { mkdir, writeFile } from 'node:fs/promises';

const c = {
  fortDeFrance: [-61.0742, 14.6037],
  riviereSalee: [-60.9775, 14.5271],
  marin: [-60.8692, 14.4726],
  grosMorne: [-61.0065, 14.7007],
  sainteAnne: [-60.8789, 14.4359],
  macouba: [-61.1435, 14.8758],
  lorrain: [-61.0638, 14.8329],
  sainteMarie: [-60.9941, 14.7831],
  francois: [-60.9029, 14.6162],
  saintEsprit: [-60.9359, 14.5581],
  rivierePilote: [-60.9023, 14.4863],
  laRenee: [-60.921, 14.525],
  ducos: [-60.974, 14.576]
};

const routes = {
  prologue: [c.fortDeFrance, [-61.062, 14.615], c.fortDeFrance],
  'stage-01': [c.riviereSalee, c.ducos, c.francois, c.riviereSalee, c.sainteAnne, c.marin],
  'stage-02': [c.marin, c.sainteAnne, c.ducos, c.francois, c.grosMorne],
  'stage-03': [c.sainteAnne, c.riviereSalee, c.fortDeFrance, [-61.17, 14.75], c.macouba],
  'stage-04': [c.fortDeFrance, [-61.04, 14.67], c.grosMorne, [-60.96, 14.74], c.lorrain],
  'stage-05': [c.lorrain, c.grosMorne, c.francois, c.saintEsprit, c.sainteMarie],
  'stage-06': [c.sainteMarie, c.ducos, c.marin, c.francois],
  'stage-07': [c.francois, c.riviereSalee, [-61.08, 14.5], c.saintEsprit, c.francois, c.saintEsprit],
  'stage-08-1': [c.saintEsprit, c.francois, c.marin, c.rivierePilote],
  'stage-08-2': [c.rivierePilote, c.laRenee],
  'stage-09': [c.rivierePilote, c.saintEsprit, c.francois, c.ducos, c.saintEsprit, c.ducos]
};

await mkdir('public/routes', { recursive: true });

for (const [id, coordinates] of Object.entries(routes)) {
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { stage: id, source: 'TCM26.2.0.pdf reconstructed from route points' },
        geometry: { type: 'LineString', coordinates }
      }
    ]
  };
  await writeFile(`public/routes/${id}.geojson`, `${JSON.stringify(geojson)}\n`, 'utf8');
}

console.log(`Generated ${Object.keys(routes).length} route files.`);
