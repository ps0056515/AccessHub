/**
 * JSearch Provider — wraps the JSearch v2 RapidAPI endpoint.
 * Handles key rotation across multiple RAPIDAPI_KEYS.
 */

const axios = require('axios');
const { normalizeJob, isRelevantJob } = require('./baseProvider');

const PROVIDER_NAME = 'jsearch';
const BASE_URL = 'https://jsearch.p.rapidapi.com/search-v2';
const TIMEOUT_MS = 15000;

// Statuses that warrant rotating to the next key
const ROTATE_ON_STATUS = [401, 403, 404, 429];
// Statuses that are transient — retry with same key (not applicable here since we rotate)
const TRANSIENT_STATUS = [500, 502, 503, 504];

// Map common location names / country names to JSearch country codes
const COUNTRY_MAP = {
  // Americas
  'us': 'us', 'usa': 'us', 'united states': 'us', 'america': 'us',
  'canada': 'ca', 'ca': 'ca',
  'brazil': 'br', 'brasil': 'br', 'br': 'br',
  'mexico': 'mx', 'mx': 'mx',
  'argentina': 'ar', 'ar': 'ar',

  // Europe
  'uk': 'gb', 'gb': 'gb', 'united kingdom': 'gb', 'england': 'gb', 'britain': 'gb',
  'germany': 'de', 'de': 'de', 'deutschland': 'de',
  'france': 'fr', 'fr': 'fr',
  'spain': 'es', 'es': 'es',
  'italy': 'it', 'it': 'it',
  'netherlands': 'nl', 'nl': 'nl', 'holland': 'nl',
  'sweden': 'se', 'se': 'se',
  'norway': 'no', 'no': 'no',
  'denmark': 'dk', 'dk': 'dk',
  'finland': 'fi', 'fi': 'fi',
  'switzerland': 'ch', 'ch': 'ch',
  'austria': 'at', 'at': 'at',
  'belgium': 'be', 'be': 'be',
  'portugal': 'pt', 'pt': 'pt',
  'poland': 'pl', 'pl': 'pl',
  'ireland': 'ie', 'ie': 'ie',

  // Asia
  'india': 'in', 'in': 'in',
  'singapore': 'sg', 'sg': 'sg',
  'australia': 'au', 'au': 'au',
  'new zealand': 'nz', 'nz': 'nz',
  'japan': 'jp', 'jp': 'jp',
  'south korea': 'kr', 'korea': 'kr', 'kr': 'kr',
  'china': 'cn', 'cn': 'cn',
  'hong kong': 'hk', 'hk': 'hk',
  'uae': 'ae', 'dubai': 'ae', 'united arab emirates': 'ae', 'ae': 'ae',
  'israel': 'il', 'il': 'il',
  'malaysia': 'my', 'my': 'my',
  'philippines': 'ph', 'ph': 'ph',

  // Africa
  'south africa': 'za', 'za': 'za',
  'nigeria': 'ng', 'ng': 'ng',
  'kenya': 'ke', 'ke': 'ke',
};

/**
 * Detect country code from a free-text location string.
 * Returns 'us' as default if no match found.
 */
function detectCountryCode(location) {
  if (!location) return 'us';
  const lower = location.toLowerCase().trim();

  // Check if the location directly matches a country name/code
  if (COUNTRY_MAP[lower]) return COUNTRY_MAP[lower];

  // Check if any country name appears anywhere in the location string
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(key)) return code;
  }

  // Default to US — JSearch requires a country param
  return 'us';
}

/**
 * Fetch jobs from JSearch API.
 * @param {{ query: string, location: string, remoteOnly: boolean, page: number }} params
 * @returns {Promise<Object[]>} Normalized job objects
 */
async function searchJobs({ query, location, remoteOnly, page = 1 }) {
  const apiKeysString = process.env.RAPIDAPI_KEYS || process.env.RAPIDAPI_KEY || '';
  const apiKeys = apiKeysString.split(',').map(k => k.trim()).filter(Boolean);

  if (apiKeys.length === 0) {
    throw new Error('JSearch: No RAPIDAPI_KEYS configured');
  }

  let jsearchQuery = query;
  if (location) {
    jsearchQuery += ` in ${location}`;
  }

  const countryCode = detectCountryCode(location);

  const searchParams = {
    query: jsearchQuery,
    page: String(page),
    num_pages: '1',
    date_posted: 'week',
    country: countryCode
  };

  // Do NOT send remote_jobs_only: 'false' — causes JSearch v2 to hang
  if (remoteOnly) {
    searchParams.remote_jobs_only = 'true';
  }

  let lastError = null;

  for (let i = 0; i < apiKeys.length; i++) {
    try {
      const response = await axios.get(BASE_URL, {
        params: searchParams,
        headers: {
          'x-rapidapi-key': apiKeys[i],
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        },
        timeout: TIMEOUT_MS
      });

      // v2 nests jobs inside data.jobs
      const rawJobs = response.data?.data?.jobs || response.data?.data || [];
      const jobs = Array.isArray(rawJobs) ? rawJobs : [];

      return jobs
        .filter(job => {
          if (!job.job_apply_link && !job.job_google_link) return false;
          return isRelevantJob(job.job_title, job.job_description);
        })
        .map(job => normalizeJob({
          provider: PROVIDER_NAME,
          providerJobId: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          description: job.job_description,
          location: job.job_city && job.job_country
            ? `${job.job_city}, ${job.job_country}`
            : job.job_country || job.job_state || null,
          applyUrl: job.job_apply_link || job.job_google_link,
          companyLogo: job.employer_logo || null,
          salaryMin: job.job_min_salary || null,
          salaryMax: job.job_max_salary || null,
          currency: job.job_salary_currency || null,
          employmentType: job.job_employment_type || 'Full-time',
          isRemote: remoteOnly || job.job_is_remote || false,
          postedDate: job.job_posted_at_datetime_utc || null
        }))
        .filter(Boolean); // remove null (invalid normalizations)

    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');

      // For rotate-worthy statuses or timeouts, try next key
      if (i < apiKeys.length - 1) {
        if (isTimeout || ROTATE_ON_STATUS.includes(status) || TRANSIENT_STATUS.includes(status)) {
          console.log(`[jsearch] Key ${i + 1} failed (${isTimeout ? 'TIMEOUT' : status}), rotating to key ${i + 2}`);
          continue;
        }
      }

      // Do NOT retry 400 bad request — it's a malformed query, not a transient error
      if (status === 400) throw err;

      // Out of keys or non-retryable error
      throw err;
    }
  }

  throw lastError;
}

module.exports = { searchJobs, name: PROVIDER_NAME };
