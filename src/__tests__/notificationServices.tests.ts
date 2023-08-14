import { sendPushoverNotification, sendEmailorText } from '../notificationServices';
import axios from 'axios';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Mock axios for Pushover notification
jest.mock('axios');
const mockPost = axios.post as jest.Mock;

// Mock fs for reading file into buffer
jest.mock('fs');
const mockReadFileSync = fs.readFileSync as jest.Mock;

const fileBuffer = Buffer.from('file content');

const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: mockSendMail,
  }),
}));

describe('Notification Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPushoverNotification', () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(fileBuffer);
      mockPost.mockResolvedValue({ status: 200, data: {} });
    });

    it('should send a notification successfully', async () => {
      const title = 'Test Title';
      const message = 'Test Message';
      const filePath = '/home/josephmckenzie/Documents/08112023152315-02.jpg';

      await sendPushoverNotification(title, message, filePath);

      expect(mockPost).toHaveBeenCalledWith(
        'https://api.pushover.net/1/messages.json',
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'content-type': expect.stringMatching(/^multipart\/form-data;/),
          }),
        }),
      );
    });
  });

  describe('sendEmailorText', () => {
    beforeEach(() => {
      mockSendMail.mockResolvedValue('Mock send mail response');
    });

    it('should send an email', async () => {
      const recipient = 'test@example.com';
      const subject = 'Test Subject';
      const message = 'Test Message';

      await sendEmailorText(recipient, subject, message);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.ADMIN_EMAIL,
        to: recipient,
        subject: subject,
        text: message,
      });
    });

    it('should send a text message if recipient is a phone number', async () => {
      const recipient = '1234567890';
      const subject = 'Test Subject';
      const message = 'Test Message';

      await sendEmailorText(recipient, subject, message);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.ADMIN_EMAIL,
        to: recipient + '@vtext.com',
        subject: subject,
        text: message,
      });
    });
  });
});
