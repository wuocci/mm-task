import type { ProductImage as ProductImageData } from '@mm/shared';

export function ProductImage({ image }: { image: ProductImageData }) {
  return (
    // Width and height reserve space before load; high priority because it's the largest element.
    <img
      className="block h-auto w-full bg-surface"
      src={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      fetchPriority="high"
    />
  );
}
