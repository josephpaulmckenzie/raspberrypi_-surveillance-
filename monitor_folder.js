const fs = require('fs');
const path = require('path');

const folderPath = '/home/josephmckenzie/videos';


// Watches for events in the directory (New files and Deletion of existing files)
const monitorFolder = (folderPath) => {
  fs.watch(folderPath, (eventType, filename) => {
    if (filename) {
      const filePath = path.join(folderPath, filename);
        fs.stat(filePath, (err, stats) => {
            if (err) {
                if (eventType === 'rename' && err.code === 'ENOENT') {
                    console.log(`File deleted: ${filename}`);

                } else {
                    console.error('Error:', err);
            }
            return;
            }

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
