const fetch = require('node-fetch');

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const BIN_ID = process.env.JSONBIN_BIN_LOG_ID;
const SECRET_KEY = process.env.JSONBIN_SECRET_KEY;
const MAX_ENTRIES = 500; // This is the max amount of entries, after this, itll reset the log. Should be more than enough.

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const newLogEntry = JSON.parse(event.body);

  try {
    // Fetch the current log
    const getResponse = await fetch(`${JSONBIN_API_URL}/${BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': SECRET_KEY,
      },
    });

    if (!getResponse.ok) {
      throw new Error(`HTTP error! status: ${getResponse.status}`);
    }

    const currentLog = await getResponse.json();
    let updatedLog = currentLog.record || [];

    // Check the number of entries
    if (updatedLog.length >= MAX_ENTRIES) {
      // Overwrite with fresh logs
      updatedLog = [newLogEntry];
    } else {
      // Append the new log entry
      updatedLog.push(newLogEntry);
    }

    // Update the log in JSONBIN
    const putResponse = await fetch(`${JSONBIN_API_URL}/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': SECRET_KEY,
      },
      body: JSON.stringify(updatedLog),
    });

    if (!putResponse.ok) {
      throw new Error(`HTTP error! status: ${putResponse.status}`);
    }

    const data = await putResponse.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error logging inventory change: ${error.message}`,
    };
  }
};
