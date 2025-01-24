const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const filePath = path.resolve(__dirname, '../../trackedInventory.json');
    const newInventory = JSON.parse(event.body);
    fs.writeFileSync(filePath, JSON.stringify(newInventory, null, 2));
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
