import { ActivityType, PurchaseItem } from './activity';

export type PaymentMethod = 'efectivo' | 'tarjeta';

export interface ReceiptItem {
  id: string;
  name: string;
  price?: number;
  quantity?: number | string;
  unitPrice?: number | string;
  total?: number | string;
}

export interface Expense {
  id: string;
  tripId?: string;
  userId?: string;
  date: string;
  time?: string;
  concept: string;
  category: string;
  amountARS: number;
  currency?: string;
  amountUSD?: number;
  paymentMethod: PaymentMethod;
  paidBy: string;
  note?: string;
  activityId?: string | null;
  receipt_id?: string | null;
  receiptId?: string | null;
  isFromItinerary?: boolean;
  type?: ActivityType;
  items?: PurchaseItem[];
}

export interface MediaReceipt {
  uuid: string;
  tripId?: string;
  userId?: string;
  filename: string;
  description?: string;
  extension?: string;
  content_type?: string;
  content_base64: string;
  items?: ReceiptItem[];
}
