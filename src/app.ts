import express from 'express';
import cors from 'cors';

import { requestIdMiddleware, RequestWithContext } from './middleware/requestId';

import { 
  httpLogger, 
  requestTiming, 
  errorLogging, 
  requestBodyLogging, 
  responseLogging,
  securityHeaders,
  rateLimitHeaders 
} from './middleware/monitoring';
import { healthCheck, detailedHealthCheck } from './middleware/healthCheck';
// import orderRoutes from './routes/orders';
import { logger } from './core/monitoring';

// Initialize Prisma client
// const prisma = new PrismaClient();

// Create Express application
const app = express();

// Security and monitoring middleware (order matters!)
// app.use(securityHeaders);
// app.use(rateLimitHeaders);
// app.use(httpLogger);
// app.use(requestTiming);

// CORS and body parsing
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request ID middleware (must be early in the chain)
// app.use(requestIdMiddleware(prisma));

// Development logging middleware
// if (process.env.NODE_ENV === 'development') {
//   app.use(requestBodyLogging);
//   app.use(responseLogging);
// }

// Health check endpoints
// app.get('/health', healthCheck);
// app.get('/health/detailed', detailedHealthCheck);

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Basktre Trading Integration API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Trading API routes
// app.use('/api/trading', orderRoutes);

// Broker management endpoints
// app.get('/api/brokers', async (req: RequestWithContext, res: Response) => {
//   try {
//     const brokers = await prisma.broker.findMany({
//       where: { isActive: true },
//       select: {
//         id: true,
//         name: true,
//         displayName: true,
//         authMethod: true,
//         baseUrl: true,
//         apiVersion: true,
//         isActive: true
//       }
//     });

//     res.json({
//       success: true,
//       data: brokers,
//       requestId: req.context?.requestId,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     req.context?.logger.error('Error fetching brokers', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error',
//       requestId: req.context?.requestId,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// Error handling middleware (must be last)
// app.use(errorLogging);
// app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  // await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  // await prisma.$disconnect();
  process.exit(0);
});

export default app;

// import express from 'express';

// const app = express();

// // Basic middleware and route setup
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Health check endpoints
// app.get('/health', (req, res) => {
//   res.json({
//     message: 'Server is healthy!',
//     status: 'ok',
//     timestamp: new Date().toISOString(),
//   });
// });

// app.get('/api', (req, res) => {
//   res.json({
//     message: 'Welcome to the API!',
//     version: '1.0.0',
//   });
// });

// export default app;