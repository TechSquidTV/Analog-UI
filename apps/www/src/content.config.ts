import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['introduction', 'getting-started', 'design', 'reference']),
    order: z.number(),
    navTitle: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
