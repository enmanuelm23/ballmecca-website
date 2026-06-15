import { defineCollection, z } from 'astro:content';
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.string().optional(),
    author: z.string().default('Ballmecca'),
    draft: z.boolean().default(false),
  }),
});
export const collections = { blog };
