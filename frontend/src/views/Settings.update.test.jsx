// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Settings from './Settings.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// myGym does not check or install in-app updates on any platform. Download
// links and install tips are absent in browser previews and native apps alike.
const mocks = vi.hoisted(() => {
  const state = { S: null, MOBILE: false, android: false }
  state.snapshot = () => ({
    S: state.S,
    user: null,
    update: mut => {
      const next = structuredClone(state.S)
      mut(next)
      state.S = next
    },
    replaceState: vi.fn(), setUser: vi.fn(), pullState: vi.fn(), pushState: vi.fn(),
    signOut: vi.fn(), signOutAll: vi.fn(), resetDemo: vi.fn(), disconnectServer: vi.fn(),
  })
  state.checkForUpdate = vi.fn(() => Promise.resolve({ hasUpdate: true, latestVersion: '9.9.9', apkUrl: 'https://x/opengym.apk', hashUrl: null }))
  state.confirmSheet = vi.fn()
  return state
})
vi.mock('../store/useStore.js', () => {
  const useStore = selector => selector ? selector(mocks.snapshot()) : mocks.snapshot()
  useStore.getState = mocks.snapshot
  return { useStore, DEF: { reminder: { time: '17:30' } }, hasData: () => false }
})
vi.mock('../store/useUI.js', () => {
  const snap = () => ({ toast: vi.fn(), openSheet: vi.fn() })
  const useUI = selector => selector ? selector(snap()) : snap()
  useUI.getState = snap
  return { useUI }
})
vi.mock('react-router-dom', () => ({ useNavigate: () => () => {} }))
vi.mock('../lib/api.js', () => ({
  api: vi.fn(), webauthnOK: () => false, passkeyLogin: vi.fn(), passkeyRegister: vi.fn(), IS_ANDROID: false,
}))
vi.mock('../lib/push.js', () => ({ pushSupported: () => false, enablePush: vi.fn(), disablePush: vi.fn(), sendTestPush: vi.fn() }))
vi.mock('../lib/wakelock.js', () => ({ wakeLockSupported: () => false }))
// MOBILE is read at render time through a getter so one module mock serves both builds.
vi.mock('../lib/mobile.js', () => ({
  get MOBILE() { return mocks.MOBILE },
  isAndroid: () => Promise.resolve(mocks.android),
  shareExport: vi.fn(), syncReminder: vi.fn(),
}))
vi.mock('../lib/update.js', () => ({
  checkForUpdate: (...a) => mocks.checkForUpdate(...a),
  downloadAndInstall: vi.fn(),
}))
vi.mock('./MobileOnboarding.jsx', () => ({ ConnectSheet: () => null }))
vi.mock('../sheets.jsx', () => ({
  starterPlanSheet: vi.fn(), confirmSheet: (...a) => mocks.confirmSheet(...a), importFromApp: vi.fn(),
  importFromHevy: vi.fn(), equipmentProfileSheet: vi.fn(), menuSheet: vi.fn(),
}))

globalThis.__APP_VERSION__ ??= 'test'

let host, root
beforeEach(() => {
  mocks.S = {
    unit: 'kg', restSec: 90, restPauseSec: 15, sound: false, effort: 'none',
    gifSize: 'full', workouts: [], routines: [], exWeights: {},
  }
  mocks.MOBILE = false
  mocks.android = false
  mocks.checkForUpdate.mockClear()
  mocks.confirmSheet.mockClear()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
})
afterEach(() => {
  act(() => root.unmount())
  host.remove()
})

// Allow asynchronous platform detection to settle before checking the rows.
const mount = async () => {
  await act(async () => { root.render(<Settings page="about" />) })
  await act(async () => { await Promise.resolve(); await Promise.resolve() })
}
const updateRow = () => [...host.querySelectorAll('.lrow')].find(r => r.textContent.includes('Update to myGym v9.9.9'))
const checkRow = () => [...host.querySelectorAll('.lrow')].find(r => r.textContent.includes('Check for updates'))
const webRow = () => [...host.querySelectorAll('.lrow')].find(r => r.textContent.includes('Get the Android app (openGym)'))

describe('Settings — in-app update check', () => {
  it('browser and Android open the same official website only when clicked', async () => {
    const open=vi.spyOn(window,'open').mockImplementation(()=>null)
    for (const mobile of [false,true]) {
      mocks.MOBILE=mobile; mocks.android=mobile
      await mount()
      const row=[...host.querySelectorAll('.lrow')].find(r=>r.textContent.includes('Visit the official website to check for updates'))
      expect(row).toBeTruthy()
      const before=open.mock.calls.length
      await act(async()=>row.click())
      expect(open).toHaveBeenCalledTimes(before+1)
      expect(open).toHaveBeenLastCalledWith('https://mygym-ckr.pages.dev/','_blank','noopener,noreferrer')
    }
    open.mockRestore()
  })
  it('browser build: matches the installed app without download or installation tips', async () => {
    await mount()
    expect(mocks.checkForUpdate).not.toHaveBeenCalled()
    expect(updateRow()).toBeUndefined()
    expect(checkRow()).toBeUndefined()
    expect(webRow()).toBeUndefined()
    expect(host.textContent).not.toContain('Get the Android app')
    expect(host.textContent).not.toContain('Add to Home')
    expect(host.querySelector('.sp-version a[href="https://github.com/paulwatcegt-ui/myGym"]')).toBeTruthy()
  })

  it('mobile build on iOS: no check or APK entry', async () => {
    mocks.MOBILE = true
    await mount()
    expect(mocks.checkForUpdate).not.toHaveBeenCalled()
    expect(updateRow()).toBeUndefined()
    expect(checkRow()).toBeUndefined()
    expect(webRow()).toBeUndefined()
  })

  it('Android has no update, download or install entry and never checks releases', async () => {
    mocks.MOBILE = true
    mocks.android = true
    await mount()
    expect(mocks.checkForUpdate).not.toHaveBeenCalled()
    expect(mocks.confirmSheet).not.toHaveBeenCalled()
    expect(updateRow()).toBeUndefined()
    expect(checkRow()).toBeUndefined()
    expect(webRow()).toBeUndefined()
    expect(host.textContent).not.toContain('Download & Install')
    expect(host.querySelector('.lrow').textContent).toContain('Version')
  })
})
