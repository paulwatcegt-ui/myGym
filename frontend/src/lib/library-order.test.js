import { expect, it } from 'vitest'
import { CATALOGUE, searchExercises } from './exercises.js'
import { sortCommonExercisesFirst } from './library-order.js'
import { sortFavouritesFirst } from './favourites.js'

it('puts the basic version ahead of rare variants without changing or losing entries', () => {
  const ids = ['3174', '0025', '3593', '0032', '4209']
  const input = ids.map(id => CATALOGUE.find(ex => ex.id === id))
  expect(input.every(Boolean)).toBe(true)
  const before = structuredClone(input)
  expect(sortCommonExercisesFirst(input).map(ex => ex.id)).toEqual(['3593', '0025', '0032', '3174', '4209'])
  expect(input).toEqual(before)
})

it('keeps custom entries first and favourites above common exercises', () => {
  const custom = { id: 'my-squat', n: 'my exercise', custom: true }
  const bench = CATALOGUE.find(ex => ex.id === '0025')
  const other = CATALOGUE.find(ex => ex.id === '4209')
  const sorted = sortCommonExercisesFirst([other, bench, custom])
  expect(sorted).toEqual([custom, bench, other])
  expect(sortFavouritesFirst(sorted, { favEx: [other.id] })).toEqual([other, custom, bench])
})

it('uses IDs even after renaming and ranks only entries remaining in the filtered list', () => {
  const bench = { ...CATALOGUE.find(ex => ex.id === '0025'), n: '我的卧推' }
  const other = CATALOGUE.find(ex => ex.id === '4209')
  expect(sortCommonExercisesFirst([other, bench])).toEqual([bench, other])
  expect(sortCommonExercisesFirst([other])).toEqual([other])
})

it('leaves an exact search match ahead of a popular variation', () => {
  const sorted = sortCommonExercisesFirst(CATALOGUE)
  expect(searchExercises(sorted, 'barbell bench press (knees at 90 degrees)')[0].id).toBe('3174')
})
