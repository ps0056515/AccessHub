require('dotenv').config();
const axios = require('axios');

const keysString = process.env.RAPIDAPI_KEYS || process.env.RAPIDAPI_KEY || '';
const keys = keysString.split(',').map(k => k.trim()).filter(Boolean);

(async () => {
  try {
    const start = Date.now();
    const res = await axios.get('https://jsearch.p.rapidapi.com/search-v2', {
      params: { query: 'accessibility', date_posted: 'all', country: 'us', num_pages: '1' },
      headers: {
        'x-rapidapi-key': keys[0],
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      },
      timeout: 30000
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const jobsArray = res.data?.data?.jobs || res.data?.data || [];
    
    console.log(`API responded in ${elapsed}s with ${jobsArray.length} jobs\n`);
    
    jobsArray.forEach((job, i) => {
      console.log(`--- Job ${i + 1} ---`);
      console.log(`  Title: ${job.job_title}`);
      console.log(`  Company: ${job.employer_name}`);
      console.log(`  Location: ${job.job_city}, ${job.job_state}, ${job.job_country}`);
      console.log(`  Posted: ${job.job_posted_at_datetime_utc}`);
      console.log(`  Remote: ${job.job_is_remote}`);
      console.log(`  Apply: ${job.job_apply_link ? job.job_apply_link.substring(0, 80) : 'N/A'}`);
      console.log(`  Publisher: ${job.job_publisher}`);
      console.log('');
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.log('TIMEOUT');
    } else {
      console.log('FAIL:', err.response?.status, err.response?.data?.message || err.message);
    }
  }
})();
