import { afterEach, expect, it } from 'vitest'
import { _setLangState, t } from './i18n-core.js'
import zh from '../locales/zh.js'
import { readFileSync } from 'node:fs'

afterEach(() => _setLangState('en', {}, null, null))
it('rebrands reviewed UI messages in English and Chinese', () => {
  _setLangState('en', {}, null, null)
  expect(t('Reload openGym')).toBe('Reload myGym')
  expect(t('That file isn’t an openGym backup.')).toBe('That file isn’t a myGym backup.')
  expect(t('Made with openGym')).toBe('Made with myGym')
  _setLangState('zh', zh, null, null)
  expect(t('Reload openGym')).toBe('重新加载 myGym')
})
it('keeps user values, unknown text, legal notices and backup paths intact', () => {
  _setLangState('en', {}, null, null)
  expect(t('openGym')).toBe('openGym')
  const key = 'openGym can no longer write to “{0}”, so copies go to Documents/openGym again. Choose the folder again to switch back.'
  expect(t(key, 'my openGym folder')).toBe('myGym can no longer write to “my openGym folder”, so copies go to Documents/openGym again. Choose the folder again to switch back.')
  expect(t('Media licensed for use in openGym only')).toBe('Media licensed for use in openGym only')
})
it('changes only display names in PWA and Android configuration', () => {
  const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')
  const manifest = JSON.parse(read('../../public/manifest.json'))
  expect([manifest.name, manifest.short_name]).toEqual(['myGym', 'myGym'])
  const capacitor = JSON.parse(read('../../capacitor.config.json'))
  expect(capacitor.appName).toBe('myGym')
  expect(capacitor.appId).toBe('ch.duartesantos.opengym')
  const xml = read('../../android/app/src/main/res/values/strings.xml')
  expect(xml).toContain('name="app_name">myGym<')
  expect(xml).toContain('name="package_name">ch.duartesantos.opengym<')
  expect(read('../../android/app/build.gradle')).toContain('applicationId "ch.duartesantos.opengym"')
})
