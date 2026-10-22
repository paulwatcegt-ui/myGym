import { workoutDuration } from './history.js'
import { fmtDur } from './format.js'
import { dateLocale } from './i18n-core.js'

// Both summaries read completed timestamps, never the active session or estimated set times.
export function totalTrainingTime(workouts) {
  const ms = workouts.reduce((sum, w) => sum + workoutDuration(w), 0)
  if (ms >= 3600000) {
    const hours = ms / 3600000
    // These are elapsed-time units, not counts of training days or calendar years.
    // Keep large totals short enough for the narrow two-column Stats cards.
    const [value, unit] = hours >= 24000 ? [hours / (24 * 365), 'y']
      : hours >= 1000 ? [hours / 24, 'd'] : [hours, 'h']
    return value.toLocaleString(dateLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false }) + ' ' + unit
  }
  return workouts.length && ms === 0 ? '–' : fmtDur(ms)
}
