const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const uploadVideoToS3 = async ( filePath, key) => {
    try {
      const fileData = await fs.promises.readFile(filePath);
  
      const params = {
        Bucket: process.env.AWS_BUCKET,
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
  
// Just testing values for now
const filePath = '/path/to/video.mp4'; 
const key = 'videos/video.mp4'; 

try {
  const uploadResult = await uploadVideoToS3(filePath, key);
  console.log('Upload result:', uploadResult);
} catch (error) {
  console.error('Upload failed:', error);
}
