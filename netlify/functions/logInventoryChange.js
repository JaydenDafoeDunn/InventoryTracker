const fetch = require('node-fetch');

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const LOG_BIN_ID = process.env.JSONBIN_BIN_LOG_ID;
const SECRET_KEY = process.env.JSONBIN_SECRET_KEY;

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const logEntry = JSON.parse(event.body);

  try {
    // Fetch existing logs
    const fetchResponse = await fetch(`${JSONBIN_API_URL}/${LOG_BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': SECRET_KEY,
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! status: ${fetchResponse.status}`);
    }
    console.log('LOG_BIN_ID from inventory update:', LOG_BIN_ID);

    const fetchData = await fetchResponse.json();
    let logs = fetchData.record || [];

    // Append new log entry
    logs.push(logEntry);

    // Ensure the number of logs does not exceed 500
    if (logs.length > 500) {
      logs = logs.slice(logs.length - 500);
    }

    // Update logs in JSONBin
    const updateResponse = await fetch(`${JSONBIN_API_URL}/${LOG_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': SECRET_KEY,
      },
      body: JSON.stringify(logs),
    });

    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
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