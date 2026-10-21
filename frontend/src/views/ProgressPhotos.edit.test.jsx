// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DEF, useStore } from '../store/useStore.js'
import { ProgressPhotoViewer } from './ProgressPhotos.jsx'

const mocks = vi.hoisted(() => ({ pick: vi.fn() }))
vi.mock('../components/CustomMediaField.jsx', () => ({ useMediaPicker: () => ({ pick: mocks.pick, canAdd: true, showAdd: true, busy: false }) }))
vi.mock('../components/CustomMedia.jsx', () => ({ MediaView: ({ m }) => <span data-hash={m.hash} />, CustomThumb: () => null, useMediaUrl: () => ({}) }))
vi.mock('../lib/media-sync.js', () => ({ syncMedia: vi.fn() }))
const photo = n => ({ kind: 'image', hash: n.toString(16).padStart(64, '0'), mime: 'image/jpeg', size: 100, width: 10, height: 10 })
let root, host, close
const button = label => [...host.querySelectorAll('button')].find(el => el.textContent.trim() === label || el.getAttribute('aria-label') === label)
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const w = { id: 'w', d: '2026-10-01', start: 1, end: 2, entries: [], media: [photo(1)] }
  useStore.setState({ S: { ...structuredClone(DEF), workouts: [w] }, user: null })
  close = vi.fn(); mocks.pick.mockReset()
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  act(() => root.render(<ProgressPhotoViewer p={{ w, d: w.d, m: photo(1) }} close={close} />))
})
afterEach(() => { act(() => root.unmount()); host.remove() })
const pickFile = async () => {
  const input = host.querySelector('input[type=file]')
  Object.defineProperty(input, 'files', { configurable: true, value: [new File(['x'], 'new.jpg', { type: 'image/jpeg' })] })
  await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })); await Promise.resolve() })
}

it('keeps the photo until deletion is confirmed, supports cancel, then closes an empty viewer', () => {
  act(() => button('Delete').click())
  expect(useStore.getState().S.workouts[0].media).toHaveLength(1)
  act(() => button('Cancel').click())
  expect(useStore.getState().S.workouts[0].media).toHaveLength(1)
  act(() => button('Delete').click())
  act(() => host.querySelector('.mviewer-ask button.danger').click())
  expect(useStore.getState().S.workouts[0].media).toBeUndefined()
  expect(close).toHaveBeenCalled()
})

it('replaces only the photo reference and keeps the viewer open on the new photo', async () => {
  mocks.pick.mockResolvedValue(photo(2))
  await pickFile()
  expect(useStore.getState().S.workouts[0].media[0].hash).toBe(photo(2).hash)
  expect(host.querySelector('[data-hash]').getAttribute('data-hash')).toBe(photo(2).hash)
  expect(close).not.toHaveBeenCalled()
})

it('leaves the old reference untouched when image import fails or is cancelled', async () => {
  mocks.pick.mockResolvedValue(null)
  await pickFile()
  expect(useStore.getState().S.workouts[0].media[0].hash).toBe(photo(1).hash)
  expect(close).not.toHaveBeenCalled()
})
