import { PrismaClient } from '@prisma/client';
import { Logger } from '../core/logger';
import { 
  BrokerConfig, 
  StandardOrderPayload, 
  OrderResponse, 
  CancelOrderPayload, 
  ModifyOrderPayload,
  OrderQuery,
  UserBrokerCredential 
} from '../types';

export abstract class BaseBroker {
  protected prisma: PrismaClient;
  protected config: BrokerConfig;
  protected logger: Logger;

  constructor(prisma: PrismaClient, config: BrokerConfig, logger: Logger) {
    this.prisma = prisma;
    this.config = config;
    this.logger = logger;
  }

  // Abstract methods that must be implemented by each broker
  abstract authenticate(credentials: any): Promise<any>;
  abstract placeOrder(payload: StandardOrderPayload, credentials: UserBrokerCredential): Promise<OrderResponse>;
  abstract cancelOrder(payload: CancelOrderPayload, credentials: UserBrokerCredential): Promise<OrderResponse>;
  abstract modifyOrder(payload: ModifyOrderPayload, credentials: UserBrokerCredential): Promise<OrderResponse>;
  abstract getOrderStatus(orderId: string, credentials: UserBrokerCredential): Promise<OrderResponse>;
  abstract getOrders(query: OrderQuery, credentials: UserBrokerCredential): Promise<OrderResponse[]>;
  abstract getPositions(credentials: UserBrokerCredential): Promise<any>;
  abstract getHoldings(credentials: UserBrokerCredential): Promise<any>;

  // Common utility methods
  protected async refreshTokens(credentials: UserBrokerCredential): Promise<any> {
    try {
      this.logger.debug('Refreshing tokens for broker', { brokerId: this.config.id });
      
      // Implementation will vary by broker
      const refreshedTokens = await this.performTokenRefresh(credentials);
      
      // Update credentials in database
      const updatedCredentials = await this.prisma.userBrokerCredential.update({
        where: { id: credentials.id },
        data: { 
          tokens: refreshedTokens,
          lastUsedAt: new Date()
        }
      });

      this.logger.info('Tokens refreshed successfully', { brokerId: this.config.id });
      return updatedCredentials;
    } catch (error) {
      this.logger.error('Failed to refresh tokens', error, { brokerId: this.config.id });
      throw error;
    }
  }

  protected async makeApiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    payload?: any,
    credentials?: UserBrokerCredential,
    additionalHeaders?: Record<string, string>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Making API request', { 
        brokerId: this.config.id,
        endpoint,
        method 
      });

      // Prepare headers
      const headers = {
        ...this.config.headers,
        ...additionalHeaders
      };

      // Add authentication headers if credentials provided
      if (credentials?.tokens) {
        const authHeaders = await this.prepareAuthHeaders(credentials);
        Object.assign(headers, authHeaders);
      }

      // Make the request
      const response = await this.executeHttpRequest(
        `${this.config.baseUrl}${endpoint}`,
        {
          method,
          headers,
          body: payload ? JSON.stringify(payload) : undefined
        }
      );

      const responseTime = Date.now() - startTime;
      
      this.logger.debug('API request completed', {
        brokerId: this.config.id,
        endpoint,
        method,
        statusCode: response.status,
        responseTime
      });

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('API request failed', error, {
        brokerId: this.config.id,
        endpoint,
        method,
        responseTime
      });
      throw error;
    }
  }

  protected async prepareAuthHeaders(credentials: UserBrokerCredential): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    
    if (credentials.tokens) {
      for (const tokenType of this.config.tokenTypes) {
        const token = credentials.tokens[tokenType.name];
        if (token?.value) {
          headers[tokenType.headerName] = token.value;
        }
      }
    }

    return headers;
  }

  protected async performTokenRefresh(credentials: UserBrokerCredential): Promise<any> {
    // This will be implemented by each broker based on their token refresh mechanism
    throw new Error('Token refresh not implemented for this broker');
  }

  protected async executeHttpRequest(url: string, options: any): Promise<any> {
    // This will be implemented using fetch or axios
    // For now, we'll use a placeholder
    throw new Error('HTTP request execution not implemented');
  }

  protected transformOrderPayload(payload: StandardOrderPayload): any {
    // Transform standard payload to broker-specific format
    // This will be implemented by each broker
    return payload;
  }

  protected transformOrderResponse(response: any): OrderResponse {
    // Transform broker response to standard format
    // This will be implemented by each broker
    return {
      orderId: response.orderId || '',
      requestId: this.logger.getRequestId(),
      brokerOrderId: response.brokerOrderId,
      status: response.status || 'pending',
      message: response.message,
      executedQuantity: response.executedQuantity,
      executedPrice: response.executedPrice,
      executedAt: response.executedAt,
      brokerMetadata: response.metadata
    };
  }

  // Rate limiting
  protected async checkRateLimit(): Promise<void> {
    if (this.config.rateLimit) {
      // Implement rate limiting logic
      // This could involve checking Redis or in-memory counters
    }
  }

  // Error handling
  protected handleBrokerError(error: any): Error {
    this.logger.error('Broker API error', error, { brokerId: this.config.id });
    
    // Transform broker-specific errors to standard errors
    if (error.status === 401) {
      return new Error('Authentication failed');
    } else if (error.status === 403) {
      return new Error('Access forbidden');
    } else if (error.status === 429) {
      return new Error('Rate limit exceeded');
    } else {
      return new Error('Broker API error');
    }
  }
}
