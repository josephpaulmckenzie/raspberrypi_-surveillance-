import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

function validateEnvironmentalVariables(variables: string[]): boolean {
	for (const variable of variables) {
		if (!process.env[variable]) {
			console.error(`The environmental variable "${variable}" could not be located.`);

			return false;
		}
	}

	return true;
}

export function configureAccountCreds(): void {
	// Attempt to get AWS credentials from an AWS config file
	AWS.config.getCredentials(err => {
		if (err) {
			console.error('Error while attempting to set credentails using an AWS config file:', err.message);

			const requiredVariables: string[] = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];

			// Since we could not set our credentials by using a AWS config file check to see if required environment variables are available to use and if they're not abort trying to attempt making an unauthenicated api call to AWS.
			if (!validateEnvironmentalVariables(requiredVariables)) {
				console.error('Invalid environment variables. Aborting the configuration.');

				return;
			}

			// Set AWS credentials and region using the environment variables we just verified were available
			AWS.config.update({
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				region: process.env.AWS_REGION,
			});

			console.log('AWS credentials have been successfully set using available environmental variables.');
		} else {
			console.log('AWS credentials were configured using an existing AWS config file. ');
		}
	});
}
