/**
 * Provider Manager — Orchestrates parallel provider execution with circuit breakers,
 * deduplication, PostgreSQL persistence, and structured logging.
 */

const { query: dbQuery } = require('../db');
const { truncateDescription } = require('./baseProvider');

const jsearch = require('./jsearch');
const adzuna = require('./adzuna');
const arbeitnow = require('./arbeitnow');

const ALL_PROVIDERS = [jsearch, adzuna, arbeitnow];

// ─── Circuit Breakers ────────────────────────────────────────────────────────
const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const breakers = {};
for (const p of ALL_PROVIDERS) {
  breakers[p.name] = { failures: 0, cooldownUntil: 0, state: 'closed', avgLatencyMs: 0, totalCalls: 0 };
}

function isBreakerOpen(providerName) {
  const b = breakers[providerName];
  if (b.state === 'open') {
    if (Date.now() > b.cooldownUntil) {
      // Cooldown expired — move to half-open, allow one retry
      b.state = 'half-open';
      console.log(`[providerManager] Circuit breaker for ${providerName} is now HALF-OPEN — trying again`);
      return false;
    }
    return true;
  }
  return false;
}

function recordSuccess(providerName, latencyMs) {
  const b = breakers[providerName];
  b.failures = 0;
  b.state = 'closed';
  b.totalCalls++;
  b.avgLatencyMs = Math.round((b.avgLatencyMs * (b.totalCalls - 1) + latencyMs) / b.totalCalls);
}

function recordFailure(providerName) {
  const b = breakers[providerName];
  b.failures++;
  b.totalCalls++;
  if (b.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    b.state = 'open';
    b.cooldownUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    console.log(`[providerManager] Circuit breaker OPEN for ${providerName} — cooling down for 5 min`);
  }
}

// ─── Deduplication ───────────────────────────────────────────────────────────

function normalizeUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Remove common tracking params
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'].forEach(p => u.searchParams.delete(p));
    return u.origin + u.pathname;
  } catch {
    return url.split('?')[0];
  }
}

