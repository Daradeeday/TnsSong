
import { z } from 'zod';
export const requestSchema = z.object({
  songTitle: z.string().min(1).max(120),
  artist: z.string().min(1).max(120),
  link: z.string().url().optional().or(z.literal('')),
  message: z.string().max(140).optional(), // Friday only
});
export type RequestInput = z.infer<typeof requestSchema>;
