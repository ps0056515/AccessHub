/**
 * Scan staged (or all tracked) Git files for accidental credentials before commit/CI.
 * Usage:
 *   node scripts/check-secrets.js           (scans tracked files)
 *   node scripts/check-secrets.js --staged  (scans staged files in pre-commit hook)
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STAGED_MODE = process.argv.includes('--staged');

const FORBIDDEN_FILENAMES = new Set([
  '.env',
  '.env.local',
  'migration_guide.md',
  'chat_history_summary.md',
]);

const FORBIDDEN_EXTS = new Set(['.zip', '.pem', '.key', '.p12', '.pfx']);
const PLACEHOLDER_TOKENS = new Set(['change_me', 'your_password', '<db_password>', 'accesshub', 'placeholder']);
const SAFE_LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '<db_host>']);

const SECRET_PATTERNS = [
  { name: 'Google OAuth Client Secret', re: new RegExp('GOC' + 'SPX-[A-Za-z0-9_\\-]{10,}') },
  { name: 'Private Key Block', re: new RegExp('-----BEGIN [A-Z ]*' + 'PRIVATE KEY-----') },
  { name: 'AWS Access Key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'GitHub Token', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/ },
  {
    name: 'Hardcoded Secret Env Assignment',
    re: /^(?:SMTP_PASS|ADZUNA_APP_KEY|RAPIDAPI_KEYS|GOOGLE_CLIENT_SECRET)[ \t]*=[ \t]*(?!<|CHANGE_ME)([^\r\n]{6,})$/m,
  },
];

const DB_URI_RE = /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^:\s'"`]+:([^@\s'"`]+)@([^\s:/'"`]+)/gi;

function getCandidateFiles() {
  const args = STAGED_MODE
    ? ['diff', '--cached', '--name-only', '--diff-filter=ACM']
    : ['ls-files'];
  const out = execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function scanFile(relPath) {
  const findings = [];
  const base = path.basename(relPath).toLowerCase();
  const ext = path.extname(relPath).toLowerCase();

  if (FORBIDDEN_FILENAMES.has(base) || FORBIDDEN_EXTS.has(ext)) {
    findings.push(`Forbidden file type/name staged or tracked: ${relPath}`);
    return findings;
  }

  // Skip binary assets and this scanner script itself
  if (
    relPath === 'scripts/check-secrets.js' ||
    /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot|svg|mp4|webm|pdf)$/i.test(relPath)
  ) {
    return findings;
  }

  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    return findings;
  }

  const content = fs.readFileSync(fullPath, 'utf8');

  let match;
  DB_URI_RE.lastIndex = 0;
  while ((match = DB_URI_RE.exec(content)) !== null) {
    const pwd = (match[1] || '').toLowerCase();
    const host = (match[2] || '').toLowerCase();
    if (!SAFE_LOCAL_HOSTS.has(host) || !PLACEHOLDER_TOKENS.has(pwd)) {
      findings.push(`Non-placeholder database credential URI in ${relPath}`);
    }
  }

  for (const { name, re } of SECRET_PATTERNS) {
    if (re.test(content)) {
      findings.push(`${name} detected in ${relPath}`);
    }
  }

  return findings;
}

const files = getCandidateFiles();
const allFindings = files.flatMap(scanFile);

if (allFindings.length > 0) {
  console.error('\n[SECURITY BLOCK] Potential secret(s) detected:\n');
  allFindings.forEach((f) => console.error(`  - ${f}`));
  console.error('\nMove secrets to your untracked .env file before committing.\n');
  process.exit(1);
}

console.log(`[security:check] Clean (${files.length} file(s) scanned).`);
