import { afterEach, expect, it } from 'vitest'
import { totalTrainingTime } from './training-time.js'
import { _setLangState } from './i18n-core.js'

afterEach(() => _setLangState('en', {}, null, null))
const records = hours => [{ start: 1, end: 1 + hours * 3600000 }]

it.each([
  [14, '14.0 h'], [999.9, '999.9 h'], [1000, '41.7 d'],
  [24000, '2.7 y'], [99999.9, '11.4 y'], [9999999.9, '1141.6 y'],
])('formats %i elapsed hours in a compact time unit', (hours, text) => {
  _setLangState('en', {}, null, null)
  expect(totalTrainingTime(records(hours))).toBe(text)
})

it('adds records before choosing a unit, without mutating them', () => {
  _setLangState('en', {}, null, null)
  const list = [...records(500), ...records(500)]
  const before = structuredClone(list)
  expect(totalTrainingTime(list)).toBe('41.7 d')
  expect(list).toEqual(before)
})

it('keeps decimal conventions without inserting grouping separators in large values', () => {
  _setLangState('de', {}, null, null)
  expect(totalTrainingTime(records(9999999.9))).toBe('1141,6 y')
})
