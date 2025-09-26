import prisma from "../../lib/prisma";

// For development: ignore SSL certificate errors
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Base URL for SMS.by API
const SMS_BY_BASE_URL = 'https://app.sms.by';

// Types for SMS.by API responses
interface SMSByBulkResponse {
  uuid: string;
  success: string;
}

interface SMSByQuickResponse {
  sms_id: number;
  status: string;
  parts: number;
}

interface SMSByDeliveryItem {
  phone: number;
  status: string;
  d_sent: string;
}

interface SMSByDeliveryResponse {
  result: SMSByDeliveryItem[];
}

interface SMSByBulkMessage {
  alphaname_id: string;
  name: string;
  message_type: 'bulk' | 'personal';
  schedule_time?: string;
  text?: string;
  delivery_list: string[] | { phone: string; text: string }[];
}

interface SMSByBulkRequest {
  token: string;
  callback_url: string;
  messages: SMSByBulkMessage[];
}

interface SMSByQuickRequest {
  token: string;
  message: string;
  phone: string;
  alphaname_id: string;
  forwarding_message?: number;
  forwarding_time?: number;
  vibername_id?: number;
}

// Function to send bulk SMS via SMS.by
export async function sendBulkSms(
  messages: SMSByBulkMessage[],
  callbackUrl: string,
  token: string
): Promise<SMSByBulkResponse> {
  const requestData: SMSByBulkRequest = {
    token,
    callback_url: callbackUrl,
    messages
  };

  const response = await fetch(`${SMS_BY_BASE_URL}/api/v1/sendBulkSms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    throw new Error(`SMS.by API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Function to send quick SMS via SMS.by
export async function sendQuickSMS(
  message: string,
  phone: string,
  alphanameId: string,
  token: string,
  forwardingMessage?: number,
  forwardingTime?: number,
  vibernameId?: number
): Promise<SMSByQuickResponse> {
  const params = new URLSearchParams({
    token,
    message,
    phone,
    alphaname_id: alphanameId
  });

  const formData = new FormData();
  if (forwardingMessage !== undefined) formData.append('forwarding_message', forwardingMessage.toString());
  if (forwardingTime !== undefined) formData.append('forwarding_time', forwardingTime.toString());
  if (vibernameId !== undefined) formData.append('vibername_id', vibernameId.toString());

  const url = `${SMS_BY_BASE_URL}/api/v1/sendQuickSMS?${params}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`SMS.by API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Function to get SMS delivery list via SMS.by
export async function getSmsDeliveryList(
  token: string,
  messageId: number,
  limitOffset?: number,
  limitRows?: number
): Promise<SMSByDeliveryResponse> {
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

  const response = await fetch(`${SMS_BY_BASE_URL}/api/v1/getSmsDeliveryList?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`SMS.by API error: ${response.status} ${response.statusText}`);
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
  channel: string = 'smsby'
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
