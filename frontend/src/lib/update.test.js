import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkForUpdate, sha256, resetUpdateCheck, fetchChecksum, downloadAndInstall } from './update.js'

// __APP_VERSION__ is defined at build time by vite.config.js (reads package.json).
// In the test environment vitest applies the same define, so it's available here.

describe('sha256', () => {
  it('computes the correct hash for a known input', async () => {
    const input = new TextEncoder().encode('hello world')
    const hash = await sha256(input.buffer)
    // Well-known SHA-256 of "hello world"
    expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')
  })

  it('computes a different hash for different input', async () => {
    const a = await sha256(new TextEncoder().encode('aaa').buffer)
    const b = await sha256(new TextEncoder().encode('bbb').buffer)
    expect(a).not.toBe(b)
  })

  it('returns a 64-character hex string', async () => {
    const hash = await sha256(new TextEncoder().encode('test').buffer)
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('myGym update isolation', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('returns no update without contacting any release server', async () => {
    const fetch = vi.fn(() => { throw new Error('network must not be used') })
    vi.stubGlobal('fetch', fetch)
    resetUpdateCheck()
    expect(await checkForUpdate()).toEqual({ hasUpdate: false, latestVersion: __APP_VERSION__, apkUrl: null, hashUrl: null })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('rejects direct checksum and install calls without downloading', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await expect(fetchChecksum('https://example.com/test.sha256')).rejects.toThrow('disabled')
    await expect(downloadAndInstall('https://example.com/test.apk', '0'.repeat(64))).rejects.toThrow('disabled')
    expect(fetch).not.toHaveBeenCalled()
  })
})
