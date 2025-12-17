import { getStore } from '@netlify/blobs';

// Helper function to fetch seed data from the deployed CSV file
async function fetchSeedData(baseUrl) {
  try {
    // Try to fetch from the deployed public/data/daily_log.csv
    const csvUrl = `${baseUrl}/data/daily_log.csv`;
    console.log('Fetching seed data from:', csvUrl);

    const response = await fetch(csvUrl);
    if (response.ok) {
      const csvData = await response.text();
      console.log('Successfully loaded seed data from CSV file');
      return csvData;
    }
  } catch (error) {
    console.error('Error fetching seed data from CSV:', error);
  }

  // Fallback seed data if CSV fetch fails
  console.log('Using fallback seed data');
  return `PID,Date,HEPID,MinutesCompleted
P001,2025-12-11,H001,10
P001,2025-12-11,H002,15
P001,2025-12-11,H003,5
P001,2025-12-12,H001,0
P001,2025-12-12,H002,10
P001,2025-12-12,H003,0
P001,2025-12-13,H001,10
P001,2025-12-13,H002,15
P001,2025-12-13,H003,10
P002,2025-12-11,H001,5
P002,2025-12-12,H001,10
P003,2025-12-12,H002,15`;
}

export default async (req, context) => {
  try {
    // Get Netlify Blob store
    const store = getStore('hep-tracker');

    // Try to get existing daily log from blob storage
    let csvData = await store.get('daily_log.csv', { type: 'text' });

    // If no data exists yet, fetch from the public CSV file
    if (!csvData) {
      console.log('Blob storage empty, initializing with seed data');

      // Get the base URL from the request
      const url = new URL(req.url);
      const baseUrl = `${url.protocol}//${url.host}`;

      csvData = await fetchSeedData(baseUrl);

      // Store the seed data in blob storage for future use
      await store.set('daily_log.csv', csvData);
      console.log('Initialized blob storage with seed data');
    }

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error in get_daily_log:', error);

    // On error, try to fetch seed data one more time
    try {
      const url = new URL(req.url);
      const baseUrl = `${url.protocol}//${url.host}`;
      const seedData = await fetchSeedData(baseUrl);

      return new Response(seedData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);

      // Last resort: return minimal valid CSV
      return new Response('PID,Date,HEPID,MinutesCompleted\n', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};

export const config = {
  path: '/get_daily_log'
};
