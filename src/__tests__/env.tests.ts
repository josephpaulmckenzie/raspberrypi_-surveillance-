import {
    validateEnvVariable,
    validateEmail,
    validateAdditonalServicesConfig,
} from '@root/env.config';

describe('validateEnvVariable', () => {
    // Test when the environment variable does not exist
    it('should throw error if the environment variable does not exist', () => {
        expect(() => validateEnvVariable(undefined, 'TEST_KEY')).toThrowError('The environmental variable "TEST_KEY" could not be located.');
    });

    // Test when the environment variable exists but is a blank string
    it('should throw error if the environment variable is a blank string', () => {
        expect(() => validateEnvVariable('', 'TEST_KEY')).toThrowError('The environmental variable "TEST_KEY" value is a blank string.');
    });

    it('should return the value if the environment variable is found', () => {
        expect(validateEnvVariable('value', 'VALID_KEY')).toBe('value');
    });
});

describe('validateEmail', () => {
    it('should throw error if the email format is invalid', () => {
        expect(() => validateEmail('invalidEmail')).toThrowError('Invalid email format for "invalidEmail".');
    });

    it('should return the email if the email format is valid', () => {
        expect(validateEmail('test@example.com')).toBe('test@example.com');
    });
});

describe('validateAdditonalServicesConfig', () => {
    it('should throw error if the value for the key is missing or blank', () => {
        process.env['MISSING_KEY'] = ''; // Simulate missing environment variable
        expect(() => validateAdditonalServicesConfig(['MISSING_KEY'])).toThrowError('Invalid or missing value for key: MISSING_KEY');
    });

    it('should not throw error if the value for the key is valid', () => {
        process.env['VALID_KEY'] = 'value'; // Simulate valid environment variable
        expect(() => validateAdditonalServicesConfig(['VALID_KEY'])).not.toThrow();
    });
});
