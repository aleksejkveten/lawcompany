import prisma from "../../lib/prisma";
import nodemailer from 'nodemailer';

// For development: ignore SSL certificate errors
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Types for Yandex Email
interface YandexEmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

// Create Yandex SMTP transporter
function createYandexTransporter(user: string, pass: string) {
  return nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true, // use SSL
    auth: {
      user,
      pass
    }
  });
}

// Function to send email via Yandex SMTP
export async function sendYandexEmail(
  user: string,
  pass: string,
  options: YandexEmailOptions
): Promise<any> {
  const transporter = createYandexTransporter(user, pass);

  try {
    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    });

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    };
  } catch (error) {
    throw new Error(`Yandex SMTP error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to save sent email to database (Yandex)
export async function saveSentYandexEmail(
  email: string,
  subject: string,
  content: string,
  templateId?: number,
  companyId?: number,
  externalId?: string,
  status?: string,
  channel: string = 'yandex'
): Promise<void> {
  await prisma.sentEmail.create({
    data: {
      email,
      subject,
      content,
      templateId,
      companyId,
      externalId,
      status,
      channel
    }
  });
}
