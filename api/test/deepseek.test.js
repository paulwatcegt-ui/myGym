import test from 'node:test';
import assert from 'node:assert/strict';
import deepseek from '../coach/core/adapters/deepseek.js';
import { HTTP_PROVIDERS } from '../coach/core/providers.js';
const env = { DEEPSEEK_API_KEY: 'test-deepseek-key' };
function transport(body, status = 200) {
  const calls = [];
  const fetch = async (url, init) => { calls.push({ url, ...init, body: init.body ? JSON.parse(init.body) : null }); return { ok: status === 200, status, text: async () => JSON.stringify(body) }; };
  return { fetch, calls };
}
test('DeepSeek lists models from its official host with its own credential', async () => {
  const f = transport({ data: [{ id: 'deepseek-flash' }, { id: 'deepseek-v4-pro' }] });
  const r = await deepseek.models({}, env, f);
  assert.deepEqual(r.models, ['deepseek-flash', 'deepseek-v4-pro']);
  assert.equal(f.calls[0].url, 'https://api.deepseek.com/models');
  assert.equal(f.calls[0].headers.authorization, 'Bearer test-deepseek-key');
});
test('DeepSeek uses JSON-object output and max_tokens even when the pipeline passes a schema', async () => {
  const f = transport({ choices: [{ message: { content: '{"nochange":true}', reasoning_content: 'ignore this' }, finish_reason: 'stop' }] });
  const r = await deepseek.invoke({ env, cfg: {}, prompt: 'Return JSON', schema: { type: 'object' }, maxTokens: 4000, fetch: f.fetch });
  assert.equal(r.code, 0); assert.equal(r.text, '{"nochange":true}');
  const c = f.calls[0];
  assert.equal(c.url, 'https://api.deepseek.com/chat/completions');
  assert.equal(c.body.model, HTTP_PROVIDERS.deepseek.defaultModel);
  assert.deepEqual(c.body.response_format, { type: 'json_object' });
  assert.equal(c.body.max_tokens, 4000); assert.equal(c.body.max_completion_tokens, undefined);
  assert.deepEqual(c.body.thinking, { type: 'disabled' });
  assert.equal(c.body.stream, false);
  assert.match(c.body.messages[0].content, /json/i);
});
test('DeepSeek refuses missing keys and classifies authentication errors and truncated output', async () => {
  const f = transport({}, 401);
  const missing = await deepseek.invoke({ env: { OPENAI_API_KEY: 'wrong-provider-key' }, cfg: {}, prompt: 'P', fetch: f.fetch });
  assert.equal(missing.spawnError, true); assert.equal(f.calls.length, 0);
  const refused = await deepseek.invoke({ env, cfg: {}, prompt: 'P', fetch: f.fetch });
  assert.equal(refused.code, 1); assert.match(refused.stderr, /^401/);
  const cut = transport({ choices: [{ message: { content: '{' }, finish_reason: 'length' }] });
  const truncated = await deepseek.invoke({ env, cfg: {}, prompt: 'P', fetch: cut.fetch });
  assert.equal(truncated.code, 1);
});
