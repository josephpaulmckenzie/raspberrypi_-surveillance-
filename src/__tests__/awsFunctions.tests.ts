// awsFunctions.tests.ts

import * as awsFunctions from '../awsFunctions'; // Replace 'awsFunctions' with the actual file name
import AWSMock from 'aws-sdk-mock';
import path from 'path';
import dotenv from 'dotenv';

// const envPath = path.join(__dirname, '../..', '.env');
// console.log(envPath)
const result = dotenv.config();
if (result.error) {
  console.log('Error loading .env:', result.error);
} else {
  console.log(result)
  console.log("envs", process.env.ADMIN_EMAIL)
}

AWSMock.mock('S3', 'upload', (params: any, callback: any) => {
  callback(null, { Location: 'https://mocked-s3-url' });
});

// Mock the AWS SDK SES sendEmail function
AWSMock.mock('SES', 'sendEmail', (params: any, callback: any) => {
  callback(null, { MessageId: 'mocked-message-id' });
});


describe('uploadNewMotionEventToS3', () => {
  const mockedFilePath = '/var/lib/motion/07-26-2023_01.12.30PM.mkv';

  beforeAll(() => {
    // Mocking the file read function
    jest.mock('fs', () => ({
      readFileSync: jest.fn(() => 'mocked file content'),
    }));
  });

  it('should successfully upload a video to S3', async () => {
    const response = await awsFunctions.uploadNewMotionEventToS3(mockedFilePath);
    expect(response).toEqual({ data: 'successfully uploaded data' });
  });

  it('should throw an error if AWS_BUCKET environment variable is not set', async () => {
    const originalEnv = process.env.AWS_BUCKET;
    delete process.env.AWS_BUCKET;

    try {
      await awsFunctions.uploadNewMotionEventToS3(mockedFilePath);
    } catch (error: any) {
      expect(error.message).toBe('Invalid parameters. Check your function arguments.');
    }

    process.env.AWS_BUCKET = originalEnv;
  });

  it(`should throw an error when there's an issue uploading the video`, async () => {
    AWSMock.remock('S3', 'upload', async (params: any) => {
      throw new Error('S3 Upload Error');
    });

    try {
      await awsFunctions.uploadNewMotionEventToS3(mockedFilePath);
    } catch (error: any) {
      expect(error.message).toBe('Error uploading file to S3: Error: S3 Upload Error');
    }

    // Resetting the mock to its original behavior after this test
    AWSMock.remock('S3', 'upload', async (params: any) => {
      return { Location: 'https://mocked-s3-url' };
    });
  });
});


describe('sendAlertNotificationEmail', () => {
  it('should send an email with provided alert details', async () => {
    const alertDetails = {
      messageBody: 'Test email body',
      messageSubject: 'Test email subject',
    };
  
    // Use a mock to intercept console.log
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
  
    await awsFunctions.sendAlertNotificationEmail(alertDetails);
  
    // Check if the "Email sent" message is logged
    expect(consoleLogMock).toHaveBeenCalledWith('Email sent:', 'mocked-message-id');
  
    consoleLogMock.mockRestore();
  });

  it('should throw an error if the email address is not configured', async () => {

    const originalEnv = process.env.EMAIL_ALERT_ADDRESS;
    delete process.env.EMAIL_ALERT_ADDRESS;

    const alertDetails = {
      messageBody: 'Test email body',
      messageSubject: 'Test email subject',
    };

    try {
      await awsFunctions.sendAlertNotificationEmail(alertDetails);
    } catch (error: any) { 
     
      expect(error.message).toBe(
        'Email address not configured. Please set EMAIL_ALERT_ADDRESS environment variable.'
      );
    }

    process.env.EMAIL_ALERT_ADDRESS = originalEnv;
  });

  // Add more test cases to cover other scenarios
});


