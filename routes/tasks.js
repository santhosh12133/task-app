const express = require('express');

const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { recordActivity } = require('../utils/activity');
const { emitToUser } = require('../utils/socket');
const { commonSchemas, taskSchemas } = require('../validation/schemas');

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTaskFilter(query, userId) {
  const filter = { userId };

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.completed === 'true') filter.completed = true;
  if (query.completed === 'false') filter.completed = false;
  if (query.q) {
    const search = escapeRegex(String(query.q).trim());
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: search },
    ];
  }

  return filter;
}

router.use(requireAuth);

router.get('/', validateRequest({ query: taskSchemas.list }), async (req, res, next) => {
  try {
    const tasks = await Task.find(buildTaskFilter(req.query, req.user._id)).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateRequest({ body: taskSchemas.create }), async (req, res, next) => {
  try {
    const payload = req.body || {};
    const latest = await Task.findOne({ userId: req.user._id }).sort({ order: -1 });
    const task = await Task.create({
      userId: req.user._id,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      category: payload.category,
      tags: payload.tags,
      dueDate: payload.dueDate || null,
      reminderAt: payload.reminderAt || null,
      recurring: payload.recurring,
      order: latest ? latest.order + 1 : 0,
      estimateMinutes: payload.estimateMinutes,
      source: payload.source,
      aiSuggested: Boolean(payload.aiSuggested),
      completed: payload.status === 'done',
      completedAt: payload.status === 'done' ? new Date() : null,
      subtasks: payload.subtasks,
      attachments: payload.attachments,
    });

    await recordActivity({ userId: req.user._id, type: 'task', title: 'Created task', meta: { taskId: task._id } });
    emitToUser(String(req.user._id), 'task:created', { task });
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateRequest({ params: commonSchemas.idParam, body: taskSchemas.update }), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.completed === true && updates.status === undefined) {
      updates.status = 'done';
    } else if (updates.completed === false && updates.status === undefined) {
      updates.status = 'todo';
    }

    const task = await Task.findOneAndUpdate({ _id: id, userId: req.user._id }, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (typeof updates.completed === 'boolean') {
      task.completedAt = updates.completed ? new Date() : null;
      await task.save();
    } else if (updates.status) {
      task.completed = updates.status === 'done';
      task.completedAt = task.completed ? task.completedAt || new Date() : null;
      if (!task.completed) {
        task.completedAt = null;
      }
      await task.save();
    }

    await recordActivity({ userId: req.user._id, type: 'task', title: 'Updated task', meta: { taskId: task._id } });
    emitToUser(String(req.user._id), 'task:updated', { task });
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/toggle', validateRequest({ params: commonSchemas.idParam }), async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    task.status = task.completed ? 'done' : 'todo';
    await task.save();

    await recordActivity({
      userId: req.user._id,
      type: 'task',
      title: task.completed ? 'Completed task' : 'Reopened task',
      meta: { taskId: task._id },
    });

    emitToUser(String(req.user._id), 'task:toggled', { task });
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.patch('/reorder', validateRequest({ body: taskSchemas.reorder }), async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    await Promise.all(orderedIds.map((taskId, index) => Task.updateOne({ _id: taskId, userId: req.user._id }, { $set: { order: index } })));

    emitToUser(String(req.user._id), 'task:reordered', { orderedIds });
    res.json({ message: 'Tasks reordered' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/subtasks', validateRequest({ params: commonSchemas.idParam, body: taskSchemas.createSubtask }), async (req, res, next) => {
  try {
    const { title } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.subtasks.push({ title, completed: false });
    await task.save();

    emitToUser(String(req.user._id), 'task:updated', { task });
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/subtasks/:subtaskIndex', validateRequest({ params: taskSchemas.subtaskParams, body: taskSchemas.updateSubtask }), async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtask = task.subtasks[req.params.subtaskIndex];
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    subtask.completed = typeof req.body.completed === 'boolean' ? req.body.completed : !subtask.completed;
    await task.save();

    emitToUser(String(req.user._id), 'task:updated', { task });
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateRequest({ params: commonSchemas.idParam }), async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await recordActivity({ userId: req.user._id, type: 'task', title: 'Deleted task', meta: { taskId: task._id } });
    emitToUser(String(req.user._id), 'task:deleted', { taskId: String(task._id) });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
