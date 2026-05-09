const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 2000 },
    status: { type: String, default: 'todo', enum: ['todo', 'in progress', 'done'] },
    priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high'] },
    category: { type: String, default: 'general', maxlength: 60 },
    tags: [{ type: String, trim: true }],
    dueDate: { type: Date },
    reminderAt: { type: Date },
    recurring: { type: String, default: '', maxlength: 80 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    order: { type: Number, default: 0 },
    estimateMinutes: { type: Number, default: 30, min: 5, max: 1440 },
    source: { type: String, default: 'manual', maxlength: 60 },
    aiSuggested: { type: Boolean, default: false },
    attachments: [
      {
        name: { type: String, maxlength: 120 },
        url: { type: String, maxlength: 500 },
        type: { type: String, maxlength: 80 },
      },
    ],
    subtasks: [
      {
        title: { type: String, required: true, maxlength: 120 },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ userId: 1, order: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
