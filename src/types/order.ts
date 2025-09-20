// Order-related types and interfaces

export interface StandardOrderPayload {
  // Basic Order Information
  symbol: string;
  exchange: string;
  orderType: 'buy' | 'sell';
  productType: 'intraday' | 'delivery' | 'marginal' | 'bracket' | 'cover';
  quantity: number;
  
  // Price Information
  price?: number; // For limit orders
  triggerPrice?: number; // For stop-loss orders
  
  // Order Validity
  validity?: 'DAY' | 'IOC' | 'GTD' | 'GTC';
  validityDate?: string; // For GTD orders (YYYY-MM-DD format)
  
  // Disclosed Quantity (for large orders)
  disclosedQuantity?: number;
  
  // Broker-specific metadata
  metadata?: Record<string, any>;
}

export interface OrderResponse {
  orderId: string;
  requestId: string;
  brokerOrderId?: string;
  status: OrderStatus;
  message?: string;
  executedQuantity?: number;
  executedPrice?: number;
  executedAt?: string;
  brokerMetadata?: Record<string, any>;
}

export type OrderStatus = 
  | 'pending'
  | 'placed'
  | 'partially_executed'
  | 'executed'
  | 'cancelled'
  | 'rejected'
  | 'failed';

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  message?: string;
  executedQuantity?: number;
  executedPrice?: number;
  executedAt?: string;
  brokerMetadata?: Record<string, any>;
}

export interface OrderQuery {
  orderId?: string;
  requestId?: string;
  brokerOrderId?: string;
  status?: OrderStatus;
  symbol?: string;
  exchange?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface CancelOrderPayload {
  orderId: string;
  reason?: string;
}

export interface ModifyOrderPayload extends StandardOrderPayload {
  orderId: string;
  modifyType: 'price' | 'quantity' | 'both';
}
