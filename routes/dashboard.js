const express = require('express');

const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/overview', async (req, res, next) => {
  try {
    const [totalTasks, completedTasks, highPriority, upcomingTasks, recentActivity] = await Promise.all([
      Task.countDocuments({ userId: req.user._id }),
      Task.countDocuments({ userId: req.user._id, completed: true }),
      Task.countDocuments({ userId: req.user._id, priority: 'high', completed: false }),
      Task.find({ userId: req.user._id, completed: false }).sort({ dueDate: 1, order: 1 }).limit(5).lean(),
      Activity.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        highPriority,
        completionRate,
      },
      upcomingTasks,
      recentActivity,
      weeklyProgress: [12, 18, 24, 20, 30, 28, 35],
      badges: [
        { id: 'focus', label: 'Focus Sprint', description: 'Complete 5 tasks without distractions' },
        { id: 'streak', label: 'Consistency', description: 'Maintain a 7-day streak' },
      ],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
