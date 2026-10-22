// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { DEF, useStore } from '../store/useStore.js'
import { _setLangState } from '../lib/i18n-core.js'
import Home from './Home.jsx'

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))
vi.mock('../sheets.jsx', () => ({
  starterPlanSheet: vi.fn(), bwSheet: vi.fn(), goalSheet: vi.fn(), dayOverrideSheet: vi.fn(),
  calendarSheet: vi.fn(), startFlow: vi.fn(), bwDeltaColor: () => '', weighInsSheet: vi.fn(),
}))
import { calendarSheet } from '../sheets.jsx'

let root, host
const workout = ms => ({ id: 'w' + ms, d: '2026-10-01', start: 1000000, end: 1000000 + ms, entries: [] })
const mount = (workouts, active = null) => {
  useStore.setState({ S: { ...structuredClone(DEF), workouts, active, showWeightCard: false }, user: null })
  const before = structuredClone(useStore.getState().S)
  act(() => root.render(<Home />))
  expect(useStore.getState().S).toEqual(before)
  return [...host.querySelectorAll('.card')].find(el => el.textContent.includes('Total training time'))
}
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  _setLangState('en', {}, null, null)
  vi.clearAllMocks()
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(() => { act(() => root.unmount()); host.remove() })

it.each([
  [0, '0 min'], [45 * 60000, '45 min'], [3599999, '59 min'],
  [3600000, '1.0 h'], [5400000, '1.5 h'], [7200000, '2.0 h'],
])('shows the requested units for %i ms', (ms, text) => {
  expect(mount(ms ? [workout(ms)] : []).textContent).toContain('Total training time ' + text)
  expect(host.textContent).not.toContain('week streak')
})

it('adds recorded sessions before rounding, supports timestamp strings and excludes the running session', () => {
  const workouts = [workout(30 * 60000), { ...workout(30 * 60000), id: 'second', start: '1000000', end: '2800000' }, { id: 'imported', d: '2026-10-01', entries: [] }]
  const active = { id: 'running', start: Date.now() - 3 * 3600000, entries: [], name: 'Running' }
  expect(mount(workouts, active).textContent).toContain('Total training time 1.0 h')
})

it('accumulates sub-minute durations before formatting and keeps calendar access/style', () => {
  const card = mount([workout(30000), { ...workout(30000), id: 'second' }])
  expect(card.textContent).toContain('Total training time 1 min')
  expect(card.className).toBe('card tappable')
  expect(card.querySelector('svg').getAttribute('style')).toContain('var(--orange)')
  act(() => card.click())
  expect(calendarSheet).toHaveBeenCalledTimes(1)
})

it('shows unknown rather than estimating when completed records have no usable duration', () => {
  const invalid = [
    { id: 'import', d: '2026-10-01', entries: [] },
    { ...workout(1000), id: 'reverse', start: 2000, end: 1000 },
    { ...workout(1000), id: 'bad', start: 'unknown' },
    { ...workout(1000), id: 'missing', end: undefined },
  ]
  expect(mount(invalid).textContent).toContain('Total training time –')
})
