import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes.js';

const app = express();

// Configure Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for Netlify deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Initialize routes
let routesInitialized = false;

// Export for Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
  
  // Use serverless-http to handle the request
  const serverlessHandler = serverless(app);
  return await serverlessHandler(event, context);
};