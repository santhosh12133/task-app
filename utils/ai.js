const OpenAI = require('openai');
const { env } = require('../config/env');

function getClient() {
  if (!env.openAiApiKey) {
    return null;
  }

  return new OpenAI({ apiKey: env.openAiApiKey });
}

function fallbackSuggestions(prompt) {
  const normalizedPrompt = String(prompt || '').toLowerCase();

  if (normalizedPrompt.includes('exam') || normalizedPrompt.includes('study')) {
    return [
      'Break the topic into 3 focused study blocks',
      'Schedule one practice session with active recall',
      'Reserve a final review slot before the deadline',
    ];
  }

  if (normalizedPrompt.includes('meeting') || normalizedPrompt.includes('project')) {
    return [
      'Draft the agenda and key outcomes first',
      'Assign one owner per action item',
      'Set a follow-up reminder within 24 hours',
    ];
  }

  return [
    'Clarify the outcome and expected deadline',
    'Split the work into the smallest next actions',
    'Put the most time-sensitive item at the top',
  ];
}

async function generateStructuredResponse({ systemPrompt, userPrompt }) {
  const client = getClient();
  if (!client) {
    const suggestions = fallbackSuggestions(userPrompt);
    return {
      text: suggestions.join('\n'),
      structured: {
        suggestions,
      },
    };
  }

  try {
    const response = await client.responses.create({
      model: env.openAiModel,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = response.output_text || '';
    return {
      text,
      structured: {
        suggestions: text
          .split('\n')
          .map((entry) => entry.replace(/^[-*\d.\s]+/, '').trim())
          .filter(Boolean),
      },
    };
  } catch (error) {
    const suggestions = fallbackSuggestions(userPrompt);
    return {
      text: suggestions.join('\n'),
      structured: {
        suggestions,
      },
      error: error.message,
    };
  }
}

module.exports = {
  fallbackSuggestions,
  generateStructuredResponse,
};
