const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const filePath = path.resolve(__dirname, '/trackedInventory.json');
    console.log(`Reading file from: ${filePath}`);
    const data = fs.readFileSync(filePath, 'utf8');
    const inventory = JSON.parse(data);
    return {
      statusCode: 200,
      body: JSON.stringify(inventory),
    };
  } catch (error) {
    console.error(`Error fetching inventory: ${error.message}`);
    return {
      statusCode: 500,
      body: `Error fetching inventory: ${error.message}`,
    };
  }
};
