// @vitest-environment happy-dom
import React, { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import LibraryFilterGroup from './LibraryFilterGroup.jsx'

let root, host, saved
const initial = { libraryFilterVisibility: { 'bodyParts:chest': { hidden: true } }, routines: [{ id: 'r' }], workouts: [{ id: 'w' }] }
function Harness() {
  const [S, setS] = useState(structuredClone(initial))
  saved = S
  return <LibraryFilterGroup S={S} update={mut => setS(old => { const next = structuredClone(old); mut(next); return next })} group="bodyParts" label="Body part" options={['back', 'chest', 'waist']} />
}
const labels = () => [...host.querySelectorAll('label')].map(el => el.textContent)
const handle = name => host.querySelector(`[aria-label="Reorder ${name}"]`)
const pointer = (el, type, x, y, pointerType = 'mouse') => act(() => el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y, pointerType })))
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  act(() => root.render(<Harness />))
  host.querySelector('.library-filter-grid').setPointerCapture = vi.fn()
  const rects = [[0, 0], [160, 0], [0, 44]]
  ;[...host.querySelectorAll('.library-filter-option')].forEach((el, i) => {
    el.getBoundingClientRect = () => ({ left: rects[i][0], top: rects[i][1], width: 140, height: 34 })
  })
})
afterEach(() => { act(() => root.unmount()); host.remove() })

it('drags horizontally across a grid, saves once on release and preserves checkbox values/data', () => {
  const grip = handle('back')
  pointer(grip, 'pointerdown', 70, 17)
  const grid = host.querySelector('.library-filter-grid')
  expect(grid.setPointerCapture).toHaveBeenCalledWith(1)
  pointer(grid, 'pointermove', 230, 17)
  expect(labels()).toEqual(['chest', 'back', 'waist'])
  expect(saved.libraryFilterOrder).toBeUndefined()
  pointer(grid, 'pointerup', 230, 17)
  expect(saved.libraryFilterOrder.bodyParts.values).toEqual(['chest', 'back', 'waist'])
  expect(host.querySelector('label input').checked).toBe(false)
  expect(saved.libraryFilterVisibility).toEqual(initial.libraryFilterVisibility)
  expect(saved.routines).toEqual(initial.routines)
  expect(saved.workouts).toEqual(initial.workouts)
})

it('supports touch moves across rows and discards a cancelled gesture', () => {
  const grip = handle('back')
  pointer(grip, 'pointerdown', 70, 17, 'touch')
  pointer(grip, 'pointermove', 70, 61, 'touch')
  expect(labels()).toEqual(['chest', 'waist', 'back'])
  pointer(grip, 'pointercancel', 70, 61, 'touch')
  expect(labels()).toEqual(['back', 'chest', 'waist'])
  expect(saved.libraryFilterOrder).toBeUndefined()
})

it('supports keyboard ordering without changing visibility, and leaves ordinary taps alone', () => {
  const grip = handle('back')
  pointer(grip, 'pointerdown', 70, 17)
  pointer(grip, 'pointerup', 70, 17)
  expect(saved.libraryFilterOrder).toBeUndefined()
  act(() => grip.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })))
  expect(labels()).toEqual(['chest', 'back', 'waist'])
  expect(saved.libraryFilterVisibility).toEqual(initial.libraryFilterVisibility)
})
