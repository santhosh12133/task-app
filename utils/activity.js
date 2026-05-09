const Activity = require('../models/Activity');

async function recordActivity({ userId, type, title, meta = {} }) {
  if (!userId) {
    return null;
  }

  try {
    return await Activity.create({
      userId,
      type,
      title,
      meta,
    });
  } catch (error) {
    return null;
  }
}

module.exports = { recordActivity };
