import AWS from 'aws-sdk';
import fs from 'fs';
import { AlertDetails } from '../types';
import {config,additonalServicesConfig,validateAdditonalServicesConfig } from '../env.config'
import path from 'path';
const { awsAccessKeyId, awsSecretAccessKey, awsRegion, adminEmail } = config;;

export function configureAccountCreds(): Promise<void> {
	return new Promise((resolve, reject) => {
		// Attempt to get AWS credentials from an AWS config file
		AWS.config.getCredentials(err => {
			if (err) {
				console.error('Error while attempting to set credentials using an AWS config file:', err.message);
				// Set AWS credentials and region using required environment variables that were validated when the env.config file was loaded
				AWS.config.update({
					accessKeyId: awsAccessKeyId,
					secretAccessKey: awsSecretAccessKey,
					region: awsRegion,
				});

				console.log('AWS credentials have been successfully set using available environmental variables.');
				resolve();
			} else {
				console.log('AWS credentials were configured using an existing AWS config file.');
				resolve();
			}
		});
	});
}


export async function uploadNewMotionEventToS3(localFilePath: string) {
	// await configureAccountCreds();
	validateAdditonalServicesConfig(['AWS_S3_BUCKET']); // We can add more enviromental variable keys/names to validate.
	const { AWS_S3_BUCKET } = additonalServicesConfig // Since we are only currently getting on additional env we dont have to destructure the variable names

	const s3 = new AWS.S3();

	const fileContent = fs.readFileSync(localFilePath);
	const s3Key = path.basename(localFilePath);

	if (s3Key && fileContent) {
		const params = {
			Bucket: AWS_S3_BUCKET,
			Key: `videos/${s3Key}`,
			Body: fileContent,
			ContentType: 'video/mp4',
		};

		try {
			await s3.upload(params).promise();
			console.log("Successfully uploaded new motion event")
			return { data: 'successfully uploaded data' };
		} catch (error: any) {
			throw new Error(`Error uploading file to S3: ${error}`);
		}
	} else {
		throw new Error('Invalid parameters. Check your function arguments.');
	}
}

export async function sendAlertNotificationEmail(alertDetails: AlertDetails) {

	const ses = new AWS.SES();
	const { messageBody, messageSubject } = alertDetails;

	const params = {
		Destination: {
			ToAddresses: [`${adminEmail}`],
		},
		Message: {
			Body: {
				Text: { Data: `${messageBody}` },
			},
			Subject: { Data: `${messageSubject}` },
		},
		Source: `${adminEmail}`,
	};

	try {
		// Send the email
		const data = await ses.sendEmail(params).promise();
		console.log('Email sent:', data.MessageId);
	} catch (err) {
		console.error('Error sending email:', err);
		throw err;
	}
}
