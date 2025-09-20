# Basktre Trading Integration Platform

A comprehensive TypeScript-based trading integration platform that provides a unified API for interacting with multiple stock brokers (Zerodha, Angel One, ICICI, etc.).

## Features

- **Unified API**: Standardized payload structure across all brokers
- **Request Tracking**: UUID-based request ID system with `x-basktre-request-id` header
- **Comprehensive Logging**: Multi-level logging with database persistence
- **Broker Management**: Dynamic broker configuration and credential management
- **Order Management**: Place, cancel, modify, and track orders
- **Validation**: Robust input validation and error handling
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Project Structure

```
src/
├── brokers/              # Broker-specific implementations
│   ├── BaseBroker.ts     # Abstract base class for all brokers
│   └── BrokerManager.ts  # Broker management and factory
├── core/                 # Core services
│   └── logger.ts         # Logging system with request tracking
├── types/                # TypeScript type definitions
│   ├── common.ts         # Common types and interfaces
│   ├── order.ts          # Order-related types
│   ├── broker.ts         # Broker-related types
│   └── index.ts          # Type exports
├── middleware/           # Express middleware
│   ├── requestId.ts      # Request ID middleware
│   └── validation.ts     # Input validation middleware
├── controllers/          # API controllers
│   └── OrderController.ts # Order management controller
├── routes/               # API routes
│   └── orders.ts         # Order-related routes
├── services/             # Business logic services
├── utils/                # Utility functions
├── config/               # Configuration management
├── app.ts                # Express application setup
└── server.ts             # Server startup
```

## Database Schema

The platform uses Prisma with SQLite and includes the following main entities:

- **Broker**: Broker configuration and API details
- **UserBrokerCredential**: Encrypted user credentials for each broker
- **Order**: Order tracking and status management
- **RequestLog**: Comprehensive request/response logging

## API Endpoints

### Health Check
```
GET /health
```

### API Information
```
GET /api
```

### Broker Management
```
GET /api/brokers
```

### Order Management
```
POST   /api/trading/:brokerId/orders      # Place order
DELETE /api/trading/:brokerId/orders/:id  # Cancel order
PUT    /api/trading/:brokerId/orders/:id  # Modify order
GET    /api/trading/:brokerId/orders/:id  # Get order status
GET    /api/trading/:brokerId/orders      # Get orders list
```

## Request Headers

All requests should include:
- `x-basktre-request-id`: UUID for request tracking (optional, auto-generated if not provided)
- `x-user-id`: User identifier for authentication
- `x-broker-id`: Broker identifier (for broker-specific operations)

## Standard Order Payload

```typescript
{
  symbol: string;           // Stock symbol (e.g., "RELIANCE")
  exchange: string;         // Exchange (e.g., "NSE", "BSE")
  orderType: "buy" | "sell";
  productType: "intraday" | "delivery" | "marginal" | "bracket" | "cover";
  quantity: number;
  price?: number;           // For limit orders
  triggerPrice?: number;    // For stop-loss orders
  validity?: "DAY" | "IOC" | "GTD" | "GTC";
  disclosedQuantity?: number;
  metadata?: Record<string, any>; // Broker-specific data
}
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env` file:
   ```
   DATABASE_URL="file:./dev.db"
   PORT=3000
   HOST=localhost
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Run Database Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Development Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run start:dev`: Alias for dev command

## Adding New Brokers

1. Create a new broker class extending `BaseBroker`
2. Implement all abstract methods
3. Add broker configuration to database
4. Register broker in `BrokerManager`

## Logging

The platform includes comprehensive logging:
- Request/response logging with timing
- Error tracking with stack traces
- Performance metrics
- Database persistence for audit trails

Log levels: `info`, `error`, `warn`, `debug`

## Error Handling

All errors are standardized with:
- Consistent error response format
- Request ID tracking
- Proper HTTP status codes
- Detailed error messages in development

## Security Features

- Encrypted credential storage
- Request ID tracking for audit
- Input validation and sanitization
- CORS protection
- Rate limiting support

## Contributing

1. Follow TypeScript best practices
2. Add comprehensive error handling
3. Include proper logging
4. Write tests for new features
5. Update documentation

## License

ISC
