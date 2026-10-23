import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Window } from 'happy-dom'
import { afterEach, expect, it, vi } from 'vitest'
import CoachMemory from './CoachMemory.jsx'
import { exName } from '../lib/coach.js'
import { _setLangState } from '../lib/i18n-core.js'

vi.mock('../lib/api.js', () => ({ api: vi.fn(), IS_APPLE:false, IS_ANDROID:false, BIO:'biometrics' }))
let root, box, win
afterEach(async () => { if (root) await act(async()=>root.unmount()); root=null; _setLangState('en',{},null,null) })
async function mount(S) {
  _setLangState('en',{},null,null)
  win=new Window(); win.document.body.innerHTML='<div id="root"></div>'
  globalThis.window=win; globalThis.document=win.document
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:win.navigator})
  for(const k of ['HTMLElement','Node','Element','Event']) globalThis[k]=win[k]
  globalThis.IS_REACT_ACT_ENVIRONMENT=true
  box=document.getElementById('root');root=createRoot(box)
  const close=vi.fn(),update=vi.fn(fn=>fn(S))
  await act(async()=>root.render(<CoachMemory S={S} update={update} close={close}/>))
  return {close,update}
}
async function click(text) {
  const b=[...box.querySelectorAll('button')].find(b=>b.textContent===text)
  expect(b).toBeTruthy()
  await act(async()=>b.dispatchEvent(new win.Event('click',{bubbles:true})))
}
it('cancel leaves persistent memory, intake and training untouched',async()=>{
  const S={coach:{profile:{memory:'午休训练',goal:'muscle',preferredExerciseIds:['0001']},chat:[{text:'old'}]},routines:[{id:'r1'}]}
  const before=JSON.stringify(S),{update,close}=await mount(S)
  expect(box.textContent).toContain(exName('0001')) // Falls back to ID or catalogue name below.
  await click('Clear memory and preferences');await click('Cancel')
  expect(update).not.toHaveBeenCalled();expect(close).toHaveBeenCalledOnce();expect(JSON.stringify(S)).toBe(before)
})
it('clear is staged until save; save affects only the explicit memory fields',async()=>{
  const S={coach:{profile:{memory:'午休训练',goal:'muscle',preferredExerciseIds:['0001'],avoidedExerciseIds:['0007']},chat:[{text:'old'}]},routines:[{id:'r1'}]}
  const {update}=await mount(S)
  expect(box.querySelector('textarea').value).toBe('午休训练')
  await click('Clear memory and preferences');expect(S.coach.profile.memory).toBe('午休训练')
  await click('Save');expect(update).toHaveBeenCalledOnce()
  expect(S.coach.profile).toEqual({goal:'muscle',memory:'',preferredExerciseIds:[],avoidedExerciseIds:[]})
  expect(S.coach.chat).toEqual([{text:'old'}]);expect(S.routines).toEqual([{id:'r1'}])
})
