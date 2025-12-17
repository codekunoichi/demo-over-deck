import { getStore } from '@netlify/blobs';

// Helper function to parse CSV text into array of objects
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    data.push(row);
  }

  return data;
}

// Helper function to convert array of objects back to CSV text
function arrayToCSV(data) {
  if (data.length === 0) {
    return 'PID,Date,HEPID,MinutesCompleted';
  }

  const headers = ['PID', 'Date', 'HEPID', 'MinutesCompleted'];
  const rows = data.map(row =>
    headers.map(header => row[header] || '').join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse request body
    const payload = await req.json();
    const { pid, date, entries } = payload;

    if (!pid || !date || !entries || !Array.isArray(entries)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload. Expected: { pid, date, entries: [{hepid, minutes}] }' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Get Netlify Blob store
    const store = getStore('hep-tracker');

    // Load current daily log
    let csvData = await store.get('daily_log.csv', { type: 'text' });

    // If no data exists, initialize with header
    if (!csvData) {
      csvData = 'PID,Date,HEPID,MinutesCompleted';
    }

    // Parse existing data
    let logs = parseCSV(csvData);

    // Upsert entries: update if exists, append if new
    entries.forEach(entry => {
      const { hepid, minutes } = entry;

      // Find existing log entry
      const existingIndex = logs.findIndex(
        log => log.PID === pid && log.Date === date && log.HEPID === hepid
      );

      if (existingIndex >= 0) {
        // Update existing entry
        logs[existingIndex].MinutesCompleted = String(minutes);
      } else {
        // Append new entry
        logs.push({
          PID: pid,
          Date: date,
          HEPID: hepid,
          MinutesCompleted: String(minutes)
        });
      }
    });

    // Convert back to CSV
    const updatedCSV = arrayToCSV(logs);

    // Save to blob storage
    await store.set('daily_log.csv', updatedCSV);

    // Return updated CSV
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily log saved successfully',
        csv: updatedCSV
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Error in save_daily_log:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to save daily log',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

export const config = {
  path: '/save_daily_log'
};
