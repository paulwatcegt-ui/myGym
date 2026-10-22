// DeepSeek official API: https://api-docs.deepseek.com/
// Use its documented JSON-object output, not OpenAI's JSON-schema extension.
import { httpAdapter } from './http.js';
import { chatCompletionsSpec } from './openai.js';
const chat = chatCompletionsSpec('deepseek', { maxTokensField: 'max_tokens' });
export const deepseekSpec = {
  ...chat,
  path: () => '/chat/completions',
  modelsPath: '/models',
  body: args => ({
    ...chat.body(args),
    response_format: { type: 'json_object' },
    // Keep the bounded structured coach response out of the default thinking mode.
    thinking: { type: 'disabled' },
    stream: false
  })
};
export default httpAdapter(deepseekSpec);
