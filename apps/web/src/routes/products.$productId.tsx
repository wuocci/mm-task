import { useQueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { productQuery } from '../api/products';
import { ErrorMessage, NotFoundMessage } from '../components/StatusMessage';
import { ProductSkeleton } from '../features/product/ProductSkeleton';
import { ProductView } from '../features/product/ProductView';

export const Route = createFileRoute('/products/$productId')({
  // Runs on the server for the first request and in the browser for later navigations.
  // 'static' reuses cached data so navigation isn't blocked; the component's query keeps it fresh.
  loader: async ({ context, params }) => {
    const product = await context.queryClient.query({
      ...productQuery(params.productId),
      staleTime: 'static',
    });
    // Only what head() needs: the product itself already travels to the browser in the query cache.
    return { title: `${product.name}, ${product.colorName}`, description: product.description[0] };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: loaderData.title },
            { name: 'description', content: loaderData.description },
            { property: 'og:type', content: 'product' },
            { property: 'og:title', content: loaderData.title },
            { property: 'og:description', content: loaderData.description },
          ],
        }
      : {},
  component: ProductRoute,
  pendingComponent: ProductSkeleton,
  notFoundComponent: () => (
    <NotFoundMessage
      title="Product not found"
      text="This product doesn’t exist or is no longer available."
    />
  ),
  errorComponent: ProductError,
});

function ProductRoute() {
  const { productId } = Route.useParams();
  // Reads what the loader put in the cache, and refetches in the background once it's stale.
  const { data: product } = useSuspenseQuery(productQuery(productId));
  return <ProductView product={product} />;
}

function ProductError() {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <ErrorMessage
      title="Something went wrong"
      text="We couldn’t load this product. Please try again."
      // Re-runs the loader and clears the error boundary.
      onRetry={() => void router.invalidate()}
    />
  );
}
