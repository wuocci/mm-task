import { ProductPage } from './features/product/ProductPage';

export function App({ productId }: { productId: string }) {
  return (
    <main>
      <ProductPage productId={productId} />
    </main>
  );
}
