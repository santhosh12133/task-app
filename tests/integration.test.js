const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

test('GET /api/health returns ok', async () => {
  const res = await new Promise((resolve, reject) => {
    http.get('http://localhost:5000/api/health', (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });

  assert.equal(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.equal(json.status, 'ok');
});

test('GET /api/tasks without auth returns 401', async () => {
  const res = await new Promise((resolve, reject) => {
    http.get('http://localhost:5000/api/tasks', (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });

  assert.equal(res.statusCode, 401);
});
