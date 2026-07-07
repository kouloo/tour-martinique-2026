import type { Stage } from '../types';

interface StageTimelineProps {
  stage: Stage;
}

export function StageTimeline({ stage }: StageTimelineProps) {
  const rows = [
    ['Rassemblement', stage.gatheringTime],
    ['Appel', stage.callTime],
    ['Depart fictif', stage.neutralStartTime],
    ['Depart reel', stage.realStartTime]
  ].filter(([, value]) => value);

  return (
    <section className="glass-card">
      <h2>Programme</h2>
      <ol className="timeline">
        {rows.map(([label, value]) => (
          <li key={label}>
            <span>{value}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>
      {stage.indications.length > 0 && (
        <div className="indications">
          {stage.indications.map((item) => <p key={item}>{item}</p>)}
        </div>
      )}
    </section>
  );
}
