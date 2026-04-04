const http = require('http');

const endpoints = [
  '/api/menus',
  '/api/gallery',
  '/api/news/public?limit=1', // assuming public news is different
  '/api/programmes?limit=1',
  '/api/research-facilities',
  '/api/international-collaboration/public',
  '/api/footer-links/active',
  '/api/pre-footer-links/active',
  '/api/marquee/public',
  '/api/life-at-thsti/public',
  '/api/hero-slides/public'
];

async function checkEndpoint(path) {
  return new Promise((resolve) => {
    http.get({ hostname: 'localhost', port: 5001, path }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let snippet = data.replace(/\n/g, ' ');
        resolve({ path, status: res.statusCode, data: snippet });
      });
    }).on('error', (err) => {
      resolve({ path, status: 'ERROR', data: err.message });
    });
  });
}

async function runTests() {
  console.log("Starting backend tests against http://localhost:5001 (ASP.NET Core 8)...");
  let passed = 0;
  for (const path of endpoints) {
    const result = await checkEndpoint(path);
    const color = result.status === 200 ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}[${result.status}]\x1b[0m ${result.path} => ${result.data.substring(0, 500)}`);
    if (result.status === 200) passed++;
  }
  console.log(`\nTests completed. ${passed}/${endpoints.length} endpoints passed.`);
}

runTests();
