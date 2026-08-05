/**
 * Adzuna Provider — free job search API with 1000 calls/month on free tier.
 * Requires ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables.
 * Sign up free at: https://developer.adzuna.com/
 */

const axios = require('axios');
const { normalizeJob, isRelevantJob } = require('./baseProvider');

const PROVIDER_NAME = 'adzuna';
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
const TIMEOUT_MS = 10000;
const DEFAULT_COUNTRY = 'us';
const RESULTS_PER_PAGE = 20;

/**
 * Check if Adzuna credentials are configured.
 * @returns {boolean}
 */
function isAvailable() {
  return Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
}

/**
 * Fetch jobs from Adzuna API.
 * @param {{ query: string, location: string, remoteOnly: boolean, page: number }} params
 * @returns {Promise<Object[]>} Normalized job objects
 */
async function searchJobs({ query, location, remoteOnly, page = 1 }) {
  if (!isAvailable()) {
    throw new Error('Adzuna: ADZUNA_APP_ID or ADZUNA_APP_KEY not configured');
  }

  const country = DEFAULT_COUNTRY;
  const url = `${BASE_URL}/${country}/search/${page}`;

  const params = {
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    results_per_page: RESULTS_PER_PAGE,
    what: query,
    max_days_old: 7
  };

  if (location) {
    params.where = location;
  }

  if (remoteOnly) {
    params.title_only = 'remote';
  }

  const response = await axios.get(url, { params, timeout: TIMEOUT_MS });

  const results = response.data?.results || [];

  return results
    .filter(job => {
      if (!job.redirect_url) return false;
      return isRelevantJob(job.title, job.description);
    })
    .map(job => {
      // Adzuna salary is in local currency
      const salaryMin = job.salary_min ? Math.round(job.salary_min) : null;
      const salaryMax = job.salary_max ? Math.round(job.salary_max) : null;

      return normalizeJob({
        provider: PROVIDER_NAME,
        providerJobId: job.id,
        title: job.title,
        company: job.company?.display_name || null,
        description: job.description,
        location: job.location?.display_name || null,
        applyUrl: job.redirect_url,
        companyLogo: null, // Adzuna doesn't provide logos
        salaryMin,
        salaryMax,
        currency: country === 'us' ? 'USD' : null,
        employmentType: job.contract_time === 'part_time' ? 'Part-time'
          : job.contract_type === 'contract' ? 'Contract'
          : 'Full-time',
        isRemote: remoteOnly || (job.title?.toLowerCase().includes('remote') || false),
        postedDate: job.created || null
      });
    })
    .filter(Boolean);
}

module.exports = { searchJobs, isAvailable, name: PROVIDER_NAME };
