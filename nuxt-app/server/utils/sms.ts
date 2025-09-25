import prisma from "../../lib/prisma";

// For development: ignore SSL certificate errors
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Types for SMS API responses
interface SMSBulkResponse {
  uuid: string;
  success: string;
}

interface SMSQuickResponse {
  sms_id: number;
  status: string;
  parts: number;
}

interface SMSDeliveryItem {
  phone: number;
  status: string;
  d_sent: string;
}

interface SMSDeliveryResponse {
  result: SMSDeliveryItem[];
}

interface SMSBulkMessage {
  alphaname_id: string;
  name: string;
  message_type: 'bulk' | 'personal';
  schedule_time?: string;
  text?: string;
  delivery_list: string[] | { phone: string; text: string }[];
}

interface SMSBulkRequest {
  token: string;
  callback_url: string;
  messages: SMSBulkMessage[];
}

interface SMSQuickRequest {
  token: string;
  message: string;
  phone: string;
  alphaname_id: string;
  forwarding_message?: number;
  forwarding_time?: number;
  vibername_id?: number;
}

// Function to send bulk SMS
export async function sendBulkSms(
  messages: SMSBulkMessage[],
  callbackUrl: string,
  token: string
): Promise<SMSBulkResponse> {
  const requestData: SMSBulkRequest = {
    token,
    callback_url: callbackUrl,
    messages
  };

  const response = await fetch('https://api.example.com/api/v1/sendBulkSms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    throw new Error(`SMS API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Function to send quick SMS
export async function sendQuickSMS(
  message: string,
  phone: string,
  alphanameId: string,
  token: string,
  forwardingMessage?: number,
  forwardingTime?: number,
  vibernameId?: number
): Promise<SMSQuickResponse> {
  const requestData: SMSQuickRequest = {
    token,
    message,
    phone,
    alphaname_id: alphanameId,
    forwarding_message: forwardingMessage,
    forwarding_time: forwardingTime,
    vibername_id: vibernameId
  };

  const response = await fetch('https://api.example.com/api/v1/sendQuickSMS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    throw new Error(`SMS API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Function to get SMS delivery list
export async function getSmsDeliveryList(
  token: string,
  messageId: number,
  limitOffset?: number,
  limitRows?: number
): Promise<SMSDeliveryResponse> {
  const params = new URLSearchParams({
    token,
    message_id: messageId.toString()
  });

  if (limitOffset !== undefined) {
    params.append('limit_offset', limitOffset.toString());
  }

  if (limitRows !== undefined) {
    params.append('limit_rows', limitRows.toString());
  }

  const response = await fetch(`https://api.example.com/api/v1/getSmsDeliveryList?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`SMS API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Function to save sent SMS to database
export async function saveSentSms(
  phone: string,
  content: string,
  templateId?: number,
  companyId?: number,
  externalId?: string,
  status?: string,
  channel?: string
): Promise<void> {
  await prisma.sentSms.create({
    data: {
      phone,
      content,
      templateId,
      companyId,
      externalId,
      status,
      channel
    }
  });
}
