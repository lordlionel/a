import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import session from 'express-session';
import { registerRoutes } from '../../server/routes.js';

const app = express();

// Configure Express middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure sessions for Netlify (using MemoryStore for simplicity)
app.use(session({
  secret: process.env.SESSION_SECRET || 'sitab-netlify-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Netlify handles HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// CORS for Netlify deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Initialize routes once
let routesInitialized = false;
let server: any = null;

// Export for Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Prevent function timeout
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (!routesInitialized) {
    try {
      server = await registerRoutes(app);
      routesInitialized = true;
      console.log('Routes initialized successfully for Netlify');
    } catch (error) {
      console.error('Error initializing routes:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error during initialization' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
  }
  
  try {
    // Use serverless-http to handle the request
    const serverlessHandler = serverless(app, {
      binary: ['image/*', 'application/pdf', 'application/octet-stream']
    });
    
    const result = await serverlessHandler(event, context) as any;
    
    return {
      statusCode: result?.statusCode || 200,
      body: result?.body || '',
      headers: {
        ...(result?.headers || {}),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      }
    };
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};