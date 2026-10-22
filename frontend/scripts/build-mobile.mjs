// Cross-platform mobile build. Invoke local CLIs with Node instead of shell env syntax.
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const platform = process.argv[2]
if (platform && !['android', 'ios'].includes(platform)) throw new Error('Expected android or ios')
const env = { ...process.env, VITE_MOBILE: '1' }
for (const args of [
  ['node_modules/vite/bin/vite.js', 'build'],
  ['../scripts/catalogue/stage-media.mjs', 'dist'],
  ['node_modules/@capacitor/cli/bin/capacitor', 'sync', ...(platform ? [platform] : [])],
  ['scripts/check-mobile-bundle.mjs'],
]) {
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
