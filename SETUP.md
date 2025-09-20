# Setup & Deployment Guide

## Quick Start (Without Database)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
# Simple version (no database)
npm run dev

# Full version (with database - requires Prisma setup)
npm run dev:full
```

### 3. Test the API
```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api

# List brokers
curl http://localhost:3000/api/brokers

# Place an order (example)
curl -X POST http://localhost:3000/api/trading/zerodha/orders \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -H "x-basktre-request-id: $(uuidgen)" \
  -d '{
    "symbol": "RELIANCE",
    "exchange": "NSE",
    "orderType": "buy",
    "productType": "intraday",
    "quantity": 10,
    "price": 2500
  }'
```

## Environment Configuration

### Local Development
Create a `.env` file in the root directory:
```bash
# .env
NODE_ENV=development
PORT=3000
HOST=localhost
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

### Production
```bash
# .env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=warn
CORS_ORIGIN=https://yourdomain.com

# Add cloud monitoring variables as needed
```

## Available Scripts

### Development
```bash
npm run dev          # Start simple version (no database)
npm run dev:full     # Start full version (with database)
npm run start:dev    # Alias for dev
```

### Production
```bash
npm run build        # Build TypeScript to JavaScript
npm start           # Start simple version
npm run start:full  # Start full version
```

### Monitoring
```bash
npm run logs         # View all logs
npm run logs:error   # View error logs only
npm run logs:requests # View request logs only
npm run health       # Basic health check
npm run health:detailed # Detailed system info
```

## API Endpoints

### Health & Info
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system metrics
- `GET /api` - API information

### Broker Management
- `GET /api/brokers` - List available brokers

### Order Management
- `POST /api/trading/:brokerId/orders` - Place order
- `DELETE /api/trading/:brokerId/orders/:id` - Cancel order
- `PUT /api/trading/:brokerId/orders/:id` - Modify order
- `GET /api/trading/:brokerId/orders/:id` - Get order status
- `GET /api/trading/:brokerId/orders` - List orders

## Request Headers

All requests should include:
- `x-basktre-request-id`: UUID for request tracking (optional, auto-generated)
- `x-user-id`: User identifier for authentication
- `x-broker-id`: Broker identifier (for broker-specific operations)

## Local Development

### 1. Start the Server
```bash
npm run dev
```

### 2. Test with curl
```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api

# List brokers
curl http://localhost:3000/api/brokers

# Place order
curl -X POST http://localhost:3000/api/trading/zerodha/orders \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{
    "symbol": "RELIANCE",
    "exchange": "NSE",
    "orderType": "buy",
    "productType": "intraday",
    "quantity": 10,
    "price": 2500
  }'
```

### 3. View Logs
```bash
# View all logs
npm run logs

# View error logs
npm run logs:error

# View request logs
npm run logs:requests
```

## Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Set Environment Variables
```bash
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0
export LOG_LEVEL=warn
export CORS_ORIGIN=https://yourdomain.com
```

### 3. Start the Application
```bash
npm start
```

### 4. Use PM2 for Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start dist/server-simple.js --name "basktre-api"

# Monitor
pm2 monit

# View logs
pm2 logs basktre-api
```

## Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY logs/ ./logs/

EXPOSE 3000

CMD ["node", "dist/server-simple.js"]
```

### 2. Build and Run
```bash
# Build
docker build -t basktre-api .

# Run
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e LOG_LEVEL=warn \
  basktre-api
```

## Cloud Deployment

### Azure App Service
1. Deploy to Azure App Service
2. Set environment variables in Azure Portal
3. Enable Application Insights for monitoring

### AWS Elastic Beanstalk
1. Deploy to Elastic Beanstalk
2. Configure environment variables
3. Enable CloudWatch for monitoring

### Google Cloud Run
1. Deploy to Cloud Run
2. Set environment variables
3. Enable Cloud Logging and Monitoring

## Monitoring

### Health Checks
- Basic: `GET /health`
- Detailed: `GET /health/detailed`

### Log Files
- Application logs: `logs/application-*.log`
- Error logs: `logs/error-*.log`
- Request logs: `logs/requests-*.log`

### Metrics
- Response times
- Error rates
- Memory usage
- Request counts

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Permission denied on logs directory**
   ```bash
   chmod 755 logs/
   ```

3. **Module not found errors**
   ```bash
   npm install
   npm run build
   ```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run dev
```

## Next Steps

1. **Add Database**: When ready, uncomment Prisma code and run `npx prisma migrate dev`
2. **Add Real Brokers**: Implement actual broker integrations
3. **Add Authentication**: Implement JWT or OAuth authentication
4. **Add Rate Limiting**: Implement actual rate limiting
5. **Add Caching**: Add Redis for caching
6. **Add Tests**: Write unit and integration tests
