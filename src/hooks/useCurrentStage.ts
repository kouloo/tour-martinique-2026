import { useMemo, useState } from 'react';
import type { Stage, StageStatus } from '../types';
import { getDefaultStageIndex, isSameStageDay } from '../utils/stageSchedule';

export function getStageStatus(stage: Stage, now = new Date()): StageStatus {
  const stageDate = new Date(`${stage.date}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (isSameStageDay(stage, now)) return 'today';
  return stageDate < today ? 'completed' : 'upcoming';
}

export function useCurrentStage(stages: Stage[]) {
  const initialIndex = useMemo(() => {
    return getDefaultStageIndex(stages);
  }, [stages]);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const selectedStage = stages[selectedIndex];

  return {
    selectedStage,
    selectedIndex,
    status: selectedStage ? getStageStatus(selectedStage) : 'upcoming',
    selectStageById: (stageId: string) => {
      const nextIndex = stages.findIndex((stage) => stage.id === stageId);
      if (nextIndex >= 0) setSelectedIndex(nextIndex);
    },
    goPrevious: () => setSelectedIndex((index) => Math.max(0, index - 1)),
    goNext: () => setSelectedIndex((index) => Math.min(stages.length - 1, index + 1)),
    canGoPrevious: selectedIndex > 0,
    canGoNext: selectedIndex < stages.length - 1
  };
}
