import AWS from 'aws-sdk';
import fs from 'fs';
import { configureAccountCreds } from '../validators';
import { AlertDetails } from '../types';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export async function uploadNewMotionEventToS3(localFilePath: string) {
  configureAccountCreds();

  const s3 = new AWS.S3();

  const fileContent = fs.readFileSync(localFilePath);
  const s3Bucket = process.env.AWS_BUCKET;
  const s3Key = path.basename(localFilePath);

  if (s3Bucket && s3Key && fileContent) {
    const params = {
      Bucket: s3Bucket,
      Key: `videos/${s3Key}`,
      Body: fileContent,
      ContentType: 'video/mp4',
    };

    try {
      await s3.upload(params).promise();
      return { data: 'successfully uploaded data' };
    } catch (error: any) {
      process.send?.(`Error uploading file to S3: ${error}`);
      throw new Error(`Error uploading file to S3: ${error}`);
    }
  } else {
    throw new Error('Invalid parameters. Check your function arguments.');
  }
}

export async function sendAlertNotificationEmail(alertDetails: AlertDetails) {
	const ses = new AWS.SES();
	const { messageBody, messageSubject } = alertDetails;
	const emailAddress = process.env.EMAIL_ALERT_ADDRESS
	// Check if the 'emailAddress' is undefined or an empty string
	if (!emailAddress || emailAddress.trim() === '') {
	  throw new Error('Email address not configured. Please set EMAIL_ALERT_ADDRESS environment variable.');
	}
  
	const params = {
	  Destination: {
		ToAddresses: [`${emailAddress}`],
	  },
	  Message: {
		Body: {
		  Text: { Data: `${messageBody}` },
		},
		Subject: { Data: `${messageSubject}` },
	  },
	  Source: `${emailAddress}`,
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
  