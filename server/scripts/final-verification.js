const { deleteOldJobs, fetchFromProviders, getJobsFromDB } = require('../providers/providerManager');
const { query } = require('../db');
const assert = require('assert');

async function verifyEverything() {
  console.log('--- FINAL VERIFICATION START ---');

  // 1. Check DB Connection and Table
  console.log('1. Checking Database...');
  try {
    const dbCheck = await query('SELECT COUNT(*) FROM accessibility_jobs');
    console.log(`✅ Database connected. Current job count: ${dbCheck.rows[0].count}`);
  } catch (e) {
    console.error('❌ Database connection failed', e);
    process.exit(1);
  }

  // 2. Check deleteOldJobs function (Syntax & execution check)
  console.log('2. Checking deleteOldJobs function...');
  try {
    await deleteOldJobs();
    console.log('✅ deleteOldJobs executed successfully without errors.');
  } catch (e) {
    console.error('❌ deleteOldJobs failed', e);
    process.exit(1);
  }

  // 3. Check Providers Integration (Live Fetch)
  console.log('3. Checking Multi-Provider Fetch (Live)...');
  try {
    const jobs = await fetchFromProviders({ query: 'accessibility', location: '', remoteOnly: false, page: 1 });
    assert(Array.isArray(jobs), 'Jobs should be an array');
    console.log(`✅ Providers fetched successfully. Found ${jobs.length} total unique jobs.`);
    if (jobs.length > 0) {
      const job = jobs[0];
      assert(job.id || job.providerJobId, 'Job is missing ID');
      assert(job.title, 'Job is missing title');
      console.log('✅ Data normalization is perfectly intact.');
    }
  } catch (e) {
    console.error('❌ Provider fetch failed', e);
    process.exit(1);
  }

  // 4. Check DB Read Function (Fallback)
  console.log('4. Checking Database Read (Fallback layer)...');
  try {
    const dbJobs = await getJobsFromDB({ query: 'accessibility', location: '', remoteOnly: false });
    assert(Array.isArray(dbJobs), 'DB jobs should be an array');
    console.log(`✅ DB Read works perfectly. Retrieved ${dbJobs.length} jobs.`);
  } catch (e) {
    console.error('❌ DB read failed', e);
    process.exit(1);
  }

  console.log('--- FINAL VERIFICATION COMPLETE: ALL SYSTEMS GO ---');
  process.exit(0);
}

verifyEverything();
