import { useState } from 'react';

export type MapHeightMode = 'peek' | 'balanced' | 'expanded';

export function useMapHeightMode() {
  const [mode, setMode] = useState<MapHeightMode>('balanced');
  const cycleMode = () => {
    setMode((current) => {
      if (current === 'peek') return 'balanced';
      if (current === 'balanced') return 'expanded';
      return 'peek';
    });
  };

  return {
    mode,
    isFullscreen: mode === 'peek',
    setMode,
    toggleMode: () => setMode((current) => (current === 'peek' ? 'balanced' : 'peek')),
    cycleMode,
    setSplit: () => setMode('balanced')
  };
}
