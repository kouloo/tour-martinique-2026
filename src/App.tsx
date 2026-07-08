import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { MobileShell } from './components/MobileShell';
import { SplitMapLayout } from './components/SplitMapLayout';
import { StageMap } from './components/StageMap';
import { StageHeader } from './components/StageHeader';
import { StageSelector } from './components/StageSelector';
import { StageSummaryCard } from './components/StageSummaryCard';
import { StageTimeline } from './components/StageTimeline';
import { RoutePointList } from './components/RoutePointList';
import { stages } from './data/stages';
import { useCurrentStage } from './hooks/useCurrentStage';
import { useCurrentRoutePoint } from './hooks/useCurrentRoutePoint';
import { useGeolocation } from './hooks/useGeolocation';
import { useMapHeightMode } from './hooks/useMapHeightMode';
import { useNearestRoutePoint } from './hooks/useNearestRoutePoint';

export function App() {
  const [hasEntered, setHasEntered] = useState(false);

  if (!hasEntered) {
    return (
      <MobileShell>
        <section className="home-screen" aria-label="Accueil TCM 2026">
          <div className="home-screen__content">
            <h1>TCM 2026</h1>
            <p>
              Cette application n'est pas l'application officielle du Tour cycliste. Elle a été créée pour aider a
              suivre le programme du tour. Les parcours présentés sont une approximation des parcours réels.
            </p>
            <button className="home-screen__button" type="button" onClick={() => setHasEntered(true)}>
              CONTINUER
            </button>
          </div>
        </section>
      </MobileShell>
    );
  }

  return <TourTracker />;
}

function TourTracker() {
  const current = useCurrentStage(stages);
  const mapMode = useMapHeightMode();
  const geo = useGeolocation();
  const [route, setRoute] = useState<FeatureCollection | null>(null);
  const [selectedRoutePointId, setSelectedRoutePointId] = useState<string | null>(null);
  const currentRoutePointId = useCurrentRoutePoint(current.selectedStage);
  const highlightedRoutePointId = selectedRoutePointId ?? currentRoutePointId;
  const nearest = useNearestRoutePoint(current.selectedStage.points, geo.location, route);

  useEffect(() => {
    setSelectedRoutePointId(null);
  }, [current.selectedStage.id]);

  return (
    <MobileShell>
      <SplitMapLayout
        mode={mapMode.mode}
        onCyclePanel={mapMode.cycleMode}
        onPanelModeChange={mapMode.setMode}
        map={
          <StageMap
            stage={current.selectedStage}
            userLocation={geo.location}
            selectedRoutePointId={highlightedRoutePointId}
            sheetMode={mapMode.mode}
            onRouteLoaded={setRoute}
          />
        }
        panel={
          <>
            <StageHeader stage={current.selectedStage} status={current.status} />
            <StageSelector
              stages={stages}
              selectedStageId={current.selectedStage.id}
              onSelectStage={current.selectStageById}
              onPrevious={current.goPrevious}
              onNext={current.goNext}
              canGoPrevious={current.canGoPrevious}
              canGoNext={current.canGoNext}
            />
            <StageSummaryCard stage={current.selectedStage} nearest={nearest} geolocationError={geo.error} />
            <StageTimeline stage={current.selectedStage} />
            <RoutePointList
              points={current.selectedStage.points}
              selectedPointId={highlightedRoutePointId}
              onSelectPoint={setSelectedRoutePointId}
            />
          </>
        }
      />
    </MobileShell>
  );
}
