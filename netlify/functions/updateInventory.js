const fetch = require('node-fetch');

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const BIN_ID = process.env.JSONBIN_BIN_ID;
const SECRET_KEY = process.env.JSONBIN_SECRET_KEY;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const data = JSON.parse(event.body);

  try {
    const response = await fetch(`${JSONBIN_API_URL}/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': SECRET_KEY,
      },
      body: JSON.stringify(data, null, 2),
    });
    console.log('BIN_ID from inventory update:', BIN_ID);


    if (!response.ok) {
      throw new Error('Failed to update inventory on JSONBin');
    }

    return {
      statusCode: 200,
      body: 'Inventory updated successfully',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error updating inventory: ${error.message}`,
    };
  }
};
