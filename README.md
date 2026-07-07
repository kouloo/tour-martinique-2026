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

Les donnees actuelles sont des donnees provisoires de structure, car l'extraction automatique de `TCM26.2.0.pdf` n'a pas pu etre executee dans cet environnement sans outil PDF disponible. Il faut remplacer les valeurs de `src/data/stages.ts` et les traces GeoJSON par les donnees officielles extraites du PDF.

## Live tracking

`src/services/liveTrackingService.ts` expose une interface `LiveTrackingService`.

Le service actif est `mockLiveTrackingService`, qui simule:

- le peloton;
- une echappee;
- la direction course.

Pour brancher Supabase Realtime ou Firebase, creer un service qui implemente la meme methode `subscribe(stageRoute, onUpdate)` puis l'injecter dans `useLiveTracking`.

## PWA

La PWA fournit:

- un manifest web;
- un service worker simple de cache;
- une UI portrait mobile-first;
- la geolocalisation via `navigator.geolocation.watchPosition`.
