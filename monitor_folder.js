const fs = require('fs');
const path = require('path');
require('dotenv').config();


const monitorFolder = (folderPath) => {

  const folderPath = process.env.FILE_PATH;

  fs.watch(folderPath, (eventType, filename) => {
    if (filename) {
      const filePath = path.join(folderPath, filename);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          if (eventType === 'rename' && err.code === 'ENOENT') {
            // If file is deleted send an alert to either a text or as a push notification in an app
            console.log(`File deleted: ${filename}`);

          } else {
            // Log error to csv filed that is stored locally as well as a file that's stored in S3
            console.error('Error:', err);
          }
          return;
        }
        // Log all new files added to dynamo db or a simple csv in a s3 bucket 
        if (eventType === 'rename') {
          if (stats.isFile()) {
            console.log(`New file added: ${filename}`);

          }
        }
      });
    }
  });
};



monitorFolder(folderPath);
