import fs from 'fs';
import { uploadNewMotionEventToS3 } from './awsFunctions';
import { valueNotNull } from './types';
import chokidar from 'chokidar';

// Placeholder function for sending a notification in case of someone deleting an event file locally
function sendDeleteEventNotification(filePath: string) {
  console.log(`ALERT: An event file located at ${filePath} has just been deleted locally.`);
}

// Function to log any details of an event to a local CSV file
function logEventToFile(eventType: string, fileName: string, timestamp: string) {
  const logEntry = `${eventType},${fileName},${timestamp}\n`;
  fs.appendFileSync('event_log.csv', logEntry);
}

export async function startMonitoring(folderPath: string) {
  const timestamp = new Date().toISOString(); // Retrieve the current timestamp

  const watcher = chokidar.watch(folderPath, {
    persistent: true,
    ignoreInitial: true,
    ignored: /\.goutputstream-[^/\\]*$/, // Ignore files matching the pattern .goutputstream-*
  });

  watcher.on('add', (filePath) => {
    console.log(`A New Event has been added: ${filePath}`);

    // Log the event details to a local CSV file
    logEventToFile('A New Event Added', filePath, timestamp);
  });

  watcher.on('change', (filePath) => {
    // The contents of a file have been changed (Not a rename)
    console.log(`An Event contents have been changed: ${filePath}`);
  });

  watcher.on('unlink', (filePath) => {
    console.log(`An Event has been deleted: ${filePath}`);

    sendDeleteEventNotification(filePath);
  });

  watcher.on('error', (error) => {
    console.error('Error occurred:', error);
  });
}
