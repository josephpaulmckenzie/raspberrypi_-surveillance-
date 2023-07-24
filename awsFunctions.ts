import AWS from 'aws-sdk';
import fs from 'fs';
import { configureAccountCreds } from './validators';
import { StringOrNull } from './types';

require('dotenv').config();



export async function uploadNewMotionEventToS3(localFilePath: string, s3Key: string) {

  configureAccountCreds();

  // Create an instance of the S3 service
  const s3 = new AWS.S3();

  // Read the local file data
  const fileContent = fs.readFileSync(localFilePath);
  let s3Bucket:StringOrNull = process.env.AWS_BUCKET;

  if (s3Bucket && s3Key && fileContent) {
    // Set the parameters for S3 upload
    const params = {
      Bucket: s3Bucket,
      Key: `videos/${s3Key}`,
      Body: fileContent,
      ContentType: 'video/mp4', // Adjust the content type according to your video format
    };

    try {
      // Upload the file to S3
      await s3.upload(params).promise();
      console.log(`File uploaded successfully to S3 bucket: ${s3Bucket}`);
      // Send a message to the main process to log the success message
      process.send?.(`File uploaded successfully to S3 bucket: ${s3Bucket}`);

    } catch (error) {
      // console.error('Error uploading file to S3:', error);
      process.send?.(`Error uploading file to S3: ${error}`);

    }
  } else {
    console.error('Invalid parameters. Check your function arguments.');
    process.send?.('Invalid parameters. Check your function arguments.');
    
  }
}
