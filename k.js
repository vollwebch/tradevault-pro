const http = require('http');
const { parse } = require('url');
const next = require('next');

const app = next({ dev: false, dir: '/home/z/my-project', hostname: '0.0.0.0', port: 3000 });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    let url = req.url || '/';
    if (url.length > 1 && url.endsWith('/')) url = url.slice(0, -1);
    const origUrl = req.url;
    req.url = url;
    handle(req, res, parse(url, true));
    req.url = origUrl;
  }).listen(3000, '0.0.0.0', () => console.log('READY'));
}).catch(e => { console.error(e); process.exit(1); });

setInterval(() => { try { http.get('http://127.0.0.1:3000/', () => {}) } catch(e) {} }, 10000);
