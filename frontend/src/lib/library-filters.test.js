import { expect, it } from 'vitest'
import { filterLibraryExercises, libraryFilterVisible, orderLibraryFilters, setLibraryFilterOrder, resetLibraryFilterOrder, setLibraryFilterVisibility, showAllLibraryFilters, visibleLibraryFilters } from './library-filters.js'
import { mergeStates } from './sync-merge.js'
import { allExercises } from './exercises.js'

const sample = [
  { id: 'a', bp: 'back', cat: 'strength', eq: 'dumbbell' },
  { id: 'b', bp: 'back', cat: 'stretching', eq: 'body weight' },
  { id: 'c', bp: 'chest', cat: 'strength', eq: 'dumbbell' },
  { id: 'd', bp: 'back', cat: 'stretching', eq: 'dumbbell' },
  { id: 'custom', bp: 'back', eq: 'body weight' },
]

it('applies saved order, ignores obsolete/duplicate options and appends new options', () => {
  const S = { libraryFilterOrder: { bodyParts: { values: ['chest', 'gone', 'chest', 'back'] } } }
  expect(orderLibraryFilters(S, 'bodyParts', ['back', 'chest', 'waist'])).toEqual(['chest', 'back', 'waist'])
  setLibraryFilterVisibility(S, 'bodyParts', 'back', false)
  expect(visibleLibraryFilters(S, 'bodyParts', ['back', 'chest', 'waist'])).toEqual(['chest', 'waist'])
  showAllLibraryFilters(S)
  expect(visibleLibraryFilters(S, 'bodyParts', ['back', 'chest', 'waist'])).toEqual(['chest', 'back', 'waist'])
})

it('syncs order per group and preserves an explicit reset over older saved orders', () => {
  const a = { unit: 'kg' }, b = { unit: 'kg' }
  setLibraryFilterOrder(a, 'bodyParts', ['chest', 'back'])
  setLibraryFilterOrder(b, 'equipment', ['barbell', 'dumbbell'])
  const together = mergeStates(a, b)
  expect(together.libraryFilterOrder.bodyParts.values).toEqual(['chest', 'back'])
  expect(together.libraryFilterOrder.equipment.values).toEqual(['barbell', 'dumbbell'])
  const old = structuredClone(together)
  resetLibraryFilterOrder(together)
  for (const [left, right] of [[old, together], [together, old]]) {
    expect(mergeStates(left, right).libraryFilterOrder.bodyParts.values).toEqual([])
  }
})

it('combines allowed values within groups and intersects the three groups', () => {
  const S = {}
  expect(filterLibraryExercises(S, sample)).toEqual(sample)
  setLibraryFilterVisibility(S, 'bodyParts', 'chest', false)
  setLibraryFilterVisibility(S, 'categories', 'strength', false)
  expect(filterLibraryExercises(S, sample).map(ex => ex.id)).toEqual(['b', 'd'])
  setLibraryFilterVisibility(S, 'equipment', 'dumbbell', false)
  expect(filterLibraryExercises(S, sample).map(ex => ex.id)).toEqual(['b'])
  showAllLibraryFilters(S)
  expect(filterLibraryExercises(S, sample)).toEqual(sample)
})

it.each([['bodyParts', ['back', 'chest']], ['categories', ['strength', 'stretching']], ['equipment', ['dumbbell', 'body weight']]])('shows no exercises when all %s choices are unchecked', (group, options) => {
  const S = {}
  for (const option of options) setLibraryFilterVisibility(S, group, option, false)
  expect(filterLibraryExercises(S, sample)).toEqual([])
})

it('does not disable a restriction when search or hidden entries remove selected options', () => {
  const S = {}
  setLibraryFilterVisibility(S, 'categories', 'strength', false)
  expect(filterLibraryExercises(S, [sample[0], sample[4]], sample)).toEqual([])
})

it('keeps old profiles and newly introduced options visible by default', () => {
  expect(visibleLibraryFilters({}, 'bodyParts', ['back', 'chest'])).toEqual(['back', 'chest'])
  const S = {}
  setLibraryFilterVisibility(S, 'bodyParts', 'cardio', false)
  expect(libraryFilterVisible(S, 'bodyParts', 'cardio')).toBe(false)
  expect(libraryFilterVisible(S, 'categories', 'cardio')).toBe(true)
  expect(libraryFilterVisible(S, 'bodyParts', 'future-part')).toBe(true)
})

it('changes display preferences without removing exercises, profiles, plans or records', () => {
  const S = { unit: 'kg', customEx: [], equipProfiles: [{ id: 'gym', equipment: ['dumbbell'] }], routines: [{ id: 'r', ex: [{ id: '4209' }] }], workouts: [{ id: 'w', entries: [{ id: '4209', sets: [{ r: 6 }] }] }] }
  const saved = structuredClone(S), count = allExercises(S).length
  setLibraryFilterVisibility(S, 'equipment', 'dumbbell', false)
  setLibraryFilterVisibility(S, 'categories', 'strength', false)
  expect(allExercises(S)).toHaveLength(count)
  for (const field of ['equipProfiles', 'routines', 'workouts']) expect(S[field]).toEqual(saved[field])
  expect(JSON.parse(JSON.stringify(S)).libraryFilterVisibility).toEqual(S.libraryFilterVisibility)
})

it('keeps offline edits to different buttons and syncs an explicit show-all over an older hide', () => {
  const a = { unit: 'kg' }, b = { unit: 'kg' }
  setLibraryFilterVisibility(a, 'bodyParts', 'back', false)
  setLibraryFilterVisibility(b, 'equipment', 'barbell', false)
  const together = mergeStates(a, b)
  expect(libraryFilterVisible(together, 'bodyParts', 'back')).toBe(false)
  expect(libraryFilterVisible(together, 'equipment', 'barbell')).toBe(false)
  const old = structuredClone(together)
  showAllLibraryFilters(together)
  for (const [left, right] of [[old, together], [together, old]]) {
    const result = mergeStates(left, right)
    expect(libraryFilterVisible(result, 'bodyParts', 'back')).toBe(true)
    expect(libraryFilterVisible(result, 'equipment', 'barbell')).toBe(true)
  }
})
