// awsFunctions.tests.ts

import * as awsFunctions from '../awsFunctions'; // Replace 'awsFunctions' with the actual file name
import AWSMock from 'aws-sdk-mock';
import dotenv from 'dotenv';
dotenv.config();

AWSMock.mock('S3', 'upload', (params: any, callback: any) => {
  callback(null, { Location: 'https://mocked-s3-url' });
});

// Mock the AWS SDK SES sendEmail function
AWSMock.mock('SES', 'sendEmail', (params: any, callback: any) => {
  callback(null, { MessageId: 'mocked-message-id' });
});

describe('uploadNewMotionEventToS3', () => {

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


