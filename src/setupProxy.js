const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// CRA only sets PORT for the dev server; API port must be API_PORT (default 3001).
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const apiPort = process.env.API_PORT || '3001';
const target = `http://127.0.0.1:${apiPort}`;

// eslint-disable-next-line no-console
console.log(`[setupProxy] /api -> ${target}`);

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: 'warn',
    }),
  );
};
