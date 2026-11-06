import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { NotFoundMessage } from '../components/StatusMessage';
import appCss from '../index.css?url';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#1f1f1f', media: '(prefers-color-scheme: dark)' },
      { title: 'Marimekko' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  // The shell always renders, so not-found and error pages still get a full HTML document.
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <NotFoundMessage title="Page not found" text="This page doesn’t exist." />
  ),
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <main className="mx-auto max-w-content">{children}</main>
        <Scripts />
      </body>
    </html>
  );
}
