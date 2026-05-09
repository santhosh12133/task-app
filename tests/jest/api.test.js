const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
delete process.env.OPENAI_API_KEY;

const { createApp } = require('../../app');
const PasswordResetToken = require('../../models/PasswordResetToken');
const { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } = require('./helpers/testDb');

const app = createApp();

async function createAuthenticatedUser(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'supersecure123',
    ...overrides,
  };

  const response = await request(app).post('/api/auth/signup').send(payload);

  return {
    response,
    token: response.body.token,
    user: response.body.user,
  };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

beforeAll(async () => {
  await connectTestDatabase();
});

afterEach(async () => {
  await clearTestDatabase();
});

afterAll(async () => {
  await disconnectTestDatabase();
});

describe('API coverage', () => {
  test('health route returns service metadata', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.environment).toBe('test');
  });

  test('signup, login, me, profile update, and logout flows work', async () => {
    const signup = await createAuthenticatedUser();

    expect(signup.response.statusCode).toBe(201);
    expect(signup.response.headers['set-cookie'][0]).toContain('orion_token');
    expect(signup.user.email).toBe('user@example.com');

    const me = await request(app).get('/api/auth/me').set(authHeader(signup.token));
    expect(me.statusCode).toBe(200);
    expect(me.body.user.name).toBe('Test User');

    const update = await request(app)
      .put('/api/auth/me')
      .set(authHeader(signup.token))
      .send({
        name: 'Updated User',
        bio: 'Focused builder',
        theme: 'dark',
        preferences: {
          focusMinutes: 50,
          remindersEnabled: false,
        },
      });

    expect(update.statusCode).toBe(200);
    expect(update.body.user.name).toBe('Updated User');
    expect(update.body.user.theme).toBe('dark');
    expect(update.body.user.preferences.focusMinutes).toBe(50);

    const logout = await request(app).post('/api/auth/logout');
    expect(logout.statusCode).toBe(200);
    expect(logout.body.message).toMatch(/logged out/i);

    const login = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'supersecure123',
    });

    expect(login.statusCode).toBe(200);
    expect(login.body.user.name).toBe('Updated User');
  });

  test('forgot-password and reset-password flow updates credentials', async () => {
    await createAuthenticatedUser();

    const forgotPassword = await request(app).post('/api/auth/forgot-password').send({
      email: 'user@example.com',
    });

    expect(forgotPassword.statusCode).toBe(200);
    expect(forgotPassword.body.resetToken).toBeTruthy();

    const storedToken = await PasswordResetToken.findOne();
    expect(storedToken).toBeTruthy();

    const resetPassword = await request(app).post('/api/auth/reset-password').send({
      token: forgotPassword.body.resetToken,
      password: 'newsecure123',
    });

    expect(resetPassword.statusCode).toBe(200);

    const login = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'newsecure123',
    });

    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeTruthy();
  });

  test('task CRUD, reorder, subtasks, and schedule endpoints work', async () => {
    const { token } = await createAuthenticatedUser();

    const createFirst = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .send({
        title: 'First task',
        description: 'Plan the sprint',
        priority: 'high',
        dueDate: '2026-05-10',
      });

    const createSecond = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .send({
        title: 'Second task',
        description: 'Ship the feature',
        priority: 'medium',
      });

    expect(createFirst.statusCode).toBe(201);
    expect(createSecond.statusCode).toBe(201);

    const list = await request(app).get('/api/tasks').set(authHeader(token));
    expect(list.statusCode).toBe(200);
    expect(list.body.tasks).toHaveLength(2);

    const update = await request(app)
      .put(`/api/tasks/${createFirst.body.task._id}`)
      .set(authHeader(token))
      .send({
        title: 'First task updated',
        status: 'in progress',
        priority: 'low',
        tags: ['planning', 'team'],
      });

    expect(update.statusCode).toBe(200);
    expect(update.body.task.title).toBe('First task updated');
    expect(update.body.task.tags).toContain('planning');

    const toggle = await request(app)
      .patch(`/api/tasks/${createFirst.body.task._id}/toggle`)
      .set(authHeader(token));

    expect(toggle.statusCode).toBe(200);
    expect(toggle.body.task.completed).toBe(true);

    const createSubtask = await request(app)
      .post(`/api/tasks/${createSecond.body.task._id}/subtasks`)
      .set(authHeader(token))
      .send({ title: 'Review checklist' });

    expect(createSubtask.statusCode).toBe(200);
    expect(createSubtask.body.task.subtasks).toHaveLength(1);

    const updateSubtask = await request(app)
      .patch(`/api/tasks/${createSecond.body.task._id}/subtasks/0`)
      .set(authHeader(token))
      .send({ completed: true });

    expect(updateSubtask.statusCode).toBe(200);
    expect(updateSubtask.body.task.subtasks[0].completed).toBe(true);

    const reorder = await request(app)
      .patch('/api/tasks/reorder')
      .set(authHeader(token))
      .send({ orderedIds: [createSecond.body.task._id, createFirst.body.task._id] });

    expect(reorder.statusCode).toBe(200);

    const schedule = await request(app).get('/api/ai/schedule').set(authHeader(token));
    expect(schedule.statusCode).toBe(200);
    expect(Array.isArray(schedule.body.schedule)).toBe(true);

    const remove = await request(app)
      .delete(`/api/tasks/${createSecond.body.task._id}`)
      .set(authHeader(token));

    expect(remove.statusCode).toBe(200);
  });

  test('notes CRUD and AI endpoints return structured responses', async () => {
    const { token } = await createAuthenticatedUser();

    const createNote = await request(app)
      .post('/api/notes')
      .set(authHeader(token))
      .send({
        title: 'Retro notes',
        content: 'What worked well',
        markdown: '## What worked well',
        tags: ['retro'],
      });

    expect(createNote.statusCode).toBe(201);

    const updateNote = await request(app)
      .put(`/api/notes/${createNote.body.note._id}`)
      .set(authHeader(token))
      .send({
        title: 'Retro notes updated',
        content: 'Action items',
        markdown: '## Action items',
        tags: ['retro', 'team'],
      });

    expect(updateNote.statusCode).toBe(200);
    expect(updateNote.body.note.title).toBe('Retro notes updated');

    const aiGenerate = await request(app)
      .post('/api/ai/generate')
      .set(authHeader(token))
      .send({ prompt: 'Plan my study schedule for exams' });

    expect(aiGenerate.statusCode).toBe(200);
    expect(aiGenerate.body.suggestions.length).toBeGreaterThan(0);

    const aiPrioritize = await request(app)
      .post('/api/ai/prioritize')
      .set(authHeader(token))
      .send({
        tasks: [
          { title: 'Write report', priorityScore: 2, dueDate: '2026-05-09', completed: false },
          { title: 'Water plants', priorityScore: 0, completed: false },
        ],
      });

    expect(aiPrioritize.statusCode).toBe(200);
    expect(aiPrioritize.body.prioritizedTasks[0].title).toBe('Write report');

    const aiParse = await request(app)
      .post('/api/ai/parse')
      .set(authHeader(token))
      .send({ text: 'Finish the launch checklist tomorrow' });

    expect(aiParse.statusCode).toBe(200);
    expect(aiParse.body.structuredText).toBeTruthy();

    const aiAssistant = await request(app)
      .post('/api/ai/assistant')
      .set(authHeader(token))
      .send({ prompt: 'Help me focus this afternoon', context: { energy: 'medium' } });

    expect(aiAssistant.statusCode).toBe(200);
    expect(aiAssistant.body.reply).toBeTruthy();

    const deleteNote = await request(app)
      .delete(`/api/notes/${createNote.body.note._id}`)
      .set(authHeader(token));

    expect(deleteNote.statusCode).toBe(200);
  });

  test('validation rejects malformed requests and protects private routes', async () => {
    const invalidSignup = await request(app).post('/api/auth/signup').send({
      name: 'A',
      email: 'invalid-email',
      password: '123',
    });

    expect(invalidSignup.statusCode).toBe(400);

    const unauthenticatedTasks = await request(app).get('/api/tasks');
    expect(unauthenticatedTasks.statusCode).toBe(401);

    const { token } = await createAuthenticatedUser();
    const invalidTask = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .send({
        title: 'x',
        priority: 'urgent',
      });

    expect(invalidTask.statusCode).toBe(400);
  });
});
