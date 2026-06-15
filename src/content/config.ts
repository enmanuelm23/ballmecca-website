import { defineCollection, z } from 'astro:content';
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.string().refine(
      (s) => s.startsWith('/') || s.startsWith('http'),
      { message: 'heroImage must be root-relative ("/...") or an absolute URL' },
    ).optional(),
    author: z.string().default('Ballmecca'),
    draft: z.boolean().default(false),
  }),
});
export const collections = { blog };
