const express = require('express');
const axios = require('axios');

const router = express.Router();

// In-memory cache for job search queries (6-hour TTL to save API limits)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const jobsCache = new Map();

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

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      return res.status(500).json({ error: 'RAPIDAPI_KEY is not configured on the server.' });
    }

    // Build the query string for JSearch
    let jsearchQuery = searchTerms;
    if (location) {
      jsearchQuery += ` in ${location}`;
    }

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
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
        return res.status(429).json({ error: 'API Error: Rate limit exceeded. Please try again later.' });
      }
    }
    res.status(500).json({ error: 'Could not load jobs at this time. Please try again later.' });
  }
});

module.exports = router;
