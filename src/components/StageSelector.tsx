import type { Stage } from '../types';

interface StageSelectorProps {
  stages: Stage[];
  selectedStageId: string;
  onSelectStage: (stageId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function StageSelector({ stages, selectedStageId, onSelectStage, onPrevious, onNext, canGoPrevious, canGoNext }: StageSelectorProps) {
  return (
    <div className="stage-selector">
      <button type="button" className="glass-button icon-button" onClick={onPrevious} disabled={!canGoPrevious} aria-label="Etape precedente">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5 8 12l7 7" />
        </svg>
      </button>
      <select value={selectedStageId} onChange={(event) => onSelectStage(event.target.value)} aria-label="Choisir une etape">
        {stages.map((stage) => (
          <option key={stage.id} value={stage.id}>{stage.title}</option>
        ))}
      </select>
      <button type="button" className="glass-button icon-button" onClick={onNext} disabled={!canGoNext} aria-label="Etape suivante">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
