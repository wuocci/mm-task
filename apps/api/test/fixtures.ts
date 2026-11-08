import type { Product } from '@mm/shared';

/** Minimal product: two sold-out sizes and one in stock. */
export const product: Product = {
  id: '097382-190',
  name: 'Griste Vihkiruusu',
  category: 'Shirt',
  badges: [],
  colorName: 'black, light pink, off-white',
  price: { amount: 14900, currency: 'EUR' },
  description: [],
  sizes: [
    { label: '36', sku: '097382-190-36', inStock: false },
    { label: '38', sku: '097382-190-38', inStock: false },
    { label: '40', sku: '097382-190-40', inStock: true },
  ],
  images: [],
  details: { material: 'Organic cotton' },
};
