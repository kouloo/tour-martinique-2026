# Tour de Martinique Cycliste 2026

Application mobile-first React + TypeScript + Vite pour suivre le Tour de Martinique cycliste 2026 sur le terrain.

## Lancer le projet

```bash
npm install
npm run dev
```

## Donnees

- Les etapes sont centralisees dans `src/data/stages.ts`.
- Les traces sont dans `public/routes/*.geojson`.
- Les composants ne contiennent pas de donnees metier hardcodees.

Les donnees ont ete extraites de `TCM26.2.0.pdf`. Les traces GeoJSON sont reconstruites depuis les points de passage du PDF; elles pourront etre remplacees par des traces GPS officielles si elles deviennent disponibles.

## Generer GPX et GeoJSON routiers

Un outil Node.js permet de produire un GPX et un GeoJSON par etape a partir d'un JSON extrait du PDF:

```bash
npm run routes:generate -- --input tools/stages.example.json --out public/routes --gpx-out public/gpx
```

Le script `tools/generate-road-traces.mjs`:

- charge un JSON contenant les etapes et points de passage;
- geocode les points sans coordonnees avec Nominatim, limite a la Martinique;
- utilise OSRM par defaut pour suivre le reseau routier;
- peut utiliser GraphHopper avec `--router graphhopper --graphhopper-key VOTRE_CLE`;
- exporte `public/routes/<stage-id>.geojson`;
- exporte `public/gpx/<stage-id>.gpx`;
- conserve les metadonnees d'etape et de points: date, depart, arrivee, distance officielle, PC, PM, ravitaillement, horaires;
- cree un rapport `routing-report.json` avec l'ecart entre distance officielle et distance calculee.

Les coordonnees dans le JSON sont au format `[longitude, latitude]`. Quand le PDF donne un libelle trop vague, il vaut mieux ajouter les coordonnees dans le JSON pour eviter un mauvais geocodage. Le script ne relie pas les points en ligne droite: la geometrie finale vient du moteur de routage.

## Live tracking

`src/services/liveTrackingService.ts` expose une interface `LiveTrackingService`, mais le live tracking n'est pas affiche dans l'interface pour le moment.

Pour brancher Supabase Realtime ou Firebase plus tard, creer un service qui implemente la meme methode `subscribe(stageRoute, onUpdate)` puis l'injecter dans `useLiveTracking`.

## PWA

La PWA fournit:

- un manifest web;
- un service worker simple de cache;
- une UI portrait mobile-first;
- la geolocalisation via `navigator.geolocation.watchPosition`.
