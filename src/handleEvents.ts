import fs from 'fs';
import {uploadNewMotionEventToS3, sendAlertNotificationEmail} from './src/awsFunctions';
import {type AlertDetails} from './types';
import moment from 'moment-timezone';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

export async function writeToLogFile(logEntry: string) {
	try {
		await fs.promises.appendFile('./event_log.csv', logEntry);
		console.log('Log updated');
	} catch (err: any) {
		console.log(`Error writing to the event log: ${err}`);
	}
}

// export async function sendTextNotification(params:type) {
// const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
// client.messages.create({
//   body: 'New motion detected!',
//   to: '+YOUR_PHONE_NUMBER',
//   from: process.env.TWILIO_PHONE_NUMBER
// });
// }


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

export async function onEventStart(filePath: string) {
	console.log(`Event started: ${filePath}`);

	try {
		const alertDetails: AlertDetails = {
			messageBody: '!!! Alert  A new motion event has just been detected and is currently being recorded and uploaded. !!! Meanwhile here is a picture of what triggered the event',
			messageSubject: 'A new motion event has been detected.',
		};

		await sendAlertNotificationEmail(alertDetails);
	} catch (err: any) {
		console.log('An error occurred while sending an alert notification for when a new event is started ', err);
	}
}

export function onEventEnd(filePath: string) {
	console.log(`Event ended: ${filePath}`);
}

// Check command line arguments and call the corresponding function
const [, , command, filePath] = process.argv;

(async () => {
	switch (command) {
		case 'onEventStart':
			await onEventStart(filePath);
			break;
		case 'onEventEnd':
			onEventEnd(filePath);
			break;
		case 'onMovieEnd':
			await onMovieEnd(filePath); // Await the function call here
			break;
		default:
			console.log(`Invalid command: ${command}`);
	}
})();
