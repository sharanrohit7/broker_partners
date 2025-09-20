# Monitoring & Logging Guide

## Overview

This trading platform includes comprehensive monitoring and logging capabilities designed for cloud deployment on Azure, AWS, and Google Cloud Platform.

## Logging Features

### 1. Structured JSON Logging
All logs are in JSON format for easy parsing by cloud monitoring services:

```json
{
  "timestamp": "2024-01-20 10:30:45.123",
  "level": "info",
  "message": "Request Completed",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "brokerId": "zerodha",
  "method": "POST",
  "url": "/api/trading/zerodha/orders",
  "statusCode": 201,
  "responseTime": 245,
  "service": "basktre-trading-api",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Log Categories

#### Application Logs (`logs/application-*.log`)
- General application events
- Business logic execution
- Performance metrics
- 14-day retention

#### Error Logs (`logs/error-*.log`)
- All error events with stack traces
- Security events
- System failures
- 30-day retention

#### Request Logs (`logs/requests-*.log`)
- HTTP request/response details
- API call tracking
- Performance metrics
- 7-day retention

### 3. Log Levels
- `error`: System errors, exceptions
- `warn`: Warnings, security events
- `info`: General information, business events
- `http`: HTTP request/response logging
- `debug`: Detailed debugging information

## Monitoring Endpoints

### Health Check
```bash
GET /health
```
Returns basic health status with database, memory, and disk checks.

### Detailed Health Check
```bash
GET /health/detailed
```
Returns comprehensive system information including:
- System metrics (CPU, memory, disk)
- Database statistics
- Performance metrics
- Load averages

## Cloud Service Integration

### Azure Monitor
The platform automatically detects Azure environment and can integrate with:
- Application Insights
- Log Analytics
- Azure Monitor

**Environment Variables:**
```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=your_connection_string
APPINSIGHTS_INSTRUMENTATIONKEY=your_instrumentation_key
```

### AWS CloudWatch
For AWS deployment, logs are structured for CloudWatch:
- CloudWatch Logs
- CloudWatch Metrics
- X-Ray tracing support

**Environment Variables:**
```bash
AWS_REGION=us-east-1
CLOUDWATCH_LOG_GROUP=basktre-trading-api
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Google Cloud Monitoring
GCP integration includes:
- Cloud Logging
- Cloud Monitoring
- Error Reporting

**Environment Variables:**
```bash
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
```

## Request Tracking

Every API request includes:
- **Request ID**: UUID in `x-basktre-request-id` header
- **User ID**: From `x-user-id` header
- **Broker ID**: From `x-broker-id` header (when applicable)
- **Response Time**: In milliseconds
- **Status Code**: HTTP response status
- **Payload**: Request body (in development)
- **Response**: Response body (in development)

## Performance Metrics

### Automatic Metrics
- Response time per endpoint
- Request count per endpoint
- Error rate per endpoint
- Memory usage
- CPU usage
- Database query performance

### Custom Metrics
```typescript
import { logPerformance, logBusinessEvent } from './core/monitoring';

// Performance logging
logPerformance('order_placement', 150, { brokerId: 'zerodha' });

// Business event logging
logBusinessEvent('order_placed', { 
  orderId: '123', 
  symbol: 'RELIANCE',
  quantity: 100 
});
```

## Alert Thresholds

### Default Thresholds
- **Response Time**: Warning > 1s, Critical > 5s
- **Error Rate**: Warning > 5%, Critical > 10%
- **Memory Usage**: Warning > 80%, Critical > 90%
- **Disk Usage**: Warning > 80%, Critical > 90%

## Development Commands

```bash
# View all logs
npm run logs

# View error logs only
npm run logs:error

# View request logs only
npm run logs:requests

# Check health
npm run health

# Detailed health check
npm run health:detailed
```

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
LOG_LEVEL=warn
CORS_ORIGIN=https://yourdomain.com

# Cloud-specific variables (choose one)
# Azure
APPLICATIONINSIGHTS_CONNECTION_STRING=your_connection_string

# AWS
AWS_REGION=us-east-1
CLOUDWATCH_LOG_GROUP=basktre-trading-api

# GCP
GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

### Log Rotation
- Automatic daily rotation
- Compression of old logs
- Configurable retention periods
- Automatic cleanup

## Security Monitoring

### Security Events Logged
- Authentication failures
- Authorization errors
- Rate limit violations
- Suspicious activity
- Data access patterns

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check memory logs
   - Monitor garbage collection
   - Review object retention

2. **Slow Response Times**
   - Check request logs
   - Monitor database queries
   - Review external API calls

3. **High Error Rates**
   - Check error logs
   - Review validation failures
   - Monitor broker API responses

### Log Analysis

```bash
# Find errors in last hour
grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" logs/error-*.log

# Find slow requests
grep '"responseTime":[5-9][0-9][0-9][0-9]' logs/requests-*.log

# Find specific request ID
grep "550e8400-e29b-41d4-a716-446655440000" logs/*.log
```

## Best Practices

1. **Always include request ID** in custom logs
2. **Use appropriate log levels** for different environments
3. **Monitor key business metrics** (order success rate, response times)
4. **Set up alerts** for critical thresholds
5. **Regular log analysis** for performance optimization
6. **Secure log storage** with proper access controls

## Integration Examples

### Azure Application Insights Query
```kusto
requests
| where timestamp > ago(1h)
| where name contains "trading"
| summarize count(), avg(duration) by bin(timestamp, 5m)
```

### AWS CloudWatch Query
```sql
fields @timestamp, requestId, method, url, statusCode, responseTime
| filter statusCode >= 400
| sort @timestamp desc
```

### Google Cloud Logging Query
```
resource.type="gce_instance"
jsonPayload.service="basktre-trading-api"
jsonPayload.level="error"
```
