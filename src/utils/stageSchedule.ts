import type { RoutePoint, Stage } from '../types';

export interface StageTimeWindow {
  startsAt: Date;
  endsAt: Date;
}

function sameLocalDay(dateIso: string, now = new Date()) {
  const stageDate = new Date(`${dateIso}T00:00:00`);
  return stageDate.getFullYear() === now.getFullYear()
    && stageDate.getMonth() === now.getMonth()
    && stageDate.getDate() === now.getDate();
}

function parseStageDateTime(dateIso: string, time?: string) {
  const match = time?.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, hour, minute] = match;
  return new Date(`${dateIso}T${hour.padStart(2, '0')}:${minute}:00`);
}

function pointTimes(stage: Stage, point: RoutePoint) {
  return point.passageTimes
    ?.map((passage) => parseStageDateTime(stage.date, passage.time))
    .filter((date): date is Date => Boolean(date)) ?? [];
}

export function isSameStageDay(stage: Stage, now = new Date()) {
  return sameLocalDay(stage.date, now);
}

export function getStageTimeWindow(stage: Stage): StageTimeWindow | null {
  const pointDates = stage.points.flatMap((point) => pointTimes(stage, point));
  const fallbackStart = parseStageDateTime(stage.date, stage.realStartTime ?? stage.neutralStartTime);
  const dates = fallbackStart ? [fallbackStart, ...pointDates] : pointDates;
  if (dates.length === 0) return null;

  const timestamps = dates.map((date) => date.getTime());
  return {
    startsAt: new Date(Math.min(...timestamps)),
    endsAt: new Date(Math.max(...timestamps))
  };
}

export function isStageActiveNow(stage: Stage, now = new Date()) {
  if (!isSameStageDay(stage, now)) return false;
  const window = getStageTimeWindow(stage);
  if (!window) return false;
  return now >= window.startsAt && now <= window.endsAt;
}

function representativeTimestamp(stage: Stage, point: RoutePoint) {
  const timestamps = pointTimes(stage, point).map((date) => date.getTime());
  if (timestamps.length === 0) return null;
  return timestamps.reduce((sum, value) => sum + value, 0) / timestamps.length;
}

export function getCurrentRoutePointId(stage: Stage, now = new Date()) {
  if (!isStageActiveNow(stage, now)) return null;

  const candidates = stage.points
    .map((point) => {
      const timestamp = representativeTimestamp(stage, point);
      return timestamp === null ? null : { point, timestamp };
    })
    .filter((candidate): candidate is { point: RoutePoint; timestamp: number } => Boolean(candidate));

  if (candidates.length === 0) return null;

  const nowTime = now.getTime();
  candidates.sort((a, b) => Math.abs(a.timestamp - nowTime) - Math.abs(b.timestamp - nowTime));
  return candidates[0].point.id;
}

export function getDefaultStageIndex(stages: Stage[], now = new Date()) {
  const activeTodayIndex = stages.findIndex((stage) => isStageActiveNow(stage, now));
  if (activeTodayIndex >= 0) return activeTodayIndex;

  const todayIndex = stages.findIndex((stage) => isSameStageDay(stage, now));
  if (todayIndex >= 0) return todayIndex;

  const nextIndex = stages.findIndex((stage) => new Date(`${stage.date}T00:00:00`) > now);
  return nextIndex >= 0 ? nextIndex : Math.max(0, stages.length - 1);
}
