// handleMovieEnd.ts
import fs from 'fs';
import { uploadNewMotionEventToS3 } from './awsFunctions';

export function handleMovieEnd(fileName: string) {
    // Perform the desired action with the movie file
    let movieEventEnded = "Add"
    const timestamp = new Date().toISOString();
    console.log(`Handling movie end for file: ${fileName}`);
    const logEntry = `${movieEventEnded},${fileName},${timestamp}\n`;
    fs.appendFileSync('event_log.csv', logEntry);
    // For example, you can upload the movie file to AWS S3 or perform other processing here
}

