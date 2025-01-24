const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const data = JSON.parse(event.body);
  const filePath = path.resolve(__dirname, '../../inventory.json');

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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
