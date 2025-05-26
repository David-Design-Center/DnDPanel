import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import jwt from 'jsonwebtoken';

// Common CORS headers
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

// Wrap a Netlify function handler with CORS preflight and JWT auth
export function withCorsAndAuth(handler: Handler): Handler {
  return async (event: HandlerEvent, context: HandlerContext): Promise<import('@netlify/functions').HandlerResponse> => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }
    // Verify JWT in Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing authorization token' }) };
    }
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || '');
    } catch (err) {
      return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid token' }) };
    }
    // Execute actual handler
    const response = await handler(event, context);
    // Ensure response is always a HandlerResponse
    const normalizedResponse = response || { statusCode: 200, headers: CORS_HEADERS, body: '' };
    normalizedResponse.headers = { ...normalizedResponse.headers, ...CORS_HEADERS };
    return normalizedResponse;
  };
}
