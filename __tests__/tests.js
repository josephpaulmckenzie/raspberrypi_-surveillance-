require('dotenv').config();

const AWS = require('aws-sdk');
const fs = require('fs');

const { promisify } = require('util');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const readFileAsync = promisify(fs.readFile);

const uploadVideoToS3 = async (bucketName, filePath, key) => {
  try {
    const fileData = await readFileAsync(filePath);

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileData
    };

    const result = await s3.upload(params).promise();

    console.log('Video uploaded successfully');
    return result;
  } catch (err) {
    console.error('Error uploading video:', err);
    throw err;
  }
};

describe('uploadVideoToS3', () => {
  test('should upload a video file to a valid S3 bucket', async () => {
    // Mock file path and key
    const filePath = '/home/josephmckenzie/videos/testVideo.mp4';
    const key = 'videos/testVideo.mp4';

    // Set the valid bucket name
    const bucketName = 'raspberrypi-surveillance';

    // Upload the video to S3
    const uploadResult = await uploadVideoToS3(bucketName, filePath, key);

    // Expectations
    expect(uploadResult).toBeDefined();
    expect(uploadResult.Location).toContain(bucketName);
    expect(uploadResult.Key).toBe(key);
  });

  test('should throw an error when the bucket is invalid', async () => {
    // Mock file path and key
    const filePath = '/home/josephmckenzie/videos/testVideo.mp4';
    const key = 'videos/testVideo.mp4';

    // Set an invalid bucket name
    const bucketName = 'invalid-bucket-name';

    // Upload the video to S3
    await expect(uploadVideoToS3(bucketName, filePath, key)).rejects.toThrow();
  });
});
