import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function sendPushoverNotification(userKey: string, token: string, message: string, title?: string) {
  const url = 'https://api.pushover.net/1/messages.json';

  const payload = {
    token: token,
    user: userKey,
    message: message,
    title: title // Optional title
  };

  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}


const userKey = process.env.PUSHOVER_USER_KEY

const token = process.env.PUSHOVER_APP_TOKEN;
const message = 'Hello, World!';
console.log('User Key:', process.env.PUSHOVER_USER_KEY);
console.log('Token:', process.env.PUSHOVER_APP_TOKEN);

// if (!userKey || !token) {
//     console.error('User key and token must be defined. Check your environment variables.');
//     process.exit(1);
//   }

// sendPushoverNotification(userKey, token, message)
//   .then(response => console.log('Notification sent:', response))
//   .catch(error => console.error('Error:', error));
