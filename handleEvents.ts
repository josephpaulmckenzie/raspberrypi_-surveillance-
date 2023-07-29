import fs from 'fs';
import {uploadNewMotionEventToS3} from './awsFunctions';

async function writeToLogFile(logEntry: string) {
	try {
		await fs.promises.appendFile('./event_log.csv', logEntry);
		console.log('Log updated');
	} catch (err: any) {
		console.log(`Error writing to the event log: ${err}`);
	}
}

async function onMovieEnd(filePath: string) {
	const movieEventEnded = 'Motion Event Ended';
	const timestamp = new Date().toISOString();
	const logEntry = `${movieEventEnded},${filePath},${timestamp}\n`;

	await writeToLogFile(logEntry);
	await uploadNewMotionEventToS3(filePath);
}

function onEventStart(filePath: string) {
	console.log(`Event started: ${filePath}`);
	// We can add an alert to send an SNS message as soon as a motion event is started
}

function onEventEnd(filePath: string) {
	console.log(`Event ended: ${filePath}`);
}

// Check command line arguments and call the corresponding function
const [, , command, filePath] = process.argv;

(async () => {
	switch (command) {
		case 'onEventStart':
			onEventStart(filePath);
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

export {onEventStart, onEventEnd, onMovieEnd};
