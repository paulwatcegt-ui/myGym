import { afterEach, expect, it } from 'vitest'
import { EXDB } from './exercises-data.js'
import zhInstructions from '../instr/zh.js'
import zhDescriptions from '../exercise-desc/zh.js'
import enInstructions from '../instr/en.js'
import enDescriptions from '../exercise-desc/en.js'
import { _setLangState, _setDetails, instrFor, descFor, instrTranslated } from './i18n-core.js'

afterEach(() => { _setLangState('en', {}, null, null); _setDetails(enInstructions, enDescriptions, null, 'en') })

it('has Chinese descriptions and complete ordered steps for every built-in exercise', () => {
  _setLangState('zh', {}, zhInstructions, null)
  _setDetails(enInstructions, enDescriptions, zhDescriptions, 'zh')
  for (const ex of EXDB) {
    expect(descFor(ex), ex.id).toMatch(/[\u3400-\u9fff]/u)
    expect(descFor(ex), ex.id).not.toBe(enDescriptions[ex.id])
    expect(instrTranslated(ex), ex.id).toBe(true)
    expect(instrFor(ex), ex.id).toHaveLength(enInstructions[ex.id].length)
    instrFor(ex).forEach((step, i) => {
      expect(step, `${ex.id} step ${i + 1}`).toMatch(/[\u3400-\u9fff]/u)
      expect(step, `${ex.id} step ${i + 1}`).not.toBe(enInstructions[ex.id][i])
    })
  }
})

it('switches details with the selected language independently of English-only exercise names', () => {
  const ex = EXDB.find(ex => ex.id === '4209')
  _setLangState('zh', {}, zhInstructions, null, false, true)
  _setDetails(enInstructions, enDescriptions, zhDescriptions, 'zh')
  expect(descFor(ex)).toContain('单腿蹬地起跳')
  expect(instrFor(ex)).toHaveLength(6)
  _setLangState('en', {}, null, null)
  expect(descFor(ex)).toBe(enDescriptions[ex.id])
  expect(instrFor(ex)).toEqual(enInstructions[ex.id])
})
