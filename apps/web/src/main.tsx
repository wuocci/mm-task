import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createQueryClient } from './api/queryClient';
import { productIdFromLocation } from './routing';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

const queryClient = createQueryClient();

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App productId={productIdFromLocation()} />
    </QueryClientProvider>
  </StrictMode>,
);
