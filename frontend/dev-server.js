/**
 * Frontend Development & Preview Server
 * Enables `npm run dev` in frontend/ with or without pre-installed node_modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 5173;
const BACKEND_PORT = 5000;

// Check if Vite is available in local node_modules
const viteBin = path.join(__dirname, 'node_modules', '.bin', 'vite');
if (fs.existsSync(viteBin)) {
  console.log('🚀 Launching Vite Dev Server...');
  const child = spawn(viteBin, [], { stdio: 'inherit', shell: true });
  child.on('exit', (code) => process.exit(code));
} else {
  // Built-in HTTP Development Server with API proxying
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.jsx': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    // Proxy /api and /uploads to backend
    if (req.url.startsWith('/api/') || req.url.startsWith('/uploads/')) {
      const proxyReq = http.request(
        {
          host: 'localhost',
          port: BACKEND_PORT,
          path: req.url,
          method: req.method,
          headers: req.headers
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        }
      );
      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Backend server unreachable at port 5000' }));
      });
      req.pipe(proxyReq, { end: true });
      return;
    }

    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) {
      // Fallback for SPA routing to index.html
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🐾 PET ADOPTION SYSTEM - FRONTEND SERVER READY`);
    console.log(`💻 Local UI URL: http://localhost:${PORT}`);
    console.log(`🔗 Connected to Backend at: http://localhost:${BACKEND_PORT}`);
    console.log(`=======================================================`);
  });
}
