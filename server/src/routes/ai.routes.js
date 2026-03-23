import { Hono } from 'hono';
import { requestLayoutGeneration } from '../controllers/ai.controller.js';

const aiRoutes = new Hono();

aiRoutes.post('/generate', requestLayoutGeneration);

export default aiRoutes;
