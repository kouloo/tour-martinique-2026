import type { Stage, StageStatus } from '../types';

const statusLabels: Record<StageStatus, string> = {
  today: 'Etape du jour',
  upcoming: 'A venir',
  completed: 'Terminee'
};

interface StageHeaderProps {
  stage: Stage;
  status: StageStatus;
}

export function StageHeader({ stage, status }: StageHeaderProps) {
  return (
    <header className="stage-header">
      <div>
        <p className="eyebrow">{statusLabels[status]}</p>
        <h1>{stage.title}</h1>
      </div>
      <span className={`status-pill status-pill--${status}`}>{new Date(`${stage.date}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
    </header>
  );
}
