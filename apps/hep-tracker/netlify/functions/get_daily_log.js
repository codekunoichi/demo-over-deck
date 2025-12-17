import { getStore } from '@netlify/blobs';

// Seed data from the original CSV
const SEED_DATA = `PID,Date,HEPID,MinutesCompleted
P001,2025-12-01,H001,10
P001,2025-12-01,H002,15
P001,2025-12-01,H003,5
P001,2025-12-02,H001,0
P001,2025-12-02,H002,10
P001,2025-12-02,H003,0
P001,2025-12-03,H001,10
P001,2025-12-03,H002,15
P001,2025-12-03,H003,10
P002,2025-12-01,H001,5
P002,2025-12-02,H001,10
P003,2025-12-02,H002,15`;

export default async (req, context) => {
  try {
    // Get Netlify Blob store
    const store = getStore('hep-tracker');

    // Try to get existing daily log from blob storage
    let csvData = await store.get('daily_log.csv', { type: 'text' });

    // If no data exists yet, use seed data
    if (!csvData) {
      csvData = SEED_DATA;
      // Store the seed data for future use
      await store.set('daily_log.csv', csvData);
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

    // On error, return seed data as fallback
    return new Response(SEED_DATA, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const config = {
  path: '/get_daily_log'
};
