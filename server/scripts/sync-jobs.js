/**
 * Background Sync Script — Pre-fetches accessibility job searches and persists to PostgreSQL.
 * 
 * Run manually:    npm run sync-jobs
 * Schedule via OS: Set up a Windows Task Scheduler or cron job to run every 6 hours.
 *
 * This builds up the PostgreSQL database so users can be served from it
 * even when all external providers are down.
 */

require('dotenv').config();
const { fetchFromProviders, saveJobsToDB, deduplicateJobs } = require('../providers/providerManager');
const { query: dbQuery, closePool } = require('../db');

const SYNC_QUERIES = [
  'Accessibility',
  'Accessibility Engineer',
  'Accessibility QA',
  'Accessibility Tester',
  'Accessibility Specialist',
  'WCAG',
  'ADA Compliance',
  'Section 508',
  'Screen Reader'
];

const DELAY_BETWEEN_QUERIES_MS = 2000; // 2s delay between queries to avoid rate limiting

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function syncAllQueries() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalSaved = 0;
  const allJobs = [];

  console.log(`[sync-jobs] Starting background sync at ${new Date().toISOString()}`);
  console.log(`[sync-jobs] Syncing ${SYNC_QUERIES.length} queries...\n`);

  for (let i = 0; i < SYNC_QUERIES.length; i++) {
    const query = SYNC_QUERIES[i];
    try {
      console.log(`[sync-jobs] (${i + 1}/${SYNC_QUERIES.length}) Fetching: "${query}"`);
      const jobs = await fetchFromProviders({ query, location: '', remoteOnly: false, page: 1 });
      console.log(`[sync-jobs]   → ${jobs.length} jobs fetched`);
      allJobs.push(...jobs);
      totalFetched += jobs.length;
    } catch (err) {
      console.error(`[sync-jobs]   → FAILED: ${err.message}`);
    }

    // Delay between queries to be respectful to API rate limits
    if (i < SYNC_QUERIES.length - 1) {
      await sleep(DELAY_BETWEEN_QUERIES_MS);
    }
  }

  // Deduplicate across all queries before saving
  console.log(`\n[sync-jobs] Deduplicating ${allJobs.length} total jobs...`);
  const deduped = deduplicateJobs(allJobs);
  const duplicatesRemoved = allJobs.length - deduped.length;
  console.log(`[sync-jobs] Duplicates removed: ${duplicatesRemoved}, unique jobs: ${deduped.length}`);

  // Save to DB
  console.log(`[sync-jobs] Saving to PostgreSQL...`);
  totalSaved = await saveJobsToDB(deduped);

  // Get total DB count
  try {
    const result = await dbQuery('SELECT COUNT(*) FROM accessibility_jobs WHERE active = TRUE');
    const totalInDB = result.rows[0].count;
    console.log(`[sync-jobs] Total jobs in DB: ${totalInDB}`);
  } catch (err) {
    console.error(`[sync-jobs] Could not get DB count: ${err.message}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n[sync-jobs] ✅ Sync complete in ${elapsed}s`);
  console.log(`[sync-jobs]    Fetched: ${totalFetched}`);
  console.log(`[sync-jobs]    Duplicates removed: ${duplicatesRemoved}`);
  console.log(`[sync-jobs]    Saved to DB: ${totalSaved}`);
}

syncAllQueries()
  .catch(err => {
    console.error('[sync-jobs] Fatal error:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await closePool();
  });
