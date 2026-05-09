const express = require('express');

const Note = require('../models/Note');
const { requireAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { commonSchemas, noteSchemas } = require('../validation/schemas');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean();
    res.json({ notes });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateRequest({ body: noteSchemas.create }), async (req, res, next) => {
  try {
    const note = await Note.create({
      userId: req.user._id,
      title: req.body.title,
      content: req.body.content,
      markdown: req.body.markdown,
      tags: req.body.tags,
    });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateRequest({ params: commonSchemas.idParam, body: noteSchemas.update }), async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        title: req.body.title,
        content: req.body.content,
        markdown: req.body.markdown,
        tags: req.body.tags,
      },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateRequest({ params: commonSchemas.idParam }), async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
