#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const MARTINIQUE_VIEWBOX = '-61.25,14.35,-60.78,14.95';
const USER_AGENT = 'tour-martinique-2026-route-generator/1.0';
const DEFAULT_DISTANCE_TOLERANCE_KM = 3;

function usage() {
  console.log(`Usage:
  node tools/generate-road-traces.mjs --input tools/stages.example.json --out public/routes --gpx-out public/gpx

Options:
  --input <file>              JSON containing stages and route points.
  --out <dir>                 GeoJSON output directory. Default: public/routes
  --gpx-out <dir>             GPX output directory. Default: public/gpx
  --cache <file>              Geocoding cache file. Default: tools/.geocode-cache.json
  --router <osrm|graphhopper> Routing engine. Default: osrm
  --osrm-url <url>            OSRM base URL. Default: https://router.project-osrm.org
  --graphhopper-key <key>     GraphHopper API key, or use GRAPHOPPER_API_KEY env var.
  --tolerance-km <number>     Distance warning threshold. Default: ${DEFAULT_DISTANCE_TOLERANCE_KM}
  --retries <number>          HTTP retries for geocoding/routing. Default: 2
  --timeout-ms <number>       HTTP timeout. Default: 30000
  --help                      Show this help.

Input shape:
  {
    "stages": [
      {
        "id": "stage-01",
        "title": "Etape 1 - Riviere-Salee / Marin",
        "date": "2026-07-04",
        "distanceKm": 128.8,
        "start": "Riviere-Salee",
        "finish": "Marin",
        "points": [
          {
            "label": "Depart reel - RN5",
            "category": "depart-reel",
            "route": "RN5",
            "kilometer": 0,
            "remainingKm": 128.8,
            "times": ["10:00", "10:00"],
            "coordinates": [-60.9775, 14.5271]
          }
        ]
      }
    ]
  }

Coordinates are [longitude, latitude]. If a point has no coordinates, the script geocodes it in Martinique.
`);
}

function parseArgs(argv) {
  const args = {
    out: 'public/routes',
    gpxOut: 'public/gpx',
    cache: 'tools/.geocode-cache.json',
    router: 'osrm',
    osrmUrl: 'https://router.project-osrm.org',
    graphhopperKey: process.env.GRAPHHOPPER_API_KEY,
    toleranceKm: DEFAULT_DISTANCE_TOLERANCE_KM,
    retries: 2,
    timeoutMs: 30000
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[key] = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  args.toleranceKm = Number(args.toleranceKm);
  args.retries = Number(args.retries);
  args.timeoutMs = Number(args.timeoutMs);
  if (!Number.isFinite(args.toleranceKm)) {
    throw new Error('--tolerance-km must be a number.');
  }
  if (!Number.isFinite(args.retries) || args.retries < 0) {
    throw new Error('--retries must be a positive number.');
  }
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs < 1000) {
    throw new Error('--timeout-ms must be at least 1000.');
  }

  return args;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readCache(path) {
  try {
    return await readJson(path);
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function normalizeStages(input) {
  const stages = Array.isArray(input) ? input : input.stages;
  if (!Array.isArray(stages)) {
    throw new Error('Input JSON must be an array or an object with a stages array.');
  }

  return stages.map((stage) => {
    if (!stage.id || !stage.title || !Array.isArray(stage.points)) {
      throw new Error('Each stage must contain id, title and points.');
    }
    return stage;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const retries = retryOptions.retries ?? 0;
  const timeoutMs = retryOptions.timeoutMs ?? 30000;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      if (response.ok || ![408, 429, 500, 502, 503, 504].includes(response.status) || attempt === retries) {
        return response;
      }
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw error;
      }
    } finally {
      clearTimeout(timeout);
    }

    await sleep(1000 * (attempt + 1));
  }

  throw lastError;
}

function cacheKey(stage, point) {
  return [
    stage.id,
    point.route,
    point.label,
    point.municipality,
    stage.start,
    stage.finish
  ]
    .filter(Boolean)
    .join('|')
    .toLowerCase();
}

function buildGeocodeQuery(stage, point) {
  const parts = [
    point.label,
    point.route,
    point.municipality,
    stage.start,
    stage.finish,
    'Martinique'
  ].filter(Boolean);

  return [...new Set(parts)].join(', ');
}

function isCoordinate(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  );
}

async function geocodePoint(stage, point, cache, args) {
  if (isCoordinate(point.coordinates)) {
    return {
      coordinates: point.coordinates.map(Number),
      source: 'input'
    };
  }

  const key = cacheKey(stage, point);
  if (cache[key]) {
    return {
      coordinates: cache[key].coordinates,
      source: 'cache',
      query: cache[key].query
    };
  }

  const query = buildGeocodeQuery(stage, point);
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'mq');
  url.searchParams.set('viewbox', MARTINIQUE_VIEWBOX);
  url.searchParams.set('bounded', '1');
  url.searchParams.set('q', query);

  const response = await fetchWithRetry(
    url,
    {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json'
      }
    },
    args
  );

  if (!response.ok) {
    throw new Error(`Nominatim failed for "${query}": ${response.status} ${response.statusText}`);
  }

  const results = await response.json();
  if (!results.length) {
    throw new Error(`No geocoding result for "${query}". Add coordinates to the JSON for this point.`);
  }

  const coordinates = [Number(results[0].lon), Number(results[0].lat)];
  cache[key] = {
    query,
    coordinates,
    displayName: results[0].display_name
  };

  // Nominatim usage policy asks clients to avoid heavy bursts.
  await sleep(1100);

  return {
    coordinates,
    source: 'nominatim',
    query,
    displayName: results[0].display_name
  };
}

