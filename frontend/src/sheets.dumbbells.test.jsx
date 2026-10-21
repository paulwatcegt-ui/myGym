// @vitest-environment happy-dom
// Removing inventory management must not discard the weights existing workouts still use.
import { beforeEach, expect, it } from 'vitest'
import { useStore, DEF } from './store/useStore.js'
import { EXDB } from './lib/exercises.js'
import { ownedWeightsFor } from './lib/dumbbells.js'
import { inventoryFor } from './lib/plates.js'
import { activeProfile, exAvailable } from './lib/equipment.js'

beforeEach(() => {
  useStore.setState({ S: { ...structuredClone(DEF), unit: 'kg' }, user: null })
})

it('keeps saved equipment usable after an unrelated settings change', () => {
  const equipment = {
    equipProfiles: [{ id: 'home', name: 'Home', equipment: ['dumbbell', 'bench'], accV: 1 }],
    activeEquipId: 'home', equipFilterOn: true,
    plates: { kg: { 20: 2, _ts: 100 } },
    dumbbells: { kg: { weights: [5, 10, 15], _ts: 200 }, lb: { weights: [10, 20], _ts: 300 } },
  }
  useStore.setState(s => ({ S: { ...s.S, ...structuredClone(equipment) } }))
  useStore.getState().update(s => { s.restSec = 105 })
  const saved = useStore.getState().S
  for (const [key, value] of Object.entries(equipment)) expect(saved[key]).toEqual(value)
  expect(activeProfile(saved).name).toBe('Home')
  const exercise = EXDB.find(ex => ex.eq === 'dumbbell' && !/bench|incline|decline/i.test(ex.n))
  expect(exAvailable(saved, exercise)).toBe(true)
  expect(ownedWeightsFor(saved, { id: exercise.id })).toEqual([5, 10, 15])
  expect(inventoryFor(saved)).toEqual([{ w: 20, n: 2 }])
})
