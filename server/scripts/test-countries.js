require('dotenv').config();
const js = require('../providers/jsearch');

(async () => {
  try {
    console.log('Testing Germany...');
    const jobs = await js.searchJobs({ query: 'accessibility', location: 'Germany', remoteOnly: false, page: 1 });
    console.log('Germany jobs:', jobs.length);
    jobs.slice(0, 3).forEach((j, i) => console.log(`  ${i + 1}. ${j.title} @ ${j.company} (${j.location})`));

    console.log('\nTesting India...');
    const jobs2 = await js.searchJobs({ query: 'accessibility', location: 'India', remoteOnly: false, page: 1 });
    console.log('India jobs:', jobs2.length);
    jobs2.slice(0, 3).forEach((j, i) => console.log(`  ${i + 1}. ${j.title} @ ${j.company} (${j.location})`));

    console.log('\nTesting UK...');
    const jobs3 = await js.searchJobs({ query: 'accessibility', location: 'UK', remoteOnly: false, page: 1 });
    console.log('UK jobs:', jobs3.length);
    jobs3.slice(0, 3).forEach((j, i) => console.log(`  ${i + 1}. ${j.title} @ ${j.company} (${j.location})`));
  } catch (e) {
    console.log('Error:', e.message);
  }
})();
