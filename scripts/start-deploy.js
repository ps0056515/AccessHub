/**
 * Production-style start for CI/Jenkins: build React, serve on PORT with API on API_PORT.
 */
const path = require('path');
const { spawn } = require('child_process');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const webPort = process.env.PORT || '3010';
const apiPort = process.env.API_PORT || '3015';
const root = path.resolve(__dirname, '..');

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: 'inherit',
      shell: true,
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
  });
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('Building React app…');
  await run('npm', ['run', 'build']);

  // eslint-disable-next-line no-console
  console.log(`Starting API on port ${apiPort}…`);
  const api = spawn('node', ['server/index.js'], {
    cwd: root,
    env: { ...process.env, API_PORT: String(apiPort), NODE_ENV: 'production' },
    stdio: 'inherit',
  });

  // eslint-disable-next-line no-console
  console.log(`Serving build/ on port ${webPort}…`);
  const web = spawn('npx', ['serve', '-s', 'build', '-l', String(webPort)], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });

  const shutdown = () => {
    api.kill();
    web.kill();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
