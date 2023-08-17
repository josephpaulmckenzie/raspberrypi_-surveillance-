import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { AlertDetails } from '../types';
import { config, additonalServicesConfig, validateAdditonalServicesConfig } from '../env.config';
import s3 from "aws-sdk/clients/s3";

const { awsRegion, adminEmail } = config;
const { AWS_S3_BUCKET } = additonalServicesConfig;

export async function uploadNewMotionEventToS3(localFilePath: string): Promise<{ data: string } | Error> {
	validateAdditonalServicesConfig(['AWS_S3_BUCKET']);
	if (!localFilePath || typeof localFilePath !== 'string') {
		throw new Error('Invalid parameters. Check your function arguments.');
	}
	
	console.log('Reading file:', localFilePath); // Debugging line
	const fileContent = fs.readFileSync(localFilePath);
	const s3Key = path.basename(localFilePath);
	const mimeType = mime.getType(localFilePath) || 'application/octet-stream';
	console.log('MIME type:', mimeType); // Debugging line
	
	if (s3Key && fileContent) {
		const params = {
			Bucket: AWS_S3_BUCKET,
			Key: `videos/${s3Key}`,
			Body: fileContent,
			ContentType: mimeType,
		};
	
		const command = new PutObjectCommand(params);
		const s3 = new S3({ region: awsRegion });
		
		try {
		  const data = await s3.send(command);
		  return { data: 'successfully uploaded data' }; // You can modify this as per your requirements
		} catch (error: any) {
			return error;
		}
	} else {
		return new Error('Invalid parameters. Check your function arguments.');
	}
}

export async function sendAlertNotificationEmail(alertDetails: AlertDetails): Promise<void | Error> {
	const ses = new AWS.SES();
	const { messageBody, messageSubject } = alertDetails;

	const params = {
		Destination: {
			ToAddresses: [adminEmail],
		},
		Message: {
			Body: {
				Text: { Data: messageBody },
			},
			Subject: { Data: messageSubject },
		},
		Source: adminEmail,
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
