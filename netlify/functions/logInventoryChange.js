// File: netlify/functions/logInventoryChange.js
const fetch = require('node-fetch');

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const BIN_ID = process.env.JSONBIN_BIN_LOG_ID;
const SECRET_KEY = process.env.JSONBIN_SECRET_KEY;

exports.handler = async function (event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    // Parse the incoming JSON body (the new log entry)
    const logEntry = JSON.parse(event.body);

    // 1) Fetch current logs from bin (versioned bin → /latest)
    const fetchResponse = await fetch(`${JSONBIN_API_URL}/${BIN_ID}`, {
      headers: {
        'X-Master-Key': SECRET_KEY,
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(`Error fetching existing logs: ${fetchResponse.status}`);
    }

    const fetchData = await fetchResponse.json();
    // The actual array is under `fetchData.record` in JSONBin v3
    let logs = fetchData.record || [];

    // 2) Append the new log entry
    logs.push(logEntry);

    // 3) If more than 500 logs, keep only the most recent 500
    if (logs.length > 500) {
      logs = logs.slice(logs.length - 500);
    }

    // 4) Update JSONBin with the new logs array
    const updateResponse = await fetch(`${JSONBIN_API_URL}/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': SECRET_KEY,
      },
      body: JSON.stringify(logs),
    });

    if (!updateResponse.ok) {
      throw new Error(`Error updating logs in JSONBin: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify(updateData),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error logging inventory change: ${error.message}`,
    };
  }
};