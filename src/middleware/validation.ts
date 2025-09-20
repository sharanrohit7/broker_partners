// import { Request, Response, NextFunction } from 'express';
// import { RequestWithContext } from './requestId';
// import { StandardOrderPayload, CancelOrderPayload, ModifyOrderPayload } from '../types';

// interface ValidationError {
//   field: string;
//   message: string;
//   value?: any;
// }

// class ValidationError extends Error {
//   constructor(public errors: ValidationError[], public statusCode: number = 400) {
//     super('Validation failed');
//     this.name = 'ValidationError';
//   }
// }

// // Validation rules
// const ORDER_VALIDATIONS = {
//   symbol: (value: any) => !value || typeof value !== 'string' ? 'Symbol is required and must be a string' : null,
//   exchange: (value: any) => !value || typeof value !== 'string' ? 'Exchange is required and must be a string' : null,
//   orderType: (value: any) => !value || !['buy', 'sell'].includes(value) ? 'Order type is required and must be either "buy" or "sell"' : null,
//   productType: (value: any) => !value || !['intraday', 'delivery', 'marginal', 'bracket', 'cover'].includes(value) ? 'Product type is required and must be one of: intraday, delivery, marginal, bracket, cover' : null,
//   quantity: (value: any) => !value || typeof value !== 'number' || value <= 0 ? 'Quantity is required and must be a positive number' : null,
//   price: (value: any) => value !== undefined && (typeof value !== 'number' || value <= 0) ? 'Price must be a positive number' : null,
//   triggerPrice: (value: any) => value !== undefined && (typeof value !== 'number' || value <= 0) ? 'Trigger price must be a positive number' : null,
//   validity: (value: any) => value && !['DAY', 'IOC', 'GTD', 'GTC'].includes(value) ? 'Validity must be one of: DAY, IOC, GTD, GTC' : null,
//   disclosedQuantity: (value: any) => value !== undefined && (typeof value !== 'number' || value <= 0) ? 'Disclosed quantity must be a positive number' : null
// };

// const validateFields = (payload: any, fields: string[], errors: ValidationError[]) => {
//   fields.forEach(field => {
//     const validator = ORDER_VALIDATIONS[field as keyof typeof ORDER_VALIDATIONS];
//     const errorMessage = validator?.(payload[field]);
//     if (errorMessage) {
//       errors.push({ field, message: errorMessage, value: payload[field] });
//     }
//   });
// };

// const validateBusinessRules = (payload: StandardOrderPayload, errors: ValidationError[]) => {
//   if (payload.productType === 'intraday' && payload.validity && payload.validity !== 'DAY') {
//     errors.push({ field: 'validity', message: 'Intraday orders must have DAY validity', value: payload.validity });
//   }

//   if (payload.price && payload.triggerPrice) {
//     if (payload.orderType === 'buy' && payload.price <= payload.triggerPrice) {
//       errors.push({ field: 'price', message: 'For buy orders, price must be greater than trigger price', value: payload.price });
//     } else if (payload.orderType === 'sell' && payload.price >= payload.triggerPrice) {
//       errors.push({ field: 'price', message: 'For sell orders, price must be less than trigger price', value: payload.price });
//     }
//   }
// };

// export const validateOrderPayload = (req: Request, res: Response, next: NextFunction) => {
//   const errors: ValidationError[] = [];
//   const payload: StandardOrderPayload = req.body;

//   validateFields(payload, ['symbol', 'exchange', 'orderType', 'productType', 'quantity'], errors);
//   validateFields(payload, ['price', 'triggerPrice', 'validity', 'disclosedQuantity'], errors);
//   validateBusinessRules(payload, errors);

//   return errors.length > 0 ? next(new ValidationError(errors)) : next();
// };

// export const validateCancelOrderPayload = (req: Request, res: Response, next: NextFunction) => {
//   const payload: CancelOrderPayload = req.body;
//   if (!payload.orderId || typeof payload.orderId !== 'string') {
//     return next(new ValidationError([{ field: 'orderId', message: 'Order ID is required and must be a string', value: payload.orderId }]));
//   }
//   next();
// };

// export const validateModifyOrderPayload = (req: Request, res: Response, next: NextFunction) => {
//   const errors: ValidationError[] = [];
//   const payload: ModifyOrderPayload = req.body;

//   if (!payload.orderId || typeof payload.orderId !== 'string') {
//     errors.push({ field: 'orderId', message: 'Order ID is required and must be a string', value: payload.orderId });
//   }
//   if (!payload.modifyType || !['price', 'quantity', 'both'].includes(payload.modifyType)) {
//     errors.push({ field: 'modifyType', message: 'Modify type is required and must be one of: price, quantity, both', value: payload.modifyType });
//   }

//   if (errors.length > 0) return next(new ValidationError(errors));
  
//   validateOrderPayload(req, res, next);
// };

// // Error handler remains mostly the same but optimized
// const ERROR_MAP: Record<string, { statusCode: number; message: string }> = {
//   ValidationError: { statusCode: 400, message: 'Validation failed' },
//   UnauthorizedError: { statusCode: 401, message: 'Unauthorized' },
//   ForbiddenError: { statusCode: 403, message: 'Forbidden' },
//   NotFoundError: { statusCode: 404, message: 'Not found' }
// };

// export const errorHandler = (error: any, req: RequestWithContext, res: Response, next: NextFunction) => {
//   const { statusCode = 500, message = 'Internal server error' } = ERROR_MAP[error.name] || {};
//   const errors = error instanceof ValidationError ? error.errors : [];

//   req.context?.logger?.error(message, error, { statusCode, errors });

//   res.status(statusCode).json({
//     success: false,
//     error: message,
//     requestId: req.context?.requestId || 'unknown',
//     timestamp: new Date().toISOString(),
//     ...(errors.length > 0 && { errors })
//   });
// };