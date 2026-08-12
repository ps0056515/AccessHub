const { fetchFromProviders, getJobsFromDB, saveJobsToDB, deduplicateJobs } = require('../providers/providerManager');
const jsearch = require('../providers/jsearch');
const adzuna = require('../providers/adzuna');
const arbeitnow = require('../providers/arbeitnow');
const { query: dbQuery } = require('../db');
const axios = require('axios');
const assert = require('assert');

async function runTests() {
  const results = {};
  
  // 1. Parallel Execution Verification
  console.log('--- Parallel Execution ---');
  const start = Date.now();
  try {
    const jobs = await fetchFromProviders({ query: 'accessibility', location: '', remoteOnly: false, page: 1 });
    const duration = Date.now() - start;
    console.log(`Fetched ${jobs.length} jobs in ${duration}ms`);
    results.parallelExecution = { duration, jobsCount: jobs.length };
  } catch (e) {
    console.error(e);
  }

  // 2. Failure Simulation (Manual Mocking)
  console.log('--- Failure Simulation ---');
  
  // Mock JSearch to timeout
  const originalJSearch = jsearch.searchJobs;
  jsearch.searchJobs = async () => {
    await new Promise(r => setTimeout(r, 100));
    throw new Error('Timeout');
  };

  const startFail = Date.now();
  try {
    const jobs = await fetchFromProviders({ query: 'accessibility', location: '', remoteOnly: false, page: 1 });
    const durationFail = Date.now() - startFail;
    console.log(`Fallback worked: fetched ${jobs.length} jobs in ${durationFail}ms (with JSearch failing)`);
    results.fallbackWorked = true;
  } catch (e) {
    console.error('Fallback failed', e);
    results.fallbackWorked = false;
  }
  
  // Restore JSearch
  jsearch.searchJobs = originalJSearch;

  // 3. Database Constraints Verification
  console.log('--- DB Constraints ---');
  const dummyJob = {
    provider: 'test-provider',
    providerJobId: '123',
    title: 'Test Job',
    company: 'Test Co',
    location: 'Remote',
    applyUrl: 'http://test.com',
    description: 'Test desc',
    salaryMin: null,
    salaryMax: null,
    currency: null,
    employmentType: 'Full-time',
    isRemote: true,
    tags: ['A11y']
  };

  try {
    await saveJobsToDB([dummyJob]);
    await saveJobsToDB([dummyJob]); // UPSERT
    const countRes = await dbQuery(`SELECT COUNT(*) FROM accessibility_jobs WHERE provider = 'test-provider'`);
    console.log(`DB Count for test provider: ${countRes.rows[0].count}`);
    results.dbUpsertWorks = countRes.rows[0].count === '1';
    
    // Clean up
    await dbQuery(`DELETE FROM accessibility_jobs WHERE provider = 'test-provider'`);
  } catch (e) {
    console.error('DB Constraint Test Failed', e);
    results.dbUpsertWorks = false;
  }

  console.log('RESULTS_JSON:' + JSON.stringify(results));
}

runTests().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
