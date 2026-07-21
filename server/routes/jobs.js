const express = require('express');
const axios = require('axios');

const router = express.Router();

// In-memory cache for job search queries (6-hour TTL to save API limits)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const jobsCache = new Map();

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

// GET /api/jobs - Search jobs in real-time using JSearch API
router.get('/', async (req, res, next) => {
  try {
    const searchTerms = req.query.query || 'accessibility';
    const location = req.query.location || '';
    const page = req.query.page || '1';
    const remoteOnly = req.query.remote_jobs_only === 'true';

    // Construct a cache key based on query parameters
    const cacheKey = `${searchTerms}|${location}|${page}|${remoteOnly}`;
    const cachedData = jobsCache.get(cacheKey);

    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL_MS)) {
      return res.json(cachedData.data);
    }

    // Allow multiple keys from comma-separated RAPIDAPI_KEYS or a single RAPIDAPI_KEY
    const apiKeysString = process.env.RAPIDAPI_KEYS || process.env.RAPIDAPI_KEY || '';
    const apiKeys = apiKeysString.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      return res.status(500).json({ error: 'RAPIDAPI_KEY is not configured on the server.' });
    }

    // Build the query string for JSearch
    let jsearchQuery = searchTerms;
    if (location) {
      jsearchQuery += ` in ${location}`;
    }

    let response = null;
    let lastError = null;

    // Try each API key in order until one works or we run out of keys
    for (let i = 0; i < apiKeys.length; i++) {
      try {
        const rapidApiKey = apiKeys[i];
        response = await axios.get('https://jsearch.p.rapidapi.com/search', {
          params: {
            query: jsearchQuery,
            page: page,
            num_pages: '2', // Fetch 2 pages (up to 20 jobs) to prevent RapidAPI timeouts
            remote_jobs_only: remoteOnly ? 'true' : 'false'
          },
          headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'jsearch.p.rapidapi.com'
          }
        });
        
        // If successful, break out of the loop
        break;
      } catch (err) {
        lastError = err;
        // If it's a 429 Rate Limit error and we have more keys, continue to the next key
        if (err.response && err.response.status === 429 && i < apiKeys.length - 1) {
          console.log(`Rate limit exceeded for API key index ${i}. Switching to backup key...`);
          continue;
        }
        // If it's another type of error or we are out of keys, throw the error
        throw err;
      }
    }

    // Normalize and clean up data format, filtering out fake/spam jobs
    const jobs = (response.data?.data || []).filter(job => {
      // Fake Job Filter 1: Must have a valid apply link or google link
      if (!job.job_apply_link && !job.job_google_link) return false;
      
      // Fake Job Filter 2: Must be relevant to Accessibility (sometimes APIs return unrelated junk)
      const textToSearch = `${job.job_title} ${job.job_description}`.toLowerCase();
      const isRelevant = textToSearch.includes('accessibil') || 
                         textToSearch.includes('wcag') || 
                         textToSearch.includes('a11y') || 
                         textToSearch.includes('ada ') || 
                         textToSearch.includes('508') ||
                         textToSearch.includes('screen reader');
      if (!isRelevant) return false;

      return true;
    }).map(job => {
      // Extract clean description preview
      let descPreview = job.job_description || '';
      if (descPreview.length > 300) {
        descPreview = descPreview.substring(0, 300) + '...';
      }

      // Infer tags from title and description
      const tags = [];
      const textToSearch = `${job.job_title} ${job.job_description}`.toLowerCase();
      if (textToSearch.includes('wcag') || textToSearch.includes('web accessibility')) tags.push('WCAG');
      if (textToSearch.includes('screen reader') || textToSearch.includes('nvda') || textToSearch.includes('jaws')) tags.push('Screen Readers');
      if (textToSearch.includes('ada') || textToSearch.includes('americans with disabilities')) tags.push('ADA');
      if (textToSearch.includes('aria') || textToSearch.includes('wai-aria')) tags.push('ARIA');
      if (textToSearch.includes('pdf')) tags.push('PDF Accessibility');
      if (textToSearch.includes('a11y')) tags.push('A11y');

      return {
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        company_logo: job.employer_logo || null,
        location: job.job_city && job.job_country 
          ? `${job.job_city}, ${job.job_country}` 
          : job.job_country || job.job_state || 'Remote / Unknown',
        job_type: job.job_employment_type || 'Full-time',
        is_remote: remoteOnly || job.job_is_remote || false,
        url: job.job_apply_link || job.job_google_link,
        source: job.job_publisher || 'Job Board',
        posted_date: job.job_posted_at_datetime_utc || new Date().toISOString(),
        description: descPreview,
        tags: tags.length > 0 ? tags : ['Accessibility']
      };
    });

    // Cache the response
    jobsCache.set(cacheKey, {
      timestamp: Date.now(),
      data: jobs
    });

    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs from JSearch:', err.message);
    if (err.response) {
      console.error('Response Data:', err.response.data);
      if (err.response.status === 403) {
        return res.status(403).json({ error: 'API Error: Your RapidAPI account is not subscribed to the JSearch API. Please go to the Pricing tab on RapidAPI and subscribe to the free tier.' });
      } else if (err.response.status === 429) {
        console.log('Rate limit exceeded on all available API keys. Returning fallback jobs.');
        return res.json(FALLBACK_JOBS);
      }
    }
    console.log('API error occurred. Returning fallback jobs.');
    return res.json(FALLBACK_JOBS);
  }
});

module.exports = router;
