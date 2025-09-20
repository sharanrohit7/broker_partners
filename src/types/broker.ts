// Broker-related types and interfaces

export interface BrokerConfig {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  authMethod: AuthMethod;
  authConfig: AuthConfig;
  baseUrl: string;
  apiVersion?: string;
  headers: Record<string, string>;
  tokenTypes: TokenType[];
  tokenRefreshConfig: TokenRefreshConfig;
  rateLimit?: RateLimitConfig;
  metadata?: Record<string, any>;
}

export type AuthMethod = 
  | 'email_password'
  | 'api_key'
  | 'oauth'
  | 'custom';

export interface AuthConfig {
  requiredFields: string[];
  optionalFields?: string[];
  validationRules?: Record<string, any>;
  customAuthFlow?: string;
}

export interface TokenType {
  name: string;
  type: 'access' | 'refresh' | 'api_key' | 'session';
  headerName: string;
  expiresIn?: number; // in seconds
  refreshable: boolean;
}

export interface TokenRefreshConfig {
  endpoint: string;
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  refreshTokenField: string;
  accessTokenField: string;
  expiresInField?: string;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit?: number;
}

export interface BrokerCredentials {
  [key: string]: any;
}

export interface BrokerTokens {
  [tokenName: string]: {
    value: string;
    expiresAt?: Date;
    refreshToken?: string;
  };
}

export interface UserBrokerCredential {
  id: string;
  userId: string;
  brokerId: string;
  credentials: BrokerCredentials;
  tokens?: BrokerTokens;
  isActive: boolean;
  lastUsedAt?: Date;
}

export interface BrokerApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers?: Record<string, string>;
  requiresAuth: boolean;
  requiredTokens?: string[];
  rateLimit?: RateLimitConfig;
}

export interface BrokerIntegration {
  name: string;
  config: BrokerConfig;
  endpoints: {
    auth: BrokerApiEndpoint;
    placeOrder: BrokerApiEndpoint;
    cancelOrder: BrokerApiEndpoint;
    modifyOrder: BrokerApiEndpoint;
    getOrderStatus: BrokerApiEndpoint;
    getOrders: BrokerApiEndpoint;
    getPositions: BrokerApiEndpoint;
    getHoldings: BrokerApiEndpoint;
  };
}
