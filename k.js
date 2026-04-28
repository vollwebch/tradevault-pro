const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Remove trailing slash to prevent redirect loops
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
      parsedUrl.pathname = pathname;
      res.writeHead(301, { Location: parsedUrl.pathname + (parsedUrl.search || '') });
      res.end();
      return;
    }

    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
