const fetch = require('node-fetch');

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const BIN_ID = process.env.JSONBIN_BIN_ID;
const SECRET_KEY = process.env.JSONBIN_SECRET_KEY;

exports.handler = async (event, context) => {
  try {
    const response = await fetch(`${JSONBIN_API_URL}/${BIN_ID}`, {
      headers: {
        'X-Master-Key': SECRET_KEY,
      },
    });
    const data = await response.json();
    if (Array.isArray(data.record) && data.record.every(item => typeof item.name === 'string' && typeof item.status === 'string')) {
      return {
        statusCode: 200,
        body: JSON.stringify(data.record),
      };
    } else {
      return {
        statusCode: 500,
        body: 'Invalid inventory data',
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error fetching inventory from JSONBIN: ${error.message}`,
    };
  }
};