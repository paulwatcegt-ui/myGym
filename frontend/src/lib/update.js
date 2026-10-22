// myGym deliberately has no in-app updater. Keep inert exports for old callers;
// neither version checks nor APK operations may contact the original project.
export function resetUpdateCheck() {}
export async function checkForUpdate() {
  return { hasUpdate: false, latestVersion: __APP_VERSION__, apkUrl: null, hashUrl: null }
}
export async function fetchChecksum() { throw new Error('In-app updates are disabled in myGym') }
export async function downloadAndInstall() { throw new Error('In-app updates are disabled in myGym') }
export async function sha256(buffer) {
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
