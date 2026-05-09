const express = require('express');

const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { generateStructuredResponse, fallbackSuggestions } = require('../utils/ai');
const { recordActivity } = require('../utils/activity');
const { aiSchemas } = require('../validation/schemas');

const router = express.Router();

router.use(requireAuth);

router.post('/generate', validateRequest({ body: aiSchemas.generate }), async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const result = await generateStructuredResponse({
      systemPrompt: 'You generate concise productivity task breakdowns.',
      userPrompt: `Turn this request into a task checklist: ${prompt}`,
    });

    const suggestions = result.structured.suggestions.length ? result.structured.suggestions : fallbackSuggestions(prompt);
    await recordActivity({ userId: req.user._id, type: 'ai', title: 'Generated task plan', meta: { prompt } });
    res.json({ suggestions, text: result.text });
  } catch (error) {
    next(error);
  }
});

router.post('/prioritize', validateRequest({ body: aiSchemas.prioritize }), async (req, res, next) => {
  try {
    const tasks = req.body.tasks;
    const sorted = [...tasks].sort((left, right) => {
      const leftScore = Number(left.priorityScore || 0) + Number(Boolean(left.dueDate)) * 2 + Number(!left.completed);
      const rightScore = Number(right.priorityScore || 0) + Number(Boolean(right.dueDate)) * 2 + Number(!right.completed);
      return rightScore - leftScore;
    });

    const response = await generateStructuredResponse({
      systemPrompt: 'You prioritize tasks based on deadlines, effort, and progress.',
      userPrompt: `Prioritize these tasks: ${JSON.stringify(tasks)}`,
    });

    res.json({
      prioritizedTasks: sorted,
      recommendations: response.structured.suggestions.length ? response.structured.suggestions : fallbackSuggestions('prioritize tasks'),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/parse', validateRequest({ body: aiSchemas.parse }), async (req, res, next) => {
  try {
    const { text } = req.body;
    const parsed = await generateStructuredResponse({
      systemPrompt: 'Extract title, due date, recurring schedule, category, and priority from natural language task requests. Return plain text with one field per line.',
      userPrompt: text,
    });

    res.json({
      structuredText: parsed.text,
      fallbackHint: fallbackSuggestions(text),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/assistant', validateRequest({ body: aiSchemas.assistant }), async (req, res, next) => {
  try {
    const { prompt, context = {} } = req.body;
    const result = await generateStructuredResponse({
      systemPrompt: 'You are a calm productivity coach. Offer short, actionable guidance.',
      userPrompt: `Prompt: ${prompt}\nContext: ${JSON.stringify(context)}`,
    });

    res.json({
      reply: result.text || fallbackSuggestions(prompt).join('. '),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/schedule', async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id, completed: false }).sort({ dueDate: 1, priority: -1, order: 1 }).lean();
    const schedule = tasks.slice(0, 5).map((task, index) => ({
      hour: 8 + index * 2,
      title: task.title,
      duration: task.estimateMinutes,
      category: task.category,
    }));

    res.json({ schedule });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
