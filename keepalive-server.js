const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const app = next({ dev: false, dir: '/home/z/my-project', hostname: '0.0.0.0', port: 3000 });
const handle = app.getRequestHandler();
app.prepare().then(() => { createServer((req, res) => { handle(req, res, parse(req.url, true)); }).listen(3000, '0.0.0.0', () => console.log('READY')); }).catch(err => { console.error(err); process.exit(1); });
setInterval(() => { try { require('http').get('http://127.0.0.1:3000/', () => {}).on('error', () => {}); } catch(e) {} }, 10000);
