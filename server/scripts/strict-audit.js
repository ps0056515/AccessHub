const { fetchFromProviders, getJobsFromDB, saveJobsToDB, getProviderHealth } = require('../providers/providerManager');
const jsearch = require('../providers/jsearch');
const { query: dbQuery } = require('../db');
const axios = require('axios');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runStrictAudit() {
  console.log('=== STRICT AUDIT START ===\n');

  // --- 1. Circuit Breaker State Machine Evidence ---
  console.log('--- 1. Circuit Breaker Test ---');
  
  // Save original
  const originalJsearch = jsearch.searchJobs;
  
  let attempts = 0;
  jsearch.searchJobs = async () => {
    attempts++;
    if (attempts <= 3) {
      throw new Error(`Simulated failure ${attempts}`);
    }
    return [{ title: 'Recovered Job', provider: 'jsearch', providerJobId: 'rec1' }];
  };

  const getHealth = () => getProviderHealth().jsearch;

  console.log('Initial state:', getHealth().state, `(Failures: ${getHealth().failures})`);
  
  // Failure 1
  try { await fetchFromProviders({ query: 'test' }); } catch(e){}
  console.log('After failure 1:', getHealth().state, `(Failures: ${getHealth().failures})`);
  
  // Failure 2
  try { await fetchFromProviders({ query: 'test' }); } catch(e){}
  console.log('After failure 2:', getHealth().state, `(Failures: ${getHealth().failures})`);
  
  // Failure 3 -> Should Open
  try { await fetchFromProviders({ query: 'test' }); } catch(e){}
  console.log('After failure 3:', getHealth().state, `(Failures: ${getHealth().failures})`);
  
  // Force cooldown expiration for test
  // We need to access internal state, which is scoped. 
  // Let's just wait 1ms but we can't edit the internal scope directly. 
  // Since we can't easily manipulate providerManager's scoped variables without editing it,
  // we will just note that the Circuit Breaker tests open state. 
  // To truly test half-open, we would need to mock Date.now() globally.
  
  const originalDateNow = Date.now;
  Date.now = () => originalDateNow() + (6 * 60 * 1000); // Fast forward 6 minutes
  
  console.log('Fast-forwarded time 6 minutes...');
  // The 4th attempt should be half-open, succeed, and recover to closed.
  try { await fetchFromProviders({ query: 'test' }); } catch(e){}
  console.log('After 4th attempt (success):', getHealth().state, `(Failures: ${getHealth().failures})`);
  
  Date.now = originalDateNow; // restore
  jsearch.searchJobs = originalJsearch; // restore


  // --- 2. DB Concurrency (Race Condition) Test ---
  console.log('\n--- 2. Database Concurrency (UPSERT Race Condition) Test ---');
  const dummyJob = {
    provider: 'race-test', providerJobId: 'id-1', title: 'Race Job', company: 'Race Co',
    location: 'Remote', applyUrl: 'http://race.com', description: 'Race',
    employmentType: 'Full-time', isRemote: true, tags: ['A11y']
  };

  await dbQuery(`DELETE FROM accessibility_jobs WHERE provider = 'race-test'`);
  
  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(saveJobsToDB([dummyJob])); // Fire 50 identical upserts simultaneously
  }
  
  await Promise.all(promises);
  const raceCount = await dbQuery(`SELECT COUNT(*) FROM accessibility_jobs WHERE provider = 'race-test'`);
  console.log(`Concurrent UPSERTs fired: 50. Final row count in DB: ${raceCount.rows[0].count}`);
  await dbQuery(`DELETE FROM accessibility_jobs WHERE provider = 'race-test'`);


  // --- 3. Performance Benchmark ---
  console.log('\n--- 3. Performance Benchmarks ---');
  
  // DB Fetch
  const dbStart = Date.now();
  await getJobsFromDB({ query: 'accessibility', location: '', remoteOnly: false, limit: 20 });
  const dbDuration = Date.now() - dbStart;
  console.log(`Database read latency (20 rows): ${dbDuration}ms`);
  
  // API Fetch (via HTTP route)
  // We'll use axios to hit localhost to test cache vs cold
  try {
    // Note: ensure server is running via `npm run dev` in background
    console.log(`(Make sure server is running on port 3015 to test route latency)`);
  } catch (e) {
    console.log('Server not available for HTTP latency test');
  }

  console.log('\n=== STRICT AUDIT END ===');
}

runStrictAudit().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
