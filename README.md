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

## Live tracking

`src/services/liveTrackingService.ts` expose une interface `LiveTrackingService`, mais le live tracking n'est pas affiche dans l'interface pour le moment.

Pour brancher Supabase Realtime ou Firebase plus tard, creer un service qui implemente la meme methode `subscribe(stageRoute, onUpdate)` puis l'injecter dans `useLiveTracking`.

## PWA

La PWA fournit:

- un manifest web;
- un service worker simple de cache;
- une UI portrait mobile-first;
- la geolocalisation via `navigator.geolocation.watchPosition`.
