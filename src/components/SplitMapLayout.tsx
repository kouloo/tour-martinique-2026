import { useRef } from 'react';
import type { ReactNode, PointerEvent } from 'react';
import type { MapHeightMode } from '../hooks/useMapHeightMode';

interface SplitMapLayoutProps {
  mode: MapHeightMode;
  map: ReactNode;
  panel: ReactNode;
  onCyclePanel: () => void;
  onPanelModeChange: (mode: MapHeightMode) => void;
}

export function SplitMapLayout({ mode, map, panel, onCyclePanel, onPanelModeChange }: SplitMapLayoutProps) {
  const dragStartY = useRef<number | null>(null);
  const didDrag = useRef(false);

  const handleDragEnd = (clientY: number) => {
    const height = window.innerHeight || 1;
    const ratio = clientY / height;
    if (ratio < 0.28) onPanelModeChange('expanded');
    else if (ratio > 0.66) onPanelModeChange('peek');
    else onPanelModeChange('balanced');
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragStartY.current = event.clientY;
    didDrag.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const startY = dragStartY.current;
    dragStartY.current = null;
    if (startY === null || Math.abs(event.clientY - startY) < 22) return;
    didDrag.current = true;
    handleDragEnd(event.clientY);
  };

  const handleClick = () => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    onCyclePanel();
  };

  return (
    <div className={`split-layout split-layout--${mode}`}>
      <section className="map-pane" aria-label="Carte du parcours">
        {map}
      </section>
      <section className="info-panel" aria-label="Programme de l'etape">
        <button
          className="sheet-handle"
          type="button"
          aria-label="Changer la hauteur du panneau"
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <span />
        </button>
        <div className="sheet-content">{panel}</div>
      </section>
    </div>
  );
}
