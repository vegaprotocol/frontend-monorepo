import z from 'zod';

export const configSchema = z.object({
  hosts: z.array(z.string()),
});
