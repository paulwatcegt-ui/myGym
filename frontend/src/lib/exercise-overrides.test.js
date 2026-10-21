import { afterEach, expect, it } from 'vitest'
import { EXDB, EXALIAS } from './exercises-data.js'
import { EXIDX, allExercises, registerCustom, isCustomEx } from './exercises.js'
import { saveExerciseOverride } from './exercise-overrides.js'
import { mergeStates, localExtras } from './sync-merge.js'
import { exerciseNameFor, descFor, instrFor, _setLangState } from './i18n-core.js'

afterEach(() => { registerCustom([]); _setLangState('en', {}, null, null) })
const state = () => ({ unit: 'kg', customEx: [], exerciseOverrides: {}, routines: [{ id: 'r1', ex: [{ id: EXDB[0].id }] }], workouts: [{ id: 'w1', entries: [{ id: EXDB[0].id, sets: [{ w: 20, r: 8 }] }] }] })

it('hides choices without deleting the exercise, planned slots, or logged sets', () => {
  const S = state(), saved = JSON.stringify([S.routines, S.workouts])
  saveExerciseOverride(S, EXDB[0].id, { hidden: true })
  registerCustom(S.customEx, S.exerciseOverrides)
  expect(allExercises(S).some(ex => ex.id === EXDB[0].id)).toBe(false)
  expect(allExercises(S, { includeHidden: true }).some(ex => ex.id === EXDB[0].id)).toBe(true)
  expect(EXIDX[EXDB[0].id].id).toBe(EXDB[0].id)
  expect(JSON.stringify([S.routines, S.workouts])).toBe(saved)
  saveExerciseOverride(S, EXDB[0].id, { hidden: false })
  expect(allExercises(S).some(ex => ex.id === EXDB[0].id)).toBe(true)
})

it('edits built-ins and their drawing aliases without mutating the catalogue', () => {
  const S = state(), [alias, id] = Object.entries(EXALIAS)[0]
  const original = EXIDX[id]
  saveExerciseOverride(S, id, { n: 'Personal name', desc: 'Personal description', st: ['Personal cue'] })
  registerCustom([], S.exerciseOverrides)
  expect(EXIDX[alias]).toBe(EXIDX[id])
  expect(EXIDX[id].n).toBe('Personal name')
  expect(isCustomEx(EXIDX[id])).toBe(false)
  expect(original.n).not.toBe('Personal name')
  _setLangState('zh', {}, { [id]: ['原要领'] }, { [id]: '原名称' })
  expect(exerciseNameFor(EXIDX[id])).toBe('Personal name')
  expect(descFor(EXIDX[id])).toBe('Personal description')
  expect(instrFor(EXIDX[id])).toEqual(['Personal cue'])
  saveExerciseOverride(S, id, {}, true)
  registerCustom([], S.exerciseOverrides)
  expect(EXIDX[id].n).toBe(original.n)
})

it('merges edits per exercise and preserves a later restore against an older hidden copy', () => {
  const S = state()
  saveExerciseOverride(S, 'a', { n: 'A', hidden: true })
  const old = structuredClone(S)
  saveExerciseOverride(S, 'a', { hidden: false })
  saveExerciseOverride(old, 'b', { n: 'B' })
  for (const [left, right] of [[S, old], [old, S]]) {
    const merged = mergeStates(left, right)
    expect(merged.exerciseOverrides.a.hidden).toBe(false)
    expect(merged.exerciseOverrides.b.n).toBe('B')
    expect(merged.routines).toEqual(S.routines)
    expect(merged.workouts).toEqual(S.workouts)
  }
})

it('includes guest-only catalogue edits in the sign-in keep-data prompt', () => {
  expect(localExtras({ exerciseOverrides: { 4209: { hidden: true, _ts: 123 } } }, {}).setup).toBe(1)
})
