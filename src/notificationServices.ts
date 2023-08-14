import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import FormData from 'form-data';
import * as nodemailer from 'nodemailer';
import path from 'path';


dotenv.config();

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

export async function sendEmailorText(recipient: string, subject: string, message: string) {
  const transporter = getTransporter();
  const emailAddress = formatRecipient(recipient);
  const from = process.env.ADMIN_EMAIL;

  const mailOptions = {
    from: from,
    to: emailAddress,
    subject: subject,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // if (info) {
    //   console.log('Message sent:!!!!!!!!!!!!!!!!!!!!!!!!!!!!', info);
    // } else {
    //   console.log('Message sent, but info is undefined');
    // }
    return info;
  } catch (error) {
    console.error('Error sending mail:', error); // Using console.error to log errors
    throw error;
  }

}
export const sendPushoverNotification = async (title: string, messageText: string, file_path: string) => {
  try {
    const filePath = '/home/josephmckenzie/Documents/08112023152315-02.jpg';
    const filename = path.basename(filePath);

    // Read the file into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    const form = new FormData();
    form.append('token', process.env.PUSHOVER_APP_TOKEN);
    form.append('user', process.env.PUSHOVER_USER_KEY);

    const msg: { [key: string]: string | number } = {
      message: messageText,
      title: title,
      sound: 'siren',
      device: 'devicename',
      priority: 1,
    };

    for (const key in msg) {
      if (msg[key]) {
        form.append(key, msg[key]);
      }
    }

    // Append the file buffer instead of the stream
    form.append('attachment', fileBuffer, {
      filename: filename,
      contentType: 'image/jpeg',
    });

    const response = await axios.post('https://api.pushover.net/1/messages.json', form, {
      headers: { ...form.getHeaders() },
    });

    console.log('Notification sent:', response.status);
  } catch (error: any) {
    console.error(`Error sending notification:`, error);
  }
};