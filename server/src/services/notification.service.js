import nodemailer from 'nodemailer';
import { Notification } from '../models/Notification.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const dispatchNotification = async ({ title, message, type = 'info', collegeId, userId = null, targetRole = 'All', sendEmail = false, emailRecipient = null }) => {
  try {
    // 1. Create database notification record
    const notification = await Notification.create({
      title,
      message,
      type,
      collegeId,
      userId,
      targetRole
    });

    // 2. Dispatch email if enabled and SMTP user is configured
    if (sendEmail && emailRecipient && process.env.SMTP_USER) {
      transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@collegelms.com',
        to: emailRecipient,
        subject: `[College LMS] ${title}`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f8;">
          <h2 style="color: #2563eb;">${title}</h2>
          <p style="font-size: 15px; color: #334155;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <small style="color: #94a3b8;">This is an automated notification from your College LMS & Examination Portal.</small>
        </div>`
      }).catch(err => console.error('SMTP Dispatch Warning:', err.message));
    }

    return notification;
  } catch (error) {
    console.error('Notification Service Error:', error.message);
    throw error;
  }
};
