import { useQuery } from '@tanstack/react-query';
import type { ApiError } from '../../api/client';
import { productQuery } from '../../api/products';
import { Button } from '../../components/Button';
import { ProductSkeleton } from './ProductSkeleton';
import { ProductView } from './ProductView';

export function ProductPage({ productId }: { productId: string }) {
  const { data: product, error, isError, isFetching, refetch } = useQuery(productQuery(productId));

  // Checked first: keeps showing cached data if a background refetch fails.
  if (product) {
    return <ProductView product={product} />;
  }
  if (isError) {
    return <ProductError error={error} retrying={isFetching} onRetry={() => void refetch()} />;
  }
  return <ProductSkeleton />;
}

interface ProductErrorProps {
  error: ApiError;
  retrying: boolean;
  onRetry: () => void;
}

function ProductError({ error, retrying, onRetry }: ProductErrorProps) {
  if (error.code === 'NOT_FOUND' || error.code === 'BAD_REQUEST') {
    return (
      <section className="grid justify-items-start gap-4 px-4 py-8">
        <h1 className="text-lg font-medium tracking-caps uppercase">Product not found</h1>
        <p>This product doesn’t exist or is no longer available.</p>
      </section>
    );
  }

  return (
    <section className="grid justify-items-start gap-4 px-4 py-8">
      <h1 className="text-lg font-medium tracking-caps uppercase">Something went wrong</h1>
      <p>We couldn’t load this product. Please try again.</p>
      <Button variant="secondary" onClick={onRetry} disabled={retrying}>
        {retrying ? 'Retrying…' : 'Try again'}
      </Button>
    </section>
  );
}
