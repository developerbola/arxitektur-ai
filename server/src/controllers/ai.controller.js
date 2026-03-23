import { z } from 'zod';
import { generateLayout } from '../services/ai.service.js';

const generateSchema = z.object({
  prompt: z.string().min(5),
  canvasState: z.any().optional(),
});

export const requestLayoutGeneration = async (c) => {
  try {
    const body = await c.req.json();
    const result = generateSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ error: 'Invalid Request', details: result.error.format() }, 400);
    }

    const { prompt, canvasState } = result.data;
    const aiResponse = await generateLayout(prompt, canvasState);
    console.log("AI Response being sent:", JSON.stringify(aiResponse).slice(0, 100) + "...");
    return c.json(aiResponse);
  } catch (error) {
    return c.json({ error: 'AI Generation Failed', message: error.message }, 500);
  }
};
