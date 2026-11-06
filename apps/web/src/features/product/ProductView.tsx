import type { Product } from '@mm/shared';
import { ColorSelector } from './ColorSelector';
import { PriceTag } from './PriceTag';
import { ProductDetails } from './ProductDetails';
import { ProductImage } from './ProductImage';
import { PurchaseBar } from './PurchaseBar';

export function ProductView({ product }: { product: Product }) {
  const [mainImage] = product.images;

  return (
    <article>
      {mainImage && <ProductImage image={mainImage} />}

      <div className="grid gap-8 px-4 pt-6 pb-8">
        <header className="grid gap-1">
          {product.badges.length > 0 && (
            <ul className="caps flex flex-wrap gap-3" aria-label="Labels">
              {product.badges.map((badge) => (
                <li key={badge}>{badge}</li>
              ))}
            </ul>
          )}
          <h1 className="text-lg leading-snug font-medium tracking-caps uppercase">
            {product.name}
          </h1>
          <p className="caps text-muted">{product.category}</p>
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
        </header>

        <ColorSelector colorways={product.colorways ?? []} colorName={product.colorName} />

        <div className="grid gap-4 font-sans text-body">
          {product.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <ProductDetails pattern={product.pattern} details={product.details} />
      </div>

      <PurchaseBar key={product.id} sizes={product.sizes} price={product.price} />
    </article>
  );
}
