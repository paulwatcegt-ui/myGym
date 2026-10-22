import test from 'node:test';
import assert from 'node:assert/strict';
import * as adapters from '../coach/core/adapters/hosted-chat.js';
import { HTTP_PROVIDERS } from '../coach/core/providers.js';
const endpoints = {
  moonshot: 'https://api.moonshot.cn/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  minimax: 'https://api.minimax.cn/v1/chat/completions',
  spark: 'https://spark-api-open.xf-yun.com/v1/chat/completions',
  hunyuan: 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
};
for (const [id, adapter] of Object.entries(adapters)) {
  test(id + ': configured model reaches the official route with provider-specific bearer auth', async () => {
    const calls = [];
    const fetch = async (url, init) => { calls.push({url, ...init, body: JSON.parse(init.body)}); return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: '{"ok":true}', reasoning_content: 'private reasoning' }, finish_reason: 'stop' }] }) }; };
    const env = { [HTTP_PROVIDERS[id].apiKeyEnv]: 'test-' + id };
    const r = await adapter.invoke({ cfg: {}, env, model: 'account-model-id', prompt: 'Return JSON', schema: { type: 'object' }, fetch });
    assert.equal(r.code, 0); assert.equal(r.text, '{"ok":true}');
    const c = calls[0]; assert.equal(c.url, endpoints[id]);
    assert.equal(c.headers.authorization, 'Bearer test-' + id);
    assert.equal(c.body.model, 'account-model-id'); assert.equal(c.body.stream, false);
    assert.equal(c.url.includes('test-'), false);
    if (id === 'minimax') { assert.equal(c.body.reasoning_split, true); assert.equal(c.body.max_completion_tokens, 16000); }
    else assert.equal(c.body.max_tokens, id === 'spark' ? 4096 : 16000);
    if (['minimax', 'hunyuan'].includes(id)) assert.equal(c.body.response_format, undefined);
    else assert.deepEqual(c.body.response_format, { type: 'json_object' });
  });
  test(id + ': missing or different-provider credentials and missing model never send a request', async () => {
    let calls = 0; const fetch = async () => { calls++; throw Error('must not send'); };
    const noKey = await adapter.invoke({ cfg: {}, env: { OPENAI_API_KEY: 'other-key' }, model: 'm', prompt: 'P', fetch });
    assert.equal(noKey.spawnError, true);
    const noModel = await adapter.invoke({ cfg: {}, env: { [HTTP_PROVIDERS[id].apiKeyEnv]: 'test-key' }, prompt: 'P', fetch });
    assert.equal(noModel.code, 1); assert.match(noModel.stderr, /no model/); assert.equal(calls, 0);
  });
  test(id + ': unauthorized and truncated responses remain failures', async () => {
    const env = { [HTTP_PROVIDERS[id].apiKeyEnv]: 'test-key' };
    const denied = await adapter.invoke({ cfg: {}, env, model: 'm', prompt: 'P', fetch: async () => ({ ok: false, status: 401, text: async () => '{"error":{"message":"invalid key"}}' }) });
    assert.equal(denied.code, 1); assert.match(denied.stderr, /^401/);
    const cut = await adapter.invoke({ cfg: {}, env, model: 'm', prompt: 'P', fetch: async () => ({ ok: true, status: 200, text: async () => '{"choices":[{"message":{"content":"{"},"finish_reason":"length"}]}' }) });
    assert.equal(cut.code, 1); assert.match(cut.stderr, /cut off/);
  });
}
