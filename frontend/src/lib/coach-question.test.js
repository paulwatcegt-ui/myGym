import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { _setLangState } from './i18n-core.js'
import zhNames from '../exercise-names/zh.js'
import { EXIDX, registerCustom } from './exercises.js'
import { exName } from './coach.js'
const memory = vi.hoisted(() => ({ data: null, response: null }))
vi.mock('./mobile.js', () => ({ MOBILE: true, readJsonFile: async () => memory.data, writeJsonFile: async (_,d) => { memory.data = structuredClone(d) } }))
vi.mock('./coach-secrets.js', () => ({ getApiKey: async () => 'test-secret', setApiKey: async () => {}, clearApiKey: async () => {} }))
vi.mock('./capacitor-fetch.js', () => ({ nativeFetch: async () => ({ ok: true, status: 200, text: async () => JSON.stringify({choices:[{message:{content:JSON.stringify(memory.response)},finish_reason:'stop'}]}) }) }))
const local = await import('./coach-local.js')
const { _resetCoachDevice } = await import('./coach-device.js')
beforeEach(() => { _resetCoachDevice(); local._resetLocal(); memory.data={mode:'byok',provider:'deepseek',model:'test',pending:{id:'keep',kind:'create',bundle:{routines:[],week:{}}}}; memory.response={coach_contract:1,answer:'这是中文训练解释。'} })
afterEach(() => { _setLangState('en',{},null,null); registerCustom([],{}); local._resetLocal(); _resetCoachDevice() })
it('coach labels use the active Chinese pack and personal/custom names, respecting English-only preference', () => {
  _setLangState('zh',{},null,zhNames,false)
  expect(exName('0001')).toBe(zhNames['0001'])
  registerCustom([{id:'custom-test',n:'我的自建动作'}],{'0001':{n:'我的改名'}})
  expect(exName('0001')).toBe('我的改名'); expect(exName('custom-test')).toBe('我的自建动作')
  registerCustom([],{}); _setLangState('zh',{},null,zhNames,false,true)
  expect(exName('0001')).toBe(EXIDX['0001'].n)
})
it('phone question answers keep pending proposals and training data untouched', async () => {
  const state={lang:'zh',routines:[],workouts:[],week:{},customEx:[],bodyweight:[],coach:{consent:{agreedAt:'2026-01-01'},profile:{goal:'strength',equipment:[]}}}
  const before=JSON.stringify(state), pending=structuredClone(memory.data.pending)
  await local.localQuestion(state,'为什么是三组？')
  for(let n=0;n<100&&(await local.localStatus()).job;n++)await new Promise(r=>setTimeout(r,5))
  const status=await local.localStatus()
  expect(status.last).toMatchObject({kind:'question',outcome:'answered',answer:'这是中文训练解释。'})
  expect(status.pending).toEqual(pending); expect(JSON.stringify(state)).toBe(before)
  expect(JSON.stringify(memory.data)).not.toContain('test-secret')
})
