import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const defaultDistDir = path.join(path.dirname(filename), 'dist');
const redirects = {
  '/rock-cubic-yard-calculator': '/rock-coverage-calculator-yard',
  '/rock-coverage-calculator-yards': '/rock-coverage-calculator-yard'
};
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'
};

export function createStaticServer({ distDir = defaultDistDir } = {}) {
  const root = path.resolve(distDir);
  return http.createServer(async (req, res) => {
    const send = (status, content, type = 'text/plain; charset=utf-8', headers = {}) => {
      res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...headers });
      res.end(req.method === 'HEAD' ? undefined : content);
    };
    if (!['GET', 'HEAD'].includes(req.method)) {
      send(405, 'Method Not Allowed', undefined, { Allow: 'GET, HEAD' });
      return;
    }
    let requestPath, search;
    try {
      const url = new URL(req.url, 'http://localhost');
      requestPath = decodeURIComponent(url.pathname);
      search = url.search;
    } catch {
      send(400, 'Bad Request');
      return;
    }
    if (requestPath.includes('\\') || requestPath.includes('\0')) {
      send(400, 'Bad Request');
      return;
    }
    const route = requestPath.replace(/\/+$/, '') || '/';
    if (redirects[route]) {
      send(308, '', undefined, { Location: redirects[route] + search });
      return;
    }
    const candidate = path.resolve(root, '.' + requestPath);
    const relative = path.relative(root, candidate);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      send(404, 'Not Found');
      return;
    }
    const notFound = async () => {
      const html = await fs.readFile(path.join(root, '404.html')).catch(() => null);
      send(404, html ?? 'Not Found', html ? mimeTypes['.html'] : undefined, { 'X-Robots-Tag': 'noindex' });
    };
    if (route === '/404' || route === '/404.html') {
      await notFound();
      return;
    }
    let filePath = candidate;
    try {
      if ((await fs.stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      if (!path.extname(filePath)) filePath += '.html';
    }
    try {
      const content = await fs.readFile(filePath);
      const immutable = relative.startsWith('_astro' + path.sep);
      send(200, content, mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream', {
        'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
        ...(route === '/embed' ? { 'X-Robots-Tag': 'noindex, follow' } : {})
      });
    } catch (error) {
      if (['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code)) await notFound();
      else send(500, 'Internal Server Error');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === filename) {
  const port = Number(process.env.PORT || 3000);
  createStaticServer().listen(port, '0.0.0.0', () => {
    console.log(`Rock Coverage Calculator running at http://localhost:${port}`);
  });
}
