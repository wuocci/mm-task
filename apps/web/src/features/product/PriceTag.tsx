import type { Money } from '@mm/shared';
import { formatPrice } from '../../lib/format';

interface PriceTagProps {
  price: Money;
  compareAtPrice?: Money | undefined;
}

export function PriceTag({ price, compareAtPrice }: PriceTagProps) {
  if (!compareAtPrice) {
    return <p className="mt-1">{formatPrice(price)}</p>;
  }

  return (
    <p className="mt-1 flex items-baseline gap-3">
      <span className="text-error">
        <span className="sr-only">Sale price: </span>
        {formatPrice(price)}
      </span>{' '}
      <s className="text-xs text-muted">
        <span className="sr-only">Original price: </span>
        {formatPrice(compareAtPrice)}
      </s>
    </p>
  );
}
