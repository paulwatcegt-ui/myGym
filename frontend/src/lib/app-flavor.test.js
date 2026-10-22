import { expect, it } from 'vitest'
import { mobileFlavor } from '../../scripts/app-flavor.mjs'
it('defaults local development to the APK UI without changing production web or test defaults', () => {
  expect(mobileFlavor({ command: 'serve', mode: 'development' })).toBe(true)
  expect(mobileFlavor({ command: 'build', mode: 'production' })).toBe(false)
  expect(mobileFlavor({ command: 'serve', preview: true })).toBe(false)
  expect(mobileFlavor({ command: 'serve', test: true })).toBe(false)
})
it('honors explicit standalone, self-hosted and demo targets', () => {
  expect(mobileFlavor({ command: 'build', mobile: '1' })).toBe(true)
  expect(mobileFlavor({ command: 'serve', mode: 'mobile' })).toBe(true)
  expect(mobileFlavor({ command: 'serve', mode: 'web', mobile: '1' })).toBe(false)
  expect(mobileFlavor({ command: 'serve', mobile: '0' })).toBe(false)
  expect(mobileFlavor({ command: 'serve', demo: '1' })).toBe(false)
})
