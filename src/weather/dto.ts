import { z } from 'zod';

export const WeatherDataSchema = z.object({
  location: z.string(),
  date: z.coerce.date(),
  temperature: z.coerce.number(),
  humidity: z.coerce.number(),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

export const WeatherFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

export type WeatherFilter = z.infer<typeof WeatherFilterSchema>;
