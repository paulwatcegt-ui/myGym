import { workoutDuration } from './history.js'
import { fmtDur } from './format.js'
import { dateLocale } from './i18n-core.js'

// Both summaries read completed timestamps, never the active session or estimated set times.
export function totalTrainingTime(workouts) {
  const ms = workouts.reduce((sum, w) => sum + workoutDuration(w), 0)
  if (ms >= 3600000) return (ms / 3600000).toLocaleString(dateLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' h'
  return workouts.length && ms === 0 ? '—' : fmtDur(ms)
}
