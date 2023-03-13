import z from 'zod';

export const configSchema = z.object({
  hosts: z.array(z.string()),
});

export const tomlConfigSchema = z.object({
  API: z.object({ GraphQL: z.object({ Hosts: z.array(z.string()) }) }),
});
