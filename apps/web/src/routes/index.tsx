import { createFileRoute, redirect } from '@tanstack/react-router';

/** There's no front page; `/` goes to the demo product. */
const DEFAULT_PRODUCT_ID = '097382-190';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/products/$productId', params: { productId: DEFAULT_PRODUCT_ID } });
  },
});
