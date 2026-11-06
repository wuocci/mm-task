import { useQuery } from '@tanstack/react-query';
import type { ApiError } from '../../api/client';
import { productQuery } from '../../api/products';

export function ProductPage({ productId }: { productId: string }) {
  const { data: product, error, isError, isFetching, refetch } = useQuery(productQuery(productId));

  // Checked first: keeps showing cached data if a background refetch fails.
  if (product) {
    return <h1>{product.name}</h1>;
  }
  if (isError) {
    return <ProductError error={error} retrying={isFetching} onRetry={() => void refetch()} />;
  }
  return <p role="status">Loading product…</p>;
}

interface ProductErrorProps {
  error: ApiError;
  retrying: boolean;
  onRetry: () => void;
}

function ProductError({ error, retrying, onRetry }: ProductErrorProps) {
  if (error.code === 'NOT_FOUND' || error.code === 'BAD_REQUEST') {
    return (
      <section>
        <h1>Product not found</h1>
        <p>This product doesn’t exist or is no longer available.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Something went wrong</h1>
      <p>We couldn’t load this product. Please try again.</p>
      <button type="button" onClick={onRetry} disabled={retrying}>
        {retrying ? 'Retrying…' : 'Try again'}
      </button>
    </section>
  );
}
