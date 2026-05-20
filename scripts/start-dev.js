/**
 * Start CRA dev server without cross-env (works when devDependencies are omitted).
 * Fixes Jenkins/CI "allowedHosts[0] should be a non-empty string" when HOST is empty.
 */
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.development'),
  override: false,
});

process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '3010';
process.env.DANGEROUSLY_DISABLE_HOST_CHECK =
  process.env.DANGEROUSLY_DISABLE_HOST_CHECK || 'true';

const host = String(process.env.HOST || '').trim();
process.env.HOST = host || '0.0.0.0';

// eslint-disable-next-line no-console
console.log(
  `Starting dev server on http://${process.env.HOST === '0.0.0.0' ? 'localhost' : process.env.HOST}:${process.env.PORT}`,
);

require('react-scripts/scripts/start');