function normalizeText(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function deduplicateJobs(jobs) {
  const seenUrls = new Set();
  const seenProviderIds = new Set();
  const seenTitleCompany = new Set();

  const unique = [];

  for (const job of jobs) {
    // Priority 1: same apply URL
    const normUrl = normalizeUrl(job.applyUrl);
    if (normUrl && seenUrls.has(normUrl)) continue;

    // Priority 2: same provider + providerJobId
    const providerKey = `${job.provider}:${job.providerJobId}`;
    if (job.providerJobId && seenProviderIds.has(providerKey)) continue;

    // Priority 3: same normalized title + company + location
    const titleCompanyKey = `${normalizeText(job.title)}|${normalizeText(job.company)}|${normalizeText(job.location)}`;
    if (seenTitleCompany.has(titleCompanyKey)) continue;

    // Not a duplicate — accept it
    if (normUrl) seenUrls.add(normUrl);
    if (job.providerJobId) seenProviderIds.add(providerKey);
    seenTitleCompany.add(titleCompanyKey);
    unique.push(job);
  }

  return unique;
}

// ─── Database Operations ─────────────────────────────────────────────────────

async function saveJobsToDB(jobs) {
  if (!jobs || jobs.length === 0) return 0;

  let saved = 0;
  for (const job of jobs) {
    if (!job.providerJobId) continue; // can't upsert without a provider job ID

    try {
      const descPreview = truncateDescription(job.description, 500);

      await dbQuery(`
        INSERT INTO accessibility_jobs
          (provider, provider_job_id, title, company, company_logo, location, job_type, employment_type,
           url, apply_url, is_remote, posted_date, description, tags, salary_min, salary_max, currency,
           fetched_at, first_seen, last_seen, active)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
           NOW(), NOW(), NOW(), TRUE)
        ON CONFLICT ON CONSTRAINT uq_jobs_provider_job_id DO UPDATE SET
          title = EXCLUDED.title,
          company = EXCLUDED.company,
          company_logo = EXCLUDED.company_logo,
          location = EXCLUDED.location,
          apply_url = EXCLUDED.apply_url,
          is_remote = EXCLUDED.is_remote,
          posted_date = EXCLUDED.posted_date,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          salary_min = EXCLUDED.salary_min,
          salary_max = EXCLUDED.salary_max,
          last_seen = NOW(),
          fetched_at = NOW(),
          active = TRUE
      `, [
        job.provider,
        job.providerJobId,
        job.title,
        job.company,
        job.companyLogo,
        job.location,
        job.employmentType,
        job.employmentType,
        job.applyUrl,
        job.applyUrl,
        job.isRemote,
        job.postedDate ? new Date(job.postedDate) : null,
        descPreview,
        (job.tags || ['Accessibility']).join(','),
        job.salaryMin != null ? Math.round(job.salaryMin * 100) / 100 : null,
        job.salaryMax != null ? Math.round(job.salaryMax * 100) / 100 : null,
        job.currency
      ]);
      saved++;
    } catch (err) {
      // Log but don't crash — persistence is best-effort
      console.error(`[providerManager] Failed to save job "${job.title}": ${err.message}`);
    }
  }

  return saved;
}

async function getJobsFromDB({ query, location, remoteOnly, limit = 20 }) {
  try {
    const conditions = ['active = TRUE'];
    const params = [];
    let idx = 1;

    // Keyword search across title and description
    if (query && query.toLowerCase() !== 'accessibility') {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${query}%`);
      idx++;
    }

    if (location) {
      conditions.push(`(location ILIKE $${idx} OR is_remote = TRUE)`);
      params.push(`%${location}%`);
      idx++;
    }

    if (remoteOnly) {
      conditions.push(`is_remote = TRUE`);
    }

    // Only return jobs from the last 7 days
    conditions.push(`(posted_date IS NULL OR posted_date >= NOW() - INTERVAL '7 days')`);

    const sql = `
      SELECT * FROM accessibility_jobs
      WHERE ${conditions.join(' AND ')}
      ORDER BY posted_date DESC NULLS LAST, last_seen DESC
      LIMIT $${idx}
    `;
    params.push(limit);

    const result = await dbQuery(sql, params);

    return result.rows.map(row => ({
      id: `db-${row.id}`,
      title: row.title,
      company: row.company,
      company_logo: row.company_logo,
      location: row.location,
      job_type: row.employment_type || row.job_type || 'Full-time',
      is_remote: row.is_remote,
      url: row.apply_url || row.url,
      source: row.provider ? `${row.provider} (via AccessHub)` : 'AccessHub',
      posted_date: row.posted_date ? row.posted_date.toISOString() : row.created_at?.toISOString(),
      description: row.description,
      tags: row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : ['Accessibility']
    }));
  } catch (err) {
    console.error(`[providerManager] DB query failed: ${err.message}`);
    return [];
  }
}

async function getDBJobCount() {
  try {
    const result = await dbQuery(`SELECT COUNT(*) FROM accessibility_jobs WHERE active = TRUE`);
    return parseInt(result.rows[0].count, 10);
  } catch {
    return 0;
  }
}

async function getRecentDBJobCount() {
  try {
    const result = await dbQuery(
      `SELECT COUNT(*) FROM accessibility_jobs WHERE active = TRUE AND (posted_date >= NOW() - INTERVAL '7 days' OR posted_date IS NULL)`
    );
    return parseInt(result.rows[0].count, 10);
  } catch {
    return 0;
  }
}

// ─── Provider Orchestrator ───────────────────────────────────────────────────

/**
 * Run all available (non-circuit-broken) providers in PARALLEL.
 * Collects results from all that succeed. Never lets one slow provider block others.
 *
 * @param {{ query: string, location: string, remoteOnly: boolean, page: number }} params
 * @returns {Promise<Object[]>} Deduplicated, normalized jobs from all successful providers
 */
async function fetchFromProviders(params) {
  const availableProviders = ALL_PROVIDERS.filter(p => {
    // Check if provider has an isAvailable function (for optional providers like Adzuna)
    if (typeof p.isAvailable === 'function' && !p.isAvailable()) {
      console.log(`[providerManager] Skipping ${p.name} — not configured`);
      return false;
    }
    // Check circuit breaker
    if (isBreakerOpen(p.name)) {
      console.log(`[providerManager] Skipping ${p.name} — circuit breaker OPEN`);
      return false;
    }
    return true;
  });

  if (availableProviders.length === 0) {
    console.log('[providerManager] All providers skipped (circuit breakers open or not configured)');
    return [];
  }

  console.log(`[providerManager] Fetching from ${availableProviders.map(p => p.name).join(', ')} in parallel`);

  // Run all in parallel — Promise.allSettled never rejects, even if some providers fail
  const results = await Promise.allSettled(
    availableProviders.map(async (provider) => {
      const start = Date.now();
      try {
        const jobs = await provider.searchJobs(params);
        const latency = Date.now() - start;
        recordSuccess(provider.name, latency);
        console.log(`[providerManager] ${provider.name}: ${jobs.length} jobs in ${latency}ms`);
        return jobs;
      } catch (err) {
        const latency = Date.now() - start;
        recordFailure(provider.name);
        console.error(`[providerManager] ${provider.name} FAILED in ${latency}ms: ${err.message}`);
        throw err; // allSettled will capture this as rejected
      }
    })
  );

  // Collect all successful results
  const allJobs = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
    }
  }

  console.log(`[providerManager] Total before dedup: ${allJobs.length}`);
  const deduped = deduplicateJobs(allJobs);
  console.log(`[providerManager] Total after dedup: ${deduped.length} (removed ${allJobs.length - deduped.length} duplicates)`);

  return deduped;
}

/**
 * Save jobs to DB asynchronously without blocking the response.
 * @param {Object[]} jobs
 */
function saveJobsAsync(jobs) {
  setImmediate(async () => {
    try {
      const saved = await saveJobsToDB(jobs);
      if (saved > 0) {
        console.log(`[providerManager] Saved ${saved} jobs to DB`);
      }
    } catch (err) {
      console.error(`[providerManager] Async DB save failed: ${err.message}`);
    }
  });
}

/**
 * Get circuit breaker + provider health status for the health endpoint.
 */
function getProviderHealth() {
  const health = {};
  for (const p of ALL_PROVIDERS) {
    const b = breakers[p.name];
    const configured = typeof p.isAvailable === 'function' ? p.isAvailable() : true;
    health[p.name] = {
      state: b.state,
      failures: b.failures,
      available: configured && b.state !== 'open',
      configured,
      avgLatencyMs: b.avgLatencyMs,
      totalCalls: b.totalCalls,
      cooldownEnds: b.state === 'open' ? new Date(b.cooldownUntil).toISOString() : null
    };
  }
  return health;
}

async function deleteOldJobs() {
  try {
    const result = await dbQuery(`DELETE FROM accessibility_jobs WHERE last_seen < NOW() - INTERVAL '30 days'`);
    if (result.rowCount > 0) {
      console.log(`[providerManager] Deleted ${result.rowCount} old jobs from DB`);
    }
  } catch (err) {
    console.error(`[providerManager] Failed to delete old jobs: ${err.message}`);
  }
}

module.exports = {
  fetchFromProviders,
  getJobsFromDB,
  saveJobsAsync,
  saveJobsToDB,
  getProviderHealth,
  getDBJobCount,
  getRecentDBJobCount,
  deduplicateJobs,
  deleteOldJobs
};
