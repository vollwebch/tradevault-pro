const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    let pathname = parsedUrl.pathname || '/';
    if (pathname !== '/' && pathname.endsWith('/')) {
      parsedUrl.pathname = pathname.slice(0, -1);
    }
    handle(req, res, parsedUrl);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

  // Keep alive
  setInterval(() => {
    if (!server.listening) {
      console.log('Server died, restarting...');
      server.listen(port);
    }
  }, 10000);
});
