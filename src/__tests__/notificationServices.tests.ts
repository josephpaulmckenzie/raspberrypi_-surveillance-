import { sendEmailorText, sendPushoverNotification } from '../notificationServices';
import nodemailer from 'nodemailer';

// Mocking nodemailer Transporter
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

  describe('sendEmailorText', () => {
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
      }, expect.any(Function));
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
      }, expect.any(Function));
    });
  });

  // Add more tests for other functions
});
