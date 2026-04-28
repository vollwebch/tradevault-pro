const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    let pathname = parsedUrl.pathname || '/';

    // Strip trailing slash internally (no redirect, serve the page directly)
    if (pathname !== '/' && pathname.endsWith('/')) {
      parsedUrl.pathname = pathname.slice(0, -1);
    }

    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
