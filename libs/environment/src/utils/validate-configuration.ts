import z from 'zod';

export const tomlConfigSchema = z.object({
  API: z.object({
    GraphQL: z.object({ Hosts: z.array(z.string()) }),
    REST: z.object({ Hosts: z.array(z.string()) }),
  }),
});
