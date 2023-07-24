import { startMonitoring } from './monitoring';
require('dotenv').config();


// Define a function to handle messages from the separate process
function handleMessage(message: string) {
  console.log('Message from awsFunctions:', message);
}

// Listen for messages from the separate process
process.on('message', handleMessage);

const folderPath = process.env.FOLDER_PATH;

if (!folderPath) {
  console.error('Error: FOLDER_PATH environment variable is not set.');
  process.exit(1);
}

// Start monitoring the folder
startMonitoring(folderPath);