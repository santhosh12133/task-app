const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');
const emailSchema = z.string().trim().email('Enter a valid email address').transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long');
const taskStatusSchema = z.enum(['todo', 'in progress', 'done']);
const taskPrioritySchema = z.enum(['low', 'medium', 'high']);
const themeSchema = z.enum(['light', 'dark', 'system']);

function stringField({ min = 0, max = 255, fallback } = {}) {
  let schema = z.string().trim().max(max, `Must be ${max} characters or fewer`);
  if (min > 0) {
    schema = schema.min(min, `Must be at least ${min} characters`);
  }

  if (fallback !== undefined) {
    schema = schema.default(fallback);
  }

  return schema;
}

function optionalStringField({ max = 255 } = {}) {
  return z
    .preprocess((value) => (value == null ? undefined : String(value)), z.string().trim().max(max, `Must be ${max} characters or fewer`).optional());
}

function optionalDateField() {
  return z.preprocess((value) => {
    if (value === null || value === '') {
      return null;
    }

    if (value === undefined) {
      return undefined;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }, z.union([z.date(), z.null()]).optional());
}

function tagsField() {
  return z
    .union([
      z.array(z.string()),
      z.string(),
      z.undefined(),
    ])
    .transform((value) => {
      const tags = Array.isArray(value) ? value : String(value || '').split(',');
      return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 12);
    });
}

const attachmentSchema = z.object({
  name: stringField({ min: 1, max: 120 }),
  url: stringField({ min: 1, max: 500 }),
  type: optionalStringField({ max: 80 }).default(''),
});

const subtaskSchema = z.object({
  title: stringField({ min: 2, max: 120 }),
  completed: z.boolean().default(false),
});

const taskFieldSchemas = {
  title: stringField({ min: 2, max: 120 }),
  description: optionalStringField({ max: 2000 }),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  category: optionalStringField({ max: 60 }),
  tags: tagsField(),
  dueDate: optionalDateField(),
  reminderAt: optionalDateField(),
  recurring: optionalStringField({ max: 80 }),
  estimateMinutes: z.coerce.number().int().min(5).max(1440),
  source: optionalStringField({ max: 60 }),
  aiSuggested: z.coerce.boolean(),
  subtasks: z.array(subtaskSchema).max(25),
  attachments: z.array(attachmentSchema).max(10),
};

const taskPayloadSchema = z.object({
  title: taskFieldSchemas.title,
  description: taskFieldSchemas.description.default(''),
  status: taskFieldSchemas.status.default('todo'),
  priority: taskFieldSchemas.priority.default('medium'),
  category: taskFieldSchemas.category.default('general').transform((value) => value || 'general'),
  tags: taskFieldSchemas.tags,
  dueDate: taskFieldSchemas.dueDate,
  reminderAt: taskFieldSchemas.reminderAt,
  recurring: taskFieldSchemas.recurring.default(''),
  estimateMinutes: taskFieldSchemas.estimateMinutes.default(30),
  source: taskFieldSchemas.source.default('manual').transform((value) => value || 'manual'),
  aiSuggested: z.coerce.boolean().default(false),
  subtasks: taskFieldSchemas.subtasks.default([]),
  attachments: taskFieldSchemas.attachments.default([]),
});

const taskUpdateSchema = z
  .object({
    title: taskFieldSchemas.title.optional(),
    description: taskFieldSchemas.description,
    status: taskFieldSchemas.status.optional(),
    priority: taskFieldSchemas.priority.optional(),
    category: taskFieldSchemas.category,
    tags: taskFieldSchemas.tags.optional(),
    dueDate: taskFieldSchemas.dueDate,
    reminderAt: taskFieldSchemas.reminderAt,
    recurring: taskFieldSchemas.recurring,
    estimateMinutes: taskFieldSchemas.estimateMinutes.optional(),
    source: taskFieldSchemas.source,
    aiSuggested: taskFieldSchemas.aiSuggested.optional(),
    subtasks: taskFieldSchemas.subtasks.optional(),
    attachments: taskFieldSchemas.attachments.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

const notePayloadSchema = z.object({
  title: stringField({ min: 2, max: 120 }),
  content: optionalStringField({ max: 5000 }).default(''),
  markdown: optionalStringField({ max: 5000 }).default(''),
  tags: tagsField(),
});

module.exports = {
  authSchemas: {
    signup: z.object({
      name: stringField({ min: 2, max: 80 }),
      email: emailSchema,
      password: passwordSchema,
    }),
    login: z.object({
      email: emailSchema,
      password: z.string().min(1, 'Password is required'),
    }),
    google: z
      .object({
        idToken: optionalStringField({ max: 4096 }),
        name: optionalStringField({ max: 80 }),
        email: z.preprocess((value) => (value == null || value === '' ? undefined : value), emailSchema.optional()),
        picture: optionalStringField({ max: 500 }),
      })
      .refine((value) => value.idToken || (value.email && value.name), {
        message: 'Google identity token or profile data is required',
      }),
    forgotPassword: z.object({
      email: emailSchema,
    }),
    resetPassword: z.object({
      token: stringField({ min: 20, max: 256 }),
      password: passwordSchema,
    }),
    updateProfile: z
      .object({
        name: optionalStringField({ max: 80 }),
        bio: optionalStringField({ max: 280 }),
        theme: themeSchema.optional(),
        avatarUrl: optionalStringField({ max: 500 }),
        preferences: z
          .object({
            focusMinutes: z.coerce.number().int().min(5).max(180).optional(),
            breakMinutes: z.coerce.number().int().min(1).max(60).optional(),
            remindersEnabled: z.boolean().optional(),
          })
          .partial()
          .optional(),
      })
      .refine((value) => Object.keys(value).length > 0, { message: 'At least one profile field is required' }),
  },
  commonSchemas: {
    idParam: z.object({ id: objectIdSchema }),
    objectIdParam: objectIdSchema,
  },
  taskSchemas: {
    list: z.object({
      status: taskStatusSchema.optional(),
      priority: taskPrioritySchema.optional(),
      category: optionalStringField({ max: 60 }),
      completed: z.enum(['true', 'false']).optional(),
      q: optionalStringField({ max: 120 }),
    }),
    create: taskPayloadSchema,
    update: taskUpdateSchema,
    reorder: z.object({
      orderedIds: z.array(objectIdSchema).min(1).max(200),
    }),
    createSubtask: z.object({
      title: stringField({ min: 2, max: 120 }),
    }),
    updateSubtask: z.object({
      completed: z.boolean().optional(),
    }),
    subtaskParams: z.object({
      id: objectIdSchema,
      subtaskIndex: z.coerce.number().int().min(0),
    }),
  },
  noteSchemas: {
    create: notePayloadSchema,
    update: notePayloadSchema,
  },
  aiSchemas: {
    generate: z.object({
      prompt: stringField({ min: 2, max: 600 }),
    }),
    prioritize: z.object({
      tasks: z.array(z.record(z.any())).max(200).default([]),
    }),
    parse: z.object({
      text: stringField({ min: 2, max: 600 }),
    }),
    assistant: z.object({
      prompt: stringField({ min: 2, max: 600 }),
      context: z.record(z.any()).optional().default({}),
    }),
  },
  taskEnums: {
    taskPrioritySchema,
    taskStatusSchema,
  },
  themeSchema,
};
