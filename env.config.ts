// env.config.ts
import dotenv from 'dotenv';
dotenv.config();

function validateEnvVariable(value: string | undefined, envName: string): string {
  if (!value) {
    throw new Error(`The environmental variable "${envName}" could not be located.`);
  }
  return value;
}

function validateEmail(email: string): string {
  // A simple regex for email validation
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!regex.test(email)) {
    throw new Error(`Invalid email format for "${email}".`);
  }

  return email;
}

// Validate required environment variables
const envKeys = [
  'ADMIN_EMAIL',
  'ADMIN_EMAIL_PASSWORD',
  'PUSHOVER_APP_TOKEN',
  'PUSHOVER_USER_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
];

const config: Record<string, string> = {};

for (const envKey of envKeys) {
  let envValue = validateEnvVariable(process.env[envKey], envKey);

  if (envKey === 'ADMIN_EMAIL') {
    envValue = validateEmail(envValue);
  }

  config[envKey] = envValue;
}

const additonalServicesEnvs: Record<string, string> = {};

export function validateOptionalEnvVariables(variableNames: string[]): Record<string, string> {
  for (const variableName of variableNames) {
    const value = process.env[variableName];
    if (!value) {
      throw new Error(`The environmental variable "${variableName}" must be set at this point.`);
    }
    additonalServicesEnvs[variableName] = value;
  }
  return additonalServicesEnvs;
}

export { config,additonalServicesEnvs };


