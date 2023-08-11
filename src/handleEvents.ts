import fs from 'fs';
import { uploadNewMotionEventToS3, sendAlertNotificationEmail } from './awsFunctions';
import { sendEmailorText, sendPushoverNotification } from './notificationServices'
import { type AlertDetails } from '../types';
import moment from 'moment-timezone';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

export async function writeToLogFile(logEntry: string) {
	try {
		await fs.promises.appendFile('/home/josephmckenzie/code/raspberrypi_surveillance/event_log.csv', logEntry);
		console.log('Log updated');
	} catch (err: any) {
		console.log(`Error writing to the event log: ${err}`);
	}
}

export async function onMovieEnd(filePath: string) {
	const movieEventEnded = 'Motion Movie Event Ended';

	//  A regular expression to match the timestamp format
	const timestampRegex = /\d{2}-\d{2}-\d{4}_\d{2}\.\d{2}\.\d{2}(AM|PM)/;
	const timestampMatch = timestampRegex.exec(filePath)!;
	const timestamp: string = timestampMatch?.[0] ?? moment().format('M/D/YYYY, HH:mm:ss A');

	const logEntry = `${movieEventEnded},${filePath},${timestamp}\n`;

	await writeToLogFile(logEntry);
	await uploadNewMotionEventToS3(filePath);
}

export async function onEventStart(filePath: string) {
	console.log(`Event started: ${filePath}`);

	try {
		const message = `!!! Alert  A new motion event has just been detected !!!
							A link will be sent to view it when it's ready`
		const title = 'A new motion event has been detected.';

		const response = await sendPushoverNotification(message, title);

		// Hoping that ill be able to get easy access to the first frame on start of a motion event so we can include it in the push notification
		// await sendPushWithImage('notification title', 'Alert message', 'path/to/image.png');

		console.log('Notification sent:', response);
	} catch (err: any) {
		console.log('An error occurred while sending an alert notification upon a new event start ', err);
	}
}

export function onEventEnd(filePath: string) {
	console.log(`Event ended: ${filePath}`);
}

// Check command line arguments and call the corresponding function
const [, , command, filePath] = process.argv;
(async () => {
	try {
		switch (command) {
			case 'onEventStart':
				await onEventStart(filePath);
				break;
			case 'onEventEnd':
				onEventEnd(filePath);
				break;
			case 'onMovieEnd':
				await onMovieEnd(filePath); 
				break;
			default:
				console.log(`Invalid command: ${command}`);
		}
	} catch (err: any) {
		console.log('An unexpected error occurred:', err);
	}
})();

