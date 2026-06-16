require('dotenv').config();
const axios = require('axios');

async function testJSearch() {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  console.log("Using API Key:", rapidApiKey ? "Yes" : "No");
  
  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: 'Accessibility Tester',
        page: '1',
        num_pages: '5'
      },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    });

    console.log("Total Jobs Returned by JSearch:", response.data.data.length);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testJSearch();
