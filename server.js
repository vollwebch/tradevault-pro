const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');

// Simple keep-alive + Next.js wrapper
const NEXT_DIR = path.join(__dirname, '.next');

async function start() {
  try {
    // Dynamically import next
    const next = require('next');
    const app = next({ dev: false, dir: __dirname, hostname: '0.0.0.0', port: 3000 });
    const handle = app.getRequestHandler();
    await app.prepare();
    
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(3000, '0.0.0.0', () => {
      console.log('Server ready on port 3000');
    });
  } catch (e) {
    console.error('Start error:', e.message);
    setTimeout(start, 2000);
  }
}

// Keep process alive with heartbeat
setInterval(() => {
  require('http').get('http://localhost:3000/', (res) => {
    // Server responding, all good
  }).on('error', () => {
    console.log('Heartbeat failed, process might need restart');
  });
}, 15000);

start();
