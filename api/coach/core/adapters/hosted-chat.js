// Official hosted Chat Completions endpoints. Each provider has independent credentials.
// See docs/MYGYM_AI_PROVIDERS.md for source links and model selection requirements.
import { httpAdapter } from './http.js';
import { chatCompletionsSpec } from './openai.js';
function hosted(id, { json = true, minimax = false, maxTokens = 16000 } = {}) {
  const chat = chatCompletionsSpec(id, { maxTokensField: minimax ? 'max_completion_tokens' : 'max_tokens' });
  return httpAdapter({
    ...chat,
    body: args => {
      const body = { ...chat.body({ ...args, maxTokens: Math.min(args.maxTokens, maxTokens) }), stream: false };
      if (json) body.response_format = { type: 'json_object' };
      else delete body.response_format;
      // MiniMax may include <think> text in content unless reasoning is split explicitly.
      if (minimax) body.reasoning_split = true;
      return body;
    }
  });
}
export const moonshot = hosted('moonshot');
export const zhipu = hosted('zhipu');
export const minimax = hosted('minimax', { json: false, minimax: true });
// The shared HTTP endpoint also serves Lite, whose documented output cap is 4096.
export const spark = hosted('spark', { maxTokens: 4096 });
export const hunyuan = hosted('hunyuan', { json: false });
export const doubao = hosted('doubao');
