const test = require('node:test');
const assert = require('node:assert/strict');

const { fallbackSuggestions, generateStructuredResponse } = require('../utils/ai');
const { createAccessToken } = require('../utils/jwt');

test('fallbackSuggestions returns guidance for study prompts', () => {
  const suggestions = fallbackSuggestions('Help me study for my exam next week');
  assert.ok(Array.isArray(suggestions));
  assert.ok(suggestions.length >= 3);
  assert.match(suggestions.join(' '), /study|review|practice/i);
});

test('createAccessToken signs a token with expected claims', () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = createAccessToken({ _id: '507f1f77bcf86cd799439011', email: 'user@example.com', role: 'member' });
  assert.equal(typeof token, 'string');
  assert.ok(token.split('.').length === 3);
});

test('generateStructuredResponse uses fallback when OPENAI_API_KEY is missing', async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  const result = await generateStructuredResponse({
    systemPrompt: 'You are a helpful assistant',
    userPrompt: 'Plan my project meeting',
  });

  assert.equal(typeof result.text, 'string');
  assert.ok(Array.isArray(result.structured.suggestions));
  assert.ok(result.structured.suggestions.length > 0);

  if (previous !== undefined) {
    process.env.OPENAI_API_KEY = previous;
  }
});
