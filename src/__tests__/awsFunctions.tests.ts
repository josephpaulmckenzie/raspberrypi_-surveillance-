import AWS from 'aws-sdk';

import { uploadNewMotionEventToS3, sendAlertNotificationEmail } from '@src/awsFunctions';
import { S3Client, PutObjectCommand, PutObjectOutput, S3 } from "@aws-sdk/client-s3";
import mockFs from 'mock-fs';

jest.mock('aws-sdk');
jest.mock('@aws-sdk/client-s3');

describe('uploadNewMotionEventToS3', () => {
  // Set up a mock file system before running the tests
  beforeEach(() => {
    jest.mock('@aws-sdk/client-s3', () => ({
      S3: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({ /* Your mock data here */ }),
      })),
    }));

    mockFs({
      '/var/lib/motion/08112023143520-06.jpg': 'file content here',
      '/var/lib/motion/07-27-2023_03.03.53PM.mkv': 'video content here',
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
    await expect(uploadNewMotionEventToS3('non-existent-file-path')).rejects.toThrow(`ENOENT: no such file or directory, open 'non-existent-file-path'`);
  });
});

it('should successfully upload an JPEG file', async () => {
  const s3 = new S3({ region: 'us-east-1' });

  const sendSpy = jest.spyOn(s3, 'send').mockImplementation(
    () => {
      return Promise.resolve(mockReturnValue) as Promise<PutObjectOutput>;
    }
  );
  const mockReturnValue: PutObjectOutput = {
    ETag: 'some-etag-value',
    VersionId: 'some-version-id',
    ServerSideEncryption: 'AES256',
    // Add other properties as needed.
  };

  // Call your function
  await uploadNewMotionEventToS3('/var/lib/motion/08112023143520-06.jpg');

  // Expect that the send method was called with an instance of PutObjectCommand
  expect(sendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));

  // Clean up the spy
  sendSpy.mockRestore();
});


it('should successfully upload an MP4 file', async () => {
  const s3 = new S3({ region: 'us-east-1' });

  const sendSpy = jest.spyOn(s3, 'send').mockImplementation(
    () => {
      return Promise.resolve(mockReturnValue) as Promise<PutObjectOutput>;
    }
  );
  const mockReturnValue: PutObjectOutput = {
    ETag: 'some-etag-value',
    VersionId: 'some-version-id',
    ServerSideEncryption: 'AES256',
    // Add other properties as needed for your test...
  };

  // sendSpy.mockResolvedValue(mockReturnValue);

  // Call your function
  await uploadNewMotionEventToS3('/var/lib/motion/08112023143520-06.jpg');

  // Expect that the send method was called with an instance of PutObjectCommand
  expect(sendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));

  sendSpy.mockRestore();
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
