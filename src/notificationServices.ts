import * as nodemailer from 'nodemailer';
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

async function sendEmailorText(recipient: string, subject: string, message: string) {
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
