import { ProductPage } from './features/product/ProductPage';
import { useProductId } from './routing';

export function App() {
  const productId = useProductId();

  return (
    <main className="mx-auto max-w-content">
      <ProductPage productId={productId} />
    </main>
  );
}