async function geocodeStage(stage, cache, args) {
  const resolved = [];

  for (const point of stage.points) {
    const geocoded = await geocodePoint(stage, point, cache, args);
    resolved.push({
      ...point,
      coordinates: geocoded.coordinates,
      geocode: {
        source: geocoded.source,
        query: geocoded.query,
        displayName: geocoded.displayName
      }
    });
  }

  return { ...stage, points: resolved };
}

function distinctRoutingCoordinates(points) {
  const coordinates = [];
  for (const point of points) {
    const current = point.coordinates;
    const previous = coordinates[coordinates.length - 1];
    if (!previous || previous[0] !== current[0] || previous[1] !== current[1]) {
      coordinates.push(current);
    }
  }
  return coordinates;
}

async function routeWithOsrm(coordinates, baseUrl, args) {
  const coordinateText = coordinates.map(([lon, lat]) => `${lon},${lat}`).join(';');
  const url = new URL(`/route/v1/driving/${coordinateText}`, baseUrl);
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('steps', 'false');

  const response = await fetchWithRetry(url, {}, args);
  if (!response.ok) {
    throw new Error(`OSRM failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error(`OSRM returned no route: ${data.message ?? data.code}`);
  }

  return {
    coordinates: data.routes[0].geometry.coordinates,
    distanceKm: data.routes[0].distance / 1000,
    durationSeconds: data.routes[0].duration
  };
}

async function routeWithGraphHopper(coordinates, apiKey, args) {
  if (!apiKey) {
    throw new Error('GraphHopper routing requires --graphhopper-key or GRAPHOPPER_API_KEY.');
  }

  const url = new URL('https://graphhopper.com/api/1/route');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('vehicle', 'car');
  url.searchParams.set('points_encoded', 'false');
  url.searchParams.set('locale', 'fr');
  for (const [lon, lat] of coordinates) {
    url.searchParams.append('point', `${lat},${lon}`);
  }

  const response = await fetchWithRetry(url, {}, args);
  if (!response.ok) {
    throw new Error(`GraphHopper failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.paths?.[0]) {
    throw new Error(`GraphHopper returned no route: ${data.message ?? 'unknown error'}`);
  }

  return {
    coordinates: data.paths[0].points.coordinates,
    distanceKm: data.paths[0].distance / 1000,
    durationSeconds: data.paths[0].time / 1000
  };
}

async function routeStage(stage, args) {
  const coordinates = distinctRoutingCoordinates(stage.points);
  if (coordinates.length < 2) {
    throw new Error(`${stage.id} needs at least two distinct points to route.`);
  }

  if (args.router === 'osrm') {
    return routeWithOsrm(coordinates, args.osrmUrl, args);
  }

  if (args.router === 'graphhopper') {
    return routeWithGraphHopper(coordinates, args.graphhopperKey, args);
  }

  throw new Error(`Unsupported router: ${args.router}`);
}

function featureCollectionForStage(stage, route, diagnostics) {
  return {
    type: 'FeatureCollection',
    properties: {
      generator: 'tools/generate-road-traces.mjs',
      generatedAt: new Date().toISOString()
    },
    features: [
      {
        type: 'Feature',
        properties: {
          id: stage.id,
          title: stage.title,
          date: stage.date,
          start: stage.start,
          finish: stage.finish,
          officialDistanceKm: stage.distanceKm,
          calculatedDistanceKm: diagnostics.calculatedDistanceKm,
          distanceDeltaKm: diagnostics.distanceDeltaKm,
          distanceWarning: diagnostics.warning,
          source: 'Road-routed from PDF passage points'
        },
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      },
      ...stage.points.map((point, index) => ({
        type: 'Feature',
        properties: {
          id: point.id ?? `${stage.id}-p${index + 1}`,
          stageId: stage.id,
          label: point.label,
          category: point.category,
          route: point.route,
          kilometer: point.kilometer,
          remainingKm: point.remainingKm,
          times: point.times,
          municipality: point.municipality,
          note: point.note,
          geocode: point.geocode
        },
        geometry: {
          type: 'Point',
          coordinates: point.coordinates
        }
      }))
    ]
  };
}

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function gpxForStage(stage, route, diagnostics) {
  const metadata = [
    `Official distance: ${stage.distanceKm} km`,
    `Calculated distance: ${diagnostics.calculatedDistanceKm.toFixed(2)} km`,
    `Delta: ${diagnostics.distanceDeltaKm.toFixed(2)} km`,
    diagnostics.warning ? 'WARNING: distance delta is above tolerance' : 'Distance delta is within tolerance'
  ].join(' | ');

  const waypoints = stage.points
    .map((point, index) => {
      const [lon, lat] = point.coordinates;
      const name = point.label || point.category || `${stage.id} point ${index + 1}`;
      const desc = [
        point.category,
        point.route,
        Number.isFinite(point.kilometer) ? `Km ${point.kilometer}` : undefined,
        Array.isArray(point.times) ? `Times ${point.times.join(' / ')}` : undefined,
        point.note
      ]
        .filter(Boolean)
        .join(' | ');
      return `  <wpt lat="${lat}" lon="${lon}">
    <name>${escapeXml(name)}</name>
    <desc>${escapeXml(desc)}</desc>
    <type>${escapeXml(point.category ?? 'passage')}</type>
  </wpt>`;
    })
    .join('\n');

  const trackPoints = route.coordinates
    .map(([lon, lat]) => `      <trkpt lat="${lat}" lon="${lon}" />`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="tour-martinique-2026-route-generator" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(stage.title)}</name>
    <desc>${escapeXml(metadata)}</desc>
  </metadata>
${waypoints}
  <trk>
    <name>${escapeXml(stage.title)}</name>
    <desc>${escapeXml(metadata)}</desc>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>
`;
}

function diagnosticsForStage(stage, route, toleranceKm) {
  const official = Number(stage.distanceKm);
  const calculated = route.distanceKm;
  const delta = Number.isFinite(official) ? calculated - official : null;
  const absDelta = delta == null ? null : Math.abs(delta);

  return {
    officialDistanceKm: official,
    calculatedDistanceKm: calculated,
    distanceDeltaKm: delta,
    toleranceKm,
    warning: absDelta == null ? false : absDelta > toleranceKm
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  if (!args.input) {
    throw new Error('Missing --input. Use --help for an example.');
  }

  const input = await readJson(args.input);
  const stages = normalizeStages(input);
  const cache = await readCache(args.cache);
  const report = [];

  await mkdir(args.out, { recursive: true });
  await mkdir(args.gpxOut, { recursive: true });

  for (const stage of stages) {
    console.log(`\n${stage.id}: geocoding ${stage.points.length} points...`);
    const geocodedStage = await geocodeStage(stage, cache, args);

    console.log(`${stage.id}: routing with ${args.router}...`);
    const route = await routeStage(geocodedStage, args);
    const diagnostics = diagnosticsForStage(geocodedStage, route, args.toleranceKm);
    const geojson = featureCollectionForStage(geocodedStage, route, diagnostics);
    const gpx = gpxForStage(geocodedStage, route, diagnostics);

    await writeFile(join(args.out, `${stage.id}.geojson`), `${JSON.stringify(geojson, null, 2)}\n`, 'utf8');
    await writeFile(join(args.gpxOut, `${stage.id}.gpx`), gpx, 'utf8');

    report.push({
      id: stage.id,
      title: stage.title,
      officialDistanceKm: diagnostics.officialDistanceKm,
      calculatedDistanceKm: Number(diagnostics.calculatedDistanceKm.toFixed(2)),
      distanceDeltaKm: Number(diagnostics.distanceDeltaKm.toFixed(2)),
      warning: diagnostics.warning
    });

    const marker = diagnostics.warning ? 'WARNING' : 'OK';
    console.log(
      `${stage.id}: ${marker} official=${diagnostics.officialDistanceKm} km calculated=${diagnostics.calculatedDistanceKm.toFixed(2)} km delta=${diagnostics.distanceDeltaKm.toFixed(2)} km`
    );
  }

  await writeJson(args.cache, cache);
  await writeJson(join(args.out, 'routing-report.json'), report);

  const warningCount = report.filter((item) => item.warning).length;
  console.log(`\nGenerated ${stages.length} GPX files and ${stages.length} GeoJSON files.`);
  console.log(`Distance warnings: ${warningCount}. Report: ${join(args.out, 'routing-report.json')}`);
}

main().catch((error) => {
  console.error(`\nRoute generation failed: ${error.message}`);
  process.exitCode = 1;
});
