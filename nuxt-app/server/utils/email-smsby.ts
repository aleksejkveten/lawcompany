import prisma from "../../lib/prisma";

// For development: ignore SSL certificate errors
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Base URL for SMS.by Email API
const SMS_BY_BASE_URL = 'https://app.sms.by';

// Types for SMS.by Email API responses
interface EmailResponse {
  status: string;
  result: {
    email_id: number;
  };
}

interface EmailRequest {
  token: string;
  sender_email: string;
  sender_name?: string;
  subject: string;
  message: string;
  attachment?: File;
  email: string;
  d_schedule?: string;
  track_open?: number;
  track_click?: number;
}

// Function to send email via SMS.by
export async function sendEmail(
  token: string,
  senderEmail: string,
  senderName: string | undefined,
  subject: string,
  message: string,
  email: string,
  attachment?: File,
  dSchedule?: string,
  trackOpen?: number,
  trackClick?: number
): Promise<EmailResponse> {
  const formData = new FormData();
  formData.append('token', token);
  formData.append('sender_email', senderEmail);
  if (senderName) formData.append('sender_name', senderName);
  formData.append('subject', subject);
  formData.append('message', message);
  formData.append('email', email);
  if (dSchedule) formData.append('d_schedule', dSchedule);
  if (trackOpen !== undefined) formData.append('track_open', trackOpen.toString());
  if (trackClick !== undefined) formData.append('track_click', trackClick.toString());
  if (attachment) formData.append('attachment', attachment);

  const response = await fetch(`${SMS_BY_BASE_URL}/api/v2/sendEmail`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`SMS.by Email API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Function to save sent email to database
export async function saveSentEmail(
  email: string,
  subject: string,
  content: string,
  templateId?: number,
  companyId?: number,
  externalId?: string,
  status?: string,
  channel: string = 'smsby'
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
