/**
 * Jobs Route — slim handler delegating all logic to providerManager.
 *
 * Search flow:
 *   1. Check in-memory cache
 *   2. Query PostgreSQL for recent matching jobs (≥5 → return immediately)
 *   3. Fetch from providers in parallel (circuit breakers applied)
 *   4. Normalize + deduplicate
 *   5. Save to PostgreSQL (async, non-blocking)
 *   6. Refresh cache + return
 *   7. Last resort: hardcoded FALLBACK_JOBS
 */

const express = require('express');
const {
  fetchFromProviders,
  getJobsFromDB,
  saveJobsAsync,
  getProviderHealth,
  getDBJobCount,
  getRecentDBJobCount
} = require('../providers/providerManager');
const { inferTags, truncateDescription } = require('../providers/baseProvider');

const router = express.Router();

// ─── In-Memory Cache ─────────────────────────────────────────────────────────
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const jobsCache = new Map();

function getCached(key) {
  const entry = jobsCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(key, data) {
  jobsCache.set(key, { timestamp: Date.now(), data });
}

// ─── Fallback Jobs (absolute last resort) ────────────────────────────────────
const FALLBACK_JOBS = [
  {
    id: 'fallback-1',
    title: 'Digital Accessibility Specialist',
    company: 'InclusiveWeb',
    company_logo: null,
    location: 'Remote',
    job_type: 'Full-time',
    is_remote: true,
    url: '#',
    source: 'AccessHub (Fallback)',
    posted_date: new Date().toISOString(),
    description: 'We are looking for an experienced Digital Accessibility Specialist to ensure our digital products are accessible to everyone. You will perform WCAG audits, work with developers to fix issues, and advocate for inclusive design.',
    tags: ['WCAG', 'A11y', 'Screen Readers']
  },
  {
    id: 'fallback-2',
    title: 'Accessibility QA Engineer',
    company: 'TechForAll',
    company_logo: null,
    location: 'New York, NY',
    job_type: 'Contract',
    is_remote: false,
    url: '#',
    source: 'AccessHub (Fallback)',
    posted_date: new Date(Date.now() - 86400000).toISOString(),
    description: 'Join our QA team to focus specifically on accessibility testing. Experience with JAWS, NVDA, VoiceOver, and automated testing tools required.',
    tags: ['QA', 'Screen Readers', 'ADA']
  },
  {
    id: 'fallback-3',
    title: 'Frontend Developer (Accessibility Focus)',
    company: 'Global Solutions Inc.',
    company_logo: null,
    location: 'London, UK / Remote',
    job_type: 'Full-time',
    is_remote: true,
    url: '#',
    source: 'AccessHub (Fallback)',
    posted_date: new Date(Date.now() - 172800000).toISOString(),
    description: 'Seeking a frontend developer who is passionate about creating accessible user interfaces. Must have deep knowledge of ARIA attributes, semantic HTML, and keyboard navigation patterns.',
    tags: ['Frontend', 'ARIA', 'A11y']
  }
];

function filterFallback({ searchTerms, location, remoteOnly }) {
  return FALLBACK_JOBS.filter(job => {
    if (remoteOnly && !job.is_remote) return false;
    if (location && !job.location.toLowerCase().includes(location.toLowerCase()) && job.location !== 'Remote') return false;
    if (searchTerms && searchTerms.toLowerCase() !== 'accessibility') {
      const text = `${job.title} ${job.description} ${job.company}`.toLowerCase();
      if (!text.includes(searchTerms.toLowerCase())) return false;
    }
    return true;
  });
}

// ─── Normalize provider jobs to API response shape ────────────────────────────
function toResponseShape(job) {
  return {
    id: `${job.provider}-${job.providerJobId || Math.random()}`,
    title: job.title,
    company: job.company,
    company_logo: job.companyLogo || null,
    location: job.location || 'Remote / Unknown',
    job_type: job.employmentType || 'Full-time',
    is_remote: job.isRemote || false,
    url: job.applyUrl,
    source: job.provider,
    posted_date: job.postedDate || new Date().toISOString(),
    description: truncateDescription(job.description, 300),
    tags: job.tags || inferTags(job.title, job.description)
  };
}

// ─── Main Search Route ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const searchTerms = req.query.query || 'accessibility';
  const location = req.query.location || '';
  const page = parseInt(req.query.page, 10) || 1;
  const remoteOnly = req.query.remote_jobs_only === 'true';

  const cacheKey = `${searchTerms}|${location}|${page}|${remoteOnly}`;

  // Layer 1: In-memory cache
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[jobs] Cache hit for: ${cacheKey}`);
    return res.json(cached);
  }

  // Layer 2: PostgreSQL — if we have ≥5 recent jobs, serve them immediately
  // and trigger a background refresh from providers
  try {
    const dbJobs = await getJobsFromDB({ query: searchTerms, location, remoteOnly });
    if (dbJobs.length >= 5) {
      console.log(`[jobs] Serving ${dbJobs.length} jobs from DB`);
      setCache(cacheKey, dbJobs);

      // Background refresh from providers (non-blocking)
      setImmediate(async () => {
        try {
          const freshJobs = await fetchFromProviders({ query: searchTerms, location, remoteOnly, page });
          if (freshJobs.length > 0) {
            saveJobsAsync(freshJobs);
            const shaped = freshJobs.map(toResponseShape);
            setCache(cacheKey, shaped);
            console.log(`[jobs] Background refresh: ${freshJobs.length} fresh jobs cached`);
          }
        } catch (err) {
          console.error(`[jobs] Background refresh failed: ${err.message}`);
        }
      });

      return res.json(dbJobs);
    }
  } catch (dbErr) {
    console.error(`[jobs] DB query failed: ${dbErr.message}`);
  }

  // Layer 3: Fetch from all providers in parallel
  try {
    const providerJobs = await fetchFromProviders({ query: searchTerms, location, remoteOnly, page });

    if (providerJobs.length > 0) {
      const shaped = providerJobs.map(toResponseShape);
      setCache(cacheKey, shaped);
      saveJobsAsync(providerJobs); // persist to DB non-blocking
      return res.json(shaped);
    }
  } catch (err) {
    console.error(`[jobs] All providers failed: ${err.message}`);
  }

  // Layer 4: Try DB again (even if < 5 jobs — better than fallback)
  try {
    const dbJobs = await getJobsFromDB({ query: searchTerms, location, remoteOnly });
    if (dbJobs.length > 0) {
      console.log(`[jobs] Serving ${dbJobs.length} jobs from DB (after provider failure)`);
      return res.json(dbJobs);
    }
  } catch (dbErr) {
    console.error(`[jobs] DB fallback query failed: ${dbErr.message}`);
  }

  // Layer 5: Absolute last resort — hardcoded fallback
  console.log('[jobs] All sources failed — returning hardcoded fallback jobs');
  return res.json(filterFallback({ searchTerms, location, remoteOnly }));
});

// ─── Provider Health Endpoint ─────────────────────────────────────────────────
router.get('/health', async (_req, res) => {
  try {
    const [totalJobs, recentJobs] = await Promise.all([
      getDBJobCount(),
      getRecentDBJobCount()
    ]);

    res.json({
      providers: getProviderHealth(),
      database: { totalJobs, jobsLastWeek: recentJobs },
      cache: { entries: jobsCache.size, ttlMs: CACHE_TTL_MS }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
