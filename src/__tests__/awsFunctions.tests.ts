// awsFunctions.tests.ts

// The @ 's are just an alais to the to the folder so we dont have to write paths or ../.. type stuff everywhere
import * as awsFunctions from '@src/awsFunctions';
import AWSMock from 'aws-sdk-mock';

describe('uploadNewMotionEventToS3', () => {
  let mockedFilePath = '/var/lib/motion/07-26-2023_01.12.30PM.mkv';
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Initial mock for S3 upload
    AWSMock.mock('S3', 'upload', async (params: any) => {
      return { Location: 'https://mocked-s3-url' };
    });
  });

  beforeEach(() => {
    // Store the current environment so any changes made during tests can be easily reverted back to an original state
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore the original environment after each test
    process.env = originalEnv;
  });

  afterAll(() => {
    AWSMock.restore();
  });

  it(`should throw an error if AWS_S3_BUCKET is an empty string or doesn't exist`, async () => {
    process.env.AWS_S3_BUCKET = '';
    await expect(awsFunctions.uploadNewMotionEventToS3(mockedFilePath))
      .rejects
      .toThrow('Invalid or missing value for key: AWS_S3_BUCKET');
  });

  it(`should throw an error when attempting to upload a file that does not exist`, async () => {
    process.env.AWS_S3_BUCKET = 'test_bucket';;
    mockedFilePath = ''

    await expect(awsFunctions.uploadNewMotionEventToS3(mockedFilePath))
      .rejects
      .toThrow('ENOENT: no such file or directory, open');
  });
});

// Your other test suite can remain the same as there were no changes to it
describe('sendAlertNotificationEmail', () => {
  // ... rest of your code
});
