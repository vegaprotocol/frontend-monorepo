import { z } from 'zod';

const AppName = z.enum(['console', 'governance', 'explorer', 'wallet']);

export type AppNameType = z.infer<typeof AppName>;

export const AnnouncementSchema = z.object({
  text: z.string(),
  url: z.string().url().optional(),
  urlText: z.string().optional(),
  timing: z
    .object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
    })
    .optional(),
});

export type Announcement = z.infer<typeof AnnouncementSchema>;

export const AnnouncementsSchema = z.record(
  AppName,
  z.array(AnnouncementSchema)
);
