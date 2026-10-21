// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { DEF, useStore } from './store/useStore.js'
import { useUI } from './store/useUI.js'
import { BODYPARTS, CATALOGUE } from './lib/exercises.js'
import { exerciseNameFor } from './lib/i18n.js'
import { exercisePicker } from './sheets.jsx'

vi.setConfig({ testTimeout: 15000 })
let root, host
const rows = () => [...host.querySelectorAll('.item:not(.ex-new)')]
const names = () => rows().map(row => row.querySelector('.tt').textContent)
const button = text => [...host.querySelectorAll('button')].find(el => el.textContent.trim() === text)
const state = patch => useStore.setState({ S: { ...structuredClone(DEF), ...patch }, user: null })
const mount = (pick = vi.fn()) => {
  exercisePicker(pick)
  const sheet = useUI.getState().sheets.at(-1)
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  act(() => root.render(sheet.render(() => {})))
  return pick
}
const search = value => act(() => {
  const input = host.querySelector('.picker-search input')
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
})
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  useUI.setState({ sheets: [], toastMsg: '' }); state({}); document.body.innerHTML = ''
})
afterEach(() => { act(() => root?.unmount()); root = null; host?.remove() })

it('uses the library scope for results and fuzzy search without altering stored plans', () => {
  const libraryFilterVisibility = Object.fromEntries(BODYPARTS.filter(bp => bp !== 'back').map(bp => [`bodyParts:${bp}`, { hidden: true }]))
  libraryFilterVisibility['categories:strength'] = { hidden: true }
  const routines = [{ id: 'r', ex: [{ id: '0025' }] }]
  state({ libraryFilterVisibility, routines })
  mount()
  const expected = CATALOGUE.filter(ex => ex.bp === 'back' && ex.cat && ex.cat !== 'strength')
  const allowed = new Set(expected.map(exerciseNameFor))
  expect(names().length).toBeGreaterThan(0)
  expect(names().every(n => allowed.has(n))).toBe(true)
  expect(host.querySelector('.search-count').textContent).toBe(String(expected.length))
  search('dumbbell curl qwxz')
  expect(names().every(n => allowed.has(n))).toBe(true)
  expect(useStore.getState().S.routines).toEqual(routines)
})

it('shares all three saved tag orders and still offers the original custom creation action', () => {
  state({ libraryFilterOrder: { bodyParts: { values: ['waist', 'back'] }, categories: { values: ['yoga', 'strength'] }, equipment: { values: ['kettlebell', 'barbell'] } } })
  mount()
  const strips = [...host.querySelectorAll('.chips')].map(el => [...el.querySelectorAll('button')].map(b => b.textContent.trim()))
  expect(strips[0].slice(0, 3)).toEqual(['All', 'waist', 'back'])
  expect(strips[1].slice(0, 3)).toEqual(['Any type', 'yoga', 'strength'])
  expect(strips[2].slice(0, 3)).toEqual(['Any equipment', 'kettlebell', 'barbell'])
  expect(host.querySelector('.ex-new')).not.toBeNull()
})

it('keeps row selection and quick add callbacks intact while browsing common exercises first', () => {
  const pick = mount()
  expect(names().slice(0, 3)).toEqual(['barbell squat', 'barbell bench press', 'barbell deadlift'])
  act(() => rows()[0].querySelector('button').click())
  expect(pick).toHaveBeenLastCalledWith(expect.objectContaining({ id: '3593' }), true)
  act(() => rows()[1].click())
  expect(pick).toHaveBeenLastCalledWith(expect.objectContaining({ id: '0025' }))
})

it('keeps an empty group empty in both the normal and muscle views', () => {
  state({ libraryFilterVisibility: Object.fromEntries(BODYPARTS.map(bp => [`bodyParts:${bp}`, { hidden: true }])) })
  mount()
  expect(rows()).toHaveLength(0)
  expect(host.querySelector('.search-count').textContent).toBe('0')
  expect(host.textContent).toContain('No match')
  act(() => button('By muscle').click())
  const biceps = [...host.querySelectorAll('.chips .chip')].find(el => el.textContent.startsWith('Biceps'))
  expect(biceps.textContent).toMatch(/0$/)
  act(() => biceps.click())
  expect(rows()).toHaveLength(0)
})

it('retains favourites and chosen filters within the allowed scope and preserves search relevance', () => {
  state({ favEx: ['0025'], routines: [{ id: 'r', ex: [{ id: '0025' }] }], exerciseOverrides: { '0032': { hidden: true } } })
  mount()
  expect(names()[0]).toBe('barbell bench press')
  expect(names()).not.toContain('barbell deadlift')
  act(() => button('Favourites (1)').click())
  expect(names()).toEqual(['barbell bench press'])
  act(() => button('Chosen (1)').click())
  expect(names()).toEqual(['barbell bench press'])
  act(() => button('All').click())
  search('barbell bench press (knees at 90 degrees)')
  // Personal favourite priority remains part of the original search behavior.
  expect(names()).toContain('barbell bench press (knees at 90 degrees)')
})
