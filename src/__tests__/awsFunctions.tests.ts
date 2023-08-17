import AWS from 'aws-sdk';
import { uploadNewMotionEventToS3,sendAlertNotificationEmail } from '@src/awsFunctions';
import { S3 } from '@aws-sdk/client-s3';
import mockFs from 'mock-fs';

jest.mock('aws-sdk');
jest.mock('@aws-sdk/client-s3');

describe('uploadNewMotionEventToS3', () => {
  // Set up a mock file system before running the tests
  beforeEach(() => {
    mockFs({
      '/var/lib/motion/08112023152315-02.jpg': 'file content here', // You can modify this to match a real test file
    });
  });

  // Restore the real filesystem after running the tests
  afterEach(() => {
    mockFs.restore();
  });

  it('should throw an error if parameters are invalid', async () => {
    await expect(uploadNewMotionEventToS3('')).rejects.toThrow('Invalid parameters. Check your function arguments.');
  });

  it('should throw an error if file does not exist', async () => {
    await expect(uploadNewMotionEventToS3('non-existent-file-path')).rejects.toThrow(`ENOENT: no such file or directory, open 'non-existent-file-path'`); // Consider enhancing the function to throw a specific error for this case
  });

  // Add more tests to cover other scenarios, such as successful uploads, handling of different mime types, etc.

});




describe('sendAlertNotificationEmail', () => {
  let originalConsoleError: any;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('should send the email successfully', async () => {
    AWS.SES.prototype.sendEmail = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({ MessageId: 'message-id' }),
    });
    await expect(sendAlertNotificationEmail({ messageBody: 'body', messageSubject: 'subject' })).resolves.not.toThrow();
  });

  it('should throw an error if sending email fails', async () => {
    AWS.SES.prototype.sendEmail = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('Error sending email: Email Error')),
    });
    await expect(sendAlertNotificationEmail({ messageBody: 'body', messageSubject: 'subject' })).rejects.toThrow('Error sending email: Email Error');
  });
});
