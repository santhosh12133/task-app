const http = require('http');
function get(path){
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5000' + path, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('Checking GET /api/health...');
    const h = await get('/api/health');
    console.log('health:', h.statusCode, h.body);

    console.log('Checking GET /api/tasks (unauthenticated)...');
    const t = await get('/api/tasks');
    console.log('tasks:', t.statusCode, t.body);
    process.exit(0);
  } catch (err) {
    console.error('Integration check failed:', err);
    process.exit(1);
  }
})();
