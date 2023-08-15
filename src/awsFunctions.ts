import AWS from 'aws-sdk';
import fs from 'fs';
import { AlertDetails } from '../types';
import {config,validateOptionalEnvVariables,additonalServicesEnvs} from '../env.config'
import path from 'path';
const {AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_REGION, ADMIN_EMAIL} = config;

export function configureAccountCreds(): void {
	// Attempt to get AWS credentials from an AWS config file
	AWS.config.getCredentials(err => {
		if (err) {
			console.error('Error while attempting to set credentails using an AWS config file:', err.message);
			// Set AWS credentials and region using required environment variables that were vvalidated when the env.config file was loaded
			AWS.config.update({
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY,
				region: AWS_REGION,
			});

			console.log('AWS credentials have been successfully set using available environmental variables.');
		} else {
			console.log('AWS credentials were configured using an existing AWS config file. ');
		}
	});
}

export async function uploadNewMotionEventToS3(localFilePath: string) {
  configureAccountCreds();
	validateOptionalEnvVariables(['AWS_S3_BUCKET']);
  const {AWS_S3_BUCKET} = additonalServicesEnvs

  const s3 = new AWS.S3();

  const fileContent = fs.readFileSync(localFilePath);
//   const s3Bucket = AWS_S3_BUCKET;
  const s3Key = path.basename(localFilePath);

  if (AWS_S3_BUCKET && s3Key && fileContent) {
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
		ToAddresses: [`${ADMIN_EMAIL}`],
	  },
	  Message: {
		Body: {
		  Text: { Data: `${messageBody}` },
		},
		Subject: { Data: `${messageSubject}` },
	  },
	  Source: `${ADMIN_EMAIL}`,
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
  