const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Configurar CORS para permitir testes Cypress
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Rota para dashboard
  if (url.pathname === '/dashboard') {
    const filePath = path.join(__dirname, 'cypress', 'fixtures', 'test-dashboard.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading dashboard');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // Rota para login (redirect)
  if (url.pathname === '/login') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Login</title></head>
      <body>
        <h1>Login Page</h1>
        <p>Redirected to login page</p>
      </body>
      </html>
    `);
    return;
  }
  
  // Mock API para projetos
  if (url.pathname === '/api/projects') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // Retorna array vazio por padrão - será interceptado pelo Cypress
    res.end('[]');
    return;
  }
  
  // Página inicial
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Home</title></head>
      <body>
        <h1>Home Page</h1>
        <a href="/dashboard">Go to Dashboard</a>
      </body>
      </html>
    `);
    return;
  }
  
  // 404 para outras rotas
  res.writeHead(404);
  res.end('Page not found');
});

const port = 3002;
server.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});