import type { Product } from '@mm/shared';
import { z } from 'zod';

const money = z.strictObject({
  amount: z.number().int().nonnegative(),
  currency: z.literal('EUR'),
});

const image = z.strictObject({
  url: z.string().min(1),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const size = z.strictObject({
  label: z.string().min(1),
  sku: z.string().min(1),
  inStock: z.boolean(),
});

/** Runtime check for product data. Typed against `Product`, so it cannot drift from the contract. */
export const productSchema: z.ZodType<Product> = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  badges: z.array(z.string()),
  colorName: z.string().min(1),
  price: money,
  compareAtPrice: money.exactOptional(),
  description: z.array(z.string()),
  pattern: z.strictObject({ name: z.string(), designer: z.string() }).exactOptional(),
  sizes: z.array(size),
  images: z.array(image),
  details: z.strictObject({
    material: z.string(),
    fit: z.string().exactOptional(),
  }),
});
