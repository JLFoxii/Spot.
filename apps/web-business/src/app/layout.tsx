'use client';

import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Création du client Query une seule fois par session
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="fr">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
