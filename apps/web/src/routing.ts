/** The only product in the catalogue; `/` and unknown paths redirect here. */
const DEFAULT_PRODUCT_ID = '097382-190';
const PRODUCT_PATH = /^\/products\/([^/]+)\/?$/;

/** Minimal routing for a single page: reads `/products/:id`, redirecting other paths to the default. */
export function productIdFromLocation(): string {
  const id = PRODUCT_PATH.exec(window.location.pathname)?.[1];
  if (id) return id;
  window.history.replaceState(null, '', `/products/${DEFAULT_PRODUCT_ID}`);
  return DEFAULT_PRODUCT_ID;
}
