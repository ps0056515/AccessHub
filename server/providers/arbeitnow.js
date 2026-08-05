/**
 * Arbeitnow Provider — 100% free public job board API. No API key required.
 * Aggregates jobs from ATS systems like Greenhouse, SmartRecruiters, etc.
 * Acts as the ultimate fallback provider that's always available.
 * 
 * Endpoint: https://www.arbeitnow.com/api/job-board-api
 * Note: Does not support server-side query filtering — we filter client-side.
 */

const axios = require('axios');
const { normalizeJob, isRelevantJob } = require('./baseProvider');

const PROVIDER_NAME = 'arbeitnow';
const BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';
const TIMEOUT_MS = 10000;

/**
 * Arbeitnow is always available — no keys needed.
 * @returns {boolean}
 */
function isAvailable() {
  return true;
}

/**
 * Fetch jobs from Arbeitnow API and filter by accessibility keywords.
 * @param {{ query: string, location: string, remoteOnly: boolean, page: number }} params
 * @returns {Promise<Object[]>} Normalized job objects
 */
async function searchJobs({ query, location, remoteOnly, page = 1 }) {
  const params = { page };

  const response = await axios.get(BASE_URL, { params, timeout: TIMEOUT_MS });

  const results = response.data?.data || [];

  return results
    .filter(job => {
      if (!job.url) return false;

      // Arbeitnow doesn't support server-side search — filter by accessibility keywords here
      if (!isRelevantJob(job.title, job.description)) return false;

      // Location filter (loose match)
      if (location && !remoteOnly) {
        const jobLocation = (job.location || '').toLowerCase();
        const searchLocation = location.toLowerCase();
        if (jobLocation && !jobLocation.includes(searchLocation)) {
          // Allow remote jobs to pass through even if location doesn't match
          if (!job.remote) return false;
        }
      }

      if (remoteOnly && !job.remote) return false;

      return true;
    })
    .map(job => normalizeJob({
      provider: PROVIDER_NAME,
      providerJobId: job.slug,
      title: job.title,
      company: job.company_name,
      description: job.description,
      location: job.location || (job.remote ? 'Remote' : null),
      applyUrl: job.url,
      companyLogo: null,
      salaryMin: null,
      salaryMax: null,
      currency: null,
      employmentType: job.job_types?.includes('full-time') ? 'Full-time'
        : job.job_types?.includes('contract') ? 'Contract'
        : job.job_types?.includes('part-time') ? 'Part-time'
        : 'Full-time',
      isRemote: Boolean(job.remote),
      postedDate: job.created_at
        ? new Date(job.created_at * 1000).toISOString()
        : null
    }))
    .filter(Boolean);
}

module.exports = { searchJobs, isAvailable, name: PROVIDER_NAME };
