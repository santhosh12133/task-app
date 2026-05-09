const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    title: { type: String, trim: true, required: true, maxlength: 120 },
    content: { type: String, default: '', maxlength: 5000 },
    markdown: { type: String, default: '', maxlength: 5000 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
