// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { registerCustom } from '../lib/exercises.js'
import { _setLangState } from '../lib/i18n-core.js'

const mocks = vi.hoisted(() => ({ S: null, sheet: null, custom: vi.fn(), nav: vi.fn() }))
vi.mock('../store/useStore.js', () => ({ useStore: selector => selector({ S: mocks.S, update: fn => { fn(mocks.S); registerCustom(mocks.S.customEx, mocks.S.exerciseOverrides) } }) }))
vi.mock('../store/useUI.js', () => ({ useUI: { getState: () => ({ toast: vi.fn(), openSheet: render => { mocks.sheet = render } }) } }))
vi.mock('../sheets.jsx', () => ({ customExSheet: (...a) => mocks.custom(...a), deleteCustomEx: vi.fn() }))
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.nav }))
import LibraryManage from './LibraryManage.jsx'

let root, host, sheetRoot, sheetHost
const render = () => act(() => root.render(<LibraryManage />))
const button = (node, name) => [...node.querySelectorAll('button')].find(b => b.textContent.trim() === name)
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  _setLangState('en', {}, null, null)
  mocks.S = { customEx: [], exerciseOverrides: {}, routines: [], workouts: [] }
  mocks.custom.mockClear(); mocks.nav.mockClear(); mocks.sheet = null
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(() => {
  act(() => { root.unmount(); sheetRoot?.unmount() })
  host.remove(); sheetHost?.remove(); sheetRoot = null; sheetHost = null
  registerCustom([])
})

it('hides and restores an existing exercise from the hidden filter', () => {
  render()
  act(() => button(host.querySelector('.item'), 'Hide exercise').click())
  expect(mocks.S.exerciseOverrides['3593'].hidden).toBe(true)
  act(() => button(host, 'Hidden').click())
  expect(host.querySelectorAll('.item')).toHaveLength(1)
  act(() => button(host, 'Restore exercise').click())
  render()
  expect(host.querySelectorAll('.item')).toHaveLength(0)
})

it('saves scope choices while keeping all entries manageable, then restores the scope', () => {
  render()
  const field = [...host.querySelectorAll('fieldset')].find(el => el.querySelector('legend').textContent === 'Equipment')
  const checkbox = [...field.querySelectorAll('label')].find(el => el.textContent === 'dumbbell').querySelector('input')
  act(() => checkbox.click())
  expect(mocks.S.libraryFilterVisibility['equipment:dumbbell'].hidden).toBe(true)
  expect(mocks.S.exerciseOverrides).toEqual({})
  render()
  expect(checkbox.checked).toBe(false)
  act(() => button(host, 'Reset library filters').click())
  expect(mocks.S.libraryFilterVisibility['equipment:dumbbell'].hidden).toBe(false)
})

it('edits built-in text while keeping its id, and opens the existing custom creation form', () => {
  render()
  act(() => button(host, 'Create your own exercise').click())
  expect(mocks.custom).toHaveBeenCalledWith(null)
  act(() => button(host.querySelector('.item'), 'Edit').click())
  sheetHost = document.createElement('div'); document.body.append(sheetHost); sheetRoot = createRoot(sheetHost)
  act(() => sheetRoot.render(mocks.sheet(vi.fn())))
  const input = sheetHost.querySelector('input')
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'My edited exercise')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  act(() => button(sheetHost, 'Save').click())
  expect(mocks.S.exerciseOverrides['3593'].n).toBe('My edited exercise')
  expect(mocks.S.customEx).toEqual([])
})
