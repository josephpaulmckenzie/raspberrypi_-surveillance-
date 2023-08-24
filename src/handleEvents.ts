import fs from 'fs';
import { uploadNewMotionEventToS3, sendAlertNotificationEmail } from './awsFunctions';
import { sendPushoverNotification } from './notificationServices'
import { type AlertDetails } from '../types';
import moment from 'moment-timezone';
import { config } from '../env.config';
const { adminEmail, adminEmailPassword, pushoverAppToken, pushoverUserKey } = config;

export async function writeToLogFile(logEntry: string) {
    try {
        await fs.promises.appendFile('./event_log.csv', logEntry);
        console.log('Log updated');
    } catch (err: any) {
        console.log(`Error writing to the event log: ${err}`);
    }
}

export async function onMovieEnd(filePath: string) {
    const movieEventEnded = 'Motion Event Ended';

    //  A regular expression to match the timestamp format
    const timestampRegex = /\d{2}-\d{2}-\d{4}_\d{2}\.\d{2}\.\d{2}(AM|PM)/;
    const timestampMatch = timestampRegex.exec(filePath)!;
    const timestamp: string = timestampMatch?.[0] ?? moment().format('M/D/YYYY, HH:mm:ss A');

    const logEntry = `${movieEventEnded},${filePath},${timestamp}\n`;

    await writeToLogFile(logEntry);
    await uploadNewMotionEventToS3(filePath);
}

export async function onPictureSave(filePath: string) {

    try {
        // sendPushoverNotification("!!! MOTION DETECTED !!!", "!!!!", filePath)
    } catch (error) {
        console.log(error);
    }
}

export function onEventEnd(filePath: string) {
    console.log(`Event ended: ${filePath}`);
}

// Check command line arguments and call the corresponding function
const [, , command, filePath] = process.argv;

(async () => {
    switch (command) {

        case 'onEventEnd':
            onEventEnd(filePath);
            break;
        case 'onMovieEnd':
            await onMovieEnd(filePath); // Await the function call here
            break;
        case 'onPictureSave':
           await onPictureSave(filePath);
            break;
        default:
            console.log(`Invalid command: ${command}`);
    }
})();