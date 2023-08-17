// awsFunctions.tests.ts
import * as awsFunctions from '../awsFunctions'; // Replace 'awsFunctions' with the actual file name
import AWSMock from 'aws-sdk-mock';
import path from 'path';
import * as originalEnvConfig from '../../env.config';
// import mockProcess from 'jest-mock-process';

describe('uploadNewMotionEventToS3', () => {
  let mockedFilePath = '/var/lib/motion/07-26-2023_01.12.30PM.mkv';
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Clone the original config
    const config = {
      ...originalEnvConfig.config,
      additonalServicesConfig: {
        ...originalEnvConfig.additonalServicesConfig,
        AWS_S3_BUCKET: 'valid-bucket',
      },
    };

    // Jest mock for config module
    jest.mock('../../env.config', () => ({
      config,
      additonalServicesConfig: config.additonalServicesConfig,
    }));

    // Initial mock for S3 upload
    AWSMock.mock('S3', 'upload', async (params: any) => {
      return { Location: 'https://mocked-s3-url' };
    });
  });

  afterAll(() => {
    AWSMock.restore();  
  });

  beforeEach(() => {
    // Store the original environment
    originalEnv = { ...process.env };
    // Modify the environment variable you want to mock
    process.env.AWS_S3_BUCKET = '';
  });

  afterEach(() => {
    // Restore the original environment after each test
    process.env = originalEnv;
  });

  it(`should throw an error if AWS_S3_BUCKET is an empty string or doesn't exist`, async () => {
    // Backup the original value
    const originalBucket = process.env.AWS_S3_BUCKET;

    // Set AWS_S3_BUCKET to an empty string
    process.env.AWS_S3_BUCKET = '';

    // Perform the test
    await expect(awsFunctions.uploadNewMotionEventToS3(mockedFilePath))
      .rejects
      .toThrow('Invalid or missing value for key: AWS_S3_BUCKET');

    // Restore the original value
    process.env.AWS_S3_BUCKET = originalBucket;
  });


  it(`should throw an error whenattempting to upload a file that does not exist`, async () => {
    process.env.AWS_S3_BUCKET = 'test_bucket';;
    mockedFilePath = ''

    // AWSMock.remock('S3', 'upload', async (params: any) => {
    //   throw new Error('S3 Upload Error');
    // });

    await expect(awsFunctions.uploadNewMotionEventToS3(mockedFilePath))
      .rejects
      .toThrow('ENOENT: no such file or directory, open');
  });
});

// Your other test suite can remain the same as there were no changes to it
describe('sendAlertNotificationEmail', () => {
  // ... rest of your code
});
