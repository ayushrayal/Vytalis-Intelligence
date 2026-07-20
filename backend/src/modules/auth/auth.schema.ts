import { z } from 'zod';

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export const googleCallbackQuerySchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  state: z.string().optional(),
});
