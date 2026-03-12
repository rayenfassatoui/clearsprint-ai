import { createOpenAI } from '@ai-sdk/openai';

export const openrouter = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY,
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'ClearSprint AI',
  },
});
