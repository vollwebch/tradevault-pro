// k.js - Lean custom Next.js server for production
// Handles trailing slash stripping and proper error recovery.
// Cache headers are managed by Next.js middleware (src/middleware.ts).

const { createServer } = require('http');
const next = require('next');

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      // Use WHATWG URL API (not deprecated url.parse)
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      // Strip trailing slashes silently (except root) to prevent proxy redirect loops.
      // The proxy (Caddy) may add trailing slashes; returning 200 for both forms
      // is the safest approach to avoid ERR_TOO_MANY_REDIRECTS.
      if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }

      handle(req, res, urlObj);
    } catch (err) {
      console.error('Request error:', err.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
  });

  server.on('error', (err) => {
    console.error('Server error:', err.message);
    if (err.code === 'EADDRINUSE') {
      process.exit(1); // Let watchdog retry
    }
  });

  // Generous timeouts for proxy connections
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT} (PID: ${process.pid})`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
  process.on('SIGINT', () => { server.close(() => process.exit(0)); });
}).catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
