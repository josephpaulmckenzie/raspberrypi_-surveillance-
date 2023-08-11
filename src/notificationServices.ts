// file name notificationServices.ts

import * as nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const getTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD
  }
});

const formatRecipient = (recipient: string) => {
  if (/^\d+$/.test(recipient)) {
    return recipient + '@vtext.com';
  } else {
    return recipient;
  }
};

const sendMail = (transporter: nodemailer.Transporter, options: nodemailer.SendMailOptions) => 
  transporter.sendMail(options, (error: any, info: any) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });

export async function sendEmailorText(recipient: string, subject: string, message: string) {
  const transporter = getTransporter();
  const emailAddress = formatRecipient(recipient);

  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: emailAddress,
    subject: subject,
    text: message,
  };

  sendMail(transporter, mailOptions);
}


export async function sendPushoverNotification(message: string, title?: string) {
  const url = 'https://api.pushover.net/1/messages.json';

  const payload = {
    token: process.env.PUSHOVER_APP_TOKEN,
    user: process.env.PUSHOVER_USER_KEY,
    message: message,
    title: title 
  };

  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
