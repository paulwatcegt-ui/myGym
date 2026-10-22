import { expect, it, vi } from 'vitest'
const wire = vi.hoisted(() => ({ fetch: vi.fn() }))
vi.mock('./capacitor-fetch.js', () => ({ nativeFetch: (...args) => wire.fetch(...args) }))
import { ADAPTERS, localModels } from './coach-local.js'
it('the phone registers DeepSeek and uses nativeFetch with a DeepSeek bearer key', async () => {
  wire.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: [{ id: 'deepseek-flash' }] }) })
  expect(ADAPTERS.deepseek.id).toBe('deepseek')
  const r = await localModels({ provider: 'deepseek' }, 'test-deepseek-key')
  expect(r).toMatchObject({ ok: true, models: ['deepseek-flash'] })
  expect(wire.fetch.mock.calls[0][0]).toBe('https://api.deepseek.com/models')
  expect(wire.fetch.mock.calls[0][1].headers.authorization).toBe('Bearer test-deepseek-key')
})


it('the phone registers all six additional hosted adapters from the shared provider table', async () => {
  const { HTTP_PROVIDERS } = await import('../../../api/coach/core/providers.js')
  for (const id of ['moonshot', 'zhipu', 'minimax', 'spark', 'hunyuan', 'doubao']) {
    expect(ADAPTERS[id].id).toBe(id)
    expect(HTTP_PROVIDERS[id].modelEntry).toBe(true)
    wire.fetch.mockClear()
    wire.fetch.mockResolvedValue({ ok: false, status: 404, text: async () => '{}' })
    const r = await localModels({ provider: id }, 'test-' + id)
    expect(r.ok).toBe(false)
    expect(wire.fetch.mock.calls[0][1].headers.authorization).toBe('Bearer test-' + id)
    expect(wire.fetch.mock.calls[0][0]).toContain(new URL(HTTP_PROVIDERS[id].defaultBase).host)
  }
})
