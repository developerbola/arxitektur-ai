import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.routes.js';
import projectRoutes from './routes/project.routes.js';

dotenv.config();

const app = new Hono();

// Middlewares
app.use('*', logger());
app.use('*', cors());

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date() }));

// Mount Routes
app.route('/api/ai', aiRoutes);
app.route('/api/projects', projectRoutes);

const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
