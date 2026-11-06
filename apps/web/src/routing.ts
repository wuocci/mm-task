import { useSyncExternalStore } from 'react';

/** Shown for `/` and any path that isn't a product page. */
const DEFAULT_PRODUCT_ID = '097382-190';
const PRODUCT_PATH = /^\/products\/([^/]+)\/?$/;

export function productPath(id: string): string {
  return `/products/${encodeURIComponent(id)}`;
}

function parseProductId(pathname: string): string | undefined {
  return PRODUCT_PATH.exec(pathname)?.[1];
}

/** Call once on startup: puts paths that aren't product pages onto the default product's URL. */
export function redirectToProductPath(): void {
  if (!parseProductId(window.location.pathname)) {
    window.history.replaceState(null, '', productPath(DEFAULT_PRODUCT_ID));
  }
}

/** Client-side navigation: updates the URL and notifies `useProductId` without a page reload. */
export function navigate(path: string): void {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

/** The product id in the current URL. Updates on `navigate` and on browser back/forward. */
export function useProductId(): string {
  const pathname = useSyncExternalStore(subscribe, () => window.location.pathname);
  return parseProductId(pathname) ?? DEFAULT_PRODUCT_ID;
}
