// Local development previews the same standalone UI as the Android build.
// Self-hosted web and public demo builds remain explicit, separate targets.
export function mobileFlavor({ command, mode, preview = false, test = false, mobile, demo } = {}) {
  if (mode === 'mobile') return true
  if (mode === 'web') return false
  if (mobile === '1') return true
  if (mobile === '0' || demo === '1') return false
  return command === 'serve' && !preview && !test
}
