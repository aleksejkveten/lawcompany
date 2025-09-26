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

// This file contains SMS utility types and interfaces
// Actual implementation is in sms-smsby.ts
